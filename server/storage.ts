import {
  adminUsers,
  properties,
  inquiries,
  integrations,
  analyticsEvents,
  type AdminUser,
  type InsertAdminUser,
  type Property,
  type InsertProperty,
  type Inquiry,
  type InsertInquiry,
  type Integration,
  type InsertIntegration,
  type AnalyticsEvent,
  type InsertAnalyticsEvent,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, desc, sql, or, like } from "drizzle-orm";

export interface IStorage {
  // Admin Users
  getAdminUser(id: string): Promise<AdminUser | undefined>;
  getAdminUserByUsername(username: string): Promise<AdminUser | undefined>;
  createAdminUser(user: InsertAdminUser): Promise<AdminUser>;

  // Properties
  getAllProperties(filters?: any): Promise<Property[]>;
  getPropertyById(id: string): Promise<Property | undefined>;
  getPropertyPilihan(): Promise<Property[]>;
  getNewestProperties(limit?: number): Promise<Property[]>;
  createProperty(property: InsertProperty): Promise<Property>;
  updateProperty(id: string, property: Partial<InsertProperty>): Promise<Property>;
  deleteProperty(id: string): Promise<void>;

  // Inquiries
  createInquiry(inquiry: InsertInquiry): Promise<Inquiry>;
  getAllInquiries(): Promise<Inquiry[]>;

  // Integrations
  getIntegrations(): Promise<Integration | undefined>;
  updateIntegrations(data: InsertIntegration): Promise<Integration>;

  // Analytics
  createAnalyticsEvent(event: InsertAnalyticsEvent): Promise<AnalyticsEvent>;
  getAnalytics(timeRange: string): Promise<any>;
  resetAnalytics(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Admin Users
  async getAdminUser(id: string): Promise<AdminUser | undefined> {
    const [user] = await db.select().from(adminUsers).where(eq(adminUsers.id, id));
    return user || undefined;
  }

  async getAdminUserByUsername(username: string): Promise<AdminUser | undefined> {
    const [user] = await db.select().from(adminUsers).where(eq(adminUsers.username, username));
    return user || undefined;
  }

  async createAdminUser(insertUser: InsertAdminUser): Promise<AdminUser> {
    const [user] = await db
      .insert(adminUsers)
      .values(insertUser)
      .returning();
    return user;
  }

  // Properties
  async getAllProperties(filters?: any): Promise<Property[]> {
    let query = db.select().from(properties);

    const conditions: any[] = [];

    if (filters) {
      if (filters.status) {
        conditions.push(eq(properties.status, filters.status));
      }
      if (filters.type) {
        conditions.push(eq(properties.jenisProperti, filters.type));
      }
      if (filters.location) {
        conditions.push(
          or(
            like(properties.kabupaten, `%${filters.location}%`),
            like(properties.provinsi, `%${filters.location}%`)
          )
        );
      }
      if (filters.keyword && filters.keyword.trim()) {
        const keyword = filters.keyword.trim().toLowerCase();
        conditions.push(
          or(
            sql`${properties.kodeListing} ILIKE ${`%${keyword}%`}`,
            sql`${properties.judulProperti} ILIKE ${`%${keyword}%`}`,
            sql`${properties.deskripsi} ILIKE ${`%${keyword}%`}`,
            sql`${properties.jenisProperti} ILIKE ${`%${keyword}%`}`,
            sql`${properties.kabupaten} ILIKE ${`%${keyword}%`}`,
            sql`${properties.provinsi} ILIKE ${`%${keyword}%`}`,
            sql`${properties.alamatLengkap} ILIKE ${`%${keyword}%`}`,
            sql`${properties.status} ILIKE ${`%${keyword}%`}`,
            sql`${properties.legalitas} ILIKE ${`%${keyword}%`}`
          )
        );
      }
      if (filters.minPrice) {
        conditions.push(gte(properties.hargaProperti, filters.minPrice.toString()));
      }
      if (filters.maxPrice) {
        conditions.push(lte(properties.hargaProperti, filters.maxPrice.toString()));
      }
      if (filters.bedrooms) {
        conditions.push(eq(properties.kamarTidur, filters.bedrooms));
      }
      if (filters.bathrooms) {
        conditions.push(eq(properties.kamarMandi, filters.bathrooms));
      }
      if (filters.legalStatus) {
        conditions.push(eq(properties.legalitas, filters.legalStatus));
      }
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    return (query as any).orderBy(desc(properties.createdAt));
  }

  async getPropertyById(id: string): Promise<Property | undefined> {
    const [property] = await db.select().from(properties).where(eq(properties.id, id));
    return property || undefined;
  }

  async getPropertyPilihan(): Promise<Property[]> {
    return db
      .select()
      .from(properties)
      .where(eq(properties.isPropertyPilihan, true))
      .orderBy(desc(properties.createdAt))
      .limit(10);
  }

  async getNewestProperties(limit: number = 50): Promise<Property[]> {
    return db
      .select()
      .from(properties)
      .orderBy(desc(properties.createdAt))
      .limit(limit);
  }

  async createProperty(insertProperty: InsertProperty): Promise<Property> {
    const [property] = await db
      .insert(properties)
      .values(insertProperty)
      .returning();
    return property;
  }

  async updateProperty(id: string, updateData: Partial<InsertProperty>): Promise<Property> {
    console.log('=== STORAGE UPDATE PROPERTY ===');
    console.log('ID:', id);
    console.log('Update data:', updateData);

    // First check if property exists
    const existingProperty = await this.getPropertyById(id);
    console.log('Existing property before update:', {
      id: existingProperty?.id,
      kodeListing: existingProperty?.kodeListing,
      jenisProperti: existingProperty?.jenisProperti
    });

    if (!existingProperty) {
      throw new Error(`Property with ID ${id} not found`);
    }

    // Perform the update
    const result = await db
      .update(properties)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(properties.id, id));

    console.log('Update result:', result);

    // Fetch the updated property
    const updatedProperty = await this.getPropertyById(id);
    console.log('Updated property after update:', {
      id: updatedProperty?.id,
      kodeListing: updatedProperty?.kodeListing,
      jenisProperti: updatedProperty?.jenisProperti
    });

    if (!updatedProperty) {
      throw new Error(`Failed to fetch updated property with ID: ${id}`);
    }

    // Verify the update was applied
    const hasChanged = Object.keys(updateData).some(key => {
      const oldValue = existingProperty[key as keyof Property];
      const newValue = updatedProperty[key as keyof Property];
      const changed = oldValue !== newValue;
      if (changed) {
        console.log(`Field ${key} changed: ${oldValue} -> ${newValue}`);
      }
      return changed;
    });

    if (!hasChanged) {
      console.log('WARNING: No fields were actually updated!');
    }

    return updatedProperty;
  }

  async deleteProperty(id: string): Promise<void> {
    await db.delete(properties).where(eq(properties.id, id));
  }

  // Inquiries
  async createInquiry(insertInquiry: InsertInquiry): Promise<Inquiry> {
    const [inquiry] = await db
      .insert(inquiries)
      .values(insertInquiry)
      .returning();
    return inquiry;
  }

  async getAllInquiries(): Promise<Inquiry[]> {
    return db
      .select()
      .from(inquiries)
      .orderBy(desc(inquiries.createdAt));
  }

  // Integrations
  async getIntegrations(): Promise<Integration | undefined> {
    const [integration] = await db.select().from(integrations).limit(1);
    return integration || undefined;
  }

  async updateIntegrations(data: InsertIntegration): Promise<Integration> {
    const existing = await this.getIntegrations();

    if (existing) {
      const [updated] = await db
        .update(integrations)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(integrations.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(integrations)
        .values(data)
        .returning();
      return created;
    }
  }

  // Analytics
  async createAnalyticsEvent(event: InsertAnalyticsEvent): Promise<AnalyticsEvent> {
    const [created] = await db
      .insert(analyticsEvents)
      .values(event)
      .returning();
    return created;
  }

  async getAnalytics(timeRange: string): Promise<any> {
    const now = new Date();
    let startDate = new Date();

    switch (timeRange) {
      case '1D':
        startDate.setDate(now.getDate() - 1);
        break;
      case '3D':
        startDate.setDate(now.getDate() - 3);
        break;
      case '7D':
        startDate.setDate(now.getDate() - 7);
        break;
      case '1M':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case '3M':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case '1Y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    const events = await db
      .select()
      .from(analyticsEvents)
      .where(gte(analyticsEvents.createdAt, startDate));

    const totalViews = events.filter(e => e.eventType === 'property_view').length;
    const totalInquiries = events.filter(e => e.eventType === 'inquiry_submit').length;
    const totalSearches = events.filter(e => e.eventType === 'search').length;

    // Get top properties
    const viewsByProperty: Record<string, number> = {};
    events.forEach(event => {
      if (event.eventType === 'property_view' && event.propertyId) {
        viewsByProperty[event.propertyId] = (viewsByProperty[event.propertyId] || 0) + 1;
      }
    });

    const topPropertyIds = Object.entries(viewsByProperty)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id]) => id);

    const topProperties = await Promise.all(
      topPropertyIds.map(async (id) => {
        const property = await this.getPropertyById(id);
        return property ? {
          kodeListing: property.kodeListing,
          jenisProperti: property.jenisProperti,
          views: viewsByProperty[id],
        } : null;
      })
    );

    return {
      totalViews,
      totalInquiries,
      totalSearches,
      topProperties: topProperties.filter(Boolean),
    };
  }

  async resetAnalytics(): Promise<void> {
    await db.delete(analyticsEvents);
  }
}

export const storage = new DatabaseStorage();

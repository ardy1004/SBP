import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, numeric, integer, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Admin Users table
export const adminUsers = pgTable("admin_users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Properties table
export const properties = pgTable("properties", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  kodeListing: text("kode_listing").notNull().unique(),
  judulProperti: text("judul_properti"),
  deskripsi: text("deskripsi"),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  jenisProperti: text("jenis_properti").notNull(), // apartment, gudang, villa, hotel, kost, rumah, ruko, tanah, bangunan_komersial
  luasTanah: numeric("luas_tanah"),
  luasBangunan: numeric("luas_bangunan"),
  kamarTidur: integer("kamar_tidur"),
  kamarMandi: integer("kamar_mandi"),
  legalitas: text("legalitas"), // SHM, SHGB, PPJB, Girik, Letter C
  hargaProperti: numeric("harga_properti").notNull(),
  hargaPerMeter: boolean("harga_per_meter").default(false).notNull(),
  provinsi: text("provinsi").notNull(),
  kabupaten: text("kabupaten").notNull(),
  alamatLengkap: text("alamat_lengkap"),
  imageUrl: text("image_url").notNull(),
  imageUrl1: text("image_url1"),
  imageUrl2: text("image_url2"),
  imageUrl3: text("image_url3"),
  imageUrl4: text("image_url4"),
  imageUrl5: text("image_url5"),
  imageUrl6: text("image_url6"),
  imageUrl7: text("image_url7"),
  imageUrl8: text("image_url8"),
  imageUrl9: text("image_url9"),
  isPremium: boolean("is_premium").default(false).notNull(),
  isFeatured: boolean("is_featured").default(false).notNull(),
  isHot: boolean("is_hot").default(false).notNull(),
  isSold: boolean("is_sold").default(false).notNull(),
  priceOld: numeric("price_old"),
  isPropertyPilihan: boolean("is_property_pilihan").default(false).notNull(),
  ownerContact: text("owner_contact"),
  status: text("status").notNull(), // dijual, disewakan
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Inquiries table
export const inquiries = pgTable("inquiries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  propertyId: varchar("property_id").notNull().references(() => properties.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  whatsapp: text("whatsapp").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Third-party integrations table
export const integrations = pgTable("integrations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  googleAnalyticsId: text("google_analytics_id"),
  googleTag: text("google_tag"),
  facebookPixel: text("facebook_pixel"),
  tiktokPixel: text("tiktok_pixel"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Analytics events table
export const analyticsEvents = pgTable("analytics_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventType: text("event_type").notNull(), // property_view, inquiry_submit, search, filter_apply
  propertyId: varchar("property_id").references(() => properties.id, { onDelete: "set null" }),
  metadata: text("metadata"), // JSON string for additional data
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Articles table for blog functionality
export const articles = pgTable("articles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  thumbnailUrl: text("thumbnail_url"),
  status: text("status").default("draft").notNull(),
  category: text("category"),
  tags: text("tags").array(),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  seoKeywords: text("seo_keywords"),
  authorId: varchar("author_id"),
  views: integer("views").default(0),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Insert schemas
export const insertAdminUserSchema = createInsertSchema(adminUsers).omit({
  id: true,
  createdAt: true,
}) as any;

export const insertPropertySchema = createInsertSchema(properties).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}) as any;

export const insertInquirySchema = createInsertSchema(inquiries).omit({
  id: true,
  createdAt: true,
}) as any;

export const insertIntegrationSchema = createInsertSchema(integrations).omit({
  id: true,
  updatedAt: true,
}) as any;

export const insertAnalyticsEventSchema = createInsertSchema(analyticsEvents).omit({
  id: true,
  createdAt: true,
}) as any;

export const insertArticleSchema = createInsertSchema(articles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}) as any;

// Types
export type AdminUser = typeof adminUsers.$inferSelect;
export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;

export type Property = typeof properties.$inferSelect;
export type InsertProperty = z.infer<typeof insertPropertySchema>;

export type Inquiry = typeof inquiries.$inferSelect;
export type InsertInquiry = z.infer<typeof insertInquirySchema>;

export type Integration = typeof integrations.$inferSelect;
export type InsertIntegration = z.infer<typeof insertIntegrationSchema>;

export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type InsertAnalyticsEvent = z.infer<typeof insertAnalyticsEventSchema>;

export type Article = typeof articles.$inferSelect;
export type InsertArticle = z.infer<typeof insertArticleSchema>;

// Property types and statuses
export const PROPERTY_TYPES = [
  "apartment",
  "gudang",
  "villa",
  "homestay_guesthouse",
  "hotel",
  "kost",
  "rumah",
  "ruko",
  "tanah",
  "bangunan_komersial",
] as const;

export const PROPERTY_STATUSES = ["dijual", "disewakan"] as const;

export const LEGAL_STATUSES = ["SHM", "SHGB", "PPJB", "Girik", "Letter C", "SHM & PBG", "SHGB & PBG"] as const;

export type PropertyType = typeof PROPERTY_TYPES[number];
export type PropertyStatus = typeof PROPERTY_STATUSES[number];
export type LegalStatus = typeof LEGAL_STATUSES[number];

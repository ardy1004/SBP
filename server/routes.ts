import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import Papa from "papaparse";
import {
  insertPropertySchema,
  insertInquirySchema,
  insertIntegrationSchema,
  insertAnalyticsEventSchema,
} from "@shared/schema";

const upload = multer({ storage: multer.memoryStorage() });

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET must be set for secure JWT signing");
}

const JWT_SECRET = process.env.SESSION_SECRET;

// Auth Middleware
interface AuthRequest extends Request {
  adminId?: string;
}

const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { adminId: string };
    req.adminId = decoded.adminId;
    next();
  } catch (error) {
    res.status(401).json({ error: "Unauthorized" });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Public Property Routes
  app.get("/api/properties/pilihan", async (req, res) => {
    try {
      const properties = await storage.getPropertyPilihan();
      res.json(properties);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch properties" });
    }
  });

  app.get("/api/properties/newest", async (req, res) => {
    try {
      const properties = await storage.getNewestProperties();
      res.json(properties);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch properties" });
    }
  });

  app.get("/api/properties/:id", async (req, res) => {
    try {
      const property = await storage.getPropertyById(req.params.id);
      if (!property) {
        return res.status(404).json({ error: "Property not found" });
      }
      res.json(property);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch property" });
    }
  });

  app.get("/api/properties", async (req, res) => {
    try {
      const filters = {
        status: req.query.status as string,
        type: req.query.type as string,
        location: req.query.location as string,
        minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
        bedrooms: req.query.bedrooms ? parseInt(req.query.bedrooms as string) : undefined,
        bathrooms: req.query.bathrooms ? parseInt(req.query.bathrooms as string) : undefined,
        legalStatus: req.query.legalStatus as string,
      };

      const properties = await storage.getAllProperties(filters);
      res.json(properties);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch properties" });
    }
  });

  // Inquiries
  app.post("/api/inquiries", async (req, res) => {
    try {
      const validatedData = insertInquirySchema.parse(req.body);
      const inquiry = await storage.createInquiry(validatedData);

      // Track analytics event
      await storage.createAnalyticsEvent({
        eventType: 'inquiry_submit',
        propertyId: validatedData.propertyId,
      });

      res.json(inquiry);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Failed to create inquiry" });
    }
  });

  // Analytics Events
  app.post("/api/analytics/event", async (req, res) => {
    try {
      const validatedData = insertAnalyticsEventSchema.parse(req.body);
      const event = await storage.createAnalyticsEvent(validatedData);
      res.json(event);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Failed to create event" });
    }
  });

  // Admin Login
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      const admin = await storage.getAdminUserByUsername(username);

      if (!admin) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const isValid = await bcrypt.compare(password, admin.password);

      if (!isValid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = jwt.sign({ adminId: admin.id }, JWT_SECRET, { expiresIn: '7d' });

      res.json({ token, admin: { id: admin.id, username: admin.username } });
    } catch (error) {
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Admin Protected Routes
  app.get("/api/admin/stats", authMiddleware, async (req, res) => {
    try {
      const properties = await storage.getAllProperties();
      const inquiries = await storage.getAllInquiries();
      const analytics = await storage.getAnalytics('7D');

      res.json({
        totalProperties: properties.length,
        activeProperties: properties.filter(p => !p.isSold).length,
        totalViews: analytics.totalViews,
        totalInquiries: inquiries.length,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  app.get("/api/admin/properties", authMiddleware, async (req, res) => {
    try {
      const properties = await storage.getAllProperties();
      res.json(properties);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch properties" });
    }
  });

  app.post("/api/admin/properties", authMiddleware, async (req, res) => {
    try {
      const validatedData = insertPropertySchema.parse(req.body);
      const property = await storage.createProperty(validatedData);
      res.json(property);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Failed to create property" });
    }
  });

  app.put("/api/admin/properties/:id", authMiddleware, async (req, res) => {
    try {
      const validatedData = insertPropertySchema.partial().parse(req.body);
      const property = await storage.updateProperty(req.params.id, validatedData);
      res.json(property);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Failed to update property" });
    }
  });

  app.delete("/api/admin/properties/:id", authMiddleware, async (req, res) => {
    try {
      await storage.deleteProperty(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete property" });
    }
  });

  // CSV Import
  app.post("/api/admin/properties/csv-import", authMiddleware, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const csvText = req.file.buffer.toString('utf-8');
      const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });

      let success = 0;
      let failed = 0;

      for (const row of parsed.data as any[]) {
        try {
          await storage.createProperty({
            kodeListing: row.kode_listing,
            jenisProperti: row.jenis_properti,
            luasTanah: row.luas_tanah || null,
            luasBangunan: row.luas_bangunan || null,
            kamarTidur: row.kamar_tidur ? parseInt(row.kamar_tidur) : null,
            kamarMandi: row.kamar_mandi ? parseInt(row.kamar_mandi) : null,
            legalitas: row.legalitas || null,
            hargaProperti: row.harga_properti,
            provinsi: row.provinsi,
            kabupaten: row.kabupaten,
            alamatLengkap: row.alamat_lengkap || null,
            deskripsi: row.deskripsi || null,
            imageUrl: row.image_url,
            imageUrl1: row.image_url1 || null,
            imageUrl2: row.image_url2 || null,
            imageUrl3: row.image_url3 || null,
            imageUrl4: row.image_url4 || null,
            status: row.status || 'dijual',
            ownerContact: row.owner_contact || null,
            isPremium: false,
            isFeatured: false,
            isHot: false,
            isSold: false,
            priceOld: null,
            isPropertyPilihan: false,
          });
          success++;
        } catch (error) {
          failed++;
        }
      }

      res.json({ success, failed });
    } catch (error) {
      res.status(500).json({ error: "Failed to import CSV" });
    }
  });

  // Analytics
  app.get("/api/admin/analytics", authMiddleware, async (req, res) => {
    try {
      const timeRange = (req.query.range as string) || '7D';
      const analytics = await storage.getAnalytics(timeRange);
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  app.get("/api/admin/analytics/export", authMiddleware, async (req, res) => {
    try {
      const timeRange = (req.query.range as string) || '7D';
      const analytics = await storage.getAnalytics(timeRange);

      const csv = `Metric,Value
Total Views,${analytics.totalViews}
Total Inquiries,${analytics.totalInquiries}
Total Searches,${analytics.totalSearches}

Top Properties
Listing Code,Property Type,Views
${analytics.topProperties.map((p: any) => `${p.kodeListing},${p.jenisProperti},${p.views}`).join('\n')}`;

      res.json({ csv });
    } catch (error) {
      res.status(500).json({ error: "Failed to export analytics" });
    }
  });

  app.post("/api/admin/analytics/reset", authMiddleware, async (req, res) => {
    try {
      await storage.resetAnalytics();
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to reset analytics" });
    }
  });

  // Integrations
  app.get("/api/admin/integrations", authMiddleware, async (req, res) => {
    try {
      const integrations = await storage.getIntegrations();
      res.json(integrations || {});
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch integrations" });
    }
  });

  app.put("/api/admin/integrations", authMiddleware, async (req, res) => {
    try {
      const validatedData = insertIntegrationSchema.parse(req.body);
      const integrations = await storage.updateIntegrations(validatedData);
      res.json(integrations);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Failed to update integrations" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}

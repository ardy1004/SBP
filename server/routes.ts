import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import express from "express";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import Papa from "papaparse";
import { ImageProcessor, ProcessedImage } from "./imageUtils";
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
  console.log('=== AUTH MIDDLEWARE ===');
  console.log('Request path:', req.path);
  console.log('Request method:', req.method);
  console.log('Authorization header:', req.headers.authorization ? 'Present' : 'Missing');

  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ error: "Unauthorized" });
    }

    console.log('Verifying token...');
    const decoded = jwt.verify(token, JWT_SECRET) as { adminId: string };
    req.adminId = decoded.adminId;
    console.log('Token verified, adminId:', decoded.adminId);
    next();
  } catch (error) {
    console.log('Token verification failed:', error);
    // Send proper JSON response with correct headers
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    return res.status(401).json({ error: "Unauthorized" });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  console.log("=== REGISTERING ROUTES ===");

  // Test route to verify server is working
  app.get("/api/test", (req, res) => {
    console.log("=== TEST ROUTE CALLED ===");
    res.json({ message: "Server is working", timestamp: new Date().toISOString() });
  });

  // Public Property Routes
  app.get("/api/properties/pilihan", async (req, res) => {
    try {
      const properties = await storage.getPropertyPilihan();
      res.json(properties);
    } catch (error) {
      console.error("Error fetching properties:", error);
      res.status(500).json({ error: "Failed to fetch properties", details: error instanceof Error ? error.message : "Unknown error" });
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
        keyword: req.query.keyword as string,
      };

      const properties = await storage.getAllProperties(filters);
      res.json(properties);
    } catch (error) {
      console.error("Error fetching properties:", error);
      res.status(500).json({ error: "Failed to fetch properties", details: error instanceof Error ? error.message : "Unknown error" });
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

  // Bulk update properties
  app.put("/api/admin/properties/bulk", authMiddleware, async (req, res) => {
    console.log('=== SERVER BULK UPDATE START ===');
    console.log('Raw request body:', req.rawBody);
    console.log('Parsed request body:', req.body);
    console.log('Request body type:', typeof req.body);
    console.log('Request body keys:', Object.keys(req.body || {}));
    console.log('Request headers:', req.headers);

    try {
      const { ids, updates } = req.body;

      console.log('Extracted ids:', ids, 'type:', typeof ids, 'isArray:', Array.isArray(ids));
      console.log('Extracted updates:', updates, 'type:', typeof updates);

      if (!Array.isArray(ids) || ids.length === 0) {
        console.log('Validation failed: IDs array required');
        return res.status(400).json({ error: "Property IDs array is required" });
      }
      if (!updates || typeof updates !== 'object') {
        console.log('Validation failed: Updates object required');
        return res.status(400).json({ error: "Updates object is required" });
      }

      console.log('Starting bulk update for', ids.length, 'properties...');
      console.log('Updates object:', updates);

      const updatedProperties = [];
      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < ids.length; i++) {
        const id = ids[i];
        console.log(`[${i + 1}/${ids.length}] Updating property:`, id, 'type:', typeof id);

        try {
          const property = await storage.updateProperty(id, updates);
          if (property) {
            console.log(`✓ Property ${id} updated successfully:`, {
              kodeListing: property.kodeListing,
              jenisProperti: property.jenisProperti
            });
            updatedProperties.push(property);
            successCount++;
          } else {
            console.log(`✗ Property ${id} update returned null`);
            errorCount++;
          }
        } catch (updateError) {
          console.error(`✗ Error updating property ${id}:`, updateError);
          errorCount++;
        }
      }

      console.log('=== BULK UPDATE SUMMARY ===');
      console.log(`Total: ${ids.length}, Success: ${successCount}, Errors: ${errorCount}`);

      const responseData = {
        success: true,
        updated: successCount,
        total: ids.length,
        properties: updatedProperties,
        message: `Successfully updated ${successCount} out of ${ids.length} properties`
      };

      console.log('Response data prepared:', {
        success: responseData.success,
        updated: responseData.updated,
        total: responseData.total,
        propertiesCount: responseData.properties.length
      });

      // Ensure proper response headers
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

      // Send response as JSON
      console.log('Sending JSON response...');
      res.status(200).json(responseData);
      console.log('=== SERVER BULK UPDATE END ===');

    } catch (error) {
      console.error('=== SERVER BULK UPDATE ERROR ===', error);
      if (error instanceof Error) {
        console.error('Error stack:', error.stack);
      }

      const errorResponse = {
        success: false,
        error: "Failed to update properties",
        details: error instanceof Error ? error.message : 'Unknown error'
      };

      res.status(500).json(errorResponse);
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

  // Bulk delete properties
  app.delete("/api/admin/properties", authMiddleware, async (req, res) => {
    try {
      const { ids } = req.body;
      console.log('Bulk delete request received for IDs:', ids);

      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: "Property IDs array is required" });
      }

      let deletedCount = 0;
      for (const id of ids) {
        try {
          await storage.deleteProperty(id);
          deletedCount++;
          console.log(`Deleted property ${id}`);
        } catch (error) {
          console.error(`Failed to delete property ${id}:`, error);
        }
      }

      console.log(`Bulk delete completed: ${deletedCount}/${ids.length} properties deleted`);
      res.json({ success: true, deleted: deletedCount });
    } catch (error) {
      console.error('Bulk delete error:', error);
      res.status(500).json({ error: "Failed to delete properties" });
    }
  });

  // Test bulk update route without auth for debugging
  app.put("/api/test/bulk", async (req, res) => {
    console.log('=== TEST BULK UPDATE START (NO AUTH) ===');
    console.log('Request body:', req.body);
    console.log('Request headers:', req.headers);
    console.log('=== TEST BULK UPDATE START (NO AUTH) ===');
    console.log('Request body:', req.body);
    console.log('Request headers:', req.headers);

    try {
      const { ids, updates } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        console.log('Validation failed: IDs array required');
        return res.status(400).json({ error: "Property IDs array is required" });
      }
      if (!updates || typeof updates !== 'object') {
        console.log('Validation failed: Updates object required');
        return res.status(400).json({ error: "Updates object is required" });
      }

      console.log('Starting bulk update for', ids.length, 'properties...');
      console.log('Updates object:', updates);

      const updatedProperties = [];
      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < ids.length; i++) {
        const id = ids[i];
        console.log(`[${i + 1}/${ids.length}] Updating property:`, id);

        try {
          const property = await storage.updateProperty(id, updates);
          if (property) {
            console.log(`✓ Property ${id} updated successfully:`, {
              kodeListing: property.kodeListing,
              jenisProperti: property.jenisProperti
            });
            updatedProperties.push(property);
            successCount++;
          } else {
            console.log(`✗ Property ${id} update returned null`);
            errorCount++;
          }
        } catch (updateError) {
          console.error(`✗ Error updating property ${id}:`, updateError);
          errorCount++;
        }
      }

      console.log('=== TEST BULK UPDATE SUMMARY ===');
      console.log(`Total: ${ids.length}, Success: ${successCount}, Errors: ${errorCount}`);

      const responseData = {
        success: true,
        updated: successCount,
        total: ids.length,
        properties: updatedProperties,
        message: `Successfully updated ${successCount} out of ${ids.length} properties`
      };

      console.log('Response data prepared:', {
        success: responseData.success,
        updated: responseData.updated,
        total: responseData.total,
        propertiesCount: responseData.properties.length
      });

      // Ensure proper response headers
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-cache');

      // Send response as JSON with explicit headers
      console.log('Sending JSON response...');
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.status(200).json(responseData);
      console.log('=== SERVER BULK UPDATE END ===');

    } catch (error) {
      console.error('=== TEST BULK UPDATE ERROR ===', error);
      if (error instanceof Error) {
        console.error('Error stack:', error.stack);
      }

      const errorResponse = {
        success: false,
        error: "Failed to update properties",
        details: error instanceof Error ? error.message : 'Unknown error'
      };

      res.status(500).json(errorResponse);
    }
  });


  // Helper function to parse Indonesian number format (remove dots and convert to number)
  const parseIndonesianNumber = (value: string | undefined | null): number | null => {
    if (!value || value.toString().trim() === '') return null;
    // Remove dots (thousand separators) and parse as float
    const cleaned = value.toString().replace(/\./g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? null : parsed;
  };

  // Helper function for integers
  const parseIndonesianInt = (value: string | undefined | null): number | null => {
    if (!value || value.toString().trim() === '') return null;
    // Remove dots (thousand separators) and parse as int
    const cleaned = value.toString().replace(/\./g, '');
    const parsed = parseInt(cleaned, 10);
    return isNaN(parsed) ? null : parsed;
  };

  // Helper function to convert number to string for database storage
  const numberToString = (value: number | null): string | null => {
    return value !== null ? value.toString() : null;
  };

  // CSV Import
  app.post("/api/admin/properties/csv-import", authMiddleware, upload.single('file'), async (req, res) => {
    console.log('CSV Import endpoint called');
    try {
      if (!req.file) {
        console.log('No file uploaded');
        return res.status(400).json({ error: "No file uploaded" });
      }

      console.log('Processing CSV file...');
      const csvText = req.file.buffer.toString('utf-8');
      console.log('CSV text length:', csvText.length);
      const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });
      console.log('Parsed CSV data count:', parsed.data.length);

      let success = 0;
      let failed = 0;

      for (const row of parsed.data as any[]) {
        try {
          // Convert string values to appropriate types, cleaning Indonesian number format
          const parsedLuasTanah = parseIndonesianNumber(row.luas_tanah);
          const parsedLuasBangunan = parseIndonesianNumber(row.luas_bangunan);
          const parsedKamarTidur = parseIndonesianInt(row.kamar_tidur);
          const parsedKamarMandi = parseIndonesianInt(row.kamar_mandi);
          const parsedHarga = parseIndonesianNumber(row.harga_property);
          const parsedPriceOld = parseIndonesianNumber(row.price_old);

          const propertyData = {
            kodeListing: row.kode_listing?.toString() || '',
            judulProperti: row.judul_properti?.toString() || null,
            deskripsi: row.deskripsi?.toString() || null,
            jenisProperti: row.jenis_properti?.toString() || '',
            luasTanah: numberToString(parsedLuasTanah),
            luasBangunan: numberToString(parsedLuasBangunan),
            kamarTidur: parsedKamarTidur,
            kamarMandi: parsedKamarMandi,
            legalitas: row.legalitas?.toString() || null,
            hargaProperti: numberToString(parsedHarga) || '',
            provinsi: row.provinsi?.toString() || '',
            kabupaten: row.kabupaten?.toString() || '',
            alamatLengkap: row.alamat_lengkap?.toString() || null,
            imageUrl: row.image_url?.toString() || '',
            imageUrl1: row.image_url1?.toString() || null,
            imageUrl2: row.image_url2?.toString() || null,
            imageUrl3: row.image_url3?.toString() || null,
            imageUrl4: row.image_url4?.toString() || null,
            status: row.status?.toString() || 'dijual',
            ownerContact: row.owner_contact?.toString() || null,
            isPremium: ['true', '1', 'yes', 'y'].includes(row.is_premium?.toString().toLowerCase()),
            isFeatured: ['true', '1', 'yes', 'y'].includes(row.is_featured?.toString().toLowerCase()),
            isHot: ['true', '1', 'yes', 'y'].includes(row.is_hot?.toString().toLowerCase()),
            isSold: ['true', '1', 'yes', 'y'].includes(row.is_sold?.toString().toLowerCase()),
            priceOld: numberToString(parsedPriceOld),
            isPropertyPilihan: ['true', '1', 'yes', 'y'].includes(row.is_property_pilihan?.toString().toLowerCase()),
          };

          console.log(`CSV Import - Property ${success + 1} (${row.kode_listing}):`, {
            original: {
              luasTanah: row.luas_tanah,
              luasBangunan: row.luas_bangunan,
              kamarTidur: row.kamar_tidur,
              kamarMandi: row.kamar_mandi,
              hargaProperti: row.harga_property,
              priceOld: row.price_old,
            },
            parsed: {
              luasTanah: parsedLuasTanah,
              luasBangunan: parsedLuasBangunan,
              kamarTidur: parsedKamarTidur,
              kamarMandi: parsedKamarMandi,
              hargaProperti: parsedHarga,
              priceOld: parsedPriceOld,
            },
            stored: {
              luasTanah: propertyData.luasTanah,
              luasBangunan: propertyData.luasBangunan,
              kamarTidur: propertyData.kamarTidur,
              kamarMandi: propertyData.kamarMandi,
              hargaProperti: propertyData.hargaProperti,
              priceOld: propertyData.priceOld,
            }
          });

          await storage.createProperty(propertyData);
          success++;
        } catch (error) {
          console.error('CSV import error for row:', row, error);
          failed++;
        }
      }

      console.log(`CSV Import completed: ${success} success, ${failed} failed`);
      res.json({ success, failed });
    } catch (error) {
      console.error('CSV Import error:', error);
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

  // Image Upload Routes
  app.post("/api/upload/images", authMiddleware, upload.array('images', 5), async (req, res) => {
    try {
      if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
        return res.status(400).json({ error: "No images uploaded" });
      }

      const files = req.files as Express.Multer.File[];

      // Validate file sizes
      for (const file of files) {
        if (!ImageProcessor.validateFileSize(file.size)) {
          return res.status(400).json({
            error: `File ${file.originalname} is too large. Maximum size is 5MB.`
          });
        }
      }

      // Process images
      const processedImages = await ImageProcessor.processMultipleImages(files);

      if (processedImages.length === 0) {
        return res.status(500).json({ error: "Failed to process any images" });
      }

      res.json({
        success: true,
        message: `Successfully processed ${processedImages.length} image(s)`,
        images: processedImages
      });
    } catch (error) {
      console.error('Image upload error:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to upload images"
      });
    }
  });

  // Single image upload (for backward compatibility)
  app.post("/api/upload/image", authMiddleware, upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image uploaded" });
      }

      const file = req.file as Express.Multer.File;

      if (!ImageProcessor.validateFileSize(file.size)) {
        return res.status(400).json({
          error: "File is too large. Maximum size is 5MB."
        });
      }

      const processedImage = await ImageProcessor.processImage(
        file.buffer,
        file.originalname,
        file.mimetype
      );

      res.json({
        success: true,
        message: "Image uploaded and converted to WebP successfully",
        image: processedImage
      });
    } catch (error) {
      console.error('Image upload error:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to upload image"
      });
    }
  });

  // Delete image
  app.delete("/api/upload/images/:filename", authMiddleware, async (req, res) => {
    try {
      const { filename } = req.params;
      await ImageProcessor.deleteImage(filename);
      res.json({ success: true, message: "Image deleted successfully" });
    } catch (error) {
      console.error('Image delete error:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to delete image"
      });
    }
  });

  // Serve uploaded images statically
  app.use('/uploads', express.static('uploads'));

  const httpServer = createServer(app);

  return httpServer;
}

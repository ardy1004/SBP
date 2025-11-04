import bcrypt from "bcryptjs";
import { storage } from "./storage";

async function seed() {
  console.log("Seeding database...");

  try {
    // Check if admin user already exists
    const existingAdmin = await storage.getAdminUserByUsername("admin");

    if (!existingAdmin) {
      // Create default admin user
      const hashedPassword = await bcrypt.hash("admin123", 10);
      await storage.createAdminUser({
        username: "admin",
        password: hashedPassword,
      });
      console.log("✓ Created default admin user (username: admin, password: admin123)");
    } else {
      console.log("✓ Admin user already exists");
    }

    // Create sample properties if none exist
    const properties = await storage.getAllProperties();

    if (properties.length === 0) {
      console.log("Creating sample properties...");

      const sampleProperties = [
        {
          kodeListing: "PROP001",
          jenisProperti: "rumah",
          luasTanah: "100",
          luasBangunan: "80",
          kamarTidur: 3,
          kamarMandi: 2,
          legalitas: "SHM",
          hargaProperti: "1500000000",
          provinsi: "jakarta",
          kabupaten: "jakarta-selatan",
          alamatLengkap: "Jl. Raya Kebagusan No. 123",
          deskripsi: "Rumah minimalis modern dengan lokasi strategis di Jakarta Selatan. Dekat dengan akses tol dan pusat perbelanjaan.",
          imageUrl: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop",
          imageUrl1: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop",
          imageUrl2: "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800&h=600&fit=crop",
          imageUrl3: null,
          imageUrl4: null,
          status: "dijual",
          ownerContact: "+62 812 3456 7890",
          isPremium: true,
          isFeatured: false,
          isHot: false,
          isSold: false,
          priceOld: null,
          isPropertyPilihan: true,
        },
        {
          kodeListing: "PROP002",
          jenisProperti: "apartment",
          luasTanah: null,
          luasBangunan: "45",
          kamarTidur: 2,
          kamarMandi: 1,
          legalitas: "SHGB",
          hargaProperti: "800000000",
          provinsi: "jakarta",
          kabupaten: "jakarta-pusat",
          alamatLengkap: "Apartemen Sky Tower, Jakarta Pusat",
          deskripsi: "Apartemen modern dengan view kota yang menakjubkan. Dilengkapi dengan fasilitas lengkap seperti kolam renang, gym, dan keamanan 24 jam.",
          imageUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop",
          imageUrl1: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop",
          imageUrl2: null,
          imageUrl3: null,
          imageUrl4: null,
          status: "dijual",
          ownerContact: "+62 813 9876 5432",
          isPremium: false,
          isFeatured: true,
          isHot: false,
          isSold: false,
          priceOld: null,
          isPropertyPilihan: true,
        },
        {
          kodeListing: "PROP003",
          jenisProperti: "villa",
          luasTanah: "300",
          luasBangunan: "200",
          kamarTidur: 4,
          kamarMandi: 3,
          legalitas: "SHM",
          hargaProperti: "2500000000",
          provinsi: "bali",
          kabupaten: "badung",
          alamatLengkap: "Jl. Sunset Road, Badung, Bali",
          deskripsi: "Villa mewah dengan pemandangan laut yang eksotis. Cocok untuk investasi atau hunian pribadi. Lokasi dekat dengan pantai Seminyak.",
          imageUrl: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop",
          imageUrl1: "https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?w=800&h=600&fit=crop",
          imageUrl2: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop",
          imageUrl3: null,
          imageUrl4: null,
          status: "dijual",
          ownerContact: "+62 821 5555 6666",
          isPremium: false,
          isFeatured: false,
          isHot: true,
          isSold: false,
          priceOld: "2800000000",
          isPropertyPilihan: true,
        },
        {
          kodeListing: "PROP004",
          jenisProperti: "ruko",
          luasTanah: "80",
          luasBangunan: "150",
          kamarTidur: null,
          kamarMandi: 2,
          legalitas: "SHM",
          hargaProperti: "3000000000",
          provinsi: "jakarta",
          kabupaten: "jakarta-barat",
          alamatLengkap: "Jl. Puri Indah Raya, Jakarta Barat",
          deskripsi: "Ruko strategis di kawasan komersial Puri Indah. Cocok untuk berbagai jenis usaha dengan lokasi yang ramai dan akses mudah.",
          imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop",
          imageUrl1: null,
          imageUrl2: null,
          imageUrl3: null,
          imageUrl4: null,
          status: "dijual",
          ownerContact: "+62 822 7777 8888",
          isPremium: false,
          isFeatured: false,
          isHot: false,
          isSold: false,
          priceOld: null,
          isPropertyPilihan: false,
        },
        {
          kodeListing: "PROP005",
          jenisProperti: "kost",
          luasTanah: "150",
          luasBangunan: "200",
          kamarTidur: 10,
          kamarMandi: 10,
          legalitas: "SHM",
          hargaProperti: "50000000",
          provinsi: "jakarta",
          kabupaten: "jakarta-timur",
          alamatLengkap: "Jl. Kalimalang, Jakarta Timur",
          deskripsi: "Kost eksklusif dengan 10 kamar yang sudah terisi penuh. ROI menarik untuk investasi. Lokasi dekat dengan kampus dan perkantoran.",
          imageUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop",
          imageUrl1: null,
          imageUrl2: null,
          imageUrl3: null,
          imageUrl4: null,
          status: "disewakan",
          ownerContact: "+62 823 9999 0000",
          isPremium: false,
          isFeatured: false,
          isHot: false,
          isSold: false,
          priceOld: null,
          isPropertyPilihan: false,
        },
      ];

      for (const prop of sampleProperties) {
        await storage.createProperty(prop);
      }

      console.log(`✓ Created ${sampleProperties.length} sample properties`);
    } else {
      console.log(`✓ Database already has ${properties.length} properties`);
    }

    console.log("\nSeeding completed successfully!");
    console.log("\nAdmin Credentials:");
    console.log("Username: admin");
    console.log("Password: admin123");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seed();

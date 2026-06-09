/**
 * GET /api/import/download-template
 * Download CSV template untuk bulk import properti
 * 
 * Headers: Authorization: Bearer {token}
 * Response: CSV file download
 */
import { handleCors } from "../_utils/cors.js";
import { requireAuth } from "../_utils/jwt.js";

// CSV Headers sesuai dengan D1 database schema
const CSV_HEADERS = [
  "listing_code",
  "title",
  "slug",
  "purpose",
  "property_type",
  "price_offer",
  "price_rent",
  "price_type",
  "old_price",
  "province",
  "city",
  "district",
  "village",
  "address",
  "latitude",
  "longitude",
  "land_area",
  "building_area",
  "front_width",
  "floors",
  "bedrooms",
  "bathrooms",
  "legal_status",
  "ownership_status",
  "bank_name",
  "outstanding_amount",
  "distance_to_river",
  "distance_to_grave",
  "distance_to_powerline",
  "road_width",
  "description",
  "facilities",
  "selling_reason",
  "owner_name",
  "owner_whatsapp_1",
  "owner_whatsapp_2",
  "google_maps_url",
  "video_url",
  "is_premium",
  "is_featured",
  "is_hot",
  "is_choice",
  "image_url1",
  "image_url2",
  "image_url3",
  "image_url4",
  "image_url5",
  "image_url6",
  "image_url7",
  "image_url8",
  "image_url9",
  "image_url10"
];

// Sample row untuk panduan pengisian
const SAMPLE_ROW = [
  "R3.27",
  "Rumah Mewah 2 Lantai Sleman Dekat UGM",
  "rumah-mewah-2-lantai-sleman-dekat-ugm-R3.27",
  "Dijual",
  "Rumah",
  "2500000000",
  "",
  "Nego",
  "2700000000",
  "DI. Yogyakarta",
  "Kab. Sleman",
  "Depok",
  "Catur Tunggal",
  "Jl. Pajajaran No. 123, Catur Tunggal, Depok, Sleman",
  "-7.7567",
  "110.3655",
  "150",
  "120",
  "8",
  "2",
  "3",
  "2",
  "SHM & IMB/PBG Lengkap",
  "On Hand",
  "",
  "",
  "",
  "500",
  "",
  "6",
  "Rumah mewah 2 lantai dengan desain modern minimalis. Lokasi strategis dekat UGM.",
  "AC,Water Heater,Kitchen Set,Garage,Security",
  "Pemilik pindah kota",
  "Bapak Budi",
  "6281391278889",
  "",
  "https://maps.google.com/?q=-7.7567,110.3655",
  "",
  "TRUE",
  "FALSE",
  "TRUE",
  "TRUE",
  "https://images.salambumi.xyz/img1.webp",
  "https://images.salambumi.xyz/img2.webp",
  "https://images.salambumi.xyz/img3.webp",
  "",
  "",
  "",
  "",
  "",
  "",
  ""
];

export async function onRequestGet(context) {
  const { request, env } = context;

  // Handle CORS
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

   // Authenticate request (admin only)
   const admin = await requireAuth(request, env);
   if (!admin) {
     return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
       status: 401,
       headers: { "Content-Type": "application/json" }
     });
   }

  try {
    // Generate CSV content dengan BOM untuk Excel compatibility
    const BOM = "\uFEFF";
    const headerRow = CSV_HEADERS.join(",");
    const sampleRow = SAMPLE_ROW.map(val => {
      // Escape nilai yang mengandung koma atau kutip
      if (val.includes(",") || val.includes('"') || val.includes("\n")) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    }).join(",");

    const csvContent = BOM + headerRow + "\n" + sampleRow;

    // Return CSV file
    return new Response(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="template_import_properti_salam_bumi.csv"',
        "Cache-Control": "no-cache"
      }
    });

  } catch (error) {
    console.error("Template download error:", error);
    return new Response(JSON.stringify({ success: false, error: "Gagal membuat template" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

/**
 * GET /api/locations
 * Mengembalikan lokasi unik dari properti aktif di database.
 * Digunakan oleh CategoryPage dan Footer untuk internal linking dinamis.
 *
 * Query params:
 *   type       (optional) - filter berdasarkan property_type DB value (e.g. "Rumah")
 *   min_count  (optional, default 1) - minimum listing per lokasi
 */
import { jsonResponse, errorResponse, handleCors } from "../_utils/cors.js";

function toSlug(str) {
  if (!str) return "";
  return str.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export async function onRequestGet(context) {
  const { request, env } = context;

  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  try {
    const url = new URL(request.url);
    const type = url.searchParams.get("type");
    const minCount = Math.max(1, parseInt(url.searchParams.get("min_count") || "1"));

    let whereClause = "WHERE p.status = 'active' AND p.is_sold = 0";
    const params = [];

    if (type) {
      whereClause += " AND p.property_type = ?";
      params.push(type);
    }

    // Query semua kombinasi city+district unik dengan jumlah listing
    const result = await env.DB.prepare(
      `SELECT p.city, p.district, p.province, COUNT(*) as listing_count
       FROM properties p
       ${whereClause}
       GROUP BY p.city, p.district
       HAVING COUNT(*) >= ?
       ORDER BY listing_count DESC
       LIMIT 100`
    ).bind(...params, minCount).all();

    const rows = result.results || [];

    // Kumpulkan cities unik
    const cityMap = new Map();
    rows.forEach(r => {
      if (!r.city) return;
      const key = r.city;
      if (!cityMap.has(key)) {
        cityMap.set(key, { city: r.city, count: 0 });
      }
      cityMap.get(key).count += r.listing_count;
    });

    const cities = [...cityMap.values()]
      .sort((a, b) => b.count - a.count)
      .map(c => c.city);

    // Kumpulkan districts unik
    const districts = [...new Set(rows.filter(r => r.district).map(r => r.district))];

    // Format lokasi lengkap
    const locations = rows.map(r => ({
      city: r.city,
      district: r.district || null,
      province: r.province || "DI Yogyakarta",
      listing_count: r.listing_count,
      slug: toSlug(r.district || r.city),
      label: r.district ? `${r.district}, ${r.city}` : r.city,
    }));

    return jsonResponse(
      { success: true, data: { cities, districts, locations } },
      200,
      request,
      { "Cache-Control": "public, max-age=3600" }
    );

  } catch (error) {
    console.error("Locations API error:", error);
    return errorResponse("Gagal mengambil data lokasi", 500, request);
  }
}

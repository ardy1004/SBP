/**
 * GET /api/features
 * Mengembalikan kombinasi fitur+lokasi yang memiliki >= 3 listing aktif.
 * Digunakan oleh FeaturePage dan sitemap untuk menentukan URL yang valid.
 *
 * Query params:
 *   type       (optional) - filter berdasarkan property_type DB value (e.g. "Rumah")
 *   feature    (optional) - "bedrooms" | "land_area" | "building_area"
 *   min_count  (optional, default 3)
 */
import { jsonResponse, errorResponse, handleCors } from "../_utils/cors.js";

export async function onRequestGet(context) {
  const { request, env } = context;

  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  try {
    const url = new URL(request.url);
    const type = url.searchParams.get("type");
    const feature = url.searchParams.get("feature") || "bedrooms";
    const minCount = Math.max(1, parseInt(url.searchParams.get("min_count") || "3"));

    let results = { results: [] };

    if (feature === "bedrooms") {
      // Kombinasi type+bedrooms+city yang punya >= N listing
      let whereClause = "WHERE status = 'active' AND is_sold = 0 AND bedrooms > 0";
      const params = [];
      if (type) { whereClause += " AND property_type = ?"; params.push(type); }

      results = await env.DB.prepare(
        `SELECT property_type, bedrooms, city, district, COUNT(*) as cnt
         FROM properties ${whereClause}
         GROUP BY property_type, bedrooms, city
         HAVING cnt >= ?
         ORDER BY cnt DESC
         LIMIT 200`
      ).bind(...params, minCount).all();

    } else if (feature === "land_area") {
      // Rentang luas tanah: < 100m², 100–200m², 200–500m², > 500m²
      const ranges = [
        { label: "100m2", min: 0,   max: 100  },
        { label: "200m2", min: 100, max: 200  },
        { label: "500m2", min: 200, max: 500  },
        { label: "luas",  min: 500, max: 99999 },
      ];

      let whereClause = "WHERE status = 'active' AND is_sold = 0 AND land_area > 0";
      const params = [];
      if (type) { whereClause += " AND property_type = ?"; params.push(type); }

      const allRows = [];
      for (const range of ranges) {
        const r = await env.DB.prepare(
          `SELECT property_type, city, ? as area_label, COUNT(*) as cnt
           FROM properties ${whereClause} AND land_area > ? AND land_area <= ?
           GROUP BY property_type, city
           HAVING cnt >= ?
           ORDER BY cnt DESC`
        ).bind(...params, range.label, range.min, range.max, minCount).all();
        allRows.push(...(r.results || []));
      }
      results = { results: allRows };

    } else if (feature === "building_area") {
      let whereClause = "WHERE status = 'active' AND is_sold = 0 AND building_area > 0";
      const params = [];
      if (type) { whereClause += " AND property_type = ?"; params.push(type); }

      results = await env.DB.prepare(
        `SELECT property_type, city, COUNT(*) as cnt, 
                MIN(building_area) as min_area, MAX(building_area) as max_area
         FROM properties ${whereClause}
         GROUP BY property_type, city
         HAVING cnt >= ?
         ORDER BY cnt DESC
         LIMIT 100`
      ).bind(...params, minCount).all();
    }

    return jsonResponse(
      {
        success: true,
        feature,
        data: results.results || [],
      },
      200,
      request,
      { "Cache-Control": "public, max-age=3600" }
    );

  } catch (error) {
    console.error("Features API error:", error);
    return errorResponse("Gagal mengambil data fitur", 500, request);
  }
}

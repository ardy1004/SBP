/**
 * GET /api/sitemap.xml
 * Generate XML sitemap dynamically dari database
 */
import {
  generateSitemapXml,
  getStaticPageEntries,
  getCategoryPageEntries,
  getPropertyEntries,
  getDynamicCategoryEntries,
} from "./_utils/sitemapGenerator.js";

export async function onRequestGet(context) {
  const { env } = context;

  try {
    // Fetch semua properti aktif
    const properties = await env.DB.prepare(
      `SELECT slug, updated_at FROM properties WHERE status = 'active' ORDER BY updated_at DESC`
    ).all();

    const propertyList = (properties.results || []).map((p) => ({
      slug: p.slug,
      updated_at: p.updated_at,
    }));

    // Query kombinasi type+location yang memiliki >= 3 listing aktif
    const combinations = await env.DB.prepare(
      `SELECT property_type, city, district, COUNT(*) as cnt
       FROM properties
       WHERE status = 'active' AND is_sold = 0
       GROUP BY property_type, city, district
       HAVING cnt >= 3
       ORDER BY cnt DESC`
    ).all();

    const validCombinations = combinations.results || [];

    // Bangun sitemap dengan kategori dinamis dari DB
    const entries = [
      ...getStaticPageEntries(),
      ...getDynamicCategoryEntries(validCombinations),
      ...getPropertyEntries(propertyList),
    ];

    const sitemap = generateSitemapXml(entries);

    return new Response(sitemap, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Sitemap generation error:", error);

    // Fallback: sitemap statis jika DB error
    const entries = [
      ...getStaticPageEntries(),
      ...getCategoryPageEntries(),
    ];
    const sitemap = generateSitemapXml(entries);

    return new Response(sitemap, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  }
}

// Handle CORS preflight
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

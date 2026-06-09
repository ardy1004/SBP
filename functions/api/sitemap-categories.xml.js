/**
 * GET /api/sitemap-categories.xml
 * Sub-sitemap berisi URL kategori (type+location) yang memiliki >= 3 listing,
 * ditambah halaman fitur (bedrooms/area) dan halaman statis.
 */
import {
  generateSitemapXml,
  getStaticPageEntries,
  getDynamicCategoryEntries,
  getCategoryPageEntries,
} from "./_utils/sitemapGenerator.js";

const SITE_URL = "https://salambumi.xyz";

export async function onRequestGet(context) {
  const { env } = context;
  const now = new Date().toISOString().split("T")[0];

  try {
    // 1. Kombinasi type+location dengan >= 3 listing aktif
    const catResult = await env.DB.prepare(
      `SELECT property_type, city, district, COUNT(*) as cnt
       FROM properties
       WHERE status = 'active' AND is_sold = 0
       GROUP BY property_type, city, district
       HAVING cnt >= 3
       ORDER BY cnt DESC`
    ).all();

    // 2. Kombinasi type+bedrooms+city dengan >= 3 listing (feature pages)
    const bedroomsResult = await env.DB.prepare(
      `SELECT property_type, bedrooms, city, district, COUNT(*) as cnt
       FROM properties
       WHERE status = 'active' AND is_sold = 0 AND bedrooms > 0
       GROUP BY property_type, bedrooms, city
       HAVING cnt >= 3
       ORDER BY cnt DESC
       LIMIT 500`
    ).all();

    const validCombinations = catResult.results || [];
    const bedroomsCombinations = bedroomsResult.results || [];

    // Generate feature page entries (bedrooms)
    const featureEntries = [];
    const seen = new Set();
    for (const row of bedroomsCombinations) {
      const type = (row.property_type || "").toLowerCase().replace(/\s+/g, "-");
      const location = (row.district || row.city || "").toLowerCase().replace(/\s+/g, "-");
      const beds = row.bedrooms;
      if (!type || !location || !beds) continue;
      const url = `${SITE_URL}/${type}-${beds}-kamar-${location}`;
      if (seen.has(url)) continue;
      seen.add(url);
      featureEntries.push({ loc: url, lastmod: now, changefreq: "weekly", priority: 0.6 });
    }

    const entries = [
      ...getStaticPageEntries(),
      ...getDynamicCategoryEntries(validCombinations),
      ...featureEntries,
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
    console.error("sitemap-categories error:", error);
    const entries = [
      ...getStaticPageEntries(),
      ...getCategoryPageEntries(),
    ];
    return new Response(generateSitemapXml(entries), {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  }
}

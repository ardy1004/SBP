/**
 * GET /api/sitemap-properties.xml
 * Sub-sitemap berisi semua URL properti aktif.
 * Max 50.000 URL per file (Googlebot limit).
 */
import { generateSitemapXml, getPropertyEntries } from "./_utils/sitemapGenerator.js";

export async function onRequestGet(context) {
  const { env } = context;

  try {
    const result = await env.DB.prepare(
      `SELECT slug, updated_at
       FROM properties
       WHERE status = 'active'
       ORDER BY updated_at DESC
       LIMIT 50000`
    ).all();

    const propertyList = (result.results || []).map((p) => ({
      slug: p.slug,
      updated_at: p.updated_at,
    }));

    const sitemap = generateSitemapXml(getPropertyEntries(propertyList));

    return new Response(sitemap, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("sitemap-properties error:", error);
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`,
      { status: 200, headers: { "Content-Type": "application/xml; charset=utf-8" } }
    );
  }
}

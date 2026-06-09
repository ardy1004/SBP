/**
 * Sitemap Generator Utility
 * Generate XML sitemap untuk semua halaman website
 */

const SITE_URL = "https://salambumi.xyz";

// Property types untuk category pages
const PROPERTY_TYPES = [
  "rumah", "kost", "tanah", "villa", "apartment",
  "ruko", "gudang", "hotel", "homestay"
];

// Locations untuk location pages
const LOCATIONS = [
  "yogyakarta", "sleman", "bantul", "kulon-progo", "gunungkidul",
  "depok", "ngaglik", "kalasan", "mlati", "gamping"
];

/**
 * Generate sitemap XML string dari entries
 */
export function generateSitemapXml(entries) {
  const header = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  const footer = '</urlset>';

  const urls = entries.map(entry => {
    let url = `  <url>\n    <loc>${escapeXml(entry.loc)}</loc>\n`;
    if (entry.lastmod) {
      url += `    <lastmod>${entry.lastmod}</lastmod>\n`;
    }
    if (entry.changefreq) {
      url += `    <changefreq>${entry.changefreq}</changefreq>\n`;
    }
    if (entry.priority !== undefined) {
      url += `    <priority>${entry.priority.toFixed(1)}</priority>\n`;
    }
    url += `  </url>`;
    return url;
  }).join('\n');

  return header + urls + '\n' + footer;
}

/**
 * Generate static pages entries
 */
export function getStaticPageEntries() {
  const now = new Date().toISOString().split('T')[0];
  return [
    { loc: SITE_URL, lastmod: now, changefreq: "daily", priority: 1.0 },
    { loc: `${SITE_URL}/properti`, lastmod: now, changefreq: "daily", priority: 0.9 },
    { loc: `${SITE_URL}/about`, lastmod: now, changefreq: "monthly", priority: 0.5 },
    { loc: `${SITE_URL}/contact`, lastmod: now, changefreq: "monthly", priority: 0.5 },
  ];
}

/**
 * Generate category page entries (e.g., /rumah-dijual-yogyakarta)
 */
export function getCategoryPageEntries() {
  const now = new Date().toISOString().split('T')[0];
  const entries = [];

  for (const type of PROPERTY_TYPES) {
    entries.push({
      loc: `${SITE_URL}/${type}-dijual-yogyakarta`,
      lastmod: now,
      changefreq: "daily",
      priority: 0.8,
    });

    // Location sub-pages
    for (const loc of LOCATIONS) {
      entries.push({
        loc: `${SITE_URL}/${type}-dijual-${loc}`,
        lastmod: now,
        changefreq: "daily",
        priority: 0.7,
      });
    }
  }

  return entries;
}

/**
 * Generate property listing entries dari database
 */
export function getPropertyEntries(properties) {
  return properties.map(p => ({
    loc: `${SITE_URL}/properti/${p.slug}`,
    lastmod: p.updated_at
      ? new Date(p.updated_at).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    changefreq: "weekly",
    priority: 0.6,
  }));
}

/**
 * Generate dynamic category entries dari kombinasi DB (hanya yang ≥ 3 listing).
 * @param {Array<{property_type: string, city: string, district: string|null, cnt: number}>} combinations
 */
export function getDynamicCategoryEntries(combinations) {
  const now = new Date().toISOString().split('T')[0];
  const entries = [];
  const seen = new Set();

  for (const row of combinations) {
    const type = (row.property_type || '').toLowerCase().replace(/\s+/g, '-');
    // Gunakan district jika ada, fallback ke city
    const location = (row.district || row.city || '').toLowerCase().replace(/\s+/g, '-');
    if (!type || !location) continue;

    const url = `${SITE_URL}/${type}-dijual-${location}`;
    if (seen.has(url)) continue;
    seen.add(url);

    entries.push({
      loc: url,
      lastmod: now,
      changefreq: 'daily',
      priority: 0.7,
    });
  }

  return entries;
}

/**
 * Generate full sitemap dari data properties (gunakan versi statis sebagai fallback)
 */
export function generateFullSitemap(properties) {
  const entries = [
    ...getStaticPageEntries(),
    ...getCategoryPageEntries(),
    ...getPropertyEntries(properties),
  ];

  return generateSitemapXml(entries);
}

/**
 * Escape XML special characters
 */
function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

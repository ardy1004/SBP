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

export interface SitemapEntry {
  loc: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: number;
}

/**
 * Generate sitemap XML string dari entries
 */
export function generateSitemapXml(entries: SitemapEntry[]): string {
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
export function getStaticPageEntries(): SitemapEntry[] {
  const now = new Date().toISOString().split('T')[0];
  return [
    { loc: SITE_URL, lastmod: now, changefreq: "daily", priority: 1.0 },
    { loc: `${SITE_URL}/properties`, lastmod: now, changefreq: "daily", priority: 0.9 },
    { loc: `${SITE_URL}/about`, lastmod: now, changefreq: "monthly", priority: 0.5 },
    { loc: `${SITE_URL}/contact`, lastmod: now, changefreq: "monthly", priority: 0.5 },
  ];
}

/**
 * Generate category page entries (e.g., /rumah-dijual-yogyakarta)
 */
export function getCategoryPageEntries(): SitemapEntry[] {
  const now = new Date().toISOString().split('T')[0];
  const entries: SitemapEntry[] = [];

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
export function getPropertyEntries(properties: { slug: string; updated_at?: number }[]): SitemapEntry[] {
  return properties.map(p => ({
    loc: `${SITE_URL}/properti/${p.slug}`,
    lastmod: p.updated_at
      ? new Date(p.updated_at * 1000).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    changefreq: "weekly" as const,
    priority: 0.6,
  }));
}

/**
 * Generate full sitemap dari data properties
 */
export function generateFullSitemap(properties: { slug: string; updated_at?: number }[]): string {
  const entries: SitemapEntry[] = [
    ...getStaticPageEntries(),
    ...getCategoryPageEntries(),
    ...getPropertyEntries(properties),
  ];

  return generateSitemapXml(entries);
}

/**
 * Escape XML special characters
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

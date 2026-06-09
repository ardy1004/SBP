/**
 * Cloudflare Pages Middleware — Dynamic OG Tags
 *
 * Berjalan untuk SEMUA request. Untuk social media bot yang mengakses
 * halaman properti atau kategori, inject OG tags yang benar dari database.
 * Untuk request biasa dan /api/*, pass-through tanpa modifikasi.
 */

const SITE_URL = "https://salambumi.xyz";
const SITE_NAME = "Salam Bumi Property";
const DEFAULT_IMAGE = "https://images.salambumi.xyz/kost%20dijual%20jogja.webp";

// Social media bot user agents
const BOT_PATTERNS = [
  "facebookexternalhit",
  "twitterbot",
  "whatsapp",
  "linkedinbot",
  "slackbot",
  "telegrambot",
  "discordbot",
  "googlebot",
  "bingbot",
  "applebot",
];

function isSocialBot(userAgent) {
  const ua = userAgent.toLowerCase();
  return BOT_PATTERNS.some(p => ua.includes(p));
}

/**
 * Coba parse slug properti dari URL path.
 * Mengembalikan slug string atau null.
 */
function extractPropertySlug(pathname) {
  const match = pathname.match(/^\/properti\/([a-z0-9-]+)\/?$/);
  return match ? match[1] : null;
}

/**
 * Coba parse category page dari URL path.
 * Pattern: /{type}-dijual-{location}
 */
function extractCategoryInfo(pathname) {
  const match = pathname.match(/^\/([a-z-]+)-dijual-([a-z0-9-]+)\/?$/);
  if (!match) return null;
  return { type: match[1], location: match[2] };
}

function capitalize(str) {
  return str.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

function buildOgTags(data) {
  const { title, description, image, url } = data;
  return `
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${SITE_NAME}" />
    <meta property="og:locale" content="id_ID" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${image}" />`.trim();
}

function escapeAttr(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export async function onRequest(context) {
  const { request, env, next } = context;
  const url = new URL(request.url);
  const pathname = url.pathname;

  // 1. Pass-through semua API routes tanpa modifikasi
  if (pathname.startsWith("/api/") || pathname.startsWith("/admin")) {
    return next();
  }

  // 2. Pass-through jika bukan social bot — serve SPA seperti biasa
  const userAgent = request.headers.get("User-Agent") || "";
  if (!isSocialBot(userAgent)) {
    return next();
  }

  // === Social bot detected — inject OG tags ===

  try {
    let ogData = null;

    // 3a. Halaman detail properti: /properti/{slug}
    const propertySlug = extractPropertySlug(pathname);
    if (propertySlug && env.DB) {
      const prop = await env.DB.prepare(
        `SELECT p.title, p.description, p.property_type, p.city, p.district,
                p.price_offer, p.purpose,
                (SELECT COALESCE(url, image_url) FROM property_images
                 WHERE property_id = p.id AND is_primary = 1 LIMIT 1) as primary_image
         FROM properties p WHERE p.slug = ?`
      ).bind(propertySlug).first();

      if (prop) {
        const location = [prop.district, prop.city].filter(Boolean).join(", ") || "Yogyakarta";
        const purpose = prop.purpose || "Dijual";
        const title = escapeAttr(`${prop.title} | ${SITE_NAME}`);
        const desc = escapeAttr(
          `${prop.property_type} ${purpose.toLowerCase()} di ${location}. ` +
          (prop.description?.substring(0, 100) || "Lihat detail dan hubungi kami sekarang.")
        );
        const imageUrl = escapeAttr(prop.primary_image || DEFAULT_IMAGE);
        ogData = {
          title,
          description: desc,
          image: imageUrl,
          url: `${SITE_URL}/properti/${propertySlug}`,
        };
      }
    }

    // 3b. Category page: /{type}-dijual-{location}
    if (!ogData) {
      const catInfo = extractCategoryInfo(pathname);
      if (catInfo) {
        const typeLabel = capitalize(catInfo.type);
        const locationLabel = capitalize(catInfo.location);
        const title = escapeAttr(`${typeLabel} Dijual di ${locationLabel} | ${SITE_NAME}`);
        const desc = escapeAttr(
          `Temukan ${typeLabel.toLowerCase()} dijual di ${locationLabel}. ` +
          `Lokasi strategis, harga terbaik, legalitas lengkap. Salam Bumi Property.`
        );
        ogData = {
          title,
          description: desc,
          image: DEFAULT_IMAGE,
          url: `${SITE_URL}${pathname}`,
        };
      }
    }

    // 4. Jika tidak ada data spesifik, pass-through biasa
    if (!ogData) return next();

    // 5. Fetch HTML dari SPA
    const response = await next();
    const originalHtml = await response.text();

    // 6. Ganti OG tags lama dengan yang baru (inject sebelum </head>)
    const newOgTags = buildOgTags(ogData);
    let modifiedHtml = originalHtml
      .replace(/<meta\s+property="og:[^"]*"[^>]*\/>/gi, "")
      .replace(/<meta\s+name="twitter:[^"]*"[^>]*\/>/gi, "")
      .replace(/(<\/head>)/, `${newOgTags}\n  $1`);

    // Update title tag juga
    modifiedHtml = modifiedHtml.replace(
      /<title>[^<]*<\/title>/,
      `<title>${ogData.title}</title>`
    );

    return new Response(modifiedHtml, {
      status: response.status,
      headers: response.headers,
    });

  } catch (err) {
    console.error("OG middleware error:", err);
    return next();
  }
}

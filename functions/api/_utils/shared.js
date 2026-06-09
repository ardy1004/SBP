/**
 * Shared utility functions untuk Cloudflare Pages Functions.
 * Menghindari duplikasi antar endpoint.
 */

/**
 * Generate listing code berdasarkan tipe properti.
 * Format: PREFIX-XXXX (4 digit random, 0000-9999)
 */
// Stop words bahasa Indonesia (sinkron dengan constants/propertyTypes.ts frontend)
const STOP_WORDS = [
  "yang", "di", "ke", "dari", "untuk", "dengan", "dan", "atau", "pada", "dalam",
  "adalah", "akan", "sangat", "ini", "itu", "tersebut", "sebuah", "secara",
  "telah", "sedang", "sudah", "jadi", "menjadi", "harga", "turun", "naik",
  "murah", "mahal", "promo", "diskon", "ter", "se", "ber", "me", "pe",
  "lah", "kah", "pun", "nya", "ku", "mu", "dia", "ia", "mereka", "kami",
  "kita", "anda", "beliau", "saya", "hanya", "juga", "tidak", "bukan",
  "belum", "masih", "lebih", "paling", "sekali", "banget", "dekat", "strategis",
];

// Keyword lokasi yang DIPERTAHANKAN (sinkron dengan constants/propertyTypes.ts frontend)
const LOCATION_KEYWORDS = [
  "jogja", "yogyakarta", "sleman", "bantul", "kulonprogo", "kulon-progo",
  "gunungkidul", "kota", "kabupaten", "depok", "ngaglik", "kalasan",
  "malioboro", "ugm", "uii", "upn", "sttnas", "amikom",
  "kaliurang", "parangtritis", "wonosari", "wates", "piyungan",
  "mlati", "gamping", "berbah", "prambanan", "sewon", "kasihan",
  "banguntapan", "imogiri", "kretek",
];

export function generateListingCode(type) {
  const prefixes = {
    Rumah: "RMH", Kost: "KST", Tanah: "TNH", Villa: "VIL",
    Ruko: "RUK", Apartment: "APT", Hotel: "HTL", Gudang: "GDG",
    Homestay: "HMS",
  };
  const prefix = prefixes[type] || "PRP";
  const num = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `${prefix}-${num}`;
}

/**
 * Normalize text: lowercase, hapus karakter khusus, spasi → hyphen
 */
function normalizeText(text) {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/[àáâãäå]/g, "a")
    .replace(/[èéêë]/g, "e")
    .replace(/[ìíîï]/g, "i")
    .replace(/[òóôõö]/g, "o")
    .replace(/[ùúûü]/g, "u")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Hapus stop words, tapi PERTAHANKAN location keywords
 */
function removeStopWords(text) {
  if (!text) return "";
  return text.split("-").filter(word => {
    if (LOCATION_KEYWORDS.includes(word)) return true;
    return !STOP_WORDS.includes(word);
  }).join("-");
}

/**
 * Generate SEO-friendly slug dari title + optional params.
 * Konsisten dengan slugGenerator.ts di frontend.
 * Format: {propertyType}-{keywords}-{location}-{listingCode}
 */
export function generateSlug(title, listingCode, propertyType, location) {
  let parts = [];

  if (propertyType) parts.push(normalizeText(propertyType));

  if (title) {
    const normalized = normalizeText(title);
    const withoutStop = removeStopWords(normalized);
    const words = withoutStop.split("-").slice(0, 5);
    const propTypeNorm = propertyType ? normalizeText(propertyType) : null;
    parts = parts.concat(words.filter(w => w && w !== propTypeNorm));
  }

  if (location) {
    const normalizedLoc = normalizeText(location);
    if (normalizedLoc && !parts.includes(normalizedLoc)) {
      parts.push(normalizedLoc);
    }
  }

  // Remove duplicates, preserve order
  const unique = [];
  parts.forEach(w => { if (w && !unique.includes(w)) unique.push(w); });

  let slug = unique.join("-");

  // Truncate ke 60 karakter tanpa memotong kata
  if (slug.length > 60) {
    const truncated = slug.substring(0, 60);
    const lastHyphen = truncated.lastIndexOf("-");
    slug = lastHyphen > 0 ? truncated.substring(0, lastHyphen) : truncated;
  }

  if (listingCode) {
    const formattedCode = listingCode.toLowerCase().replace(/\./g, "-").replace(/[^a-z0-9-]/g, "");
    slug = `${slug}-${formattedCode}`;
  }

  return slug.replace(/-+/g, "-").replace(/^-|-$/g, "");
}

/**
 * Hash password dengan salt menggunakan SHA-256.
 * Format: "salt$<base64_salt>$<hex_hash>"
 */
export async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const encoder = new TextEncoder();
  const passwordBytes = encoder.encode(password);
  const data = new Uint8Array(salt.length + passwordBytes.length);
  data.set(salt);
  data.set(passwordBytes, salt.length);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  const saltBase64 = btoa(String.fromCharCode(...salt));
  return `salt$${saltBase64}$${hashHex}`;
}

/**
 * Verifikasi password terhadap stored hash (salted SHA-256).
 * Format: "salt$<base64_salt>$<hex_hash>"
 */
export async function verifyPassword(password, storedHash) {
  try {
    if (!storedHash || typeof storedHash !== "string") return false;

    if (storedHash.startsWith("salt$")) {
      const parts = storedHash.split("$");
      if (parts.length !== 3) return false;
      const saltBase64 = parts[1];
      const expectedHash = parts[2];
      const saltBytes = Uint8Array.from(atob(saltBase64), c => c.charCodeAt(0));
      const encoder = new TextEncoder();
      const passwordBytes = encoder.encode(password);
      const data = new Uint8Array(saltBytes.length + passwordBytes.length);
      data.set(saltBytes);
      data.set(passwordBytes, saltBytes.length);
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const computedHash = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
      return computedHash === expectedHash;
    }

    // Format sha256: (tanpa salt) sudah tidak didukung.
    if (storedHash.startsWith("sha256:")) {
      console.error(
        "[AUTH] Password admin menggunakan format hash lama (sha256: tanpa salt). " +
        "Format ini tidak aman dan tidak lagi didukung. " +
        "Jalankan migration untuk reset password admin."
      );
      return false;
    }

    console.error("[AUTH] Format hash password tidak dikenal:", storedHash.slice(0, 10) + "...");
    return false;
  } catch (e) {
    console.error("verifyPassword error:", e);
    return false;
  }
}

/**
 * Format property dari DB row ke response format.
 * Dipakai oleh properties/index.js, properties/[slug].js, properties/related.js
 */
export function formatPropertyRow(p) {
  return {
    id: p.id,
    listing_code: p.listing_code,
    title: p.title,
    slug: p.slug,
    purpose: p.purpose,
    property_type: p.property_type,
    price: p.price_offer,
    price_rent: p.price_rent,
    old_price: p.old_price,
    price_type: p.price_type,
    location: `${p.district || ""}, ${p.city}, ${p.province}`.replace(/^,\s*/, ""),
    city: p.city,
    district: p.district,
    province: p.province,
    village: p.village,
    address: p.address,
    land_area: p.land_area,
    building_area: p.building_area,
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    floors: p.floors,
    description: p.description,
    facilities: p.facilities ? JSON.parse(p.facilities) : [],
    image: p.primary_image,
    image_count: p.image_count,
    is_premium: !!p.is_premium,
    is_featured: !!p.is_featured,
    is_hot: !!p.is_hot,
    is_sold: !!p.is_sold,
    is_choice: !!p.is_choice,
    views_count: p.views_count,
    legal_status: p.legal_status,
    ownership_status: p.ownership_status,
    environmental_status: p.environmental_status,
    created_at: p.created_at,
  };
}

/**
 * POST /api/slug/generate
 * Generate SEO-friendly slug untuk properti
 *
 * Body: { title, propertyType, location, listingCode }
 * Response: { success, slug, seoScore, isUnique, suggestions }
 */
import { jsonResponse, errorResponse, handleCors } from "../_utils/cors.js";
import { requireAuth } from "../_utils/jwt.js";
import { generateSlug as coreGenerateSlug } from "../_utils/shared.js";

const PROPERTY_TYPES = ["rumah", "kost", "tanah", "villa", "ruko", "apartment", "hotel", "gudang", "homestay"];
const LOCATION_KEYWORDS = [
  "jogja", "yogyakarta", "sleman", "bantul", "kulonprogo",
  "depok", "ngaglik", "kalasan", "mlati", "gamping",
  "sewon", "kasihan", "banguntapan", "wonosari", "wates",
];

function validateSlug(slug) {
  const errors = [];
  if (!slug) return { isValid: false, errors: ["Slug tidak boleh kosong"] };
  if (slug.length > 80) errors.push("Slug terlalu panjang (maksimal 80 karakter)");
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) errors.push("Slug hanya boleh berisi huruf kecil, angka, dan hyphen");
  if (slug.startsWith("-") || slug.endsWith("-")) errors.push("Slug tidak boleh diawali/akhiri dengan hyphen");
  return { isValid: errors.length === 0, errors };
}

function calculateSEOScore(slug) {
  if (!slug) return 0;
  let score = 0;
  if (PROPERTY_TYPES.some(t => slug.includes(t))) score += 20;
  if (/[a-z]+[0-9]+-[0-9]+$/.test(slug) || /[a-z]+[0-9]+$/.test(slug)) score += 15;
  if (slug.length >= 30 && slug.length <= 60) score += 20;
  else if (slug.length >= 20 && slug.length <= 80) score += 10;
  if (LOCATION_KEYWORDS.some(loc => slug.includes(loc))) score += 20;
  const v = validateSlug(slug);
  if (v.isValid) score += 15;
  return score;
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  const admin = await requireAuth(request, env);
  if (!admin) return errorResponse("Unauthorized", 401, request);

  try {
    const body = await request.json();
    const { title, propertyType, location, listingCode } = body;
    if (!title && !propertyType) return errorResponse("Title atau propertyType wajib diisi", 400, request);

    let slug = coreGenerateSlug(title, listingCode, propertyType, location);

    let isUnique = true;
    let suggestions = [];
    if (env.DB) {
      const existing = await env.DB.prepare("SELECT id FROM properties WHERE slug = ?").bind(slug).first();
      if (existing) {
        isUnique = false;
        for (let i = 1; i <= 3; i++) suggestions.push(`${slug}-${i}`);
        slug = suggestions[0];
      }
    }

    const seoScore = calculateSEOScore(slug);
    const validation = validateSlug(slug);
    return jsonResponse({ success: true, slug, isUnique, seoScore, isValid: validation.isValid, suggestions, errors: validation.errors }, 200, request);
  } catch (error) {
    console.error("Slug generate error:", error);
    return errorResponse("Gagal generate slug", 500, request);
  }
}

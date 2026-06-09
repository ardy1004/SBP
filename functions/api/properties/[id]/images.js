/**
 * DELETE /api/properties/:id/images
 * Hapus semua gambar dari property_images table DAN dari R2 bucket.
 *
 * BUG FIX: Sebelumnya hanya hapus record DB — file R2 tertinggal dan terus ditagih.
 * Sekarang: ambil semua filename dari DB, delete dari R2, lalu bersihkan DB.
 * BUG FIX: Preflight CORS dulu pakai wildcard "*" — sekarang pakai getCorsHeaders().
 */
import { jsonResponse, errorResponse, handleCors, getCorsHeaders } from "../../_utils/cors.js";
import { requireAuth } from "../../_utils/jwt.js";

export async function onRequestDelete(context) {
  const { request, env, params } = context;

  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  const admin = await requireAuth(request, env);
  if (!admin) {
    return errorResponse("Unauthorized", 401, request);
  }

  const propertyId = params.id;
  if (!propertyId) {
    return errorResponse("Property ID wajib diisi", 400, request);
  }

  try {
    // Ambil semua gambar untuk properti ini sebelum dihapus dari DB
    const images = await env.DB.prepare(
      "SELECT filename, COALESCE(url, image_url) as url FROM property_images WHERE property_id = ?"
    ).bind(propertyId).all();

    // Hapus file dari R2 bucket (BUG FIX — sebelumnya tidak ada langkah ini)
    if (env.BUCKET && images.results && images.results.length > 0) {
      const deletePromises = images.results.map(async (img) => {
        const key = img.filename || (img.url ? img.url.split("/").pop() : null);
        if (key) {
          try {
            await env.BUCKET.delete(key);
          } catch (r2Err) {
            console.error(`R2 bulk delete failed for key "${key}":`, r2Err);
          }
        }
      });
      await Promise.allSettled(deletePromises);
    }

    // Hapus semua record dari DB
    await env.DB.prepare(
      "DELETE FROM property_images WHERE property_id = ?"
    ).bind(propertyId).run();

    return jsonResponse({
      success: true,
      deleted_count: images.results?.length || 0,
      message: "Semua gambar berhasil dihapus",
    }, 200, request);

  } catch (error) {
    console.error("Delete images error:", error);
    return errorResponse("Gagal menghapus gambar", 500, request);
  }
}

// Handle CORS preflight — gunakan getCorsHeaders() yang sama dengan endpoint lain
// BUG FIX: Sebelumnya pakai "Access-Control-Allow-Origin": "*" (wildcard tidak aman)
export async function onRequestOptions(context) {
  const { request } = context;
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(request),
  });
}

/**
 * DELETE /api/properties/delete-images
 * Hapus SEMUA gambar milik properti (DB record + file R2)
 *
 * Query params:
 *   property_id - ID properti (wajib)
 */
import { jsonResponse, errorResponse, handleCors } from "../_utils/cors.js";
import { requireAuth } from "../_utils/jwt.js";

export async function onRequestDelete(context) {
  const { request, env } = context;

  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  // Authenticate
  const admin = await requireAuth(request, env);
  if (!admin) {
    return errorResponse("Unauthorized", 401, request);
  }

  try {
    const url = new URL(request.url);
    const propertyId = url.searchParams.get("property_id");

    if (!propertyId) {
      return errorResponse("Parameter property_id wajib diisi", 400, request);
    }

    // Ambil daftar gambar yang akan dihapus (untuk cleanup R2)
    const images = await env.DB.prepare(
      "SELECT id, filename, url FROM property_images WHERE property_id = ?"
    ).bind(propertyId).all();

    // Hapus file dari R2 bucket jika ada
    if (env.BUCKET && images.results && images.results.length > 0) {
      const deletePromises = images.results.map(async (img) => {
        const key = img.filename || (img.url ? img.url.split("/").pop() : null);
        if (key) {
          try {
            await env.BUCKET.delete(key);
          } catch (r2Err) {
            console.error(`R2 delete failed for key "${key}":`, r2Err);
          }
        }
      });
      await Promise.allSettled(deletePromises);
    }

    // Hapus records dari DB
    await env.DB.prepare(
      "DELETE FROM property_images WHERE property_id = ?"
    ).bind(propertyId).run();

    return jsonResponse({
      success: true,
      message: `Berhasil menghapus ${images.results?.length || 0} gambar`,
    }, 200, request);

  } catch (error) {
    console.error("Delete images error:", error);
    return errorResponse("Gagal menghapus gambar", 500, request);
  }
}

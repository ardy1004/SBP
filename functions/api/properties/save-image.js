/**
 * POST /api/properties/save-image
 * Simpan URL gambar ke property_images table
 *
 * Kolom canonical (sesuai schema.sql / 0001_initial.sql):
 *   url      — URL gambar
 *   filename — Nama file di R2 bucket
 */
import { jsonResponse, errorResponse, handleCors } from "../_utils/cors.js";
import { requireAuth } from "../_utils/jwt.js";

export async function onRequestPost(context) {
  const { request, env } = context;

  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  // Authenticate request
  const admin = await requireAuth(request, env);
  if (!admin) {
    return errorResponse('Unauthorized', 401, request);
  }

  try {
    const body = await request.json();
    const { property_id, image_url, is_primary, sort_order } = body;

    if (!property_id || !image_url) {
      return errorResponse("property_id dan image_url wajib diisi", 400, request);
    }

    // Cek duplikat — cek di kolom url (baru) ATAU image_url (lama)
    const existing = await env.DB.prepare(
      "SELECT id FROM property_images WHERE property_id = ? AND (url = ? OR image_url = ?)"
    ).bind(property_id, image_url, image_url).first();

    if (existing) {
      // Jika diupdate jadi primary, reset gambar lain dulu
      if (is_primary) {
        await env.DB.prepare(
          "UPDATE property_images SET is_primary = 0 WHERE property_id = ? AND id != ?"
        ).bind(property_id, existing.id).run();
      }

      // Update is_primary dan sort_order jika perlu
      await env.DB.prepare(
        "UPDATE property_images SET is_primary = ?, sort_order = ? WHERE id = ?"
      ).bind(is_primary ? 1 : 0, sort_order || 0, existing.id).run();

      return jsonResponse({
        success: true,
        id: existing.id,
        message: "Gambar sudah ada, data diupdate",
      }, 200, request);
    }

    // Generate ID untuk image baru
    const id = crypto.randomUUID();

    // Ekstrak filename dari URL
    const filename = image_url.split("/").pop() || `image-${id}`;

    // Jika gambar baru akan dijadikan primary, reset semua gambar lain dulu.
    // BUG FIX: tanpa langkah ini bisa ada >1 gambar dengan is_primary = 1
    // yang menyebabkan thumbnail tidak konsisten di listing dan OG tags.
    if (is_primary) {
      await env.DB.prepare(
        "UPDATE property_images SET is_primary = 0 WHERE property_id = ?"
      ).bind(property_id).run();
    }

    // Simpan ke property_images table — kolom canonical: url, filename
    await env.DB.prepare(
      "INSERT INTO property_images (id, property_id, url, filename, is_primary, sort_order) VALUES (?, ?, ?, ?, ?, ?)"
    ).bind(
      id,
      property_id,
      image_url,
      filename,
      is_primary ? 1 : 0,
      sort_order || 0
    ).run();

    return jsonResponse({
      success: true,
      id,
      message: "Gambar berhasil disimpan",
    }, 201, request);

  } catch (error) {
    console.error("Save image error:", error);
    return errorResponse("Gagal menyimpan gambar", 500, request);
  }
}

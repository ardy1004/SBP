/**
 * /api/properties/[slug]
 * GET - Get single property by slug (public)
 * PUT - Update property (admin only)
 * DELETE - Delete property (admin only)
 */
import { jsonResponse, errorResponse, handleCors } from "../_utils/cors.js";
import { requireAuth } from "../_utils/jwt.js";

// GET /api/properties/:slug - Ambil detail properti
export async function onRequestGet(context) {
  const { request, env, params } = context;

  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  try {
    const { slug } = params;

    // Query by slug OR id (UUID) — admin edit uses id, public uses slug
    let property = await env.DB.prepare(
      `SELECT p.* FROM properties p WHERE p.slug = ? OR p.id = ?`
    ).bind(slug, slug).first();

    // Jika tidak ditemukan, cek slug_redirects untuk 301 redirect
    if (!property && env.DB) {
      const redirect = await env.DB.prepare(
        `SELECT new_slug FROM slug_redirects WHERE old_slug = ?`
      ).bind(slug).first();
      
      if (redirect && redirect.new_slug) {
        // Return 301 redirect ke slug baru
        const newUrl = new URL(request.url);
        newUrl.pathname = `/api/properties/${redirect.new_slug}`;
        
        return new Response(null, {
          status: 301,
          headers: {
            "Location": newUrl.toString(),
            "Cache-Control": "public, max-age=31536000" // Cache 1 tahun
          }
        });
      }
    }

    if (!property) {
      return errorResponse("Properti tidak ditemukan", 404, request);
    }

    // Increment views
    await env.DB.prepare(
      "UPDATE properties SET views_count = views_count + 1 WHERE id = ?"
    ).bind(property.id).run();

    // COALESCE(url, image_url): url adalah kolom baru, image_url adalah kolom lama
    const images = await env.DB.prepare(
      "SELECT id, COALESCE(url, image_url) as url, filename, is_primary, sort_order FROM property_images WHERE property_id = ? ORDER BY sort_order ASC"
    ).bind(property.id).all();

     // Format response dengan data lengkap (exclude owner PII for public)
     const formatted = {
       id: property.id,
       listing_code: property.listing_code,
       title: property.title,
       slug: property.slug,
       purpose: property.purpose,
       property_type: property.property_type,
       price: property.price_offer,
       price_rent: property.price_rent,
       old_price: property.old_price,
       price_type: property.price_type,
       province: property.province,
       city: property.city,
       district: property.district,
       village: property.village,
       address: property.address,
       location: `${property.district || ""}, ${property.city}, ${property.province}`.replace(/^,\s*/, ""),
       google_maps_url: property.google_maps_url,
       latitude: property.latitude,
       longitude: property.longitude,
       land_area: property.land_area,
       building_area: property.building_area,
       front_width: property.front_width,
       floors: property.floors,
       bedrooms: property.bedrooms,
       bathrooms: property.bathrooms,
       legal_status: property.legal_status,
       ownership_status: property.ownership_status,
       bank_name: property.bank_name,
       outstanding_amount: property.outstanding_amount,
       environmental_status: property.environmental_status,
       distance_to_river: property.distance_to_river,
       distance_to_grave: property.distance_to_grave,
       distance_to_powerline: property.distance_to_powerline,
       road_width: property.road_width,
       description: property.description,
       facilities: property.facilities ? JSON.parse(property.facilities) : [],
       selling_reason: property.selling_reason,
       images: (images.results || []).map(img => ({
         id: img.id,
         url: img.url,
         filename: img.filename,
         is_primary: !!img.is_primary,
         sort_order: img.sort_order,
       })),
       is_premium: !!property.is_premium,
       is_featured: !!property.is_featured,
       is_hot: !!property.is_hot,
       is_sold: !!property.is_sold,
       is_choice: !!property.is_choice,
       views_count: property.views_count + 1,
       created_at: property.created_at,
       updated_at: property.updated_at,
     };

    return jsonResponse({ success: true, data: formatted }, 200, request);

  } catch (error) {
    console.error("Property detail error:", error);
    return errorResponse("Gagal mengambil data properti", 500, request);
  }
}

// PUT /api/properties/:id - Update properti
export async function onRequestPut(context) {
  const { request, env, params } = context;

  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

   // Authenticate request (admin only)
   const admin = await requireAuth(request, env);
   if (!admin) {
     return errorResponse('Unauthorized', 401, request);
   }

  try {
    // Parameter name is 'slug' but we use it as 'id' for update
    const id = params.slug || params.id;
    const body = await request.json();

    // Cek properti exists & ambil slug lama untuk redirect
    const existing = await env.DB.prepare("SELECT id, slug FROM properties WHERE id = ?").bind(id).first();
    if (!existing) {
      return errorResponse("Properti tidak ditemukan", 404, request);
    }

    // ─── BUG KRITIS #2 FIX: Tulis slug_redirects saat slug berubah ───
    // Jika slug baru berbeda dari slug lama, simpan redirect agar
    // URL lama yang sudah tersebar di WhatsApp / terindex Google tidak 404.
    const newSlug = body.slug;
    const oldSlug = existing.slug;

    if (newSlug && newSlug !== oldSlug) {
      // Validasi slug baru belum dipakai properti lain
      const slugConflict = await env.DB.prepare(
        "SELECT id FROM properties WHERE slug = ? AND id != ?"
      ).bind(newSlug, id).first();
      if (slugConflict) {
        return errorResponse("Slug sudah digunakan properti lain.", 400, request);
      }

      // Tulis redirect: old_slug → new_slug
      // ON CONFLICT UPDATE agar chain redirect tetap satu hop
      await env.DB.prepare(`
        INSERT INTO slug_redirects (old_slug, new_slug, property_id, created_at)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(old_slug) DO UPDATE SET new_slug = excluded.new_slug, created_at = excluded.created_at
      `).bind(oldSlug, newSlug, id, new Date().toISOString()).run();

      // Jika ada redirect lain yang mengarah ke old_slug, update ke new_slug
      // (mencegah chain redirect A→B→C, ubah jadi A→C langsung)
      await env.DB.prepare(`
        UPDATE slug_redirects SET new_slug = ?, created_at = ?
        WHERE new_slug = ? AND old_slug != ?
      `).bind(newSlug, new Date().toISOString(), oldSlug, oldSlug).run();
    }
    // ── End slug redirect fix ──

    // Build dynamic update - hanya field yang dikirim
    const allowedFields = [
      "title", "slug", "purpose", "property_type", "price_offer", "price_rent",
      "old_price", "price_type", "province", "city", "district", "village",
      "address", "google_maps_url", "latitude", "longitude",
      "land_area", "building_area", "front_width", "floors", "bedrooms", "bathrooms",
      "legal_status", "ownership_status", "bank_name", "outstanding_amount",
      "environmental_status", "road_width", "description", "facilities",
      "selling_reason", "owner_name", "owner_whatsapp_1", "owner_whatsapp_2",
      "is_premium", "is_featured", "is_hot", "is_sold", "is_choice", "status"
    ];

    const setClauses = [];
    const values = [];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        setClauses.push(`${field} = ?`);
        if (field === "facilities" && Array.isArray(body[field])) {
          values.push(JSON.stringify(body[field]));
        } else if (["is_premium", "is_featured", "is_hot", "is_sold", "is_choice"].includes(field)) {
          values.push(body[field] ? 1 : 0);
        } else {
          values.push(body[field]);
        }
      }
    }

    if (setClauses.length === 0) {
      return errorResponse("Tidak ada field yang diupdate", 400, request);
    }

    setClauses.push("updated_at = ?");
    values.push(new Date().toISOString());
    values.push(id);

    await env.DB.prepare(
      `UPDATE properties SET ${setClauses.join(", ")} WHERE id = ?`
    ).bind(...values).run();

    // Log activity (hanya jika admin ada)
    if (admin) {
      await env.DB.prepare(
        "INSERT INTO activity_logs (id, admin_id, action, entity_type, entity_id, detail, ip_address) VALUES (?, ?, ?, ?, ?, ?, ?)"
      ).bind(
        crypto.randomUUID(), admin.id, "Update", "property", id,
        `Properti diupdate: ${body.title || id}${newSlug && newSlug !== oldSlug ? ` (slug: ${oldSlug} → ${newSlug})` : ""}`,
        request.headers.get("CF-Connecting-IP") || "unknown"
      ).run();
    }

    return jsonResponse({ success: true, message: "Properti berhasil diupdate" }, 200, request);

  } catch (error) {
    console.error("Property update error:", error);
    return errorResponse("Gagal mengupdate properti", 500, request);
  }
}

// DELETE /api/properties/:id - Hapus properti
export async function onRequestDelete(context) {
  const { request, env, params } = context;

  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

   // Authenticate request (admin only)
   const admin = await requireAuth(request, env);
   if (!admin) {
     return errorResponse('Unauthorized', 401, request);
   }

  try {
    // Parameter name is 'slug' but we use it as 'id' for delete
    const id = params.slug || params.id;

    // Cek properti exists
    const existing = await env.DB.prepare("SELECT id, title FROM properties WHERE id = ?").bind(id).first();
    if (!existing) {
      return errorResponse("Properti tidak ditemukan", 404, request);
    }

    // ─── BUG KRITIS #1 FIX: Hapus file dari R2 sebelum hapus DB record ───
    // Tanpa ini, file gambar tertinggal selamanya di R2 dan terus ditagih.
    const images = await env.DB.prepare(
      "SELECT filename, COALESCE(url, image_url) as url FROM property_images WHERE property_id = ?"
    ).bind(id).all();

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
    // ── End R2 cleanup fix ──

    // Hapus gambar dari DB (foreign key)
    await env.DB.prepare("DELETE FROM property_images WHERE property_id = ?").bind(id).run();

    // Hapus properti
    await env.DB.prepare("DELETE FROM properties WHERE id = ?").bind(id).run();

    // Log activity (hanya jika admin ada)
    if (admin) {
      await env.DB.prepare(
        "INSERT INTO activity_logs (id, admin_id, action, entity_type, entity_id, detail, ip_address) VALUES (?, ?, ?, ?, ?, ?, ?)"
      ).bind(
        crypto.randomUUID(), admin.id, "Delete", "property", id,
        `Properti dihapus: ${existing.title}`,
        request.headers.get("CF-Connecting-IP") || "unknown"
      ).run();
    }

    return jsonResponse({ success: true, message: "Properti berhasil dihapus" }, 200, request);

  } catch (error) {
    console.error("Property delete error:", error);
    return errorResponse("Gagal menghapus properti", 500, request);
  }
}

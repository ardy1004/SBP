/**
 * POST /api/properties/upload-image
 * Upload gambar ke R2 bucket
 * 
 * Headers: Authorization: Bearer {token}, Content-Type: multipart/form-data
 * Body: FormData with 'image' file
 * Response: { success, url, filename }
 */
import { jsonResponse, errorResponse, handleCors } from "../_utils/cors.js";
import { requireAuth } from "../_utils/jwt.js";

export async function onRequestPost(context) {
  const { request, env } = context;

  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

   // Authenticate request (admin only)
   const admin = await requireAuth(request, env);
   if (!admin) {
     return errorResponse('Unauthorized', 401, request);
   }

    try {
    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get("image");

    if (!file || !(file instanceof File)) {
      return errorResponse("File gambar wajib diupload", 400, request);
    }

    // Validasi tipe file
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return errorResponse("Tipe file tidak didukung. Hanya JPEG, PNG, dan WebP.", 400, request);
    }

    // Validasi ukuran (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return errorResponse("Ukuran file maksimal 5MB", 400, request);
    }

    // Sanitasi ekstensi: whitelist ketat berdasarkan MIME type yang sudah divalidasi.
    // BUG FIX: sebelumnya pakai file.name.split(".").pop() yang bisa menghasilkan
    // ekstensi berbahaya misal "php", "exe", atau double-extension "jpg.php".
    const MIME_TO_EXT = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
    };
    const ext = MIME_TO_EXT[file.type]; // selalu aman: sudah divalidasi di atas
    const timestamp = Date.now();
    const randomId = crypto.randomUUID().slice(0, 8);
    const filename = `property-${timestamp}-${randomId}.${ext}`;

    // Upload ke R2
    const arrayBuffer = await file.arrayBuffer();
    await env.BUCKET.put(filename, arrayBuffer, {
      httpMetadata: {
        contentType: file.type,
      },
    });

    // Generate public URL
    // Gunakan custom domain jika ada, atau endpoint lokal untuk development
    let publicUrl;
    if (env.R2_PUBLIC_URL) {
      // Production: gunakan R2 public URL
      publicUrl = `${env.R2_PUBLIC_URL}/${filename}`;
    } else {
      // Development: gunakan endpoint lokal
      const url = new URL(request.url);
      publicUrl = `${url.origin}/api/images/${filename}`;
    }

    return jsonResponse({
      success: true,
      url: publicUrl,
      filename,
    }, 200, request);

  } catch (error) {
    console.error("Image upload error:", error);
    return errorResponse("Gagal mengupload gambar", 500, request);
  }
}

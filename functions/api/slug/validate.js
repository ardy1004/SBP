/**
 * POST /api/slug/validate
 * Validasi uniqueness slug
 * 
 * Body: { slug, excludeId? }
 * Response: { success, isUnique, available, suggestions }
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
     const body = await request.json();
     const { slug, excludeId } = body;
     
     if (!slug) {
       return errorResponse("Slug wajib diisi", 400, request);
     }
     
     // Validate format
     const validFormat = /^[a-z0-9]+(-[a-z0-9]+)*$/;
     if (!validFormat.test(slug)) {
       return jsonResponse({
         success: true,
         isUnique: false,
         available: false,
         error: "Format slug tidak valid",
         suggestions: []
       }, 200, request);
     }
     
     // Check uniqueness
     let query = "SELECT id FROM properties WHERE slug = ?";
     let params = [slug];
     
     if (excludeId) {
       query += " AND id != ?";
       params.push(excludeId);
     }
     
     let isUnique = true;
     if (env.DB) {
       const existing = await env.DB.prepare(query).bind(...params).first();
       if (existing) {
         isUnique = false;
       }
     }
     
     // Generate suggestions if not unique
     const suggestions = [];
     if (!isUnique) {
       for (let i = 1; i <= 3; i++) {
         suggestions.push(`${slug}-${i}`);
       }
     }
     
     return jsonResponse({
       success: true,
       isUnique,
       available: isUnique,
       suggestions
     }, 200, request);
     
   } catch (error) {
     console.error("Slug validate error:", error);
     return errorResponse("Gagal validasi slug", 500, request);
   }
}

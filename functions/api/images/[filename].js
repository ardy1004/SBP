/**
 * GET /api/images/[filename]
 * Serve gambar dari R2 bucket
 * 
 * Endpoint ini memungkinkan akses gambar dari R2 tanpa public URL
 */
import { handleCors } from "../_utils/cors.js";

export async function onRequestGet(context) {
  const { request, env, params } = context;

  // Handle CORS
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  try {
    const filename = params.filename;
    
    if (!filename) {
      return new Response("Filename required", { status: 400 });
    }

    console.log("[IMAGE] Requesting:", filename);

    // Ambil file dari R2
    const object = await env.BUCKET.get(filename);

    if (!object) {
      console.log("[IMAGE] Not found:", filename);
      return new Response("Image not found", { status: 404 });
    }

    console.log("[IMAGE] Found:", filename, "size:", object.size, "type:", object.httpMetadata?.contentType);

    // Return file dengan content type yang sesuai
    const headers = new Headers();
    headers.set("Content-Type", object.httpMetadata?.contentType || "image/jpeg");
    headers.set("Cache-Control", "public, max-age=31536000"); // Cache 1 tahun
    // Remove wildcard CORS - images should be served via R2 public URL with proper domain
    // headers.set("Access-Control-Allow-Origin", "*");

    return new Response(object.body, {
      headers,
    });

  } catch (error) {
    console.error("[IMAGE] Error:", error);
    return new Response("Error serving image: " + error.message, { status: 500 });
  }
}

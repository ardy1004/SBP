var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/bundle-XSvzSS/checked-fetch.js
var urls = /* @__PURE__ */ new Set();
function checkURL(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls.has(url.toString())) {
      urls.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
__name(checkURL, "checkURL");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    const [request, init] = argArray;
    checkURL(request, init);
    return Reflect.apply(target, thisArg, argArray);
  }
});

// worker.js
var worker_default = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/p/")) {
      return handlePropertyShare(request, env, url);
    }
    if (url.pathname.length > 1 && !url.pathname.includes("/admin") && !url.pathname.includes("/api") && !url.pathname.includes("/p/")) {
      const slugResult = await handleSlugRedirect(request, env, url);
      if (slugResult) return slugResult;
    }
    if (request.method === "POST" && url.pathname === "/api/chat") {
      return handleChatRequest(request, env);
    }
    if (request.method === "POST" && url.pathname === "/api/generate-description") {
      return handleGenerateDescription(request, env);
    }
    if (request.method === "POST" && url.pathname === "/upload") {
      return handleImageUpload(request, env);
    }
    if (url.pathname === "/favicon.ico") {
      console.log("\u{1F5BC}\uFE0F Handling favicon.ico request");
      return new Response(null, {
        status: 302,
        headers: {
          "Location": "/favicon.png",
          "Cache-Control": "public, max-age=86400"
          // Cache for 24 hours
        }
      });
    }
    if (url.pathname === "/robots.txt") {
      const robotsTxt = `User-agent: *
Allow: /

Sitemap: https://salambumi.xyz/sitemap.xml`;
      return new Response(robotsTxt, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "public, max-age=86400"
        }
      });
    }
    return serveSPA(request, env);
  }
};
async function serveSPA(request, env) {
  try {
    const html = `<!DOCTYPE html>
<html lang="id">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Salam Bumi Property</title>
	<script>
		// Redirect to SPA with current path as hash
		const path = window.location.pathname + window.location.search;
		window.location.href = 'https://salambumi.xyz#' + path.substring(1);
	<\/script>
</head>
<body>
	<p>Mengalihkan ke aplikasi...</p>
</body>
</html>`;
    return new Response(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8"
      }
    });
  } catch (error) {
    console.error("SPA serve error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
__name(serveSPA, "serveSPA");
async function handlePropertyShare(request, env, url) {
  const kodeListing = url.pathname.split("/p/")[1];
  console.log("Property share request for kode_listing:", kodeListing);
  if (!kodeListing) {
    console.log("No kode_listing provided");
    return new Response("Kode listing required", { status: 400 });
  }
  try {
    const property = await fetchPropertyFromSupabase(kodeListing, env);
    if (!property) {
      console.log("Property not found for kode_listing:", kodeListing);
      return new Response("Property not found", { status: 404 });
    }
    console.log("Property found:", property.kode_listing, "with images:", property.image_url, property.image_url1);
    const images = [
      property.image_url,
      property.image_url1,
      property.image_url2,
      property.image_url3,
      property.image_url4
    ].filter(Boolean);
    const mainImageUrl = images[0] || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop";
    console.log("Main image URL for share:", mainImageUrl);
    console.log("All available images:", images);
    const html = generateShareCardHTML(property, kodeListing, mainImageUrl);
    return new Response(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=3600"
        // Cache for 1 hour
      }
    });
  } catch (error) {
    console.error("Property share error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
__name(handlePropertyShare, "handlePropertyShare");
async function handleSlugRedirect(request, env, url) {
  const slug = url.pathname.substring(1);
  const userAgent = request.headers.get("User-Agent") || "";
  console.log("Slug request for:", slug, "User-Agent:", userAgent);
  try {
    const kodeListing = parseSlugForKodeListing(slug);
    if (!kodeListing) {
      console.log("No kode_listing found in slug:", slug);
      return null;
    }
    const property = await fetchPropertyFromSupabase(kodeListing, env);
    if (!property) {
      console.log("Property not found for kode_listing from slug:", kodeListing);
      return null;
    }
    console.log("Property found for slug:", property.kode_listing);
    const isCrawler = /facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegrambot|discordbot|slackbot/i.test(userAgent);
    if (isCrawler) {
      console.log("Serving OG meta tags for crawler");
      const images = [
        property.image_url,
        property.image_url1,
        property.image_url2,
        property.image_url3,
        property.image_url4
      ].filter(Boolean);
      const mainImageUrl = images[0] || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop";
      console.log("Main image URL for crawler:", mainImageUrl);
      console.log("All available images:", images);
      const html = generateShareCardHTML(property, kodeListing, mainImageUrl);
      return new Response(html, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "public, max-age=3600"
        }
      });
    } else {
      console.log("Redirecting user to SPA with slug as hash:", slug);
      const spaUrl = `https://salambumi.xyz/#${slug}`;
      return Response.redirect(spaUrl, 302);
    }
  } catch (error) {
    console.error("Slug redirect error:", error);
    return null;
  }
}
__name(handleSlugRedirect, "handleSlugRedirect");
function parseSlugForKodeListing(slug) {
  const parts = slug.split("-");
  for (let i = parts.length - 1; i >= 0; i--) {
    const part = parts[i].toUpperCase();
    if (/^[A-Z]\d+(\.\d+)?$/.test(part)) {
      return part;
    }
  }
  return null;
}
__name(parseSlugForKodeListing, "parseSlugForKodeListing");
async function fetchPropertyFromSupabase(kodeListing, env) {
  const supabaseUrl = env.SUPABASE_URL;
  const supabaseKey = env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase configuration missing");
  }
  const response = await fetch(`${supabaseUrl}/rest/v1/properties?kode_listing=eq.${encodeURIComponent(kodeListing)}&select=*`, {
    headers: {
      "Authorization": `Bearer ${supabaseKey}`,
      "apikey": supabaseKey,
      "Content-Type": "application/json"
    }
  });
  if (!response.ok) {
    return null;
  }
  const data = await response.json();
  return data[0] || null;
}
__name(fetchPropertyFromSupabase, "fetchPropertyFromSupabase");
function generateShareCardHTML(property, propertyId, mainImageUrl) {
  const formatPrice = /* @__PURE__ */ __name((price) => {
    if (!price) return "Harga belum ditentukan";
    const num = parseFloat(price);
    if (num >= 1e9) {
      return `Rp ${(num / 1e9).toFixed(1)}M`;
    } else if (num >= 1e6) {
      return `Rp ${(num / 1e6).toFixed(1)}M`;
    }
    return `Rp ${num.toLocaleString("id-ID")}`;
  }, "formatPrice");
  const title = property.judul_properti || `${property.jenis_properti?.charAt(0).toUpperCase() + property.jenis_properti?.slice(1).replace(/_/g, " ")} di ${property.kabupaten}`;
  const description = property.deskripsi ? property.deskripsi.length > 80 ? property.deskripsi.substring(0, 77) + "..." : property.deskripsi : `Properti ${property.status || "dijual"} di ${property.kabupaten}, ${property.provinsi}. ${formatPrice(property.harga_properti)}`;
  const baseUrl = "https://salambumi.xyz";
  const shareUrl = `${baseUrl}/p/${propertyId}`;
  const detailUrl = `${baseUrl}/properti/${property.id}`;
  return `<!DOCTYPE html>
<html lang="id">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>${title} - Salam Bumi Property</title>

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website">
	<meta property="og:url" content="${shareUrl}">
	<meta property="og:title" content="${title}">
	<meta property="og:description" content="${description}">
	<meta property="og:image" content="${mainImageUrl}">
	<meta property="og:image:width" content="1200">
	<meta property="og:image:height" content="630">
	<meta property="og:site_name" content="Salam Bumi Property">

	<!-- Twitter -->
	<meta name="twitter:card" content="summary_large_image">
	<meta name="twitter:url" content="${shareUrl}">
	<meta name="twitter:title" content="${title}">
	<meta name="twitter:description" content="${description}">
	<meta name="twitter:image" content="${mainImageUrl}">

	<!-- Auto redirect after 1 second -->
	<meta http-equiv="refresh" content="1; url=${detailUrl}">

	<style>
		body {
			font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
			margin: 0;
			padding: 20px;
			background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
			color: white;
			min-height: 100vh;
			display: flex;
			align-items: center;
			justify-content: center;
		}
		.container {
			text-align: center;
			max-width: 600px;
			padding: 40px;
			background: rgba(255, 255, 255, 0.1);
			border-radius: 20px;
			backdrop-filter: blur(10px);
			border: 1px solid rgba(255, 255, 255, 0.2);
		}
		.image {
			width: 100%;
			max-width: 400px;
			height: 250px;
			object-fit: cover;
			border-radius: 12px;
			margin-bottom: 20px;
			box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
		}
		.title {
			font-size: 24px;
			font-weight: bold;
			margin-bottom: 10px;
		}
		.description {
			font-size: 16px;
			margin-bottom: 20px;
			opacity: 0.9;
		}
		.loading {
			display: inline-block;
			width: 20px;
			height: 20px;
			border: 3px solid rgba(255,255,255,.3);
			border-radius: 50%;
			border-top-color: #fff;
			animation: spin 1s ease-in-out infinite;
		}
		@keyframes spin {
			to { transform: rotate(360deg); }
		}
	</style>
</head>
<body>
	<div class="container">
		<img src="${mainImageUrl}" alt="${title}" class="image">
		<h1 class="title">${title}</h1>
		<p class="description">${description}</p>
		<p>Mengalihkan ke halaman detail... <span class="loading"></span></p>
		<p style="font-size: 14px; opacity: 0.7; margin-top: 20px;">
			Jika tidak dialihkan otomatis, <a href="${detailUrl}" style="color: white; text-decoration: underline;">klik di sini</a>
		</p>
	</div>
</body>
</html>`;
}
__name(generateShareCardHTML, "generateShareCardHTML");
async function handleChatRequest(request, env) {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    });
  }
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }
  try {
    const { messages } = await request.json();
    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Messages array required" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
    const geminiApiKey = env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      console.error("Gemini API key not configured");
      return new Response(JSON.stringify({ error: "AI service unavailable" }), {
        status: 503,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
    const systemPrompt = `You are a friendly and helpful property agent chatbot for SalamBumiProperty, a real estate company in Indonesia.

Your role:
- Help users find properties (kost, rumah, apartemen, tanah, ruko, villa, gudang)
- Answer questions about real estate, locations, pricing, and property features
- Provide information about property listings, market trends, and investment opportunities
- Guide users through the property search process
- Be conversational, professional, and enthusiastic
- Always respond in Indonesian (Bahasa Indonesia)
- If users ask about specific properties, mention that they can browse our website or contact our agents
- For pricing questions, give general ranges and suggest checking current listings
- Be knowledgeable about Indonesian property market, especially Yogyakarta and surrounding areas
- End conversations helpfully by offering more assistance or directing to contact information

Guidelines:
- Keep responses concise but informative (2-4 sentences typically)
- Use friendly, approachable language
- Include relevant property keywords naturally for SEO
- If unsure about specific details, suggest contacting human agents
- Always maintain a positive, helpful tone`;
    const geminiMessages = [
      {
        role: "user",
        parts: [{ text: systemPrompt }]
      },
      ...messages.map((msg) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }]
      }))
    ];
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: geminiMessages,
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.9,
            maxOutputTokens: 800
          }
        })
      }
    );
    if (!response.ok) {
      console.error("Gemini API error:", response.status, await response.text());
      return new Response(JSON.stringify({ error: "AI service temporarily unavailable" }), {
        status: 503,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
    const result = await response.json();
    const chatResponse = result.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!chatResponse) {
      return new Response(JSON.stringify({ error: "No response generated" }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
    return new Response(JSON.stringify({ response: chatResponse.trim() }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
}
__name(handleChatRequest, "handleChatRequest");
async function handleGenerateDescription(request, env) {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    });
  }
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }
  try {
    const {
      title,
      type,
      status,
      price,
      land_area,
      building_area,
      bedrooms,
      bathrooms,
      legal,
      location,
      old_description,
      model = "gemini-2.0-flash-exp",
      requestId
    } = await request.json();
    console.log(`\u{1F527} [${requestId}] BACKEND: Processing AI generation request`);
    if (!type || !location?.province) {
      return new Response(JSON.stringify({ error: "Missing required fields: type and location.province" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
    const geminiApiKey = env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      console.error("Gemini API key not configured");
      return new Response(JSON.stringify({ error: "AI service unavailable" }), {
        status: 503,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
    let aiTitle = title;
    let aiDescription = old_description;
    const getModelName = /* @__PURE__ */ __name((modelId) => {
      const availableModels = {
        "gemini-2.0-flash-exp": "gemini-2.0-flash-exp"
      };
      return availableModels[modelId] || "gemini-2.0-flash-exp";
    }, "getModelName");
    const apiModel = getModelName(model);
    const combinedPrompt = `Buat judul dan deskripsi properti yang menarik dan SEO-friendly dalam bahasa Indonesia untuk properti berikut:

Jenis: ${type}
Status: ${status || "dijual"}
Lokasi: ${location.district || ""}, ${location.province}
Harga: ${price || "belum ditentukan"}
Luas Tanah: ${land_area || 0} m\xB2
Luas Bangunan: ${building_area || 0} m\xB2
Kamar Tidur: ${bedrooms || 0}
Kamar Mandi: ${bathrooms || 0}
Status Legal: ${legal || ""}
Deskripsi Lama: ${old_description || ""}

INSTRUKSI:
1. Buat JUDUL baru yang menarik (maksimal 80 karakter)
2. Buat DESKRIPSI baru yang detail (150-250 kata)

FORMAT OUTPUT (harus mengikuti format ini persis):
JUDUL: [judul yang Anda buat]
DESKRIPSI: [deskripsi yang Anda buat]`;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3e4);
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${apiModel}:generateContent?key=${geminiApiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            contents: [{
              role: "user",
              parts: [{ text: combinedPrompt }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1e3
            }
          }),
          signal: controller.signal
        }
      );
      clearTimeout(timeoutId);
      if (response.ok) {
        const result = await response.json();
        const generatedContent = result.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (generatedContent) {
          const titleMatch = generatedContent.match(/JUDUL:\s*(.+?)(?:\n|$)/i);
          const descMatch = generatedContent.match(/DESKRIPSI:\s*(.+?)(?:\n*(?:$|JUDUL:))/is);
          if (titleMatch && titleMatch[1] && titleMatch[1].trim().length > 0) {
            aiTitle = titleMatch[1].trim();
          }
          if (descMatch && descMatch[1] && descMatch[1].trim().length > 0) {
            aiDescription = descMatch[1].trim();
          }
        }
      } else {
        const errorText = await response.text();
        console.error(`\u274C [${requestId}] AI generation failed:`, response.status, errorText);
        if (response.status === 404) {
          console.error(`\u274C [${requestId}] Model not found:`, apiModel);
        } else if (response.status === 429) {
          console.error(`\u274C [${requestId}] Quota exceeded for model:`, apiModel);
        }
      }
    } catch (error) {
      if (error.name === "AbortError") {
        console.error(`\u23F0 [${requestId}] AI generation timeout`);
      } else {
        console.error(`\u274C [${requestId}] AI generation error:`, error);
      }
    }
    const safeTitle = aiTitle && aiTitle !== title ? aiTitle : title;
    const safeDescription = aiDescription && aiDescription !== old_description ? aiDescription : old_description;
    const isGenerated = aiTitle !== title && aiTitle !== "" || aiDescription !== old_description && aiDescription !== "";
    const keywords = extractKeywords(safeDescription, type, location.province, location.district);
    console.log(`\u{1F4CA} [${requestId}] AI Generation result:`, {
      isGenerated,
      titleChanged: aiTitle !== title,
      descriptionChanged: aiDescription !== old_description,
      keywordCount: keywords.length
    });
    return new Response(JSON.stringify({
      ai_title: safeTitle,
      ai_description: safeDescription,
      keywords,
      is_generated: isGenerated,
      message: isGenerated ? "AI berhasil generate konten baru" : "Konten berhasil dimuat dengan aman"
    }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (error) {
    console.error("Generate description API error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
}
__name(handleGenerateDescription, "handleGenerateDescription");
function extractKeywords(text, propertyType, province, district) {
  const keywords = /* @__PURE__ */ new Set();
  if (propertyType) keywords.add(propertyType.toLowerCase());
  if (province) keywords.add(province.toLowerCase());
  if (district) keywords.add(district.toLowerCase());
  const commonKeywords = [
    "rumah",
    "apartemen",
    "kost",
    "villa",
    "ruko",
    "tanah",
    "gudang",
    "dijual",
    "disewakan",
    "sewa",
    "jual",
    "strategis",
    "murah",
    "bagus",
    "baru",
    "cantik",
    "indah",
    "fasilitas",
    "dekat",
    "pusat",
    "kota",
    "lokasi"
  ];
  if (text && typeof text === "string") {
    const lowerText = text.toLowerCase();
    commonKeywords.forEach((keyword) => {
      if (lowerText.includes(keyword)) {
        keywords.add(keyword);
      }
    });
  }
  return Array.from(keywords).slice(0, 10);
}
__name(extractKeywords, "extractKeywords");
async function handleImageUpload(request, env) {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    });
  }
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }
  try {
    const formData = await request.formData();
    const file = formData.get("image");
    const propertyId = formData.get("propertyId");
    if (!file || !propertyId) {
      return new Response(
        JSON.stringify({ error: "Missing file or propertyId" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        }
      );
    }
    const fileName = file.name || "upload";
    const extensionMatch = fileName.match(/\.(\w+)$/);
    const ext = extensionMatch ? extensionMatch[1].toLowerCase() : "jpg";
    const allowed = ["jpg", "jpeg", "png", "gif", "webp"];
    if (!allowed.includes(ext)) {
      return new Response(JSON.stringify({ error: "Unsupported file type" }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }
    const publicDomain = "https://images.salambumi.xyz";
    const timestamp = Date.now();
    const originalKey = `images/${propertyId}/${timestamp}-original.${ext}`;
    await env.IMAGES_BUCKET.put(originalKey, file, {
      httpMetadata: { contentType: file.type || `image/${ext}` }
    });
    const imageUrl = `${publicDomain}/${originalKey}`;
    return new Response(JSON.stringify({
      success: true,
      url: imageUrl,
      originalUrl: imageUrl,
      propertyId
    }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (error) {
    console.error("Worker error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
}
__name(handleImageUpload, "handleImageUpload");

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-XSvzSS/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = worker_default;

// node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-XSvzSS/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=worker.js.map

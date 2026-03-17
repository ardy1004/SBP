import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getCORSHeaders, checkRateLimit, extractKeywords, getEnvVar } from './_lib/utils';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  const origin = req.headers.get('origin') || req.headers.get('Origin') || null;
  const corsHeaders = getCORSHeaders(origin);
  
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).send('');
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limiting
  const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  const rateLimitResult = checkRateLimit(String(clientIP), '/api/generate-description', 'API_HEAVY');
  
  if (!rateLimitResult.allowed) {
    return res.status(429).json({
      error: 'Rate limit exceeded',
      message: 'Terlalu banyak permintaan. Silakan coba lagi nanti.',
      retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
    });
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
    } = req.body;

    console.log(`🔧 [${requestId}] BACKEND: Processing AI generation request`);

    // Validate required fields
    if (!type || !location || !location.province) {
      console.error(`❌ [${requestId}] Validation failed - type: ${!!type}, location: ${!!location}, province: ${location?.province}`);
      return res.status(400).json({
        error: 'Missing required fields: type and location.province',
        details: { type: !!type, location: !!location, province: location?.province }
      });
    }

    // Get API key from environment (supports both VITE_ and non-VITE prefixes)
    const geminiApiKey = getEnvVar('GEMINI_API_KEY');
    if (!geminiApiKey) {
      console.error('Gemini API key not configured');
      return res.status(503).json({ error: 'AI service unavailable' });
    }

    let aiTitle = title;
    let aiDescription = old_description;

    // Use model from request or default
    const apiModel = model || "gemini-2.0-flash";

    // Combined prompt for title and description
    const combinedPrompt = `Dari Judul dan Deskripsi tersebut, tolong kembangkan menjadi judul Klik Bait yang bagus dan deskripsi yang marketable, seo friendly, meningkatkan visibilitas di google dan berpotensi muncul di pencarian atas google, mengandung keyword yang relevan. Tanpa bullet, tanpa bold, tanpa italic, keluarkan plain text saja.

Judul: maximal 100 karakter, mengandung klik bait
Deskripsi: output deskripsi maximal 600 karakter, mengandung judul klik bait, foreshadow, body, keyword relevan dan call to action: Jadwalkan Survay Lokasi, Hubungi Kami Segera! (gunakan emoticon didalam format deskripsi untuk mempercantik tampilan)

Dalam penyusunan deskripsi:
-Beri spasi jelas antar paragraf.
-Bahasa harus mengalir, mudah dipahami, dan tidak bertele-tele.

Judul Input: ${title || ''}
Deskripsi Input: ${old_description || ''}

FORMAT OUTPUT (harus mengikuti format ini persis):
# Judul
{judul properti}

# Deskripsi
{deskripsi lengkap properti}`;

    try {
      // API call with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/${apiModel}:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              role: 'user',
              parts: [{ text: combinedPrompt }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1000,
            }
          }),
          signal: controller.signal
        }
      );

      clearTimeout(timeoutId);

      if (response.ok) {
        const result = await response.json();
        const generatedContent = result.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

        console.log("RAW_AI_RESPONSE:", generatedContent);

        if (generatedContent) {
          // Parse the combined response
          const titleMatch = generatedContent.match(/# Judul\s*\n(.+?)(?=\n# Deskripsi|\n*$)/is);
          const descMatch = generatedContent.match(/# Deskripsi\s*\n(.+?)(?=\n#|\n*$)/is);

          if (titleMatch && titleMatch[1] && titleMatch[1].trim().length > 0) {
            aiTitle = titleMatch[1].trim();
          } else {
            console.error(`❌ [${requestId}] Format AI tidak sesuai - # Judul tidak ditemukan`);
          }

          if (descMatch && descMatch[1] && descMatch[1].trim().length > 0) {
            aiDescription = descMatch[1].trim();
          } else {
            console.error(`❌ [${requestId}] Format AI tidak sesuai - # Deskripsi tidak ditemukan`);
          }
        }
      } else {
        const errorText = await response.text();
        console.error(`❌ [${requestId}] AI generation failed:`, response.status, errorText);

        if (response.status === 404) {
          return res.status(503).json({
            error: `Model "${apiModel}" tidak tersedia. Periksa daftar model yang valid.`,
            model: apiModel
          });
        }
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.error(`⏰ [${requestId}] AI generation timeout`);
      } else {
        console.error(`❌ [${requestId}] AI generation error:`, error);
      }
    }

    // Provide safe fallback content
    const safeTitle = aiTitle && aiTitle !== title ? aiTitle : title;
    const safeDescription = aiDescription && aiDescription !== old_description ? aiDescription : old_description;

    // Check if AI actually generated new content
    const isGenerated = (aiTitle !== title && aiTitle !== "") ||
                       (aiDescription !== old_description && aiDescription !== "");

    // Extract keywords
    const keywords = extractKeywords(safeDescription, type, location.province, location.district);

    console.log(`📊 [${requestId}] AI Generation result:`, {
      isGenerated,
      titleChanged: aiTitle !== title,
      descriptionChanged: aiDescription !== old_description,
      keywordCount: keywords.length
    });

    return res.status(200).json({
      ai_title: safeTitle,
      ai_description: safeDescription,
      keywords: keywords,
      is_generated: isGenerated,
      message: isGenerated ? "AI berhasil generate konten baru" : "Konten berhasil dimuat dengan aman"
    });

  } catch (error) {
    console.error('Generate description API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

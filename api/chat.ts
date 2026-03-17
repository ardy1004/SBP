import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getCORSHeaders, checkRateLimit, getEnvVar } from './_lib/utils';

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
  const rateLimitResult = checkRateLimit(String(clientIP), '/api/chat', 'API_HEAVY');
  
  if (!rateLimitResult.allowed) {
    return res.status(429).json({
      error: 'Rate limit exceeded',
      message: 'Terlalu banyak permintaan. Silakan coba lagi nanti.',
      retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
    });
  }

  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array required' });
    }

    // Get API key from environment (supports both VITE_ and non-VITE prefixes)
    const geminiApiKey = getEnvVar('GEMINI_API_KEY');
    if (!geminiApiKey) {
      console.error('Gemini API key not configured');
      return res.status(503).json({ error: 'AI service unavailable' });
    }

    // System prompt for property chatbot
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

    // Prepare messages for Gemini API
    const geminiMessages = [
      {
        role: 'user',
        parts: [{ text: systemPrompt }]
      },
      ...messages.map((msg: { role: string; content: string }) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }))
    ];

    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: geminiMessages,
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.9,
            maxOutputTokens: 800,
          }
        }),
      }
    );

    if (!response.ok) {
      console.error('Gemini API error:', response.status, await response.text());
      return res.status(503).json({ error: 'AI service temporarily unavailable' });
    }

    const result = await response.json();
    const chatResponse = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!chatResponse) {
      return res.status(500).json({ error: 'No response generated' });
    }

    return res.status(200).json({ response: chatResponse.trim() });

  } catch (error) {
    console.error('Chat API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

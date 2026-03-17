import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getCORSHeaders, checkRateLimit, sanitizeString, sanitizePhoneNumber, getSupabaseConfig } from './_lib/utils';

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

  // Rate limiting
  const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  const rateLimitResult = checkRateLimit(String(clientIP), '/api/leads', 'API_HEAVY');
  
  if (!rateLimitResult.allowed) {
    return res.status(429).json({
      error: 'Rate limit exceeded',
      message: 'Terlalu banyak permintaan. Silakan coba lagi nanti.',
      retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
    });
  }

  const { url: supabaseUrl, key: supabaseKey } = getSupabaseConfig();

  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase configuration missing');
    return res.status(500).json({ error: 'Database configuration error' });
  }

  // GET - Fetch leads (admin)
  if (req.method === 'GET') {
    try {
      const page = parseInt(req.query?.page || '1');
      const limit = parseInt(req.query?.limit || '50');
      const offset = (page - 1) * limit;

      console.log('📊 Fetching leads:', { page, limit, offset });

      const response = await fetch(`${supabaseUrl}/rest/v1/lead_captures?select=*&order=created_at.desc&limit=${limit}&offset=${offset}`, {
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Supabase fetch error:', response.status, errorText);
        return res.status(500).json({
          error: 'Failed to fetch leads',
          details: errorText
        });
      }

      const leads = await response.json();

      // Get total count
      const countResponse = await fetch(`${supabaseUrl}/rest/v1/lead_captures?select=id&count=exact`, {
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey,
          'Content-Type': 'application/json',
        },
      });

      const totalCount = countResponse.headers.get('content-range')?.split('/')[1] || '0';

      console.log(`✅ Fetched ${leads.length} leads (total: ${totalCount})`);

      return res.status(200).json({
        leads,
        pagination: {
          page,
          limit,
          total: parseInt(totalCount),
          totalPages: Math.ceil(parseInt(totalCount) / limit)
        }
      });

    } catch (error) {
      console.error('Get leads error:', error);
      return res.status(500).json({ error: 'Internal server error during lead fetch' });
    }
  }

  // POST - Capture lead
  if (req.method === 'POST') {
    try {
      const { user_intent, whatsapp, ip_address, user_agent, page_url, referrer, session_id } = req.body;

      // Sanitize and validate inputs
      let sanitizedIntent, sanitizedWhatsapp, sanitizedPageUrl, sanitizedReferrer, sanitizedSessionId;

      try {
        sanitizedIntent = sanitizeString(user_intent, 500);
        sanitizedWhatsapp = sanitizePhoneNumber(whatsapp);
        sanitizedPageUrl = sanitizeString(page_url || '', 500);
        sanitizedReferrer = sanitizeString(referrer || '', 500);
        sanitizedSessionId = sanitizeString(session_id || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, 100);
      } catch (validationError: any) {
        return res.status(400).json({
          error: `Validation error: ${validationError.message}`
        });
      }

      // Validate required fields
      if (!sanitizedIntent || !sanitizedWhatsapp) {
        return res.status(400).json({
          error: 'Missing required fields: user_intent and whatsapp'
        });
      }

      // Prepare lead data
      const leadData = {
        user_intent: sanitizedIntent,
        whatsapp: sanitizedWhatsapp,
        ip_address: sanitizeString(ip_address || String(clientIP) || 'unknown', 45),
        user_agent: sanitizeString(user_agent || req.headers.get('user-agent') || 'unknown', 500),
        page_url: sanitizedPageUrl,
        referrer: sanitizedReferrer,
        session_id: sanitizedSessionId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('📝 Capturing lead:', {
        intent: user_intent,
        whatsapp: leadData.whatsapp.substring(0, 3) + '***' + leadData.whatsapp.substring(leadData.whatsapp.length - 3),
        session_id: leadData.session_id
      });

      // Insert to Supabase
      const response = await fetch(`${supabaseUrl}/rest/v1/lead_captures`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(leadData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Supabase insert error:', response.status, errorText);
        return res.status(500).json({
          error: 'Failed to save lead data',
          details: errorText
        });
      }

      console.log('✅ Lead captured successfully');

      return res.status(200).json({
        success: true,
        message: 'Lead captured successfully',
        session_id: leadData.session_id
      });

    } catch (error) {
      console.error('Lead capture error:', error);
      return res.status(500).json({ error: 'Internal server error during lead capture' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

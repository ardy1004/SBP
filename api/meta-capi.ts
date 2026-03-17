/**
 * Meta Conversions API Server-Side Endpoint
 * 
 * This API route handles server-side events sent to Meta's Conversions API.
 * It NEVER connects to CAPI from the browser - only this server endpoint does.
 * 
 * Endpoint: POST /api/meta-capi
 * 
 * Test Event: GET /api/meta-capi?test=1 sends a test event to Meta Event Manager
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

// Meta Pixel ID - using new active pixel
const META_PIXEL_ID = '765761826603843';

// Graph API version
const GRAPH_API_VERSION = 'v18.0';

/**
 * SHA-256 hash function for user_data hashing
 */
async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message.toLowerCase().trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Hash user_data fields (email, phone) for CAPI
 */
async function hashUserData(userData: Record<string, any>): Promise<Record<string, string>> {
  const hashed: Record<string, string> = {};
  
  if (userData.email) {
    hashed.em = await sha256(userData.email);
  }
  
  if (userData.phone) {
    hashed.ph = await sha256(userData.phone.replace(/\D/g, ''));
  }
  
  if (userData.first_name) {
    hashed.fn = await sha256(userData.first_name);
  }
  
  if (userData.last_name) {
    hashed.ln = await sha256(userData.last_name);
  }
  
  if (userData.fbc) hashed.fbc = userData.fbc;
  if (userData.fbp) hashed.fbp = userData.fbp;
  if (userData.city) hashed.ct = await sha256(userData.city);
  if (userData.country) hashed.co = await sha256(userData.country);
  
  return hashed;
}

interface CapiEvent {
  event_name: string;
  event_id?: string;
  event_time: number;
  action_source: string;
  custom_data?: Record<string, any>;
  user_data?: {
    fbc?: string;
    fbp?: string;
    email?: string;
    phone?: string;
    first_name?: string;
    last_name?: string;
    city?: string;
    country?: string;
  };
}

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  // Handle test event request
  if (request.method === 'GET' && request.query.test === '1') {
    return await sendTestEvent(response);
  }
  
  // Only allow POST requests
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  // Get access token from environment
  const accessToken = process.env.META_CAPI_TOKEN;
  
  if (!accessToken) {
    console.error('META_CAPI_TOKEN not configured');
    return response.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const body = request.body as CapiEvent;
    
    // Validate required fields
    if (!body.event_name) {
      return response.status(400).json({ error: 'Missing event_name' });
    }

    // Prepare the event payload for Meta's Conversions API
    const hashedUserData = await hashUserData(body.user_data || {});
    
    const eventPayload = {
      data: [
        {
          event_name: body.event_name,
          event_time: body.event_time || Math.floor(Date.now() / 1000),
          action_source: body.action_source || 'WEBSITE',
          event_id: body.event_id,
          custom_data: body.custom_data || {},
          user_data: hashedUserData,
        }
      ],
    };

    // Send to Meta's Conversions API
    const metaUrl = `https://graph.facebook.com/${GRAPH_API_VERSION}/${META_PIXEL_ID}/events?access_token=${accessToken}`;
    
    const metaResponse = await fetch(metaUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventPayload),
    });

    const metaResult = await metaResponse.json();

    if (!metaResponse.ok) {
      console.error('Meta CAPI error:', metaResult);
      return response.status(metaResponse.status).json({ 
        error: 'Failed to send to Meta',
        details: metaResult 
      });
    }

    console.log('CAPI event sent successfully:', {
      eventName: body.event_name,
      eventId: body.event_id,
      result: metaResult
    });

    return response.status(200).json({ 
      success: true, 
      event_id: body.event_id,
      fbtrace_id: metaResult.fbtrace_id 
    });

  } catch (error) {
    console.error('Error in CAPI handler:', error);
    return response.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Send a test event to Meta Event Manager for testing purposes
 */
async function sendTestEvent(response: VercelResponse) {
  const accessToken = process.env.META_CAPI_TOKEN;
  
  if (!accessToken) {
    return response.status(500).json({ error: 'META_CAPI_TOKEN not configured' });
  }

  const testEventId = `test-${Date.now()}`;
  
  const eventPayload = {
    data: [
      {
        event_name: 'TestEvent',
        event_time: Math.floor(Date.now() / 1000),
        action_source: 'WEBSITE',
        event_id: testEventId,
        custom_data: {
          test_key: 'test_value'
        },
        user_data: {
          fbp: 'fb.1.1234567890.abcdefghij',
          fbc: 'fb.1.1234567890.abcdefghij'
        }
      }
    ],
  };

  const metaUrl = `https://graph.facebook.com/${GRAPH_API_VERSION}/${META_PIXEL_ID}/events?access_token=${accessToken}`;
  
  try {
    const metaResponse = await fetch(metaUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventPayload),
    });

    const metaResult = await metaResponse.json();
    
    if (!metaResponse.ok) {
      console.error('Test event error:', metaResult);
      return response.status(metaResponse.status).json({ 
        error: 'Failed to send test event',
        details: metaResult 
      });
    }

    return response.status(200).json({ 
      success: true, 
      message: 'Test event sent successfully',
      test_event_id: testEventId,
      fbtrace_id: metaResult.fbtrace_id,
      instructions: 'Check Meta Event Manager → Test Events to verify'
    });
  } catch (error) {
    console.error('Test event error:', error);
    return response.status(500).json({ error: 'Failed to send test event' });
  }
}

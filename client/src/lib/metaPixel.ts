/**
 * Meta Pixel and Conversions API (CAPI) Integration
 * 
 * This module provides unified tracking that fires events through both:
 * 1. Meta Pixel (browser-side) via fbq()
 * 2. Meta Conversions API (server-side) via /api/meta-capi
 * 
 * Both use the SAME event_id for deduplication.
 */

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
  }
}

// Meta Pixel ID - matches active pixel in Meta Events Manager
const META_PIXEL_ID = '765761826603843';

/**
 * Generate a unique event ID for deduplication between Pixel and CAPI
 * Format: timestamp-random to ensure uniqueness
 */
export function generateEventId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Get current Unix timestamp in seconds (required by CAPI)
 */
export function getEventTime(): number {
  return Math.floor(Date.now() / 1000);
}

/**
 * Send event to Meta Conversions API (server-side)
 */
export async function sendToCapi(
  eventName: string,
  options: {
    eventId?: string;
    customData?: Record<string, any>;
    userData?: {
      fbc?: string;
      fbp?: string;
      email?: string;
      phone?: string;
      first_name?: string;
      last_name?: string;
    };
  } = {}
): Promise<boolean> {
  const { eventId, customData, userData } = options;
  
  try {
    const response = await fetch('/api/meta-capi', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event_name: eventName,
        event_id: eventId,
        event_time: getEventTime(),
        custom_data: customData,
        user_data: userData,
      }),
    });

    if (!response.ok) {
      console.error('CAPI request failed:', await response.text());
      return false;
    }

    const result = await response.json();
    console.log('CAPI event sent:', { eventName, eventId, result: result.success });
    return true;
  } catch (error) {
    console.error('Error sending to CAPI:', error);
    return false;
  }
}

/**
 * Fire Meta Pixel event (browser-side)
 */
function firePixel(eventName: string, params: Record<string, any> = {}, options: { eventId?: string } = {}): void {
  if (typeof window === 'undefined' || !window.fbq) {
    console.warn('Meta Pixel not initialized');
    return;
  }

  // Add event_id to params for deduplication
  const paramsWithEventId = options.eventId 
    ? { ...params, event_id: options.eventId }
    : params;

  // Fire Pixel event - trackCustom or track based on event type
  // The Pixel ID is already set in index.html via fbq('init', ...)
  window.fbq!('track', eventName, paramsWithEventId);
}

/**
 * Track ViewContent event
 * Used when user views a property listing
 */
export function trackViewContent(params: {
  contentId?: string | undefined;
  contentName?: string | undefined;
  contentType?: string | undefined;
  value?: number | undefined;
  currency?: string | undefined;
} = {}): string {
  const eventId = generateEventId();
  const { contentId, contentName, contentType = 'real_estate', value, currency = 'IDR' } = params;

  // Get FBP and FBC for CAPI
  const fbp = getFBP();
  const fbc = getFBC();

  // Browser-side: Fire Pixel
  firePixel('ViewContent', {
    content_ids: contentId ? [contentId] : undefined,
    content_name: contentName,
    content_type: contentType,
    value: value,
    currency: currency,
  }, { eventId });

  // Server-side: Send to CAPI
  sendToCapi('ViewContent', {
    eventId,
    customData: {
      content_ids: contentId ? [contentId] : undefined,
      content_name: contentName,
      content_type: contentType,
      value: value,
      currency: currency,
    },
    userData: { fbp, fbc },
  });

  console.log('ViewContent tracked:', { eventId, contentId, contentName });
  return eventId;
}

/**
 * Track PageView event
 * Used on initial page load
 */
export function trackPageView(): string {
  const eventId = generateEventId();

  // Get FBP and FBC for CAPI
  const fbp = getFBP();
  const fbc = getFBC();

  // Browser-side: Fire Pixel
  firePixel('PageView', {}, { eventId });

  // Server-side: Send to CAPI
  sendToCapi('PageView', {
    eventId,
    userData: { fbp, fbc },
  });

  console.log('PageView tracked:', { eventId });
  return eventId;
}

/**
 * Track QualifiedLead event
 * Used when user submits a lead/inquiry form
 */
export function trackQualifiedLead(params: {
  value?: number | undefined;
  currency?: string | undefined;
  contentName?: string | undefined;
  leadId?: string | undefined;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
} = {}): string {
  const eventId = generateEventId();
  const { value, currency = 'IDR', contentName, leadId, email, phone, firstName, lastName } = params;

  // Get FBP and FBC for CAPI
  const fbp = getFBP();
  const fbc = getFBC();

  // Browser-side: Fire Pixel
  firePixel('QualifiedLead', {
    value: value,
    currency: currency,
    content_name: contentName,
    lead_id: leadId,
  }, { eventId });

  // Server-side: Send to CAPI
  sendToCapi('QualifiedLead', {
    eventId,
    customData: {
      value: value,
      currency: currency,
      content_name: contentName,
      lead_id: leadId,
    },
    userData: { fbp, fbc, email, phone, first_name: firstName, last_name: lastName },
  });

  console.log('QualifiedLead tracked:', { eventId, value, contentName });
  return eventId;
}

/**
 * Track Lead event (alternative for lead forms)
 */
export function trackLead(params: {
  value?: number | undefined;
  currency?: string | undefined;
  email?: string;
  phone?: string;
} = {}): string {
  const eventId = generateEventId();
  const { value, currency = 'IDR', email, phone } = params;

  // Get FBP and FBC for CAPI
  const fbp = getFBP();
  const fbc = getFBC();

  // Browser-side: Fire Pixel
  firePixel('Lead', {
    value: value,
    currency: currency,
  }, { eventId });

  // Server-side: Send to CAPI
  sendToCapi('Lead', {
    eventId,
    customData: {
      value: value,
      currency: currency,
    },
    userData: { fbp, fbc, email, phone },
  });

  console.log('Lead tracked:', { eventId, value });
  return eventId;
}

/**
 * Track Contact event (when user clicks WhatsApp/contact)
 */
export function trackContact(params: {
  contentName?: string | undefined;
  email?: string;
  phone?: string;
} = {}): string {
  const eventId = generateEventId();
  const { contentName, email, phone } = params;

  // Get FBP and FBC for CAPI
  const fbp = getFBP();
  const fbc = getFBC();

  // Browser-side: Fire Pixel
  firePixel('Contact', {
    content_name: contentName,
  }, { eventId });

  // Server-side: Send to CAPI
  sendToCapi('Contact', {
    eventId,
    customData: {
      content_name: contentName,
    },
    userData: { fbp, fbc, email, phone },
  });

  console.log('Contact tracked:', { eventId, contentName });
  return eventId;
}

/**
 * Initialize Meta Pixel with new Pixel ID
 * This is called once on app initialization
 */
export function initMetaPixel(): void {
  if (typeof window === 'undefined') return;

  // The Pixel is already initialized in index.html
  // This function is for additional configuration if needed
  console.log('Meta Pixel tracking initialized');
}

/**
 * Get FBC (Facebook Click ID) from URL parameters
 */
export function getFBC(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('fbclid') 
    ? `fb.1.${Date.now()}.${urlParams.get('fbclid')}`
    : undefined;
}

/**
 * Get FBP (Facebook Browser ID) from cookies
 */
export function getFBP(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === '_fbp') return value;
  }
  return undefined;
}

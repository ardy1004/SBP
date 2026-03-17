// Google Analytics 4 Tracking
import { trackContact, trackLead, generateEventId, getFBP, getFBC } from '@/lib/metaPixel';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
  }
}

export const GA4_CONFIG = {
  measurementId: 'G-M4YC1Z6VNC',
  events: {
    whatsapp_click: {
      event_name: 'whatsapp_click',
      category: 'engagement',
      label: 'CTA WhatsApp Landing Page',
      mark_as_conversion: true
    }
  }
};

export const META_PIXEL_CONFIG = {
  pixelId: '765761826603843',
  events: {
    on_page_load: 'PageView',
    on_featured_properties_visible: {
      event: 'ViewContent',
      params: {
        content_type: 'real_estate',
        content_name: 'Landing Page Properti Yogyakarta'
      }
    },
    on_whatsapp_click: 'Contact',
    on_whatsapp_redirect: 'Lead'
  }
};

// GA4 Tracking Functions
export const ga4 = {
  // Initialize GA4
  init: () => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', GA4_CONFIG.measurementId);
    }
  },

  // Track custom event
  event: (eventName: string, parameters: Record<string, any> = {}) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, {
        ...parameters,
        custom_map: { dimension1: 'landing_page' }
      });
    }
  },

  // Track WhatsApp click
  trackWhatsAppClick: (source: string = 'landing_page') => {
    ga4.event('whatsapp_click', {
      category: 'engagement',
      label: `CTA WhatsApp ${source}`,
      value: 1
    });
  }
};

// Meta Pixel Tracking Functions
export const metaPixel = {
  // Initialize Meta Pixel - Only call once globally
  init: () => {
    // Meta Pixel is already initialized globally in index.html
    console.log('Meta Pixel should only be initialized once globally. Initialization skipped.');
  },

  // Track standard event using Meta Pixel
  track: (eventName: string, parameters: Record<string, any> = {}) => {
    if (typeof window !== 'undefined' && window.fbq) {
      // Ensure currency and value are properly formatted for Meta Pixel
      const formattedParams = { ...parameters };
      if (formattedParams.value && typeof formattedParams.value === 'string') {
        formattedParams.value = parseFloat(formattedParams.value) || 0;
      }
      if (formattedParams.currency) {
        formattedParams.currency = formattedParams.currency.toUpperCase();
      }

      window.fbq('track', eventName, formattedParams);
    }
  },

  // Track custom event using Meta Pixel
  trackCustom: (eventName: string, parameters: Record<string, any> = {}) => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('trackCustom', eventName, parameters);
    }
  },

  // Track page view using Meta Pixel
  trackPageView: () => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'PageView');
    }
  },

  // Track featured properties view
  trackFeaturedPropertiesView: () => {
    // Use ViewCategory for sections/listings
    metaPixel.track('ViewCategory', {
      content_category: 'real_estate_listing'
    });
  },

  // Track WhatsApp click
  trackWhatsAppClick: () => {
    metaPixel.track('Contact');
    metaPixel.track('Lead');
  }
};

// Combined tracking for WhatsApp clicks
export const trackWhatsAppConversion = (source: string = 'landing_page') => {
  // Generate unique event ID for deduplication
  const eventId = generateEventId();
  const fbp = getFBP();
  const fbc = getFBC();
  
  // Track GA4
  ga4.trackWhatsAppClick(source);
  
  // Track browser-side Meta Pixel
  metaPixel.trackWhatsAppClick();
  
  // Track server-side CAPI (both Contact and Lead events)
  trackContact({ contentName: source });
  trackLead({});
  
  // Log for debugging
  console.log('WhatsApp conversion tracked:', { source, eventId, timestamp: new Date().toISOString() });
};

// Utility to check if tracking is available
export const isTrackingAvailable = () => {
  return typeof window !== 'undefined' && (window.gtag || window.fbq);
};

// Initialize all tracking
export const initTracking = () => {
  if (typeof window !== 'undefined') {
    // GA4 - Initialize on each page/component load
    if (window.gtag) {
      ga4.init();
    }

    // Meta Pixel - Already initialized globally in index.html
    // DO NOT call metaPixel.init() here as it causes duplicate initialization
    // The Meta Pixel script in index.html already handles:
    // - fbq('init', '765761826603843')
    // - fbq('track', 'PageView')
  }
};

// Re-export for backward compatibility
export { initTracking as default };
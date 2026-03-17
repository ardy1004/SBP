/**
 * Application Configuration
 * 
 * Centralized configuration for the application.
 * All sensitive values should be loaded from environment variables.
 */

// Helper to get env variable with fallback
const getEnvVar = (key: string, fallback: string): string => {
  const value = import.meta.env[key];
  return value || fallback;
};

// WhatsApp Configuration
export const WHATSAPP_CONFIG = {
  /**
   * Primary WhatsApp number for customer service
   * Format: 6281391278889 (without +)
   */
  NUMBER: getEnvVar('VITE_WHATSAPP_NUMBER', '6281391278889'),
  
  /**
   * Formatted WhatsApp number for display
   * Format: +62 813-9127-8889
   */
  NUMBER_DISPLAY: getEnvVar('VITE_WHATSAPP_DISPLAY', '+62 813-9127-8889'),
  
  /**
   * WhatsApp number with dashes for display in agreement documents
   * Format: 0813-9127-8889
   */
  NUMBER_AGREEMENT: getEnvVar('VITE_WHATSAPP_AGREEMENT', '0813-9127-8889'),
  
  /**
   * Default message for WhatsApp CTA
   */
  DEFAULT_MESSAGE: 'Halo, saya ingin konsultasi properti',
  
  /**
   * Generate WhatsApp link with optional custom message
   */
  getLink: (message?: string): string => {
    const encodedMessage = encodeURIComponent(message || WHATSAPP_CONFIG.DEFAULT_MESSAGE);
    return `https://wa.me/${WHATSAPP_CONFIG.NUMBER}?text=${encodedMessage}`;
  }
};

// Company Information
export const COMPANY_CONFIG = {
  NAME: getEnvVar('VITE_COMPANY_NAME', 'Salam Bumi Property'),
  SHORT_NAME: getEnvVar('VITE_COMPANY_SHORT_NAME', 'SBP'),
  EMAIL: getEnvVar('VITE_COMPANY_EMAIL', 'salambumiproperty@gmail.com'),
  WEBSITE: getEnvVar('VITE_COMPANY_WEBSITE', 'salambumi.xyz'),
  ADDRESS: getEnvVar('VITE_COMPANY_ADDRESS', 'Jl Pajajaran, Catur Tunggal, Depok, Sleman'),
  
  // Agent Information
  AGENT: {
    NAME: getEnvVar('VITE_AGENT_NAME', 'Monica Vera S'),
    AVATAR: getEnvVar('VITE_AGENT_AVATAR', 'https://images.salambumi.xyz/monic%20sbp.webp'),
  }
};

// API Configuration
export const API_CONFIG = {
  BASE_URL: getEnvVar('VITE_API_BASE_URL', ''),
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
};

// Feature Flags
export const FEATURE_FLAGS = {
  ENABLE_ANALYTICS: getEnvVar('VITE_ENABLE_ANALYTICS', 'true') === 'true',
  ENABLE_META_PIXEL: getEnvVar('VITE_ENABLE_META_PIXEL', 'true') === 'true',
  ENABLE_WHATSAPP_TRACKING: getEnvVar('VITE_ENABLE_WHATSAPP_TRACKING', 'true') === 'true',
};

// Image Configuration
export const IMAGE_CONFIG = {
  PLACEHOLDER_BASE_URL: 'https://images.unsplash.com',
  DEFAULT_QUALITY: 80,
  MAX_UPLOAD_SIZE: 5 * 1024 * 1024, // 5MB
  SUPPORTED_FORMATS: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
};

// Property Configuration
export const PROPERTY_CONFIG = {
  MAX_IMAGES: 10,
  DEFAULT_CURRENCY: 'IDR',
  COMMISSION_RATE: 0.03, // 3%
};

// Validate required configuration in production
if (import.meta.env.PROD) {
  const requiredVars = [
    'VITE_WHATSAPP_NUMBER',
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
  ];
  
  const missing = requiredVars.filter(key => !import.meta.env[key]);
  
  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing);
  }
}

export default {
  WHATSAPP: WHATSAPP_CONFIG,
  COMPANY: COMPANY_CONFIG,
  API: API_CONFIG,
  FEATURES: FEATURE_FLAGS,
  IMAGES: IMAGE_CONFIG,
  PROPERTY: PROPERTY_CONFIG,
};
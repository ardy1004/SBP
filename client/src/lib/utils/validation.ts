// Input validation and sanitization utilities

// Sanitize text input - remove dangerous characters
export function sanitizeText(input: string): string {
  if (!input || typeof input !== 'string') return '';

  return input
    .trim()
    // Remove null bytes and other dangerous characters
    .replace(/[\x00-\x1F\x7F-\x9F]/g, '')
    // Remove potential script tags
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Limit length to prevent abuse
    .substring(0, 10000);
}

// Sanitize email input
export function sanitizeEmail(email: string): string {
  if (!email || typeof email !== 'string') return '';

  return email
    .trim()
    .toLowerCase()
    // Remove dangerous characters
    .replace(/[<>'"&\\]/g, '')
    .substring(0, 254); // RFC 5321 limit
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

// Sanitize phone number
export function sanitizePhone(phone: string): string {
  if (!phone || typeof phone !== 'string') return '';

  return phone
    .trim()
    // Remove all non-digit characters except + at the beginning
    .replace(/(?!^)\+/g, '') // Remove + not at start
    .replace(/[^\d+]/g, '') // Remove non-digits except +
    .substring(0, 20); // Reasonable length limit
}

// Validate phone number (Indonesian format)
export function isValidPhone(phone: string): boolean {
  // Indonesian phone number patterns
  const phoneRegex = /^(\+62|62|0)[2-9][0-9]{7,11}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

// Sanitize property code/listing
export function sanitizePropertyCode(code: string): string {
  if (!code || typeof code !== 'string') return '';

  return code
    .trim()
    .toUpperCase()
    // Allow alphanumeric, dots, and hyphens
    .replace(/[^A-Z0-9.\-]/g, '')
    .substring(0, 50);
}

// Sanitize property title
export function sanitizePropertyTitle(title: string): string {
  if (!title || typeof title !== 'string') return '';

  return title
    .trim()
    // Remove excessive whitespace
    .replace(/\s+/g, ' ')
    // Remove dangerous characters but allow common punctuation
    .replace(/[<>'"&\\]/g, '')
    .substring(0, 200); // Reasonable title length
}

// Sanitize numeric input
export function sanitizeNumber(input: string | number): number | null {
  if (input === null || input === undefined) return null;

  const num = typeof input === 'string' ? parseFloat(input) : input;

  if (isNaN(num) || !isFinite(num)) return null;

  // Reasonable bounds for property data
  if (num < 0 || num > 1000000000000) return null;

  return num;
}

// Validate property price
export function isValidPrice(price: number): boolean {
  return price > 0 && price <= 100000000000 && Number.isFinite(price);
}

// Validate property area
export function isValidArea(area: number): boolean {
  return area > 0 && area <= 100000 && Number.isFinite(area);
}

// Sanitize search query
export function sanitizeSearchQuery(query: string): string {
  if (!query || typeof query !== 'string') return '';

  return query
    .trim()
    // Remove excessive whitespace
    .replace(/\s+/g, ' ')
    // Remove dangerous characters
    .replace(/[<>'"&\\]/g, '')
    .substring(0, 100); // Reasonable search length
}

// Validate required fields
export function validateRequired(value: any, fieldName: string): string | null {
  if (value === null || value === undefined || value === '') {
    return `${fieldName} wajib diisi`;
  }

  if (typeof value === 'string' && value.trim() === '') {
    return `${fieldName} wajib diisi`;
  }

  return null;
}

// Validate property data
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validatePropertyData(data: any): ValidationResult {
  const errors: Record<string, string> = {};

  // Required fields
  const titleError = validateRequired(data.judulProperti, 'Judul Properti');
  if (titleError) errors.judulProperti = titleError;

  const typeError = validateRequired(data.jenisProperti, 'Jenis Properti');
  if (typeError) errors.jenisProperti = typeError;

  const locationError = validateRequired(data.kabupaten, 'Kabupaten');
  if (locationError) errors.kabupaten = locationError;

  // Price validation
  if (data.hargaProperti) {
    const price = sanitizeNumber(data.hargaProperti);
    if (price === null || !isValidPrice(price)) {
      errors.hargaProperti = 'Harga tidak valid';
    }
  }

  // Area validation
  if (data.luasTanah) {
    const area = sanitizeNumber(data.luasTanah);
    if (area === null || !isValidArea(area)) {
      errors.luasTanah = 'Luas tanah tidak valid';
    }
  }

  if (data.luasBangunan) {
    const area = sanitizeNumber(data.luasBangunan);
    if (area === null || !isValidArea(area)) {
      errors.luasBangunan = 'Luas bangunan tidak valid';
    }
  }

  // Email validation
  if (data.ownerContact && !isValidEmail(data.ownerContact)) {
    errors.ownerContact = 'Format email tidak valid';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
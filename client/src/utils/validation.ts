/**
 * Centralized validation utilities for consistent validation across the application
 */

/**
 * Email validation
 */
export function validateEmail(email: string): { isValid: boolean; error?: string } {
  if (!email || email.trim() === '') {
    return { isValid: false, error: 'Email wajib diisi' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Format email tidak valid' };
  }

  return { isValid: true };
}

/**
 * Phone number validation (Indonesian format)
 */
export function validatePhone(phone: string): { isValid: boolean; error?: string } {
  if (!phone || phone.trim() === '') {
    return { isValid: false, error: 'Nomor telepon wajib diisi' };
  }

  // Remove all non-digit characters
  const cleanPhone = phone.replace(/\D/g, '');

  // Indonesian phone number patterns
  const indonesianPhoneRegex = /^(\+62|62|0)[8-9][0-9]{7,11}$/;

  if (!indonesianPhoneRegex.test(cleanPhone)) {
    return { isValid: false, error: 'Format nomor telepon Indonesia tidak valid' };
  }

  return { isValid: true };
}

/**
 * Required field validation
 */
export function validateRequired(value: any, fieldName: string = 'Field'): { isValid: boolean; error?: string } {
  if (value === null || value === undefined) {
    return { isValid: false, error: `${fieldName} wajib diisi` };
  }

  if (typeof value === 'string' && value.trim() === '') {
    return { isValid: false, error: `${fieldName} wajib diisi` };
  }

  if (Array.isArray(value) && value.length === 0) {
    return { isValid: false, error: `${fieldName} wajib diisi` };
  }

  return { isValid: true };
}

/**
 * Minimum length validation
 */
export function validateMinLength(
  value: string,
  minLength: number,
  fieldName: string = 'Field'
): { isValid: boolean; error?: string } {
  if (!value || value.length < minLength) {
    return { isValid: false, error: `${fieldName} minimal ${minLength} karakter` };
  }

  return { isValid: true };
}

/**
 * Maximum length validation
 */
export function validateMaxLength(
  value: string,
  maxLength: number,
  fieldName: string = 'Field'
): { isValid: boolean; error?: string } {
  if (value && value.length > maxLength) {
    return { isValid: false, error: `${fieldName} maksimal ${maxLength} karakter` };
  }

  return { isValid: true };
}

/**
 * Numeric validation
 */
export function validateNumeric(value: string, fieldName: string = 'Field'): { isValid: boolean; error?: string } {
  if (!value || value.trim() === '') {
    return { isValid: false, error: `${fieldName} wajib diisi` };
  }

  const num = parseFloat(value);
  if (isNaN(num)) {
    return { isValid: false, error: `${fieldName} harus berupa angka` };
  }

  return { isValid: true };
}

/**
 * Positive number validation
 */
export function validatePositiveNumber(value: string, fieldName: string = 'Field'): { isValid: boolean; error?: string } {
  const numericResult = validateNumeric(value, fieldName);
  if (!numericResult.isValid) {
    return numericResult;
  }

  const num = parseFloat(value);
  if (num <= 0) {
    return { isValid: false, error: `${fieldName} harus lebih besar dari 0` };
  }

  return { isValid: true };
}

/**
 * Price validation
 */
export function validatePrice(price: string): { isValid: boolean; error?: string } {
  const result = validatePositiveNumber(price, 'Harga');
  if (!result.isValid) {
    return result;
  }

  const num = parseFloat(price);
  if (num < 1000000) { // Minimum 1 million IDR
    return { isValid: false, error: 'Harga minimal Rp 1.000.000' };
  }

  return { isValid: true };
}

/**
 * Area validation
 */
export function validateArea(area: string): { isValid: boolean; error?: string } {
  const result = validatePositiveNumber(area, 'Luas');
  if (!result.isValid) {
    return result;
  }

  const num = parseFloat(area);
  if (num < 1) {
    return { isValid: false, error: 'Luas minimal 1 m²' };
  }

  if (num > 100000) { // Maximum 100 hectares
    return { isValid: false, error: 'Luas maksimal 100.000 m²' };
  }

  return { isValid: true };
}

/**
 * Property title validation
 */
export function validatePropertyTitle(title: string): { isValid: boolean; error?: string } {
  const requiredResult = validateRequired(title, 'Judul properti');
  if (!requiredResult.isValid) {
    return requiredResult;
  }

  const minLengthResult = validateMinLength(title, 10, 'Judul properti');
  if (!minLengthResult.isValid) {
    return minLengthResult;
  }

  const maxLengthResult = validateMaxLength(title, 200, 'Judul properti');
  if (!maxLengthResult.isValid) {
    return maxLengthResult;
  }

  return { isValid: true };
}

/**
 * Property description validation
 */
export function validatePropertyDescription(description: string): { isValid: boolean; error?: string } {
  const requiredResult = validateRequired(description, 'Deskripsi properti');
  if (!requiredResult.isValid) {
    return requiredResult;
  }

  const minLengthResult = validateMinLength(description, 50, 'Deskripsi properti');
  if (!minLengthResult.isValid) {
    return minLengthResult;
  }

  const maxLengthResult = validateMaxLength(description, 5000, 'Deskripsi properti');
  if (!maxLengthResult.isValid) {
    return maxLengthResult;
  }

  return { isValid: true };
}

/**
 * URL validation
 */
export function validateUrl(url: string, fieldName: string = 'URL'): { isValid: boolean; error?: string } {
  if (!url || url.trim() === '') {
    return { isValid: true }; // URL is optional
  }

  try {
    new URL(url);
    return { isValid: true };
  } catch {
    return { isValid: false, error: `${fieldName} harus berupa URL yang valid` };
  }
}

/**
 * File size validation
 */
export function validateFileSize(file: File, maxSizeInMB: number = 5): { isValid: boolean; error?: string } {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

  if (file.size > maxSizeInBytes) {
    return {
      isValid: false,
      error: `Ukuran file maksimal ${maxSizeInMB}MB. File Anda ${Math.round(file.size / (1024 * 1024))}MB`
    };
  }

  return { isValid: true };
}

/**
 * File type validation
 */
export function validateFileType(
  file: File,
  allowedTypes: string[],
  fieldName: string = 'File'
): { isValid: boolean; error?: string } {
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `${fieldName} harus berupa: ${allowedTypes.join(', ')}`
    };
  }

  return { isValid: true };
}

/**
 * Combined validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Validate form data with multiple fields
 */
export function validateForm(
  data: Record<string, any>,
  rules: Record<string, (value: any) => { isValid: boolean; error?: string }>
): ValidationResult {
  const errors: Record<string, string> = {};
  let isValid = true;

  for (const [field, rule] of Object.entries(rules)) {
    const result = rule(data[field]);
    if (!result.isValid && result.error) {
      errors[field] = result.error;
      isValid = false;
    }
  }

  return { isValid, errors };
}
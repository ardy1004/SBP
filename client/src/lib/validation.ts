/**
 * Input Validation Utilities
 * 
 * Provides comprehensive validation functions for forms and inputs.
 */

import { logger } from './logger';

// Validation result type
export interface ValidationResult {
  valid: boolean;
  message?: string;
  field?: string;
}

// Validator function type
export type Validator = (value: any) => ValidationResult;

// Validation rules
export interface ValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  email?: boolean;
  phone?: boolean;
  numeric?: boolean;
  alphanumeric?: boolean;
  custom?: (value: any) => boolean;
  customMessage?: string;
}

/**
 * Validate a single field
 */
export function validateField(value: any, rules: ValidationRules, fieldName?: string): ValidationResult {
  // Required check
  if (rules.required && (value === undefined || value === null || value === '')) {
    return {
      valid: false,
      message: `${fieldName || 'Field'} wajib diisi`,
      field: fieldName,
    };
  }

  // Skip other validations if value is empty and not required
  if (!value && !rules.required) {
    return { valid: true };
  }

  const strValue = String(value);

  // Min length
  if (rules.minLength && strValue.length < rules.minLength) {
    return {
      valid: false,
      message: `${fieldName || 'Field'} minimal ${rules.minLength} karakter`,
      field: fieldName,
    };
  }

  // Max length
  if (rules.maxLength && strValue.length > rules.maxLength) {
    return {
      valid: false,
      message: `${fieldName || 'Field'} maksimal ${rules.maxLength} karakter`,
      field: fieldName,
    };
  }

  // Min value (for numbers)
  if (rules.min !== undefined && Number(value) < rules.min) {
    return {
      valid: false,
      message: `${fieldName || 'Field'} minimal ${rules.min}`,
      field: fieldName,
    };
  }

  // Max value (for numbers)
  if (rules.max !== undefined && Number(value) > rules.max) {
    return {
      valid: false,
      message: `${fieldName || 'Field'} maksimal ${rules.max}`,
      field: fieldName,
    };
  }

  // Pattern match
  if (rules.pattern && !rules.pattern.test(strValue)) {
    return {
      valid: false,
      message: `${fieldName || 'Field'} format tidak valid`,
      field: fieldName,
    };
  }

  // Email validation
  if (rules.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(strValue)) {
      return {
        valid: false,
        message: `${fieldName || 'Email'} format tidak valid`,
        field: fieldName,
      };
    }
  }

  // Phone validation (Indonesian)
  if (rules.phone) {
    const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,11}$/;
    if (!phoneRegex.test(strValue.replace(/\s/g, ''))) {
      return {
        valid: false,
        message: `${fieldName || 'Nomor telepon'} format tidak valid`,
        field: fieldName,
      };
    }
  }

  // Numeric validation
  if (rules.numeric && isNaN(Number(value))) {
    return {
      valid: false,
      message: `${fieldName || 'Field'} harus berupa angka`,
      field: fieldName,
    };
  }

  // Alphanumeric validation
  if (rules.alphanumeric) {
    const alphaNumRegex = /^[a-zA-Z0-9]+$/;
    if (!alphaNumRegex.test(strValue)) {
      return {
        valid: false,
        message: `${fieldName || 'Field'} hanya boleh huruf dan angka`,
        field: fieldName,
      };
    }
  }

  // Custom validation
  if (rules.custom && !rules.custom(value)) {
    return {
      valid: false,
      message: rules.customMessage || `${fieldName || 'Field'} tidak valid`,
      field: fieldName,
    };
  }

  return { valid: true };
}

/**
 * Validate multiple fields at once
 */
export function validateForm(
  data: Record<string, any>,
  rules: Record<string, ValidationRules>
): { valid: boolean; errors: ValidationResult[] } {
  const errors: ValidationResult[] = [];

  for (const [field, fieldRules] of Object.entries(rules)) {
    const result = validateField(data[field], fieldRules, field);
    if (!result.valid) {
      errors.push(result);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Sanitize string input
 */
export function sanitizeString(input: string, options?: {
  trim?: boolean;
  lowercase?: boolean;
  uppercase?: boolean;
  removeSpecialChars?: boolean;
  maxLength?: number;
}): string {
  let sanitized = input;

  if (options?.trim !== false) {
    sanitized = sanitized.trim();
  }

  if (options?.lowercase) {
    sanitized = sanitized.toLowerCase();
  }

  if (options?.uppercase) {
    sanitized = sanitized.toUpperCase();
  }

  if (options?.removeSpecialChars) {
    sanitized = sanitized.replace(/[^a-zA-Z0-9\s]/g, '');
  }

  if (options?.maxLength && sanitized.length > options.maxLength) {
    sanitized = sanitized.substring(0, options.maxLength);
  }

  return sanitized;
}

/**
 * Sanitize HTML to prevent XSS
 */
export function sanitizeHTML(html: string): string {
  return html
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, '&#039;');
}

/**
 * Validate Indonesian phone number
 */
export function validateIndonesianPhone(phone: string): ValidationResult {
  const cleaned = phone.replace(/\s/g, '').replace(/-/g, '');
  
  // Convert to international format
  let normalized = cleaned;
  if (cleaned.startsWith('0')) {
    normalized = '+62' + cleaned.substring(1);
  } else if (cleaned.startsWith('62')) {
    normalized = '+' + cleaned;
  }

  const phoneRegex = /^\+628[1-9][0-9]{6,11}$/;
  
  if (!phoneRegex.test(normalized)) {
    return {
      valid: false,
      message: 'Nomor WhatsApp tidak valid. Format: 081234567890',
    };
  }

  return { valid: true };
}

/**
 * Validate price
 */
export function validatePrice(price: string | number): ValidationResult {
  const numPrice = typeof price === 'string' ? parseFloat(price.replace(/[^\d]/g, '')) : price;
  
  if (isNaN(numPrice) || numPrice < 0) {
    return {
      valid: false,
      message: 'Harga tidak valid',
    };
  }

  if (numPrice === 0) {
    return {
      valid: false,
      message: 'Harga tidak boleh 0',
    };
  }

  return { valid: true };
}

/**
 * Validate URL
 */
export function validateURL(url: string): ValidationResult {
  try {
    new URL(url);
    return { valid: true };
  } catch {
    return {
      valid: false,
      message: 'URL tidak valid',
    };
  }
}

/**
 * Create a composed validator
 */
export function composeValidators(...validators: Validator[]): Validator {
  return (value: any): ValidationResult => {
    for (const validator of validators) {
      const result = validator(value);
      if (!result.valid) {
        return result;
      }
    }
    return { valid: true };
  };
}

/**
 * React hook for form validation
 */
export function useFormValidation<T extends Record<string, any>>(
  initialData: T,
  validationRules: Record<keyof T, ValidationRules>
) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validate = useCallback((data: T): boolean => {
    const result = validateForm(data, validationRules);
    
    const newErrors: Record<string, string> = {};
    result.errors.forEach(error => {
      if (error.field) {
        newErrors[error.field] = error.message || 'Invalid';
      }
    });
    
    setErrors(newErrors);
    return result.valid;
  }, [validationRules]);

  const validateSingleField = useCallback((field: keyof T, value: any): boolean => {
    const rules = validationRules[field];
    if (!rules) return true;

    const result = validateField(value, rules, String(field));
    
    setErrors(prev => ({
      ...prev,
      [field]: result.valid ? '' : (result.message || 'Invalid'),
    }));

    return result.valid;
  }, [validationRules]);

  const setFieldTouched = useCallback((field: keyof T, isTouched: boolean = true) => {
    setTouched(prev => ({ ...prev, [field]: isTouched }));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const clearError = useCallback((field: keyof T) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[String(field)];
      return newErrors;
    });
  }, []);

  return {
    errors,
    touched,
    validate,
    validateField: validateSingleField,
    setFieldTouched,
    clearErrors,
    clearError,
  };
}

import { useState, useCallback } from 'react';

// Export all validators
export const validators = {
  required: (fieldName?: string): ValidationRules => ({ 
    required: true, 
    customMessage: `${fieldName || 'Field'} wajib diisi` 
  }),
  email: (): ValidationRules => ({ email: true }),
  phone: (): ValidationRules => ({ phone: true }),
  minLength: (min: number): ValidationRules => ({ minLength: min }),
  maxLength: (max: number): ValidationRules => ({ maxLength: max }),
  numeric: (): ValidationRules => ({ numeric: true }),
  price: (): ValidationRules => ({ 
    numeric: true, 
    min: 0,
    customMessage: 'Harga tidak valid'
  }),
  url: (): ValidationRules => ({
    pattern: /^https?:\/\/.+/,
    customMessage: 'URL harus dimulai dengan http:// atau https://'
  }),
};

export default {
  validateField,
  validateForm,
  sanitizeString,
  sanitizeHTML,
  validateIndonesianPhone,
  validatePrice,
  validateURL,
  composeValidators,
  useFormValidation,
  validators,
};
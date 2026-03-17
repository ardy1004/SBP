/**
 * Search Input Sanitization Utility
 * Handles security, validation, and normalization of search terms
 */

export class SearchSanitizer {
  /**
   * Sanitize search term for safe database queries
   */
  static sanitizeSearchTerm(term: string): string {
    if (!term || typeof term !== 'string') {
      return '';
    }

    return term
      // Trim whitespace
      .trim()
      // Remove potential HTML/script injection
      .replace(/[<>]/g, '')
      // Remove control characters
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
      // Limit length to prevent abuse
      .substring(0, 200)
      // Unicode normalization (decompose accented characters)
      .normalize('NFD')
      // Remove diacritics (combining characters)
      .replace(/[\u0300-\u036f]/g, '')
      // Normalize multiple spaces to single space
      .replace(/\s+/g, ' ');
  }

  /**
   * Escape special regex characters for safe pattern matching
   */
  static escapeRegexChars(term: string): string {
    return term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Validate search term format and safety
   */
  static validateSearchTerm(term: string): boolean {
    if (!term || term.length > 200) {
      return false;
    }

    // Allow alphanumeric, spaces, and common punctuation
    const validPattern = /^[\w\s.,\-()&]+$/;
    return validPattern.test(term);
  }

  /**
   * Check if a word should be included in search
   */
  static shouldIncludeWord(word: string): boolean {
    if (!word || word.length < 1) {
      return false;
    }

    // Always include words of 2+ characters
    if (word.length >= 2) {
      return true;
    }

    // Include common location abbreviations even if short
    const locationAbbreviations = [
      'jl', 'km', 'rt', 'rw', 'no', 'lt', 'lb',
      'gg', 'ds', 'kp', 'dk', 'du', 'tm'
    ];

    return locationAbbreviations.includes(word.toLowerCase());
  }

  /**
   * Split search term into individual words for multi-term search
   */
  static splitSearchTerms(term: string): string[] {
    return term
      .split(/\s+/)
      .filter(word => word.length > 0 && this.shouldIncludeWord(word))
      .map(word => word.toLowerCase());
  }

  /**
   * Generate cache key for search results
   */
  static generateCacheKey(term: string, options: Record<string, any> = {}): string {
    const sanitizedTerm = this.sanitizeSearchTerm(term);
    const optionsStr = JSON.stringify(options);
    return `${sanitizedTerm.toLowerCase()}_${optionsStr}`;
  }

  /**
   * Detect search intent (basic AI-like analysis)
   */
  static detectSearchIntent(term: string): {
    hasLocation: boolean;
    hasPropertyType: boolean;
    hasPrice: boolean;
    isExactCode: boolean;
  } {
    const lowerTerm = term.toLowerCase();

    return {
      hasLocation: /\b(jl|jalan|kaliurang|malioboro|ugm|sleman|yogyakarta|jogja)\b/i.test(term),
      hasPropertyType: /\b(rumah|kost|apartemen|tanah|ruko|villa|gedung)\b/i.test(term),
      hasPrice: /\b(juta|milyar|jt|m)\b/i.test(term),
      isExactCode: /^[A-Z]{1,3}\d{1,4}$/.test(term.trim())
    };
  }
}

/**
 * Search term validation result
 */
export interface ValidationResult {
  isValid: boolean;
  sanitizedTerm: string;
  warnings: string[];
  suggestions?: string[];
}

/**
 * Validate and sanitize search input with detailed feedback
 */
export function validateSearchInput(term: string): ValidationResult {
  const warnings: string[] = [];
  const suggestions: string[] = [];

  // Basic sanitization
  const sanitized = SearchSanitizer.sanitizeSearchTerm(term);

  if (!sanitized) {
    return {
      isValid: false,
      sanitizedTerm: '',
      warnings: ['Search term is empty or invalid']
    };
  }

  // Length validation
  if (sanitized.length < 2) {
    warnings.push('Search term is too short');
  }

  if (sanitized.length > 100) {
    warnings.push('Search term is too long, truncated');
  }

  // Character validation
  if (!SearchSanitizer.validateSearchTerm(sanitized)) {
    warnings.push('Search term contains invalid characters');
    suggestions.push('Use only letters, numbers, spaces, and basic punctuation');
  }

  // Intent detection for suggestions
  const intent = SearchSanitizer.detectSearchIntent(sanitized);
  if (intent.isExactCode) {
    suggestions.push('Searching by property code - this will find exact matches only');
  }

  if (!intent.hasLocation && !intent.hasPropertyType) {
    suggestions.push('Try adding location (e.g., "jogja", "sleman") or property type (e.g., "rumah", "kost")');
  }

  return {
    isValid: warnings.length === 0,
    sanitizedTerm: sanitized,
    warnings,
    suggestions
  };
}
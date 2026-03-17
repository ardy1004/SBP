/**
 * Location Service
 * Centralized service for location-related operations
 * Handles SEO URL <-> Database mapping, validation, and queries
 */

import {
  provinsiList,
  kabupatenList,
  getProvinsiBySlug,
  getProvinsiByName,
  getKabupatenBySlug,
  getKabupatenByName,
  getKabupatenByProvinsi,
  type Provinsi,
  type Kabupaten,
  type NormalizedLocation,
} from '@/data/locations';
import {
  mapSeoSlugToDatabase,
  mapDatabaseToSeoSlug,
  buildLocationFilters,
  getLocationSearchTerms,
  isValidLocationCombination,
  getLocationSuggestions,
  createSeoSlug,
  normalizeParam,
} from '@/data/locations/mapping';

export interface LocationFilterResult {
  provinsiDb: string;
  kabupatenDb?: string;
  provinsiTerms: string[];
  kabupatenTerms: string[];
  isValid: boolean;
  suggestions?: {
    provinsi?: string;
    kabupaten?: string[];
  };
}

export interface SeoUrlResult {
  provinsiSlug: string;
  kabupatenSlug?: string;
  isValid: boolean;
}

/**
 * Main Location Service class
 */
class LocationService {
  /**
   * Get all provinsi
   */
  getAllProvinsi(): Provinsi[] {
    return provinsiList;
  }

  /**
   * Get all kabupaten/kota
   */
  getAllKabupaten(): Kabupaten[] {
    return kabupatenList;
  }

  /**
   * Get kabupaten by provinsi ID
   */
  getKabupatenByProvinsiId(provinsiId: string): Kabupaten[] {
    return getKabupatenByProvinsi(provinsiId);
  }

  /**
   * Get kabupaten by provinsi slug
   */
  getKabupatenByProvinsiSlug(provinsiSlug: string): Kabupaten[] {
    const provinsi = getProvinsiBySlug(provinsiSlug);
    if (!provinsi) return [];
    return getKabupatenByProvinsi(provinsi.id);
  }

  /**
   * Map SEO URL parameters to database filter values
   * This is the main function used in FilteredPropertyPage
   */
  mapSeoToFilters(
    provinsiSlug: string,
    kabupatenSlug?: string
  ): LocationFilterResult {
    const isValid = isValidLocationCombination(provinsiSlug, kabupatenSlug);
    const terms = getLocationSearchTerms(provinsiSlug, kabupatenSlug);
    const mapped = mapSeoSlugToDatabase(provinsiSlug, kabupatenSlug);

    let suggestions;
    if (!isValid && kabupatenSlug) {
      suggestions = getLocationSuggestions(provinsiSlug, kabupatenSlug);
    }

    return {
      provinsiDb: mapped.provinsiDb,
      kabupatenDb: mapped.kabupatenDb || undefined,
      provinsiTerms: terms.provinsiTerms,
      kabupatenTerms: terms.kabupatenTerms,
      isValid,
      suggestions,
    };
  }

  /**
   * Map database values to SEO URL slugs
   * Used when generating property links
   */
  mapDatabaseToSeo(provinsi: string, kabupaten?: string): SeoUrlResult {
    const { provinsiSlug, kabupatenSlug } = mapDatabaseToSeoSlug(
      provinsi,
      kabupaten
    );
    const isValid = isValidLocationCombination(provinsiSlug, kabupatenSlug);

    return {
      provinsiSlug,
      kabupatenSlug,
      isValid,
    };
  }

  /**
   * Build Supabase query filters for location
   * Returns the exact values to use in .eq() or .ilike() queries
   */
  buildQueryFilters(provinsiSlug: string, kabupatenSlug?: string) {
    const filters = buildLocationFilters(provinsiSlug, kabupatenSlug);
    const terms = getLocationSearchTerms(provinsiSlug, kabupatenSlug);

    return {
      // Primary filter values
      provinsi: filters.provinsi,
      kabupaten: filters.kabupaten,

      // Alternative search terms for flexible matching
      provinsiVariations: filters.provinsi,
      kabupatenVariations: filters.variations,

      // All possible terms for OR queries
      allProvinsiTerms: terms.provinsiTerms,
      allKabupatenTerms: terms.kabupatenTerms,

      // For ilike queries
      provinsiPattern: `%${filters.provinsi.toLowerCase()}%`,
      kabupatenPatterns: filters.variations.map((v) => `%${v.toLowerCase()}%`),
    };
  }

  /**
   * Validate a location combination
   */
  validateLocation(provinsiSlug: string, kabupatenSlug?: string): boolean {
    return isValidLocationCombination(provinsiSlug, kabupatenSlug);
  }

  /**
   * Get suggestions for invalid or partial location
   */
  getSuggestions(
    provinsiSlug: string,
    kabupatenSlug?: string
  ): { provinsi?: string; kabupaten?: string[] } {
    return getLocationSuggestions(provinsiSlug, kabupatenSlug);
  }

  /**
   * Generate SEO-friendly URL for a property
   */
  generatePropertyUrl(
    status: string,
    jenis: string,
    provinsi: string,
    kabupaten?: string
  ): string {
    const { provinsiSlug, kabupatenSlug } = this.mapDatabaseToSeo(
      provinsi,
      kabupaten
    );

    const statusSlug = status.toLowerCase().replace(/\s+/g, '-');
    const jenisSlug = jenis.toLowerCase().replace(/\s+/g, '-');

    if (kabupatenSlug) {
      return `/${statusSlug}/${jenisSlug}/${provinsiSlug}/${kabupatenSlug}`;
    }
    return `/${statusSlug}/${jenisSlug}/${provinsiSlug}`;
  }

  /**
   * Parse SEO URL to extract location information
   */
  parseSeoUrl(
    url: string
  ): {
    status?: string;
    jenis?: string;
    provinsi?: string;
    kabupaten?: string;
    isValid: boolean;
  } {
    const parts = url.split('/').filter(Boolean);

    if (parts.length < 3) {
      return { isValid: false };
    }

    const [status, jenis, provinsiSlug, kabupatenSlug] = parts;
    const isValid = this.validateLocation(provinsiSlug, kabupatenSlug);

    const mapped = this.mapSeoToFilters(provinsiSlug, kabupatenSlug);

    return {
      status: normalizeParam(status),
      jenis: normalizeParam(jenis),
      provinsi: mapped.provinsiDb,
      kabupaten: mapped.kabupatenDb,
      isValid,
    };
  }

  /**
   * Find provinsi by any variation (name, slug, abbreviation)
   */
  findProvinsi(search: string): Provinsi | undefined {
    return (
      getProvinsiBySlug(search) ||
      getProvinsiByName(search) ||
      provinsiList.find(
        (p) =>
          p.variations.some(
            (v) => v.toLowerCase() === search.toLowerCase()
          ) ||
          p.nama.toLowerCase().includes(search.toLowerCase())
      )
    );
  }

  /**
   * Find kabupaten by any variation
   */
  findKabupaten(
    search: string,
    provinsiId?: string
  ): Kabupaten | undefined {
    return (
      getKabupatenBySlug(search, provinsiId) ||
      getKabupatenByName(search, provinsiId) ||
      kabupatenList.find(
        (k) =>
          (provinsiId === undefined || k.provinsiId === provinsiId) &&
          (k.variations.some(
            (v) => v.toLowerCase() === search.toLowerCase()
          ) ||
            k.nama.toLowerCase().includes(search.toLowerCase()))
      )
    );
  }

  /**
   * Get display name for provinsi (proper capitalization)
   */
  getProvinsiDisplayName(slug: string): string {
    const provinsi = getProvinsiBySlug(slug);
    return provinsi?.nama || normalizeParam(slug);
  }

  /**
   * Get display name for kabupaten (proper capitalization)
   */
  getKabupatenDisplayName(slug: string, provinsiSlug?: string): string {
    const provinsi = provinsiSlug ? getProvinsiBySlug(provinsiSlug) : undefined;
    const kabupaten = getKabupatenBySlug(slug, provinsi?.id);
    return kabupaten?.nama || normalizeParam(slug);
  }

  /**
   * Normalize location data from various sources
   * Useful for cleaning up existing database data
   */
  normalizeLocationData(
    provinsi: string,
    kabupaten?: string
  ): { provinsi: string; kabupaten?: string; isMatched: boolean } {
    const foundProvinsi = this.findProvinsi(provinsi);
    const foundKabupaten = kabupaten
      ? this.findKabupaten(kabupaten, foundProvinsi?.id)
      : undefined;

    return {
      provinsi: foundProvinsi?.nama || provinsi.trim(),
      kabupaten: foundKabupaten?.nama || kabupaten?.trim(),
      isMatched: !!foundProvinsi && (!kabupaten || !!foundKabupaten),
    };
  }

  /**
   * Get statistics about the location data
   */
  getStats() {
    return {
      totalProvinsi: provinsiList.length,
      totalKabupaten: kabupatenList.length,
      totalKota: kabupatenList.filter((k) => k.tipe === 'Kota').length,
      totalKabupatenOnly: kabupatenList.filter((k) => k.tipe === 'Kabupaten')
        .length,
    };
  }
}

// Export singleton instance
export const locationService = new LocationService();

// Export individual functions for tree-shaking
export {
  getProvinsiBySlug,
  getProvinsiByName,
  getKabupatenBySlug,
  getKabupatenByName,
  getKabupatenByProvinsi,
  mapSeoSlugToDatabase,
  mapDatabaseToSeoSlug,
  buildLocationFilters,
  getLocationSearchTerms,
  isValidLocationCombination,
  getLocationSuggestions,
  createSeoSlug,
  normalizeParam,
};

// Re-export types from data/locations
export type { Provinsi, Kabupaten, NormalizedLocation };
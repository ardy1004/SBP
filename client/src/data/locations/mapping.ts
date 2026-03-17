/**
 * Location Mapping Utilities
 * Functions to map between SEO URL slugs and database formats
 */

import type { NormalizedLocation } from './types';
import {
  provinsiList,
  kabupatenList,
  getProvinsiBySlug,
  getProvinsiByName,
  getKabupatenBySlug,
  getKabupatenByName,
  getKabupatenByProvinsi,
} from './indonesia';

/**
 * Normalize a URL parameter (kebab-case) to search-friendly format
 */
export const normalizeParam = (param: string): string => {
  return param
    .toLowerCase()
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Create SEO slug from database location name
 * "Kota Yogyakarta" -> "kota-yogyakarta"
 * "DI Yogyakarta" -> "yogyakarta"
 */
export const createSeoSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/^kota\s+/i, 'kota-')
    .replace(/^kabupaten\s+/i, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

/**
 * Map SEO URL slug to database format
 * Handles variations and special cases
 */
export const mapSeoSlugToDatabase = (
  provinsiSlug: string,
  kabupatenSlug?: string
): NormalizedLocation => {
  // Find provinsi
  const provinsi = getProvinsiBySlug(provinsiSlug);
  const provinsiDb = provinsi?.nama || normalizeParam(provinsiSlug);

  // Find kabupaten
  let kabupatenDb = '';
  if (kabupatenSlug) {
    const kabupaten = getKabupatenBySlug(
      kabupatenSlug,
      provinsi?.id
    );
    if (kabupaten) {
      kabupatenDb = kabupaten.nama;
    } else {
      // Fallback: normalize the slug
      kabupatenDb = normalizeParam(kabupatenSlug);
    }
  }

  return {
    provinsiDb,
    kabupatenDb,
    provinsiSlug,
    kabupatenSlug: kabupatenSlug || '',
  };
};

/**
 * Map database format to SEO URL slug
 * "DI Yogyakarta" -> "yogyakarta"
 * "Kota Yogyakarta" -> "kota-yogyakarta"
 */
export const mapDatabaseToSeoSlug = (
  provinsiName: string,
  kabupatenName?: string
): { provinsiSlug: string; kabupatenSlug?: string } => {
  const provinsi = getProvinsiByName(provinsiName);
  const provinsiSlug = provinsi?.seoSlug || createSeoSlug(provinsiName);

  let kabupatenSlug: string | undefined;
  if (kabupatenName) {
    const kabupaten = getKabupatenByName(kabupatenName, provinsi?.id);
    kabupatenSlug = kabupaten?.seoSlug || createSeoSlug(kabupatenName);
  }

  return { provinsiSlug, kabupatenSlug };
};

/**
 * Build query filters from SEO URL parameters
 * Returns database-compatible filter values
 */
export const buildLocationFilters = (
  provinsiSlug: string,
  kabupatenSlug?: string
): { provinsi: string; kabupaten?: string; variations: string[] } => {
  const mapped = mapSeoSlugToDatabase(provinsiSlug, kabupatenSlug);
  const provinsi = getProvinsiBySlug(provinsiSlug);
  const kabupaten = kabupatenSlug
    ? getKabupatenBySlug(kabupatenSlug, provinsi?.id)
    : undefined;

  // Collect all possible variations for flexible matching
  const variations: string[] = [];

  if (kabupaten) {
    variations.push(kabupaten.nama);
    variations.push(...kabupaten.variations);
    // Also add without "Kota " or "Kabupaten " prefix
    const shortName = kabupaten.nama.replace(/^(Kota|Kabupaten)\s+/i, '');
    if (shortName !== kabupaten.nama) {
      variations.push(shortName);
    }
  }

  return {
    provinsi: mapped.provinsiDb,
    kabupaten: mapped.kabupatenDb,
    variations: Array.from(new Set(variations)),
  };
};

/**
 * Get all possible search terms for a location
 * Useful for building flexible queries
 */
export const getLocationSearchTerms = (
  provinsiSlug: string,
  kabupatenSlug?: string
): { provinsiTerms: string[]; kabupatenTerms: string[] } => {
  const provinsi = getProvinsiBySlug(provinsiSlug);
  const kabupaten = kabupatenSlug
    ? getKabupatenBySlug(kabupatenSlug, provinsi?.id)
    : undefined;

  const provinsiTerms = provinsi
    ? [provinsi.nama, ...provinsi.variations]
    : [normalizeParam(provinsiSlug)];

  const kabupatenTerms = kabupaten
    ? [kabupaten.nama, ...kabupaten.variations]
    : kabupatenSlug
      ? [normalizeParam(kabupatenSlug)]
      : [];

  return {
    provinsiTerms: Array.from(new Set(provinsiTerms.map((t) => t.toLowerCase()))),
    kabupatenTerms: Array.from(new Set(kabupatenTerms.map((t) => t.toLowerCase()))),
  };
};

/**
 * Validate if a location combination exists
 */
export const isValidLocationCombination = (
  provinsiSlug: string,
  kabupatenSlug?: string
): boolean => {
  const provinsi = getProvinsiBySlug(provinsiSlug);
  if (!provinsi) return false;

  if (!kabupatenSlug) return true;

  const kabupaten = getKabupatenBySlug(kabupatenSlug, provinsi.id);
  return !!kabupaten;
};

/**
 * Get suggestions for invalid locations
 * Returns similar or available options
 */
export const getLocationSuggestions = (
  provinsiSlug: string,
  kabupatenSlug?: string
): { provinsi?: string; kabupaten?: string[] } => {
  const suggestions: { provinsi?: string; kabupaten?: string[] } = {};

  // Try to find similar provinsi
  const normalizedProvinsi = normalizeParam(provinsiSlug);
  const similarProvinsi = provinsiList.find(
    (p) =>
      p.nama.toLowerCase().includes(normalizedProvinsi) ||
      p.seoSlug.includes(provinsiSlug)
  );

  if (similarProvinsi) {
    suggestions.provinsi = similarProvinsi.nama;

    // If kabupaten provided, suggest available kabupaten in that provinsi
    if (kabupatenSlug) {
      const availableKabupaten = getKabupatenByProvinsi(similarProvinsi.id);
      suggestions.kabupaten = availableKabupaten.map((k) => k.nama);
    }
  }

  return suggestions;
};
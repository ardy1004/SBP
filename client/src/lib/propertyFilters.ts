import type { Property } from '@shared/types';

export interface PropertyPathFilters {
  status?: string;
  jenis?: string;
  priceRange?: string;
  provinsi?: string;
  kabupaten?: string;
  kecamatan?: string;
  kelurahan?: string;
}

export interface PropertyListFilters {
  status?: string;
  type?: string;
  keyword?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  minLandArea?: number;
  maxLandArea?: number;
  minBuildingArea?: number;
  maxBuildingArea?: number;
  legalStatuses?: string[];
  province?: string;
  regency?: string;
  district?: string;
  village?: string;
  hideSold?: boolean;
}

type PropertyLike = Partial<Property> & Record<string, any>;

const STATUS_ALIASES: Record<string, string> = {
  jual: 'dijual',
  dijual: 'dijual',
  sewa: 'disewakan',
  disewa: 'disewakan',
  disewakan: 'disewakan',
};

const TYPE_ALIASES: Record<string, string> = {
  all: 'all',
  semua: 'all',
  apartemen: 'apartment',
  apartment: 'apartment',
  kos: 'kost',
  kost: 'kost',
  vila: 'villa',
  villa: 'villa',
};

const LEGAL_STATUS_ALIASES: Record<string, string> = {
  shm: 'SHM',
  shgb: 'SHGB',
  ppjb: 'PPJB',
  girik: 'Girik',
  'letter c': 'Letter C',
  'shm pbg': 'SHM & PBG',
  'shm dan pbg': 'SHM & PBG',
  'shgb pbg': 'SHGB & PBG',
  'shgb dan pbg': 'SHGB & PBG',
};

export const PRICE_RANGE_BOUNDS: Record<string, { min?: number; max?: number }> = {
  'under-1m': { min: 0, max: 1_000_000_000 },
  '0-1m': { min: 0, max: 1_000_000_000 },
  '1m-2m': { min: 1_000_000_000, max: 2_000_000_000 },
  '2m-3m': { min: 2_000_000_000, max: 3_000_000_000 },
  '3m-4m': { min: 3_000_000_000, max: 4_000_000_000 },
  '4m-5m': { min: 4_000_000_000, max: 5_000_000_000 },
  '5m-6m': { min: 5_000_000_000, max: 6_000_000_000 },
  '6m-7m': { min: 6_000_000_000, max: 7_000_000_000 },
  '7m-8m': { min: 7_000_000_000, max: 8_000_000_000 },
  '8m-9m': { min: 8_000_000_000, max: 9_000_000_000 },
  '9m-10m': { min: 9_000_000_000, max: 10_000_000_000 },
  '10m': { min: 10_000_000_000 },
  'above-10m': { min: 10_000_000_000 },
};

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const normalizeText = (value?: string | number | null): string => {
  if (value === undefined || value === null) return '';

  return String(value)
    .toLowerCase()
    .replace(/[._/]+/g, ' ')
    .replace(/&/g, ' dan ')
    .replace(/[-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

export const normalizedHasKeyword = (keyword?: string): boolean => normalizeText(keyword).length > 0;

export const normalizeStatus = (value?: string): string | undefined => {
  if (!value) return undefined;
  return STATUS_ALIASES[normalizeText(value)] || normalizeText(value) || undefined;
};

export const normalizePropertyType = (value?: string): string | undefined => {
  if (!value) return undefined;

  const normalized = normalizeText(value);
  const mapped = TYPE_ALIASES[normalized] || normalized;

  return mapped === 'all' ? undefined : mapped;
};

export const normalizeLegalStatus = (value?: string): string | undefined => {
  if (!value) return undefined;

  const normalized = normalizeText(value.replace(/_/g, ' '));
  return LEGAL_STATUS_ALIASES[normalized] || value.replace(/_/g, ' & ').trim();
};

export const normalizeLegalStatusList = (values?: string[]): string[] => {
  return Array.from(
    new Set(
      (values || [])
        .map((value) => normalizeLegalStatus(value))
        .filter((value): value is string => Boolean(value))
    )
  );
};

// For Supabase queries - returns raw database values
export const expandStatusFilter = (value?: string): string[] => {
  const normalized = normalizeStatus(value);

  if (normalized === 'dijual') return ['dijual', 'dijual_disewakan'];
  if (normalized === 'disewakan') return ['disewakan', 'dijual_disewakan'];

  return normalized ? [normalized] : [];
};

// For client-side filtering - returns normalized values to match normalized property status
export const expandStatusFilterNormalized = (value?: string): string[] => {
  const statusValues = expandStatusFilter(value);
  return statusValues.map(v => normalizeText(v));
};

export const splitPathAndQuery = (rawLocation: string): { pathname: string; searchParams: URLSearchParams } => {
  const [rawPathname = '/', rawQuery = ''] = rawLocation.split('?');
  return {
    pathname: rawPathname || '/',
    searchParams: new URLSearchParams(rawQuery),
  };
};

export const isValidPriceRangeSegment = (value?: string): boolean => {
  if (!value) return false;

  if (PRICE_RANGE_BOUNDS[value.toLowerCase()]) return true;

  const compact = value.toLowerCase().replace(/\s+/g, '');
  return /^\d+(\.\d+)?(m|jt|rb)?(-\d+(\.\d+)?(m|jt|rb)?)?$/.test(compact);
};

export const parsePropertyPath = (pathname: string): PropertyPathFilters => {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return {};

  const filters: PropertyPathFilters = {
    status: normalizeStatus(segments[0]),
    jenis: normalizePropertyType(segments[1]) || undefined,
  };

  let locationStartIndex = 2;
  const possiblePriceRange = segments[2];
  if (possiblePriceRange && isValidPriceRangeSegment(possiblePriceRange)) {
    filters.priceRange = possiblePriceRange.toLowerCase();
    locationStartIndex = 3;
  }

  filters.provinsi = segments[locationStartIndex];
  filters.kabupaten = segments[locationStartIndex + 1];
  filters.kecamatan = segments[locationStartIndex + 2];
  filters.kelurahan = segments[locationStartIndex + 3];

  return filters;
};

export const buildPropertyFilterPath = (filters: PropertyPathFilters): string => {
  const parts = [
    normalizeStatus(filters.status),
    filters.jenis ? filters.jenis.toLowerCase() : undefined,
    filters.priceRange,
    filters.provinsi,
    filters.kabupaten,
    filters.kecamatan,
    filters.kelurahan,
  ].filter(Boolean);

  return parts.length > 0 ? `/${parts.join('/')}` : '/search';
};

export const getPriceRangeBounds = (value?: string): { min?: number; max?: number } => {
  if (!value) return {};

  const mapped = PRICE_RANGE_BOUNDS[value.toLowerCase()];
  if (mapped) return mapped;

  const normalized = value.toLowerCase().replace(/\s+/g, '');
  const parseUnit = (part: string): number => {
    if (part.includes('m')) return Number(part.replace('m', '')) * 1_000_000_000;
    if (part.includes('jt')) return Number(part.replace('jt', '')) * 1_000_000;
    if (part.includes('rb')) return Number(part.replace('rb', '')) * 1_000;
    return Number(part);
  };

  if (!normalized.includes('-')) {
    return { min: parseUnit(normalized) };
  }

  const [minPart, maxPart] = normalized.split('-');
  return {
    min: minPart === '' ? undefined : parseUnit(minPart),
    max: maxPart === '' ? undefined : parseUnit(maxPart),
  };
};

export const getPropertyNumericValue = (value: unknown): number | undefined => {
  if (value === undefined || value === null || value === '') return undefined;
  const parsed = typeof value === 'number' ? value : Number(String(value).replace(/[^\d.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : undefined;
};

const getPropertyField = (property: PropertyLike, camelKey: string, snakeKey?: string) => {
  return property[camelKey] ?? (snakeKey ? property[snakeKey] : undefined);
};

const containsNormalized = (source: unknown, expected?: string): boolean => {
  if (!expected) return true;
  const sourceText = normalizeText(source as string);
  const expectedText = normalizeText(expected);
  return sourceText.includes(expectedText);
};

export const matchesKeyword = (property: PropertyLike, keyword?: string): boolean => {
  const normalizedKeyword = normalizeText(keyword);
  if (!normalizedKeyword) return true;

  const words = normalizedKeyword.split(' ').filter(Boolean);
  const haystack = normalizeText([
    getPropertyField(property, 'kodeListing', 'kode_listing'),
    getPropertyField(property, 'judulProperti', 'judul_properti'),
    getPropertyField(property, 'deskripsi', 'deskripsi'),
    getPropertyField(property, 'jenisProperti', 'jenis_properti'),
    getPropertyField(property, 'provinsi', 'provinsi'),
    getPropertyField(property, 'kabupaten', 'kabupaten'),
    getPropertyField(property, 'kecamatan', 'kecamatan'),
    getPropertyField(property, 'alamatLengkap', 'alamat_lengkap'),
    getPropertyField(property, 'legalitas', 'legalitas'),
  ].filter(Boolean).join(' '));

  return words.every((word) => haystack.includes(word));
};

export const propertyMatchesFilters = (property: PropertyLike, filters: PropertyListFilters): boolean => {
  // Use normalized version for client-side filtering
  const statusFilters = expandStatusFilterNormalized(filters.status);
  const propertyStatus = normalizeText(getPropertyField(property, 'status', 'status'));
  if (statusFilters.length > 0 && !statusFilters.includes(propertyStatus)) {
    return false;
  }

  const normalizedType = normalizePropertyType(filters.type);
  const propertyType = normalizePropertyType(String(getPropertyField(property, 'jenisProperti', 'jenis_properti') || ''));
  if (normalizedType && propertyType !== normalizedType) {
    return false;
  }

  const isSold = Boolean(getPropertyField(property, 'isSold', 'is_sold'));
  if (filters.hideSold && isSold) {
    return false;
  }

  const price = getPropertyNumericValue(getPropertyField(property, 'hargaProperti', 'harga_properti'));
  if (filters.minPrice !== undefined && price !== undefined && price < filters.minPrice) {
    return false;
  }
  if (filters.maxPrice !== undefined && price !== undefined && price > filters.maxPrice) {
    return false;
  }

  const bedrooms = getPropertyNumericValue(getPropertyField(property, 'kamarTidur', 'kamar_tidur'));
  if (filters.bedrooms !== undefined && bedrooms !== undefined && bedrooms < filters.bedrooms) {
    return false;
  }

  const bathrooms = getPropertyNumericValue(getPropertyField(property, 'kamarMandi', 'kamar_mandi'));
  if (filters.bathrooms !== undefined && bathrooms !== undefined && bathrooms < filters.bathrooms) {
    return false;
  }

  const landArea = getPropertyNumericValue(getPropertyField(property, 'luasTanah', 'luas_tanah'));
  if (filters.minLandArea !== undefined && landArea !== undefined && landArea < filters.minLandArea) {
    return false;
  }
  if (filters.maxLandArea !== undefined && landArea !== undefined && landArea > filters.maxLandArea) {
    return false;
  }

  const buildingArea = getPropertyNumericValue(getPropertyField(property, 'luasBangunan', 'luas_bangunan'));
  if (filters.minBuildingArea !== undefined && buildingArea !== undefined && buildingArea < filters.minBuildingArea) {
    return false;
  }
  if (filters.maxBuildingArea !== undefined && buildingArea !== undefined && buildingArea > filters.maxBuildingArea) {
    return false;
  }

  const legalStatuses = normalizeLegalStatusList(filters.legalStatuses);
  const propertyLegalStatus = normalizeLegalStatus(String(getPropertyField(property, 'legalitas', 'legalitas') || ''));
  if (legalStatuses.length > 0 && (!propertyLegalStatus || !legalStatuses.includes(propertyLegalStatus))) {
    return false;
  }

  if (!containsNormalized(getPropertyField(property, 'provinsi', 'provinsi'), filters.province)) {
    return false;
  }

  if (!containsNormalized(getPropertyField(property, 'kabupaten', 'kabupaten'), filters.regency)) {
    return false;
  }

  const districtFilter = normalizeText(filters.district);
  if (districtFilter) {
    const districtSource = normalizeText([
      getPropertyField(property, 'kecamatan', 'kecamatan'),
      getPropertyField(property, 'alamatLengkap', 'alamat_lengkap'),
    ].filter(Boolean).join(' '));

    if (!districtSource.includes(districtFilter)) {
      return false;
    }
  }

  const villageFilter = normalizeText(filters.village);
  if (villageFilter) {
    const villageSource = normalizeText(getPropertyField(property, 'alamatLengkap', 'alamat_lengkap'));
    if (!villageSource.includes(villageFilter)) {
      return false;
    }
  }

  if (!matchesKeyword(property, filters.keyword)) {
    return false;
  }

  return true;
};

export const calculateKeywordRelevance = (property: PropertyLike, keyword?: string): number => {
  const normalizedKeyword = normalizeText(keyword);
  if (!normalizedKeyword) return 0;

  const words = normalizedKeyword.split(' ').filter(Boolean);
  let score = 0;

  const weightedFields: Array<{ value: unknown; weight: number }> = [
    { value: getPropertyField(property, 'kodeListing', 'kode_listing'), weight: 50 },
    { value: getPropertyField(property, 'judulProperti', 'judul_properti'), weight: 40 },
    { value: getPropertyField(property, 'deskripsi', 'deskripsi'), weight: 20 },
    { value: getPropertyField(property, 'kabupaten', 'kabupaten'), weight: 18 },
    { value: getPropertyField(property, 'provinsi', 'provinsi'), weight: 18 },
    { value: getPropertyField(property, 'kecamatan', 'kecamatan'), weight: 16 },
    { value: getPropertyField(property, 'alamatLengkap', 'alamat_lengkap'), weight: 12 },
    { value: getPropertyField(property, 'legalitas', 'legalitas'), weight: 10 },
  ];

  weightedFields.forEach(({ value, weight }) => {
    const normalizedValue = normalizeText(value as string);
    if (!normalizedValue) return;

    if (normalizedValue === normalizedKeyword) score += weight * 3;
    if (normalizedValue.includes(normalizedKeyword)) score += weight * 2;

    words.forEach((word) => {
      const matches = normalizedValue.match(new RegExp(escapeRegExp(word), 'g'));
      score += (matches?.length || 0) * weight;
    });
  });

  return score;
};

export const dedupeProperties = <T extends PropertyLike>(properties: T[]): T[] => {
  const seen = new Set<string>();

  return properties.filter((property) => {
    const rawId = getPropertyField(property, 'id', 'id');
    const id = rawId
      ? String(rawId)
      : JSON.stringify([
          getPropertyField(property, 'kodeListing', 'kode_listing'),
          getPropertyField(property, 'judulProperti', 'judul_properti'),
        ]);
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
};

export const sortFilteredProperties = <T extends PropertyLike>(properties: T[], keyword?: string): T[] => {
  return [...properties].sort((left, right) => {
    const leftRelevance = calculateKeywordRelevance(left, keyword);
    const rightRelevance = calculateKeywordRelevance(right, keyword);

    if (normalizedHasKeyword(keyword) && rightRelevance !== leftRelevance) {
      return rightRelevance - leftRelevance;
    }

    const premiumDelta = Number(Boolean(getPropertyField(right, 'isPremium', 'is_premium'))) - Number(Boolean(getPropertyField(left, 'isPremium', 'is_premium')));
    if (premiumDelta !== 0) return premiumDelta;

    const featuredDelta = Number(Boolean(getPropertyField(right, 'isFeatured', 'is_featured'))) - Number(Boolean(getPropertyField(left, 'isFeatured', 'is_featured')));
    if (featuredDelta !== 0) return featuredDelta;

    const leftDate = new Date(String(getPropertyField(left, 'createdAt', 'created_at') || 0)).getTime();
    const rightDate = new Date(String(getPropertyField(right, 'createdAt', 'created_at') || 0)).getTime();
    if (rightDate !== leftDate) return rightDate - leftDate;

    return String(getPropertyField(left, 'id', 'id') || '').localeCompare(String(getPropertyField(right, 'id', 'id') || ''));
  });
};

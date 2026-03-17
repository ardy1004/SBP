import { describe, expect, it } from 'vitest';

import {
  buildPropertyFilterPath,
  dedupeProperties,
  expandStatusFilter,
  getPriceRangeBounds,
  normalizeLegalStatus,
  parsePropertyPath,
  propertyMatchesFilters,
  splitPathAndQuery,
} from '@/lib/propertyFilters';

describe('propertyFilters', () => {
  it('parses pathname without price range correctly', () => {
    expect(parsePropertyPath('/dijual/rumah/yogyakarta/sleman/depok')).toEqual({
      status: 'dijual',
      jenis: 'rumah',
      provinsi: 'yogyakarta',
      kabupaten: 'sleman',
      kecamatan: 'depok',
      kelurahan: undefined,
    });
  });

  it('parses pathname with price range correctly', () => {
    expect(parsePropertyPath('/disewakan/kost/1m-2m/yogyakarta/sleman')).toEqual({
      status: 'disewakan',
      jenis: 'kost',
      priceRange: '1m-2m',
      provinsi: 'yogyakarta',
      kabupaten: 'sleman',
      kecamatan: undefined,
      kelurahan: undefined,
    });
  });

  it('keeps query params separated from pathname', () => {
    const parsed = splitPathAndQuery('/dijual/rumah/yogyakarta?q=depok&minPrice=1000');

    expect(parsed.pathname).toBe('/dijual/rumah/yogyakarta');
    expect(parsed.searchParams.get('q')).toBe('depok');
    expect(parsed.searchParams.get('minPrice')).toBe('1000');
  });

  it('normalizes legal status aliases from UI to database format', () => {
    expect(normalizeLegalStatus('SHGB_PBG')).toBe('SHGB & PBG');
    expect(normalizeLegalStatus('shm pbg')).toBe('SHM & PBG');
  });

  it('expands status filter to include combined listing status', () => {
    expect(expandStatusFilter('dijual')).toEqual(['dijual', 'dijual_disewakan']);
    expect(expandStatusFilter('disewakan')).toEqual(['disewakan', 'dijual_disewakan']);
  });

  it('builds consistent filter path hierarchy', () => {
    expect(buildPropertyFilterPath({
      status: 'dijual',
      jenis: 'rumah',
      priceRange: '1m-2m',
      provinsi: 'yogyakarta',
      kabupaten: 'sleman',
      kecamatan: 'depok',
    })).toBe('/dijual/rumah/1m-2m/yogyakarta/sleman/depok');
  });

  it('matches district via kecamatan or alamat lengkap and applies strict max price', () => {
    const property = {
      id: '1',
      status: 'dijual_disewakan',
      jenisProperti: 'rumah',
      hargaProperti: '2000000000',
      provinsi: 'DI Yogyakarta',
      kabupaten: 'Sleman',
      kecamatan: 'Depok',
      alamatLengkap: 'Jl. Anggajaya, Depok, Sleman',
      legalitas: 'SHGB & PBG',
      kamarTidur: 4,
    };

    expect(propertyMatchesFilters(property as any, {
      status: 'dijual',
      type: 'rumah',
      province: 'yogyakarta',
      regency: 'sleman',
      district: 'depok',
      legalStatuses: ['SHGB_PBG'],
      maxPrice: 2_000_000_000,
      bedrooms: 3,
    })).toBe(true);

    expect(propertyMatchesFilters(property as any, {
      district: 'gamping',
    })).toBe(false);

    expect(propertyMatchesFilters(property as any, {
      maxPrice: 1_999_999_999,
    })).toBe(false);
  });

  it('deduplicates properties by id', () => {
    expect(dedupeProperties([
      { id: '1', kodeListing: 'A' },
      { id: '1', kodeListing: 'A' },
      { id: '2', kodeListing: 'B' },
    ])).toHaveLength(2);
  });

  it('maps price ranges consistently', () => {
    expect(getPriceRangeBounds('0-1m')).toEqual({ min: 0, max: 1_000_000_000 });
    expect(getPriceRangeBounds('10m')).toEqual({ min: 10_000_000_000 });
  });
});

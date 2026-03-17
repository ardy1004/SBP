/**
 * Types for Location Master Data
 * Standardized location structure for Indonesia
 */

export interface Provinsi {
  id: string;
  nama: string;
  seoSlug: string;
  variations: string[];
}

export interface Kabupaten {
  id: string;
  provinsiId: string;
  nama: string;
  seoSlug: string;
  tipe: 'Kabupaten' | 'Kota';
  variations: string[];
}

export interface Kecamatan {
  id: string;
  kabupatenId: string;
  nama: string;
  seoSlug: string;
}

export interface Kelurahan {
  id: string;
  kecamatanId: string;
  nama: string;
  seoSlug: string;
}

export interface LocationMapping {
  provinsi: string;
  kabupaten: string;
  kecamatan?: string;
  kelurahan?: string;
}

export interface LocationValue {
  provinsi?: string;
  kabupaten?: string;
  kecamatan?: string;
  kelurahan?: string;
}

export interface NormalizedLocation {
  provinsiDb: string;
  kabupatenDb: string;
  provinsiSlug: string;
  kabupatenSlug: string;
}
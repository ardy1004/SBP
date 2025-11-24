import { z } from "zod";

// Types for frontend use (without drizzle dependencies)

// Property types and statuses
export const PROPERTY_TYPES = [
  "apartment",
  "gudang",
  "villa",
  "homestay_guesthouse",
  "hotel",
  "kost",
  "rumah",
  "ruko",
  "tanah",
  "bangunan_komersial",
] as const;

export const PROPERTY_STATUSES = ["dijual", "disewakan"] as const;

export const LEGAL_STATUSES = ["SHM", "SHGB", "PPJB", "Girik", "Letter C", "SHM & PBG", "SHGB & PBG"] as const;

export type PropertyType = typeof PROPERTY_TYPES[number];
export type PropertyStatus = typeof PROPERTY_STATUSES[number];
export type LegalStatus = typeof LEGAL_STATUSES[number];

// Property interface for frontend
export interface Property {
  id: string;
  kodeListing: string;
  judulProperti?: string | null;
  deskripsi?: string | null;
  jenisProperti: string;
  luasTanah?: string | null;
  luasBangunan?: string | null;
  kamarTidur?: number | null;
  kamarMandi?: number | null;
  legalitas?: string | null;
  hargaProperti: string;
  hargaPerMeter?: boolean;
  provinsi: string;
  kabupaten: string;
  alamatLengkap?: string | null;
  imageUrl: string;
  imageUrl1?: string | null;
  imageUrl2?: string | null;
  imageUrl3?: string | null;
  imageUrl4?: string | null;
  imageUrl5?: string | null;
  imageUrl6?: string | null;
  imageUrl7?: string | null;
  imageUrl8?: string | null;
  imageUrl9?: string | null;
  isPremium: boolean;
  isFeatured: boolean;
  isHot: boolean;
  isSold: boolean;
  priceOld?: string | null;
  isPropertyPilihan: boolean;
  ownerContact?: string | null;
  youtubeUrl?: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

// Integration interface for frontend
export interface Integration {
  id: string;
  googleAnalyticsId?: string | null;
  googleTag?: string | null;
  facebookPixel?: string | null;
  tiktokPixel?: string | null;
  updatedAt: Date;
}

// Zod schemas for validation (frontend-safe)
export const propertyTypeSchema = z.enum(PROPERTY_TYPES);
export const propertyStatusSchema = z.enum(PROPERTY_STATUSES);
export const legalStatusSchema = z.enum(LEGAL_STATUSES);
// Exported frontend functions for fetching properties from Supabase
// Includes request URL/params, headers, filter application, and error handling

import { supabase } from "@/lib/supabase";
import type { Property } from "@shared/types";

// Types for filter values
export interface SearchFilters {
  status?: string;
  type?: string;
  location?: string;
}

export interface AdvancedFilters {
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  minLandArea?: number;
  maxLandArea?: number;
  minBuildingArea?: number;
  maxBuildingArea?: number;
  legalStatus?: string;
}

// Function to fetch featured/pilihan properties
export async function fetchPropertyPilihan(): Promise<Property[]> {
  console.log('🏠 Fetching pilihan properties from Supabase...');

  // Supabase client automatically handles:
  // - URL: Uses the configured Supabase URL (from env/supabase config)
  // - Headers: Includes Authorization header with anon key, Content-Type: application/json
  // - Authentication: Handles JWT tokens if user is logged in
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('is_property_pilihan', true)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('❌ Supabase pilihan query error:', error);
    throw error; // Let React Query handle the error
  }

  console.log(`✅ Fetched ${data?.length || 0} pilihan properties`);
  return data || [];
}

// Function to build query parameters from filters
export function buildQueryParams(searchFilters: SearchFilters, advancedFilters: AdvancedFilters, keyword: string): string {
  const params = new URLSearchParams();
  if (searchFilters.status) params.set('status', searchFilters.status);
  if (searchFilters.type) params.set('type', searchFilters.type);
  if (searchFilters.location) params.set('location', searchFilters.location);
  if (advancedFilters.minPrice) params.set('minPrice', advancedFilters.minPrice.toString());
  if (advancedFilters.maxPrice) params.set('maxPrice', advancedFilters.maxPrice.toString());
  if (advancedFilters.bedrooms) params.set('bedrooms', advancedFilters.bedrooms.toString());
  if (advancedFilters.bathrooms) params.set('bathrooms', advancedFilters.bathrooms.toString());
  if (advancedFilters.minLandArea) params.set('minLandArea', advancedFilters.minLandArea.toString());
  if (advancedFilters.maxLandArea) params.set('maxLandArea', advancedFilters.maxLandArea.toString());
  if (advancedFilters.minBuildingArea) params.set('minBuildingArea', advancedFilters.minBuildingArea.toString());
  if (advancedFilters.maxBuildingArea) params.set('maxBuildingArea', advancedFilters.maxBuildingArea.toString());
  if (advancedFilters.legalStatus) params.set('legalStatus', advancedFilters.legalStatus);
  if (keyword.trim()) params.set('keyword', keyword.trim());
  return params.toString();
}

// Function to fetch filtered properties
export async function fetchFilteredProperties(searchFilters: SearchFilters, advancedFilters: AdvancedFilters, keyword: string): Promise<Property[]> {
  console.log('🏠 Fetching properties from Supabase...');

  // Start with base query
  // Supabase client automatically handles:
  // - URL: Uses the configured Supabase URL
  // - Headers: Authorization with anon key, Content-Type, etc.
  let query = supabase
    .from('properties')
    .select('*')
    .order('created_at', { ascending: false });

  // Apply status filter (is_property_pilihan is handled separately in fetchPropertyPilihan)
  if (searchFilters.status) {
    query = query.eq('status', searchFilters.status);
  }

  // Apply type filter
  if (searchFilters.type) {
    query = query.eq('jenis_properti', searchFilters.type);
  }

  // Apply location filter (searches across multiple fields)
  if (searchFilters.location) {
    const locationTerm = searchFilters.location.toLowerCase();
    query = query.or(`kabupaten.ilike.%${locationTerm}%,provinsi.ilike.%${locationTerm}%,alamat_lengkap.ilike.%${locationTerm}%`);
  }

  // Apply advanced filters
  if (advancedFilters.minPrice) {
    query = query.gte('harga_properti', advancedFilters.minPrice);
  }
  if (advancedFilters.maxPrice) {
    query = query.lte('harga_properti', advancedFilters.maxPrice);
  }
  if (advancedFilters.bedrooms) {
    query = query.eq('kamar_tidur', advancedFilters.bedrooms);
  }
  if (advancedFilters.bathrooms) {
    query = query.eq('kamar_mandi', advancedFilters.bathrooms);
  }
  if (advancedFilters.minLandArea) {
    query = query.gte('luas_tanah', advancedFilters.minLandArea);
  }
  if (advancedFilters.maxLandArea) {
    query = query.lte('luas_tanah', advancedFilters.maxLandArea);
  }
  if (advancedFilters.minBuildingArea) {
    query = query.gte('luas_bangunan', advancedFilters.minBuildingArea);
  }
  if (advancedFilters.maxBuildingArea) {
    query = query.lte('luas_bangunan', advancedFilters.maxBuildingArea);
  }
  if (advancedFilters.legalStatus) {
    query = query.eq('legalitas', advancedFilters.legalStatus);
  }

  // Apply keyword search (searches only in kode_listing and judul_properti)
  if (keyword.trim()) {
    const searchTerm = keyword.trim().toLowerCase();
    const searchWords = searchTerm.split(/\s+/).filter(word => word.length > 0);
    const searchConditions = [];

    // Search only in kode_listing and judul_properti
    searchConditions.push(`kode_listing.ilike.%${searchTerm}%`);
    searchConditions.push(`judul_properti.ilike.%${searchTerm}%`);

    // If search term has multiple words, also search for partial matches
    if (searchWords.length > 1) {
      searchWords.forEach(word => {
        if (word.length > 2) { // Only search words longer than 2 characters
          searchConditions.push(`kode_listing.ilike.%${word}%`);
          searchConditions.push(`judul_properti.ilike.%${word}%`);
        }
      });
    }

    query = query.or(searchConditions.join(','));
  }

  const { data, error } = await query;

  if (error) {
    console.error('❌ Supabase query error:', error);
    // Error handling: throw error to let React Query handle it
    // In the original code, there's a fallback to seed data, but we'll keep it simple here
    throw error;
  }

  console.log(`✅ Fetched ${data?.length || 0} properties`);
  return data || [];
}

// Fallback seed data (from original HomePage)
export const fallbackProperty: Property = {
  id: "fallback-1",
  kodeListing: "DEMO001",
  judulProperti: "Rumah Demo Minimalis Jakarta",
  deskripsi: "Rumah demo untuk testing",
  jenisProperti: "rumah",
  luasTanah: "100",
  luasBangunan: "80",
  kamarTidur: 3,
  kamarMandi: 2,
  legalitas: "SHM",
  hargaProperti: "500000000",
  provinsi: "jakarta",
  kabupaten: "jakarta-selatan",
  alamatLengkap: "Jl. Demo No. 123",
  imageUrl: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop",
  imageUrl1: null,
  imageUrl2: null,
  imageUrl3: null,
  imageUrl4: null,
  imageUrl5: null,
  imageUrl6: null,
  imageUrl7: null,
  imageUrl8: null,
  imageUrl9: null,
  isPremium: false,
  isFeatured: false,
  isHot: false,
  isSold: false,
  priceOld: null,
  isPropertyPilihan: false,
  ownerContact: null,
  status: "dijual",
  createdAt: new Date(),
  updatedAt: new Date(),
};

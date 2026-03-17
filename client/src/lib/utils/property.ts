/**
 * Property Utilities
 * 
 * Fungsi-fungsi untuk transformasi data properti dari Supabase
 * Digunakan untuk menghindari duplikasi kode di berbagai komponen
 */

import type { Property } from '@shared/types';

/**
 * Transform Supabase property data (snake_case) ke Property object (camelCase)
 * Digunakan di PropertyDetailPage dan RelatedPropertiesSection
 */
export function transformSupabaseProperty(supabaseProperty: Record<string, unknown>): Property {
  return {
    id: supabaseProperty.id as string,
    kodeListing: supabaseProperty.kode_listing as string,
    judulProperti: supabaseProperty.judul_properti as string | null | undefined,
    deskripsi: supabaseProperty.deskripsi as string | null | undefined,
    jenisProperti: supabaseProperty.jenis_properti as string,
    luasTanah: supabaseProperty.luas_tanah ? String(supabaseProperty.luas_tanah) : null,
    luasBangunan: supabaseProperty.luas_bangunan ? String(supabaseProperty.luas_bangunan) : null,
    kamarTidur: supabaseProperty.kamar_tidur as number | null | undefined,
    kamarMandi: supabaseProperty.kamar_mandi as number | null | undefined,
    legalitas: supabaseProperty.legalitas as string | null | undefined,
    hargaProperti: supabaseProperty.harga_properti as string,
    hargaPerMeter: supabaseProperty.harga_per_meter as boolean | undefined,
    provinsi: supabaseProperty.provinsi as string,
    kabupaten: supabaseProperty.kabupaten as string,
    kecamatan: supabaseProperty.kecamatan as string | null | undefined,
    alamatLengkap: supabaseProperty.alamat_lengkap as string | null | undefined,
    imageUrl: (supabaseProperty.image_url as string) || '',
    imageUrl1: supabaseProperty.image_url1 as string | null | undefined,
    imageUrl2: supabaseProperty.image_url2 as string | null | undefined,
    imageUrl3: supabaseProperty.image_url3 as string | null | undefined,
    imageUrl4: supabaseProperty.image_url4 as string | null | undefined,
    imageUrl5: supabaseProperty.image_url5 as string | null | undefined,
    imageUrl6: supabaseProperty.image_url6 as string | null | undefined,
    imageUrl7: supabaseProperty.image_url7 as string | null | undefined,
    imageUrl8: supabaseProperty.image_url8 as string | null | undefined,
    imageUrl9: supabaseProperty.image_url9 as string | null | undefined,
    isPremium: !!(supabaseProperty.is_premium as boolean),
    isFeatured: !!(supabaseProperty.is_featured as boolean),
    isHot: !!(supabaseProperty.is_hot as boolean),
    isSold: !!(supabaseProperty.is_sold as boolean),
    priceOld: supabaseProperty.price_old as string | null | undefined,
    isPropertyPilihan: !!(supabaseProperty.is_property_pilihan as boolean),
    ownerContact: supabaseProperty.owner_contact as string | null | undefined,
    youtubeUrl: supabaseProperty.youtube_url as string | null | undefined,
    status: supabaseProperty.status as string,
    createdAt: new Date(supabaseProperty.created_at as string),
    updatedAt: new Date(supabaseProperty.updated_at as string),
  };
}

/**
 * Transform array of Supabase properties ke array of Property objects
 */
export function transformSupabaseProperties(supabaseProperties: Record<string, unknown>[]): Property[] {
  return supabaseProperties.map(transformSupabaseProperty);
}

/**
 * Get primary image URL dari property
 * Returns first available image or undefined
 */
export function getPrimaryImageUrl(property: Property): string | undefined {
  const images = [
    property.imageUrl,
    property.imageUrl1,
    property.imageUrl2,
    property.imageUrl3,
    property.imageUrl4,
  ].filter((img): img is string => !!img && img.trim() !== '');

  return images[0];
}

/**
 * Get all available image URLs dari property
 */
export function getAllImageUrls(property: Property): string[] {
  return [
    property.imageUrl,
    property.imageUrl1,
    property.imageUrl2,
    property.imageUrl3,
    property.imageUrl4,
    property.imageUrl5,
    property.imageUrl6,
    property.imageUrl7,
    property.imageUrl8,
    property.imageUrl9,
  ].filter((img): img is string => !!img && img.trim() !== '');
}

/**
 * Format property price untuk display
 */
export function formatPropertyPrice(price: string, isPerMeter: boolean = false): string {
  const num = parseFloat(price);
  
  if (isNaN(num)) return 'Harga belum ditentukan';
  
  if (isPerMeter) {
    if (num >= 1000000000) {
      const value = num / 1000000000;
      const rounded = Math.round(value * 10) / 10;
      return `Rp ${rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1)}jt/m²`;
    } else if (num >= 1000000) {
      const value = num / 1000000;
      const rounded = Math.round(value * 10) / 10;
      return `Rp ${rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1)}jt/m²`;
    }
    return `Rp ${num.toLocaleString('id-ID')}/m²`;
  }
  
  // Regular pricing
  if (num >= 1000000000) {
    const value = num / 1000000000;
    const rounded = Math.round(value * 10) / 10;
    return `Rp ${rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1)}M`;
  } else if (num >= 1000000) {
    const value = num / 1000000;
    const rounded = Math.round(value * 10) / 10;
    return `Rp ${rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1)}M`;
  }
  
  return `Rp ${num.toLocaleString('id-ID')}`;
}

/**
 * Generate property title dari data property
 */
export function generatePropertyTitle(property: Property): string {
  return property.judulProperti || 
    `${property.jenisProperti.charAt(0).toUpperCase() + property.jenisProperti.slice(1).replace(/_/g, ' ')} di ${property.kabupaten.charAt(0).toUpperCase() + property.kabupaten.slice(1)}`;
}

/**
 * Generate property description untuk meta tags
 */
export function generatePropertyDescription(property: Property): string {
  return property.deskripsi || 
    `${property.jenisProperti.charAt(0).toUpperCase() + property.jenisProperti.slice(1).replace(/_/g, ' ')} ${property.status} di ${property.kabupaten}, ${property.provinsi}. Harga: ${formatPropertyPrice(property.hargaProperti, property.hargaPerMeter)}`;
}

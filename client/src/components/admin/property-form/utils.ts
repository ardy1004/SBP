/**
 * Utility functions for Production Property Form
 */

import type { PropertyFormData } from './types';

/**
 * Parse currency string to number string (remove non-digit characters)
 */
export function parseCurrency(value: string): string {
  return String(value).replace(/[^\d]/g, '');
}

/**
 * Format number as Indonesian Rupiah
 */
export function formatRupiah(value: string | number): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num) || num === 0) return '-';
  return `Rp ${num.toLocaleString('id-ID')}`;
}

/**
 * Generate unique listing code
 */
export function generateListingCode(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `SBP-${timestamp}-${randomPart}`;
}

/**
 * Convert form status to database status
 */
export function getDatabaseStatus(formData: PropertyFormData): string {
  if (formData.status_dijual && formData.status_disewakan) {
    return 'dijual_disewakan';
  } else if (formData.status_disewakan) {
    return 'disewakan';
  }
  return 'dijual';
}

/**
 * Build property payload for Supabase
 */
export function buildPropertyPayload(formData: PropertyFormData, propertyId?: string): any {
  const status = getDatabaseStatus(formData);

  const payload: any = {
    kode_listing: formData.kode_listing || null,
    judul_properti: formData.judul_properti || null,
    deskripsi: formData.deskripsi || null,
    harga_properti: formData.harga_properti ? parseCurrency(formData.harga_properti) : null,
    price_old: formData.price_old ? parseCurrency(formData.price_old) : null,
    luas_tanah: formData.luas_tanah ? parseFloat(formData.luas_tanah) : null,
    luas_bangunan: formData.luas_bangunan ? parseFloat(formData.luas_bangunan) : null,
    kamar_tidur: formData.kamar_tidur ? parseInt(formData.kamar_tidur) : null,
    kamar_mandi: formData.kamar_mandi ? parseInt(formData.kamar_mandi) : null,
    jenis_properti: formData.jenis_properti,
    legalitas: formData.legalitas || null,
    provinsi: formData.provinsi || null,
    kabupaten: formData.kabupaten || null,
    kecamatan: formData.kecamatan || null,
    kelurahan: formData.kelurahan || null,
    alamat_lengkap: formData.alamat_lengkap || null,
    
    // Images
    image_url: formData.image_url || null,
    image_url1: formData.image_url1 || null,
    image_url2: formData.image_url2 || null,
    image_url3: formData.image_url3 || null,
    image_url4: formData.image_url4 || null,
    image_url5: formData.image_url5 || null,
    image_url6: formData.image_url6 || null,
    image_url7: formData.image_url7 || null,
    image_url8: formData.image_url8 || null,
    image_url9: formData.image_url9 || null,
    youtube_url: formData.youtube_url || null,
    
    // Status
    status: status,
    
    // Labels
    is_hot: formData.is_hot,
    is_sold: formData.is_sold,
    is_property_pilihan: formData.is_property_pilihan,
    is_premium: formData.is_premium,
    is_featured: formData.is_featured,
    
    // Owner Contact
    owner_contact: formData.owner_contact || null,
    
    // Extension fields
    kelengkapan: formData.kelengkapan || null,
    status_legalitas: formData.status_legalitas || 'On Hand',
    jenis_kost: formData.jenis_kost || null,
    jumlah_lantai: formData.jumlah_lantai ? parseInt(formData.jumlah_lantai) : null,
    lebar_depan: formData.lebar_depan ? parseFloat(formData.lebar_depan) : null,
    no_unit: formData.no_unit || null,
    bank_terkait: formData.bank_terkait || null,
    outstanding_bank: formData.outstanding_bank ? parseCurrency(formData.outstanding_bank) : null,
    google_maps_link: formData.google_maps_link || null,
    harga_sewa_tahunan: formData.harga_sewa_tahunan ? parseCurrency(formData.harga_sewa_tahunan) : null,
    harga_sewa_kamar: formData.harga_sewa_kamar ? parseCurrency(formData.harga_sewa_kamar) : null,
    income_per_bulan: formData.income_per_bulan ? parseCurrency(formData.income_per_bulan) : null,
    biaya_pengeluaran_per_bulan: formData.biaya_pengeluaran_per_bulan ? parseCurrency(formData.biaya_pengeluaran_per_bulan) : null,
    alasan_dijual: formData.alasan_dijual || null,
  };

  return payload;
}

/**
 * Parse existing property data to form data
 */
export function parsePropertyToFormData(property: any, sourceInput: 'ADMIN' | 'OWNER'): PropertyFormData {
  return {
    kode_listing: property?.kode_listing || property?.kodeListing || "",
    judul_properti: property?.judul_properti || property?.judulProperti || "",
    deskripsi: property?.deskripsi || "",
    harga_properti: property?.harga_properti || property?.hargaProperti || "",
    harga_per_meter: property?.harga_per_meter || property?.hargaPerMeter || false,
    price_old: property?.price_old || property?.priceOld || "",
    luas_tanah: property?.luas_tanah || property?.luasTanah || "",
    luas_bangunan: property?.luas_bangunan || property?.luasBangunan || "",
    kamar_tidur: property?.kamar_tidur || property?.kamarTidur || "",
    kamar_mandi: property?.kamar_mandi || property?.kamarMandi || "",
    jenis_properti: property?.jenis_properti || property?.jenisProperti || "",
    legalitas: property?.legalitas || "",
    shgb_expired_at: property?.shgb_expired_at || property?.shgbExpiredAt || "",
    provinsi: property?.provinsi || property?.Provinsi || "",
    kabupaten: property?.kabupaten || "",
    kecamatan: property?.kecamatan || "",
    kelurahan: property?.kelurahan || "",
    alamat_lengkap: property?.alamat_lengkap || property?.alamatLengkap || "",
    image_url: property?.image_url || property?.imageUrl || "",
    image_url1: property?.image_url1 || property?.imageUrl1 || "",
    image_url2: property?.image_url2 || property?.imageUrl2 || "",
    image_url3: property?.image_url3 || property?.imageUrl3 || "",
    image_url4: property?.image_url4 || property?.imageUrl4 || "",
    image_url5: property?.image_url5 || property?.imageUrl5 || "",
    image_url6: property?.image_url6 || property?.imageUrl6 || "",
    image_url7: property?.image_url7 || property?.imageUrl7 || "",
    image_url8: property?.image_url8 || property?.imageUrl8 || "",
    image_url9: property?.image_url9 || property?.imageUrl9 || "",
    youtube_url: property?.youtube_url || "",
    status_dijual: property?.status === "dijual" || property?.status === "dijual_disewakan" || false,
    status_disewakan: property?.status === "disewakan" || property?.status === "dijual_disewakan" || false,
    owner_contact: property?.owner_contact || property?.ownerContact || "",
    is_hot: property?.is_hot || false,
    is_sold: property?.is_sold || false,
    is_property_pilihan: property?.is_property_pilihan || false,
    is_premium: property?.is_premium || false,
    is_featured: property?.is_featured || false,
    meta_title: property?.meta_title || "",
    meta_description: property?.meta_description || "",
    kelengkapan: property?.kelengkapan || "",
    status_legalitas: property?.status_legalitas || "On Hand",
    lebar_depan: property?.lebar_depan || "",
    jumlah_lantai: property?.jumlah_lantai || "",
    jenis_kost: property?.jenis_kost || "",
    jenis_hotel: property?.jenis_hotel || "",
    ruang_penjaga: property?.ruang_penjaga || false,
    token_listrik_perkamar: property?.token_listrik_perkamar || false,
    no_unit: property?.no_unit || "",
    bank_terkait: property?.bank_terkait || "",
    outstanding_bank: property?.outstanding_bank || "",
    dekat_sungai: property?.dekat_sungai || false,
    jarak_sungai: property?.jarak_sungai || "",
    dekat_makam: property?.dekat_makam || false,
    jarak_makam: property?.jarak_makam || "",
    dekat_sutet: property?.dekat_sutet || false,
    jarak_sutet: property?.jarak_sutet || "",
    lebar_jalan: property?.lebar_jalan || "",
    alasan_dijual: property?.alasan_dijual || "",
    harga_sewa_tahunan: property?.harga_sewa_tahunan || "",
    harga_nego: property?.harga_nego !== false,
    harga_nett: property?.harga_nett || false,
    income_per_bulan: property?.income_per_bulan || "",
    biaya_pengeluaran_per_bulan: property?.biaya_pengeluaran_per_bulan || "",
    harga_sewa_kamar: property?.harga_sewa_kamar || "",
    google_maps_link: property?.google_maps_link || "",
    source_input: property?.source_input || sourceInput,
    publish_status: property?.publish_status || (sourceInput === 'OWNER' ? 'PENDING_REVIEW' : 'APPROVED'),
    agreement_status: property?.agreement_status || "none",
  };
}

/**
 * Validate required fields
 */
export function validateForm(formData: PropertyFormData): { valid: boolean; message?: string } {
  if (!formData.jenis_properti) {
    return { valid: false, message: "Pilih jenis properti" };
  }

  if (!formData.provinsi?.trim()) {
    return { valid: false, message: "Provinsi wajib diisi" };
  }

  if (!formData.kabupaten?.trim()) {
    return { valid: false, message: "Kabupaten/Kota wajib diisi" };
  }

  return { valid: true };
}
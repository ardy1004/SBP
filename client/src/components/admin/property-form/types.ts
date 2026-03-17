/**
 * Types for Production Property Form
 */

export interface OwnerData {
  nama_lengkap: string;
  no_ktp: string;
  alamat_ktp: string;
  whatsapp_1: string;
}

export interface AgreementData {
  id?: string;
  agreement_type: string;
  exclusive_booster_duration_months: number;
  meta_ads_enabled: boolean;
  tiktok_ads_enabled: boolean;
}

export interface PropertyFormData {
  // Core fields
  kode_listing: string;
  judul_properti: string;
  deskripsi: string;
  harga_properti: string;
  harga_per_meter: boolean;
  price_old: string;
  luas_tanah: string;
  luas_bangunan: string;
  kamar_tidur: string;
  kamar_mandi: string;
  jenis_properti: string;
  legalitas: string;
  shgb_expired_at: string;
  provinsi: string;
  kabupaten: string;
  kecamatan: string;
  kelurahan: string;
  alamat_lengkap: string;
  
  // Images
  image_url: string;
  image_url1: string;
  image_url2: string;
  image_url3: string;
  image_url4: string;
  image_url5: string;
  image_url6: string;
  image_url7: string;
  image_url8: string;
  image_url9: string;
  youtube_url: string;
  
  // Status
  status_dijual: boolean;
  status_disewakan: boolean;
  
  // Owner Contact
  owner_contact: string;
  
  // Labels
  is_hot: boolean;
  is_sold: boolean;
  is_property_pilihan: boolean;
  is_premium: boolean;
  is_featured: boolean;
  
  // Meta
  meta_title: string;
  meta_description: string;
  
  // Extension fields
  lebar_depan: string;
  jumlah_lantai: string;
  jenis_kost: string;
  jenis_hotel: string;
  ruang_penjaga: boolean;
  token_listrik_perkamar: boolean;
  no_unit: string;
  kelengkapan: string;
  status_legalitas: string;
  bank_terkait: string;
  outstanding_bank: string;
  dekat_sungai: boolean;
  jarak_sungai: string;
  dekat_makam: boolean;
  jarak_makam: string;
  dekat_sutet: boolean;
  jarak_sutet: string;
  lebar_jalan: string;
  alasan_dijual: string;
  
  // Price variants
  harga_sewa_tahunan: string;
  harga_nego: boolean;
  harga_nett: boolean;
  
  // Income/Operational
  income_per_bulan: string;
  biaya_pengeluaran_per_bulan: string;
  harga_sewa_kamar: string;
  
  // Google Maps
  google_maps_link: string;
  
  // Source tracking
  source_input: string;
  publish_status: string;
  
  // Agreement
  agreement_status: string;
}

export interface ProductionPropertyFormProps {
  property?: any;
  sourceInput: 'ADMIN' | 'OWNER';
  ownerData?: OwnerData | null;
  agreementData?: AgreementData | null;
  agreementId?: string | null;
  onSuccess?: (propertyId: string, goToComplete?: boolean) => void;
}

export type PropertyType = 
  | 'rumah' 
  | 'tanah' 
  | 'kost' 
  | 'hotel' 
  | 'homestay' 
  | 'villa' 
  | 'apartment' 
  | 'gudang' 
  | 'komersial';

export interface PropertyTypeOption {
  value: PropertyType;
  label: string;
}

export interface LegalitasOption {
  value: string;
  label: string;
}

export interface HotelTypeOption {
  value: string;
  label: string;
}
/**
 * Constants for Production Property Form
 */

import type { PropertyTypeOption, LegalitasOption, HotelTypeOption } from './types';

// PROPERTY TYPES - maps to properties.jenis_properti
export const PROPERTY_TYPES: PropertyTypeOption[] = [
  { value: "rumah", label: "Rumah" },
  { value: "tanah", label: "Tanah" },
  { value: "kost", label: "Kost" },
  { value: "hotel", label: "Hotel" },
  { value: "homestay", label: "Homestay / Guesthouse" },
  { value: "villa", label: "Villa" },
  { value: "apartment", label: "Apartment" },
  { value: "gudang", label: "Gudang" },
  { value: "komersial", label: "Bangunan Komersial" },
];

// LEGALITAS - sesuai request user
export const LEGALITAS_OPTIONS: LegalitasOption[] = [
  { value: "SHM & IMB", label: "SHM & IMB / PBG Lengkap" },
  { value: "SHGB & IMB", label: "SHGB & IMB / PBG Lengkap (Berlaku Sampai: [tgl])" },
  { value: "SHM Saja", label: "SHM Pekarangan Saja Tanpa IMB / PBG" },
  { value: "SHM Sawah", label: "SHM Sawah / Tegalan" },
  { value: "SHGB Saja", label: "SHGB Saja Tanpa IMB / PBG" },
  { value: "Girik", label: "Girik / Letter C / PPJB / dll" },
  { value: "Izin Usaha", label: "Izin Usaha" },
];

// JENIS HOTEL - sesuai request user
export const JENIS_HOTEL_OPTIONS: HotelTypeOption[] = [
  { value: "Budget", label: "Budget / Melati" },
  { value: "Bintang 1", label: "Bintang 1" },
  { value: "Bintang 2", label: "Bintang 2" },
  { value: "Bintang 3", label: "Bintang 3" },
  { value: "Bintang 4", label: "Bintang 4" },
  { value: "Bintang 5", label: "Bintang 5" },
  { value: "Boutique", label: "Boutique" },
];

// KELENGKAPAN OPTIONS
export const KELENGKAPAN_OPTIONS = [
  { value: "Fully Furnished", label: "Fully Furnished" },
  { value: "Semi Furnished", label: "Semi Furnished" },
  { value: "Unfurnished", label: "Unfurnished" },
];

// JENIS KOST OPTIONS
export const JENIS_KOST_OPTIONS = [
  { value: "Putra", label: "Putra" },
  { value: "Putri", label: "Putri" },
  { value: "Campur", label: "Campur" },
];

// Default form data
export const DEFAULT_FORM_DATA = {
  kode_listing: "",
  judul_properti: "",
  deskripsi: "",
  harga_properti: "",
  harga_per_meter: false,
  price_old: "",
  luas_tanah: "",
  luas_bangunan: "",
  kamar_tidur: "",
  kamar_mandi: "",
  jenis_properti: "",
  legalitas: "",
  shgb_expired_at: "",
  provinsi: "",
  kabupaten: "",
  kecamatan: "",
  kelurahan: "",
  alamat_lengkap: "",
  image_url: "",
  image_url1: "",
  image_url2: "",
  image_url3: "",
  image_url4: "",
  image_url5: "",
  image_url6: "",
  image_url7: "",
  image_url8: "",
  image_url9: "",
  youtube_url: "",
  status_dijual: false,
  status_disewakan: false,
  owner_contact: "",
  is_hot: false,
  is_sold: false,
  is_property_pilihan: false,
  is_premium: false,
  is_featured: false,
  meta_title: "",
  meta_description: "",
  lebar_depan: "",
  jumlah_lantai: "",
  jenis_kost: "",
  jenis_hotel: "",
  ruang_penjaga: false,
  token_listrik_perkamar: false,
  no_unit: "",
  kelengkapan: "",
  status_legalitas: "On Hand",
  bank_terkait: "",
  outstanding_bank: "",
  dekat_sungai: false,
  jarak_sungai: "",
  dekat_makam: false,
  jarak_makam: "",
  dekat_sutet: false,
  jarak_sutet: "",
  lebar_jalan: "",
  alasan_dijual: "",
  harga_sewa_tahunan: "",
  harga_nego: true,
  harga_nett: false,
  income_per_bulan: "",
  biaya_pengeluaran_per_bulan: "",
  harga_sewa_kamar: "",
  google_maps_link: "",
  source_input: "ADMIN",
  publish_status: "APPROVED",
  agreement_status: "none",
};
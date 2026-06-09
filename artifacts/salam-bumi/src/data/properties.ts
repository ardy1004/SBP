export interface PropertyBadge {
  is_premium: boolean;
  is_featured: boolean;
  is_hot: boolean;
  is_sold: boolean;
  is_choice: boolean;
}

export interface PropertySpecs {
  lt?: number; // Luas Tanah (m2)
  lb?: number; // Luas Bangunan (m2)
  kt?: number; // Kamar Tidur
  km?: number; // Kamar Mandi
  lantai?: number; // Jumlah Lantai
}

export interface Property {
  id: string;
  listing_code: string;
  title: string;
  slug: string;
  price: number;
  old_price?: number;
  purpose: string;
  type: string;
  location: string;
  specs: PropertySpecs;
  images: string[];
  badges: PropertyBadge;
  legalitas: string;
  status_legalitas: "On Hand" | "On Bank";
  province: string;
  city: string;
  district: string;
  village: string;
  address: string;
  land_area: number;
  building_area: number;
  front_width: number;
  floors: number;
  bedrooms: number;
  bathrooms: number;
  legal_status: string;
  legal_details: string;
  bank_name: string | null;
  outstanding_amount: number | null;
  distance_to_river: number | null;
  distance_to_grave: number | null;
  distance_to_powerline: number | null;
  road_width: number;
  description: string;
  facilities: string[];
  selling_reason: string;
  google_maps_url: string;
  video_url: string | null;
  kost_type?: "Putra" | "Putri" | "Campur";
  views?: number;
  leads?: number;
}

// Property type helpers
export const PROPERTY_TYPE_OPTIONS = [
  "Rumah", "Kost", "Tanah", "Villa", "Ruko", "Apartment", "Hotel", "Homestay", "Gudang"
] as const;

export type PropertyType = typeof PROPERTY_TYPE_OPTIONS[number];

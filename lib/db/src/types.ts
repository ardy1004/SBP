/**
 * TypeScript types untuk tabel-tabel D1 database Salam Bumi Property.
 * Selaras dengan schema.sql dan migrations/0001_initial.sql.
 */

// ---------------------------------------------------------------------------
// admins
// ---------------------------------------------------------------------------
export interface Admin {
  id: string;
  email: string;
  name: string;
  password_hash: string; // format: "salt$<base64>$<hex>"
  role: string;
  photo_url: string | null;
  whatsapp: string | null;
  is_active: number; // 0 | 1
  last_login: number | null; // Unix timestamp
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// properties
// ---------------------------------------------------------------------------
export interface Property {
  id: string;
  listing_code: string;
  title: string;
  slug: string;
  purpose: "Dijual" | "Disewakan" | "Dijual & Disewakan";
  property_type: string;
  price_offer: number;
  price_rent: number;
  old_price: number | null;
  price_type: string | null;
  province: string;
  city: string;
  district: string | null;
  village: string | null;
  address: string | null;
  google_maps_url: string | null;
  video_url: string | null;
  latitude: number | null;
  longitude: number | null;
  land_area: number;
  building_area: number;
  front_width: number | null;
  floors: number;
  bedrooms: number;
  bathrooms: number;
  legal_status: string | null;
  legal_details: string | null;
  ownership_status: string;
  bank_name: string | null;
  outstanding_amount: number | null;
  environmental_status: string;
  distance_to_river: number | null;
  distance_to_grave: number | null;
  distance_to_powerline: number | null;
  road_width: number | null;
  description: string | null;
  facilities: string | null; // JSON array string
  selling_reason: string | null;
  owner_name: string | null;
  owner_whatsapp_1: string | null;
  owner_whatsapp_2: string | null;
  is_premium: number; // 0 | 1
  is_featured: number; // 0 | 1
  is_hot: number; // 0 | 1
  is_sold: number; // 0 | 1
  is_choice: number; // 0 | 1
  views_count: number;
  leads_count: number;
  status: "active" | "draft" | "sold";
  created_at: string; // ISO datetime string
  updated_at: string;
}

// ---------------------------------------------------------------------------
// property_images
// ---------------------------------------------------------------------------
export interface PropertyImage {
  id: string;
  property_id: string;
  url: string;
  filename: string;
  is_primary: number; // 0 | 1
  sort_order: number;
  created_at: string;
}

// ---------------------------------------------------------------------------
// leads
// ---------------------------------------------------------------------------
export interface Lead {
  id: string;
  name: string;
  whatsapp: string;
  email: string | null;
  origin: string | null;
  role: string;
  property_id: string | null;
  property_slug: string | null;
  property_interest: string | null;
  budget: string | null;
  payment_plan: string | null;
  message: string | null;
  source: string;
  status: "new" | "contacted" | "negotiating" | "closed" | "lost";
  priority: "hot" | "warm" | "cold";
  last_contact: string | null;
  next_followup: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// contracts
// ---------------------------------------------------------------------------
export interface Contract {
  id: string;
  contract_number: string;
  listing_code: string | null;
  property_id: string | null;
  property_title: string | null;
  owner_name: string;
  owner_ktp: string | null;
  owner_whatsapp: string | null;
  contract_type: string;
  contract_duration: string | null;
  fee_percent: number;
  signed_date: string | null;
  expiry_date: string | null;
  status: "draft" | "active" | "expired" | "terminated";
  owner_signature: string | null; // base64
  agent_signature: string | null; // base64
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// activity_logs
// ---------------------------------------------------------------------------
export interface ActivityLog {
  id: number; // AUTOINCREMENT
  admin_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  detail: string | null;
  ip_address: string | null;
  created_at: string;
}

// ---------------------------------------------------------------------------
// import_logs
// ---------------------------------------------------------------------------
export interface ImportLog {
  id: string;
  filename: string;
  total_rows: number;
  success_count: number;
  failed_count: number;
  status: "processing" | "completed" | "rolled_back";
  error_log: string | null; // JSON array string
  imported_ids: string | null; // JSON array string
  rollback_available_until: number | null; // Unix timestamp
  created_by: string | null;
  created_at: number; // Unix timestamp
}

// ---------------------------------------------------------------------------
// login_rate_limits
// ---------------------------------------------------------------------------
export interface LoginRateLimit {
  ip: string;
  attempts: number;
  first_attempt_at: number; // Unix timestamp
  locked_until: number; // Unix timestamp (0 = tidak diblokir)
  updated_at: number; // Unix timestamp
}

// ---------------------------------------------------------------------------
// D1 Binding interface helper (untuk digunakan di Cloudflare Workers/Pages Functions)
// ---------------------------------------------------------------------------
export interface D1Env {
  DB: D1Database;
  BUCKET: R2Bucket;
  JWT_SECRET: string;
  R2_PUBLIC_URL?: string;
}

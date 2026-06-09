-- =============================================================================
-- Salam Bumi Property — Canonical Database Schema (SQLite / Cloudflare D1)
-- =============================================================================
-- File ini adalah SINGLE SOURCE OF TRUTH untuk struktur database.
-- Setiap perubahan harus:
--   1. Diupdate di sini
--   2. Dibuatkan file migration baru di /migrations/
--
-- Urutan migration yang sudah dijalankan:
--   0001_initial.sql              — Schema awal
--   001_add_import_logs.sql       — Tabel import_logs
--   002_add_slug_redirects.sql    — Tabel slug_redirects
--   003_add_import_validation.sql — Tabel import_validation
--   004_consolidated_admin_password.sql — Update password admin
--   005_add_login_rate_limits.sql — Tabel login_rate_limits (persistent rate limiting)
--   006_block_legacy_sha256_passwords.sql — Nonaktifkan hash sha256 lama
-- =============================================================================

-- -----------------------------------------------------------------------------
-- admins
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admins (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,           -- format: "salt$<base64>$<hex>"
  role TEXT NOT NULL DEFAULT 'admin',
  photo_url TEXT,
  whatsapp TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  last_login INTEGER,                    -- Unix timestamp
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- -----------------------------------------------------------------------------
-- properties
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS properties (
  id TEXT PRIMARY KEY,
  listing_code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  purpose TEXT NOT NULL,                 -- Dijual | Disewakan | Dijual & Disewakan
  property_type TEXT NOT NULL,           -- Rumah | Kost | Tanah | Villa | Apartment | Ruko | Gudang | Hotel | Homestay
  price_offer INTEGER DEFAULT 0,
  price_rent INTEGER DEFAULT 0,
  old_price INTEGER,
  price_type TEXT,                       -- Nego | Nett
  province TEXT NOT NULL DEFAULT 'DI Yogyakarta',
  city TEXT NOT NULL,
  district TEXT,
  village TEXT,
  address TEXT,
  google_maps_url TEXT,
  video_url TEXT,
  latitude REAL,
  longitude REAL,
  land_area INTEGER DEFAULT 0,
  building_area INTEGER DEFAULT 0,
  front_width INTEGER,
  floors INTEGER DEFAULT 1,
  bedrooms INTEGER DEFAULT 0,
  bathrooms INTEGER DEFAULT 0,
  legal_status TEXT,
  legal_details TEXT,
  ownership_status TEXT DEFAULT 'On Hand',
  bank_name TEXT,
  outstanding_amount INTEGER,
  environmental_status TEXT DEFAULT 'Ya Jauh',
  distance_to_river INTEGER,
  distance_to_grave INTEGER,
  distance_to_powerline INTEGER,
  road_width INTEGER,
  description TEXT,
  facilities TEXT,                       -- JSON array as string
  selling_reason TEXT,
  owner_name TEXT,
  owner_whatsapp_1 TEXT,
  owner_whatsapp_2 TEXT,
  is_premium INTEGER NOT NULL DEFAULT 0,
  is_featured INTEGER NOT NULL DEFAULT 0,
  is_hot INTEGER NOT NULL DEFAULT 0,
  is_sold INTEGER NOT NULL DEFAULT 0,
  is_choice INTEGER NOT NULL DEFAULT 0,
  views_count INTEGER NOT NULL DEFAULT 0,
  leads_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active', -- active | draft | sold
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- -----------------------------------------------------------------------------
-- property_images
-- Source of truth: 0001_initial.sql (url + filename + image_url)
-- Kolom image_url = URL gambar lama (dipertahankan untuk kompatibilitas)
-- Kolom url = URL gambar baru (diprioritaskan). COALESCE(url, image_url) digunakan dalam query.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS property_images (
  id TEXT PRIMARY KEY,
  property_id TEXT NOT NULL,
  url TEXT NOT NULL,                     -- URL gambar (original atau sudah dikonversi webp)
  image_url TEXT,                        -- URL gambar lama (legacy, untuk kompatibilitas)
  filename TEXT NOT NULL,               -- Nama file di R2 bucket
  is_primary INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
);

-- Unique index untuk mencegah duplikat gambar per properti
CREATE UNIQUE INDEX IF NOT EXISTS idx_property_images_unique ON property_images(property_id, url);

-- -----------------------------------------------------------------------------
-- leads
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  email TEXT,
  origin TEXT,                           -- URL halaman asal lead
  role TEXT NOT NULL DEFAULT 'Calon Pembeli',
  property_id TEXT,
  property_slug TEXT,
  property_interest TEXT,
  budget TEXT,
  payment_plan TEXT,
  message TEXT,
  source TEXT NOT NULL DEFAULT 'Website Form',
  status TEXT NOT NULL DEFAULT 'new',   -- new | contacted | negotiating | closed | lost
  priority TEXT NOT NULL DEFAULT 'warm', -- hot | warm | cold
  last_contact TEXT,
  next_followup TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE SET NULL
);

-- -----------------------------------------------------------------------------
-- contracts
-- Source of truth: 0001_initial.sql
-- Kolom fee_percentage dan signed_at dari schema.sql LAMA tidak digunakan.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contracts (
  id TEXT PRIMARY KEY,
  contract_number TEXT NOT NULL UNIQUE,
  listing_code TEXT,
  property_id TEXT,
  property_title TEXT,
  owner_name TEXT NOT NULL,
  owner_ktp TEXT,
  owner_whatsapp TEXT,
  contract_type TEXT NOT NULL,           -- OPEN_LISTING | EXCLUSIVE_BOOSTER | EXCLUSIVE_COMPANY
  contract_duration TEXT,
  fee_percent REAL NOT NULL DEFAULT 3,
  signed_date TEXT,
  expiry_date TEXT,
  status TEXT NOT NULL DEFAULT 'draft',  -- draft | active | expired | terminated
  owner_signature TEXT,                  -- base64 encoded signature image
  agent_signature TEXT,                  -- base64 encoded signature image
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE SET NULL
);

-- -----------------------------------------------------------------------------
-- activity_logs
-- Source of truth: 0001_initial.sql (INTEGER PRIMARY KEY AUTOINCREMENT)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS activity_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  admin_id TEXT,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  detail TEXT,
  ip_address TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (admin_id) REFERENCES admins(id)
);

-- -----------------------------------------------------------------------------
-- import_logs
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS import_logs (
  id TEXT PRIMARY KEY,
  filename TEXT NOT NULL,
  total_rows INTEGER NOT NULL,
  success_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'processing',      -- processing | completed | rolled_back
  error_log TEXT,                        -- JSON array of error objects
  imported_ids TEXT,                     -- JSON array of property IDs yang berhasil diimport
  rollback_available_until INTEGER,      -- Unix timestamp batas rollback (24 jam setelah import)
  created_by TEXT,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (created_by) REFERENCES admins(id)
);

-- -----------------------------------------------------------------------------
-- slug_redirects
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS slug_redirects (
  id TEXT PRIMARY KEY,
  old_slug TEXT NOT NULL,
  new_slug TEXT NOT NULL,
  property_id TEXT NOT NULL,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (property_id) REFERENCES properties(id)
);

-- -----------------------------------------------------------------------------
-- import_validation (temporary storage, TTL 1 jam)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS import_validation (
  id TEXT PRIMARY KEY,
  validation_data TEXT NOT NULL,         -- JSON: { validRows, errors, filename, totalRows }
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  expires_at INTEGER NOT NULL            -- Unix timestamp expiry
);

-- -----------------------------------------------------------------------------
-- login_rate_limits (persistent rate limiting, ganti in-memory Map)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS login_rate_limits (
  ip TEXT PRIMARY KEY,
  attempts INTEGER NOT NULL DEFAULT 0,
  first_attempt_at INTEGER NOT NULL DEFAULT 0,
  locked_until INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

-- =============================================================================
-- INDEXES
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_properties_slug ON properties(slug);
CREATE INDEX IF NOT EXISTS idx_properties_listing_code ON properties(listing_code);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_purpose ON properties(purpose);
CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_is_sold ON properties(is_sold);
CREATE INDEX IF NOT EXISTS idx_properties_location ON properties(province, city, district);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price_offer);
CREATE INDEX IF NOT EXISTS idx_properties_flags ON properties(is_sold, is_premium, is_featured, is_hot);

CREATE INDEX IF NOT EXISTS idx_property_images_property_id ON property_images(property_id);

CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_priority ON leads(priority);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_property ON leads(property_id);

CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);

CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_import_logs_created_by ON import_logs(created_by);
CREATE INDEX IF NOT EXISTS idx_import_logs_status ON import_logs(status);
CREATE INDEX IF NOT EXISTS idx_import_logs_created_at ON import_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_slug_redirects_old_slug ON slug_redirects(old_slug);
CREATE INDEX IF NOT EXISTS idx_slug_redirects_property_id ON slug_redirects(property_id);

CREATE INDEX IF NOT EXISTS idx_login_rate_limits_updated_at ON login_rate_limits(updated_at);

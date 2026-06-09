-- Salam Bumi Property - Database Schema
-- D1 (SQLite) Migration

-- Tabel Admin
CREATE TABLE IF NOT EXISTS admins (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  photo_url TEXT,
  whatsapp TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Tabel Properti
CREATE TABLE IF NOT EXISTS properties (
  id TEXT PRIMARY KEY,
  listing_code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  purpose TEXT NOT NULL, -- Dijual, Disewa, Dijual & Disewa
  property_type TEXT NOT NULL, -- Rumah, Kost, Tanah, Villa, etc
  price_offer INTEGER DEFAULT 0,
  price_rent INTEGER DEFAULT 0,
  old_price INTEGER,
  price_type TEXT, -- Nego, Nett
  province TEXT NOT NULL DEFAULT 'DI Yogyakarta',
  city TEXT NOT NULL,
  district TEXT,
  village TEXT,
  address TEXT,
  google_maps_url TEXT,
  latitude REAL,
  longitude REAL,
  land_area INTEGER DEFAULT 0,
  building_area INTEGER DEFAULT 0,
  front_width INTEGER,
  floors INTEGER DEFAULT 1,
  bedrooms INTEGER DEFAULT 0,
  bathrooms INTEGER DEFAULT 0,
  legal_status TEXT,
  ownership_status TEXT DEFAULT 'On Hand',
  bank_name TEXT,
  outstanding_amount INTEGER,
  environmental_status TEXT DEFAULT 'Ya Jauh',
  distance_to_river INTEGER,
  distance_to_grave INTEGER,
  distance_to_powerline INTEGER,
  road_width INTEGER,
  description TEXT,
  facilities TEXT, -- JSON array as string
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
  status TEXT NOT NULL DEFAULT 'active', -- active, draft, sold
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Tabel Gambar Properti
CREATE TABLE IF NOT EXISTS property_images (
  id TEXT PRIMARY KEY,
  property_id TEXT NOT NULL,
  url TEXT NOT NULL,                     -- URL gambar (original atau sudah dikonversi webp)
  image_url TEXT,                        -- URL gambar lama (legacy)
  filename TEXT NOT NULL,
  is_primary INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
);

-- Tabel Leads
CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  email TEXT,
  origin TEXT,
  role TEXT NOT NULL DEFAULT 'Calon Pembeli',
  property_id TEXT,
  property_slug TEXT,
  property_interest TEXT,
  budget TEXT,
  payment_plan TEXT,
  message TEXT,
  source TEXT NOT NULL DEFAULT 'Website Form',
  status TEXT NOT NULL DEFAULT 'new',
  priority TEXT NOT NULL DEFAULT 'warm',
  last_contact TEXT,
  next_followup TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE SET NULL
);

-- Tabel Kontrak
CREATE TABLE IF NOT EXISTS contracts (
  id TEXT PRIMARY KEY,
  contract_number TEXT NOT NULL UNIQUE,
  listing_code TEXT,
  property_id TEXT,
  property_title TEXT,
  owner_name TEXT NOT NULL,
  owner_ktp TEXT,
  owner_whatsapp TEXT,
  contract_type TEXT NOT NULL, -- OPEN_LISTING, EXCLUSIVE_BOOSTER, EXCLUSIVE_COMPANY
  contract_duration TEXT,
  fee_percent REAL NOT NULL DEFAULT 3,
  signed_date TEXT,
  expiry_date TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  owner_signature TEXT, -- base64
  agent_signature TEXT, -- base64
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE SET NULL
);

-- Tabel Activity Log
CREATE TABLE IF NOT EXISTS activity_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  admin_id TEXT,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  detail TEXT,
  ip_address TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Indexes untuk performa
CREATE INDEX IF NOT EXISTS idx_properties_slug ON properties(slug);
CREATE INDEX IF NOT EXISTS idx_properties_listing_code ON properties(listing_code);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_purpose ON properties(purpose);
CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_is_sold ON properties(is_sold);
CREATE INDEX IF NOT EXISTS idx_property_images_property_id ON property_images(property_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_priority ON leads(priority);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);

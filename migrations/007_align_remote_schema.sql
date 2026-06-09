-- Migration: Align remote D1 schema ke canonical schema.sql
-- Created: 2026-03-31
-- Jalankan via:
--   wrangler d1 execute salambumi-property-db --remote --file=migrations/007_align_remote_schema.sql

-- =============================================================================
-- 0. Bersihkan duplikat di property_images SEBELUM tambah constraint
--    Pertahankan satu row per (property_id, image_url) — yang rowid terkecil
-- =============================================================================

DELETE FROM property_images
WHERE rowid NOT IN (
    SELECT MIN(rowid)
    FROM property_images
    GROUP BY property_id, image_url
);

-- =============================================================================
-- 1. property_images: tambah kolom url dan filename
-- =============================================================================

ALTER TABLE property_images ADD COLUMN url TEXT;
ALTER TABLE property_images ADD COLUMN filename TEXT;

-- Isi dari image_url yang sudah ada
UPDATE property_images SET url = image_url WHERE url IS NULL;

-- Ekstrak filename dari URL (bagian setelah / terakhir)
UPDATE property_images
SET filename = CASE
    WHEN image_url LIKE '%/%'
    THEN substr(image_url, instr(image_url, '/') + 1)
    ELSE image_url
END
WHERE filename IS NULL;

-- Perbaiki: ambil bagian setelah / terakhir dengan cara iteratif
-- (SQLite tidak ada fungsi REGEXP_REPLACE, pakai trick REPLACE+TRIM)
UPDATE property_images
SET filename = replace(url,
    substr(url, 1, length(url) - length(ltrim(url, replace(url, '/', '')))),
    ''
)
WHERE filename IS NOT NULL;

-- =============================================================================
-- 2. contracts: tambah kolom yang hilang
-- =============================================================================

ALTER TABLE contracts ADD COLUMN contract_number TEXT;
ALTER TABLE contracts ADD COLUMN property_id TEXT;
ALTER TABLE contracts ADD COLUMN property_title TEXT;
ALTER TABLE contracts ADD COLUMN fee_percent REAL DEFAULT 3;
ALTER TABLE contracts ADD COLUMN signed_date TEXT;
ALTER TABLE contracts ADD COLUMN expiry_date TEXT;
ALTER TABLE contracts ADD COLUMN notes TEXT;
ALTER TABLE contracts ADD COLUMN updated_at TEXT;

UPDATE contracts SET fee_percent = COALESCE(fee_percentage, 3) WHERE fee_percent IS NULL;
UPDATE contracts SET contract_number = 'SBP-LEGACY-' || substr(id, 1, 8) WHERE contract_number IS NULL;
UPDATE contracts SET signed_date = date(signed_at, 'unixepoch') WHERE signed_date IS NULL AND signed_at IS NOT NULL;
UPDATE contracts SET updated_at = datetime('now') WHERE updated_at IS NULL;

-- =============================================================================
-- 3. properties: tambah leads_count
-- =============================================================================

ALTER TABLE properties ADD COLUMN leads_count INTEGER DEFAULT 0;

-- Hitung leads_count dari data leads yang ada
UPDATE properties
SET leads_count = (
    SELECT COUNT(*) FROM leads WHERE leads.property_id = properties.id
);

-- =============================================================================
-- 4. admins: tambah updated_at
-- =============================================================================

ALTER TABLE admins ADD COLUMN updated_at TEXT;
UPDATE admins SET updated_at = datetime('now') WHERE updated_at IS NULL;

-- =============================================================================
-- 5. Unique index untuk property_images
-- =============================================================================

CREATE UNIQUE INDEX IF NOT EXISTS idx_property_images_unique
    ON property_images(property_id, image_url);

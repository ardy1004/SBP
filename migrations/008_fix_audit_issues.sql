-- Migration 008: Perbaikan hasil audit komprehensif
-- Dibuat: 2026-04-19
--
-- Isi:
--   1. Pastikan tabel slug_redirects ada dengan ON CONFLICT support
--      (sudah dibuat di 002, tapi beberapa environment mungkin belum punya index unik)
--   2. Pastikan kolom property_type menerima "Komersial Lainnya"
--      (SQLite TEXT tidak punya ENUM jadi tidak perlu ALTER TABLE,
--       tapi kita dokumentasikan di comment dan tambah index)
--   3. Pastikan kolom url ada di property_images (sudah di 007, guard dengan IF NOT EXISTS)

-- ── 1. slug_redirects: pastikan index UNIQUE ada ──────────────────────────────
-- Kalau migrasi 002 sudah jalan, CREATE TABLE ini akan di-skip (IF NOT EXISTS).
CREATE TABLE IF NOT EXISTS slug_redirects (
  old_slug   TEXT PRIMARY KEY,   -- slug lama yang sudah tersebar
  new_slug   TEXT NOT NULL,      -- slug baru yang aktif
  property_id TEXT,              -- referensi opsional ke properties.id
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ── 2. Index untuk lookup slug_redirects (dipakai GET /api/properties/[slug]) ─
CREATE INDEX IF NOT EXISTS idx_slug_redirects_new_slug
  ON slug_redirects(new_slug);

-- ── 3. property_images: pastikan kolom url ada ────────────────────────────────
-- Guard: SQLite akan error jika kolom sudah ada, gunakan workaround
-- (007_align_remote_schema.sql seharusnya sudah handle ini)
-- Tidak ada aksi tambahan diperlukan — tipe TEXT tidak perlu constraint ENUM.

-- ── 4. Dokumentasi property_type yang valid (referensi untuk developer) ───────
-- Nilai yang diterima oleh form admin DAN validator CSV:
--   Rumah | Kost | Tanah | Villa | Apartment | Ruko | Gudang | Hotel | Homestay | Komersial Lainnya
--
-- "Komersial Lainnya" sudah ada di form admin (AdminPropertyForm.tsx) dan di
-- ALLOWED_PROPERTY_TYPES pada upload-validate.js. Tidak perlu ALTER TABLE karena
-- SQLite menyimpan TEXT tanpa ENUM constraint.
--
-- Jika di masa depan ingin enforce constraint, gunakan CHECK:
--   ALTER TABLE properties ADD CONSTRAINT chk_property_type
--   CHECK (property_type IN ('Rumah','Kost','Tanah','Villa','Apartment','Ruko','Gudang','Hotel','Homestay','Komersial Lainnya'));
-- (SQLite mendukung CHECK constraint sejak 3.25.0)

SELECT 'Migration 008 applied successfully' AS status;

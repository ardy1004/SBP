-- Migration: Add login_rate_limits table untuk persistent rate limiting
-- Created: 2026-03-31
-- Purpose: Mengganti in-memory Map() yang tidak efektif di Cloudflare Workers
--          (stateless/ephemeral) dengan persistent D1 store.
--
-- Setiap baris merepresentasikan satu IP address dengan:
--   - attempts: jumlah percobaan login gagal dalam window aktif
--   - first_attempt_at: Unix timestamp percobaan pertama dalam window ini
--   - locked_until: Unix timestamp sampai IP ini diblokir (0 = tidak diblokir)

CREATE TABLE IF NOT EXISTS login_rate_limits (
    ip TEXT PRIMARY KEY,
    attempts INTEGER NOT NULL DEFAULT 0,
    first_attempt_at INTEGER NOT NULL DEFAULT 0,
    locked_until INTEGER NOT NULL DEFAULT 0,
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

-- Index untuk cleanup berkala (hapus entri lama)
CREATE INDEX IF NOT EXISTS idx_login_rate_limits_updated_at ON login_rate_limits(updated_at);

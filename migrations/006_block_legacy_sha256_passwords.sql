-- Migration: Nonaktifkan admin yang masih menggunakan hash sha256: lama (tanpa salt)
-- Created: 2026-03-31
-- Purpose: Format sha256: rentan rainbow table attack dan tidak lagi didukung
--          oleh login.js. Admin dengan hash lama tidak akan bisa login sampai
--          password-nya di-reset ke format salt$ yang aman.
--
-- Jika ada admin yang terdampak, reset password mereka dengan:
--   wrangler d1 execute salambumi-property-db \
--     --file=migrations/004_consolidated_admin_password.sql
--
-- Setelah migration ini, jalankan juga 005_add_login_rate_limits.sql jika belum.

-- Nonaktifkan admin dengan hash format lama (sha256: tanpa salt)
UPDATE admins
SET is_active = 0
WHERE password_hash LIKE 'sha256:%';

-- Log warning ke activity_logs untuk setiap admin yang terdampak
-- (format: satu baris per admin dengan hash lama)
INSERT INTO activity_logs (admin_id, action, entity_type, entity_id, detail, ip_address, created_at)
SELECT
    id,
    'Security: Akun dinonaktifkan',
    'admin',
    id,
    'Akun dinonaktifkan karena password_hash menggunakan format lama (sha256: tanpa salt). Reset password dengan menjalankan migration 004_consolidated_admin_password.sql',
    'system',
    datetime('now')
FROM admins
WHERE password_hash LIKE 'sha256:%';

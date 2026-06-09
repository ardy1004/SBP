-- Consolidated migration: Update admin password to correct hash for 'salam2026'
-- This replaces all previous 004_update_admin_password_*.sql files
-- Generated: 2026-03-30

-- Update existing admin if exists
UPDATE admins
SET password_hash = 'salt$XIgC5Z5CgOsleRoaDMJB+w==$9775c3d6ca97afe2eafc5dfd719ca0c2e4fef55112f930bfc6419f916577986e',
    is_active = 1
WHERE email = 'admin@salambumi.xyz';

-- Insert admin if not exists
INSERT INTO admins (id, email, password_hash, name, role, photo_url, whatsapp, is_active, created_at)
SELECT 
    lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || lower(hex(randomblob(2))) || '-' || lower(hex(randomblob(2))) || '-' || lower(hex(randomblob(6))),
    'admin@salambumi.xyz',
    'salt$XIgC5Z5CgOsleRoaDMJB+w==$9775c3d6ca97afe2eafc5dfd719ca0c2e4fef55112f930bfc6419f916577986e',
    'Administrator',
    'admin',
    '',
    '',
    1,
    strftime('%s', 'now')
WHERE NOT EXISTS (SELECT 1 FROM admins WHERE email = 'admin@salambumi.xyz');
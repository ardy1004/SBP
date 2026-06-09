-- Salam Bumi Property - Migration 009: Admin Settings
-- Menyimpan pengaturan admin (profile, company, SEO, notifikasi) secara persisten

CREATE TABLE IF NOT EXISTS admin_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Seed default settings
INSERT OR IGNORE INTO admin_settings (key, value, updated_at) VALUES
  ('admin_name', 'Monica Vera S', datetime('now')),
  ('admin_whatsapp', '6281391278889', datetime('now')),
  ('admin_email', 'admin@salambumi.xyz', datetime('now')),
  ('company_name', 'CV Salam Bumi Property', datetime('now')),
  ('company_address', 'Yogyakarta, DIY', datetime('now')),
  ('company_phone', '0813-9127-8889', datetime('now')),
  ('company_email', 'info@salambumi.xyz', datetime('now')),
  ('company_website', 'https://salambumi.xyz', datetime('now')),
  ('company_instagram', '@salambumiproperty', datetime('now')),
  ('seo_default_title', 'Salam Bumi Property - Agen Properti Yogyakarta Terpercaya', datetime('now')),
  ('seo_default_desc', 'Temukan properti impian Anda di Yogyakarta. Rumah, Kost, Tanah, Villa, Ruko dijual dan disewakan.', datetime('now')),
  ('seo_ga_id', 'G-XXXXXXXXXX', datetime('now')),
  ('seo_search_console', '', datetime('now')),
  ('notif_email', 'true', datetime('now')),
  ('notif_whatsapp', 'true', datetime('now')),
  ('notif_lead_alerts', 'true', datetime('now')),
  ('notif_daily_summary', 'false', datetime('now'));

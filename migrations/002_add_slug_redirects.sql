-- Migration: Add slug_redirects table untuk 301 redirect
-- Created: 2026-03-23
-- Purpose: Track old slugs untuk redirect ke slug baru (SEO preservation)

CREATE TABLE IF NOT EXISTS slug_redirects (
  id TEXT PRIMARY KEY,
  old_slug TEXT NOT NULL,
  new_slug TEXT NOT NULL,
  property_id TEXT NOT NULL,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (property_id) REFERENCES properties(id)
);

-- Index untuk fast lookup
CREATE INDEX IF NOT EXISTS idx_slug_redirects_old_slug ON slug_redirects(old_slug);
CREATE INDEX IF NOT EXISTS idx_slug_redirects_property_id ON slug_redirects(property_id);

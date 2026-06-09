-- Migration: Add import_logs table for CSV bulk upload feature
-- Created: 2026-03-23
-- Purpose: Track all CSV import operations for audit and rollback

-- Create import_logs table
CREATE TABLE IF NOT EXISTS import_logs (
  id TEXT PRIMARY KEY,
  filename TEXT NOT NULL,
  total_rows INTEGER NOT NULL,
  success_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'processing',
  error_log TEXT,
  imported_ids TEXT,
  rollback_available_until INTEGER,
  created_by TEXT,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (created_by) REFERENCES admins(id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_import_logs_created_by ON import_logs(created_by);
CREATE INDEX IF NOT EXISTS idx_import_logs_status ON import_logs(status);
CREATE INDEX IF NOT EXISTS idx_import_logs_created_at ON import_logs(created_at);

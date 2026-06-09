-- import_validation table (for storing validated CSV data temporarily)
CREATE TABLE IF NOT EXISTS import_validation (
    id TEXT PRIMARY KEY,
    validation_data TEXT NOT NULL, -- JSON string of { validRows, errors, filename, totalRows }
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    expires_at INTEGER NOT NULL -- Unix timestamp when this validation expires (e.g., 1 hour)
);
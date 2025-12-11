-- Migration: Add Search Performance Indexes
-- Description: Creates GIN and B-tree indexes for optimal search performance
-- Date: 2025-12-11
-- Version: 2.0.0

-- Enable trigram extension for fuzzy text search
-- This allows similarity searches and improves partial matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================================================
-- PERFORMANCE INDEXES FOR SEARCH
-- ============================================================================

-- GIN indexes for text search (concurrent for zero-downtime deployment)
-- These indexes enable fast ILIKE and similarity searches

-- Index for property titles (highest search priority)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_properties_judul_properti_gin
ON properties USING gin (judul_properti gin_trgm_ops);

-- Index for property descriptions (high search priority)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_properties_deskripsi_gin
ON properties USING gin (deskripsi gin_trgm_ops);

-- Index for full addresses (medium search priority)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_properties_alamat_lengkap_gin
ON properties USING gin (alamat_lengkap gin_trgm_ops);

-- Index for property types (exact match optimization)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_properties_jenis_properti
ON properties (jenis_properti);

-- Index for exact property codes (fast exact matches)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_properties_kode_listing
ON properties (kode_listing);

-- ============================================================================
-- COMPOSITE INDEXES FOR COMMON FILTER COMBINATIONS
-- ============================================================================

-- Composite index for property type + location (most common filter combo)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_properties_type_location_status
ON properties (jenis_properti, kabupaten, provinsi, status);

-- Composite index for price range queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_properties_price_range
ON properties (harga_properti, jenis_properti)
WHERE harga_properti IS NOT NULL;

-- Composite index for area-based searches
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_properties_area_filters
ON properties (luas_tanah, luas_bangunan, jenis_properti)
WHERE luas_tanah IS NOT NULL OR luas_bangunan IS NOT NULL;

-- ============================================================================
-- PARTIAL INDEXES FOR ACTIVE PROPERTIES
-- ============================================================================

-- Index only active (unsold) properties for better performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_properties_active_recent
ON properties (created_at DESC, jenis_properti, kabupaten)
WHERE status IN ('dijual', 'disewakan') AND is_sold = false;

-- Index for premium properties (often featured in search results)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_properties_premium_featured
ON properties (is_premium, is_featured, created_at DESC)
WHERE is_premium = true OR is_featured = true;

-- ============================================================================
-- ANALYTICS AND MONITORING INDEXES
-- ============================================================================

-- Index for search analytics queries (if implemented)
-- CREATE INDEX CONCURRENTLY idx_search_analytics_timestamp
-- ON search_analytics (timestamp DESC, result_count);

-- ============================================================================
-- INDEX MAINTENANCE
-- ============================================================================

-- Analyze tables to update statistics after index creation
ANALYZE properties;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify indexes were created successfully
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'properties'
    AND indexname LIKE 'idx_properties_%'
ORDER BY indexname;

-- Check index sizes and usage
SELECT
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_indexes
JOIN pg_class ON pg_class.relname = pg_indexes.indexname
WHERE tablename = 'properties'
    AND indexname LIKE 'idx_properties_%'
ORDER BY pg_relation_size(indexrelid) DESC;

-- ============================================================================
-- ROLLBACK INSTRUCTIONS
-- ============================================================================

-- To rollback this migration, run:
-- DROP INDEX CONCURRENTLY IF EXISTS idx_properties_judul_properti_gin;
-- DROP INDEX CONCURRENTLY IF EXISTS idx_properties_deskripsi_gin;
-- DROP INDEX CONCURRENTLY IF EXISTS idx_properties_alamat_lengkap_gin;
-- DROP INDEX CONCURRENTLY IF EXISTS idx_properties_jenis_properti;
-- DROP INDEX CONCURRENTLY IF EXISTS idx_properties_kode_listing;
-- DROP INDEX CONCURRENTLY IF EXISTS idx_properties_type_location_status;
-- DROP INDEX CONCURRENTLY IF EXISTS idx_properties_price_range;
-- DROP INDEX CONCURRENTLY IF EXISTS idx_properties_area_filters;
-- DROP INDEX CONCURRENTLY IF EXISTS idx_properties_active_recent;
-- DROP INDEX CONCURRENTLY IF EXISTS idx_properties_premium_featured;

-- Note: pg_trgm extension will remain installed for future use
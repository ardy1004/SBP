-- ============================================================
-- SEO-FRIENDLY FILTER INDEXES FOR HIERARCHICAL PROPERTY FILTERING
-- ============================================================
-- Migration: add_filter_indexes.sql
-- Purpose: Create composite indexes for efficient filtering by:
--          status, jenis_properti, provinsi, kabupaten, kecamatan
--          Supports URL patterns like: /jual/rumah/jawa-timur/surabaya/sawahan
-- ============================================================

-- 1. ADD KECAMATAN COLUMN IF NOT EXISTS
-- Kecamatan is needed for the hierarchical filtering system
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'properties' 
        AND column_name = 'kecamatan'
    ) THEN
        ALTER TABLE public.properties 
        ADD COLUMN kecamatan TEXT;
        
        -- Add comment for documentation
        COMMENT ON COLUMN public.properties.kecamatan IS 'District/Kecamatan for hierarchical filtering in SEO-friendly URLs';
    END IF;
END $$;

-- 2. CREATE COMPOSITE INDEXES FOR HIERARCHICAL FILTERING
-- These indexes support queries with LEFT-MOST PREFIX matching
-- Order matters: most selective columns first

-- Primary composite index for full hierarchy
-- Supports queries like: status + jenis_properti + provinsi + kabupaten + kecamatan
-- Also supports: status + jenis_properti + provinsi + kabupaten
-- Also supports: status + jenis_properti + provinsi
-- Also supports: status + jenis_properti
-- Also supports: status
CREATE INDEX IF NOT EXISTS idx_properties_filter_hierarchy 
ON public.properties (status, jenis_properti, provinsi, kabupaten, kecamatan);

-- Alternative index for queries starting with jenis_properti
-- Useful when filtering by property type first
CREATE INDEX IF NOT EXISTS idx_properties_jenis_hierarchy 
ON public.properties (jenis_properti, status, provinsi, kabupaten, kecamatan);

-- 3. CREATE INDIVIDUAL INDEXES FOR COMMON FILTERS
-- These support single-column filters and improve query performance

CREATE INDEX IF NOT EXISTS idx_properties_status 
ON public.properties (status) 
WHERE status IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_properties_jenis_properti 
ON public.properties (jenis_properti) 
WHERE jenis_properti IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_properties_provinsi 
ON public.properties (provinsi) 
WHERE provinsi IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_properties_kabupaten 
ON public.properties (kabupaten) 
WHERE kabupaten IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_properties_kecamatan 
ON public.properties (kecamatan) 
WHERE kecamatan IS NOT NULL;

-- 4. CREATE INDEX FOR PRICE RANGE QUERIES
-- Common for filtering by price ranges
CREATE INDEX IF NOT EXISTS idx_properties_price 
ON public.properties (harga_properti) 
WHERE harga_properti IS NOT NULL;

-- 5. CREATE PARTIAL INDEX FOR ACTIVE LISTINGS
-- Most queries will filter for active (non-sold) properties
CREATE INDEX IF NOT EXISTS idx_properties_active 
ON public.properties (status, jenis_properti, provinsi, kabupaten, kecamatan) 
WHERE is_sold = false OR is_sold IS NULL;

-- 6. CREATE INDEX FOR PREMIUM/FEATURED SORTING
-- Supports sorting by premium properties first
CREATE INDEX IF NOT EXISTS idx_properties_featured 
ON public.properties (is_premium DESC, is_featured DESC, is_hot DESC, created_at DESC) 
WHERE (is_sold = false OR is_sold IS NULL);

-- 7. CREATE FULL-TEXT SEARCH INDEX (if using PostgreSQL FTS)
-- Supports text search on property titles and descriptions
DO $$
BEGIN
    -- Check if pg_trgm extension is available
    IF EXISTS (
        SELECT 1 FROM pg_available_extensions WHERE name = 'pg_trgm'
    ) THEN
        CREATE EXTENSION IF NOT EXISTS pg_trgm;
        
        -- Create GIN index for trigram search on judul_properti
        CREATE INDEX IF NOT EXISTS idx_properties_judul_trgm 
        ON public.properties USING gin (judul_properti gin_trgm_ops);
    END IF;
END $$;

-- 8. CREATE INDEX FOR SITEMAP GENERATION
-- Optimizes queries that fetch all active properties for sitemap
CREATE INDEX IF NOT EXISTS idx_properties_sitemap 
ON public.properties (id, status, jenis_properti, provinsi, kabupaten, kecamatan, updated_at) 
WHERE is_sold = false OR is_sold IS NULL;

-- 9. CREATE INDEX FOR GEOLOCATION QUERIES
-- Supports queries filtering by location combinations
CREATE INDEX IF NOT EXISTS idx_properties_location 
ON public.properties (provinsi, kabupaten, kecamatan, status) 
WHERE provinsi IS NOT NULL AND kabupaten IS NOT NULL;

-- 10. OPTIMIZE INDEX FOR COUNT QUERIES
-- Fast count queries for pagination
CREATE INDEX IF NOT EXISTS idx_properties_count 
ON public.properties (status, jenis_properti, provinsi, kabupaten, kecamatan, is_sold);

-- ============================================================
-- INDEX MAINTENANCE NOTES
-- ============================================================
-- To check index usage:
--   SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read 
--   FROM pg_stat_user_indexes 
--   WHERE tablename = 'properties';

-- To analyze table after creating indexes:
--   ANALYZE public.properties;

-- To see query plans:
--   EXPLAIN ANALYZE SELECT * FROM properties 
--   WHERE status = 'JUAL' AND jenis_properti = 'Rumah' 
--   AND provinsi = 'Jawa Timur';
-- ============================================================

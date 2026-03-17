-- Migration: Add Full-Text Search Support
-- Description: Implements PostgreSQL Full-Text Search with weighted ranking
-- Date: 2025-12-11
-- Version: 2.0.0

-- ============================================================================
-- FULL-TEXT SEARCH IMPLEMENTATION
-- ============================================================================

-- Add computed search vector column for FTS
-- This column is automatically maintained and indexed
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS search_vector tsvector
GENERATED ALWAYS AS (
  -- Weighted search vector for optimal relevance ranking
  -- 'A' weight (highest): Property codes and titles
  setweight(to_tsvector('indonesian', coalesce(kode_listing, '')), 'A') ||
  setweight(to_tsvector('indonesian', coalesce(judul_properti, '')), 'A') ||

  -- 'B' weight (high): Descriptions and property types
  setweight(to_tsvector('indonesian', coalesce(deskripsi, '')), 'B') ||
  setweight(to_tsvector('indonesian', coalesce(jenis_properti, '')), 'B') ||

  -- 'C' weight (medium): Location information
  setweight(to_tsvector('indonesian', coalesce(alamat_lengkap, '')), 'C') ||
  setweight(to_tsvector('indonesian', coalesce(kabupaten, '')), 'C') ||
  setweight(to_tsvector('indonesian', coalesce(provinsi, '')), 'C') ||

  -- 'D' weight (lowest): Status and other metadata
  setweight(to_tsvector('indonesian', coalesce(status, '')), 'D')
) STORED;

-- Create GIN index for full-text search queries
-- This enables fast FTS queries with ranking
CREATE INDEX IF NOT EXISTS idx_properties_search_vector
ON properties USING gin(search_vector);

-- ============================================================================
-- ADVANCED RANKING FUNCTIONS
-- ============================================================================

-- Function to calculate advanced search ranking
-- Combines FTS rank with additional relevance factors
CREATE OR REPLACE FUNCTION search_rank(
  search_query text,
  property_record properties
) RETURNS float AS $$
DECLARE
  fts_rank float := 0;
  exact_match_bonus float := 0;
  location_bonus float := 0;
  recency_bonus float := 0;
  premium_bonus float := 0;
BEGIN
  -- Base FTS rank (0-1 scale, higher is better)
  SELECT ts_rank(search_vector, plainto_tsquery('indonesian', search_query))
  INTO fts_rank
  FROM properties
  WHERE id = property_record.id;

  -- Exact matches get significant bonus
  IF property_record.kode_listing ILIKE '%' || search_query || '%' THEN
    exact_match_bonus := 0.5;  -- Exact code match is very valuable
  END IF;

  IF property_record.judul_properti ILIKE '%' || search_query || '%' THEN
    exact_match_bonus := exact_match_bonus + 0.3;
  END IF;

  -- Location relevance bonus
  IF property_record.alamat_lengkap ILIKE '%' || search_query || '%' THEN
    location_bonus := 0.25;
  END IF;

  IF property_record.kabupaten ILIKE '%' || search_query || '%' THEN
    location_bonus := location_bonus + 0.15;
  END IF;

  -- Recency bonus (newer properties rank higher)
  -- Properties from last 30 days get bonus, decreasing over time
  recency_bonus := GREATEST(0,
    1 - EXTRACT(EPOCH FROM (NOW() - property_record.created_at)) / (30 * 24 * 60 * 60)
  ) * 0.1;

  -- Premium/featured properties get slight boost
  IF property_record.is_premium THEN
    premium_bonus := 0.05;
  END IF;

  IF property_record.is_featured THEN
    premium_bonus := premium_bonus + 0.03;
  END IF;

  -- Return combined score (0-2 scale)
  RETURN fts_rank + exact_match_bonus + location_bonus + recency_bonus + premium_bonus;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- SEARCH ANALYTICS TABLES
-- ============================================================================

-- Table for tracking search performance and user behavior
CREATE TABLE IF NOT EXISTS search_analytics (
  id SERIAL PRIMARY KEY,
  search_term TEXT NOT NULL,
  result_count INTEGER NOT NULL DEFAULT 0,
  search_duration INTEGER NOT NULL DEFAULT 0, -- milliseconds
  strategy_used TEXT NOT NULL DEFAULT 'unknown', -- 'fts', 'hybrid', 'fallback'
  user_id UUID,
  session_id TEXT,
  user_agent TEXT,
  ip_address INET,
  filters_used JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_search_analytics_timestamp
ON search_analytics (timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_search_analytics_term
ON search_analytics (search_term);

CREATE INDEX IF NOT EXISTS idx_search_analytics_strategy
ON search_analytics (strategy_used, timestamp DESC);

-- ============================================================================
-- SEARCH SUGGESTIONS TABLE
-- ============================================================================

-- Table for storing search suggestions and corrections
CREATE TABLE IF NOT EXISTS search_suggestions (
  id SERIAL PRIMARY KEY,
  term TEXT NOT NULL UNIQUE,
  suggestion TEXT NOT NULL,
  weight INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert common Indonesian real estate search corrections
INSERT INTO search_suggestions (term, suggestion, weight) VALUES
  ('rmh', 'rumah', 10),
  ('kostan', 'kost', 8),
  ('apartement', 'apartemen', 9),
  ('villa mewah', 'villa', 7),
  ('rukan', 'ruko', 8),
  ('tanah kavling', 'tanah', 6),
  ('jogjakarta', 'yogyakarta', 10),
  ('jogja kota', 'yogyakarta', 9),
  ('solo', 'surakarta', 10),
  ('bandung barat', 'bandung', 7)
ON CONFLICT (term) DO NOTHING;

-- ============================================================================
-- UTILITY FUNCTIONS
-- ============================================================================

-- Function to get search suggestions for autocomplete
CREATE OR REPLACE FUNCTION get_search_suggestions(
  partial_term text,
  limit_count integer DEFAULT 10
) RETURNS TABLE (
  suggestion text,
  weight integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ss.suggestion,
    ss.weight
  FROM search_suggestions ss
  WHERE
    ss.is_active = true
    AND (
      ss.term ILIKE partial_term || '%' OR
      ss.suggestion ILIKE partial_term || '%'
    )
  ORDER BY
    ss.weight DESC,
    length(ss.suggestion) ASC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to log search analytics
CREATE OR REPLACE FUNCTION log_search_analytics(
  p_search_term text,
  p_result_count integer,
  p_search_duration integer,
  p_strategy_used text,
  p_filters_used jsonb DEFAULT '{}',
  p_user_id uuid DEFAULT NULL,
  p_session_id text DEFAULT NULL,
  p_user_agent text DEFAULT NULL,
  p_ip_address inet DEFAULT NULL
) RETURNS void AS $$
BEGIN
  INSERT INTO search_analytics (
    search_term,
    result_count,
    search_duration,
    strategy_used,
    filters_used,
    user_id,
    session_id,
    user_agent,
    ip_address
  ) VALUES (
    p_search_term,
    p_result_count,
    p_search_duration,
    p_strategy_used,
    p_filters_used,
    p_user_id,
    p_session_id,
    p_user_agent,
    p_ip_address
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PERFORMANCE OPTIMIZATION
-- ============================================================================

-- Analyze tables to update query planner statistics
ANALYZE properties;
ANALYZE search_analytics;
ANALYZE search_suggestions;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Test FTS functionality
SELECT
  id,
  kode_listing,
  judul_properti,
  ts_rank(search_vector, plainto_tsquery('indonesian', 'rumah jogja')) as rank
FROM properties
WHERE search_vector @@ plainto_tsquery('indonesian', 'rumah jogja')
ORDER BY rank DESC
LIMIT 5;

-- Check search vector generation
SELECT
  id,
  kode_listing,
  judul_properti,
  search_vector
FROM properties
WHERE kode_listing IS NOT NULL
LIMIT 3;

-- Test ranking function
SELECT
  id,
  kode_listing,
  judul_properti,
  search_rank('rumah', properties.*) as custom_rank
FROM properties
WHERE judul_properti ILIKE '%rumah%'
ORDER BY custom_rank DESC
LIMIT 5;

-- ============================================================================
-- ROLLBACK INSTRUCTIONS
-- ============================================================================

-- To rollback this migration, run:
-- DROP FUNCTION IF EXISTS search_rank(text, properties);
-- DROP FUNCTION IF EXISTS get_search_suggestions(text, integer);
-- DROP FUNCTION IF EXISTS log_search_analytics(text, integer, integer, text, jsonb, uuid, text, text, inet);
-- DROP TABLE IF EXISTS search_suggestions;
-- DROP TABLE IF EXISTS search_analytics;
-- DROP INDEX IF EXISTS idx_properties_search_vector;
-- ALTER TABLE properties DROP COLUMN IF EXISTS search_vector;

-- Note: This will remove all search analytics data and FTS functionality
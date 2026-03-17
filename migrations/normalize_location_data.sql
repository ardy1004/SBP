/**
 * Migration: Normalize Location Data
 *
 * This migration normalizes existing location data in the properties table
 * to match the standardized location master data.
 *
 * Issues addressed:
 * 1. Inconsistent provinsi formats (e.g., "DI.Yogyakarta" vs "DI Yogyakarta")
 * 2. Missing or inconsistent kabupaten formats
 * 3. Special cases like "Kota Yogyakarta" vs "Yogyakarta"
 */

-- =====================================================
-- STEP 1: Create mapping table for location normalization
-- =====================================================

CREATE TABLE IF NOT EXISTS location_mapping (
    id SERIAL PRIMARY KEY,
    original_value VARCHAR(255) NOT NULL,
    normalized_value VARCHAR(255) NOT NULL,
    location_type VARCHAR(50) NOT NULL, -- 'provinsi' or 'kabupaten'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Clear existing data
TRUNCATE location_mapping;

-- =====================================================
-- STEP 2: Insert provinsi mappings
-- =====================================================

INSERT INTO location_mapping (original_value, normalized_value, location_type) VALUES
-- DKI Jakarta variations
('dki jakarta', 'DKI Jakarta', 'provinsi'),
('jakarta', 'DKI Jakarta', 'provinsi'),
('dki', 'DKI Jakarta', 'provinsi'),
('dki jaya', 'DKI Jakarta', 'provinsi'),

-- DI Yogyakarta variations
('di.yogyakarta', 'DI Yogyakarta', 'provinsi'),
('di yogyakarta', 'DI Yogyakarta', 'provinsi'),
('d.i yogyakarta', 'DI Yogyakarta', 'provinsi'),
('diy', 'DI Yogyakarta', 'provinsi'),
('yogyakarta', 'DI Yogyakarta', 'provinsi'),
('daerah istimewa yogyakarta', 'DI Yogyakarta', 'provinsi'),

-- Jawa Barat variations
('jawa barat', 'Jawa Barat', 'provinsi'),
('jabar', 'Jawa Barat', 'provinsi'),

-- Jawa Tengah variations
('jawa tengah', 'Jawa Tengah', 'provinsi'),
('jateng', 'Jawa Tengah', 'provinsi'),

-- Jawa Timur variations
('jawa timur', 'Jawa Timur', 'provinsi'),
('jatim', 'Jawa Timur', 'provinsi'),

-- Banten variations
('banten', 'Banten', 'provinsi'),

-- Bali variations
('bali', 'Bali', 'provinsi'),

-- Sumatera Utara variations
('sumatera utara', 'Sumatera Utara', 'provinsi'),
('sumut', 'Sumatera Utara', 'provinsi'),
('sumatra utara', 'Sumatera Utara', 'provinsi'),

-- Sumatera Barat variations
('sumatera barat', 'Sumatera Barat', 'provinsi'),
('sumbar', 'Sumatera Barat', 'provinsi'),
('sumatra barat', 'Sumatera Barat', 'provinsi'),

-- Sumatera Selatan variations
('sumatera selatan', 'Sumatera Selatan', 'provinsi'),
('sumsel', 'Sumatera Selatan', 'provinsi'),
('sumatra selatan', 'Sumatera Selatan', 'provinsi'),

-- Riau variations
('riau', 'Riau', 'provinsi'),

-- Jambi variations
('jambi', 'Jambi', 'provinsi'),

-- Bengkulu variations
('bengkulu', 'Bengkulu', 'provinsi'),

-- Lampung variations
('lampung', 'Lampung', 'provinsi'),

-- Kepulauan Bangka Belitung variations
('kepulauan bangka belitung', 'Kepulauan Bangka Belitung', 'provinsi'),
('bangka belitung', 'Kepulauan Bangka Belitung', 'provinsi'),
('babel', 'Kepulauan Bangka Belitung', 'provinsi'),

-- Kepulauan Riau variations
('kepulauan riau', 'Kepulauan Riau', 'provinsi'),
('kepri', 'Kepulauan Riau', 'provinsi'),

-- Aceh variations
('aceh', 'Aceh', 'provinsi'),
('nanggroe aceh darussalam', 'Aceh', 'provinsi'),
('nad', 'Aceh', 'provinsi'),

-- Kalimantan Barat variations
('kalimantan barat', 'Kalimantan Barat', 'provinsi'),
('kalbar', 'Kalimantan Barat', 'provinsi'),

-- Kalimantan Tengah variations
('kalimantan tengah', 'Kalimantan Tengah', 'provinsi'),
('kalteng', 'Kalimantan Tengah', 'provinsi'),

-- Kalimantan Selatan variations
('kalimantan selatan', 'Kalimantan Selatan', 'provinsi'),
('kalsel', 'Kalimantan Selatan', 'provinsi'),

-- Kalimantan Timur variations
('kalimantan timur', 'Kalimantan Timur', 'provinsi'),
('kaltim', 'Kalimantan Timur', 'provinsi'),

-- Kalimantan Utara variations
('kalimantan utara', 'Kalimantan Utara', 'provinsi'),
('kalut', 'Kalimantan Utara', 'provinsi'),
('kaltara', 'Kalimantan Utara', 'provinsi'),

-- Sulawesi Utara variations
('sulawesi utara', 'Sulawesi Utara', 'provinsi'),
('sulut', 'Sulawesi Utara', 'provinsi'),

-- Sulawesi Tengah variations
('sulawesi tengah', 'Sulawesi Tengah', 'provinsi'),
('sulteng', 'Sulawesi Tengah', 'provinsi'),

-- Sulawesi Selatan variations
('sulawesi selatan', 'Sulawesi Selatan', 'provinsi'),
('sulsel', 'Sulawesi Selatan', 'provinsi'),

-- Sulawesi Tenggara variations
('sulawesi tenggara', 'Sulawesi Tenggara', 'provinsi'),
('sultra', 'Sulawesi Tenggara', 'provinsi'),

-- Sulawesi Barat variations
('sulawesi barat', 'Sulawesi Barat', 'provinsi'),
('sulbar', 'Sulawesi Barat', 'provinsi'),

-- Gorontalo variations
('gorontalo', 'Gorontalo', 'provinsi'),

-- Maluku variations
('maluku', 'Maluku', 'provinsi'),

-- Maluku Utara variations
('maluku utara', 'Maluku Utara', 'provinsi'),
('malut', 'Maluku Utara', 'provinsi'),

-- Papua variations
('papua', 'Papua', 'provinsi'),

-- Papua Barat variations
('papua barat', 'Papua Barat', 'provinsi'),

-- Nusa Tenggara Barat variations
('nusa tenggara barat', 'Nusa Tenggara Barat', 'provinsi'),
('ntb', 'Nusa Tenggara Barat', 'provinsi'),

-- Nusa Tenggara Timur variations
('nusa tenggara timur', 'Nusa Tenggara Timur', 'provinsi'),
('ntt', 'Nusa Tenggara Timur', 'provinsi');

-- =====================================================
-- STEP 3: Insert kabupaten mappings (focus on Yogyakarta area first)
-- =====================================================

INSERT INTO location_mapping (original_value, normalized_value, location_type) VALUES
-- Yogyakarta kabupaten variations
('sleman', 'Sleman', 'kabupaten'),
('kabupaten sleman', 'Sleman', 'kabupaten'),

('bantul', 'Bantul', 'kabupaten'),
('kabupaten bantul', 'Bantul', 'kabupaten'),

('kulon progo', 'Kulon Progo', 'kabupaten'),
('kulonprogo', 'Kulon Progo', 'kabupaten'),
('kabupaten kulon progo', 'Kulon Progo', 'kabupaten'),

('gunung kidul', 'Gunung Kidul', 'kabupaten'),
('gunungkidul', 'Gunung Kidul', 'kabupaten'),
('kabupaten gunung kidul', 'Gunung Kidul', 'kabupaten'),

('kota yogyakarta', 'Kota Yogyakarta', 'kabupaten'),
('yogyakarta', 'Kota Yogyakarta', 'kabupaten'),
('yogyakarta kota', 'Kota Yogyakarta', 'kabupaten'),
('kota jogja', 'Kota Yogyakarta', 'kabupaten'),
('jogja', 'Kota Yogyakarta', 'kabupaten'),
('yogya', 'Kota Yogyakarta', 'kabupaten'),

-- Jakarta kota variations
('kota jakarta pusat', 'Kota Jakarta Pusat', 'kabupaten'),
('jakarta pusat', 'Kota Jakarta Pusat', 'kabupaten'),
('jakpus', 'Kota Jakarta Pusat', 'kabupaten'),

('kota jakarta utara', 'Kota Jakarta Utara', 'kabupaten'),
('jakarta utara', 'Kota Jakarta Utara', 'kabupaten'),
('jakut', 'Kota Jakarta Utara', 'kabupaten'),

('kota jakarta barat', 'Kota Jakarta Barat', 'kabupaten'),
('jakarta barat', 'Kota Jakarta Barat', 'kabupaten'),
('jakbar', 'Kota Jakarta Barat', 'kabupaten'),

('kota jakarta selatan', 'Kota Jakarta Selatan', 'kabupaten'),
('jakarta selatan', 'Kota Jakarta Selatan', 'kabupaten'),
('jaksel', 'Kota Jakarta Selatan', 'kabupaten'),

('kota jakarta timur', 'Kota Jakarta Timur', 'kabupaten'),
('jakarta timur', 'Kota Jakarta Timur', 'kabupaten'),
('jaktim', 'Kota Jakarta Timur', 'kabupaten'),

('kepulauan seribu', 'Kepulauan Seribu', 'kabupaten'),
('kabupaten kepulauan seribu', 'Kepulauan Seribu', 'kabupaten'),

-- Jawa Barat variations
('bogor', 'Bogor', 'kabupaten'),
('kabupaten bogor', 'Bogor', 'kabupaten'),
('kota bogor', 'Kota Bogor', 'kabupaten'),
('bogor kota', 'Kota Bogor', 'kabupaten'),

('bandung', 'Bandung', 'kabupaten'),
('kabupaten bandung', 'Bandung', 'kabupaten'),
('kota bandung', 'Kota Bandung', 'kabupaten'),
('bandung kota', 'Kota Bandung', 'kabupaten'),

('bekasi', 'Bekasi', 'kabupaten'),
('kabupaten bekasi', 'Bekasi', 'kabupaten'),
('kota bekasi', 'Kota Bekasi', 'kabupaten'),
('bekasi kota', 'Kota Bekasi', 'kabupaten'),

('depok', 'Kota Depok', 'kabupaten'),
('kota depok', 'Kota Depok', 'kabupaten'),
('depok kota', 'Kota Depok', 'kabupaten'),

('cirebon', 'Cirebon', 'kabupaten'),
('kabupaten cirebon', 'Cirebon', 'kabupaten'),
('kota cirebon', 'Kota Cirebon', 'kabupaten'),
('cirebon kota', 'Kota Cirebon', 'kabupaten'),

('tasikmalaya', 'Tasikmalaya', 'kabupaten'),
('kabupaten tasikmalaya', 'Tasikmalaya', 'kabupaten'),
('kota tasikmalaya', 'Kota Tasikmalaya', 'kabupaten'),
('tasikmalaya kota', 'Kota Tasikmalaya', 'kabupaten'),

-- Jawa Tengah variations
('semarang', 'Semarang', 'kabupaten'),
('kabupaten semarang', 'Semarang', 'kabupaten'),
('kota semarang', 'Kota Semarang', 'kabupaten'),
('semarang kota', 'Kota Semarang', 'kabupaten'),

('surakarta', 'Kota Surakarta', 'kabupaten'),
('kota surakarta', 'Kota Surakarta', 'kabupaten'),
('solo', 'Kota Surakarta', 'kabupaten'),
('kota solo', 'Kota Surakarta', 'kabupaten'),
('salatiga', 'Kota Salatiga', 'kabupaten'),
('kota salatiga', 'Kota Salatiga', 'kabupaten'),
('pekalongan', 'Pekalongan', 'kabupaten'),
('kabupaten pekalongan', 'Pekalongan', 'kabupaten'),
('kota pekalongan', 'Kota Pekalongan', 'kabupaten'),
('pekalongan kota', 'Kota Pekalongan', 'kabupaten'),
('tegal', 'Tegal', 'kabupaten'),
('kabupaten tegal', 'Tegal', 'kabupaten'),
('kota tegal', 'Kota Tegal', 'kabupaten'),
('tegal kota', 'Kota Tegal', 'kabupaten'),
('magelang', 'Magelang', 'kabupaten'),
('kabupaten magelang', 'Magelang', 'kabupaten'),
('kota magelang', 'Kota Magelang', 'kabupaten'),
('magelang kota', 'Kota Magelang', 'kabupaten'),

-- Jawa Timur variations
('surabaya', 'Kota Surabaya', 'kabupaten'),
('kota surabaya', 'Kota Surabaya', 'kabupaten'),
('surabaya kota', 'Kota Surabaya', 'kabupaten'),

('malang', 'Malang', 'kabupaten'),
('kabupaten malang', 'Malang', 'kabupaten'),
('kota malang', 'Kota Malang', 'kabupaten'),
('malang kota', 'Kota Malang', 'kabupaten'),

('kediri', 'Kediri', 'kabupaten'),
('kabupaten kediri', 'Kediri', 'kabupaten'),
('kota kediri', 'Kota Kediri', 'kabupaten'),
('kediri kota', 'Kota Kediri', 'kabupaten'),

('sidoarjo', 'Sidoarjo', 'kabupaten'),
('kabupaten sidoarjo', 'Sidoarjo', 'kabupaten'),

('gresik', 'Gresik', 'kabupaten'),
('kabupaten gresik', 'Gresik', 'kabupaten'),

-- Bali variations
('denpasar', 'Kota Denpasar', 'kabupaten'),
('kota denpasar', 'Kota Denpasar', 'kabupaten'),
('denpasar kota', 'Kota Denpasar', 'kabupaten'),

('badung', 'Badung', 'kabupaten'),
('kabupaten badung', 'Badung', 'kabupaten'),

('gianyar', 'Gianyar', 'kabupaten'),
('kabupaten gianyar', 'Gianyar', 'kabupaten'),

('tabanan', 'Tabanan', 'kabupaten'),
('kabupaten tabanan', 'Tabanan', 'kabupaten'),

('buleleng', 'Buleleng', 'kabupaten'),
('kabupaten buleleng', 'Buleleng', 'kabupaten'),

('bangli', 'Bangli', 'kabupaten'),
('kabupaten bangli', 'Bangli', 'kabupaten'),

('klungkung', 'Klungkung', 'kabupaten'),
('kabupaten klungkung', 'Klungkung', 'kabupaten'),

('jembrana', 'Jembrana', 'kabupaten'),
('kabupaten jembrana', 'Jembrana', 'kabupaten'),

-- Banten variations
('tangerang', 'Tangerang', 'kabupaten'),
('kabupaten tangerang', 'Tangerang', 'kabupaten'),
('kota tangerang', 'Kota Tangerang', 'kabupaten'),
('tangerang kota', 'Kota Tangerang', 'kabupaten'),

('kota tangerang selatan', 'Kota Tangerang Selatan', 'kabupaten'),
('tangerang selatan', 'Kota Tangerang Selatan', 'kabupaten'),
('tangsel', 'Kota Tangerang Selatan', 'kabupaten'),
('tangerang selatan kota', 'Kota Tangerang Selatan', 'kabupaten'),

('serang', 'Serang', 'kabupaten'),
('kabupaten serang', 'Serang', 'kabupaten'),
('kota serang', 'Kota Serang', 'kabupaten'),
('serang kota', 'Kota Serang', 'kabupaten'),

('cilegon', 'Kota Cilegon', 'kabupaten'),
('kota cilegon', 'Kota Cilegon', 'kabupaten'),
('cilegon kota', 'Kota Cilegon', 'kabupaten'),

('pandeglang', 'Pandeglang', 'kabupaten'),
('kabupaten pandeglang', 'Pandeglang', 'kabupaten'),

('lebak', 'Lebak', 'kabupaten'),
('kabupaten lebak', 'Lebak', 'kabupaten');

-- =====================================================
-- STEP 4: Create function to normalize location data
-- =====================================================

CREATE OR REPLACE FUNCTION normalize_location(
    p_value VARCHAR(255),
    p_type VARCHAR(50)
) RETURNS VARCHAR(255) AS $$
DECLARE
    v_normalized VARCHAR(255);
BEGIN
    -- Try to find exact match in mapping
    SELECT normalized_value INTO v_normalized
    FROM location_mapping
    WHERE LOWER(original_value) = LOWER(p_value)
      AND location_type = p_type
    LIMIT 1;

    -- If found, return normalized value
    IF v_normalized IS NOT NULL THEN
        RETURN v_normalized;
    END IF;

    -- Otherwise, return original value with basic cleanup
    RETURN INITCAP(TRIM(p_value));
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- STEP 5: Preview changes (dry run)
-- =====================================================

-- Show sample of provinsi data that will be changed
SELECT DISTINCT
    provinsi as original_value,
    normalize_location(provinsi, 'provinsi') as normalized_value
FROM properties
WHERE provinsi IS NOT NULL
ORDER BY provinsi;

-- Show sample of kabupaten data that will be changed
SELECT DISTINCT
    kabupaten as original_value,
    normalize_location(kabupaten, 'kabupaten') as normalized_value
FROM properties
WHERE kabupaten IS NOT NULL
ORDER BY kabupaten;

-- =====================================================
-- STEP 6: Apply normalization (uncomment to execute)
-- =====================================================

/*
-- Update provinsi
UPDATE properties
SET provinsi = normalize_location(provinsi, 'provinsi')
WHERE provinsi IS NOT NULL;

-- Update kabupaten
UPDATE properties
SET kabupaten = normalize_location(kabupaten, 'kabupaten')
WHERE kabupaten IS NOT NULL;

-- Verify updates
SELECT DISTINCT provinsi FROM properties ORDER BY provinsi;
SELECT DISTINCT kabupaten FROM properties ORDER BY kabupaten;
*/

-- =====================================================
-- STEP 7: Create indexes for better query performance
-- =====================================================

-- Index for provinsi lookups
CREATE INDEX IF NOT EXISTS idx_properties_provinsi_lower
    ON properties (LOWER(provinsi));

-- Index for kabupaten lookups
CREATE INDEX IF NOT EXISTS idx_properties_kabupaten_lower
    ON properties (LOWER(kabupaten));

-- Composite index for common filter combinations
CREATE INDEX IF NOT EXISTS idx_properties_location_combo
    ON properties (LOWER(provinsi), LOWER(kabupaten));

-- =====================================================
-- STEP 8: Create view for normalized location data
-- =====================================================

CREATE OR REPLACE VIEW properties_location_normalized AS
SELECT
    id,
    judul_properti,
    normalize_location(provinsi, 'provinsi') as provinsi_normalized,
    normalize_location(kabupaten, 'kabupaten') as kabupaten_normalized,
    kecamatan,
    kelurahan,
    status,
    jenis_properti,
    harga_properti,
    is_sold,
    is_premium,
    is_featured
FROM properties
WHERE is_sold = false;

-- =====================================================
-- STEP 9: Documentation
-- =====================================================

COMMENT ON TABLE location_mapping IS 'Mapping table for normalizing location data between various formats and standardized values';
COMMENT ON FUNCTION normalize_location IS 'Function to normalize location values using the location_mapping table';
COMMENT ON VIEW properties_location_normalized IS 'View of properties with normalized location data';

-- Show migration summary
SELECT
    'Location normalization migration prepared' as message,
    (SELECT COUNT(*) FROM location_mapping WHERE location_type = 'provinsi') as provinsi_mappings,
    (SELECT COUNT(*) FROM location_mapping WHERE location_type = 'kabupaten') as kabupaten_mappings,
    (SELECT COUNT(DISTINCT provinsi) FROM properties WHERE provinsi IS NOT NULL) as unique_provinces_in_db,
    (SELECT COUNT(DISTINCT kabupaten) FROM properties WHERE kabupaten IS NOT NULL) as unique_kabupaten_in_db;
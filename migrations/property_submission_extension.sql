-- ============================================================
-- EXTENSION TABLES FOR PROPERTY SUBMISSION SYSTEM
-- Using EXISTING properties table columns - NO MODIFICATION ALLOWED
-- Run this in Supabase SQL Editor
-- ============================================================

-- Drop existing tables if they exist (for clean migration)
DROP TABLE IF EXISTS public.marketing_agreement_logs CASCADE;
DROP TABLE IF EXISTS public.owner_submission_tokens CASCADE;
DROP TABLE IF EXISTS public.owner_profiles CASCADE;

-- 1. OWNER PROFILES TABLE (Extension for owner data)
CREATE TABLE IF NOT EXISTS public.owner_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    
    -- Identity (maps to properties.owner_id later)
    nama_lengkap TEXT NOT NULL,
    no_ktp TEXT NOT NULL,
    alamat_ktp TEXT,
    rt_rw TEXT,
    kelurahan TEXT,
    kecamatan TEXT,
    bertindak_sebagai TEXT DEFAULT 'owner' CHECK (bertindak_sebagai IN ('owner', 'pasangan', 'broker', 'saudara', 'lainnya')),
    
    -- Contact
    whatsapp_1 TEXT NOT NULL,
    whatsapp_2 TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for owner_profiles
ALTER TABLE public.owner_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_profiles_select" ON public.owner_profiles FOR SELECT USING (true);
CREATE POLICY "owner_profiles_insert" ON public.owner_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "owner_profiles_update" ON public.owner_profiles FOR UPDATE USING (true);

-- 2. OWNER SUBMISSION TOKENS TABLE
CREATE TABLE IF NOT EXISTS public.owner_submission_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    
    -- References
    owner_profile_id UUID REFERENCES public.owner_profiles(id),
    property_id TEXT REFERENCES public.properties(id),
    
    -- Token
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    
    -- Status
    status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUBMITTED', 'EXPIRED', 'REVOKED')),
    
    -- Tracking
    access_count INTEGER DEFAULT 0,
    last_accessed_at TIMESTAMPTZ,
    submitted_at TIMESTAMPTZ,
    
    -- Metadata
    created_by TEXT DEFAULT 'admin',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for tokens
ALTER TABLE public.owner_submission_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tokens_select" ON public.owner_submission_tokens FOR SELECT USING (true);
CREATE POLICY "tokens_insert" ON public.owner_submission_tokens FOR INSERT WITH CHECK (true);
CREATE POLICY "tokens_update" ON public.owner_submission_tokens FOR UPDATE USING (true);

-- Indexes
CREATE INDEX idx_tokens_token ON public.owner_submission_tokens(token);
CREATE INDEX idx_tokens_owner ON public.owner_submission_tokens(owner_profile_id);
CREATE INDEX idx_tokens_property ON public.owner_submission_tokens(property_id);

-- 3. MARKETING AGREEMENT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.marketing_agreement_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    
    -- References
    property_id TEXT REFERENCES public.properties(id),
    owner_profile_id UUID REFERENCES public.owner_profiles(id),
    
    -- Agreement Data
    agreement_type TEXT CHECK (agreement_type IN ('open_listing', 'exclusive_booster')),
    
    -- Open Listing
    fee_percent NUMERIC DEFAULT 3,
    fee_timing TEXT DEFAULT 'setelah AJB',
    
    -- Exclusive Booster
    contract_duration_months INTEGER,
    marketing_fee NUMERIC,
    meta_ads_enabled BOOLEAN DEFAULT false,
    meta_ads_admin_fee NUMERIC,
    meta_ads_daily_budget NUMERIC,
    tiktok_ads_enabled BOOLEAN DEFAULT false,
    tiktok_ads_admin_fee NUMERIC,
    tiktok_ads_daily_budget NUMERIC,
    
    -- Status
    agreement_status TEXT DEFAULT 'draft' CHECK (agreement_status IN ('draft', 'pending', 'active', 'expired', 'terminated')),
    terms_accepted BOOLEAN DEFAULT false,
    terms_accepted_at TIMESTAMPTZ,
    
    -- Document
    agreement_html TEXT,
    signature_image TEXT,
    electronic_consent BOOLEAN DEFAULT false,
    is_materai BOOLEAN DEFAULT false,
    signed_at TIMESTAMPTZ,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for logs
ALTER TABLE public.marketing_agreement_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "logs_select" ON public.marketing_agreement_logs FOR SELECT USING (true);
CREATE POLICY "logs_insert" ON public.marketing_agreement_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "logs_update" ON public.marketing_agreement_logs FOR UPDATE USING (true);

-- Indexes
CREATE INDEX idx_logs_property ON public.marketing_agreement_logs(property_id);
CREATE INDEX idx_logs_owner ON public.marketing_agreement_logs(owner_profile_id);
CREATE INDEX idx_logs_status ON public.marketing_agreement_logs(agreement_status);

-- 4. ADD COLUMNS TO PROPERTIES (Safe additions only)
DO $$
BEGIN
    -- Add submission tracking columns if not exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'source_input') THEN
        ALTER TABLE public.properties ADD COLUMN source_input TEXT DEFAULT 'ADMIN';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'owner_id') THEN
        ALTER TABLE public.properties ADD COLUMN owner_id UUID REFERENCES public.owner_profiles(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'publish_status') THEN
        ALTER TABLE public.properties ADD COLUMN publish_status TEXT DEFAULT 'APPROVED';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'reject_reason') THEN
        ALTER TABLE public.properties ADD COLUMN reject_reason TEXT;
    END IF;
    
    -- Agreement related (using existing columns where possible)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'agreement_status') THEN
        ALTER TABLE public.properties ADD COLUMN agreement_status TEXT DEFAULT 'none';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'contract_expired_at') THEN
        ALTER TABLE public.properties ADD COLUMN contract_expired_at TIMESTAMPTZ;
    END IF;
    
    -- Additional property details (using JSONB for flexibility)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'property_details_json') THEN
        ALTER TABLE public.properties ADD COLUMN property_details_json JSONB DEFAULT '{}'::jsonb;
    END IF;
    
    -- Dynamic fields storage
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'lebar_depan') THEN
        ALTER TABLE public.properties ADD COLUMN lebar_depan NUMERIC;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'jumlah_lantai') THEN
        ALTER TABLE public.properties ADD COLUMN jumlah_lantai INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'jenis_kost') THEN
        ALTER TABLE public.properties ADD COLUMN jenis_kost TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'jenis_hotel') THEN
        ALTER TABLE public.properties ADD COLUMN jenis_hotel TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'no_unit') THEN
        ALTER TABLE public.properties ADD COLUMN no_unit TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'ruang_penjaga') THEN
        ALTER TABLE public.properties ADD COLUMN ruang_penjaga BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'token_listrik_perkamar') THEN
        ALTER TABLE public.properties ADD COLUMN token_listrik_perkamar BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'kelengkapan') THEN
        ALTER TABLE public.properties ADD COLUMN kelengkapan TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'status_legalitas') THEN
        ALTER TABLE public.properties ADD COLUMN status_legalitas TEXT DEFAULT 'On Hand';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'bank_terkait') THEN
        ALTER TABLE public.properties ADD COLUMN bank_terkait TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'outstanding_bank') THEN
        ALTER TABLE public.properties ADD COLUMN outstanding_bank NUMERIC;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'dekat_sungai') THEN
        ALTER TABLE public.properties ADD COLUMN dekat_sungai BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'jarak_sungai') THEN
        ALTER TABLE public.properties ADD COLUMN jarak_sungai NUMERIC;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'dekat_makam') THEN
        ALTER TABLE public.properties ADD COLUMN dekat_makam BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'jarak_makam') THEN
        ALTER TABLE public.properties ADD COLUMN jarak_makam NUMERIC;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'dekat_sutet') THEN
        ALTER TABLE public.properties ADD COLUMN dekat_sutet BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'jarak_sutet') THEN
        ALTER TABLE public.properties ADD COLUMN jarak_sutet NUMERIC;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'lebar_jalan') THEN
        ALTER TABLE public.properties ADD COLUMN lebar_jalan NUMERIC;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'alasan_dijual') THEN
        ALTER TABLE public.properties ADD COLUMN alasan_dijual TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'harga_sewa_tahunan') THEN
        ALTER TABLE public.properties ADD COLUMN harga_sewa_tahunan NUMERIC;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'harga_nego') THEN
        ALTER TABLE public.properties ADD COLUMN harga_nego BOOLEAN DEFAULT true;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'harga_nett') THEN
        ALTER TABLE public.properties ADD COLUMN harga_nett BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'income_per_bulan') THEN
        ALTER TABLE public.properties ADD COLUMN income_per_bulan NUMERIC;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'biaya_pengeluaran_per_bulan') THEN
        ALTER TABLE public.properties ADD COLUMN biaya_pengeluaran_per_bulan NUMERIC;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'harga_sewa_kamar') THEN
        ALTER TABLE public.properties ADD COLUMN harga_sewa_kamar NUMERIC;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'google_maps_link') THEN
        ALTER TABLE public.properties ADD COLUMN google_maps_link TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'shgb_expired_at') THEN
        ALTER TABLE public.properties ADD COLUMN shgb_expired_at DATE;
    END IF;
    
END $;

-- 5. FUNCTION: Auto-update contract expiration status
CREATE OR REPLACE FUNCTION update_contract_expiration()
RETURNS TRIGGER AS $$
BEGIN
    -- If contract expired, update status
    IF NEW.contract_expired_at IS NOT NULL AND NEW.contract_expired_at < NOW() THEN
        IF NEW.agreement_status = 'exclusive_booster' THEN
            NEW.agreement_status := 'contract_expired';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_contract_expiration
    BEFORE UPDATE ON public.properties
    FOR EACH ROW
    EXECUTE FUNCTION update_contract_expiration();

-- 6. FUNCTION: Auto-set contract expiration for exclusive booster
CREATE OR REPLACE FUNCTION set_exclusive_contract_expiration()
RETURNS TRIGGER AS $$
BEGIN
    -- If signing an exclusive booster agreement
    IF NEW.agreement_status = 'exclusive_booster' AND NEW.signed_at IS NOT NULL THEN
        NEW.contract_expired_at := NEW.signed_at + INTERVAL '6 months';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_exclusive_contract_expiration
    BEFORE UPDATE ON public.properties
    FOR EACH ROW
    EXECUTE FUNCTION set_exclusive_contract_expiration();

-- 7. VIEW: Properties with owner info for admin
CREATE OR REPLACE VIEW public.properties_with_owners AS
SELECT 
    p.*,
    op.nama_lengkap as owner_name,
    op.no_ktp as owner_ktp,
    op.whatsapp_1 as owner_whatsapp,
    op.whatsapp_2 as owner_whatsapp_2,
    op.bertindak_sebagai as owner_role
FROM public.properties p
LEFT JOIN public.owner_profiles op ON p.owner_id = op.id;

-- 8. VIEW: Pending owner submissions
-- Note: Only shows if publish_status column exists with PENDING_REVIEW value
CREATE OR REPLACE VIEW public.pending_owner_submissions AS
SELECT 
    p.id,
    p.judul_properti,
    p.jenis_properti,
    p.harga_properti,
    p.created_at as submitted_at,
    op.nama_lengkap as owner_name,
    op.whatsapp_1 as owner_whatsapp,
    p.publish_status,
    p.agreement_status
FROM public.properties p
LEFT JOIN public.owner_profiles op ON p.owner_id = op.id
WHERE p.source_input = 'OWNER'
ORDER BY p.created_at DESC;

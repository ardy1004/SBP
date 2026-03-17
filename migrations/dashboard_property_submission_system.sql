-- ============================================================
-- CLEANUP: Drop existing tables if they exist (for fresh install)
-- ============================================================
DROP TABLE IF EXISTS public.agreement_documents CASCADE;
DROP TABLE IF EXISTS public.marketing_agreements CASCADE;
DROP TABLE IF EXISTS public.property_details CASCADE;
DROP TABLE IF EXISTS public.sharelink_tokens CASCADE;
DROP TABLE IF EXISTS public.owner_identities CASCADE;

-- ============================================================
-- SQL Migration: Dashboard Property Submission System
-- Created for Salam Bumi Property - Next.js + Supabase + PostgreSQL
-- ============================================================

-- ============================================================
-- 1. OWNER IDENTITIES TABLE
-- Stores owner identity information for property submissions
-- ============================================================
CREATE TABLE public.owner_identities (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    property_id TEXT,
    
    -- Identity Information
    nama_lengkap TEXT NOT NULL,
    no_ktp TEXT NOT NULL,
    alamat_ktp TEXT NOT NULL,
    rt_rw TEXT,
    kelurahan TEXT,
    kecamatan TEXT,
    bertindak_sebagai TEXT NOT NULL DEFAULT 'owner',
    
    -- Contact Information
    whatsapp_1 TEXT NOT NULL,
    whatsapp_2 TEXT,
    
    -- Metadata
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_owner_identities_property_id ON public.owner_identities(property_id);
CREATE INDEX idx_owner_identities_no_ktp ON public.owner_identities(no_ktp);

-- ============================================================
-- 2. SHARELINK TOKENS TABLE
-- Secure token management for owner property submissions
-- ============================================================
CREATE TABLE public.sharelink_tokens (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    property_id TEXT,
    owner_identity_id TEXT,
    
    -- Token Information
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    
    -- Status Tracking
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUBMITTED', 'EXPIRED', 'REVOKED')),
    
    -- Access Tracking
    access_count INTEGER DEFAULT 0,
    last_accessed_at TIMESTAMPTZ,
    submitted_at TIMESTAMPTZ,
    
    -- Metadata
    created_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sharelink_tokens_token ON public.sharelink_tokens(token);
CREATE INDEX idx_sharelink_tokens_property_id ON public.sharelink_tokens(property_id);
CREATE INDEX idx_sharelink_tokens_status ON public.sharelink_tokens(status);
CREATE INDEX idx_sharelink_tokens_expires_at ON public.sharelink_tokens(expires_at);

-- ============================================================
-- 3. PROPERTY DETAILS TABLE
-- Extended property details that sync with main properties table
-- ============================================================
CREATE TABLE public.property_details (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    property_id TEXT,
    
    -- Property Type Specific Fields
    tujuan TEXT CHECK (tujuan IS NULL OR tujuan IN ('Dijual', 'Disewakan', 'Dijual & Disewakan')),
    
    -- Pricing
    harga_sewa_bulanan NUMERIC,
    harga_sewa_tahunan NUMERIC,
    harga_per_meter NUMERIC,
    harga_nego BOOLEAN DEFAULT true,
    harga_keterangan TEXT,
    
    -- Google Maps (Admin Only)
    google_maps_link TEXT,
    latitude NUMERIC,
    longitude NUMERIC,
    
    -- Property Specific Dynamic Fields
    Jumlah_Lantai INTEGER,
    Tahun_Dibangun INTEGER,
    Tahun_Renovasi INTEGER,
    Orientasi_Bangunan TEXT,
    Kapasitas_AC TEXT,
    Jumlah_AC INTEGER,
    
    -- Fasilitas
    fasilitas TEXT[],
    jarak_ke_pusat_kota_km NUMERIC,
    jarak_ke_bandara_km NUMERIC,
    jarak_ke_stasiun_km NUMERIC,
    jarak_ke_terminal_km NUMERIC,
    jarak_ke_rumah_sakit_km NUMERIC,
    jarak_ke_sekolah_km NUMERIC,
    
    -- Legalitas
    status_tanah TEXT,
    no_sertifikat TEXT,
    tanggal_sertifikat DATE,
    atas_nama_sertifikat TEXT,
    imb_ada BOOLEAN DEFAULT false,
    no_imb TEXT,
    tahun_imb INTEGER,
    pvp_ada BOOLEAN DEFAULT false,
    siap_ajb BOOLEAN DEFAULT false,
    
    -- Bank Information
    bank_terkait TEXT,
    nama_rekening TEXT,
    nomor_rekening TEXT,
    
    -- Additional Information
    foto_denah TEXT[],
    virtual_tour_url TEXT,
    catatan_internal TEXT,
    
    -- Metadata
    submission_source TEXT DEFAULT 'admin',
    is_approved BOOLEAN DEFAULT false,
    approved_by TEXT,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_property_details_property_id ON public.property_details(property_id);
CREATE INDEX idx_property_details_tujuan ON public.property_details(tujuan);
CREATE INDEX idx_property_details_submission_source ON public.property_details(submission_source);
CREATE INDEX idx_property_details_is_approved ON public.property_details(is_approved);

-- ============================================================
-- 4. MARKETING AGREEMENTS TABLE
-- ============================================================
CREATE TABLE public.marketing_agreements (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    property_id TEXT,
    owner_identity_id TEXT,
    
    -- Agreement Type
    agreement_type TEXT CHECK (agreement_type IS NULL OR agreement_type IN ('open_listing', 'exclusive_booster')),
    
    -- Open Listing
    open_listing_fee_percent NUMERIC DEFAULT 3,
    open_listing_fee_timing TEXT DEFAULT 'setelah AJB',
    
    -- Exclusive Booster
    exclusive_booster_duration_months INTEGER,
    exclusive_booster_fee_percent NUMERIC DEFAULT 3,
    exclusive_booster_marketing_fee NUMERIC,
    
    -- Marketing Options
    meta_ads_enabled BOOLEAN DEFAULT false,
    meta_ads_admin_fee NUMERIC,
    meta_ads_budget_daily NUMERIC,
    tiktok_ads_enabled BOOLEAN DEFAULT false,
    tiktok_ads_admin_fee NUMERIC,
    tiktok_ads_budget_daily NUMERIC,
    
    -- Agreement Status
    agreement_status TEXT DEFAULT 'draft' CHECK (agreement_status IS NULL OR agreement_status IN ('draft', 'pending', 'signed', 'active', 'expired', 'terminated')),
    agreement_start_date DATE,
    agreement_end_date DATE,
    signed_at TIMESTAMPTZ,
    
    -- Terms
    terms_accepted BOOLEAN DEFAULT false,
    terms_accepted_at TIMESTAMPTZ,
    agreement_document_url TEXT,
    
    -- Agreement Preview Image (WebP)
    agreement_preview_url TEXT,
    signed_at TIMESTAMPTZ,
    
    -- Metadata
    created_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_marketing_agreements_property_id ON public.marketing_agreements(property_id);
CREATE INDEX idx_marketing_agreements_agreement_type ON public.marketing_agreements(agreement_type);
CREATE INDEX idx_marketing_agreements_status ON public.marketing_agreements(agreement_status);

-- ============================================================
-- 5. AGREEMENT DOCUMENTS TABLE
-- ============================================================
CREATE TABLE public.agreement_documents (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    agreement_id TEXT,
    
    -- Document Information
    document_number TEXT NOT NULL UNIQUE,
    document_type TEXT NOT NULL DEFAULT 'marketing_agreement',
    
    -- Auto-filled Data
    owner_name TEXT,
    property_title TEXT,
    property_address TEXT,
    property_price NUMERIC,
    agreement_terms TEXT,
    
    -- Signature Spaces
    signature_owner TEXT,
    signature_company TEXT,
    signature_date DATE,
    
    -- Materai
    materai_number TEXT,
    materai_value NUMERIC,
    materai_image_url TEXT,
    
    -- Company Stamp
    company_stamp_url TEXT,
    
    -- Document Status
    status TEXT DEFAULT 'draft' CHECK (status IS NULL OR status IN ('draft', 'pending_signature', 'signed', 'completed', 'cancelled')),
    
    -- Generated PDF
    pdf_url TEXT,
    generated_at TIMESTAMPTZ,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_agreement_documents_agreement_id ON public.agreement_documents(agreement_id);
CREATE INDEX idx_agreement_documents_document_number ON public.agreement_documents(document_number);
CREATE INDEX idx_agreement_documents_status ON public.agreement_documents(status);

-- ============================================================
-- ADD COLUMNS TO PROPERTIES TABLE (Safe)
-- ============================================================
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'properties' AND table_schema = 'public') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'submission_source') THEN
            ALTER TABLE public.properties ADD COLUMN submission_source TEXT DEFAULT 'admin';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'sharelink_token_id') THEN
            ALTER TABLE public.properties ADD COLUMN sharelink_token_id TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'owner_identity_id') THEN
            ALTER TABLE public.properties ADD COLUMN owner_identity_id TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'marketing_agreement_id') THEN
            ALTER TABLE public.properties ADD COLUMN marketing_agreement_id TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'is_pending_approval') THEN
            ALTER TABLE public.properties ADD COLUMN is_pending_approval BOOLEAN DEFAULT false;
        END IF;
    END IF;
END $$;

-- ============================================================
-- RLS POLICIES
-- ============================================================
ALTER TABLE public.owner_identities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sharelink_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agreement_documents ENABLE ROW LEVEL SECURITY;

-- Owner Identities
CREATE POLICY "owner_identities_select" ON public.owner_identities FOR SELECT USING (true);
CREATE POLICY "owner_identities_insert" ON public.owner_identities FOR INSERT WITH CHECK (true);
CREATE POLICY "owner_identities_update" ON public.owner_identities FOR UPDATE USING (true);
CREATE POLICY "owner_identities_delete" ON public.owner_identities FOR DELETE USING (true);

-- Sharelink Tokens
CREATE POLICY "sharelink_tokens_select" ON public.sharelink_tokens FOR SELECT USING (true);
CREATE POLICY "sharelink_tokens_insert" ON public.sharelink_tokens FOR INSERT WITH CHECK (true);
CREATE POLICY "sharelink_tokens_update" ON public.sharelink_tokens FOR UPDATE USING (true);

-- Property Details
CREATE POLICY "property_details_select" ON public.property_details FOR SELECT USING (true);
CREATE POLICY "property_details_insert" ON public.property_details FOR INSERT WITH CHECK (true);
CREATE POLICY "property_details_update" ON public.property_details FOR UPDATE USING (true);
CREATE POLICY "property_details_delete" ON public.property_details FOR DELETE USING (true);

-- Marketing Agreements
CREATE POLICY "marketing_agreements_select" ON public.marketing_agreements FOR SELECT USING (true);
CREATE POLICY "marketing_agreements_insert" ON public.marketing_agreements FOR INSERT WITH CHECK (true);
CREATE POLICY "marketing_agreements_update" ON public.marketing_agreements FOR UPDATE USING (true);

-- Agreement Documents
CREATE POLICY "agreement_documents_select" ON public.agreement_documents FOR SELECT USING (true);
CREATE POLICY "agreement_documents_insert" ON public.agreement_documents FOR INSERT WITH CHECK (true);
CREATE POLICY "agreement_documents_update" ON public.agreement_documents FOR UPDATE USING (true);

-- ============================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================
CREATE OR REPLACE FUNCTION check_sharelink_expiry()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'ACTIVE' AND NEW.expires_at < NOW() THEN
        NEW.status := 'EXPIRED';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_sharelink_expiry
    BEFORE UPDATE ON public.sharelink_tokens
    FOR EACH ROW
    EXECUTE FUNCTION check_sharelink_expiry();

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_owner_identities_updated_at BEFORE UPDATE ON public.owner_identities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sharelink_tokens_updated_at BEFORE UPDATE ON public.sharelink_tokens
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_property_details_updated_at BEFORE UPDATE ON public.property_details
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_marketing_agreements_updated_at BEFORE UPDATE ON public.marketing_agreements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agreement_documents_updated_at BEFORE UPDATE ON public.agreement_documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION generate_agreement_number()
RETURNS TRIGGER AS $$
DECLARE
    year_part TEXT;
    count_this_year INTEGER;
BEGIN
    year_part := TO_CHAR(NOW(), 'YYYY');
    
    SELECT COUNT(*) + 1 INTO count_this_year
    FROM public.agreement_documents
    WHERE document_number LIKE 'AGR-' || year_part || '-%';
    
    NEW.document_number := 'AGR-' || year_part || '-' || LPAD(count_this_year::TEXT, 5, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_agreement_number
    BEFORE INSERT ON public.agreement_documents
    FOR EACH ROW
    WHEN (NEW.document_number IS NULL)
    EXECUTE FUNCTION generate_agreement_number();

-- ============================================================
-- VIEW: Pending Approval Properties
-- ============================================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'properties' AND table_schema = 'public') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'is_pending_approval') THEN
            EXECUTE '
            CREATE OR REPLACE VIEW public.properties_pending_approval AS
            SELECT 
                p.*,
                oi.nama_lengkap as owner_name,
                oi.whatsapp_1 as owner_whatsapp,
                st.token as sharelink_token,
                ma.agreement_type
            FROM public.properties p
            LEFT JOIN public.owner_identities oi ON p.owner_identity_id = oi.id
            LEFT JOIN public.sharelink_tokens st ON p.sharelink_token_id = st.id
            LEFT JOIN public.marketing_agreements ma ON p.marketing_agreement_id = ma.id
            WHERE p.is_pending_approval = true';
        END IF;
    END IF;
END $$;

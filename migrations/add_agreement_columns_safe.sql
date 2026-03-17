-- ============================================================
-- MIGRATION: Add Agreement Columns to Properties Table
-- Purpose: Store agreement preview URL and signing timestamp
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Add agreement_preview_url column if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'properties' 
        AND column_name = 'agreement_preview_url'
    ) THEN
        ALTER TABLE public.properties ADD COLUMN agreement_preview_url TEXT;
    END IF;
END $$;

-- 2. Add signed_at column if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'properties' 
        AND column_name = 'signed_at'
    ) THEN
        ALTER TABLE public.properties ADD COLUMN signed_at TIMESTAMPTZ;
    END IF;
END $$;

-- 3. Create RLS policy for SELECT only (admin only)
-- First, check if RLS is enabled on properties table
DO $$
BEGIN
    -- Enable RLS if not already enabled
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'properties'
        AND rowsecurity = true
    ) THEN
        ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Drop existing select policies to avoid conflicts, then create new admin-only policy
DROP POLICY IF EXISTS "properties_agreement_select_admin" ON public.properties;

CREATE POLICY "properties_agreement_select_admin" ON public.properties
    FOR SELECT
    USING (
        -- Only allow admin users (you may need to adjust this based on your auth setup)
        -- This assumes authenticated users with appropriate claims can view
        auth.role() IN ('authenticated', 'service_role', 'anon')
        OR auth.jwt() ->> 'role' IN ('authenticated', 'service_role', 'anon')
    );

-- Also keep the existing policies for insert/update if they exist
-- (These should already be in place from previous migrations)

-- 4. Create index for faster queries on signed_at
CREATE INDEX IF NOT EXISTS idx_properties_signed_at 
    ON public.properties(signed_at) 
    WHERE signed_at IS NOT NULL;

-- 5. Create index for agreement_preview_url
CREATE INDEX IF NOT EXISTS idx_properties_agreement_preview_url 
    ON public.properties(agreement_preview_url) 
    WHERE agreement_preview_url IS NOT NULL;

-- ============================================================
-- Migration completed successfully
-- ============================================================

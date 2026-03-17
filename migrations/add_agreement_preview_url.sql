-- Add agreement_preview_url column to marketing_agreements if it doesn't exist
ALTER TABLE marketing_agreements ADD COLUMN IF NOT EXISTS agreement_preview_url TEXT;

-- Note: This column was already defined in dashboard_property_submission_system.sql
-- but may not have been applied to the database schema cache

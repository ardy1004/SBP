-- Add SEO fields to properties table
ALTER TABLE properties ADD COLUMN meta_title TEXT;
ALTER TABLE properties ADD COLUMN meta_description TEXT;
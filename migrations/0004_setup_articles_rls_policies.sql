-- Setup Row Level Security policies for articles table
-- Run this in Supabase SQL Editor to enable admin operations

-- Enable RLS on articles table
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Policy for reading published articles (public access)
CREATE POLICY "Public can read published articles" ON articles
    FOR SELECT USING (status = 'publish');

-- Policy for admin users to read all articles
CREATE POLICY "Authenticated users can read all articles" ON articles
    FOR SELECT TO authenticated USING (true);

-- Policy for admin users to insert articles
CREATE POLICY "Authenticated users can insert articles" ON articles
    FOR INSERT TO authenticated WITH CHECK (true);

-- Policy for admin users to update articles
CREATE POLICY "Authenticated users can update articles" ON articles
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Policy for admin users to delete articles
CREATE POLICY "Authenticated users can delete articles" ON articles
    FOR DELETE TO authenticated USING (true);

-- Note: For development/testing, you can temporarily disable RLS:
-- ALTER TABLE articles DISABLE ROW LEVEL SECURITY;
-- But remember to re-enable it for production security
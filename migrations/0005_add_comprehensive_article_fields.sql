-- Add comprehensive fields to articles table to match frontend expectations
ALTER TABLE articles ADD COLUMN featured_image_url TEXT;
ALTER TABLE articles ADD COLUMN focus_keyword TEXT;
ALTER TABLE articles ADD COLUMN categories TEXT[];
ALTER TABLE articles ADD COLUMN word_count INTEGER DEFAULT 0;
ALTER TABLE articles ADD COLUMN read_time INTEGER DEFAULT 1;
ALTER TABLE articles ADD COLUMN is_featured BOOLEAN DEFAULT false;
ALTER TABLE articles ADD COLUMN allow_comments BOOLEAN DEFAULT true;
ALTER TABLE articles ADD COLUMN visibility TEXT DEFAULT 'public';
ALTER TABLE articles ADD COLUMN custom_css TEXT;
ALTER TABLE articles ADD COLUMN redirect_url TEXT;
ALTER TABLE articles ADD COLUMN canonical_url TEXT;
ALTER TABLE articles ADD COLUMN no_index BOOLEAN DEFAULT false;
ALTER TABLE articles ADD COLUMN schema_markup TEXT;
ALTER TABLE articles ADD COLUMN social_title TEXT;
ALTER TABLE articles ADD COLUMN social_description TEXT;
ALTER TABLE articles ADD COLUMN social_image_url TEXT;
ALTER TABLE articles ADD COLUMN og_image_url TEXT;
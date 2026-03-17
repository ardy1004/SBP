const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Hardcoded for testing - use service role key for admin operations
const supabaseUrl = 'https://ljnqmfwbphlrlslfwjbr.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqbnFtZndicGhscmxzbGZ3amJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0MjMxMTAsImV4cCI6MjA3Nzk5OTExMH0.b8rwq4qIU_9_qOWnNrjETcW2eEPwjL5zktBnGQsbm3s';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration() {
  console.log('🛠️ Running migration: Adding comprehensive article fields');

  const alterStatements = [
    'ALTER TABLE articles ADD COLUMN IF NOT EXISTS featured_image_url TEXT',
    'ALTER TABLE articles ADD COLUMN IF NOT EXISTS focus_keyword TEXT',
    'ALTER TABLE articles ADD COLUMN IF NOT EXISTS categories TEXT[]',
    'ALTER TABLE articles ADD COLUMN IF NOT EXISTS word_count INTEGER DEFAULT 0',
    'ALTER TABLE articles ADD COLUMN IF NOT EXISTS read_time INTEGER DEFAULT 1',
    'ALTER TABLE articles ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false',
    'ALTER TABLE articles ADD COLUMN IF NOT EXISTS allow_comments BOOLEAN DEFAULT true',
    'ALTER TABLE articles ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT \'public\'',
    'ALTER TABLE articles ADD COLUMN IF NOT EXISTS custom_css TEXT',
    'ALTER TABLE articles ADD COLUMN IF NOT EXISTS redirect_url TEXT',
    'ALTER TABLE articles ADD COLUMN IF NOT EXISTS canonical_url TEXT',
    'ALTER TABLE articles ADD COLUMN IF NOT EXISTS no_index BOOLEAN DEFAULT false',
    'ALTER TABLE articles ADD COLUMN IF NOT EXISTS schema_markup TEXT',
    'ALTER TABLE articles ADD COLUMN IF NOT EXISTS social_title TEXT',
    'ALTER TABLE articles ADD COLUMN IF NOT EXISTS social_description TEXT',
    'ALTER TABLE articles ADD COLUMN IF NOT EXISTS social_image_url TEXT',
    'ALTER TABLE articles ADD COLUMN IF NOT EXISTS og_image_url TEXT'
  ];

  for (const sql of alterStatements) {
    console.log('📄 Executing:', sql);
    try {
      const { error } = await supabase.rpc('exec', { query: sql });

      if (error) {
        console.error('❌ Error executing:', sql, error);
      } else {
        console.log('✅ Success:', sql);
      }
    } catch (error) {
      console.error('🎯 Exception executing:', sql, error);
    }
  }

  console.log('🏁 Migration process completed');
}

runMigration();
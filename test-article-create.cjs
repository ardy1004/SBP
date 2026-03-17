const { createClient } = require('@supabase/supabase-js');

// Hardcoded for testing - use service role key for admin operations
const supabaseUrl = 'https://ljnqmfwbphlrlslfwjbr.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqbnFtZndicGhscmxzbGZ3amJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0MjMxMTAsImV4cCI6MjA3Nzk5OTExMH0.b8rwq4qIU_9_qOWnNrjETcW2eEPwjL5zktBnGQsbm3s';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testArticleCreation() {
  console.log('🧪 Testing article creation with minimal data...');

  // First check authentication status
  const { data: user, error: authError } = await supabase.auth.getUser();
  console.log('👤 Auth status:', { user, authError });

  // Check if RLS is enabled
  const { data: rlsCheck, error: rlsError } = await supabase
    .from('articles')
    .select('*')
    .limit(1);

  console.log('🔒 RLS check result:', { rlsCheck, rlsError });

  // Test with only the most basic columns from the migration
  const testArticle = {
    title: 'Test Article',
    slug: 'test-article-minimal-' + Date.now(),
    content: 'This is a test article content.',
    status: 'draft'
  };

  console.log('📤 Payload to insert:', JSON.stringify(testArticle, null, 2));

  try {
    const { data, error } = await supabase
      .from('articles')
      .insert(testArticle)
      .select()
      .single();

    if (error) {
      console.error('❌ INSERT ERROR:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      return;
    }

    console.log('✅ SUCCESS! Created article:', data);
  } catch (error) {
    console.error('🎯 CATCH ERROR:', error);
  }
}

testArticleCreation();
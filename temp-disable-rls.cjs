const { createClient } = require('@supabase/supabase-js');

// Hardcoded for testing - use service role key for admin operations
const supabaseUrl = 'https://ljnqmfwbphlrlslfwjbr.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqbnFtZndicGhscmxzbGZ3amJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0MjMxMTAsImV4cCI6MjA3Nzk5OTExMH0.b8rwq4qIU_9_qOWnNrjETcW2eEPwjL5zktBnGQsbm3s';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function disableRLS() {
  console.log('🔓 Temporarily disabling RLS for testing...');

  try {
    // Try to disable RLS
    const { error } = await supabase.rpc('exec', {
      query: 'ALTER TABLE articles DISABLE ROW LEVEL SECURITY;'
    });

    if (error) {
      console.error('❌ Failed to disable RLS:', error);
      return;
    }

    console.log('✅ RLS disabled successfully');
  } catch (error) {
    console.error('🎯 Exception disabling RLS:', error);
  }
}

disableRLS();
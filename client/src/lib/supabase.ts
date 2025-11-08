import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ljnqmfwbphlrlslfwjbr.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqbnFtZndicGhscmxzbGZ3amJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0MjMxMTAsImV4cCI6MjA3Nzk5OTExMH0.b8rwq4qIU_9_qOWnNrjETcW2eEPwjL5zktBnGQsbm3s'

console.log('🔧 Supabase Client Initialization:');
console.log('URL:', supabaseUrl);
console.log('Key present:', !!supabaseAnonKey);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Test connection immediately
supabase.from('properties').select('count').limit(1).then(result => {
  console.log('🔗 Supabase connection test:', result.error ? 'FAILED' : 'SUCCESS');
  if (result.error) {
    console.error('Supabase error:', result.error);
  }
})
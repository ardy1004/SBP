import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

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

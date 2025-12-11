import { createClient } from '@supabase/supabase-js'
import { logger } from './logger'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

logger.debug('Supabase Client Initialization', {
  url: supabaseUrl,
  keyPresent: !!supabaseAnonKey
});

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Test connection only in development mode
if (import.meta.env.DEV) {
  supabase.from('properties').select('count').limit(1).then(result => {
    logger.debug('Supabase connection test', {
      success: !result.error,
      error: result.error?.message
    });
  }).catch((error: any) => {
    logger.error('Supabase connection test failed', { error: error.message });
  });
}

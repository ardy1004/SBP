import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { logger } from './logger'

// Validate environment variables using index signature
// Provide fallback values for development to prevent blank page
const supabaseUrl = import.meta.env['VITE_SUPABASE_URL'] as string | undefined
const supabaseAnonKey = import.meta.env['VITE_SUPABASE_ANON_KEY'] as string | undefined

// Fallback configuration for development without .env
const isDevMode = !supabaseUrl || !supabaseAnonKey || 
  supabaseUrl.includes('your-project') || 
  supabaseAnonKey.includes('your-anon-key')

// Use placeholder values for development - app will still work with mock data
const fallbackUrl = 'https://placeholder.supabase.co'
const fallbackKey = 'placeholder-anon-key'

const finalSupabaseUrl = isDevMode ? fallbackUrl : supabaseUrl
const finalSupabaseKey = isDevMode ? fallbackKey : supabaseAnonKey

if (isDevMode) {
  console.warn('⚠️ Supabase: Running in development mode without valid .env configuration')
  console.warn('⚠️ Supabase: Using placeholder values. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env')
  console.warn('⚠️ Supabase: Property data will use fallback/mock data on the homepage')
} else {
  logger.debug('Supabase Client Initialization', {
    url: supabaseUrl,
    keyPresent: !!supabaseAnonKey
  });
}

export const supabase: SupabaseClient = createClient(finalSupabaseUrl, finalSupabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Test connection only in development mode when proper credentials exist
if (!isDevMode && import.meta.env.DEV) {
  // Use async IIFE to properly handle promise
  (async () => {
    try {
      const result = await supabase.from('properties').select('count').limit(1)
      logger.debug('Supabase connection test', {
        success: !result.error,
        error: result.error?.message
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      logger.error('Supabase connection test failed', { error: errorMessage });
    }
  })();
}

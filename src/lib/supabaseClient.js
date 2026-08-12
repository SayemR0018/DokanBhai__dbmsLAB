import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://ucbhnbxwdwjcmjwtodoo.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

let supabase = null

if (SUPABASE_ANON_KEY && SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY') {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        storageKey: 'dokanbhai-auth',
      },
    })
  } catch (err) {
    console.warn('Supabase init failed, using local fallback', err)
    supabase = null
  }
}

export const isSupabaseConfigured = !!supabase
export const SUPABASE_DOMAIN = SUPABASE_URL

export function getSupabase() {
  return supabase
}
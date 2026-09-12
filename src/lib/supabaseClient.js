import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Treat placeholder values as "not configured" so the app gracefully falls
// back to the offline localDb instead of trying to initialize a broken client.
const PLACEHOLDER_PATTERNS = [
  'your-project-id',
  'your-project',
  'your-anon-public-key',
  'YOUR_SUPABASE_ANON_KEY',
  'changeme',
  'placeholder',
]

const isPlaceholder = (value) => {
  if (!value) return true
  const v = String(value).trim().toLowerCase()
  if (!v) return true
  return PLACEHOLDER_PATTERNS.some((p) => v.includes(p.toLowerCase()))
}

const looksLikeValidUrl = (value) => {
  if (!value) return false
  try {
    const u = new URL(value)
    return u.protocol === 'https:' && (u.hostname.endsWith('.supabase.co') || u.hostname.endsWith('.supabase.in'))
  } catch {
    return false
  }
}

const isValidAnonKey = (value) => {
  if (!value) return false
  // Supabase anon keys are JWTs (3 dot-separated base64 segments).
  return typeof value === 'string' && value.split('.').length === 3 && value.length > 40
}

let supabase = null

const shouldInit =
  SUPABASE_URL &&
  SUPABASE_ANON_KEY &&
  !isPlaceholder(SUPABASE_URL) &&
  !isPlaceholder(SUPABASE_ANON_KEY) &&
  looksLikeValidUrl(SUPABASE_URL) &&
  isValidAnonKey(SUPABASE_ANON_KEY)

if (shouldInit) {
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
    console.warn('[supabase] init failed, using offline localDb:', err?.message || err)
    supabase = null
  }
} else {
  // Quietly signal fallback mode without spamming the console in production.
  if (typeof window !== 'undefined') {
    // eslint-disable-next-line no-console
    console.info('[supabase] env not configured — running in offline localDb mode')
  }
}

export const isSupabaseConfigured = !!supabase
export const SUPABASE_DOMAIN = SUPABASE_URL || ''

export function getSupabase() {
  return supabase
}

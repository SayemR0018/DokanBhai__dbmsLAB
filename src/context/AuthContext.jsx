import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { getSupabase, isSupabaseConfigured } from '../lib/supabaseClient'
import { getProfile } from '../lib/dokanProfile'

const AuthContext = createContext(null)

// DokanBhai uses phone-first device-trust authentication — there is no
// password or OTP. We persist the trusted device session in localStorage
// so it survives reloads and tab restores. We DO NOT rely on
// supabase.auth.getSession() because that returns null for our device-trust
// flow and would constantly wipe the user state.
const STORAGE_KEY = 'dokanbhai-auth-session'

const ADMIN_PHONE = '01700000000'

const buildUser = (phone, profile) => ({
  id: profile?.session?.phone || phone || 'local-user',
  phone,
  name: profile?.store?.ownerName || profile?.session?.displayName || 'Owner',
  role: 'owner',
  isAdmin: (phone || '').replace(/\D/g, '') === ADMIN_PHONE,
  businessType: profile?.store?.businessType || 'mudi',
  businessLabel: profile?.store?.businessLabel || '',
})

const readStored = () => {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || !parsed.phone) return null
    return parsed
  } catch {
    return null
  }
}

const persist = (u) => {
  if (typeof window === 'undefined') return
  if (u && u.phone) localStorage.setItem(STORAGE_KEY, JSON.stringify({ phone: u.phone, role: 'owner' }))
  else localStorage.removeItem(STORAGE_KEY)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Hydrate from localStorage synchronously so the first render already knows
  // whether the device is trusted. This avoids the "stuck on /login" loop that
  // happens if we wait for a Supabase round-trip that always returns null.
  useEffect(() => {
    let cancelled = false
    const init = async () => {
      const stored = readStored()
      if (!cancelled) {
        if (stored) {
          const u = buildUser(stored.phone, getProfile())
          setUser(u)
        }
        setLoading(false)
      }
    }
    init()
    return () => { cancelled = true }
  }, [])

  const login = useCallback(async (phoneToVerify) => {
    const cleanPhone = (phoneToVerify || '').replace(/\D/g, '')
    if (!/^01[3-9]\d{8}$/.test(cleanPhone)) {
      return { ok: false, error: 'সঠিক মোবাইল নম্বর দিন (01XXXXXXXXX) / Enter a valid BD mobile number' }
    }

    // 1. Match against the locally-stored profile session phone.
    const profile = getProfile()
    const expectedLocal = (profile?.session?.phone || '').replace(/\D/g, '')
    let matched = expectedLocal && expectedLocal === cleanPhone

    // 2. If no local profile, fall back to a Supabase lookup so that
    //    returning users can sign in on a fresh device if their businesses /
    //    dokan_profile row already exists in the cloud.
    if (!matched && isSupabaseConfigured) {
      try {
        const supabase = getSupabase()
        if (supabase) {
          const [{ data: biz }, { data: dp }] = await Promise.all([
            supabase.from('businesses').select('phone').eq('phone', cleanPhone).maybeSingle(),
            supabase.from('dokan_profile').select('session_phone').eq('session_phone', cleanPhone).maybeSingle(),
          ])
          if (biz || dp) matched = true
        }
      } catch (err) {
        console.warn('[auth] Supabase lookup failed during login:', err?.message || err)
      }
    }

    const isAdminPhone = cleanPhone === ADMIN_PHONE

if (!matched && !isAdminPhone) {
  return {
    ok: false,
    error: 'নিবন্ধিত নম্বরের সাথে মিলছে না / This number is not registered on this device'
  }
}

    const u = buildUser(cleanPhone, profile)
    setUser(u)
    persist(u)
    return { ok: true, user: u }
  }, [])

  const signOut = useCallback(async () => {
    // Best-effort Supabase sign-out (the app does not actually rely on
    // supabase.auth sessions, but be polite to the SDK).
    const supabase = getSupabase()
    if (supabase) {
      try { await supabase.auth.signOut() } catch { /* ignore */ }
    }
    setUser(null)
    persist(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, signOut, isSupabaseConfigured, backendsMode: isSupabaseConfigured ? 'supabase' : 'local' }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
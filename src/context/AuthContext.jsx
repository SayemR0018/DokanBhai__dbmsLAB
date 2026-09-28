import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { getSupabase, isSupabaseConfigured, setAdminEmail } from '../lib/supabaseClient'
import { getProfile, syncShopFromCloud } from '../lib/dokanProfile'
import { setCurrentPhone as setDataPhone } from '../lib/data'
import { setCurrentPhone as setProfilePhone } from '../lib/dokanProfile'
import { setCurrentPhone as setLocalDbPhone } from '../lib/localDb'

const AuthContext = createContext(null)


const STORAGE_KEY = 'dokanbhai-auth-session'

const ADMIN_PHONE = '01700000000'
const ADMIN_EMAIL = 'admin@dokanbhai.com'

// Helper to scope a clean phone — strip non-digits.
const cleanBDT = (raw) => (raw || '').replace(/\D/g, '')

// Helper to apply the current phone to every tenant-singleton in one place.
// Call this BEFORE any getProfile() / data.list() so reads target the right tenant.
const applyTenantScope = (phone) => {
  const p = cleanBDT(phone)
  setAdminEmail('')
  setDataPhone(p)
  setProfilePhone(p)
  setLocalDbPhone(p)
}

const readAdminUser = () => {
  try {
    const raw = localStorage.getItem('dokanbhai-admin-session')
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed?.email && parsed.role === 'admin') return buildAdminUser(parsed.email)
  } catch (err) {
    console.warn('[admin-auth] Admin session restore failed:', err)
  }
  return null
}

// Re-emit the global events so every mounted page re-fetches its data.
const notifyTenantSwitch = () => {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event('dokanbhai:profilechange'))
  window.dispatchEvent(new Event('dokanbhai:dbchange'))
}

const buildUser = (phone, profile) => ({
  id: profile?.session?.phone || phone || 'local-user',
  phone,
  name: profile?.store?.ownerName || profile?.session?.displayName || 'Owner',
  role: 'owner',
  isAdmin: (phone || '').replace(/\D/g, '') === ADMIN_PHONE,
  businessType: profile?.store?.businessType || 'mudi',
  businessLabel: profile?.store?.businessLabel || '',
})
const buildAdminUser = (email) => ({
  id: `admin-${email}`,
  email,
  phone: '',
  name: 'Administrator',
  role: 'admin',
  isAdmin: true,
  businessType: '',
  businessLabel: '',
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

  
  useEffect(() => {
    let cancelled = false
    const init = async () => {
  const stored = readStored()
  const onAdminRoute = typeof window !== 'undefined'
    && window.location.pathname.startsWith('/admin')
    && window.location.pathname !== '/admin/login'

  if (!cancelled) {
    const adminUser = readAdminUser()
    if (onAdminRoute && adminUser) {
      applyTenantScope('')
      setAdminEmail(adminUser.email)
      setUser(adminUser)
    } else if (stored) {
      applyTenantScope(stored.phone)
      let profile = getProfile()
      try { profile = await syncShopFromCloud(stored.phone) || profile } catch { /* keep the device copy */ }
      const u = buildUser(stored.phone, profile)
      setUser(u)
      notifyTenantSwitch()
    } else if (adminUser) {
      applyTenantScope('')
      setAdminEmail(adminUser.email)
      setUser(adminUser)
    }

    setLoading(false)
  }
}
    init()
    return () => { cancelled = true }
  }, [])

  const login = useCallback(async (phoneToVerify) => {
    const cleanPhone = cleanBDT(phoneToVerify)
    if (!/^01[3-9]\d{8}$/.test(cleanPhone)) {
      return { ok: false, error: 'সঠিক মোবাইল নম্বর দিন (01XXXXXXXXX) / Enter a valid BD mobile number' }
    }


    applyTenantScope(cleanPhone)
    let profile = getProfile()
    const expectedLocal = (profile?.session?.phone || '').replace(/\D/g, '')
    let matched = expectedLocal && expectedLocal === cleanPhone

   
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
        error: 'নিবন্ধিত নম্বরের সাথে মিলছে না / This number is not registered on this device',
      }
    }

    try { profile = await syncShopFromCloud(cleanPhone) || profile } catch { /* device profile still works */ }
    const u = buildUser(cleanPhone, profile)
    setUser(u)
    persist(u)
    // Trigger every page to re-read its tenant-scoped data.
    notifyTenantSwitch()
    return { ok: true, user: u }
  }, [])
const adminLogin = useCallback(async (email, password) => {
  const cleanEmail = (email || '').trim().toLowerCase()

  // Demo admin credentials
  const DEMO_ADMIN_EMAIL = 'admin@dokanbhai.com'
  const DEMO_ADMIN_PASSWORD = 'Admin@123'

  if (!cleanEmail || !password) {
    return {
      ok: false,
      error: 'ইমেইল এবং পাসওয়ার্ড দিন।',
    }
  }

  if (
    cleanEmail !== DEMO_ADMIN_EMAIL ||
    password !== DEMO_ADMIN_PASSWORD
  ) {
    return {
      ok: false,
      error: 'অ্যাডমিন ইমেইল অথবা পাসওয়ার্ড সঠিক নয়।',
    }
  }

  const adminUser = buildAdminUser(cleanEmail)

  applyTenantScope('')
  setAdminEmail(cleanEmail)
  setUser(adminUser)

  if (typeof window !== 'undefined') {
    localStorage.setItem(
      'dokanbhai-admin-session',
      JSON.stringify({
        email: cleanEmail,
        role: 'admin',
      })
    )
  }

  return {
    ok: true,
    user: adminUser,
  }
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
    
    if (typeof window !== 'undefined') {
  localStorage.removeItem('dokanbhai-admin-session')
}
    applyTenantScope('')
    notifyTenantSwitch()
  }, [])

  return (
<AuthContext.Provider
  value={{
    user,
    loading,
    login,
    adminLogin,
    signOut,
    isSupabaseConfigured,
    backendsMode: isSupabaseConfigured ? 'supabase' : 'local',
  }}
>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

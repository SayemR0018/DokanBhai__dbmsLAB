import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { getSupabase, isSupabaseConfigured } from '../lib/supabaseClient'
import { getProfile } from '../lib/dokanProfile'

const AuthContext = createContext(null)

const STORAGE_KEY = 'dokanbhai-auth-session'

const buildUser = (phone, profile) => ({
  id: 'local-user',
  phone,
  name: profile?.store?.ownerName || profile?.session?.displayName || 'Owner',
  role: 'Dokan Malik',
  businessType: profile?.store?.businessType || 'mudi',
  businessLabel: profile?.store?.businessLabel || '',
})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const persist = (u) => {
    if (typeof window === 'undefined') return
    if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u))
    else localStorage.removeItem(STORAGE_KEY)
  }

  useEffect(() => {
    let cancelled = false
    const init = async () => {
      try {
        const supabase = getSupabase()
        if (supabase) {
          const { data } = await supabase.auth.getSession()
          if (!cancelled && data?.session?.user) {
            const u = buildUser(data.session.user.phone || data.session.user.email, getProfile())
            setUser(u); persist(u)
          }
          supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
              const u = buildUser(session.user.phone || session.user.email, getProfile())
              setUser(u); persist(u)
            } else {
              setUser(null); persist(null)
            }
          })
        } else {
          const raw = localStorage.getItem(STORAGE_KEY)
          if (raw) setUser(JSON.parse(raw))
        }
      } catch (err) {
        console.warn('Auth init failed:', err)
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) setUser(JSON.parse(raw))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    init()
    return () => { cancelled = true }
  }, [])

  const login = useCallback(async (phone) => {
    const cleanPhone = (phone || '').replace(/\D/g, '')
    if (!/^01[3-9]\d{8}$/.test(cleanPhone)) {
      return { ok: false, error: 'সঠিক মোবাইল নম্বর দিন / Invalid BD mobile number' }
    }
    const profile = getProfile()
    const expected = (profile?.session?.phone || '').replace(/\D/g, '')
    if (!expected) {
      return { ok: false, error: 'প্রোফাইল পাওয়া যায়নি / Profile not found' }
    }
    if (cleanPhone !== expected) {
      return { ok: false, error: 'নিবন্ধিত নম্বরের সাথে মিলছে না / Number does not match registration' }
    }
    const u = buildUser(cleanPhone, profile)
    setUser(u); persist(u)
    return { ok: true, user: u }
  }, [])

  const signOut = useCallback(async () => {
    const supabase = getSupabase()
    if (supabase) {
      try { await supabase.auth.signOut() } catch {}
    }
    setUser(null); persist(null)
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
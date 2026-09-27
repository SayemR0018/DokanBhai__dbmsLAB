// dokan_profile — local-only store/owner profile persisted in localStorage.
// This is the source of truth for the onboarding choice (business type) and
// any per-store preferences (receipt width). The `session.phone` doubles as
// the trusted-device gate for the phone-first login.
//
// TENANT SCOPING — the storage key is suffixed with the authenticated phone
// (`dokan_profile_${phone}`) so different logins on the same device never
// overwrite each other. The phone is restored from the shop session before
// the first read. Legacy unscoped blobs are not copied into a new phone.

import { getBusinessType } from './verticals'

let currentPhone = ''

function bootPhoneFromSession() {
  if (typeof window === 'undefined') return
  try {
    const raw = localStorage.getItem('dokanbhai-auth-session')
    const parsed = raw ? JSON.parse(raw) : null
    const phone = (parsed?.phone || '').replace(/\D/g, '')
    if (phone) currentPhone = phone
  } catch {
    /* session blob is unreadable; leave the phone unset */
  }
}
bootPhoneFromSession()

export function setCurrentPhone(p) {
  const next = (p || '').replace(/\D/g, '')
  if (next === currentPhone) return
  const previous = currentPhone
  currentPhone = next
  // Notify subscribers that the active tenant changed so contexts can
  // re-read their source-of-truth data.
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('dokanbhai:tenantchange', { detail: { previous, current: next } }))
  }
}

const safePhone = () => currentPhone || 'anon'

const STORAGE_KEY = () => `dokan_profile_${safePhone()}`

const readRaw = (key) => {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

const writeRaw = (key, value) => {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(value))
}

export function getProfile() {
  if (typeof window === 'undefined') return null
  const scoped = readRaw(STORAGE_KEY())
  if (scoped && scoped.store) return scoped
  return null
}

export function isProfileComplete(profile) {
  if (!profile || !profile.store) return false
  const s = profile.store
  return Boolean(s.name && s.ownerName && s.region && s.businessType)
}

export function setProfile({ storeName, ownerName, region, businessType, phone }) {
  const biz = getBusinessType(businessType)
  if (!biz) throw new Error('Unknown business type: ' + businessType)
  const profile = {
    schemaVersion: 1,
    createdAt: new Date().toISOString(),
    store: {
      name: (storeName || '').trim() || 'My Dokan',
      ownerName: (ownerName || '').trim() || 'Owner',
      region: (region || '').trim() || '',
      businessType: biz.key,
      businessLabel: biz.label,
      currency: 'BDT',
      receiptWidth: '80mm',
      locale: 'bn-BD',
    },
    session: {
      phone: (phone || '').trim(),
      displayName: (ownerName || '').trim() || 'Owner',
    },
  }
  if (typeof window !== 'undefined') {
    writeRaw(STORAGE_KEY(), profile)
    window.dispatchEvent(new CustomEvent('dokanbhai:profilechange'))
  }
  return profile
}

export function updateProfile(patch) {
  const current = getProfile()
  if (!current) return null
  const next = {
    ...current,
    store: { ...current.store, ...(patch.store || {}) },
    session: { ...current.session, ...(patch.session || {}) },
  }
  if (typeof window !== 'undefined') {
    writeRaw(STORAGE_KEY(), next)
    window.dispatchEvent(new CustomEvent('dokanbhai:profilechange'))
  }
  return next
}

export function clearProfile() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY())
  window.dispatchEvent(new CustomEvent('dokanbhai:profilechange'))
}

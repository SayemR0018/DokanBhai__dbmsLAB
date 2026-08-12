// dokan_profile — local-only store/owner profile persisted in localStorage.
// This is the source of truth for the onboarding choice (business type) and
// any per-store preferences (receipt width). The `session.phone` doubles as
// the trusted-device gate for the phone-first login.

import { getBusinessType } from './verticals'

const STORAGE_KEY = 'dokan_profile'
const SCHEMA_VERSION = 1

export function getProfile() {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || !parsed.store) return null
    return parsed
  } catch {
    return null
  }
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
    schemaVersion: SCHEMA_VERSION,
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    window.dispatchEvent(new CustomEvent('dokanbhai:profilechange'))
  }
  return next
}

export function clearProfile() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY)
    window.dispatchEvent(new CustomEvent('dokanbhai:profilechange'))
  }
}
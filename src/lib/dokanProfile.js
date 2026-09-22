// dokan_profile — local-only store/owner profile persisted in localStorage.
// This is the source of truth for the onboarding choice (business type) and
// any per-store preferences (receipt width). The `session.phone` doubles as
// the trusted-device gate for the phone-first login.
//
// TENANT SCOPING — the storage key is suffixed with the authenticated phone
// (`dokan_profile_${phone}`) so different logins on the same device never
// overwrite each other. On first read for a given phone, the legacy
// `dokan_profile` blob is copied into the new key (idempotent — tracked by
// a sibling `dokan_profile_migrated_${phone}` flag).

import { getBusinessType } from './verticals'

const LEGACY_KEY = 'dokan_profile'
const MIGRATED_PREFIX = 'dokan_profile_migrated_'
let currentPhone = ''

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
const MIGRATED_KEY = () => `${MIGRATED_PREFIX}${safePhone()}`

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

const migrateLegacyIfNeeded = () => {
  if (typeof window === 'undefined') return null
  if (!currentPhone) return null
  if (localStorage.getItem(MIGRATED_KEY()) === '1') return null
  const legacy = readRaw(LEGACY_KEY)
  if (!legacy) {
    // Nothing to migrate — but mark so we don't keep checking.
    localStorage.setItem(MIGRATED_KEY(), '1')
    return null
  }
  // Only copy if the new key is currently empty for this phone.
  if (!localStorage.getItem(STORAGE_KEY())) {
    localStorage.setItem(STORAGE_KEY(), JSON.stringify(legacy))
  }
  localStorage.setItem(MIGRATED_KEY(), '1')
  return readRaw(STORAGE_KEY())
}

export function getProfile() {
  if (typeof window === 'undefined') return null
  const scoped = readRaw(STORAGE_KEY())
  if (scoped && scoped.store) return scoped
  // First read for this phone — pull legacy value across.
  const migrated = migrateLegacyIfNeeded()
  if (migrated && migrated.store) return migrated
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
  // Only remove the per-tenant blob — leave the legacy key alone so it can
  // still be migrated for another login on the same device.
  localStorage.removeItem(STORAGE_KEY())
  window.dispatchEvent(new CustomEvent('dokanbhai:profilechange'))
}

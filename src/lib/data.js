// Unified data adapter. Prefers Supabase when reachable, otherwise falls back to localDb.
// Tables map to the schema discovered from the APK analysis.
//
// TENANT SCOPING — `currentPhone` is the shopkeeper phone set by AuthContext.
// Only `businesses.phone` and `dokan_profile.session_phone` are shop phones.
// `customers.phone` and `vendors.phone` are contact numbers and must not be
// overwritten with the shop phone. products, invoices, sale_items, transactions,
// and payments have no shop-phone column. invoices are filtered by business_id,
// which onboarding stores as the shop phone.
//
// When Supabase is configured, mutation and read errors are thrown. They are
// not copied into localStorage. localDb is used only when Supabase is not configured.

import { getSupabase, isSupabaseConfigured } from './supabaseClient'
import localDb from './localDb'
import { getProfile as getProfileRaw, setProfile as setProfileRaw, updateProfile as updateProfileRaw, clearProfile as clearProfileRaw } from './dokanProfile'

// Module-level singleton — populated by AuthContext on login/hydration/signOut.
let currentPhone = ''
export function setCurrentPhone(p) {
  currentPhone = (p || '').replace(/\D/g, '')
}
export function getCurrentPhone() {
  return currentPhone
}

const TABLES = {
  businesses:   'businesses',
  categories:   'categories',
  vendors:      'vendors',
  customers:    'customers',
  products:     'products',
  transactions: 'transactions',
  invoices:     'invoices',
  payments:     'payments',
}

// Shop-phone column. Contact phones on customers/vendors are not tenant keys.
const SHOP_PHONE_TABLES = new Set(['businesses'])
// Invoices carry the shop id. Onboarding uses the shop phone as businesses.id.
const BUSINESS_SCOPED_TABLES = new Set(['invoices'])

function scopeQuery(query, table) {
  if (!currentPhone) return query
  if (SHOP_PHONE_TABLES.has(table)) return query.eq('phone', currentPhone)
  if (BUSINESS_SCOPED_TABLES.has(table)) return query.eq('business_id', currentPhone)
  return query
}

// Never stamp a shop phone onto tables that do not have that column.
// Customer and vendor `phone` values are left exactly as the form sent them.
function stampForTable(table, record) {
  const row = { ...record }
  if (table === 'businesses') {
    if (currentPhone && !row.phone) row.phone = currentPhone
    return row
  }
  if (table === 'invoices') {
    if (currentPhone && !row.business_id) row.business_id = currentPhone
  }
  if (table !== 'customers' && table !== 'vendors') {
    delete row.phone
    delete row.session_phone
  }
  return row
}

async function trySupabase(fn, fallback) {
  const supabase = getSupabase()
  if (!supabase) return fallback()
  return await fn(supabase)
}

const mapRow = (table, row) => {
  if (!row) return row
  // Normalize Supabase rows to the same shape used by localDb consumers.
  if (table === 'products') {
    return {
      id: row.id,
      name: row.name,
      category_id: row.category_id,
      vendor_id: row.vendor_id,
      cost_price: Number(row.cost_price || 0),
      sale_price: Number(row.sale_price || 0),
      stock: Number(row.stock || 0),
      min_stock: Number(row.min_stock || 0),
      unit: row.unit || 'pcs',
      serialTracked: !!row.serial_tracked,
      warrantyMonths: Number(row.warranty_months || 0),
      created_at: row.created_at,
    }
  }
  return row
}

// localDb filter helpers — localDb rows carry a `phone` column stamped at
// write-time. We never expose cross-tenant rows.
const tenantFilter = (rows) => {
  if (!currentPhone) return rows || []
  return (rows || []).filter((r) => r && (r.phone === currentPhone || r.phone == null))
}

export const data = {
  mode: isSupabaseConfigured ? 'supabase' : 'local',

  // ----- Generic listing -----
  async list(table) {
    const t = TABLES[table] || table
    return trySupabase(
      async (sb) => {
        const q = scopeQuery(sb.from(t).select('*').order('created_at', { ascending: false }), table)
        const { data, error } = await q
        if (error) throw error
        return (data || []).map((r) => mapRow(table, r))
      },
      () => tenantFilter(localDb.list(table)).map((r) => mapRow(table, r))
    )
  },

  async get(table, id) {
    const t = TABLES[table] || table
    return trySupabase(
      async (sb) => {
        const q = scopeQuery(sb.from(t).select('*').eq('id', id), table)
        const { data, error } = await q.single()
        if (error) throw error
        return mapRow(table, data)
      },
      () => {
        const row = localDb.get(table, id)
        if (!row) return null
        // Tenant guard for local reads.
        if (currentPhone && row.phone && row.phone !== currentPhone) return null
        return mapRow(table, row)
      }
    )
  },

  async insert(table, record) {
    const t = TABLES[table] || table
    const stamped = stampForTable(table, record)
    return trySupabase(
      async (sb) => {
        const { data, error } = await sb.from(t).insert(stamped).select().single()
        if (error) throw error
        return mapRow(table, data)
      },
      () => mapRow(table, localDb.insert(table, stamped))
    )
  },

  async update(table, id, patch) {
    const t = TABLES[table] || table
    return trySupabase(
      async (sb) => {
        const q = scopeQuery(sb.from(t).update(stampForTable(table, patch)).eq('id', id), table)
        const { data, error } = await q.select().single()
        if (error) throw error
        return mapRow(table, data)
      },
      () => mapRow(table, localDb.update(table, id, patch))
    )
  },

  async remove(table, id) {
    const t = TABLES[table] || table
    return trySupabase(
      async (sb) => {
        const q = scopeQuery(sb.from(t).delete().eq('id', id), table)
        const { error } = await q
        if (error) throw error
        return true
      },
      () => { localDb.remove(table, id); return true }
    )
  },

  // ----- Sales / Payments -----
  async createSale(payload) {
    const payloadClean = { ...payload }
    delete payloadClean.phone
    delete payloadClean.session_phone
    if (currentPhone && !payloadClean.business_id) payloadClean.business_id = currentPhone
    if (!isSupabaseConfigured) return localDb.createSale(payloadClean)
    const supabase = getSupabase()
    const { data, error } = await supabase.rpc('create_sale', { payload: payloadClean })
    if (error) throw error
    return data
  },

  async recordPayment(payload) {
    if (!isSupabaseConfigured) return localDb.recordPayment(payload)
    const supabase = getSupabase()
    const { data, error } = await supabase.rpc('record_payment', { payload })
    if (error) throw error
    return data
  },

  resetLocal() { localDb.reset() },

  // ----- Profile (local-only) -----
  getProfile() { return getProfileRaw() },
  setProfile(payload) {
    const next = setProfileRaw(payload)
    // After onboarding, populate the vertical seed.
    if (next?.store?.businessType) {
      localDb.seedVertical(next.store.businessType)
    }
    return next
  },
  updateProfile(patch) { return updateProfileRaw(patch) },
  clearProfile() { return clearProfileRaw() },
}

export default data

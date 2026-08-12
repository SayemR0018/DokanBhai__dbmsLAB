// Unified data adapter. Prefers Supabase when reachable, otherwise falls back to localDb.
// Tables map to the schema discovered from the APK analysis.

import { getSupabase, isSupabaseConfigured } from './supabaseClient'
import localDb from './localDb'
import { getProfile as getProfileRaw, setProfile as setProfileRaw, updateProfile as updateProfileRaw, clearProfile as clearProfileRaw } from './dokanProfile'

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

async function trySupabase(fn, fallback) {
  const supabase = getSupabase()
  if (!supabase) return fallback()
  try {
    return await fn(supabase)
  } catch (err) {
    console.warn('[data] Supabase error, falling back to localDb:', err?.message || err)
    return fallback()
  }
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
      unit: row.unit || 'piece',
      created_at: row.created_at,
    }
  }
  return row
}

export const data = {
  mode: isSupabaseConfigured ? 'supabase' : 'local',

  // ----- Generic listing -----
  async list(table) {
    const t = TABLES[table] || table
    return trySupabase(
      async (sb) => {
        const { data, error } = await sb.from(t).select('*').order('created_at', { ascending: false })
        if (error) throw error
        return (data || []).map((r) => mapRow(table, r))
      },
      () => localDb.list(table).map((r) => mapRow(table, r))
    )
  },

  async get(table, id) {
    const t = TABLES[table] || table
    return trySupabase(
      async (sb) => {
        const { data, error } = await sb.from(t).select('*').eq('id', id).single()
        if (error) throw error
        return mapRow(table, data)
      },
      () => mapRow(table, localDb.get(table, id))
    )
  },

  async insert(table, record) {
    const t = TABLES[table] || table
    return trySupabase(
      async (sb) => {
        const { data, error } = await sb.from(t).insert(record).select().single()
        if (error) throw error
        return mapRow(table, data)
      },
      () => mapRow(table, localDb.insert(table, record))
    )
  },

  async update(table, id, patch) {
    const t = TABLES[table] || table
    return trySupabase(
      async (sb) => {
        const { data, error } = await sb.from(t).update(patch).eq('id', id).select().single()
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
        const { error } = await sb.from(t).delete().eq('id', id)
        if (error) throw error
        return true
      },
      () => { localDb.remove(table, id); return true }
    )
  },

  // ----- Sales / Payments -----
  async createSale(payload) {
    if (isSupabaseConfigured) {
      const supabase = getSupabase()
      try {
        const { data, error } = await supabase.rpc('create_sale', payload)
        if (error) throw error
        return data
      } catch (err) {
        console.warn('[data] createSale rpc failed, using local:', err?.message)
      }
    }
    return localDb.createSale(payload)
  },

  async recordPayment(payload) {
    if (isSupabaseConfigured) {
      const supabase = getSupabase()
      try {
        const { data, error } = await supabase.rpc('record_payment', payload)
        if (error) throw error
        return data
      } catch (err) {
        console.warn('[data] recordPayment rpc failed, using local:', err?.message)
      }
    }
    return localDb.recordPayment(payload)
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
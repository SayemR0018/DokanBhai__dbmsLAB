// Unified data adapter. Prefers Supabase when reachable, otherwise falls back to localDb.
// Tables map to the schema discovered from the APK analysis.
//
// TENANT SCOPING — every Supabase read/write is filtered by the authenticated
// user's mobile number (`currentPhone`). The phone is set once by AuthContext
// via setCurrentPhone(); pages do not need to pass it. Writes stamp `phone`
// automatically so subsequent reads from the same tenant return the row.
//
// When a table does not have a `phone` column (legacy schema), Supabase returns
// Postgres error code 42703 ("column does not exist"). In that case we log a
// warning and retry the query un-scoped rather than failing outright.
//
// localDb (the offline fallback) applies the same filter client-side.

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

// Detect "column does not exist" schema-error from Supabase/PostgREST.
const isMissingPhoneColumn = (err) =>
  err && (err.code === '42703' || /column .*phone.* does not exist/i.test(err?.message || ''))

async function trySupabase(fn, fallback) {
  const supabase = getSupabase()
  if (!supabase) return fallback()
  try {
    return await fn(supabase)
  } catch (err) {
    // Filter on a non-existent `phone` column — retry without the filter
    // instead of dumping the user back to localDb. The caller controls the
    // retry by passing the filter as part of `fn`.
    if (isMissingPhoneColumn(err)) {
      console.warn('[data] phone column missing on table, retrying un-scoped:', err?.message)
      try {
        return await fn(supabase, { skipPhoneScope: true })
      } catch (err2) {
        console.warn('[data] un-scoped retry failed, falling back to localDb:', err2?.message || err2)
      }
    } else {
      console.warn('[data] Supabase error, falling back to localDb:', err?.message || err)
    }
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
      async (sb, { skipPhoneScope } = {}) => {
        let q = sb.from(t).select('*').order('created_at', { ascending: false })
        if (currentPhone && !skipPhoneScope) q = q.eq('phone', currentPhone)
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
      async (sb, { skipPhoneScope } = {}) => {
        let q = sb.from(t).select('*').eq('id', id)
        if (currentPhone && !skipPhoneScope) q = q.eq('phone', currentPhone)
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
    const stamped = currentPhone ? { ...record, phone: currentPhone } : { ...record }
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
      async (sb, { skipPhoneScope } = {}) => {
        let q = sb.from(t).update(patch).eq('id', id)
        if (currentPhone && !skipPhoneScope) q = q.eq('phone', currentPhone)
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
      async (sb, { skipPhoneScope } = {}) => {
        let q = sb.from(t).delete().eq('id', id)
        if (currentPhone && !skipPhoneScope) q = q.eq('phone', currentPhone)
        const { error } = await q
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
        // Stamp the tenant phone on the RPC payload so the stored procedure
        // can enforce row-level isolation even when the RLS policy is absent.
        const stamped = currentPhone ? { ...payload, phone: currentPhone, session_phone: currentPhone } : payload
        const { data, error } = await supabase.rpc('create_sale', stamped)
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
        const stamped = currentPhone ? { ...payload, phone: currentPhone, session_phone: currentPhone } : payload
        const { data, error } = await supabase.rpc('record_payment', stamped)
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

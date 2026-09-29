// Local persistent database backed by localStorage.
// Mirrors the schema for the Mudi Dokan management app:
//   businesses, categories, vendors, customers, products, transactions, invoices, payments.
//
// TENANT SCOPING â€” the storage key is suffixed with the authenticated phone
// (`dokanbhai-local-db_${phone}`) so different logins on the same device
// never share inventory, sales, or customer data. Legacy unscoped blobs are
// not copied into a new phone.
//
// Rows also carry a `phone` field stamped on every write so list/get can
// filter cross-tenant rows client-side even if multiple tenants were ever
// stored in the same blob (defence-in-depth).

import { getProfile } from './dokanProfile'
import { seedFor } from './verticals'
import { isDemoMode, DEMO_DB_KEY, buildHardwareDb } from './hardwareDemo'

let currentPhone = ''
export function setCurrentPhone(p) {
  currentPhone = (p || '').replace(/\D/g, '')
}
export function getCurrentPhone() {
  return currentPhone
}

const safePhone = () => currentPhone || 'anon'
const STORAGE_KEY = () => (isDemoMode() ? DEMO_DB_KEY : `dokanbhai-local-db_${safePhone()}`)

const seed = () => {
  const profile = getProfile()
  const bizType = profile?.store?.businessType || 'mudi'
  const phone = profile?.session?.phone || currentPhone || ''
  // Empty books until onboarding seeds the chosen vertical. No demo customers.
  return {
    businesses: profile ? [
      {
        id: phone || 'biz-1',
        name: profile.store.name || profile.store.businessLabel || 'DokanBhai',
        business_type: bizType,
        owner_user_id: phone || 'local-user',
        invite_code: '',
        address: profile.store.region || '',
        phone,
        created_at: new Date().toISOString(),
      },
    ] : [],
    categories: [],
    vendors: [],
    customers: [],
    products: [],
    transactions: [],
    payments: [],
    invoices: [],
  }
}

const uid = (prefix) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`

function load() {
  if (typeof window === 'undefined') return seed()
  try {
    const raw = localStorage.getItem(STORAGE_KEY())
    if (!raw) {
      const data = isDemoMode() ? buildHardwareDb() : seed()
      localStorage.setItem(STORAGE_KEY(), JSON.stringify(data))
      return data
    }
    const parsed = JSON.parse(raw)
    for (const k of Object.keys(seed())) {
      if (!parsed[k]) parsed[k] = []
    }
    return parsed
  } catch {
    return seed()
  }
}

function populateVerticalSeed(businessType) {
  if (!businessType) return
  const api = {
    list: (table) => [...(db[table] || [])],
    insert: (table, record) => {
      const row = { id: record.id || uid(table.slice(0, 3)), created_at: new Date().toISOString(), ...record }
      db[table] = [...(db[table] || []), row]
      return row
    },
    raw: () => db,
  }
  withNotified(() => {
    seedFor(api, businessType)
  })
}

function save(db) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY(), JSON.stringify(db))
  }
}

export function reloadStore() {
  db = load()
  notify()
}

function notify() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('dokanbhai:dbchange'))
  }
}

let db = load()

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    // Pick up changes to *any* per-tenant key (including the legacy fallback
    // for backwards compatibility) so other tabs stay in sync.
    if (!e.key) return
    if (!e.newValue) return
    if (e.key === STORAGE_KEY()) {
      try {
        db = JSON.parse(e.newValue)
        notify()
      } catch { /* ignore */ }
    }
  })
}

function withNotified(mutator) {
  mutator(db)
  save(db)
  notify()
}

// Filter rows by the active tenant. Rows without a phone (legacy seed rows)
// are visible to any tenant â€” they exist only in the legacy blob and are
// never written by the new code.
const tenantFilter = (rows) => {
  if (!currentPhone) return rows || []
  return (rows || []).filter((r) => r && (r.phone === currentPhone || r.phone == null))
}

// Stamp the current tenant on a record so future reads can filter it.
const stampTenant = (record) => {
  if (!currentPhone) return { ...record }
  if (record && record.phone != null) return record
  return { ...record, phone: currentPhone }
}

export const localDb = {
  list(table) {
    const rows = db[table] || []
    // The tour database is already isolated by its own storage key.
    // Customer phones must not be treated as the shop phone.
    if (isDemoMode()) return rows
    return tenantFilter(rows)
  },
  get(table, id) {
    const row = (db[table] || []).find((r) => r.id === id) || null
    if (!row) return null
    if (!isDemoMode() && currentPhone && row.phone && row.phone !== currentPhone) return null
    return row
  },
  insert(table, record) {
    const row = { id: record.id || uid(table.slice(0, 3)), created_at: new Date().toISOString(), ...stampTenant(record) }
    withNotified((d) => { (d[table] = d[table] || []).push(row) })
    return row
  },
  update(table, id, patch) {
    let updated = null
    withNotified((d) => {
      const arr = d[table] || []
      const idx = arr.findIndex((r) => r.id === id)
      if (idx >= 0) {
        // Tenant guard: do not let one tenant overwrite another tenant's row.
        const existing = arr[idx]
        if (currentPhone && existing.phone && existing.phone !== currentPhone) return
        arr[idx] = { ...existing, ...patch, updated_at: new Date().toISOString() }
        updated = arr[idx]
      }
    })
    return updated
  },
  remove(table, id) {
    withNotified((d) => {
      const arr = d[table] || []
      const idx = arr.findIndex((r) => r.id === id)
      if (idx >= 0) {
        const existing = arr[idx]
        if (currentPhone && existing.phone && existing.phone !== currentPhone) return
        d[table] = arr.filter((r) => r.id !== id)
      }
    })
  },
  createSale({ customer_id, items, discount = 0, paid_amount, pay_type = 'cash', note = '', date }) {
    const lineItems = items.map((it) => ({
      ...it,
      amount: it.qty * it.unit_price,
      // Preserve optional serial/warranty info per line for receipt rendering.
      serialNumber: it.serialNumber || '',
      warrantyNote: it.warrantyNote || '',
    }))
    const subtotal = lineItems.reduce((s, it) => s + it.amount, 0)
    const total = Math.max(0, subtotal - Number(discount || 0))
    const paid = Math.min(total, Number(paid_amount || 0))
    const due = Math.max(0, total - paid)
    const transactions = []
    const saleDate = date || new Date().toISOString()
    const tenantStamp = currentPhone ? { phone: currentPhone } : {}

    const needed = new Map()
    for (const it of lineItems) {
      const qty = Number(it.qty)
      if (!Number.isFinite(qty) || qty <= 0) {
        throw new Error('পরিমাণ সঠিক নয় / Quantity must be greater than zero')
      }
      needed.set(it.product_id, (needed.get(it.product_id) || 0) + qty)
    }
    for (const [id, qty] of needed) {
      const product = (db.products || []).find((row) => row.id === id)
      const stock = Number(product?.stock || 0)
      if (!product || qty > stock + 1e-6) {
        throw new Error(`${product?.name || 'পণ্য'}: স্টকে ${stock} আছে, ${qty} বিক্রি করা যাবে না / Not enough stock`)
      }
    }

    let remainingPaid = paid
    lineItems.forEach((it, idx) => {
      const isLast = idx === lineItems.length - 1
      const share = isLast || subtotal === 0
        ? (isLast ? remainingPaid : 0)
        : Math.round((paid * it.amount / subtotal) * 100) / 100
      if (!isLast) remainingPaid = Math.round((remainingPaid - share) * 100) / 100
      const meta = [
        it.serialNumber ? `SN:${it.serialNumber}` : '',
        it.warrantyNote ? `Warranty:${it.warrantyNote}` : '',
      ].filter(Boolean).join(' | ')
      transactions.push({
        id: uid('t'),
        type: 'sale',
        customer_id,
        product_id: it.product_id,
        product_name: it.name,
        qty: it.qty,
        unit_price: it.unit_price,
        amount: it.amount,
        discount: 0,
        paid_amount: share,
        pay_type,
        note: meta ? (note ? `${note} Â· ${meta}` : meta) : note,
        date: saleDate,
        ...tenantStamp,
      })
      const p = (db.products || []).find((row) => row.id === it.product_id)
      if (p) p.stock = Number(p.stock) - Number(it.qty)
    })

    if (paid > 0 || discount > 0) {
      transactions.push({
        id: uid('t'),
        type: 'payment',
        customer_id,
        amount: paid,
        discount: Number(discount || 0),
        paid_amount: paid,
        pay_type,
        note: note || `Sale payment (${pay_type})`,
        date: saleDate,
        ...tenantStamp,
      })
    }

    const invoice = {
      id: uid('inv'),
      invoice_no: 'INV-' + Date.now().toString().slice(-6),
      customer_id,
      items: lineItems,
      subtotal,
      discount: Number(discount || 0),
      total,
      paid_amount: paid,
      due_amount: due,
      pay_type,
      note,
      date: saleDate,
      ...tenantStamp,
    }

    if (customer_id) {
      const cust = (db.customers || []).find((c) => c.id === customer_id)
      if (cust) {
        cust.balance = (cust.balance || 0) + due
      }
    }

    withNotified((d) => {
      d.transactions = [...(d.transactions || []), ...transactions]
      d.invoices = [...(d.invoices || []), invoice]
    })

    return invoice
  },
  recordPayment({ customer_id, amount, note = '', date }) {
    const amt = Number(amount || 0)
    if (!Number.isFinite(amt) || amt <= 0) throw new Error('জমার পরিমাণ দিন / Enter a payment amount')
    const cust = customer_id ? (db.customers || []).find((row) => row.id === customer_id) : null
    if (!cust) throw new Error('কাস্টমার পাওয়া যায়নি / Customer was not found')
    if (amt > Number(cust.balance || 0) + 0.009) {
      throw new Error(`বাকি ${Number(cust.balance || 0)} টাকা। তার বেশি জমা হবে না / Payment cannot exceed the due`)
    }
    const tenantStamp = currentPhone ? { phone: currentPhone } : {}
    const payment = {
      id: uid('pay'),
      type: 'payment',
      customer_id,
      amount: amt,
      paid_amount: amt,
      pay_type: 'cash',
      note,
      date: date || new Date().toISOString(),
      ...tenantStamp,
    }
    if (customer_id) {
      cust.balance = Math.max(0, Number(cust.balance || 0) - amt)
    }
    withNotified((d) => { d.transactions = [...(d.transactions || []), payment] })
    return payment
  },
  reset() {
    db = seed()
    save(db)
    notify()
  },
  // Seed categories/vendors/products for the given vertical. Idempotent.
  seedVertical(businessType) {
    populateVerticalSeed(businessType)
  },
  raw() { return db },
}

export default localDb

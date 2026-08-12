// Local persistent database backed by localStorage.
// Mirrors the schema for the Mudi Dokan management app:
//   businesses, categories, vendors, customers, products, transactions, invoices, payments.

import { getProfile } from './dokanProfile'
import { seedFor } from './verticals'

const STORAGE_KEY = 'dokanbhai-local-db-v1'

const seed = () => {
  const profile = getProfile()
  const bizType = profile?.store?.businessType || 'mudi'
  // For legacy installs (no profile), use the legacy Mudi seed so existing
  // users see no data loss. When a profile exists, return a minimal business
  // row and let vertical.seedFor() populate categories/vendors/products.
  if (!profile) return legacyMudiSeed()
  return {
    businesses: [
      { id: 'biz-1', name: profile.store.businessLabel || 'DokanBhai', business_type: bizType, owner_user_id: 'local-user', invite_code: 'DOKAN-2025', address: profile.store.region || '', phone: profile.session.phone || '', created_at: new Date().toISOString() }
    ],
    categories: [],
    vendors: [],
    customers: [
      { id: 'cu-walkin', name: 'Walk-in Customer', phone: '', address: '', balance: 0, created_at: new Date().toISOString() },
    ],
    products: [],
    transactions: [],
    payments: [],
    invoices: [],
  }
}

// Default Mudi seed (preserved for legacy users without a dokan_profile).
const legacyMudiSeed = () => ({
  businesses: [
    { id: 'biz-1', name: 'DokanBhai - Mudi & General Store', business_type: 'mudi', owner_user_id: 'local-user', invite_code: 'DOKAN-2025', address: 'Mirpur, Dhaka', phone: '+880 1700-000000', created_at: new Date().toISOString() }
  ],
  categories: [
    { id: 'cat-1', name: 'চাল ও আটা / Rice & Flour', color: '#0f9d58', created_at: new Date().toISOString() },
    { id: 'cat-2', name: 'তেল ও মশলা / Oil & Spices', color: '#ca8a04', created_at: new Date().toISOString() },
    { id: 'cat-3', name: 'মুদি সামগ্রী / Groceries',  color: '#2563eb', created_at: new Date().toISOString() },
    { id: 'cat-4', name: 'স্ন্যাক্স ও পানীয় / Snacks & Drinks', color: '#9333ea', created_at: new Date().toISOString() },
    { id: 'cat-5', name: 'টয়লেট্রিজ / Personal Care', color: '#db2777', created_at: new Date().toISOString() },
  ],
  vendors: [
    { id: 'v-1', name: 'City Group',           phone: '01711-000001', address: 'Tejgaon, Dhaka',  note: 'Edible oil & flour supplier',     created_at: new Date().toISOString() },
    { id: 'v-2', name: 'ACI Consumer Brands',  phone: '01711-000002', address: 'Motijheel, Dhaka', note: 'Salt, spices & personal care',  created_at: new Date().toISOString() },
    { id: 'v-3', name: 'Meghna Group of Industries', phone: '01711-000003', address: 'Gazipur',  note: 'Atta & flour distributor', created_at: new Date().toISOString() },
    { id: 'v-4', name: 'Square Food & Beverage', phone: '01711-000004', address: 'Pabna',     note: 'Snacks & beverages',         created_at: new Date().toISOString() },
  ],
  customers: [
    { id: 'cu-1', name: 'Rahim Mia',       phone: '01815-000001', address: 'Mirpur-10',  balance: 0,     created_at: new Date().toISOString() },
    { id: 'cu-2', name: 'Karim Sheikh',    phone: '01815-000002', address: 'Mohammadpur', balance: 1250, created_at: new Date().toISOString() },
    { id: 'cu-3', name: 'Abdul Jabbar',    phone: '01815-000003', address: 'Uttara',     balance: 0,     created_at: new Date().toISOString() },
    { id: 'cu-4', name: 'Jamal Hossain',   phone: '01815-000004', address: 'Dhanmondi',  balance: 850,  created_at: new Date().toISOString() },
    { id: 'cu-5', name: 'Walk-in Customer', phone: '',           address: '',           balance: 0,     created_at: new Date().toISOString() },
  ],
  products: [
    { id: 'p-1', name: 'Teer Soyabean Oil 5L',     category_id: 'cat-2', vendor_id: 'v-1', cost_price: 950,   sale_price: 1050, stock: 60,  min_stock: 12, unit: 'litre', created_at: new Date().toISOString() },
    { id: 'p-2', name: 'Miniket Rice 25kg',        category_id: 'cat-1', vendor_id: 'v-1', cost_price: 1850,  sale_price: 2050, stock: 28,  min_stock: 10, unit: 'bag',   created_at: new Date().toISOString() },
    { id: 'p-3', name: 'ACI Pure Salt 1kg',        category_id: 'cat-3', vendor_id: 'v-2', cost_price: 28,    sale_price: 35,   stock: 240, min_stock: 40, unit: 'pcs', created_at: new Date().toISOString() },
    { id: 'p-4', name: 'Deshi Masoor Dal 1kg',     category_id: 'cat-3', vendor_id: 'v-2', cost_price: 130,   sale_price: 160,  stock: 45,  min_stock: 15, unit: 'kg',    created_at: new Date().toISOString() },
    { id: 'p-5', name: 'Pushti Atta 2kg',          category_id: 'cat-1', vendor_id: 'v-3', cost_price: 110,   sale_price: 135,  stock: 80,  min_stock: 20, unit: 'pack',  created_at: new Date().toISOString() },
    { id: 'p-6', name: 'Dano Daily Pushti Milk Powder 1kg', category_id: 'cat-3', vendor_id: 'v-2', cost_price: 580, sale_price: 650, stock: 18, min_stock: 10, unit: 'pack', created_at: new Date().toISOString() },
    { id: 'p-7', name: 'Rin Washing Powder 1kg',   category_id: 'cat-5', vendor_id: 'v-2', cost_price: 175,   sale_price: 210,  stock: 65,  min_stock: 15, unit: 'pcs', created_at: new Date().toISOString() },
    { id: 'p-8', name: 'Speed Canola Oil 3L',      category_id: 'cat-2', vendor_id: 'v-1', cost_price: 690,   sale_price: 780,  stock: 8,   min_stock: 10, unit: 'litre', created_at: new Date().toISOString() },
    { id: 'p-9', name: 'PRAN Mango Juice 1L',      category_id: 'cat-4', vendor_id: 'v-4', cost_price: 95,    sale_price: 120,  stock: 95,  min_stock: 25, unit: 'pcs', created_at: new Date().toISOString() },
    { id: 'p-10', name: 'Bombay Sweets Chanachur 500g', category_id: 'cat-4', vendor_id: 'v-4', cost_price: 110, sale_price: 140, stock: 55, min_stock: 15, unit: 'pack', created_at: new Date().toISOString() },
  ],
  transactions: [
    { id: 't-1', type: 'sale', customer_id: 'cu-1', product_id: 'p-2', product_name: 'Miniket Rice 25kg', qty: 1, unit_price: 2050, amount: 2050, discount: 50, paid_amount: 2000, pay_type: 'cash', note: '', date: new Date().toISOString() },
    { id: 't-2', type: 'sale', customer_id: 'cu-2', product_id: 'p-1', product_name: 'Teer Soyabean Oil 5L', qty: 2, unit_price: 1050, amount: 2100, discount: 0, paid_amount: 850, pay_type: 'credit', note: '', date: new Date(Date.now() - 86400000 * 3).toISOString() },
    { id: 't-3', type: 'sale', customer_id: 'cu-4', product_id: 'p-4', product_name: 'Deshi Masoor Dal 1kg', qty: 5, unit_price: 160, amount: 800, discount: 0, paid_amount: 0, pay_type: 'credit', note: '', date: new Date(Date.now() - 86400000).toISOString() },
    { id: 't-4', type: 'sale', customer_id: 'cu-3', product_id: 'p-7', product_name: 'Rin Washing Powder 1kg', qty: 2, unit_price: 210, amount: 420, discount: 20, paid_amount: 400, pay_type: 'cash', note: '', date: new Date().toISOString() },
  ],
  payments: [
    { id: 'pay-1', customer_id: 'cu-2', amount: 850, note: 'partial', date: new Date(Date.now() - 86400000 * 2).toISOString() },
  ],
  invoices: [],
})

const uid = (prefix) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`

function load() {
  if (typeof window === 'undefined') return seed()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      const data = seed()
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
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

// populateVerticalSeed is called from the context API after onboarding to
// turn a minimal empty workspace into a vertical-ready catalog. Idempotent.
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
  }
}

function notify() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('dokanbhai:dbchange'))
  }
}

let db = load()

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY && e.newValue) {
      db = JSON.parse(e.newValue)
      notify()
    }
  })
}

function withNotified(mutator) {
  mutator(db)
  save(db)
  notify()
}

export const localDb = {
  list(table) {
    return [...(db[table] || [])]
  },
  get(table, id) {
    return (db[table] || []).find((r) => r.id === id) || null
  },
  insert(table, record) {
    const row = { id: record.id || uid(table.slice(0, 3)), created_at: new Date().toISOString(), ...record }
    withNotified((d) => { (d[table] = d[table] || []).push(row) })
    return row
  },
  update(table, id, patch) {
    let updated = null
    withNotified((d) => {
      const arr = d[table] || []
      const idx = arr.findIndex((r) => r.id === id)
      if (idx >= 0) {
        arr[idx] = { ...arr[idx], ...patch, updated_at: new Date().toISOString() }
        updated = arr[idx]
      }
    })
    return updated
  },
  remove(table, id) {
    withNotified((d) => {
      d[table] = (d[table] || []).filter((r) => r.id !== id)
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

    lineItems.forEach((it) => {
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
        paid_amount: 0,
        pay_type,
        note: meta ? (note ? `${note} · ${meta}` : meta) : note,
        date: saleDate,
      })
      const p = (db.products || []).find((p) => p.id === it.product_id)
      if (p) p.stock = Math.max(0, (p.stock || 0) - Number(it.qty))
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
    }

    const cust = (db.customers || []).find((c) => c.id === customer_id)
    if (cust) {
      cust.balance = (cust.balance || 0) + due
    }

    withNotified((d) => {
      d.transactions = [...(d.transactions || []), ...transactions]
      d.invoices = [...(d.invoices || []), invoice]
    })

    return invoice
  },
  recordPayment({ customer_id, amount, note = '', date }) {
    const amt = Number(amount || 0)
    const payment = {
      id: uid('pay'),
      type: 'payment',
      customer_id,
      amount: amt,
      paid_amount: amt,
      pay_type: 'cash',
      note,
      date: date || new Date().toISOString(),
    }
    const cust = (db.customers || []).find((c) => c.id === customer_id)
    if (cust) {
      cust.balance = Math.max(0, (cust.balance || 0) - amt)
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

import data from './data'
import { isDemoMode } from './hardwareDemo'
import { normalizeUnitKey, UNIT_CATALOG } from './units'

const SECTION_NAMES = {
  products: 'products',
  product: 'products',
  'পণ্য': 'products',
  customers: 'customers',
  customer: 'customers',
  'কাস্টমার': 'customers',
  vendors: 'vendors',
  vendor: 'vendors',
  supplier: 'vendors',
  suppliers: 'vendors',
  'সরবরাহকারী': 'vendors',
  categories: 'categories',
  category: 'categories',
  'ক্যাটাগরি': 'categories',
}

const HEADER_ALIASES = {
  section: ['section', 'type', 'ধরন'],
  name: ['name', 'product', 'product_name', 'পণ্য', 'পণ্যের নাম', 'নাম'],
  phone: ['phone', 'mobile', 'মোবাইল', 'ফোন'],
  address: ['address', 'ঠিকানা'],
  note: ['note', 'নোট'],
  balance: ['balance', 'due', 'বাকি'],
  color: ['color', 'রং'],
  category: ['category', 'category_name', 'ক্যাটাগরি'],
  vendor: ['vendor', 'vendor_name', 'supplier', 'সরবরাহকারী'],
  cost_price: ['cost_price', 'cost', 'ক্রয়মূল্য'],
  sale_price: ['sale_price', 'price', 'বিক্রয়মূল্য'],
  stock: ['stock', 'qty', 'quantity', 'মজুদ'],
  min_stock: ['min_stock', 'minimum', 'min', 'সর্বনিম্ন'],
  unit: ['unit', 'একক'],
}

const norm = (value) => String(value ?? '').trim().toLowerCase().replace(/\s+/g, '_')

const aliasKey = (header) => {
  const key = norm(header)
  for (const [field, names] of Object.entries(HEADER_ALIASES)) {
    if (names.some((name) => norm(name) === key)) return field
  }
  return null
}

function parseNumber(raw) {
  if (raw == null) return { empty: true }
  const text = String(raw).trim()
  if (!text) return { empty: true }
  const cleaned = text.replace(/[৳,\s]/g, '')
  if (!/^[-+]?\d+(\.\d+)?$/.test(cleaned)) return { error: true }
  return { value: Number(cleaned) }
}

function parseCsv(text) {
  const rows = []
  let row = []
  let cell = ''
  let quoted = false
  const src = text.replace(/^\uFEFF/, '')
  for (let i = 0; i < src.length; i++) {
    const ch = src[i]
    if (quoted) {
      if (ch === '"') {
        if (src[i + 1] === '"') { cell += '"'; i++ } else quoted = false
      } else cell += ch
      continue
    }
    if (ch === '"') { quoted = true; continue }
    if (ch === ',') { row.push(cell); cell = ''; continue }
    if (ch === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; continue }
    if (ch === '\r') continue
    cell += ch
  }
  row.push(cell)
  if (row.some((part) => String(part).trim())) rows.push(row)
  return rows
}

function sheetToRows(sheet) {
  return XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: '' })
}

function rowsFromMatrix(matrix) {
  const table = (matrix || []).filter((row) => (row || []).some((cell) => String(cell ?? '').trim()))
  if (!table.length) return []
  const headers = table[0].map((cell) => aliasKey(cell))
  if (!headers.some(Boolean)) {
    throw new Error('কলামের নাম চেনা যায়নি। name, phone, sale_price এর মতো শিরোনাম দিন।')
  }
  return table.slice(1).map((row) => {
    const record = {}
    headers.forEach((field, index) => {
      if (!field) return
      const value = row[index]
      if (record[field] == null || record[field] === '') record[field] = value
    })
    return record
  }).filter((record) => Object.values(record).some((value) => String(value ?? '').trim()))
}

async function readSections(file) {
  const name = (file.name || '').toLowerCase()
  if (name.endsWith('.csv') || file.type === 'text/csv') {
    const text = await file.text()
    if (!text.trim()) throw new Error('ফাইল খালি।')
    const records = rowsFromMatrix(parseCsv(text))
    return splitBySection(records, null)
  }
  if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
    const mod = await import('xlsx')
    const XLSX = mod.read ? mod : mod.default
    const buffer = await file.arrayBuffer()
    let book
    try { book = XLSX.read(buffer, { type: 'array' }) } catch { throw new Error('Excel ফাইল নষ্ট। আবার সেভ করে দিন।') }
    const named = {}
    let loose = []
    for (const sheetName of book.SheetNames) {
      const section = SECTION_NAMES[norm(sheetName)] || SECTION_NAMES[sheetName.trim()]
      let records = []
      try {
        records = rowsFromMatrix(sheetToRows(book.Sheets[sheetName]))
      } catch (err) {
        if (section) throw err
        continue
      }
      if (!records.length) continue
      if (section) named[section] = records
      else loose = loose.concat(records)
    }
    if (!Object.keys(named).length && !loose.length) {
      throw new Error('কলামের নাম চেনা যায়নি। name, phone, sale_price এর মতো শিরোনাম দিন।')
    }
    const fromLoose = loose.length ? splitBySection(loose, null) : {}
    return { ...fromLoose, ...named }
  }
  throw new Error('শুধু CSV বা Excel (.xlsx) ফাইল দিন।')
}

function splitBySection(records, fallback) {
  const buckets = {}
  const headers = new Set(records.flatMap((row) => Object.keys(row)))
  let detected = fallback
  if (!records.some((row) => row.section)) {
    detected = detectSection(headers)
  }
  for (const row of records) {
    const named = row.section ? (SECTION_NAMES[norm(row.section)] || SECTION_NAMES[String(row.section).trim()]) : detected
    if (!named) throw new Error('কোন খাতা বোঝা যায়নি। Excel শিটে products, customers, vendors, categories নাম দিন, অথবা section কলাম দিন।')
    buckets[named] = buckets[named] || []
    buckets[named].push(row)
  }
  return buckets
}

function detectSection(headers) {
  if (['cost_price', 'sale_price', 'stock', 'min_stock', 'unit', 'category'].some((key) => headers.has(key))) return 'products'
  if (headers.has('balance')) return 'customers'
  if (headers.has('color') && !headers.has('phone')) return 'categories'
  if (headers.has('vendor') && !headers.has('phone') && !headers.has('name')) return null
  return null
}

function requireText(row, field) {
  const value = String(row[field] ?? '').trim()
  return value
}

function buildPlan(sections) {
  const plan = { categories: [], vendors: [], products: [], customers: [] }
  for (const [section, rows] of Object.entries(sections)) {
    if (!rows?.length) continue
    if (!plan[section]) throw new Error('অচেনা খাতা: ' + section)
    rows.forEach((row, index) => {
      const line = index + 2
      const name = requireText(row, 'name')
      if (!name) throw new Error(`${section} সারি ${line}: নাম খালি। ফাইল যোগ করা হয়নি।`)
      if (section === 'products') {
        const item = { name }
        for (const field of ['category', 'vendor', 'note', 'unit']) {
          if (row[field] != null && String(row[field]).trim()) item[field] = String(row[field]).trim()
        }
        if (item.unit) {
          const raw = norm(item.unit)
          const accepted = new Set(['pcs', 'piece', 'pieces', 'kg', 'kilogram', 'kilograms', 'litre', 'liter', 'liters', 'litres', 'ltr', 'bag', 'feet', 'foot', 'ft', 'cft', 'cuft', 'cubic-feet', 'ton', 'tonne', 'tonnes', 'gaj', 'gaz', 'box', 'carton', 'ctn', 'pack', 'packet', 'dozen', 'dz', 'bundle', 'bdl'])
          const known = accepted.has(raw) || UNIT_CATALOG.some((entry) => norm(entry.bn) === raw || entry.key === raw || entry.short === raw)
          if (!known) throw new Error(`products সারি ${line}: একক চেনা যায়নি।`)
          item.unit = normalizeUnitKey(item.unit)
        }
        for (const field of ['cost_price', 'sale_price', 'stock', 'min_stock']) {
          if (!(field in row)) continue
          const parsed = parseNumber(row[field])
          if (parsed.error) throw new Error(`products সারি ${line}: ${field} সংখ্যা নয়। ফাইল যোগ করা হয়নি।`)
          if (!parsed.empty) item[field] = parsed.value
        }
        plan.products.push(item)
      }
      if (section === 'customers') {
        const item = { name }
        if (row.phone != null && String(row.phone).trim()) {
          const phone = String(row.phone).replace(/\D/g, '').slice(0, 11)
          if (!/^01[3-9]\d{8}$/.test(phone)) throw new Error(`customers সারি ${line}: মোবাইল ০১XXXXXXXXX হতে হবে।`)
          item.phone = phone
        }
        if (row.address != null && String(row.address).trim()) item.address = String(row.address).trim()
        if (row.note != null && String(row.note).trim()) item.note = String(row.note).trim()
        if ('balance' in row) {
          const parsed = parseNumber(row.balance)
          if (parsed.error) throw new Error(`customers সারি ${line}: বাকি সংখ্যা নয়।`)
          if (!parsed.empty) item.balance = parsed.value
        }
        plan.customers.push(item)
      }
      if (section === 'vendors') {
        const item = { name }
        if (row.phone != null && String(row.phone).trim()) item.phone = String(row.phone).trim()
        if (row.address != null && String(row.address).trim()) item.address = String(row.address).trim()
        if (row.note != null && String(row.note).trim()) item.note = String(row.note).trim()
        plan.vendors.push(item)
      }
      if (section === 'categories') {
        const item = { name }
        if (row.color != null && String(row.color).trim()) item.color = String(row.color).trim()
        plan.categories.push(item)
      }
    })
  }
  if (!plan.categories.length && !plan.vendors.length && !plan.products.length && !plan.customers.length) {
    throw new Error('যোগ করার মতো কোনো সারি নেই।')
  }
  return plan
}

const sameName = (a, b) => norm(a) === norm(b)

async function applyPlan(plan) {
  const [categories, vendors, products, customers] = await Promise.all([
    data.list('categories'),
    data.list('vendors'),
    data.list('products'),
    data.list('customers'),
  ])
  const summary = { categories: 0, vendors: 0, products: 0, customers: 0 }

  for (const item of plan.customers) {
    const existing = customers.find((row) => (item.phone && row.phone === item.phone) || sameName(row.name, item.name))
    if (!existing && !item.phone) {
      throw new Error(`নতুন কাস্টমার "${item.name}" এর মোবাইল নেই। ফাইল থেকে কিছুই যোগ করা হয়নি।`)
    }
  }

  const ensureCategory = async (name) => {
    if (!name) return null
    let found = categories.find((row) => sameName(row.name, name))
    if (!found) {
      found = await data.insert('categories', { name, color: '#0f9d58' })
      categories.push(found)
      summary.categories += 1
    }
    return found.id
  }
  const ensureVendor = async (name) => {
    if (!name) return null
    let found = vendors.find((row) => sameName(row.name, name))
    if (!found) {
      found = await data.insert('vendors', { name })
      vendors.push(found)
      summary.vendors += 1
    }
    return found.id
  }

  for (const item of plan.categories) {
    const existing = categories.find((row) => sameName(row.name, item.name))
    if (existing) {
      if (item.color) {
        await data.update('categories', existing.id, { color: item.color })
        summary.categories += 1
      }
    } else {
      const created = await data.insert('categories', { name: item.name, color: item.color || '#0f9d58' })
      categories.push(created)
      summary.categories += 1
    }
  }

  for (const item of plan.vendors) {
    const existing = vendors.find((row) => (item.phone && row.phone === item.phone) || sameName(row.name, item.name))
    const patch = {}
    if (item.name) patch.name = item.name
    if (item.phone) patch.phone = item.phone
    if (item.address) patch.address = item.address
    if (item.note) patch.note = item.note
    if (existing) {
      await data.update('vendors', existing.id, patch)
    } else {
      vendors.push(await data.insert('vendors', patch))
    }
    summary.vendors += 1
  }

  for (const item of plan.products) {
    const existing = products.find((row) => sameName(row.name, item.name))
    const patch = { name: item.name }
    if (item.category) patch.category_id = await ensureCategory(item.category)
    if (item.vendor) patch.vendor_id = await ensureVendor(item.vendor)
    if (item.note) patch.note = item.note
    if (item.unit) patch.unit = item.unit
    if (item.cost_price != null) patch.cost_price = item.cost_price
    if (item.sale_price != null) patch.sale_price = item.sale_price
    if (item.stock != null) patch.stock = item.stock
    if (item.min_stock != null) patch.min_stock = item.min_stock
    if (existing) {
      await data.update('products', existing.id, patch)
    } else {
      products.push(await data.insert('products', patch))
    }
    summary.products += 1
  }

  for (const item of plan.customers) {
    const existing = customers.find((row) => (item.phone && row.phone === item.phone) || sameName(row.name, item.name))
    if (!existing && !item.phone) {
      throw new Error(`নতুন কাস্টমার "${item.name}" এর মোবাইল নেই। ফাইল থেকে কিছুই যোগ করা হয়নি।`)
    }
    const patch = { name: item.name }
    if (item.phone) patch.phone = item.phone
    if (item.address) patch.address = item.address
    if (item.note) patch.note = item.note
    if (item.balance != null) patch.balance = item.balance
    if (existing) {
      await data.update('customers', existing.id, patch)
    } else {
      customers.push(await data.insert('customers', { ...patch, balance: patch.balance || 0 }))
    }
    summary.customers += 1
  }

  return summary
}

export async function importLedgerFile(file) {
  if (isDemoMode()) throw new Error('ট্যুরের হিসাব সেভ হয় না। আসল দোকানে লগইন করে ফাইল দিন।')
  const sections = await readSections(file)
  const present = Object.fromEntries(Object.entries(sections).filter(([, rows]) => rows?.length))
  const plan = buildPlan(present)
  return applyPlan(plan)
}

import { useEffect, useMemo, useState } from 'react'
import data from '../lib/data'
import { Card, Button, Modal, Input, Field, Select, Textarea, Badge, EmptyState, Spinner, Chip } from '../components/ui'
import UnitSelect from '../components/UnitSelect'
import { PlusIcon, EditIcon, TrashIcon, SearchIcon, AlertIcon, PackageIcon } from '../components/icons'
import { formatBDT } from '../lib/format'

const blank = () => ({
  name: '',
  category_id: '',
  vendor_id: '',
  cost_price: 0,
  sale_price: 0,
  stock: 0,
  min_stock: 0,
  unit: 'pcs',
  serialTracked: false,
  warrantyMonths: 0,
  note: '',
})

export default function InventoryScreen() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterVendor, setFilterVendor] = useState('')
  const [showLow, setShowLow] = useState(false)
  const [editing, setEditing] = useState(null) // null or product or { ...blank }
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    const [p, c, v] = await Promise.all([data.list('products'), data.list('categories'), data.list('vendors')])
    setProducts(p); setCategories(c); setVendors(v)
    setLoading(false)
  }
  useEffect(() => {
    load()
    const handler = () => load()
    window.addEventListener('dokanbhai:dbchange', handler)
    window.addEventListener('dokanbhai:tenantchange', handler)
    return () => {
      window.removeEventListener('dokanbhai:dbchange', handler)
      window.removeEventListener('dokanbhai:tenantchange', handler)
    }
  }, [])

  // Category lookup so the search input also matches Bengali/English category names.
  const catNameById = useMemo(() => {
    const m = {}
    for (const c of categories) m[c.id] = c.name || ''
    return m
  }, [categories])

  const filtered = useMemo(() => {
    let list = [...products]
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((p) => {
        const name = (p.name || '').toLowerCase()
        const catName = (catNameById[p.category_id] || '').toLowerCase()
        return name.includes(q) || catName.includes(q)
      })
    }
    if (filterCategory) list = list.filter((p) => p.category_id === filterCategory)
    if (filterVendor) list = list.filter((p) => p.vendor_id === filterVendor)
    if (showLow) list = list.filter((p) => Number(p.stock || 0) <= Number(p.min_stock || 0))
    return list
  }, [products, search, filterCategory, filterVendor, showLow, catNameById])

  const lowCount = useMemo(() => products.filter((p) => Number(p.stock || 0) <= Number(p.min_stock || 0)).length, [products])

  const clearFilters = () => { setFilterCategory(''); setFilterVendor(''); setShowLow(false); setSearch('') }

  const onSave = async () => {
    if (!editing.name?.trim()) return
    setSaving(true)
    const payload = {
      name: editing.name.trim(),
      category_id: editing.category_id || null,
      vendor_id: editing.vendor_id || null,
      cost_price: Number(editing.cost_price || 0),
      sale_price: Number(editing.sale_price || 0),
      stock: Number(editing.stock || 0),
      min_stock: Number(editing.min_stock || 0),
      unit: editing.unit || 'pcs',
      serialTracked: !!editing.serialTracked,
      warrantyMonths: Number(editing.warrantyMonths || 0),
      note: editing.note || '',
    }
    if (editing.id) {
      await data.update('products', editing.id, payload)
    } else {
      await data.insert('products', payload)
    }
    setSaving(false)
    setEditing(null)
    load()
  }

  const onDelete = async (id) => {
    if (!confirm('এই পণ্য মুছবেন? ফেরানো যাবে না। Delete this product? This cannot be undone.')) return
    await data.remove('products', id)
    load()
  }

  const matchLabel = search.trim() || filterCategory || filterVendor || showLow
    ? `৬টির মধ্যে ${filtered.length}টি পণ্য পাওয়া গেছে / ${filtered.length} of ${products.length} matched`
    : `${products.length} পণ্য / ${products.length} products`

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-steel-400">মালামাল / Inventory</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-steel-800">পণ্য (Products)</h1>
          <p className="text-sm text-steel-500 mt-1">{matchLabel} · {lowCount} কম স্টক / low stock</p>
        </div>
        <Button onClick={() => setEditing(blank())}><PlusIcon size={16} /> পণ্য যোগ করুন / Add product</Button>
      </div>

      {lowCount > 0 && (
        <Card className="p-4 border-red-200 bg-red-50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-100 text-red-600"><AlertIcon size={18} /></div>
            <div className="flex-1">
              <p className="font-semibold text-red-700">{lowCount}টি পণ্য স্টক কম / {lowCount} item{lowCount > 1 ? 's' : ''} running low</p>
              <p className="text-sm text-red-600">সর্বনিম্ন থেকে কম বা সমান। Stock is at or below the minimum threshold.</p>
            </div>
            <Button variant="danger" size="sm" onClick={() => setShowLow(true)}>দেখুন / View</Button>
          </div>
        </Card>
      )}

      {/* Prominent mobile-first search bar + chip filters */}
      <Card className="p-4">
        <div className="relative">
          <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-steel-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="মালামাল খুঁজুন (নাম, ক্যাটাগরি)... / Search stock (name, category)..."
            className="pl-9 min-h-[44px]"
            inputMode="search"
          />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Chip active={!showLow && !filterCategory && !filterVendor && !search} onClick={clearFilters}>
            সব / All ({products.length})
          </Chip>
          <button
            type="button"
            onClick={() => setShowLow((s) => !s)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border min-h-[36px] transition ${
              showLow
                ? 'bg-red-500 text-white border-red-500'
                : 'bg-white text-steel-700 border-steel-200 hover:bg-steel-50'
            }`}
            title="কম স্টক / Low stock"
          >
            <span>⚠️ কম স্টক / Low Stock</span>
            {lowCount > 0 && (
              <span className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold ${
                showLow ? 'bg-white text-red-600' : 'bg-red-500 text-white'
              }`}>
                {lowCount}
              </span>
            )}
          </button>
          {categories.map((c) => (
            <Chip
              key={c.id}
              active={filterCategory === c.id}
              onClick={() => setFilterCategory(filterCategory === c.id ? '' : c.id)}
            >
              {c.name}
            </Chip>
          ))}
          {vendors.length > 0 && (
            <div className="ml-auto">
              <Select value={filterVendor} onChange={(e) => setFilterVendor(e.target.value)} className="min-h-[36px]">
                <option value="">সব সরবরাহকারী / All vendors</option>
                {vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
              </Select>
            </div>
          )}
        </div>
        {(filterCategory || filterVendor || showLow || search) && (
          <button onClick={clearFilters} className="mt-3 text-xs text-brand-600 font-semibold underline">
            সব ফিল্টার মুছুন / Clear filters
          </button>
        )}
      </Card>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-steel-400"><Spinner size={28} /></div>
      ) : filtered.length === 0 ? (
        <Card className="p-6">
          <EmptyState
            icon={<PackageIcon size={32} />}
            title="কোনো পণ্য মেলেনি / No products match"
            description="ফিল্টার মুছে দেখুন অথবা নতুন পণ্য যোগ করুন। Try clearing your filters or add a new product."
            action={<Button onClick={() => setEditing(blank())}><PlusIcon size={16} /> পণ্য যোগ করুন / Add product</Button>}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => {
            const cat = categories.find((c) => c.id === p.category_id)
            const ven = vendors.find((v) => v.id === p.vendor_id)
            const isLow = Number(p.stock || 0) <= Number(p.min_stock || 0)
            const margin = p.cost_price ? ((p.sale_price - p.cost_price) / p.cost_price) * 100 : 0
            return (
              <Card key={p.id} className={`p-4 ${isLow ? 'border-red-200' : ''}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-steel-800 truncate">{p.name}</p>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {cat && <Badge color="purple">{cat.name}</Badge>}
                      {ven && <Badge color="gray">{ven.name}</Badge>}
                      {isLow && <Badge color="red">Low stock</Badge>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => setEditing(p)} className="p-2 rounded-lg text-steel-500 hover:bg-steel-100 min-w-[36px] min-h-[36px]" title="সম্পাদন / Edit"><EditIcon size={14} /></button>
                    <button onClick={() => onDelete(p.id)} className="p-2 rounded-lg text-steel-500 hover:bg-red-50 hover:text-red-600 min-w-[36px] min-h-[36px]" title="মুছুন / Delete"><TrashIcon size={14} /></button>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-steel-400 font-semibold">স্টক / Stock</p>
                    <p className={`font-bold ${isLow ? 'text-red-600' : 'text-steel-800'}`}>{p.stock} <span className="text-xs text-steel-400 font-normal">{p.unit}</span></p>
                    <p className="text-[10px] text-steel-400">সর্বনিম্ন / min: {p.min_stock}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-steel-400 font-semibold">বিক্রয়মূল্য / Sale price</p>
                    <p className="font-bold text-steel-800">{formatBDT(p.sale_price)}</p>
                    <p className="text-[10px] text-steel-400">ক্রয়মূল্য / Cost {formatBDT(p.cost_price)} · {margin.toFixed(0)}%</p>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? 'পণ্য সম্পাদন / Edit product' : 'নতুন পণ্য / Add product'}
        size="lg"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setEditing(null)}>বাতিল / Cancel</Button>
            <Button onClick={onSave} disabled={saving}>{saving ? 'সংরক্ষণ… / Saving…' : 'সংরক্ষণ / Save'}</Button>
          </div>
        }
      >
        {editing && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="পণ্যের নাম / Product name" className="md:col-span-2">
              <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="যেমন / e.g. Miniket Rice 25kg" />
            </Field>
            <Field label="ক্যাটাগরি / Category">
              <Select value={editing.category_id || ''} onChange={(e) => setEditing({ ...editing, category_id: e.target.value })}>
                <option value="">নির্বাচন / Select…</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            </Field>
            <Field label="সরবরাহকারী / Vendor">
              <Select value={editing.vendor_id || ''} onChange={(e) => setEditing({ ...editing, vendor_id: e.target.value })}>
                <option value="">নির্বাচন / Select…</option>
                {vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
              </Select>
            </Field>
            <Field label="ক্রয়মূল্য / Cost price (৳)">
              <Input type="number" min="0" step="0.01" inputMode="decimal" value={editing.cost_price} onChange={(e) => setEditing({ ...editing, cost_price: e.target.value })} className="min-h-[44px]" />
            </Field>
            <Field label="বিক্রয়মূল্য / Sale price (৳)">
              <Input type="number" min="0" step="0.01" inputMode="decimal" value={editing.sale_price} onChange={(e) => setEditing({ ...editing, sale_price: e.target.value })} className="min-h-[44px]" />
            </Field>
            <Field label="মজুদ / Stock on hand">
              <Input type="number" min="0" step="1" inputMode="numeric" value={editing.stock} onChange={(e) => setEditing({ ...editing, stock: e.target.value })} className="min-h-[44px]" />
            </Field>
            <Field label="সর্বনিম্ন স্টক / Minimum stock" hint="স্টক এই সংখ্যায় বা কমে গেলে সতর্কতা দেখাবে।">
              <Input type="number" min="0" step="1" inputMode="numeric" value={editing.min_stock} onChange={(e) => setEditing({ ...editing, min_stock: e.target.value })} className="min-h-[44px]" />
            </Field>
            <Field label="একক / Unit">
              <UnitSelect value={editing.unit} onChange={(v) => setEditing({ ...editing, unit: v })} />
            </Field>
            <Field label="সিরিয়াল নম্বর ট্র্যাক / Track serial numbers" hint="ইলেকট্রনিক্স বা ওয়ারেন্টিযুক্ত পণ্যের জন্য।">
              <label className="inline-flex items-center gap-2 text-sm text-steel-700 cursor-pointer min-h-[44px]">
                <input
                  type="checkbox"
                  checked={!!editing.serialTracked}
                  onChange={(e) => setEditing({ ...editing, serialTracked: e.target.checked })}
                  className="w-5 h-5 accent-brand-500"
                />
                হ্যাঁ / Yes — capture serial / IMEI at POS
              </label>
            </Field>
            <Field label="ওয়ারেন্টি (মাস) / Warranty (months)" hint="বিক্রয়ের সময় রিসিটে দেখানো হবে।">
              <Input
                type="number"
                min="0"
                step="1"
                inputMode="numeric"
                value={editing.warrantyMonths || 0}
                onChange={(e) => setEditing({ ...editing, warrantyMonths: e.target.value })}
                className="min-h-[44px]"
              />
            </Field>
            <Field label="Note" className="md:col-span-2">
              <Textarea rows={2} value={editing.note || ''} onChange={(e) => setEditing({ ...editing, note: e.target.value })} placeholder="Optional / ঐচ্ছিক" />
            </Field>
          </div>
        )}
      </Modal>
    </div>
  )
}

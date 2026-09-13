import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import data from '../lib/data'
import { useProfile } from '../context/ProfileContext'
import { Card, Button, Input, Modal, Field, Select, EmptyState, Spinner, Badge } from '../components/ui'
import {
  PlusIcon, MinusIcon, SearchIcon, TrashIcon, XIcon, CheckIcon, UsersIcon, PackageIcon, MoneyIcon, ReceiptIcon, PrintIcon,
} from '../components/icons'
import { formatBDT, formatDateTime, formatQty, initials, avatarColor } from '../lib/format'
import { stepFor, decimalsFor, normalizeUnitKey, getUnit, roundQty } from '../lib/units'

export default function NewSaleScreen() {
  const navigate = useNavigate()
  const { profile, updateProfile } = useProfile()
  const [products, setProducts] = useState([])
  const [customers, setCustomers] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState([]) // [{ product_id, name, unit_price, qty, unit, stock, serialTracked, warrantyMonths, serialNumber, warrantyNote }]
  const [customer, setCustomer] = useState(null)
  const [discount, setDiscount] = useState(0)
  const [paid, setPaid] = useState(0)
  const [payType, setPayType] = useState('cash')
  const [note, setNote] = useState('')
  const [showPicker, setShowPicker] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [receipt, setReceipt] = useState(null)

  const receiptWidth = profile?.store?.receiptWidth || '80mm'

  const load = async () => {
    setLoading(true)
    const [p, c, cat] = await Promise.all([data.list('products'), data.list('customers'), data.list('categories')])
    // Coerce stock / prices to numbers up-front so cart math never sees NaN.
    setProducts(p.map((x) => ({
      ...x,
      unit: normalizeUnitKey(x.unit),
      stock: Number(x.stock || 0),
      min_stock: Number(x.min_stock || 0),
      cost_price: Number(x.cost_price || 0),
      sale_price: Number(x.sale_price || 0),
    })))
    setCustomers(c); setCategories(cat)
    setLoading(false)
  }
  useEffect(() => {
    load()
    const handler = () => load()
    window.addEventListener('dokanbhai:dbchange', handler)
    return () => window.removeEventListener('dokanbhai:dbchange', handler)
  }, [])

  const subtotal = useMemo(() => cart.reduce((s, it) => s + it.qty * it.unit_price, 0), [cart])
  const total = useMemo(() => Math.max(0, subtotal - Number(discount || 0)), [subtotal, discount])
  const due = useMemo(() => Math.max(0, total - Number(paid || 0)), [total, paid])
  const change = useMemo(() => Math.max(0, Number(paid || 0) - total), [paid, total])

  const addToCart = (p) => {
    // `p.stock` has already been coerced to Number() in `load()` above. We
    // also defensively re-coerce here in case the caller is a Supabase row
    // that bypassed the loader (e.g. an out-of-band `data.insert` followed
    // by an immediate add).
    const stock = Number(p.stock || 0)
    const salePrice = Number(p.sale_price || 0)
    if (!Number.isFinite(stock) || stock <= 0) return
    setCart((c) => {
      const existing = c.find((i) => i.product_id === p.id)
      if (existing) {
        const step = stepFor(existing.unit)
        const candidate = roundQty(Number(existing.qty || 0) + step, existing.unit)
        if (!Number.isFinite(candidate) || candidate > stock) return c
        return c.map((i) => i.product_id === p.id ? { ...i, qty: candidate } : i)
      }
      // Initial qty respects the unit's step (1 for pcs, 0.001 for kg, etc.)
      // so we never start the cart with a fractional piece.
      const initialQty = roundQty(stepFor(p.unit), p.unit)
      return [...c, {
        product_id: p.id,
        name: p.name,
        unit_price: salePrice,
        qty: initialQty,
        unit: p.unit,
        stock,
        serialTracked: !!p.serialTracked,
        warrantyMonths: Number(p.warrantyMonths || 0),
        serialNumber: '',
        warrantyNote: '',
      }]
    })
    setShowPicker(null)
  }
  const updateQty = (id, delta) => {
    setCart((c) => c.flatMap((i) => {
      if (i.product_id !== id) return [i]
      // Coerce + round through units.js so fractional units (kg, cft, ltr)
      // never drift into NaN or exceed the unit's decimals.
      const step = stepFor(i.unit)
      const decimals = decimalsFor(i.unit)
      const stock = Number(i.stock || 0)
      const candidate = roundQty(Number(i.qty || 0) + Number(delta || 0), i.unit)
      if (!Number.isFinite(candidate) || candidate <= 0) return []
      // Guard against NaN deltas (e.g. a stray unparseable input).
      if (!Number.isFinite(step)) return [i]
      if (candidate > stock + 1e-9) return [i] // already at max stock
      // Avoid silent drift: snap to step grid if needed.
      const snapped = Math.round(candidate / step) * step
      const finalQty = Number(snapped.toFixed(decimals + 2))
      return [{ ...i, qty: finalQty }]
    }))
  }
  const removeFromCart = (id) => setCart((c) => c.filter((i) => i.product_id !== id))
  const setPrice = (id, price) => {
    setCart((c) => c.map((i) => i.product_id === id ? { ...i, unit_price: Math.max(0, Number(price || 0)) } : i))
  }
  const setSerial = (id, val) => {
    setCart((c) => c.map((i) => i.product_id === id ? { ...i, serialNumber: val } : i))
  }
  const setWarranty = (id, val) => {
    setCart((c) => c.map((i) => i.product_id === id ? { ...i, warrantyNote: val } : i))
  }
  const toggleReceiptWidth = () => {
    const next = receiptWidth === '80mm' ? '58mm' : '80mm'
    updateProfile({ store: { receiptWidth: next } })
  }

  const onCheckout = async () => {
    if (!customer) { alert('Please select a customer'); return }
    if (cart.length === 0) { alert('Cart is empty'); return }
    setProcessing(true)
    try {
      const invoice = await data.createSale({
        customer_id: customer.id,
        items: cart.map((i) => ({
          product_id: i.product_id,
          name: i.name,
          qty: i.qty,
          unit_price: i.unit_price,
          serialNumber: i.serialNumber || '',
          warrantyNote: i.warrantyNote || '',
        })),
        discount: Number(discount || 0),
        paid_amount: Number(paid || 0),
        pay_type: payType,
        note,
      })
      setReceipt({ ...invoice, customer })
    } catch (err) {
      alert('Failed to save sale: ' + (err?.message || err))
    } finally {
      setProcessing(false)
    }
  }

  const resetSale = () => {
    setCart([]); setCustomer(null); setDiscount(0); setPaid(0); setPayType('cash'); setNote(''); setReceipt(null)
    load()
  }

  if (loading) return <div className="flex items-center justify-center py-20 text-steel-400"><Spinner size={28} /></div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-steel-400">POS / নতুন বিক্রয়</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-steel-800">নতুন বিক্রয় (New Sale)</h1>
          <p className="text-sm text-steel-500 mt-1">বিক্রয় তৈরি করুন, পেমেন্ট নিন এবং রিসিট প্রিন্ট করুন।</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={toggleReceiptWidth} title="Toggle receipt width">
            <PrintIcon size={14} /> {receiptWidth}
          </Button>
          <Button variant="secondary" size="sm" onClick={resetSale}>Clear</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-steel-800">Products</h3>
              <Button size="sm" onClick={() => setShowPicker('product')}><PlusIcon size={16} /> Add items</Button>
            </div>
            {cart.length === 0 ? (
              <EmptyState icon={<PackageIcon size={32} />} title="Cart is empty" description="Pick products to start a sale." action={
                <Button onClick={() => setShowPicker('product')}><PlusIcon size={16} /> Choose products</Button>
              } />
            ) : (
              <div className="divide-y divide-steel-100">
                {cart.map((it) => (
                  <div key={it.product_id} className="py-3 space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center text-xs font-bold">
                        {initials(it.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-steel-800 truncate">{it.name}</p>
                        <p className="text-xs text-steel-500">Stock: {it.stock} {getUnit(it.unit).short}{it.serialTracked ? ' · সিরিয়াল ট্র্যাকড' : ''}{it.warrantyMonths ? ` · ${it.warrantyMonths} মাস ওয়ারেন্টি` : ''}</p>
                      </div>
                      <div>
                        <Input
                          type="number"
                          min="0"
                          step={stepFor(it.unit)}
                          value={it.unit_price}
                          onChange={(e) => setPrice(it.product_id, e.target.value)}
                          className="w-24 text-right"
                          title="Unit price (৳)"
                        />
                      </div>
                      <div className="inline-flex items-center border border-steel-200 rounded-lg overflow-hidden">
                        <button onClick={() => updateQty(it.product_id, -stepFor(it.unit))} className="px-2 py-1.5 hover:bg-steel-50 text-steel-600"><MinusIcon size={14} /></button>
                        <span className="px-2 min-w-10 text-center text-sm font-semibold">{formatQty(it.qty, it.unit)}</span>
                        <button onClick={() => updateQty(it.product_id, stepFor(it.unit))} className="px-2 py-1.5 hover:bg-steel-50 text-steel-600"><PlusIcon size={14} /></button>
                      </div>
                      <div className="w-28 text-right font-bold text-steel-800">{formatBDT(it.qty * it.unit_price)}</div>
                      <button onClick={() => removeFromCart(it.product_id)} className="p-1.5 rounded-lg text-steel-400 hover:bg-red-50 hover:text-red-600"><TrashIcon size={14} /></button>
                    </div>
                    {(it.serialTracked || it.warrantyMonths > 0) && (
                      <div className="ml-12 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {it.serialTracked && (
                          <Input
                            placeholder="সিরিয়াল নম্বর / Serial / IMEI"
                            value={it.serialNumber || ''}
                            onChange={(e) => setSerial(it.product_id, e.target.value)}
                            className="text-xs"
                          />
                        )}
                        {it.warrantyMonths > 0 && (
                          <Input
                            placeholder={`ওয়ারেন্টি নোট (${it.warrantyMonths} মাস)`}
                            value={it.warrantyNote || ''}
                            onChange={(e) => setWarranty(it.product_id, e.target.value)}
                            className="text-xs"
                          />
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-4">
            <h3 className="font-bold text-steel-800 mb-3">Customer</h3>
            {customer ? (
              <div className="flex items-center justify-between p-3 bg-brand-50 border border-brand-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full text-white flex items-center justify-center font-bold" style={{ background: avatarColor(customer.name) }}>
                    {initials(customer.name)}
                  </div>
                  <div>
                    <p className="font-semibold text-steel-800">{customer.name}</p>
                    <p className="text-xs text-steel-500">{customer.phone || '—'}</p>
                  </div>
                </div>
                <button onClick={() => setCustomer(null)} className="p-1.5 rounded-lg text-steel-500 hover:bg-white"><XIcon size={14} /></button>
              </div>
            ) : (
              <Button variant="secondary" className="w-full" onClick={() => setShowPicker('customer')}>
                <UsersIcon size={16} /> Select customer
              </Button>
            )}
          </Card>

          <Card className="p-4">
            <h3 className="font-bold text-steel-800 mb-3">Payment</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-steel-500">মোট (Subtotal)</span>
                <span className="font-semibold text-steel-800">{formatBDT(subtotal)}</span>
              </div>
              <Field label="ডিসকাউন্ট / Discount (৳)">
                <Input type="number" min="0" step="0.01" value={discount} onChange={(e) => setDiscount(Number(e.target.value || 0))} />
              </Field>
              <div className="flex items-center justify-between text-base font-bold border-t border-steel-100 pt-2">
                <span>সর্বমোট (Total)</span>
                <span className="text-brand-600">{formatBDT(total)}</span>
              </div>
              <Field label="প্রদান / Paid amount (৳)">
                <Input type="number" min="0" step="0.01" value={paid} onChange={(e) => setPaid(Number(e.target.value || 0))} />
              </Field>
              <Field label="পেমেন্ট পদ্ধতি (Payment method)">
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { k: 'cash', label: 'নগদ (Nogod)' },
                    { k: 'credit', label: 'বাকি (Baki)' },
                    { k: 'online', label: 'অনলাইন' },
                  ].map((p) => (
                    <button
                      key={p.k}
                      type="button"
                      onClick={() => setPayType(p.k)}
                      className={`py-2 rounded-lg text-xs font-semibold border transition ${
                        payType === p.k
                          ? 'bg-brand-500 text-white border-brand-500'
                          : 'bg-white text-steel-600 border-steel-200 hover:bg-steel-50'
                      }`}
                    >{p.label}</button>
                  ))}
                </div>
              </Field>
              <Field label="Note (optional)">
                <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Reference" />
              </Field>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-lg bg-red-50 border border-red-100">
                  <p className="text-[10px] uppercase tracking-wide text-red-600 font-semibold">বাকি (Due)</p>
                  <p className="text-lg font-bold text-red-700">{formatBDT(due)}</p>
                </div>
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                  <p className="text-[10px] uppercase tracking-wide text-emerald-600 font-semibold">{change > 0 ? 'Change' : 'Paid'}</p>
                  <p className="text-lg font-bold text-emerald-700">{formatBDT(change > 0 ? change : paid)}</p>
                </div>
              </div>
              <Button onClick={onCheckout} size="lg" className="w-full" disabled={processing || cart.length === 0 || !customer}>
                <CheckIcon size={18} /> {processing ? 'Saving…' : 'Complete sale'}
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <Modal open={showPicker === 'product'} onClose={() => setShowPicker(null)} title="Choose products" size="xl">
        <ProductPicker products={products} categories={categories} onPick={addToCart} />
      </Modal>

      <Modal open={showPicker === 'customer'} onClose={() => setShowPicker(null)} title="Select customer" size="lg">
        <CustomerPicker
          customers={customers}
          onPick={(c) => { setCustomer(c); setShowPicker(null) }}
          onCreate={async (payload) => {
            const newC = await data.insert('customers', payload)
            setCustomer(newC); setShowPicker(null); load()
          }}
        />
      </Modal>

      <Modal
        open={!!receipt}
        onClose={() => { setReceipt(null); resetSale() }}
        title="Sale complete"
        size="lg"
        footer={
          <div className="flex justify-between gap-2">
            <Button variant="secondary" onClick={() => { setReceipt(null); resetSale() }}>New sale</Button>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => navigate('/sales')}><ReceiptIcon size={16} /> Sales history</Button>
              <Button onClick={() => window.print()}><PrintIcon size={16} /> Print receipt</Button>
            </div>
          </div>
        }
      >
        {receipt && <Receipt invoice={receipt} customer={receipt.customer} store={profile?.store} />}
      </Modal>
    </div>
  )
}

function ProductPicker({ products, categories, onPick }) {
  const [search, setSearch] = useState('')
  const [cat, setCat] = useState('')
  const filtered = useMemo(() => {
    let list = [...products]
    if (search.trim()) list = list.filter((p) => p.name?.toLowerCase().includes(search.toLowerCase()))
    if (cat) list = list.filter((p) => p.category_id === cat)
    return list
  }, [products, search, cat])
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        <div className="relative">
          <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-steel-400" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products" className="pl-9" />
        </div>
        <Select value={cat} onChange={(e) => setCat(e.target.value)}>
          <option value="">All categories</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-96 overflow-y-auto">
        {filtered.map((p) => {
          const c = categories.find((c) => c.id === p.category_id)
          const stock = Number(p.stock || 0)
          const minStock = Number(p.min_stock || 0)
          const out = stock <= 0
          const low = !out && stock <= minStock
          return (
            <button
              key={p.id}
              onClick={() => !out && onPick(p)}
              disabled={out}
              className={`text-left p-3 rounded-xl border transition ${
                out ? 'bg-steel-50 border-steel-100 opacity-50 cursor-not-allowed' : 'bg-white border-steel-100 hover:border-brand-300 hover:bg-brand-50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-sm text-steel-800 truncate">{p.name}</span>
                {c && <span className="w-2 h-2 rounded-full" style={{ background: c.color }} />}
              </div>
              <p className="text-xs text-steel-500">{c?.name || 'Uncategorized'}</p>
              <div className="mt-1.5 flex items-center justify-between">
                <span className="text-sm font-bold text-brand-600">{formatBDT(p.sale_price)}</span>
                <Badge color={out ? 'red' : (low ? 'yellow' : 'green')}>
                  {out ? 'স্টক নেই' : `${stock} ${getUnit(p.unit).short}`}
                </Badge>
              </div>
              {p.serialTracked && <p className="mt-1 text-[10px] text-steel-500">সিরিয়াল ট্র্যাকড · {p.warrantyMonths || 0} মাস</p>}
            </button>
          )
        })}
        {filtered.length === 0 && <p className="col-span-full text-center text-sm text-steel-500 py-6">No products found.</p>}
      </div>
    </div>
  )
}

function CustomerPicker({ customers, onPick, onCreate }) {
  const [search, setSearch] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', address: '' })
  const filtered = customers.filter((c) => c.name?.toLowerCase().includes(search.toLowerCase()) || c.phone?.includes(search))
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div className="relative flex-1">
          <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-steel-400" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search customers" className="pl-9" />
        </div>
        <Button onClick={() => setShowNew(true)}><PlusIcon size={16} /> New</Button>
      </div>
      <ul className="space-y-2 max-h-72 overflow-y-auto">
        {filtered.map((c) => (
          <li key={c.id}>
            <button onClick={() => onPick(c)} className="w-full flex items-center gap-3 p-3 rounded-xl border border-steel-100 hover:border-brand-300 hover:bg-brand-50 transition text-left">
              <div className="w-10 h-10 rounded-full text-white flex items-center justify-center font-bold" style={{ background: avatarColor(c.name) }}>
                {initials(c.name)}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-steel-800">{c.name}</p>
                <p className="text-xs text-steel-500">{c.phone || '—'}</p>
              </div>
              {c.balance > 0 && <Badge color="red">বাকি {formatBDT(c.balance)}</Badge>}
            </button>
          </li>
        ))}
        {filtered.length === 0 && <p className="text-center text-sm text-steel-500 py-6">No customers.</p>}
      </ul>
      {showNew && (
        <Modal
          open={showNew}
          onClose={() => setShowNew(false)}
          title="New customer"
          footer={
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setShowNew(false)}>Cancel</Button>
              <Button onClick={() => { if (form.name.trim()) { onCreate({ ...form, balance: 0 }); setShowNew(false); setForm({ name: '', phone: '', address: '' }) } }}>
                Save
              </Button>
            </div>
          }
        >
          <div className="space-y-3">
            <Field label="Name"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
            <Field label="Phone"><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
            <Field label="Address"><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></Field>
          </div>
        </Modal>
      )}
    </div>
  )
}

function Receipt({ invoice, customer, store }) {
  const widthKey = store?.receiptWidth === '58mm' ? '58' : '80'
  const business = store || {}
  return (
    <div id="receipt-print" data-width={widthKey} className="bg-white border border-steel-200 rounded-lg p-5 mx-auto" style={{ width: widthKey === '58' ? '58mm' : '80mm' }}>
      <div className="text-center">
        <p className="font-bold text-base">{business.name || 'DokanBhai'}</p>
        {business.businessLabel && <p className="text-xs text-steel-500">{business.businessLabel}</p>}
        {business.region && <p className="text-xs text-steel-500">{business.region}</p>}
        {business.ownerName && <p className="text-xs text-steel-500">Owner: {business.ownerName}</p>}
      </div>
      <hr className="border-dashed border-steel-300 my-3" />
      <div className="text-xs">
        <div className="flex justify-between"><span>Invoice</span><span className="font-mono">{invoice.invoice_no}</span></div>
        <div className="flex justify-between"><span>Date</span><span>{formatDateTime(invoice.date)}</span></div>
        <div className="flex justify-between"><span>Customer</span><span>{customer?.name || 'Walk-in'}</span></div>
        <div className="flex justify-between"><span>Pay Type</span><span className="uppercase">{invoice.pay_type === 'cash' ? 'Nogod' : invoice.pay_type === 'credit' ? 'Baki' : invoice.pay_type}</span></div>
      </div>
      <hr className="border-dashed border-steel-300 my-3" />
      <table className="w-full text-xs">
        <thead>
          <tr className="text-left">
            <th className="pb-1">Item</th>
            <th className="pb-1 text-right">Qty</th>
            <th className="pb-1 text-right">Price</th>
            <th className="pb-1 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((it, i) => (
            <tr key={i} className="align-top">
              <td className="pr-1">
                {it.name}
                {(it.serialNumber || it.warrantyNote) && (
                  <div className="text-[10px] text-steel-500 leading-tight">
                    {it.serialNumber && <div>SN: {it.serialNumber}</div>}
                    {it.warrantyNote && <div>Warranty: {it.warrantyNote}</div>}
                  </div>
                )}
              </td>
              <td className="text-right">{formatQty(it.qty, it.unit || 'pcs')}</td>
              <td className="text-right">{formatBDT(it.unit_price)}</td>
              <td className="text-right">{formatBDT(it.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <hr className="border-dashed border-steel-300 my-3" />
      <div className="text-xs space-y-1">
        <div className="flex justify-between"><span>Subtotal</span><span>{formatBDT(invoice.subtotal)}</span></div>
        {invoice.discount > 0 && <div className="flex justify-between"><span>Discount</span><span>-{formatBDT(invoice.discount)}</span></div>}
        <div className="flex justify-between font-bold text-sm"><span>Total (৳)</span><span>{formatBDT(invoice.total)}</span></div>
        <div className="flex justify-between"><span>Paid</span><span>{formatBDT(invoice.paid_amount)}</span></div>
        {invoice.due_amount > 0 && <div className="flex justify-between"><span>Due (বাকি)</span><span className="font-bold text-red-600">{formatBDT(invoice.due_amount)}</span></div>}
      </div>
      <hr className="border-dashed border-steel-300 my-3" />
      <div className="text-center text-xs text-steel-500">
        <p>ধন্যবাদ! আবার আসবেন।</p>
        <p>Thank you · Visit again · {new Date().toLocaleDateString('en-GB')}</p>
        <p className="mt-1 font-semibold">Powered by DokanBhai</p>
      </div>
    </div>
  )
}

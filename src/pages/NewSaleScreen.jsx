import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import data from '../lib/data'
import { useProfile } from '../context/ProfileContext'
import { Card, Button, Input, Modal, Field, Select, EmptyState, Spinner, Badge } from '../components/ui'
import {
  PlusIcon, MinusIcon, SearchIcon, TrashIcon, XIcon, CheckIcon, UsersIcon, PackageIcon, MoneyIcon, ReceiptIcon, PrintIcon, CartIcon,
} from '../components/icons'
import { formatBDT, formatDateTime, formatQty, initials, avatarColor } from '../lib/format'
import { stepFor, decimalsFor, normalizeUnitKey, getUnit, roundQty } from '../lib/units'

const PHONE_REGEX = /^01[3-9]\d{8}$/

export default function NewSaleScreen() {
  const navigate = useNavigate()
  const { profile, updateProfile } = useProfile()
  const [products, setProducts] = useState([])
  const [customers, setCustomers] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState([]) // [{ product_id, name, unit_price, qty, unit, stock, serialTracked, warrantyMonths, serialNumber, warrantyNote }]
  const [customer, setCustomer] = useState(null) // null = walk-in
  const [discount, setDiscount] = useState(0)
  const [paid, setPaid] = useState(0)
  const [payType, setPayType] = useState('cash')
  const [note, setNote] = useState('')
  const [showPicker, setShowPicker] = useState(null) // 'product' | 'customer' | null
  const [processing, setProcessing] = useState(false)
  const [receipt, setReceipt] = useState(null)
  const [catalogSearch, setCatalogSearch] = useState('')
  const [cartSheetOpen, setCartSheetOpen] = useState(false)
  const [bakiSheetOpen, setBakiSheetOpen] = useState(false)

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
    window.addEventListener('dokanbhai:tenantchange', handler)
    return () => {
      window.removeEventListener('dokanbhai:dbchange', handler)
      window.removeEventListener('dokanbhai:tenantchange', handler)
    }
  }, [])

  const subtotal = useMemo(() => cart.reduce((s, it) => s + it.qty * it.unit_price, 0), [cart])
  const total = useMemo(() => Math.max(0, subtotal - Number(discount || 0)), [subtotal, discount])
  const due = useMemo(() => Math.max(0, total - Number(paid || 0)), [total, paid])
  const change = useMemo(() => Math.max(0, Number(paid || 0) - total), [paid, total])

  // Baki workflow — if the user picks credit or under-pays, a customer is
  // REQUIRED. The baki modal (B1) collects one if not already assigned.
  const bakiRequired = (payType === 'credit') || (due > 0)

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
    if (cart.length === 0) { alert('কার্ট খালি / Cart is empty'); return }
    // Baki gate: must have a customer. Walk-in is allowed ONLY for cash.
    if (bakiRequired && !customer) {
      setBakiSheetOpen(true)
      return
    }
    setProcessing(true)
    try {
      // Walk-in sales have a null customer_id. The PostgreSQL stored
      // procedure expects a sanitized payload, so we explicitly coerce
      // everything to a clean Number / string.
      const invoice = await data.createSale({
        customer_id: customer ? customer.id : null,
        items: cart.map((i) => ({
          product_id: i.product_id,
          name: i.name,
          qty: Number(i.qty),
          unit_price: Number(i.unit_price),
          serialNumber: i.serialNumber || '',
          warrantyNote: i.warrantyNote || '',
        })),
        discount: Number(discount || 0),
        paid_amount: Number(paid || 0),
        pay_type: payType,
        note: note || '',
      })
      setReceipt({ ...invoice, customer })
      setCartSheetOpen(false)
    } catch (err) {
      alert('বিক্রয় সংরক্ষণ ব্যর্থ / Failed to save sale: ' + (err?.message || err))
    } finally {
      setProcessing(false)
    }
  }

  const resetSale = () => {
    setCart([]); setCustomer(null); setDiscount(0); setPaid(0); setPayType('cash'); setNote(''); setReceipt(null); setCatalogSearch(''); setCartSheetOpen(false)
    load()
  }

  // Quick catalog filter (used by the mobile in-page catalog).
  const filteredCatalog = useMemo(() => {
    const q = catalogSearch.trim().toLowerCase()
    if (!q) return products
    return products.filter((p) => {
      const name = (p.name || '').toLowerCase()
      const cat = categories.find((c) => c.id === p.category_id)
      const catName = (cat?.name || '').toLowerCase()
      return name.includes(q) || catName.includes(q)
    })
  }, [products, categories, catalogSearch])

  if (loading) return <div className="flex items-center justify-center py-20 text-steel-400"><Spinner size={28} /></div>

  const walkIn = !customer

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
          <Button variant="secondary" size="sm" onClick={resetSale}>মুছুন / Clear</Button>
        </div>
      </div>

      {/* Mobile-only inline product catalog with real-time search.
          Hidden on lg+, where the desktop layout below takes over. */}
      <div className="lg:hidden">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3 gap-2">
            <h3 className="font-bold text-steel-800 flex-1">পণ্য / Products</h3>
            <span className="text-xs text-steel-500">{filteredCatalog.length} / {products.length}</span>
          </div>
          <div className="relative mb-3">
            <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-steel-400" />
            <Input
              value={catalogSearch}
              onChange={(e) => setCatalogSearch(e.target.value)}
              placeholder="মালামাল খুঁজুন (নাম, ক্যাটাগরি)... / Search stock"
              className="pl-9 min-h-[44px]"
              inputMode="search"
            />
          </div>
          {filteredCatalog.length === 0 ? (
            <EmptyState icon={<PackageIcon size={28} />} title="কোনো পণ্য মেলেনি / No matches" />
          ) : (
            <div className="grid grid-cols-2 gap-2 max-h-[60vh] overflow-y-auto pr-1">
              {filteredCatalog.map((p) => {
                const stock = Number(p.stock || 0)
                const minStock = Number(p.min_stock || 0)
                const out = stock <= 0
                const low = !out && stock <= minStock
                const cat = categories.find((c) => c.id === p.category_id)
                const inCart = cart.some((c) => c.product_id === p.id)
                return (
                  <button
                    key={p.id}
                    onClick={() => addToCart(p)}
                    disabled={out}
                    className={`text-left p-3 rounded-xl border transition min-h-[88px] ${
                      out
                        ? 'bg-steel-50 border-steel-100 opacity-50 cursor-not-allowed'
                        : 'bg-white border-steel-200 hover:border-brand-300 hover:bg-brand-50 active:scale-[0.98]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <span className="font-semibold text-xs text-steel-800 line-clamp-2 leading-tight">{p.name}</span>
                      {inCart && <span className="w-2 h-2 rounded-full bg-brand-500 shrink-0 mt-1" />}
                    </div>
                    {cat && <p className="mt-0.5 text-[10px] text-steel-500 truncate">{cat.name}</p>}
                    <div className="mt-1.5 flex items-center justify-between">
                      <span className="text-xs font-bold text-brand-600">{formatBDT(p.sale_price)}</span>
                      <Badge color={out ? 'red' : (low ? 'yellow' : 'green')}>
                        {out ? 'স্টক নেই' : `${stock} ${getUnit(p.unit).short}`}
                      </Badge>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </Card>
      </div>

      <div className="lg:grid lg:grid-cols-3 lg:gap-6 space-y-4 lg:space-y-0">
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-4 hidden lg:block">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-steel-800">পণ্য / Products</h3>
              <Button size="sm" onClick={() => setShowPicker('product')}><PlusIcon size={16} /> যোগ করুন / Add items</Button>
            </div>
            {cart.length === 0 ? (
              <EmptyState icon={<PackageIcon size={32} />} title="কার্ট খালি / Cart is empty" description="পণ্য বাছাই করে বিক্রয় শুরু করুন। Pick products to start a sale." action={
                <Button onClick={() => setShowPicker('product')}><PlusIcon size={16} /> পণ্য বাছুন / Choose products</Button>
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
                        <p className="text-xs text-steel-500">স্টক / Stock: {it.stock} {getUnit(it.unit).short}{it.serialTracked ? ' · সিরিয়াল ট্র্যাকড' : ''}{it.warrantyMonths ? ` · ${it.warrantyMonths} মাস ওয়ারেন্টি` : ''}</p>
                      </div>
                      <div>
                        <Input
                          type="number"
                          min="0"
                          step={stepFor(it.unit)}
                          inputMode="decimal"
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
            <h3 className="font-bold text-steel-800 mb-1">
              কাস্টমার / Customer
              {walkIn && <span className="ml-2 text-xs text-steel-500 font-normal">· ওয়াক-ইন কাস্টমার / Walk-in</span>}
            </h3>
            <p className="text-[11px] text-steel-500 mb-3">
              ক্যাশ ও অনলাইন বিক্রয়ের জন্য কাস্টমার ঐচ্ছিক। বাকি বিক্রয়ে কাস্টমার আবশ্যক।
              <br />Customer optional for cash/online; required for baki/credit.
            </p>
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
                <button onClick={() => setCustomer(null)} className="p-1.5 rounded-lg text-steel-500 hover:bg-white" title="মুছুন / Remove"><XIcon size={14} /></button>
              </div>
            ) : (
              <Button variant="secondary" className="w-full min-h-[44px]" onClick={() => setShowPicker('customer')}>
                <UsersIcon size={16} /> কাস্টমার বাছুন / Select customer
              </Button>
            )}
          </Card>

          <Card className="p-4">
            <h3 className="font-bold text-steel-800 mb-3">পেমেন্ট / Payment</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-steel-500">মোট / Subtotal</span>
                <span className="font-semibold text-steel-800">{formatBDT(subtotal)}</span>
              </div>
              <Field label="ছাড় / Discount (৳)">
                <Input type="number" min="0" step="0.01" inputMode="decimal" value={discount} onChange={(e) => setDiscount(Number(e.target.value || 0))} className="min-h-[44px]" />
              </Field>
              <div className="flex items-center justify-between text-base font-bold border-t border-steel-100 pt-2">
                <span>সর্বমোট / Total</span>
                <span className="text-brand-600">{formatBDT(total)}</span>
              </div>
              <Field label="পরিশোধ / Paid amount (৳)">
                <Input type="number" min="0" step="0.01" inputMode="decimal" value={paid} onChange={(e) => setPaid(Number(e.target.value || 0))} className="min-h-[44px]" />
              </Field>
              <Field label="পেমেন্ট পদ্ধতি / Payment method">
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { k: 'cash',   label: 'নগদ', sub: 'Cash' },
                    { k: 'credit', label: 'বাকি', sub: 'Baki' },
                    { k: 'online', label: 'অনলাইন', sub: 'Online' },
                  ].map((p) => (
                    <button
                      key={p.k}
                      type="button"
                      onClick={() => setPayType(p.k)}
                      className={`min-h-[44px] py-2 rounded-lg text-xs font-semibold border transition ${
                        payType === p.k
                          ? 'bg-brand-500 text-white border-brand-500'
                          : 'bg-white text-steel-600 border-steel-200 hover:bg-steel-50'
                      }`}
                    >
                      <span className="block">{p.label}</span>
                      <span className="block text-[9px] font-normal opacity-80">{p.sub}</span>
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Note (optional)">
                <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Reference / রেফারেন্স" />
              </Field>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-lg bg-red-50 border border-red-100">
                  <p className="text-[10px] uppercase tracking-wide text-red-600 font-semibold">বাকি / Due</p>
                  <p className="text-lg font-bold text-red-700">{formatBDT(due)}</p>
                </div>
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                  <p className="text-[10px] uppercase tracking-wide text-emerald-600 font-semibold">{change > 0 ? 'ফেরত / Change' : 'পরিশোধ / Paid'}</p>
                  <p className="text-lg font-bold text-emerald-700">{formatBDT(change > 0 ? change : paid)}</p>
                </div>
              </div>
              <Button onClick={onCheckout} size="lg" className="w-full min-h-[48px]" disabled={processing || cart.length === 0}>
                <CheckIcon size={18} /> {processing ? 'সংরক্ষণ হচ্ছে… / Saving…' : 'বিক্রয় সম্পন্ন / Complete sale'}
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Mobile-only sticky bottom cart bar.
          Hidden when the cart sheet is open so the bar doesn't double up. */}
      <div
        className={`lg:hidden fixed bottom-[56px] left-0 right-0 z-30 bg-white border-t border-steel-200 shadow-[0_-2px_8px_rgba(0,0,0,0.04)] pb-[env(safe-area-inset-bottom)] ${cartSheetOpen ? 'hidden' : ''}`}
      >
        <button
          type="button"
          onClick={() => setCartSheetOpen(true)}
          className="w-full flex items-center justify-between px-4 py-3 active:bg-steel-50 min-h-[56px]"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <CartIcon size={22} className="text-brand-600" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {cart.length}
                </span>
              )}
            </div>
            <div className="text-left">
              <p className="text-[11px] text-steel-500">{cart.length} টি পণ্য / items</p>
              <p className="text-base font-bold text-steel-800">{formatBDT(total)}</p>
            </div>
          </div>
          <span className="bg-brand-500 text-white px-4 py-2 rounded-lg text-sm font-semibold min-h-[40px] inline-flex items-center">
            অর্ডার দেখুন / View Cart →
          </span>
        </button>
      </div>

      {/* Mobile cart bottom sheet — reuses the existing Modal which slides up
          from the bottom on small screens (`items-end` in ui.jsx). */}
      <Modal open={cartSheetOpen} onClose={() => setCartSheetOpen(false)} title="কার্ট / Cart" size="lg">
        <div className="space-y-3">
          {cart.length === 0 ? (
            <EmptyState icon={<PackageIcon size={28} />} title="কার্ট খালি / Cart is empty" description="পণ্য যোগ করতে নিচে তালিকা থেকে বাছুন।" />
          ) : (
            <>
              <div className="divide-y divide-steel-100 -mx-2">
                {cart.map((it) => (
                  <div key={it.product_id} className="px-2 py-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-steel-800 truncate">{it.name}</p>
                        <p className="text-[11px] text-steel-500">{formatBDT(it.unit_price)} × {formatQty(it.qty, it.unit)}</p>
                      </div>
                      <div className="inline-flex items-center border border-steel-200 rounded-lg overflow-hidden">
                        <button onClick={() => updateQty(it.product_id, -stepFor(it.unit))} className="px-2 py-2 min-h-[40px] min-w-[40px] hover:bg-steel-50"><MinusIcon size={14} /></button>
                        <span className="px-2 text-sm font-semibold">{formatQty(it.qty, it.unit)}</span>
                        <button onClick={() => updateQty(it.product_id, stepFor(it.unit))} className="px-2 py-2 min-h-[40px] min-w-[40px] hover:bg-steel-50"><PlusIcon size={14} /></button>
                      </div>
                      <div className="w-20 text-right font-bold text-sm text-steel-800">{formatBDT(it.qty * it.unit_price)}</div>
                      <button onClick={() => removeFromCart(it.product_id)} className="p-2 text-steel-400 hover:text-red-600"><TrashIcon size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
              {/* Embedded quick-payment + checkout block */}
              <Card className="p-3 bg-steel-50">
                <Field label="ছাড় / Discount (৳)">
                  <Input type="number" min="0" step="0.01" inputMode="decimal" value={discount} onChange={(e) => setDiscount(Number(e.target.value || 0))} className="min-h-[44px]" />
                </Field>
                <Field label="পরিশোধ / Paid amount (৳)" className="mt-2">
                  <Input type="number" min="0" step="0.01" inputMode="decimal" value={paid} onChange={(e) => setPaid(Number(e.target.value || 0))} className="min-h-[44px]" />
                </Field>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {[
                    { k: 'cash', label: 'নগদ / Cash' },
                    { k: 'credit', label: 'বাকি / Baki' },
                    { k: 'online', label: 'অনলাইন / Online' },
                  ].map((p) => (
                    <button
                      key={p.k}
                      type="button"
                      onClick={() => setPayType(p.k)}
                      className={`min-h-[44px] py-2 rounded-lg text-[11px] font-semibold border ${
                        payType === p.k
                          ? 'bg-brand-500 text-white border-brand-500'
                          : 'bg-white text-steel-600 border-steel-200'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-steel-200">
                  <div>
                    <p className="text-[11px] text-steel-500">মোট / Total</p>
                    <p className="text-lg font-bold text-brand-600">{formatBDT(total)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] text-steel-500">{bakiRequired ? 'বাকি / Due' : 'পরিষ্কার / Clear'}</p>
                    <p className={`text-lg font-bold ${bakiRequired ? 'text-red-600' : 'text-emerald-600'}`}>{formatBDT(bakiRequired ? due : paid)}</p>
                  </div>
                </div>
                <Button onClick={onCheckout} size="lg" className="w-full mt-3 min-h-[48px]" disabled={processing}>
                  <CheckIcon size={18} /> {processing ? 'সংরক্ষণ… / Saving…' : 'বিক্রয় সম্পন্ন / Complete sale'}
                </Button>
                {walkIn && bakiRequired && (
                  <p className="mt-2 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2">
                    ⚠️ বাকি বিক্রয়ের জন্য কাস্টমার আবশ্যক। Baki sales require a customer.
                  </p>
                )}
              </Card>
            </>
          )}
        </div>
      </Modal>

      {/* Baki bottom-sheet — only triggered when payType=credit or due > 0.
          Allows picking an existing customer OR quickly creating one (Name +
          Mobile only, no Address/Note) in 2 taps without losing cart items. */}
      <Modal
        open={bakiSheetOpen}
        onClose={() => setBakiSheetOpen(false)}
        title="বাকি কাস্টমার নির্বাচন / Select Customer for Baki"
        size="lg"
        footer={
          <div className="flex flex-wrap justify-end gap-2">
            {(!bakiRequired) && (
              <Button variant="secondary" onClick={() => setBakiSheetOpen(false)}>বাতিল / Cancel</Button>
            )}
            {walkIn && !bakiRequired && (
              <Button variant="secondary" onClick={() => { setPayType('cash'); setPaid(total); setBakiSheetOpen(false) }}>
                নগদ হিসেবে পরিশোধ / Pay as cash
              </Button>
            )}
          </div>
        }
      >
        <BakiCustomerPicker
          customers={customers}
          onPick={(c) => { setCustomer(c); setBakiSheetOpen(false) }}
          onCreate={async (payload) => {
            const newC = await data.insert('customers', { ...payload, balance: 0 })
            setCustomer(newC)
            setBakiSheetOpen(false)
            load()
            return newC
          }}
        />
      </Modal>

      <Modal open={showPicker === 'product'} onClose={() => setShowPicker(null)} title="পণ্য বাছুন / Choose products" size="xl">
        <ProductPicker products={products} categories={categories} onPick={addToCart} />
      </Modal>

      <Modal open={showPicker === 'customer'} onClose={() => setShowPicker(null)} title="কাস্টমার নির্বাচন / Select customer" size="lg">
        <CustomerPicker
          customers={customers}
          onPick={(c) => { setCustomer(c); setShowPicker(null) }}
          onCreate={async (payload) => {
            const newC = await data.insert('customers', { ...payload, balance: 0 })
            setCustomer(newC); setShowPicker(null); load()
            return newC
          }}
        />
      </Modal>

      <Modal
        open={!!receipt}
        onClose={() => { setReceipt(null); resetSale() }}
        title="বিক্রয় সম্পন্ন / Sale complete"
        size="lg"
        footer={
          <div className="flex justify-between gap-2">
            <Button variant="secondary" onClick={() => { setReceipt(null); resetSale() }}>নতুন বিক্রয় / New sale</Button>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => navigate('/sales')}><ReceiptIcon size={16} /> বিক্রয় তালিকা / Sales history</Button>
              <Button onClick={() => window.print()}><PrintIcon size={16} /> রিসিট প্রিন্ট / Print receipt</Button>
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
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="পণ্য খুঁজুন / Search products" className="pl-9 min-h-[44px]" inputMode="search" />
        </div>
        <Select value={cat} onChange={(e) => setCat(e.target.value)}>
          <option value="">সব ক্যাটাগরি / All categories</option>
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
        {filtered.length === 0 && <p className="col-span-full text-center text-sm text-steel-500 py-6">কোনো পণ্য মেলেনি / No products found.</p>}
      </div>
    </div>
  )
}

// CustomerPicker used by the manual "Select customer" button (optional
// attachment). Includes simplified Name+Phone creation form.
function CustomerPicker({ customers, onPick, onCreate }) {
  const [search, setSearch] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '' })
  const phoneValid = !form.phone || PHONE_REGEX.test(form.phone)
  const filtered = customers.filter((c) => c.name?.toLowerCase().includes(search.toLowerCase()) || c.phone?.includes(search))
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div className="relative flex-1">
          <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-steel-400" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="কাস্টমার খুঁজুন / Search customers" className="pl-9 min-h-[44px]" inputMode="search" />
        </div>
        <Button onClick={() => setShowNew(true)}><PlusIcon size={16} /> নতুন / New</Button>
      </div>
      <ul className="space-y-2 max-h-72 overflow-y-auto">
        {filtered.map((c) => (
          <li key={c.id}>
            <button onClick={() => onPick(c)} className="w-full flex items-center gap-3 p-3 rounded-xl border border-steel-100 hover:border-brand-300 hover:bg-brand-50 transition text-left min-h-[56px]">
              <div className="w-10 h-10 rounded-full text-white flex items-center justify-center font-bold" style={{ background: avatarColor(c.name) }}>
                {initials(c.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-steel-800 truncate">{c.name}</p>
                <p className="text-xs text-steel-500 truncate">{c.phone || '—'}</p>
              </div>
              {c.balance > 0 && <Badge color="red">বাকি {formatBDT(c.balance)}</Badge>}
            </button>
          </li>
        ))}
        {filtered.length === 0 && <p className="text-center text-sm text-steel-500 py-6">কোনো কাস্টমার / No customers.</p>}
      </ul>
      {showNew && (
        <Modal
          open={showNew}
          onClose={() => setShowNew(false)}
          title="নতুন কাস্টমার / New customer"
          footer={
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setShowNew(false)}>বাতিল / Cancel</Button>
              <Button
                disabled={!form.name.trim() || !phoneValid}
                onClick={async () => {
                  if (!form.name.trim() || !phoneValid) return
                  await onCreate({ name: form.name.trim(), phone: form.phone.trim() })
                  setShowNew(false); setForm({ name: '', phone: '' })
                }}
              >
                সংরক্ষণ / Save
              </Button>
            </div>
          }
        >
          <div className="space-y-3">
            <Field label="নাম / Name (আবশ্যক / required)">
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus placeholder="যেমন / e.g. Rahim Mia" />
            </Field>
            <Field label="মোবাইল / Phone (ঐচ্ছিক / optional)" hint={!phoneValid ? 'সঠিক ১১ ডিজিটের নম্বর দিন (01XXXXXXXXX)' : '01XXXXXXXXX — বাকি ট্র্যাকিংয়ের জন্য সুপারিশকৃত'}>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 11) })}
                inputMode="numeric"
                maxLength={11}
                placeholder="01XXXXXXXXX"
              />
            </Field>
          </div>
        </Modal>
      )}
    </div>
  )
}

// BakiCustomerPicker — same UX as CustomerPicker but always shows the
// "New customer" expander inline (no second modal) for fast 2-tap creation.
function BakiCustomerPicker({ customers, onPick, onCreate }) {
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({ name: '', phone: '' })
  const [saving, setSaving] = useState(false)
  const phoneValid = !form.phone || PHONE_REGEX.test(form.phone)
  const filtered = customers.filter((c) => c.name?.toLowerCase().includes(search.toLowerCase()) || c.phone?.includes(search))
  const onQuickCreate = async () => {
    if (!form.name.trim() || !phoneValid || !form.phone) return
    setSaving(true)
    try { await onCreate({ name: form.name.trim(), phone: form.phone.trim() }) }
    finally { setSaving(false); setForm({ name: '', phone: '' }) }
  }
  return (
    <div className="space-y-3">
      <div className="relative">
        <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-steel-400" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="কাস্টমার খুঁজুন / Search customers" className="pl-9 min-h-[44px]" inputMode="search" />
      </div>
      <ul className="space-y-2 max-h-60 overflow-y-auto">
        {filtered.map((c) => (
          <li key={c.id}>
            <button onClick={() => onPick(c)} className="w-full flex items-center gap-3 p-3 rounded-xl border border-steel-100 hover:border-brand-300 hover:bg-brand-50 transition text-left min-h-[56px]">
              <div className="w-10 h-10 rounded-full text-white flex items-center justify-center font-bold" style={{ background: avatarColor(c.name) }}>
                {initials(c.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-steel-800 truncate">{c.name}</p>
                <p className="text-xs text-steel-500 truncate">{c.phone || '—'}</p>
              </div>
              {c.balance > 0 && <Badge color="red">বাকি {formatBDT(c.balance)}</Badge>}
            </button>
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="text-center text-sm text-steel-500 py-3">কোনো কাস্টমার মেলেনি / No matching customer — নিচে নতুন তৈরি করুন।</li>
        )}
      </ul>

      <div className="border-t border-steel-100 pt-3">
        <p className="text-xs uppercase tracking-wider text-steel-500 font-semibold mb-2">নতুন কাস্টমার যোগ করুন / Quick add customer</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <Field label="নাম / Name">
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="কাস্টমারের নাম" autoFocus />
          </Field>
          <Field label="মোবাইল / Phone" hint={form.phone && !phoneValid ? 'সঠিক ১১ ডিজিটের নম্বর দিন (01XXXXXXXXX)' : '01XXXXXXXXX'}>
            <Input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 11) })}
              inputMode="numeric"
              maxLength={11}
              placeholder="01XXXXXXXXX"
            />
          </Field>
        </div>
        <Button onClick={onQuickCreate} disabled={saving || !form.name.trim() || !phoneValid || !form.phone} className="mt-2 w-full min-h-[44px]">
          <PlusIcon size={16} /> {saving ? 'যোগ হচ্ছে… / Adding…' : 'যোগ করুন ও বাছুন / Add & select'}
        </Button>
      </div>
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

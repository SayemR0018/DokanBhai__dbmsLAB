import { useEffect, useMemo, useState } from 'react'
import data from '../lib/data'
import { Card, Button, Input, Select, Field, Drawer, Badge, EmptyState, Spinner } from '../components/ui'
import { SearchIcon, FilterIcon, PrintIcon, ReceiptIcon, ChevronRightIcon } from '../components/icons'
import { formatBDT, formatDateTime, initials, avatarColor } from '../lib/format'

export default function SalesScreen() {
  const [transactions, setTransactions] = useState([])
  const [invoices, setInvoices] = useState([])
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterPay, setFilterPay] = useState('')
  const [filterCustomer, setFilterCustomer] = useState('')
  const [filterDate, setFilterDate] = useState('') // 'today' | 'week' | 'month' | ''
  const [detail, setDetail] = useState(null)

  const load = async () => {
    setLoading(true)
    const [t, i, c] = await Promise.all([data.list('transactions'), data.list('invoices'), data.list('customers')])
    setTransactions(t); setInvoices(i); setCustomers(c)
    setLoading(false)
  }
  useEffect(() => {
    load()
    const handler = () => load()
    window.addEventListener('dokanbhai:dbchange', handler)
    return () => window.removeEventListener('dokanbhai:dbchange', handler)
  }, [])

  const salesList = useMemo(() => {
    let list = invoices.length > 0 ? [...invoices] : transactions.filter((t) => t.type === 'sale').map((t) => synthesizeInvoice(t))
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((inv) => {
        const c = customers.find((c) => c.id === inv.customer_id)
        return (inv.invoice_no || '').toLowerCase().includes(q) || c?.name?.toLowerCase().includes(q)
      })
    }
    if (filterPay) list = list.filter((inv) => inv.pay_type === filterPay)
    if (filterCustomer) list = list.filter((inv) => inv.customer_id === filterCustomer)
    if (filterDate) {
      const now = new Date()
      let since = null
      if (filterDate === 'today') { since = new Date(); since.setHours(0, 0, 0, 0) }
      if (filterDate === 'week')  { since = new Date(); since.setDate(since.getDate() - 7) }
      if (filterDate === 'month') { since = new Date(); since.setDate(since.getDate() - 30) }
      list = list.filter((inv) => since ? new Date(inv.date) >= since : true)
    }
    list.sort((a, b) => new Date(b.date) - new Date(a.date))
    return list
  }, [transactions, invoices, customers, search, filterPay, filterCustomer, filterDate])

  const total = useMemo(() => salesList.reduce((s, inv) => s + Number(inv.total || inv.amount || 0), 0), [salesList])
  const totalDue = useMemo(() => salesList.reduce((s, inv) => s + Number(inv.due_amount || 0), 0), [salesList])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-steel-400">বিক্রয় / Sales</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-steel-800">বিক্রয় তালিকা (Sales History)</h1>
          <p className="text-sm text-steel-500 mt-1">{salesList.length} invoices · {formatBDT(total)} total · {formatBDT(totalDue)} due</p>
        </div>
        <Button variant="secondary" onClick={() => window.print()}><PrintIcon size={16} /> Print list</Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative md:col-span-2">
            <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-steel-400" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search invoice or customer…" className="pl-9" />
          </div>
          <Select value={filterCustomer} onChange={(e) => setFilterCustomer(e.target.value)}>
            <option value="">All customers</option>
            {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
          <Select value={filterPay} onChange={(e) => setFilterPay(e.target.value)}>
            <option value="">All payment types</option>
            <option value="cash">Cash</option>
            <option value="credit">Credit</option>
            <option value="online">Online</option>
          </Select>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          {[{ k: '', label: 'All' }, { k: 'today', label: 'Today' }, { k: 'week', label: 'This week' }, { k: 'month', label: 'This month' }].map((opt) => (
            <button
              key={opt.k}
              onClick={() => setFilterDate(opt.k)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                filterDate === opt.k ? 'bg-brand-500 text-white border-brand-500' : 'bg-white text-steel-600 border-steel-200 hover:bg-steel-50'
              }`}
            >{opt.label}</button>
          ))}
        </div>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-steel-400"><Spinner size={28} /></div>
      ) : salesList.length === 0 ? (
        <Card className="p-6">
          <EmptyState icon={<ReceiptIcon size={32} />} title="No invoices found" description="Try changing the filters or create a sale." />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-steel-50">
                <tr className="text-left text-xs uppercase tracking-wide text-steel-500">
                  <th className="px-4 py-3 font-semibold">Invoice</th>
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Pay</th>
                  <th className="px-4 py-3 font-semibold text-right">Total</th>
                  <th className="px-4 py-3 font-semibold text-right">Due</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-steel-100">
                {salesList.map((inv) => {
                  const c = customers.find((c) => c.id === inv.customer_id)
                  return (
                    <tr key={inv.id} className="hover:bg-steel-50/50 cursor-pointer" onClick={() => setDetail({ ...inv, customer: c })}>
                      <td className="px-4 py-3 font-mono text-xs text-steel-700">{inv.invoice_no || `#${inv.id.slice(-6)}`}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full text-white flex items-center justify-center text-xs font-bold" style={{ background: avatarColor(c?.name || '') }}>
                            {initials(c?.name || 'W')}
                          </div>
                          <div>
                            <p className="font-medium text-steel-800">{c?.name || 'Walk-in'}</p>
                            {c?.phone && <p className="text-xs text-steel-500">{c.phone}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-steel-600 text-xs">{formatDateTime(inv.date)}</td>
                      <td className="px-4 py-3">
                        <Badge color={inv.pay_type === 'cash' ? 'green' : inv.pay_type === 'credit' ? 'red' : 'blue'}>{inv.pay_type}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-steel-800">{formatBDT(inv.total || inv.amount)}</td>
                      <td className="px-4 py-3 text-right">
                        {Number(inv.due_amount || 0) > 0 ? (
                          <Badge color="red">{formatBDT(inv.due_amount)}</Badge>
                        ) : (
                          <Badge color="green">Paid</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-steel-400">
                        <ChevronRightIcon size={16} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Drawer
        open={!!detail}
        onClose={() => setDetail(null)}
        title={detail?.invoice_no || 'Invoice'}
        width="max-w-lg"
      >
        {detail && (
          <div className="space-y-4">
            <div className="p-3 bg-steel-50 rounded-lg">
              <p className="text-xs uppercase tracking-wide text-steel-400 font-semibold">Customer</p>
              <div className="flex items-center gap-2.5 mt-1">
                <div className="w-9 h-9 rounded-full text-white flex items-center justify-center text-xs font-bold" style={{ background: avatarColor(detail.customer?.name || '') }}>
                  {initials(detail.customer?.name || 'W')}
                </div>
                <div>
                  <p className="font-semibold text-steel-800">{detail.customer?.name || 'Walk-in'}</p>
                  {detail.customer?.phone && <p className="text-xs text-steel-500">{detail.customer.phone}</p>}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-sm">
              <div><p className="text-xs text-steel-400">Date</p><p className="font-semibold">{formatDateTime(detail.date)}</p></div>
              <div><p className="text-xs text-steel-400">Payment</p><Badge color={detail.pay_type === 'cash' ? 'green' : detail.pay_type === 'credit' ? 'red' : 'blue'}>{detail.pay_type}</Badge></div>
              <div><p className="text-xs text-steel-400">Items</p><p className="font-semibold">{detail.items?.length || 1}</p></div>
            </div>

            {detail.items && detail.items.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-wide text-steel-400 font-semibold mb-2">Items</p>
                <ul className="space-y-1.5">
                  {detail.items.map((it, i) => (
                    <li key={i} className="flex items-center justify-between text-sm p-2.5 bg-steel-50 rounded-lg">
                      <div>
                        <p className="font-medium text-steel-800">{it.name}</p>
                        <p className="text-xs text-steel-500">{it.qty} × {formatBDT(it.unit_price)}</p>
                      </div>
                      <span className="font-bold">{formatBDT(it.amount)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="space-y-1.5 text-sm border-t border-steel-100 pt-3">
              <div className="flex justify-between"><span>Subtotal</span><span className="font-semibold">{formatBDT(detail.subtotal || detail.amount)}</span></div>
              {Number(detail.discount || 0) > 0 && <div className="flex justify-between"><span>Discount</span><span>-{formatBDT(detail.discount)}</span></div>}
              <div className="flex justify-between font-bold text-base"><span>Total</span><span>{formatBDT(detail.total || detail.amount)}</span></div>
              <div className="flex justify-between"><span>Paid</span><span className="text-emerald-600">{formatBDT(detail.paid_amount || 0)}</span></div>
              {Number(detail.due_amount || 0) > 0 && <div className="flex justify-between text-red-600 font-semibold"><span>Due</span><span>{formatBDT(detail.due_amount)}</span></div>}
            </div>

            {detail.note && (
              <div>
                <p className="text-xs uppercase tracking-wide text-steel-400 font-semibold">Note</p>
                <p className="text-sm text-steel-700">{detail.note}</p>
              </div>
            )}

            <Button onClick={() => window.print()} className="w-full" variant="secondary"><PrintIcon size={16} /> Print receipt</Button>
          </div>
        )}
      </Drawer>
    </div>
  )
}

function synthesizeInvoice(t) {
  return {
    id: t.id,
    invoice_no: 'TX-' + t.id.slice(-6).toUpperCase(),
    customer_id: t.customer_id,
    items: [{ name: t.product_name || 'Item', qty: t.qty, unit_price: t.unit_price, amount: t.amount }],
    subtotal: t.amount,
    discount: t.discount || 0,
    total: Math.max(0, t.amount - (t.discount || 0)),
    paid_amount: t.paid_amount || 0,
    due_amount: Math.max(0, t.amount - (t.paid_amount || 0) - (t.discount || 0)),
    pay_type: t.pay_type || 'cash',
    note: t.note || '',
    date: t.date,
  }
}
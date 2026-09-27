import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import data from '../lib/data'
import { formatBDT, formatDate, daysAgo, initials, avatarColor } from '../lib/format'
import { Card, Badge, EmptyState, Spinner } from '../components/ui'
import {
  CartIcon, PackageIcon, ChevronRightIcon,
} from '../components/icons'

function useDashboardData() {
  const [state, setState] = useState({ loading: true, transactions: [], products: [], customers: [], categories: [], vendors: [], invoices: [], businesses: [] })

  const reload = async () => {
    setState((s) => ({ ...s, loading: true }))
    try {
      const [transactions, products, customers, categories, vendors, invoices, businesses] = await Promise.all([
        data.list('transactions'),
        data.list('products'),
        data.list('customers'),
        data.list('categories'),
        data.list('vendors'),
        data.list('invoices'),
        data.list('businesses'),
      ])
      setState({ loading: false, transactions, products, customers, categories, vendors, invoices, businesses })
    } catch (err) {
      console.error('[dashboard] load failed:', err)
      setState((s) => ({ ...s, loading: false }))
    }
  }

  useEffect(() => {
    reload()
    const handler = () => reload()
    window.addEventListener('dokanbhai:dbchange', handler)
    return () => window.removeEventListener('dokanbhai:dbchange', handler)
  }, [])

  return { ...state, reload }
}

export default function DashboardScreen() {
  const { loading, transactions, products, customers, invoices, businesses } = useDashboardData()

  const stats = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const weekAgo = new Date(today); weekAgo.setDate(weekAgo.getDate() - 7)
    const monthAgo = new Date(today); monthAgo.setDate(monthAgo.getDate() - 30)

    const sales = transactions.filter((t) => t.type === 'sale')
    const todaySales = sales.filter((t) => new Date(t.date) >= today)
    const weekSales = sales.filter((t) => new Date(t.date) >= weekAgo)
    const monthSales = sales.filter((t) => new Date(t.date) >= monthAgo)

    const totalSales = monthSales.reduce((s, t) => s + Number(t.amount || 0), 0)
    const totalCash = monthSales.filter((t) => t.pay_type === 'cash').reduce((s, t) => s + Number(t.paid_amount || 0), 0)
    const totalDue = customers.reduce((s, c) => s + Number(c.balance || 0), 0)
    const lowStock = products.filter((p) => Number(p.stock || 0) <= Number(p.min_stock || 0))
    return { totalSales, totalCash, totalDue, lowStock, todayCount: todaySales.length, weekCount: weekSales.length, monthCount: monthSales.length }
  }, [transactions, products, customers])

  const trend = useMemo(() => {
    // Last 7 days trend
    const days = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - i)
      days.push({ label: d.toLocaleDateString('en-IN', { weekday: 'short' }), value: 0, key: d.toDateString() })
    }
    transactions.filter((t) => t.type === 'sale').forEach((t) => {
      const d = new Date(t.date); d.setHours(0, 0, 0, 0)
      const key = d.toDateString()
      const slot = days.find((x) => x.key === key)
      if (slot) slot.value += Number(t.amount || 0)
    })
    const max = Math.max(1, ...days.map((d) => d.value))
    return { days, max }
  }, [transactions])

  const recentSales = useMemo(() => {
    return [...transactions]
      .filter((t) => t.type === 'sale')
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 6)
  }, [transactions])

  const bizName = businesses?.[0]?.name || 'DokanBhai'

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-steel-400"><Spinner size={28} /></div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1>আজকের খাতা</h1>
          <p className="text-sm text-[#526176] mt-1">{bizName}</p>
        </div>
        <Link to="/pos" className="inline-flex min-h-[48px] items-center gap-2 rounded-2xl bg-[#006b4f] px-4 text-sm font-semibold text-white">
          <CartIcon size={18} /> বিক্রি
        </Link>
      </div>

      <section className="rounded-3xl bg-[#062035] text-white p-5">
        <p className="text-sm text-[#8bc6b4]">গত ৩০ দিনের বিক্রি</p>
        <p className="mt-1 text-4xl font-bold tracking-tight">{formatBDT(stats.totalSales)}</p>
        <p className="mt-1 text-sm text-white/70">{stats.monthCount} বিক্রি · আজ {stats.todayCount}</p>
        <div className="mt-5 grid grid-cols-3 gap-2 border-t border-white/10 pt-4 text-sm">
          <Link to="/sales" className="min-h-[44px]">
            <span className="block text-[#8bc6b4]">নগদ</span>
            <span className="font-bold">{formatBDT(stats.totalCash)}</span>
          </Link>
          <Link to="/hisab" className="min-h-[44px]">
            <span className="block text-[#ffd29a]">বাকি</span>
            <span className="font-bold">{formatBDT(stats.totalDue)}</span>
          </Link>
          <Link to="/inventory" className="min-h-[44px]">
            <span className="block text-white/60">কম স্টক</span>
            <span className="font-bold">{stats.lowStock.length}</span>
          </Link>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Sales trend chart */}
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-steel-800">বিক্রয় ট্রেন্ড (Sales Trend)</h3>
              <p className="text-xs text-steel-500">Last 7 days · {formatBDT(trend.days.reduce((s, d) => s + d.value, 0))} total</p>
            </div>
            <Badge color="green">+{stats.todayCount} today</Badge>
          </div>
          <div className="h-48 flex items-end justify-between gap-2">
            {trend.days.map((d, i) => {
              const h = Math.max(4, (d.value / trend.max) * 100)
              return (
                <div key={i} className="flex-1 flex flex-col items-center justify-end gap-2">
                  <span className="text-[10px] text-steel-500 font-semibold">{d.value > 0 ? formatBDT(d.value) : ''}</span>
                  <div className="w-full bg-gradient-to-t from-brand-300 to-brand-500 rounded-t-md transition-all" style={{ height: `${h}%` }} />
                  <span className="text-xs text-steel-500 font-semibold">{d.label}</span>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Low stock alerts */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-steel-800">লো-স্টক অ্যালার্ট</h3>
            <Link to="/inventory" className="text-xs text-brand-600 font-semibold inline-flex items-center gap-1">সব দেখুন / View all <ChevronRightIcon size={14} /></Link>
          </div>
          {stats.lowStock.length === 0 ? (
            <EmptyState icon={<PackageIcon size={28} />} title="All stocked!" description="No products are below their minimum threshold." />
          ) : (
            <ul className="space-y-2">
              {stats.lowStock.slice(0, 6).map((p) => (
                <li key={p.id} className="flex items-center justify-between p-2.5 rounded-lg bg-red-50 border border-red-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold">
                      {initials(p.name)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-steel-800">{p.name}</p>
                      <p className="text-xs text-steel-500">Min: {p.min_stock} {p.unit}</p>
                    </div>
                  </div>
                  <Badge color="red">{p.stock} left</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Recent sales */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-steel-800">সাম্প্রতিক বিক্রয় (Recent Sales)</h3>
          <Link to="/sales" className="text-xs text-brand-600 font-semibold inline-flex items-center gap-1">সব বিক্রয় / All sales <ChevronRightIcon size={14} /></Link>
        </div>
        {recentSales.length === 0 ? (
          <EmptyState icon={<CartIcon size={28} />} title="No sales yet" description="Create your first sale from the POS screen." />
        ) : (
          <div className="overflow-x-auto -mx-2">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-steel-400 border-b border-steel-100">
                  <th className="px-2 py-2 font-semibold">কাস্টমার</th>
                  <th className="px-2 py-2 font-semibold">পণ্য</th>
                  <th className="px-2 py-2 font-semibold">Qty</th>
                  <th className="px-2 py-2 font-semibold text-right">Amount</th>
                  <th className="px-2 py-2 font-semibold">Type</th>
                  <th className="px-2 py-2 font-semibold">When</th>
                </tr>
              </thead>
              <tbody>
                {recentSales.map((t) => {
                  const c = customers.find((c) => c.id === t.customer_id)
                  return (
                    <tr key={t.id} className="border-b border-steel-50 hover:bg-steel-50/50">
                      <td className="px-2 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full text-white flex items-center justify-center text-xs font-bold" style={{ background: avatarColor(c?.name || '') }}>
                            {initials(c?.name || 'W')}
                          </div>
                          <span className="font-medium text-steel-800">{c?.name || '—'}</span>
                        </div>
                      </td>
                      <td className="px-2 py-2.5 text-steel-700">{t.product_name || '—'}</td>
                      <td className="px-2 py-2.5 text-steel-700">{t.qty}</td>
                      <td className="px-2 py-2.5 text-right font-semibold text-steel-800">{formatBDT(t.amount)}</td>
                      <td className="px-2 py-2.5">
                        <Badge color={t.pay_type === 'cash' ? 'green' : t.pay_type === 'credit' ? 'red' : 'blue'}>{t.pay_type}</Badge>
                      </td>
                      <td className="px-2 py-2.5 text-steel-500 text-xs">{daysAgo(t.date)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
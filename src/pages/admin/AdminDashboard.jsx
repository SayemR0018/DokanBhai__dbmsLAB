import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { loadAdminOverview } from '../../lib/adminApi'
import { formatBDT, formatDateTime } from '../../lib/format'

const quickLinks = [
  { title: 'দোকান ব্যবস্থাপনা', description: 'নিবন্ধিত দোকানগুলো দেখুন।', path: '/admin/shops' },
  { title: 'পণ্য ব্যবস্থাপনা', description: 'প্রতিটি দোকানের স্টক দেখুন।', path: '/admin/products' },
  { title: 'রিপোর্ট ও বিশ্লেষণ', description: 'বিক্রয়ের সারসংক্ষেপ দেখুন।', path: '/admin/reports' },
]

export default function AdminDashboard() {
  const [overview, setOverview] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    loadAdminOverview()
      .then((data) => { if (!cancelled) setOverview(data || {}) })
      .catch((err) => { if (!cancelled) setError(err?.message || 'অ্যাডমিন ডেটা লোড হয়নি') })
    return () => { cancelled = true }
  }, [])

  const stats = [
    { title: 'মোট দোকান', value: overview ? String(overview.shops ?? 0) : '…', description: 'নিবন্ধিত ব্যবসা' },
    { title: 'মোট পণ্য', value: overview ? String(overview.products ?? 0) : '…', description: 'দোকানের নিজস্ব পণ্য' },
    { title: 'মোট কাস্টমার', value: overview ? String(overview.customers ?? 0) : '…', description: 'দোকানের কাস্টমার' },
    { title: 'মোট বিক্রয়', value: overview ? formatBDT(overview.sales_total || 0) : '…', description: 'সর্বমোট বিক্রয়' },
  ]

  const recent = Array.isArray(overview?.recent) ? overview.recent : []

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="mb-8 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-7 text-white shadow-xl">
        <p className="mb-2 text-sm font-medium text-blue-100">দোকানভাই অ্যাডমিন প্যানেল</p>
        <h1 className="text-3xl font-bold md:text-4xl">অ্যাডমিন ড্যাশবোর্ড</h1>
        <p className="mt-2 text-blue-100">লাইভ দোকান, স্টক ও বিক্রয়।</p>
      </div>

      {error && <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.title} className="rounded-2xl bg-white p-6 shadow-md">
            <p className="text-sm font-medium text-slate-500">{stat.title}</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-800">{stat.value}</h2>
            <p className="mt-1 text-sm text-slate-400">{stat.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-md">
          <h2 className="text-lg font-semibold text-slate-800">প্ল্যাটফর্মের সারসংক্ষেপ</h2>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between rounded-xl bg-emerald-50 px-4 py-3"><span>দোকান</span><b>{overview?.shops ?? '…'}</b></div>
            <div className="flex justify-between rounded-xl bg-red-50 px-4 py-3"><span>কম স্টক</span><b>{overview?.low_stock ?? '…'}</b></div>
            <div className="flex justify-between rounded-xl bg-amber-50 px-4 py-3"><span>ইনভয়েস</span><b>{overview?.invoices ?? '…'}</b></div>
          </div>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-md">
          <h2 className="text-lg font-semibold text-slate-800">সাম্প্রতিক বিক্রয়</h2>
          <div className="mt-4 space-y-3">
            {recent.length === 0 && <p className="text-sm text-slate-400">এখনো কোনো বিক্রয় নেই।</p>}
            {recent.map((row) => (
              <div key={row.invoice_no + row.date} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm">
                <div>
                  <p className="font-semibold text-slate-800">{row.shop || 'দোকান'}</p>
                  <p className="text-slate-400">{row.invoice_no} · {formatDateTime(row.date)}</p>
                </div>
                <p className="font-bold text-slate-800">{formatBDT(row.total)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-slate-800">দ্রুত প্রবেশ</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          {quickLinks.map((link) => (
            <Link key={link.path} to={link.path} className="rounded-2xl bg-white p-5 shadow-md hover:shadow-lg">
              <h3 className="font-semibold text-slate-800">{link.title}</h3>
              <p className="mt-1 text-sm text-slate-500">{link.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { loadAdminOverview } from '../../lib/adminApi'
import { formatBDT } from '../../lib/format'

const TYPE_LABEL = {
  mudi: 'মুদি দোকান',
  electronics: 'ইলেকট্রনিক্স',
  hardware: 'হার্ডওয়্যার',
  general: 'সাধারণ রিটেইল',
}

export default function AdminReports() {
  const [overview, setOverview] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    loadAdminOverview()
      .then((data) => { if (!cancelled) setOverview(data || {}) })
      .catch((err) => { if (!cancelled) setError(err?.message || 'রিপোর্ট লোড হয়নি') })
    return () => { cancelled = true }
  }, [])

  const types = Array.isArray(overview?.by_type) ? overview.by_type : []
  const maxSales = Math.max(1, ...types.map((row) => Number(row.sales || 0)))
  const invoiceCount = Number(overview?.invoices || 0)
  const average = invoiceCount ? Number(overview.sales_total || 0) / invoiceCount : 0

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">রিপোর্ট ও বিশ্লেষণ</h1>
        <p className="mt-2 text-slate-500">লাইভ ইনভয়েস থেকে হিসাব।</p>
      </div>
      {error && <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">আজকের বিক্রয়</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-800">{overview ? formatBDT(overview.sales_today || 0) : '…'}</h2>
        </div>
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">এই মাসের বিক্রয়</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-800">{overview ? formatBDT(overview.sales_month || 0) : '…'}</h2>
        </div>
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">গড় ইনভয়েস</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-800">{overview ? formatBDT(average) : '…'}</h2>
        </div>
      </div>
      <div className="mt-8 rounded-xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-800">ব্যবসার ধরন অনুযায়ী বিক্রয়</h2>
        <div className="mt-6 space-y-5">
          {types.length === 0 && <p className="text-sm text-slate-400">এখনো ভাগ করার মতো বিক্রয় নেই।</p>}
          {types.map((row) => {
            const width = Math.round((Number(row.sales || 0) / maxSales) * 100)
            return (
              <div key={row.type}>
                <div className="mb-2 flex justify-between text-sm">
                  <span>{TYPE_LABEL[row.type] || row.type} · {row.shops} দোকান</span>
                  <span>{formatBDT(row.sales)}</span>
                </div>
                <div className="h-3 rounded-full bg-slate-100">
                  <div className="h-3 rounded-full bg-blue-500" style={{ width: `${width}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

import { useEffect, useMemo, useState } from 'react'
import { loadAdminShops } from '../../lib/adminApi'
import { formatDate } from '../../lib/format'

const TYPE_LABEL = {
  mudi: 'মুদি',
  electronics: 'ইলেকট্রনিক্স',
  hardware: 'হার্ডওয়্যার',
  general: 'রিটেইল',
}

export default function AdminShops() {
  const [shops, setShops] = useState([])
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    loadAdminShops()
      .then((rows) => { if (!cancelled) setShops(Array.isArray(rows) ? rows : []) })
      .catch((err) => { if (!cancelled) setError(err?.message || 'দোকান লোড হয়নি') })
    return () => { cancelled = true }
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return shops
    return shops.filter((shop) => `${shop.name} ${shop.owner} ${shop.phone} ${shop.type}`.toLowerCase().includes(q))
  }, [shops, search])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="mb-6 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white shadow-lg">
        <h1 className="text-3xl font-bold">দোকান ব্যবস্থাপনা</h1>
        <p className="mt-2 text-blue-100">{shops.length} নিবন্ধিত দোকান</p>
      </div>
      {error && <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="দোকান, মালিক অথবা ফোন খুঁজুন..."
          className="mb-6 w-full rounded-lg border border-slate-200 px-4 py-3 outline-none"
        />
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b text-slate-500">
                <th className="px-3 py-3">দোকান</th>
                <th className="px-3 py-3">মালিক</th>
                <th className="px-3 py-3">ফোন</th>
                <th className="px-3 py-3">ধরন</th>
                <th className="px-3 py-3">এলাকা</th>
                <th className="px-3 py-3">তারিখ</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((shop) => (
                <tr key={shop.id} className="border-b border-slate-100">
                  <td className="px-3 py-3 font-semibold text-slate-800">{shop.name}</td>
                  <td className="px-3 py-3">{shop.owner}</td>
                  <td className="px-3 py-3 font-mono">{shop.phone}</td>
                  <td className="px-3 py-3">{TYPE_LABEL[shop.type] || shop.type}</td>
                  <td className="px-3 py-3">{shop.address || '—'}</td>
                  <td className="px-3 py-3">{formatDate(shop.created_at)}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-3 py-8 text-center text-slate-400">কোনো দোকান পাওয়া যায়নি।</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

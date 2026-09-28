import { useEffect, useMemo, useState } from 'react'
import { loadAdminProducts } from '../../lib/adminApi'
import { formatBDT } from '../../lib/format'

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    loadAdminProducts()
      .then((rows) => { if (!cancelled) setProducts(Array.isArray(rows) ? rows : []) })
      .catch((err) => { if (!cancelled) setError(err?.message || 'পণ্য লোড হয়নি') })
    return () => { cancelled = true }
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return products
    return products.filter((product) => `${product.name} ${product.shop} ${product.category}`.toLowerCase().includes(q))
  }, [products, search])

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800">পণ্য ব্যবস্থাপনা</h1>
        <p className="mt-2 text-slate-500">{products.length} পণ্য, যে দোকানের সেই দোকানের স্টক।</p>
      </div>
      {error && <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="পণ্য অথবা দোকান খুঁজুন..."
          className="mb-6 w-full rounded-lg border border-slate-200 px-4 py-3 outline-none"
        />
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b text-slate-500">
                <th className="px-4 py-3">পণ্য</th>
                <th className="px-4 py-3">দোকান</th>
                <th className="px-4 py-3">ক্যাটাগরি</th>
                <th className="px-4 py-3">স্টক</th>
                <th className="px-4 py-3">মূল্য</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => (
                <tr key={product.id} className="border-b border-slate-100">
                  <td className="px-4 py-3 font-semibold text-slate-800">{product.name}</td>
                  <td className="px-4 py-3">{product.shop}</td>
                  <td className="px-4 py-3">{product.category || '—'}</td>
                  <td className="px-4 py-3">{Number(product.stock || 0)}</td>
                  <td className="px-4 py-3">{formatBDT(product.price)}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">কোনো পণ্য নেই।</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

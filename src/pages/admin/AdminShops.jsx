import React, { useState } from 'react'

const shops = [
  {
    id: 1,
    name: 'Rahman Store',
    owner: 'Rahman',
    phone: '017XXXXXXXX',
    type: 'Grocery',
    status: 'Active',
  },
  {
    id: 2,
    name: 'Nila Fashion',
    owner: 'Nila',
    phone: '018XXXXXXXX',
    type: 'Fashion',
    status: 'Active',
  },
  {
    id: 3,
    name: 'City Pharmacy',
    owner: 'Karim',
    phone: '019XXXXXXXX',
    type: 'Pharmacy',
    status: 'Inactive',
  },
]

const retailers = [
  {
    id: 1,
    name: 'Hasan',
    phone: '016XXXXXXXX',
  },
  {
    id: 2,
    name: 'Sakib',
    phone: '015XXXXXXXX',
  },
  {
    id: 3,
    name: 'Mim',
    phone: '013XXXXXXXX',
  },
]

export default function AdminShops() {
  const [search, setSearch] = useState('')
  const [selectedShop, setSelectedShop] = useState(null)
  const [selectedRetailer, setSelectedRetailer] = useState('')
  const [assignments, setAssignments] = useState({})

  const filteredShops = shops.filter((shop) =>
    `${shop.name} ${shop.owner} ${shop.type}`
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  const handleAssignRetailer = () => {
    if (!selectedShop || !selectedRetailer) return

    setAssignments((prev) => ({
      ...prev,
      [selectedShop.id]: selectedRetailer,
    }))

    setSelectedShop(null)
    setSelectedRetailer('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">

      {/* Header */}
      <div className="mb-6 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white shadow-lg">

        <h1 className="text-3xl font-bold">
          Shop Management
        </h1>

        <p className="mt-2 text-blue-100">
          View and manage registered businesses and retailers.
        </p>

      </div>

      {/* Main Card */}
      <div className="rounded-2xl bg-white p-6 shadow-lg">

        {/* Search */}
        <div className="mb-6">

          <div className="relative">

            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">
              🔍
            </span>

            <input
              type="text"
              placeholder="Search shop, owner or business type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-blue-100 bg-blue-50/50 py-3 pl-11 pr-4 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />

          </div>

        </div>

        {/* Table */}
        <div className="overflow-x-auto">

          <table className="w-full text-left">

            <thead>

              <tr className="bg-gradient-to-r from-blue-50 to-purple-50 text-sm text-slate-600">

                <th className="rounded-l-lg px-4 py-4">
                  Shop
                </th>

                <th className="px-4 py-4">
                  Owner
                </th>

                <th className="px-4 py-4">
                  Phone
                </th>

                <th className="px-4 py-4">
                  Type
                </th>

                <th className="px-4 py-4">
                  Retailer
                </th>

                <th className="px-4 py-4">
                  Status
                </th>

                <th className="rounded-r-lg px-4 py-4">
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              {filteredShops.map((shop) => {

                const retailer = retailers.find(
                  (r) => r.id === Number(assignments[shop.id])
                )

                return (

                  <tr
                    key={shop.id}
                    className="border-b border-slate-100 transition hover:bg-blue-50/40"
                  >

                    {/* Shop */}
                    <td className="px-4 py-5">

                      <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 font-bold text-white shadow-sm">
                          {shop.name.charAt(0)}
                        </div>

                        <span className="font-semibold text-slate-800">
                          {shop.name}
                        </span>

                      </div>

                    </td>

                    {/* Owner */}
                    <td className="px-4 py-5 text-slate-600">
                      {shop.owner}
                    </td>

                    {/* Phone */}
                    <td className="px-4 py-5 text-slate-600">
                      {shop.phone}
                    </td>

                    {/* Type */}
                    <td className="px-4 py-5">

                      <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
                        {shop.type}
                      </span>

                    </td>

                    {/* Retailer */}
                    <td className="px-4 py-5">

                      {retailer ? (

                        <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2">

                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white">
                            {retailer.name.charAt(0)}
                          </div>

                          <div>

                            <p className="font-semibold text-emerald-700">
                              {retailer.name}
                            </p>

                            <p className="text-xs text-emerald-600">
                              {retailer.phone}
                            </p>

                          </div>

                        </div>

                      ) : (

                        <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                          Not Assigned
                        </span>

                      )}

                    </td>

                    {/* Status */}
                    <td className="px-4 py-5">

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          shop.status === 'Active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {shop.status === 'Active' ? '● ' : '● '}
                        {shop.status}
                      </span>

                    </td>

                    {/* Action */}
                    <td className="px-4 py-5">

                      <button
                        onClick={() => {
                          setSelectedShop(shop)
                          setSelectedRetailer(
                            assignments[shop.id] || ''
                          )
                        }}
                        className={`rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                          retailer
                            ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600'
                            : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600'
                        }`}
                      >
                        {retailer ? 'Change Retailer' : 'Assign Retailer'}
                      </button>

                    </td>

                  </tr>

                )
              })}

            </tbody>

          </table>

        </div>

        {/* No Results */}
        {filteredShops.length === 0 && (

          <div className="py-12 text-center">

            <div className="text-4xl">
              🔍
            </div>

            <p className="mt-3 font-medium text-slate-600">
              No shops found
            </p>

            <p className="mt-1 text-sm text-slate-400">
              Try a different search term.
            </p>

          </div>

        )}

      </div>

      {/* Assign Retailer Modal */}
      {selectedShop && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">

          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">

            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">

              <div className="flex items-center gap-3">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 text-xl">
                  👤
                </div>

                <div>

                  <h2 className="text-xl font-bold">
                    {assignments[selectedShop.id]
                      ? 'Change Retailer'
                      : 'Assign Retailer'}
                  </h2>

                  <p className="mt-1 text-sm text-blue-100">
                    {selectedShop.name}
                  </p>

                </div>

              </div>

            </div>

            {/* Modal Body */}
            <div className="p-6">

              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Select Retailer
              </label>

              <select
                value={selectedRetailer}
                onChange={(e) => setSelectedRetailer(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
              >

                <option value="">
                  Choose a retailer
                </option>

                {retailers.map((retailer) => (

                  <option
                    key={retailer.id}
                    value={retailer.id}
                  >
                    {retailer.name} - {retailer.phone}
                  </option>

                ))}

              </select>

              {/* Selected Retailer Preview */}
              {selectedRetailer && (

                <div className="mt-4 rounded-xl bg-blue-50 p-4">

                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-500">
                    Selected Retailer
                  </p>

                  <p className="mt-1 font-semibold text-blue-800">
                    {
                      retailers.find(
                        (r) =>
                          r.id === Number(selectedRetailer)
                      )?.name
                    }
                  </p>

                </div>

              )}

              {/* Buttons */}
              <div className="mt-6 flex justify-end gap-3">

                <button
                  onClick={() => {
                    setSelectedShop(null)
                    setSelectedRetailer('')
                  }}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  onClick={handleAssignRetailer}
                  disabled={!selectedRetailer}
                  className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-blue-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {assignments[selectedShop.id]
                    ? 'Update Retailer'
                    : 'Assign Retailer'}
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  )
}
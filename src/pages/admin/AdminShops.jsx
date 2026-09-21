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

export default function AdminShops() {
  const [search, setSearch] = useState('')

  const filteredShops = shops.filter((shop) =>
    `${shop.name} ${shop.owner} ${shop.type}`
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-slate-50 p-6">

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800">
          Shop Management
        </h1>

        <p className="mt-2 text-slate-500">
          View and manage registered businesses.
        </p>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm">

        <input
          type="text"
          placeholder="Search shop, owner or business type..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-6 w-full rounded-lg border border-slate-200 px-4 py-3 outline-none focus:border-slate-400"
        />

        <div className="overflow-x-auto">

          <table className="w-full text-left">

            <thead>
              <tr className="border-b text-sm text-slate-500">
                <th className="px-4 py-3">Shop</th>
                <th className="px-4 py-3">Owner</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>

            <tbody>

              {filteredShops.map((shop) => (

                <tr
                  key={shop.id}
                  className="border-b last:border-0"
                >

                  <td className="px-4 py-4 font-medium text-slate-800">
                    {shop.name}
                  </td>

                  <td className="px-4 py-4 text-slate-600">
                    {shop.owner}
                  </td>

                  <td className="px-4 py-4 text-slate-600">
                    {shop.phone}
                  </td>

                  <td className="px-4 py-4 text-slate-600">
                    {shop.type}
                  </td>

                  <td className="px-4 py-4">

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        shop.status === 'Active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {shop.status}
                    </span>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  )
}
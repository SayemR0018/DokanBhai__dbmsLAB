import React, { useState } from 'react'

const products = [
  {
    id: 1,
    name: 'চাল ৫ কেজি',
    shop: 'রহমান স্টোর',
    category: 'মুদি',
    stock: 25,
    price: 450,
  },
  {
    id: 2,
    name: 'রান্নার তেল',
    shop: 'রহমান স্টোর',
    category: 'মুদি',
    stock: 8,
    price: 180,
  },
  {
    id: 3,
    name: 'টি-শার্ট',
    shop: 'নীলা ফ্যাশন',
    category: 'ফ্যাশন',
    stock: 35,
    price: 650,
  },
]

export default function AdminProducts() {
  const [search, setSearch] = useState('')

  const filteredProducts = products.filter((product) =>
    `${product.name} ${product.shop} ${product.category}`
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-slate-50 p-6">

      <div className="mb-6">

        <h1 className="text-3xl font-bold text-slate-800">
          পণ্য ব্যবস্থাপনা
        </h1>

        <p className="mt-2 text-slate-500">
          বিভিন্ন দোকানের পণ্য ও স্টকের তথ্য পর্যবেক্ষণ করুন।
        </p>

      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm">

        <input
          type="text"
          placeholder="পণ্য অথবা দোকান খুঁজুন..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-6 w-full rounded-lg border border-slate-200 px-4 py-3 outline-none"
        />

        <div className="overflow-x-auto">

          <table className="w-full text-left">

            <thead>
              <tr className="border-b text-sm text-slate-500">
                <th className="px-4 py-3">পণ্য</th>
                <th className="px-4 py-3">দোকান</th>
                <th className="px-4 py-3">ক্যাটাগরি</th>
                <th className="px-4 py-3">স্টক</th>
                <th className="px-4 py-3">মূল্য</th>
              </tr>
            </thead>

            <tbody>

              {filteredProducts.map((product) => (

                <tr
                  key={product.id}
                  className="border-b last:border-0"
                >

                  <td className="px-4 py-4 font-medium text-slate-800">
                    {product.name}
                  </td>

                  <td className="px-4 py-4 text-slate-600">
                    {product.shop}
                  </td>

                  <td className="px-4 py-4 text-slate-600">
                    {product.category}
                  </td>

                  <td className="px-4 py-4">

                    <span
                      className={
                        product.stock < 10
                          ? 'font-semibold text-red-600'
                          : 'font-semibold text-green-600'
                      }
                    >
                      {product.stock}
                    </span>

                  </td>

                  <td className="px-4 py-4 text-slate-600">
                    ৳{product.price}
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
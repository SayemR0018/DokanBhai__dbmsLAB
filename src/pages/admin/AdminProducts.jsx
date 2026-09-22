import React, { useState } from 'react'

const products = [
  {
    id: 1,
    name: 'Rice 5kg',
    shop: 'Rahman Store',
    category: 'Grocery',
    stock: 25,
    price: 450,
  },
  {
    id: 2,
    name: 'Cooking Oil',
    shop: 'Rahman Store',
    category: 'Grocery',
    stock: 8,
    price: 180,
  },
  {
    id: 3,
    name: 'T-Shirt',
    shop: 'Nila Fashion',
    category: 'Fashion',
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
          Product Management
        </h1>

        <p className="mt-2 text-slate-500">
          Monitor products and inventory across shops.
        </p>

      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm">

        <input
          type="text"
          placeholder="Search product or shop..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-6 w-full rounded-lg border border-slate-200 px-4 py-3 outline-none"
        />

        <div className="overflow-x-auto">

          <table className="w-full text-left">

            <thead>
              <tr className="border-b text-sm text-slate-500">
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Shop</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Price</th>
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
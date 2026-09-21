import React from 'react'
import { Link } from 'react-router-dom'

const stats = [
  {
    title: 'Total Shops',
    value: '12',
    description: 'Registered businesses',
  },
  {
    title: 'Total Products',
    value: '248',
    description: 'Products in system',
  },
  {
    title: 'Total Customers',
    value: '186',
    description: 'Registered customers',
  },
  {
    title: 'Total Sales',
    value: '৳45,850',
    description: 'Overall sales',
  },
]

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-slate-50 p-6">

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">
          Admin Dashboard
        </h1>

        <p className="mt-2 text-slate-500">
          Monitor and manage the DokanBhai platform.
        </p>
      </div>

      {/* Statistics */}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

        {stats.map((stat) => (
          <div
            key={stat.title}
            className="rounded-xl bg-white p-6 shadow-sm border border-slate-100"
          >
            <p className="text-sm font-medium text-slate-500">
              {stat.title}
            </p>

            <h2 className="mt-3 text-3xl font-bold text-slate-800">
              {stat.value}
            </h2>

            <p className="mt-2 text-xs text-slate-400">
              {stat.description}
            </p>
          </div>
        ))}

      </div>

      {/* Overview */}

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">

        <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-100">

          <h2 className="text-xl font-semibold text-slate-800">
            Platform Overview
          </h2>

          <div className="mt-6 space-y-4">

            <div className="flex justify-between border-b pb-3">
              <span className="text-slate-500">
                Active Shops
              </span>

              <span className="font-semibold text-slate-800">
                10
              </span>
            </div>

            <div className="flex justify-between border-b pb-3">
              <span className="text-slate-500">
                Low Stock Products
              </span>

              <span className="font-semibold text-red-500">
                8
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">
                Pending Activities
              </span>

              <span className="font-semibold text-amber-500">
                5
              </span>
            </div>

          </div>

        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-100">

          <h2 className="text-xl font-semibold text-slate-800">
            Recent Activity
            <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">

  <Link
    to="/admin/shops"
    className="rounded-xl bg-white p-6 shadow-sm border border-slate-100 hover:shadow-md"
  >
    <h3 className="text-lg font-semibold text-slate-800">
      Shop Management
    </h3>

    <p className="mt-2 text-sm text-slate-500">
      View and manage registered shops.
    </p>
  </Link>

  <Link
    to="/admin/products"
    className="rounded-xl bg-white p-6 shadow-sm border border-slate-100 hover:shadow-md"
  >
    <h3 className="text-lg font-semibold text-slate-800">
      Product Management
    </h3>

    <p className="mt-2 text-sm text-slate-500">
      Monitor products and inventory.
    </p>
  </Link>

  <Link
    to="/admin/reports"
    className="rounded-xl bg-white p-6 shadow-sm border border-slate-100 hover:shadow-md"
  >
    <h3 className="text-lg font-semibold text-slate-800">
      Reports & Analytics
    </h3>

    <p className="mt-2 text-sm text-slate-500">
      View sales and business reports.
    </p>
  </Link>

</div>
          </h2>

          <div className="mt-6 space-y-4">

            <div className="border-b pb-3">
              <p className="font-medium text-slate-700">
                New shop registered
              </p>

              <p className="text-sm text-slate-400">
                Recently
              </p>
            </div>

            <div className="border-b pb-3">
              <p className="font-medium text-slate-700">
                Product inventory updated
              </p>

              <p className="text-sm text-slate-400">
                Recently
              </p>
            </div>

            <div>
              <p className="font-medium text-slate-700">
                New customer added
              </p>

              <p className="text-sm text-slate-400">
                Recently
              </p>
            </div>

          </div>

        </div>

      </div>

    </div>
  )
}
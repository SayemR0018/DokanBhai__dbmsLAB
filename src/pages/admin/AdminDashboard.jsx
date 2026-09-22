import React from 'react'
import { Link } from 'react-router-dom'

const stats = [
  {
    title: 'Total Shops',
    value: '12',
    description: 'Registered businesses',
    icon: '🏪',
    color: 'from-blue-500 to-indigo-500',
    bg: 'bg-blue-50',
    text: 'text-blue-600',
  },
  {
    title: 'Total Products',
    value: '248',
    description: 'Products in system',
    icon: '📦',
    color: 'from-purple-500 to-pink-500',
    bg: 'bg-purple-50',
    text: 'text-purple-600',
  },
  {
    title: 'Total Customers',
    value: '186',
    description: 'Registered customers',
    icon: '👥',
    color: 'from-emerald-500 to-teal-500',
    bg: 'bg-emerald-50',
    text: 'text-emerald-600',
  },
  {
    title: 'Total Sales',
    value: '৳45,850',
    description: 'Overall sales',
    icon: '💰',
    color: 'from-orange-500 to-amber-500',
    bg: 'bg-orange-50',
    text: 'text-orange-600',
  },
]

const quickLinks = [
  {
    title: 'Shop Management',
    description: 'View and manage registered shops.',
    icon: '🏪',
    path: '/admin/shops',
    color: 'from-blue-500 to-indigo-500',
  },
  {
    title: 'Product Management',
    description: 'Monitor products and inventory.',
    icon: '📦',
    path: '/admin/products',
    color: 'from-purple-500 to-pink-500',
  },
  {
    title: 'Reports & Analytics',
    description: 'View sales and business reports.',
    icon: '📊',
    path: '/admin/reports',
    color: 'from-emerald-500 to-teal-500',
  },
]

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">

      {/* Header */}
      <div className="mb-8 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-7 text-white shadow-xl">

        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

          <div>
            <p className="mb-2 text-sm font-medium text-blue-100">
              DokanBhai Administration
            </p>

            <h1 className="text-3xl font-bold md:text-4xl">
              Admin Dashboard
            </h1>

            <p className="mt-2 text-blue-100">
              Monitor and manage the DokanBhai platform.
            </p>
          </div>

          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-3xl backdrop-blur-sm">
            🛡️
          </div>

        </div>

      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

        {stats.map((stat) => (

          <div
            key={stat.title}
            className="group overflow-hidden rounded-2xl bg-white shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl"
          >

            <div className={`h-1.5 bg-gradient-to-r ${stat.color}`} />

            <div className="p-6">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {stat.title}
                  </p>

                  <h2 className="mt-2 text-3xl font-bold text-slate-800">
                    {stat.value}
                  </h2>
                </div>

                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bg} text-2xl`}
                >
                  {stat.icon}
                </div>

              </div>

              <p className={`mt-3 text-xs font-medium ${stat.text}`}>
                {stat.description}
              </p>

            </div>

          </div>

        ))}

      </div>

      {/* Main Content */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* Platform Overview */}
        <div className="rounded-2xl bg-white p-6 shadow-md">

          <div className="mb-6 flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 text-xl text-white">
              📈
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-800">
                Platform Overview
              </h2>

              <p className="text-sm text-slate-400">
                Current system status
              </p>
            </div>

          </div>

          <div className="space-y-4">

            {/* Active Shops */}
            <div className="flex items-center justify-between rounded-xl bg-emerald-50 p-4">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                  🏪
                </div>

                <span className="font-medium text-slate-700">
                  Active Shops
                </span>

              </div>

              <span className="text-xl font-bold text-emerald-600">
                10
              </span>

            </div>

            {/* Low Stock */}
            <div className="flex items-center justify-between rounded-xl bg-red-50 p-4">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                  ⚠️
                </div>

                <span className="font-medium text-slate-700">
                  Low Stock Products
                </span>

              </div>

              <span className="text-xl font-bold text-red-500">
                8
              </span>

            </div>

            {/* Pending Activities */}
            <div className="flex items-center justify-between rounded-xl bg-amber-50 p-4">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                  ⏳
                </div>

                <span className="font-medium text-slate-700">
                  Pending Activities
                </span>

              </div>

              <span className="text-xl font-bold text-amber-500">
                5
              </span>

            </div>

          </div>

        </div>

        {/* Recent Activity */}
        <div className="rounded-2xl bg-white p-6 shadow-md">

          <div className="mb-6 flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-xl text-white">
              🔔
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-800">
                Recent Activity
              </h2>

              <p className="text-sm text-slate-400">
                Latest platform activities
              </p>
            </div>

          </div>

          <div className="space-y-4">

            <div className="flex items-center gap-4 rounded-xl bg-blue-50 p-4">

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                🏪
              </div>

              <div>
                <p className="font-semibold text-slate-700">
                  New shop registered
                </p>

                <p className="text-xs text-slate-400">
                  Recently
                </p>
              </div>

            </div>

            <div className="flex items-center gap-4 rounded-xl bg-purple-50 p-4">

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                📦
              </div>

              <div>
                <p className="font-semibold text-slate-700">
                  Product inventory updated
                </p>

                <p className="text-xs text-slate-400">
                  Recently
                </p>
              </div>

            </div>

            <div className="flex items-center gap-4 rounded-xl bg-emerald-50 p-4">

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                👤
              </div>

              <div>
                <p className="font-semibold text-slate-700">
                  New customer added
                </p>

                <p className="text-xs text-slate-400">
                  Recently
                </p>
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Quick Access */}
      <div className="mt-8">

        <div className="mb-5">

          <h2 className="text-2xl font-bold text-slate-800">
            Quick Access
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Quickly access admin management modules.
          </p>

        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

          {quickLinks.map((item) => (

            <Link
              key={item.title}
              to={item.path}
              className="group overflow-hidden rounded-2xl bg-white shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl"
            >

              <div className={`h-2 bg-gradient-to-r ${item.color}`} />

              <div className="p-6">

                <div className="flex items-center justify-between">

                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-2xl transition group-hover:scale-110">
                    {item.icon}
                  </div>

                  <span className="text-xl text-slate-300 transition group-hover:translate-x-1 group-hover:text-slate-500">
                    →
                  </span>

                </div>

                <h3 className="mt-5 text-lg font-bold text-slate-800">
                  {item.title}
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  {item.description}
                </p>

              </div>

            </Link>

          ))}

        </div>

      </div>

    </div>
  )
}
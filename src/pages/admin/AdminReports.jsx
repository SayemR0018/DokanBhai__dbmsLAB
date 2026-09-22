import React from 'react'

export default function AdminReports() {
  return (
    <div className="min-h-screen bg-slate-50 p-6">

      <div className="mb-8">

        <h1 className="text-3xl font-bold text-slate-800">
          Reports & Analytics
        </h1>

        <p className="mt-2 text-slate-500">
          Overview of platform sales and business performance.
        </p>

      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">
            Today's Sales
          </p>

          <h2 className="mt-2 text-3xl font-bold text-slate-800">
            ৳8,450
          </h2>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">
            This Month
          </p>

          <h2 className="mt-2 text-3xl font-bold text-slate-800">
            ৳45,850
          </h2>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">
            Average Sale
          </p>

          <h2 className="mt-2 text-3xl font-bold text-slate-800">
            ৳1,280
          </h2>
        </div>

      </div>

      <div className="mt-8 rounded-xl bg-white p-6 shadow-sm">

        <h2 className="text-xl font-semibold text-slate-800">
          Sales Summary
        </h2>

        <div className="mt-6 space-y-5">

          <div>
            <div className="mb-2 flex justify-between text-sm">
              <span>Grocery Shops</span>
              <span>60%</span>
            </div>

            <div className="h-3 rounded-full bg-slate-100">
              <div className="h-3 w-[60%] rounded-full bg-blue-500" />
            </div>
          </div>

          <div>
            <div className="mb-2 flex justify-between text-sm">
              <span>Fashion Shops</span>
              <span>25%</span>
            </div>

            <div className="h-3 rounded-full bg-slate-100">
              <div className="h-3 w-[25%] rounded-full bg-green-500" />
            </div>
          </div>

          <div>
            <div className="mb-2 flex justify-between text-sm">
              <span>Other Businesses</span>
              <span>15%</span>
            </div>

            <div className="h-3 rounded-full bg-slate-100">
              <div className="h-3 w-[15%] rounded-full bg-purple-500" />
            </div>
          </div>

        </div>

      </div>

    </div>
  )
}
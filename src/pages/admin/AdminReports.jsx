import React from 'react'

export default function AdminReports() {
  return (
    <div className="min-h-screen bg-slate-50 p-6">

      <div className="mb-8">

        <h1 className="text-3xl font-bold text-slate-800">
          রিপোর্ট ও বিশ্লেষণ
        </h1>

        <p className="mt-2 text-slate-500">
          প্ল্যাটফর্মের বিক্রয় এবং ব্যবসায়িক কার্যক্রমের সারসংক্ষেপ দেখুন।
        </p>

      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">
            আজকের বিক্রয়
          </p>

          <h2 className="mt-2 text-3xl font-bold text-slate-800">
            ৳8,450
          </h2>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">
            এই মাসের বিক্রয়
          </p>

          <h2 className="mt-2 text-3xl font-bold text-slate-800">
            ৳45,850
          </h2>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">
            গড় বিক্রয়
          </p>

          <h2 className="mt-2 text-3xl font-bold text-slate-800">
            ৳1,280
          </h2>
        </div>

      </div>

      <div className="mt-8 rounded-xl bg-white p-6 shadow-sm">

        <h2 className="text-xl font-semibold text-slate-800">
          বিক্রয়ের সারসংক্ষেপ
        </h2>

        <div className="mt-6 space-y-5">

          <div>
            <div className="mb-2 flex justify-between text-sm">
              <span>মুদি দোকান</span>
              <span>60%</span>
            </div>

            <div className="h-3 rounded-full bg-slate-100">
              <div className="h-3 w-[60%] rounded-full bg-blue-500" />
            </div>
          </div>

          <div>
            <div className="mb-2 flex justify-between text-sm">
              <span>ফ্যাশন দোকান</span>
              <span>25%</span>
            </div>

            <div className="h-3 rounded-full bg-slate-100">
              <div className="h-3 w-[25%] rounded-full bg-green-500" />
            </div>
          </div>

          <div>
            <div className="mb-2 flex justify-between text-sm">
              <span>অন্যান্য ব্যবসা</span>
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
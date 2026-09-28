import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Logo from '../../components/Logo'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { adminLogin } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    setError('')
    setLoading(true)

    const result = await adminLogin(email, password)

    setLoading(false)

    if (!result?.ok) {
      setError(result?.error || 'অ্যাডমিন লগইন ব্যর্থ হয়েছে')
      return
    }

    navigate('/admin/dashboard', { replace: true })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4 py-8">
      <div className="flex min-h-[90vh] items-center justify-center">

        <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">

          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-7 text-white">
            <div className="flex items-center gap-4">

              <Logo className="h-14 w-14" />

              <div>
                <p className="text-sm text-blue-100">
                  দোকানভাই অ্যাডমিন প্যানেল
                </p>

                <h1 className="text-2xl font-bold">
                  অ্যাডমিন লগইন
                </h1>
              </div>

            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-7">

            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-800">
                স্বাগতম, অ্যাডমিন
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                দোকানভাই প্ল্যাটফর্ম পরিচালনা করতে লগইন করুন।
              </p>
            </div>

            {/* Email */}
            <div className="mb-5">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                অ্যাডমিন ইমেইল
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@dokanbhai.com"
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Password */}
            <div className="mb-5">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                পাসওয়ার্ড
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="আপনার পাসওয়ার্ড লিখুন"
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {error}
              </div>
            )}

            {/* Login button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 py-3 font-semibold text-white shadow-md transition hover:from-blue-700 hover:to-purple-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'প্রবেশ করা হচ্ছে...' : '🛡️ অ্যাডমিন হিসেবে প্রবেশ করুন'}
            </button>

            {/* Back */}
            <div className="mt-6 border-t border-slate-100 pt-5 text-center">
              <Link
                to="/login"
                className="text-sm font-medium text-slate-500 transition hover:text-blue-600"
              >
                ← দোকান লগইন / Shop sign in
              </Link>
              <Link
                to="/"
                className="mt-2 block text-sm font-medium text-slate-500 transition hover:text-blue-600"
              >
                হোম পেজ / Home
              </Link>
            </div>

          </form>
        </div>
      </div>
    </div>
  )
}
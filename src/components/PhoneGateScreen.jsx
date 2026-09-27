import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useProfile } from '../context/ProfileContext'
import SiteHeader from './SiteHeader'

export default function PhoneGateScreen() {
  const { profile } = useProfile()
  const { user, loading, login } = useAuth()
  const navigate = useNavigate()
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!loading && user?.isAdmin) return <Navigate to="/admin/dashboard" replace />
  if (!loading && user) return <Navigate to="/dashboard" replace />

  const expectedPretty = profile?.session?.phone || ''

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const cleanPhone = phone.trim()
    if (!cleanPhone) {
      setError('মোবাইল নম্বর দিন / Enter your mobile number')
      return
    }
    if (!/^01[3-9]\d{8}$/.test(cleanPhone)) {
      setError('সঠিক BD মোবাইল নম্বর দিন (01XXXXXXXXX) / Enter a valid BD mobile number')
      return
    }
    setSubmitting(true)
    const res = await login(cleanPhone)
    setSubmitting(false)
    if (!res.ok) {
      setError(res.error || 'প্রবেশ ব্যর্থ / Sign in failed')
      return
    }
    navigate(res.user?.isAdmin ? '/admin/dashboard' : '/dashboard', { replace: true })
  }

  return (
    <div className="min-h-screen bg-[#f4f7f8] text-[#091020]" style={{ fontFamily: '"Hind Siliguri", Inter, sans-serif' }}>
      <SiteHeader cta="register" />
      <main className="mx-auto grid w-[min(1040px,calc(100%-1.5rem))] overflow-hidden rounded-3xl border border-[#e3e8ed] bg-white shadow-sm my-8 lg:grid-cols-2">
        <aside className="bg-[#062035] p-8 text-white">
          <p className="text-xs font-semibold tracking-wide text-[#8bc6b4]">● DOKANBHAI</p>
          <h1 className="mt-4 text-4xl font-bold leading-tight">দোকান ভাই-এ<br />স্বাগতম</h1>
          <p className="mt-3 text-sm leading-7 text-white/80">আপনার দোকানের বিক্রি, বাকি ও পণ্যের হিসাব রাখুন সহজে।</p>
          <ul className="mt-8 space-y-4 text-sm">
            <li><strong className="block">বাকি খাতা</strong><span className="text-white/70">এক জায়গায় সকল বাকি ও পাওনা</span></li>
            <li><strong className="block">স্টক ও বিক্রি</strong><span className="text-white/70">কেজি, লিটার ও পিসের হিসাব</span></li>
            <li><strong className="block">নগদ / বাকি / অনলাইন</strong><span className="text-white/70">পেমেন্ট আলাদা করে রাখা</span></li>
          </ul>
        </aside>
        <section className="p-6 sm:p-8">
          <p className="text-xs font-semibold text-[#00815d]">দোকানভাইয়ের সদস্য</p>
          <h2 className="mt-1 text-3xl font-bold">লগ ইন করুন</h2>
          <p className="mt-1 text-sm text-[#667085]">নিবন্ধিত মোবাইল নম্বর দিয়ে প্রবেশ করুন। এই খাতায় আলাদা ওটিপি লাগে না।</p>
          {expectedPretty && (
            <p className="mt-4 rounded-xl bg-[#e8faf3] px-3 py-2 text-sm">নিবন্ধিত নম্বর / Registered number <span className="font-mono font-bold text-[#006b4f]">{expectedPretty}</span></p>
          )}
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <label className="block text-sm font-semibold">
              মোবাইল নম্বর <span className="font-normal text-[#667085]">বাংলাদেশ (+880)</span>
              <input
                type="tel"
                inputMode="numeric"
                required
                autoFocus
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, '').slice(0, 11))}
                placeholder="01XXXXXXXXX"
                className="mt-2 w-full min-h-[48px] rounded-xl border border-[#e3e8ed] px-3 font-mono text-base"
              />
            </label>
            {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            <button type="submit" disabled={submitting} className="inline-flex min-h-[48px] w-full items-center justify-center rounded-xl bg-[#006b4f] font-semibold text-white disabled:opacity-60">
              {submitting ? 'প্রবেশ হচ্ছে…' : 'প্রবেশ করুন / Sign in'}
            </button>
          </form>
          <p className="mt-6 text-sm text-[#667085]">
            নতুন দোকান? <Link to="/register" className="font-semibold text-[#006b4f]">বিনামূল্যে খাতা খুলুন</Link>
          </p>
          <p className="mt-3 text-sm text-[#667085]">
            প্ল্যাটফর্ম অ্যাডমিন? <Link to="/admin/login" className="font-semibold text-[#273246]">অ্যাডমিন লগইন / Admin login</Link>
          </p>
          <p className="mt-6 text-xs text-[#667085]">◉ হেল্পলাইন: ০১৬৮২১৬৭৩৮২</p>
        </section>
      </main>
    </div>
  )
}

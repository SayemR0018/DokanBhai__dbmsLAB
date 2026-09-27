import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useProfile } from '../context/ProfileContext'
import data, { setCurrentPhone as setDataPhone } from '../lib/data'
import { setCurrentPhone as setProfilePhone } from '../lib/dokanProfile'
import { setCurrentPhone as setLocalPhone } from '../lib/localDb'
import { BUSINESS_TYPES } from '../lib/verticals'
import SiteHeader from '../components/SiteHeader'
import { persistToSupabase } from '../components/OnboardingModal'

const DISTRICTS = ['ঢাকা', 'চট্টগ্রাম', 'রাজশাহী', 'খুলনা', 'সিলেট', 'বরিশাল', 'রংপুর', 'ময়মনসিংহ']

export default function RegisterPage() {
  const navigate = useNavigate()
  const { user, login } = useAuth()
  const { complete, setProfile: setProfileCtx } = useProfile()
  const [storeName, setStoreName] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [phone, setPhone] = useState('')
  const [district, setDistrict] = useState('')
  const [area, setArea] = useState('')
  const [businessType, setBusinessType] = useState('mudi')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (user?.isAdmin) return <Navigate to="/admin/dashboard" replace />
  if (user && complete) return <Navigate to="/dashboard" replace />

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!storeName.trim()) return setError('দোকানের নাম দিন / Please enter store name')
    if (!ownerName.trim()) return setError('মালিকের নাম দিন / Please enter owner name')
    const cleanPhone = phone.replace(/\D/g, '').slice(0, 11)
    if (!/^01[3-9]\d{8}$/.test(cleanPhone)) {
      return setError('সঠিক মোবাইল নম্বর দিন (01XXXXXXXXX) / Enter a valid BD mobile number')
    }
    const region = [district, area.trim()].filter(Boolean).join(', ')
    if (!region) return setError('জেলা বা এলাকা দিন / Enter a district or area')

    setSubmitting(true)
    try {
      await persistToSupabase({
        cleanPhone,
        storeName: storeName.trim(),
        ownerName: ownerName.trim(),
        region,
        businessType,
      })
      const payload = {
        storeName: storeName.trim(),
        ownerName: ownerName.trim(),
        region,
        businessType,
        phone: cleanPhone,
      }
      setDataPhone(cleanPhone)
      setProfilePhone(cleanPhone)
      setLocalPhone(cleanPhone)
      setProfileCtx(payload)
      data.setProfile(payload)
      const res = await login(cleanPhone)
      if (!res.ok) {
        setError(res.error || 'প্রোফাইল সেভ হয়েছে, প্রবেশ আবার চেষ্টা করুন / Profile saved. Sign in again.')
        setSubmitting(false)
        return
      }
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err?.message || 'সেটআপ ব্যর্থ / Setup failed')
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#091020]" style={{ fontFamily: '"Hind Siliguri", Inter, sans-serif' }}>
      <SiteHeader cta="login" />
      <main className="mx-auto grid w-[min(1100px,calc(100%-1.5rem))] gap-6 py-8 lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="rounded-3xl bg-[#062035] p-8 text-white">
          <h1 className="text-3xl font-bold leading-snug">আপনার মুদি দোকানের ডিজিটাল খাতা শুরু করুন</h1>
          <p className="mt-3 text-sm leading-7 text-white/80">রেজিস্ট্রেশন শেষ করে বাকি খাতা, বিক্রি ও স্টক এক জায়গায় রাখুন।</p>
          <ul className="mt-8 space-y-4 text-sm">
            <li>শূন্য খরচে শুরু। কোনো মাসিক ফি এই খাতায় নেই।</li>
            <li>নগদ বিক্রিতে কাস্টমার ঐচ্ছিক। বাকিতে নাম ও ০১ নম্বর লাগে।</li>
            <li>হেল্পলাইন: ০১৬৮২১৬৭৩৮২</li>
          </ul>
        </aside>

        <form onSubmit={onSubmit} className="rounded-3xl border border-[#e3e8ed] bg-white p-6 sm:p-8">
          <p className="text-xs font-semibold text-[#00815d]">নতুন মার্চেন্ট অনবোর্ডিং</p>
          <h2 className="mt-1 text-2xl font-bold">দোকানের ডিজিটাল খাতা খুলুন</h2>
          <div className="mt-6 space-y-4">
            <label className="block text-sm font-semibold">দোকানের নাম <span className="text-red-600">*</span> <span className="font-normal text-[#667085]">(Shop Name)</span>
              <input value={storeName} onChange={(e) => setStoreName(e.target.value)} required className="mt-1 w-full min-h-[44px] rounded-xl border border-[#e3e8ed] px-3" placeholder="উদাঃ ভাই ভাই স্টোর" />
            </label>
            <div>
              <p className="text-sm font-semibold">দোকানের ধরন <span className="text-red-600">*</span></p>
              <div className="mt-2 flex flex-wrap gap-2">
                {BUSINESS_TYPES.map((b) => (
                  <button key={b.key} type="button" onClick={() => setBusinessType(b.key)} className={`min-h-[44px] rounded-xl border px-3 text-sm font-semibold ${businessType === b.key ? 'border-[#006b4f] bg-[#e8faf3] text-[#006b4f]' : 'border-[#e3e8ed]'}`}>
                    {b.icon} {b.label}
                  </button>
                ))}
              </div>
            </div>
            <label className="block text-sm font-semibold">দোকানদারের নাম <span className="text-red-600">*</span>
              <input value={ownerName} onChange={(e) => setOwnerName(e.target.value)} required className="mt-1 w-full min-h-[44px] rounded-xl border border-[#e3e8ed] px-3" placeholder="আপনার পুরো নাম" />
            </label>
            <label className="block text-sm font-semibold">মোবাইল নম্বর <span className="text-red-600">*</span>
              <input value={phone} inputMode="numeric" onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))} required className="mt-1 w-full min-h-[44px] rounded-xl border border-[#e3e8ed] px-3 font-mono" placeholder="01XXXXXXXXX" />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-semibold">জেলা
                <select value={district} onChange={(e) => setDistrict(e.target.value)} className="mt-1 w-full min-h-[44px] rounded-xl border border-[#e3e8ed] px-3">
                  <option value="">জেলা বেছে নিন</option>
                  {DISTRICTS.map((d) => <option key={d}>{d}</option>)}
                </select>
              </label>
              <label className="block text-sm font-semibold">বাজার বা এলাকা
                <input value={area} onChange={(e) => setArea(e.target.value)} className="mt-1 w-full min-h-[44px] rounded-xl border border-[#e3e8ed] px-3" placeholder="মিরপুর-১০" />
              </label>
            </div>
          </div>
          {error && <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <button type="submit" disabled={submitting} className="mt-6 inline-flex min-h-[48px] w-full items-center justify-center rounded-xl bg-[#006b4f] font-semibold text-white disabled:opacity-60">
            {submitting ? 'সেভ হচ্ছে…' : 'সেট আপ সম্পন্ন করুন / Complete setup'}
          </button>
          <p className="mt-4 text-center text-sm text-[#667085]">
            আগে থেকে খাতা আছে? <Link to="/login" className="font-semibold text-[#006b4f]">লগ ইন করুন</Link>
          </p>
        </form>
      </main>
    </div>
  )
}

import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useProfile } from '../context/ProfileContext'
import { Button, Input, Field, Card } from './ui'
import { PhoneIcon, LockIcon } from './icons'

export default function PhoneGateScreen() {
  const { profile } = useProfile()
  const { user, loading, login, backendsMode } = useAuth()
  const navigate = useNavigate()
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // If already authenticated (e.g. user refreshed on /login), bounce them
  // straight to the dashboard instead of making them re-enter the phone.
  if (!loading && user) {
    return <Navigate to="/dashboard" replace />
  }

  const expected = (profile?.session?.phone || '').replace(/\D/g, '')
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
    // Successful sign in — go to the dashboard. `replace` keeps the back
    // button from dropping the user back onto the now-stale /login screen.
    navigate('/dashboard', { replace: true })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-steel-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center text-xl font-black">D</div>
            <div>
              <p className="text-xs uppercase tracking-widest text-steel-500">DokanBhai</p>
              <p className="text-base font-bold text-steel-800">{profile?.store?.name || 'ডিজিটাল দোকান খাতা'}</p>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-steel-800">স্বাগতম / Welcome</h1>
          <p className="text-sm text-steel-500 mt-1">
            আপনার মোবাইল নম্বর দিয়ে প্রবেশ করুন। কোন পাসওয়ার্ড নেই — এই ডিভাইসে বিশ্বস্ত।
            Sign in with your mobile number. No password — trusted on this device.
          </p>

          {expectedPretty && (
            <div className="mt-4 p-3 rounded-lg bg-brand-50 border border-brand-100 text-sm">
              <p className="text-steel-500 text-xs">নিবন্ধিত নম্বর / Registered number</p>
              <p className="font-mono font-bold text-brand-700">{expectedPretty}</p>
            </div>
          )}

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <Field label="মোবাইল নম্বর / Mobile Number">
              <div className="relative">
                <PhoneIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-steel-400" />
                <Input
                  type="tel"
                  inputMode="numeric"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, '').slice(0, 11))}
                  placeholder="01XXXXXXXXX"
                  className="pl-10 font-mono"
                  autoFocus
                />
              </div>
            </Field>

            {error && (
              <div role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 font-medium">
                {error}
              </div>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={submitting}>
              <LockIcon size={16} /> {submitting ? 'প্রবেশ হচ্ছে…' : 'প্রবেশ করুন / Sign in'}
            </Button>
          </form>

          <p className="mt-4 text-[11px] text-steel-400 text-center">
            Backend: <span className={backendsMode === 'supabase' ? 'text-emerald-600 font-semibold' : 'text-amber-600 font-semibold'}>{backendsMode}</span>
          </p>
        </Card>
      </div>
    </div>
  )
}
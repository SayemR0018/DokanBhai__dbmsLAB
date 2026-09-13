import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Modal, Button, Input, Field } from './ui'
import BusinessTypeChips from './BusinessTypeChips'
import { getSupabase, isSupabaseConfigured } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'

// Normalize a Bangladesh mobile number to the 01XXXXXXXXX 11-digit form.
const normalizePhone = (raw) => (raw || '').replace(/\D/g, '').slice(0, 11)

// Best-effort upload to the Supabase cloud tables. We deliberately wrap each
// upsert in its own try/catch so a missing/optional table (e.g. `businesses`)
// doesn't prevent the local profile from being saved and the user from
// reaching the dashboard. Failures are logged so they are visible in
// developer tools but never block the user.
async function persistToSupabase({ cleanPhone, storeName, ownerName, region, businessType }) {
  if (!isSupabaseConfigured) return { ok: true, skipped: true }
  const supabase = getSupabase()
  if (!supabase) return { ok: true, skipped: true }

  const errors = []
  try {
    const { error } = await supabase.from('businesses').upsert(
      {
        id: cleanPhone,
        name: storeName,
        business_type: businessType,
        owner_user_id: cleanPhone,
        address: region,
        phone: cleanPhone,
      },
      { onConflict: 'id' }
    )
    if (error) errors.push('businesses: ' + error.message)
  } catch (err) {
    errors.push('businesses: ' + (err?.message || err))
  }

  try {
    const { error } = await supabase.from('dokan_profile').upsert(
      {
        id: cleanPhone,
        schema_version: 1,
        store_name: storeName,
        owner_name: ownerName,
        region,
        business_type: businessType,
        session_phone: cleanPhone,
        currency: 'BDT',
        receipt_width: '80mm',
        locale: 'bn-BD',
      },
      { onConflict: 'id' }
    )
    if (error) errors.push('dokan_profile: ' + error.message)
  } catch (err) {
    errors.push('dokan_profile: ' + (err?.message || err))
  }

  if (errors.length) console.warn('[onboarding] Supabase persist warnings:', errors)
  return { ok: true, warnings: errors }
}

export default function OnboardingModal({ onComplete, onClose }) {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [storeName, setStoreName] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [region, setRegion] = useState('')
  const [phone, setPhone] = useState('')
  const [businessType, setBusinessType] = useState('mudi')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = async (e) => {
    e?.preventDefault?.()
    setError('')
    if (!storeName.trim()) return setError('দোকানের নাম দিন / Please enter store name')
    if (!ownerName.trim()) return setError('মালিকের নাম দিন / Please enter owner name')
    if (!region.trim()) return setError('এলাকা / জেলা দিন / Please enter region or district')
    const cleanPhone = normalizePhone(phone)
    if (!cleanPhone || !/^01[3-9]\d{8}$/.test(cleanPhone)) {
      return setError('সঠিক মোবাইল নম্বর দিন (01XXXXXXXXX) / Enter a valid BD mobile number')
    }
    if (!businessType) return setError('ব্যবসার ধরন বেছে নিন / Choose a business type')

    setSubmitting(true)
    try {
      // 1. Upload to Supabase (best-effort, never blocks).
      await persistToSupabase({
        cleanPhone,
        storeName: storeName.trim(),
        ownerName: ownerName.trim(),
        region: region.trim(),
        businessType,
      })

      // 2. Save to the local profile context — this also flips `complete`
      //    in ProfileContext so <App /> can render the real route tree.
      const payload = {
        storeName: storeName.trim(),
        ownerName: ownerName.trim(),
        region: region.trim(),
        businessType,
        phone: cleanPhone,
      }
      if (typeof onComplete === 'function') {
        await onComplete(payload)
      }

      // 3. Mark this device as trusted (writes dokanbhai-auth-session) so the
      //    user lands on the dashboard as a logged-in owner instead of being
      //    bounced back to /login.
      const res = await login(cleanPhone)
      if (!res.ok) {
        // Non-fatal: the profile is saved, but we still surface the auth
        // error so the user knows why they may be asked to sign in again.
        console.warn('[onboarding] auto-login failed:', res.error)
      }

      // 4. Close the modal (if a parent is still gating on open) and route
      //    the user to the dashboard.
      onClose?.()
      navigate('/dashboard', { replace: true })
    } catch (err) {
      console.error('[onboarding] save failed:', err)
      setError(err?.message || 'সেটআপ ব্যর্থ / Setup failed')
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open
      onClose={() => { /* onboarding cannot be dismissed mid-setup */ }}
      title="স্বাগতম! আপনার দোকান সেট আপ করুন"
      size="lg"
    >
      <p className="text-sm text-steel-500 mb-4">
        Welcome to <strong>DokanBhai</strong>! একবার সেট আপ করলেই হবে — কোন অ্যাকাউন্ট লাগবে না।
        Set up once and you're ready — no signup required.
      </p>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="দোকানের নাম / Store Name">
            <Input
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="আল-আমিন স্টোর"
              autoFocus
            />
          </Field>
          <Field label="মালিকের নাম / Owner Name">
            <Input
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              placeholder="মোঃ রহিম"
            />
          </Field>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="এলাকা / জেলা / Region or District" hint="যেমন: Mirpur, Dhaka">
            <Input
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              placeholder="Mirpur, Dhaka"
            />
          </Field>
          <Field label="মোবাইল নম্বর / Mobile Number" hint="01XXXXXXXXX (BD format)">
            <Input
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, '').slice(0, 11))}
              placeholder="01712345678"
            />
          </Field>
        </div>

        <Field label="ব্যবসার ধরন / Primary Business Category">
          <BusinessTypeChips value={businessType} onChange={setBusinessType} />
        </Field>

        {error && (
          <div role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 font-medium">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-steel-100">
          <Button type="submit" size="lg" disabled={submitting}>
            {submitting ? 'সেভ হচ্ছে…' : 'সেট আপ সম্পন্ন করুন / Complete setup'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
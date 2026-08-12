import { useState } from 'react'
import { Modal, Button, Input, Field } from './ui'
import BusinessTypeChips from './BusinessTypeChips'

export default function OnboardingModal({ onComplete }) {
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
    if (!phone.trim() || !/^01[3-9]\d{8}$/.test(phone.trim())) {
      return setError('সঠিক মোবাইল নম্বর দিন (01XXXXXXXXX) / Enter a valid BD mobile number')
    }
    if (!businessType) return setError('ব্যবসার ধরন বেছে নিন / Choose a business type')

    setSubmitting(true)
    try {
      await onComplete({
        storeName: storeName.trim(),
        ownerName: ownerName.trim(),
        region: region.trim(),
        businessType,
        phone: phone.trim(),
      })
    } catch (err) {
      setError(err?.message || 'Failed to save')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open
      onClose={() => {}}
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
          <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
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
import { useMemo, useState } from 'react'
import { Drawer, Button } from './ui'
import { formatBDT } from '../lib/format'
import { buildBakiReminder, copyToClipboard } from '../lib/reminders'

// WhatsApp-ish green for the action button.
export default function ReminderSheet({ open, onClose, customer, store }) {
  const [copied, setCopied] = useState(false)

  const due = Number(customer?.balance || 0)
  const payload = useMemo(() => {
    if (!customer) return null
    return buildBakiReminder({ customer, due, store })
  }, [customer, due, store])

  if (!customer || !payload) return null

  const onCopy = async () => {
    const ok = await copyToClipboard(payload.text)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    }
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="বাকি মনে করান / Send Baki Reminder"
      width="max-w-md"
    >
      <div className="space-y-4">
        <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
          <p className="text-xs uppercase tracking-wide text-red-600 font-semibold">{customer.name}</p>
          <p className="text-2xl font-bold text-red-700 mt-1">{formatBDT(due)} <span className="text-sm font-normal">বাকি</span></p>
          {customer.phone && <p className="text-xs text-steel-500 mt-1">📞 {customer.phone}</p>}
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-steel-400 font-semibold mb-2">মেসেজ প্রিভিউ / Message preview</p>
          <pre className="bg-steel-50 border border-steel-100 rounded-lg p-3 text-xs whitespace-pre-wrap text-steel-700 font-mono">
{payload.text}
          </pre>
        </div>

        <div className="grid grid-cols-1 gap-2">
          <Button variant="success" className="w-full" disabled={!payload.waLink} onClick={() => payload.waLink && window.open(payload.waLink, '_blank')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="shrink-0"><path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.51 5.26l-.999 3.648 3.978-.607zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479c0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/></svg>
            WhatsApp-এ পাঠান
          </Button>
          <Button variant="secondary" className="w-full" disabled={!payload.smsLink} onClick={() => payload.smsLink && window.open(payload.smsLink, '_blank')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            SMS পাঠান
          </Button>
          <Button variant="outline" className="w-full" onClick={onCopy}>
            {copied ? 'কপি হয়েছে ✓' : 'মেসেজ কপি করুন / Copy'}
          </Button>
        </div>

        {!payload.waLink && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            এই কাস্টমারের ফোন নম্বর নেই — WhatsApp/SMS পাঠানো যাবে না। নম্বর যোগ করে আবার চেষ্টা করুন।
          </p>
        )}
      </div>
    </Drawer>
  )
}
// Baki Khata reminders — builds Bangla copy + WhatsApp / SMS deep links for
// customers with outstanding balances. Copy/paste fallback uses
// navigator.clipboard (with execCommand fallback for non-secure contexts).

import { formatBDT } from './format'

const sanitizeDigits = (s = '') => String(s).replace(/\D/g, '')

// Convert a BD mobile like "01712345678" to international "8801712345678".
const toInternational = (phone = '') => {
  const d = sanitizeDigits(phone)
  if (!d) return ''
  if (d.startsWith('880')) return d
  if (d.startsWith('0')) return '880' + d.slice(1)
  return '880' + d
}

const buildText = ({ storeName, customerName, due }) => {
  const amount = formatBDT(due)
  return [
    `আসসালামু আলাইকুম ${customerName || 'ভাই'},`,
    `${storeName || 'DokanBhai'} থেকে আপনার কাছে বাকি আছে ${amount}।`,
    `যখন সুবিধা হবে পরিশোধ করবেন। ধন্যবাদ।`,
  ].join('\n')
}

export function buildBakiReminder({ customer, due, store }) {
  const phone = customer?.phone || ''
  const text = buildText({ storeName: store?.name, customerName: customer?.name, due })
  const intl = toInternational(phone)
  const encoded = encodeURIComponent(text)
  let waLink = null
  let smsLink = null
  if (intl) {
    waLink = `https://wa.me/${intl}?text=${encoded}`
    smsLink = `sms:+${intl}?body=${encoded}`
  }
  return { text, waLink, smsLink }
}

export async function copyToClipboard(text) {
  if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {}
  }
  try {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.left = '-9999px'
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(ta)
    return ok
  } catch {
    return false
  }
}
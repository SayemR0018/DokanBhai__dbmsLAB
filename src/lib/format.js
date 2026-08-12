// Formatting helpers for BDT currency, dates and identifiers.
export const formatBDT = (value = 0) => {
  const num = Number(value || 0)
  return '\u09F3' + num.toLocaleString('en-IN', { maximumFractionDigits: 2 })
}

export const formatTk = (value = 0) => {
  const num = Number(value || 0)
  return num.toLocaleString('en-IN', { maximumFractionDigits: 2 }) + ' Tk'
}

// Backward-compatible alias used by older imports.
export const formatINR = formatBDT

export const formatNumber = (value = 0) => {
  return Number(value || 0).toLocaleString('en-IN')
}

export const formatDate = (iso) => {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export const formatDateTime = (iso) => {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export const formatTime = (iso) => {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

export const shortDate = (iso) => {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
}

export const daysAgo = (iso) => {
  if (!iso) return ''
  const d = new Date(iso)
  const diff = Math.round((Date.now() - d.getTime()) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  if (diff < 7) return `${diff}d ago`
  if (diff < 30) return `${Math.floor(diff / 7)}w ago`
  return formatDate(iso)
}

export const initials = (name = '') => {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() || '')
    .join('') || '?'
}

export const avatarColor = (seed = '') => {
  const palette = ['#0f9d58', '#2563eb', '#9333ea', '#0ea5e9', '#dc2626', '#ca8a04', '#0891b2', '#db2777', '#16a34a']
  let sum = 0
  for (let i = 0; i < seed.length; i++) sum += seed.charCodeAt(i)
  return palette[sum % palette.length]
}

export const uid = () => 'id-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7)

export { formatQty } from './units'

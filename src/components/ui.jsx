import { useEffect } from 'react'
import { XIcon } from './icons'

export function Card({ children, className = '', onClick }) {
  return (
    <div onClick={onClick} className={`bg-white rounded-2xl border border-steel-100 shadow-sm ${onClick ? 'cursor-pointer hover:shadow-md transition' : ''} ${className}`}>
      {children}
    </div>
  )
}

export function Button({ children, variant = 'primary', size = 'md', className = '', ...props }) {
  const sizes = {
    sm: 'px-3 py-1.5 text-sm min-h-[36px]',
    md: 'px-4 py-2 text-sm min-h-[44px]',
    lg: 'px-5 py-3 text-base min-h-[48px]',
  }
  const variants = {
    primary: 'bg-brand-500 hover:bg-brand-600 text-white shadow-sm shadow-brand-200',
    secondary: 'bg-white border border-steel-200 hover:bg-steel-50 text-steel-700',
    ghost: 'text-steel-600 hover:bg-steel-100',
    danger: 'bg-red-500 hover:bg-red-600 text-white shadow-sm shadow-red-200',
    success: 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm shadow-emerald-200',
    outline: 'border border-brand-500 text-brand-600 hover:bg-brand-50',
  }
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-1.5 font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed ${sizes[size]} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  )
}

export function Input(props) {
  const { className = '', ...rest } = props
  return (
    <input
      {...rest}
      className={`w-full px-3 py-2 bg-white border border-steel-200 rounded-lg text-sm text-steel-800 placeholder-steel-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition min-h-[40px] ${className}`}
    />
  )
}

export function Textarea(props) {
  const { className = '', ...rest } = props
  return (
    <textarea
      {...rest}
      className={`w-full px-3 py-2 bg-white border border-steel-200 rounded-lg text-sm text-steel-800 placeholder-steel-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition min-h-[40px] ${className}`}
    />
  )
}

export function Select({ children, className = '', ...props }) {
  return (
    <select
      {...props}
      className={`w-full px-3 py-2 bg-white border border-steel-200 rounded-lg text-sm text-steel-800 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition ${className}`}
    >
      {children}
    </select>
  )
}

export function Label({ children, className = '' }) {
  return <label className={`block text-xs font-semibold text-steel-600 uppercase tracking-wide mb-1.5 ${className}`}>{children}</label>
}

export function Field({ label, children, hint, className = '' }) {
  return (
    <div className={className}>
      {label && <Label>{label}</Label>}
      {children}
      {hint && <p className="mt-1 text-xs text-steel-400">{hint}</p>}
    </div>
  )
}

export function Badge({ children, color = 'gray', className = '' }) {
  const colors = {
    gray: 'bg-steel-100 text-steel-700',
    brand: 'bg-brand-100 text-brand-700',
    green: 'bg-emerald-100 text-emerald-700',
    red: 'bg-red-100 text-red-700',
    yellow: 'bg-amber-100 text-amber-700',
    blue: 'bg-blue-100 text-blue-700',
    purple: 'bg-purple-100 text-purple-700',
  }
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${colors[color] || colors.gray} ${className}`}>
      {children}
    </span>
  )
}

export function StatCard({ label, value, sublabel, icon, color = 'brand', onClick }) {
  const palette = {
    brand:  'from-brand-500 to-brand-600',
    green:  'from-emerald-500 to-emerald-600',
    red:    'from-red-500 to-red-600',
    blue:   'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    steel:  'from-steel-700 to-steel-800',
  }
  return (
    <Card onClick={onClick} className={`p-5 bg-gradient-to-br ${palette[color]} text-white border-0`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-white/80">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
          {sublabel && <p className="text-xs text-white/80 mt-1">{sublabel}</p>}
        </div>
        {icon && <div className="text-white/80">{icon}</div>}
      </div>
    </Card>
  )
}

export function Modal({ open, onClose, title, children, size = 'md', footer }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') onClose?.() }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null
  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center modal-backdrop p-2 sm:p-4" onClick={onClose}>
      <div
        className={`w-full ${sizes[size]} bg-white rounded-t-2xl sm:rounded-2xl shadow-xl flex flex-col max-h-[90vh]`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-steel-100">
          <h2 className="text-lg font-bold text-steel-800">{title}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-steel-100 text-steel-500"><XIcon size={20} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
        {footer && <div className="px-5 py-3 border-t border-steel-100 bg-steel-50 rounded-b-2xl">{footer}</div>}
      </div>
    </div>
  )
}

export function Drawer({ open, onClose, title, children, width = 'max-w-md' }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') onClose?.() }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex justify-end modal-backdrop" onClick={onClose}>
      <div className={`w-full ${width} bg-white shadow-xl flex flex-col h-full`} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-steel-100">
          <h2 className="text-lg font-bold text-steel-800">{title}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-steel-100 text-steel-500"><XIcon size={20} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  )
}

export function Chip({ active, onClick, children, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold border transition whitespace-nowrap ${
        active
          ? 'bg-brand-500 text-white border-brand-500 shadow-sm shadow-brand-200'
          : 'bg-white text-steel-600 border-steel-200 hover:bg-brand-50 hover:text-brand-700 hover:border-brand-200'
      } ${className}`}
    >
      {children}
    </button>
  )
}

export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {icon && <div className="mb-3 p-4 rounded-full bg-brand-50 text-brand-500">{icon}</div>}
      <h3 className="text-base font-semibold text-steel-700">{title}</h3>
      {description && <p className="mt-1 text-sm text-steel-500 max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function Spinner({ size = 18, className = '' }) {
  return (
    <svg className={`animate-spin text-current ${className}`} width={size} height={size} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.2" />
      <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" fill="none" />
    </svg>
  )
}
import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

export default function SiteHeader({ cta = 'register' }) {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <header className="sticky top-0 z-50 h-16 border-b border-[#edf0f2] bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-full w-[min(1160px,calc(100%-1.5rem))] items-center gap-4">
        <Link to="/" onClick={close} className="flex items-center gap-2 shrink-0">
          <span className="grid h-9 w-9 place-items-center rounded-[9px] bg-[#006b4f] text-sm font-black text-white">D</span>
          <span>
            <span className="block font-extrabold leading-none tracking-tight text-[#091020]">DOKANBHAI</span>
            <span className="mt-0.5 block text-[9px] font-bold text-[#006b4f]">দোকানভাই</span>
          </span>
        </Link>

        <nav className={`${open ? 'flex' : 'hidden'} md:flex absolute md:static top-16 left-3 right-3 md:left-auto md:right-auto flex-col md:flex-row md:items-center gap-1 md:gap-6 md:ml-auto rounded-2xl border border-[#e3e8ed] md:border-0 bg-white md:bg-transparent p-3 md:p-0 shadow-lg md:shadow-none text-sm font-semibold text-[#273246]`}>
          <NavLink to="/" onClick={close} className="rounded-lg px-2 py-2 hover:text-[#006b4f]">হোম পেজ</NavLink>
          <NavLink to="/login" onClick={close} className={({ isActive }) => `rounded-lg px-2 py-2 hover:text-[#006b4f] ${isActive ? 'text-[#006b4f]' : ''}`}>লগইন</NavLink>
          <NavLink to="/register" onClick={close} className={({ isActive }) => `rounded-lg px-2 py-2 hover:text-[#006b4f] ${isActive ? 'text-[#006b4f]' : ''}`}>রেজিস্ট্রেশন</NavLink>
          {cta === 'register' ? (
            <Link to="/register" onClick={close} className="mt-1 md:mt-0 inline-flex min-h-[44px] items-center justify-center rounded-xl bg-[#006b4f] px-4 text-white">
              নতুন একাউন্ট খুলুন
            </Link>
          ) : (
            <Link to="/login" onClick={close} className="mt-1 md:mt-0 inline-flex min-h-[44px] items-center justify-center rounded-xl bg-[#006b4f] px-4 text-white">
              লগ ইন করুন
            </Link>
          )}
        </nav>

        <button type="button" className="ml-auto md:hidden min-h-[44px] min-w-[44px]" onClick={() => setOpen((v) => !v)} aria-label="মেনু / Menu">
          {open ? '✕' : '☰'}
        </button>
      </div>
    </header>
  )
}

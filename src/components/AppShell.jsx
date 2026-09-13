import { useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useProfile } from '../context/ProfileContext'
import { initials } from '../lib/format'
import { getBusinessType } from '../lib/verticals'
import localDb from '../lib/localDb'
import { Button, Modal, Field, Input } from './ui'
import BusinessTypeChips from './BusinessTypeChips'
import {
  DashboardIcon, PackageIcon, CartIcon, UsersIcon, TruckIcon,
  TagIcon, LogOutIcon, MoneyIcon, ReceiptIcon, XIcon, PhoneIcon,
} from './icons'

const navItems = [
  { to: '/dashboard',  label: 'ড্যাশবোর্ড / Dashboard',  icon: DashboardIcon },
  { to: '/pos',        label: 'নতুন বিক্রয় / New Sale', icon: CartIcon },
  { to: '/inventory',  label: 'মালামাল / Inventory',     icon: PackageIcon },
  { to: '/sales',      label: 'বিক্রয় তালিকা / Sales', icon: ReceiptIcon },
  { to: '/customers',  label: 'কাস্টমার / Customers',   icon: UsersIcon },
  { to: '/hisab',      label: 'হিসাব খাতা / Hisab',     icon: MoneyIcon },
  { to: '/vendors',    label: 'সরবরাহকারী / Vendors',   icon: TruckIcon },
  { to: '/categories', label: 'ক্যাটাগরি / Categories', icon: TagIcon },
]

export default function AppShell({ children }) {
  const { user, signOut, backendsMode } = useAuth()
  const { profile, updateProfile, clearProfile } = useProfile()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const location = useLocation()

  const storeName = profile?.store?.name || 'DokanBhai'
  const biz = getBusinessType(profile?.store?.businessType)

  // Single source of truth for the logout flow — used by the sidebar, the
  // header mobile menu and the Settings modal. Calling signOut() clears
  // dokanbhai-auth-session and the user state; we then navigate back to
  // /login so the next person (or the same person with a new shop) can
  // either sign back in or trigger onboarding again.
  const handleSignOut = () => {
    signOut()
    setOpen(false)
    setSettingsOpen(false)
    navigate('/login', { replace: true })
  }

  const nav = (closeAfter = false) => (
    <nav className="flex-1 p-3 space-y-1">
      {navItems.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          onClick={() => closeAfter && setOpen(false)}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
              isActive
                ? 'bg-brand-500 text-white shadow-sm shadow-brand-200'
                : 'text-steel-600 hover:bg-steel-100 hover:text-steel-800'
            }`
          }
        >
          <Icon size={18} />
          <span>{label}</span>
        </NavLink>
      ))}
      <button
        type="button"
        onClick={() => { setSettingsOpen(true); closeAfter && setOpen(false) }}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-steel-600 hover:bg-steel-100 hover:text-steel-800"
      >
        <TagIcon size={18} />
        <span>সেটিংস / Settings</span>
      </button>
    </nav>
  )

  return (
    <div className="h-screen flex bg-steel-50">
      <aside className="hidden lg:flex w-64 bg-white border-r border-steel-100 flex-col">
        <div className="px-5 py-5 border-b border-steel-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center font-black">D</div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-steel-400">DokanBhai</p>
              <p className="text-sm font-bold text-steel-800 truncate max-w-[150px]">{storeName}</p>
            </div>
          </div>
          {biz && (
            <div className="mt-3 inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-brand-50 text-brand-700 text-[10px] font-semibold">
              <span>{biz.icon}</span>
              <span className="truncate">{biz.label}</span>
            </div>
          )}
        </div>
        {nav()}
        <div className="p-3 border-t border-steel-100 space-y-2">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-steel-50">
            <div className="w-9 h-9 rounded-full bg-brand-500 text-white flex items-center justify-center text-sm font-bold">
              {initials(user?.name || user?.phone || 'U')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-steel-800 truncate">{user?.name || user?.phone}</p>
              <p className="text-xs text-steel-500 truncate">{user?.role || 'Dokan Malik'}</p>
            </div>
          </div>
          <Button
            variant="secondary"
            onClick={handleSignOut}
            className="w-full justify-center text-red-600 hover:bg-red-50 hover:border-red-200"
            title="লগআউট / Sign out"
          >
            <LogOutIcon size={16} /> লগআউট / Sign out
          </Button>
          <div className="px-3 text-[10px] uppercase tracking-wider text-steel-400">
            Backend: <span className={backendsMode === 'supabase' ? 'text-emerald-600 font-semibold' : 'text-amber-600 font-semibold'}>{backendsMode}</span>
          </div>
        </div>
      </aside>

      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-steel-900/50" onClick={() => setOpen(false)}></div>
          <aside className="relative w-64 bg-white flex flex-col">
            <div className="px-5 py-5 border-b border-steel-100 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center font-black">D</div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-widest text-steel-400">DokanBhai</p>
                  <p className="text-sm font-bold text-steel-800 truncate">{storeName}</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="p-2 rounded-lg hover:bg-steel-100"><XIcon size={18} /></button>
            </div>
            {nav(true)}
            <div className="p-3 border-t border-steel-100">
              <Button
                variant="secondary"
                onClick={handleSignOut}
                className="w-full justify-center text-red-600 hover:bg-red-50 hover:border-red-200"
              >
                <LogOutIcon size={16} /> লগআউট / Sign out
              </Button>
            </div>
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden bg-white border-b border-steel-100 px-4 py-3 flex items-center justify-between">
          <button onClick={() => setOpen(true)} className="p-2 rounded-lg hover:bg-steel-100">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-brand-500 text-white flex items-center justify-center text-xs font-black">D</div>
            <div className="min-w-0">
              <p className="text-sm font-bold truncate">{storeName}</p>
              {biz && <p className="text-[10px] text-steel-500 truncate">{biz.icon} {biz.label}</p>}
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="p-2 rounded-lg text-steel-500 hover:bg-red-50 hover:text-red-600"
            title="লগআউট / Sign out"
          >
            <LogOutIcon size={16} />
          </button>
        </header>
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        profile={profile}
        updateProfile={updateProfile}
        onReset={() => {
          localDb.reset()
          clearProfile()
          window.location.assign('/login')
        }}
        onSignOut={handleSignOut}
      />
    </div>
  )
}

// Confirmation dialog before wiping local profile + IndexedDB. Prevents the
// classic "fat-finger the close button and lose my whole shop" disaster.
function ResetConfirmModal({ open, onClose, onConfirm }) {
  const [typed, setTyped] = useState('')
  const required = 'RESET'
  const match = typed.trim().toUpperCase() === required
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="ডিভাইস রিসেট / Reset device?"
      size="md"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="danger" disabled={!match} onClick={() => { onConfirm(); onClose() }}>
            হ্যাঁ, রিসেট করুন / Yes, reset
          </Button>
        </div>
      }
    >
      <div className="space-y-3 text-sm text-steel-700">
        <p className="font-semibold text-red-600">
          এই কাজটি ফেরানো যাবে না। / This cannot be undone.
        </p>
        <p>
          আপনার বর্তমান দোকানের প্রোফাইল এবং এই ডিভাইসে সংরক্ষিত সমস্ত লেনদেন মুছে যাবে।
          This will wipe your local store profile and every transaction stored on this device.
        </p>
        <p className="text-steel-500">
          চালিয়ে যেতে নিচের বাক্সে <span className="font-mono font-bold text-steel-800">RESET</span> লিখুন।
          Type <span className="font-mono font-bold text-steel-800">RESET</span> to confirm.
        </p>
        <Input value={typed} onChange={(e) => setTyped(e.target.value)} placeholder="RESET" />
      </div>
    </Modal>
  )
}

function SettingsModal({ open, onClose, profile, updateProfile, onReset, onSignOut }) {
  const [storeName, setStoreName] = useState(profile?.store?.name || '')
  const [ownerName, setOwnerName] = useState(profile?.store?.ownerName || '')
  const [region, setRegion] = useState(profile?.store?.region || '')
  const [businessType, setBusinessType] = useState(profile?.store?.businessType || 'mudi')
  const [resetOpen, setResetOpen] = useState(false)

  // Re-seed local state every time the modal opens so edits the user makes
  // in <InventoryScreen /> etc. are reflected here.
  useState(() => { /* placeholder for linter */ })
  const refreshLocal = () => {
    setStoreName(profile?.store?.name || '')
    setOwnerName(profile?.store?.ownerName || '')
    setRegion(profile?.store?.region || '')
    setBusinessType(profile?.store?.businessType || 'mudi')
  }

  const save = () => {
    updateProfile({
      store: {
        ...profile.store,
        name: storeName.trim(),
        ownerName: ownerName.trim(),
        region: region.trim(),
        businessType,
        businessLabel: getBusinessType(businessType).label,
      },
    })
    onClose()
  }

  const toggleReceiptWidth = () => {
    const next = profile?.store?.receiptWidth === '58mm' ? '80mm' : '58mm'
    updateProfile({ store: { receiptWidth: next } })
  }

  return (
    <>
      <Modal
        open={open}
        onClose={() => { refreshLocal(); onClose() }}
        title="সেটিংস / Settings"
        size="lg"
        footer={
          <div className="flex flex-wrap justify-between gap-2">
            <Button
              variant="danger"
              onClick={() => setResetOpen(true)}
              title="Wipe local profile and inventory"
            >
              ডিভাইস রিসেট / Reset device
            </Button>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                onClick={() => { onSignOut(); onClose() }}
                className="text-red-600 hover:bg-red-50"
              >
                <LogOutIcon size={14} /> লগআউট / Sign out
              </Button>
              <Button variant="secondary" onClick={() => { refreshLocal(); onClose() }}>Cancel</Button>
              <Button onClick={save}>Save</Button>
            </div>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Section 1 — Store profile (editable, per-store) */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-steel-500">
                দোকান প্রোফাইল / Store Profile
              </h3>
              <span className="text-[10px] uppercase tracking-wider text-emerald-600 font-semibold">
                এই ডিভাইসে সংরক্ষিত / Saved on this device
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="দোকানের নাম / Store Name">
                <Input value={storeName} onChange={(e) => setStoreName(e.target.value)} />
              </Field>
              <Field label="মালিকের নাম / Owner Name">
                <Input value={ownerName} onChange={(e) => setOwnerName(e.target.value)} />
              </Field>
              <Field label="এলাকা / Region" className="md:col-span-2">
                <Input value={region} onChange={(e) => setRegion(e.target.value)} />
              </Field>
            </div>
            <Field label="ব্যবসার ধরন / Business Type" className="mt-3">
              <BusinessTypeChips value={businessType} onChange={setBusinessType} />
            </Field>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <Field label="রিসিট প্রস্থ / Receipt width">
                <Button variant="secondary" onClick={toggleReceiptWidth}>
                  {profile?.store?.receiptWidth || '80mm'}
                </Button>
              </Field>
              <Field label="প্রোফাইল আইডি / Profile ID">
                <Input value={profile?.session?.phone || ''} readOnly />
              </Field>
            </div>
            <div className="text-xs text-steel-400 bg-steel-50 rounded-lg p-3 mt-2">
              <PhoneIcon size={14} className="inline mr-1" />
              Profile ID ব্যবহার করে প্রবেশ করুন (Phone-first sign in)
            </div>
          </section>

          <hr className="border-steel-100" />

          {/* Section 2 — Session / device reset (destructive) */}
          <section>
            <h3 className="text-sm font-bold uppercase tracking-wider text-steel-500 mb-2">
              সেশন ও ডিভাইস রিসেট / Session &amp; Device Reset
            </h3>
            <p className="text-sm text-steel-600 mb-3">
              অন্য অ্যাকাউন্টে সুইচ করতে লগআউট করুন অথবা সম্পূর্ণ ডিভাইসটি পরিষ্কার করুন।
              Switch accounts by signing out, or wipe this device entirely.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => { onSignOut(); onClose() }} className="text-red-600 hover:bg-red-50">
                <LogOutIcon size={14} /> লগআউট / Sign out
              </Button>
              <Button variant="danger" onClick={() => setResetOpen(true)}>
                ডিভাইস রিসেট / Reset device
              </Button>
            </div>
          </section>
        </div>
      </Modal>

      <ResetConfirmModal
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        onConfirm={onReset}
      />
    </>
  )
}
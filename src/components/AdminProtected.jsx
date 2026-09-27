import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AdminProtected({ children }) {
  const { user, loading, signOut } = useAuth()
  const navigate = useNavigate()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />
  }

  if (!user.isAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  const logout = async () => {
    await signOut()
    navigate('/', { replace: true })
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
        <p className="text-sm font-bold text-slate-800">দোকানভাই অ্যাডমিন / Admin</p>
        <button
          type="button"
          onClick={logout}
          className="inline-flex min-h-[44px] items-center rounded-xl border border-slate-200 px-4 text-sm font-semibold text-red-600 hover:bg-red-50"
        >
          লগআউট / Log out
        </button>
      </header>
      {children}
    </div>
  )
}

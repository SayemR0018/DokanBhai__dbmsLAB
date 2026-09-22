import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { useProfile } from './context/ProfileContext'
import data from './lib/data'
import AppShell from './components/AppShell'
import AdminProtected from './components/AdminProtected'
import OnboardingModal from './components/OnboardingModal'
import PhoneGateScreen from './components/PhoneGateScreen'
import { Spinner } from './components/ui'

import DashboardScreen from './pages/DashboardScreen'
import InventoryScreen from './pages/InventoryScreen'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminShops from './pages/admin/AdminShops'
import AdminProducts from './pages/admin/AdminProducts'
import AdminReports from './pages/admin/AdminReports'
import CategoriesScreen from './pages/CategoriesScreen'
import VendorsScreen from './pages/VendorsScreen'
import NewSaleScreen from './pages/NewSaleScreen'
import SalesScreen from './pages/SalesScreen'
import CustomersScreen from './pages/CustomersScreen'
import HisabScreen from './pages/HisabScreen'

function Protected({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-steel-400">
        <Spinner size={32} />
      </div>
    )
  }
  if (!user) {
    // Not signed in — route to /login. `state.from` lets PhoneGateScreen
    // (or future deep-link flows) know where the user was trying to go.
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  return <AppShell>{children}</AppShell>
}

function LoginRoute() {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-steel-400">
        <Spinner size={32} />
      </div>
    )
  }
  // Already signed in — skip the gate and go straight to the dashboard.
  if (user) return <Navigate to="/dashboard" replace />
  return <PhoneGateScreen />
}

export default function App() {
  const { profile, complete, setProfile: setProfileCtx } = useProfile()

  // First launch: block on onboarding modal until profile is complete.
  if (!profile || !complete) {
    return (
      <>
        {/* Background shell behind the modal */}
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 via-white to-steel-50" />
        <OnboardingModal
          onComplete={(payload) => {
            // Update context + seed the vertical catalog via data.setProfile.
            // setProfileCtx synchronously flips `complete` so the <Routes />
            // tree renders immediately without waiting for the storage event.
            setProfileCtx(payload)
            data.setProfile(payload)
          }}
        />
      </>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginRoute />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<Protected><DashboardScreen /></Protected>} />
      <Route path="/admin/dashboard" element={  
        <AdminProtected>
      <AdminDashboard />
    </AdminProtected>} />
    <Route
  path="/admin/shops"
  element={
    <AdminProtected>
      <AdminShops />
    </AdminProtected>
  }
/>

<Route
  path="/admin/products"
  element={
    <AdminProtected>
      <AdminProducts />
    </AdminProtected>
  }
/>

<Route
  path="/admin/reports"
  element={
    <AdminProtected>
      <AdminReports />
    </AdminProtected>
  }
/>
      <Route path="/pos" element={<Protected><NewSaleScreen /></Protected>} />
      <Route path="/inventory" element={<Protected><InventoryScreen /></Protected>} />
      <Route path="/sales" element={<Protected><SalesScreen /></Protected>} />
      <Route path="/customers" element={<Protected><CustomersScreen /></Protected>} />
      <Route path="/hisab" element={<Protected><HisabScreen /></Protected>} />
      <Route path="/vendors" element={<Protected><VendorsScreen /></Protected>} />
      <Route path="/categories" element={<Protected><CategoriesScreen /></Protected>} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
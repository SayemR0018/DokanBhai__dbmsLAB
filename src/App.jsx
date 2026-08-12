import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { useProfile } from './context/ProfileContext'
import data from './lib/data'
import AppShell from './components/AppShell'
import OnboardingModal from './components/OnboardingModal'
import PhoneGateScreen from './components/PhoneGateScreen'
import { Spinner } from './components/ui'

import DashboardScreen from './pages/DashboardScreen'
import InventoryScreen from './pages/InventoryScreen'
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
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  return <AppShell>{children}</AppShell>
}

export default function App() {
  const { profile, complete } = useProfile()

  // First launch: block on onboarding modal until profile is complete.
  if (!profile || !complete) {
    return (
      <>
        {/* Background shell behind the modal */}
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 via-white to-steel-50" />
        <OnboardingModal
          onComplete={(payload) => {
            // Set profile + seed the vertical catalog via data.setProfile.
            data.setProfile(payload)
          }}
        />
      </>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={<PhoneGateScreen />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<Protected><DashboardScreen /></Protected>} />
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
// AuthScreen is now a thin wrapper around PhoneGateScreen — kept as the
// /login route so existing navigation links continue to work.

import PhoneGateScreen from '../components/PhoneGateScreen'

export default function AuthScreen() {
  return <PhoneGateScreen />
}
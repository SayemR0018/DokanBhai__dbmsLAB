// ProfileContext — synchronously loads dokan_profile at module init so the
// onboarding modal can render without a flicker on first launch.

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { getProfile, isProfileComplete, setProfile as setProfileRaw, updateProfile as updateProfileRaw, clearProfile as clearProfileRaw } from '../lib/dokanProfile'

const ProfileContext = createContext(null)

export function ProfileProvider({ children }) {
  // Read synchronously so we don't paint the wrong screen first.
  const [profile, setProfileState] = useState(() => getProfile())

  useEffect(() => {
    const handler = () => setProfileState(getProfile())
    window.addEventListener('dokanbhai:profilechange', handler)
    return () => window.removeEventListener('dokanbhai:profilechange', handler)
  }, [])

  const setProfile = useCallback((data) => {
    const next = setProfileRaw(data)
    setProfileState(next)
    return next
  }, [])

  const updateProfile = useCallback((patch) => {
    const next = updateProfileRaw(patch)
    if (next) setProfileState(next)
    return next
  }, [])

  const clearProfile = useCallback(() => {
    clearProfileRaw()
    setProfileState(null)
  }, [])

  const complete = isProfileComplete(profile)

  return (
    <ProfileContext.Provider value={{ profile, complete, setProfile, updateProfile, clearProfile }}>
      {children}
    </ProfileContext.Provider>
  )
}

export const useProfile = () => {
  const ctx = useContext(ProfileContext)
  if (!ctx) throw new Error('useProfile must be used inside ProfileProvider')
  return ctx
}
'use client'

import { useState, useEffect, useCallback } from 'react'
import { loadProfile, saveProfile } from '@/lib/profile'
import { debounce } from '@/lib/utils'
import type { UserProfile } from '@/types'

/**
 * React hook for accessing and updating the user's behavioral profile.
 * Provides a reactive interface to localStorage-backed profile data.
 */
export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load on mount (client-side only)
  useEffect(() => {
    const p = loadProfile()
    setProfile(p)
    setIsLoaded(true)
  }, [])

  // Debounced save to avoid excessive localStorage writes
  const debouncedSave = useCallback(
    debounce((p: UserProfile) => {
      saveProfile(p)
    }, 300),
    []
  )

  function updateProfile(updates: Partial<UserProfile>) {
    if (!profile) return
    const updated = { ...profile, ...updates, updatedAt: new Date().toISOString() }
    setProfile(updated)
    debouncedSave(updated as UserProfile)
  }

  function resetProfile() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('luna_profile')
      localStorage.removeItem('luna_uuid')
    }
    const fresh = loadProfile()
    setProfile(fresh)
  }

  return {
    profile,
    isLoaded,
    updateProfile,
    resetProfile,
  }
}

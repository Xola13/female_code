'use client'

// ============================================================
// ProfileTracker — Invisible behavioral tracking component
// Records time-on-page, scroll depth, and image zooms to build
// the user's Interest Vector passively as they browse.
// ============================================================

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { loadProfile, saveProfile, recordProductView } from '@/lib/profile'
import { trackPageView } from '@/lib/analytics'
import type { Product } from '@/types'

/**
 * Root-level tracker — mounted in layout.
 * Tracks page views and session start.
 */
export function ProfileTracker() {
  const pathname = usePathname()

  useEffect(() => {
    // Ensure UUID exists on first visit
    loadProfile()
    trackPageView(pathname)
  }, [pathname])

  return null // This component renders nothing
}

/**
 * Product-level tracker — mounted on product detail pages.
 * Records time spent, scroll depth, and image zoom intent.
 */
interface ProductViewTrackerProps {
  product: Product
}

export function ProductViewTracker({ product }: ProductViewTrackerProps) {
  const startTimeRef = useRef<number>(Date.now())
  const maxScrollDepthRef = useRef<number>(0)
  const imageZoomedRef = useRef<boolean>(false)
  const savedRef = useRef<boolean>(false)

  // Track scroll depth
  useEffect(() => {
    function handleScroll() {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      if (docHeight > 0) {
        const depth = Math.round((scrollTop / docHeight) * 100)
        maxScrollDepthRef.current = Math.max(maxScrollDepthRef.current, depth)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Detect image zoom (pointer events on product images)
  useEffect(() => {
    function handleImageInteraction(e: Event) {
      const target = e.target as HTMLElement
      if (target.tagName === 'IMG') {
        imageZoomedRef.current = true
      }
    }

    // Dblclick = zoom intent
    document.addEventListener('dblclick', handleImageInteraction)
    // Pinch zoom on mobile (touchstart with multiple points)
    document.addEventListener('touchstart', (e) => {
      if (e.touches.length > 1) imageZoomedRef.current = true
    })

    return () => {
      document.removeEventListener('dblclick', handleImageInteraction)
    }
  }, [])

  // Save view signal on unmount (when user navigates away)
  useEffect(() => {
    return () => {
      if (savedRef.current) return
      savedRef.current = true

      const timeSpentMs = Date.now() - startTimeRef.current

      try {
        const profile = loadProfile()
        const updatedProfile = recordProductView(
          profile,
          product,
          timeSpentMs,
          maxScrollDepthRef.current,
          imageZoomedRef.current
        )
        saveProfile(updatedProfile)
      } catch {
        // Silently ignore — tracking should never break UX
      }
    }
  }, [product])

  // Also save on page visibility change (user switches tabs)
  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === 'hidden' && !savedRef.current) {
        savedRef.current = true
        const timeSpentMs = Date.now() - startTimeRef.current

        try {
          const profile = loadProfile()
          const updatedProfile = recordProductView(
            profile,
            product,
            timeSpentMs,
            maxScrollDepthRef.current,
            imageZoomedRef.current
          )
          saveProfile(updatedProfile)
        } catch {
          // Silently ignore
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [product])

  return null // Invisible component
}

'use client'

import { useCallback } from 'react'
import { track, trackAffiliateClick, trackProductView } from '@/lib/analytics'
import type { Product } from '@/types'

/**
 * Hook exposing analytics tracking functions.
 * Use this in components that need to track events.
 */
export function useAnalytics() {
  const trackClick = useCallback((product: Product, source: string = 'unknown') => {
    trackAffiliateClick(product, source)
  }, [])

  const trackView = useCallback((product: Product) => {
    trackProductView(product)
  }, [])

  const trackEvent = useCallback(
    (type: Parameters<typeof track>[0], data?: Parameters<typeof track>[1]) => {
      track(type, data)
    },
    []
  )

  return { trackClick, trackView, trackEvent }
}

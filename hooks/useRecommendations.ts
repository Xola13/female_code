'use client'

import { useState, useEffect } from 'react'
import { loadProfile, isProfileReady } from '@/lib/profile'
import { scoreProductsForProfile } from '@/lib/utils'
import { PRODUCTS } from '@/lib/products'
import type { Product, UserProfile } from '@/types'

interface UseRecommendationsOptions {
  count?: number
  excludeIds?: string[]
  useAI?: boolean   // Whether to call the AI endpoint (slower but smarter)
}

interface RecommendationState {
  products: Product[]
  reason: string
  isLoading: boolean
  error: string | null
  isPersonalized: boolean
}

/**
 * Hook for getting personalized product recommendations.
 * Uses local scoring by default (instant) with optional AI endpoint.
 */
export function useRecommendations({
  count = 6,
  excludeIds = [],
  useAI = false,
}: UseRecommendationsOptions = {}): RecommendationState & { refresh: () => void } {
  const [state, setState] = useState<RecommendationState>({
    products: [],
    reason: '',
    isLoading: true,
    error: null,
    isPersonalized: false,
  })

  function load() {
    setState((s) => ({ ...s, isLoading: true, error: null }))

    try {
      const profile = loadProfile()
      const ready = isProfileReady(profile)

      if (!ready) {
        // Not enough data — return featured products
        const featured = PRODUCTS.filter((p) => p.isFeatured && !excludeIds.includes(p.id)).slice(0, count)
        setState({
          products: featured,
          reason: "Explore our most-loved luxury picks:",
          isLoading: false,
          error: null,
          isPersonalized: false,
        })
        return
      }

      // Local scoring (fast)
      const scored = scoreProductsForProfile(
        PRODUCTS.filter((p) => !excludeIds.includes(p.id)),
        profile
      ).slice(0, count)

      const topCategory = profile.categoryWeights.sort((a, b) => b.weight - a.weight)[0]
      const reason = topCategory
        ? `Based on your interest in ${topCategory.category}:`
        : "Based on your browsing:"

      setState({
        products: scored,
        reason,
        isLoading: false,
        error: null,
        isPersonalized: true,
      })

      // Optionally enhance with AI
      if (useAI) {
        fetchAIRecommendations(profile, count, excludeIds)
      }
    } catch (err) {
      setState((s) => ({
        ...s,
        isLoading: false,
        error: 'Failed to load recommendations',
        products: PRODUCTS.filter((p) => p.isBestseller).slice(0, count),
      }))
    }
  }

  async function fetchAIRecommendations(
    profile: UserProfile,
    count: number,
    excludeIds: string[]
  ) {
    try {
      const res = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, type: 'recommendations', count, excludeIds }),
      })
      if (!res.ok) return
      const data = await res.json()
      if (data.recommendation) {
        setState((s) => ({
          ...s,
          products: data.recommendation.products,
          reason: data.recommendation.reason,
          isPersonalized: true,
        }))
      }
    } catch {
      // Fail silently — local recommendations are already shown
    }
  }

  useEffect(() => {
    load()
  }, [])

  return { ...state, refresh: load }
}

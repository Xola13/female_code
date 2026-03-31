// ============================================================
// Luna Beauty — User Profile Management
// Passive behavioral profiling without asking a single question
// ============================================================

import { generateUUID, mergeWeights } from '@/lib/utils'
import type {
  UserProfile,
  CategoryWeight,
  ProductAffinity,
  Product,
  QuizAnswers,
} from '@/types'
import { computeAffinityScore } from '@/lib/analytics'

// ── Storage Keys ──────────────────────────────────────────────

const STORAGE_KEY = 'luna_profile'
const UUID_KEY = 'luna_uuid'

// ── Default Profile ───────────────────────────────────────────

function createDefaultProfile(uuid: string): UserProfile {
  return {
    uuid,
    cloudSyncConsent: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    categoryWeights: [],
    productAffinities: [],
    priceRangeMin: 10,
    priceRangeMax: 200,
    topTags: [],
    topBrands: [],
  }
}

// ── LocalStorage Persistence ──────────────────────────────────

/**
 * Load the user profile from localStorage.
 * Creates a new anonymous profile on first visit.
 * Always safe to call — returns a valid profile even if storage fails.
 */
export function loadProfile(): UserProfile {
  if (typeof window === 'undefined') {
    // SSR: return a blank profile — will be hydrated client-side
    return createDefaultProfile('ssr')
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as UserProfile
      // Validate essential fields exist
      if (parsed.uuid && parsed.categoryWeights) {
        return parsed
      }
    }
  } catch {
    // Corrupted storage — start fresh
  }

  // First visit or corrupted data: create new anonymous profile
  const uuid = getOrCreateUUID()
  const profile = createDefaultProfile(uuid)
  saveProfile(profile)
  return profile
}

/**
 * Persist profile to localStorage (debounced externally for performance).
 */
export function saveProfile(profile: UserProfile): void {
  if (typeof window === 'undefined') return
  try {
    const updated = { ...profile, updatedAt: new Date().toISOString() }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    localStorage.setItem(UUID_KEY, updated.uuid)
  } catch {
    // QuotaExceededError or similar — silently ignore
  }
}

/**
 * Get or create the persistent anonymous UUID.
 */
export function getOrCreateUUID(): string {
  if (typeof window === 'undefined') return 'ssr'
  const existing = localStorage.getItem(UUID_KEY)
  if (existing) return existing
  const uuid = generateUUID()
  localStorage.setItem(UUID_KEY, uuid)
  return uuid
}

// ── Behavioral Signal Processing ──────────────────────────────

/**
 * Record a product view and update the user's Interest Vector.
 * Called automatically by the ProfileTracker component.
 *
 * @param profile - Current profile
 * @param product - The product being viewed
 * @param timeSpentMs - Time on page in milliseconds
 * @param scrollDepthPct - How far user scrolled (0–100)
 * @param imageZoomed - Whether user zoomed into an image
 */
export function recordProductView(
  profile: UserProfile,
  product: Product,
  timeSpentMs: number,
  scrollDepthPct: number,
  imageZoomed: boolean
): UserProfile {
  // Only record meaningful views (>3 seconds)
  if (timeSpentMs < 3000) return profile

  const affinityScore = computeAffinityScore({
    productId: product.id,
    timeSpentMs,
    scrollDepthPct,
    imageZoomed,
  })

  // Update product affinities
  const existingAffinity = profile.productAffinities.find(
    (a) => a.productId === product.id
  )

  let updatedAffinities: ProductAffinity[]
  if (existingAffinity) {
    // Merge: accumulate score but cap to prevent over-weighting
    updatedAffinities = profile.productAffinities.map((a) =>
      a.productId === product.id
        ? {
            ...a,
            score: Math.min(100, a.score + affinityScore * 0.5),
            viewCount: a.viewCount + 1,
            lastViewed: new Date().toISOString(),
          }
        : a
    )
  } else {
    updatedAffinities = [
      ...profile.productAffinities,
      {
        productId: product.id,
        score: affinityScore,
        viewCount: 1,
        lastViewed: new Date().toISOString(),
      },
    ].slice(-50) // Keep most recent 50
  }

  // Update category weights based on this view
  const categorySignal: CategoryWeight[] = [
    {
      category: product.category,
      weight:
        timeSpentMs > 30000
          ? 0.15 // Strong signal: >30s view
          : timeSpentMs > 10000
          ? 0.08 // Medium signal: >10s view
          : 0.03, // Weak signal: quick look
    },
  ]
  const updatedWeights = mergeWeights(profile.categoryWeights, categorySignal)

  // Update price range (rolling average)
  const allPrices = updatedAffinities
    .slice(-10)
    .map((a) => {
      // We don't have price here, so use product's price for current view
      return a.productId === product.id ? product.price : null
    })
    .filter((p): p is number => p !== null)

  const avgPrice = allPrices.length > 0
    ? allPrices.reduce((a, b) => a + b, 0) / allPrices.length
    : product.price

  // Update top brands (most viewed)
  const brandSet = new Set(profile.topBrands)
  brandSet.add(product.brand)
  const updatedBrands = [...brandSet].slice(-10)

  // Update top tags
  const tagSet = new Set(profile.topTags)
  product.tags.forEach((t) => tagSet.add(t))
  const updatedTags = [...tagSet].slice(-20)

  return {
    ...profile,
    categoryWeights: updatedWeights,
    productAffinities: updatedAffinities,
    priceRangeMin: Math.max(0, avgPrice * 0.4),
    priceRangeMax: avgPrice * 2.5,
    topBrands: updatedBrands,
    topTags: updatedTags,
    updatedAt: new Date().toISOString(),
  }
}

// ── Quiz Integration ──────────────────────────────────────────

/**
 * Process quiz answers and seed the profile with initial signals.
 * After the quiz, the profile has meaningful data from the first second.
 */
export function applyQuizAnswers(
  profile: UserProfile,
  answers: QuizAnswers,
  quizConfig: Array<{
    questionId: string
    optionId: string
    signals: {
      categories?: import('@/types').ProductCategory[]
      tags?: string[]
      priceMin?: number
      priceMax?: number
    }
  }>
): UserProfile {
  let updatedProfile = { ...profile, quizAnswers: answers }

  const allSignaledCategories: CategoryWeight[] = []
  const allTags: string[] = []
  let priceMin = 0
  let priceMax = 200

  for (const { signals } of quizConfig) {
    // Categories
    if (signals.categories) {
      for (const cat of signals.categories) {
        allSignaledCategories.push({ category: cat, weight: 0.4 })
      }
    }
    // Tags
    if (signals.tags) {
      allTags.push(...signals.tags)
    }
    // Price range
    if (signals.priceMin !== undefined) priceMin = Math.max(priceMin, signals.priceMin)
    if (signals.priceMax !== undefined) priceMax = Math.min(priceMax, signals.priceMax)
  }

  updatedProfile.categoryWeights = mergeWeights(
    updatedProfile.categoryWeights,
    allSignaledCategories
  )
  updatedProfile.topTags = [...new Set([...updatedProfile.topTags, ...allTags])].slice(-30)
  if (priceMin > 0) updatedProfile.priceRangeMin = priceMin
  if (priceMax < 200) updatedProfile.priceRangeMax = priceMax

  return updatedProfile
}

// ── Cloud Sync ────────────────────────────────────────────────

/**
 * Sync profile to Supabase (anonymous, consent-gated).
 * Called after user enables the toggle.
 */
export async function syncProfileToCloud(profile: UserProfile): Promise<void> {
  if (!profile.cloudSyncConsent) return

  try {
    await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile }),
    })
  } catch {
    // Silently fail — UX must not break
  }
}

/**
 * Derive the top interest categories as a readable label.
 * Used in AI prompts and UI copy.
 */
export function getTopInterestLabel(profile: UserProfile): string {
  const top = profile.categoryWeights
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 2)
  if (top.length === 0) return 'beauty explorer'
  return top.map((c) => c.category).join(' & ') + ' lover'
}

/**
 * Check if the profile has enough data to make meaningful recommendations.
 */
export function isProfileReady(profile: UserProfile): boolean {
  return (
    profile.categoryWeights.length > 0 ||
    profile.productAffinities.length > 0 ||
    !!profile.quizAnswers
  )
}

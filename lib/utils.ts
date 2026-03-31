import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Product, UserProfile, CategoryWeight } from '@/types'

// ── Tailwind class merger ─────────────────────────────────────

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ── Formatting helpers ────────────────────────────────────────

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price)
}

export function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return n.toString()
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// ── Affiliate URL builder ─────────────────────────────────────

export function buildAffiliateUrl(baseUrl: string, tag?: string): string {
  const amazonTag = tag ?? process.env.NEXT_PUBLIC_AMAZON_TAG ?? 'lunabeauty-20'
  // If already has a tag param, replace it
  const url = new URL(baseUrl)
  url.searchParams.set('tag', amazonTag)
  return url.toString()
}

// ── UUID generation (client-safe) ────────────────────────────

export function generateUUID(): string {
  // Use crypto.randomUUID when available (modern browsers + Node 14+)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // Fallback for older environments
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// ── Debounce ──────────────────────────────────────────────────

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  ms: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), ms)
  }
}

// ── Profile helpers ───────────────────────────────────────────

/**
 * Converts a UserProfile into a concise text summary for injecting
 * into Claude prompts. Keeps the prompt focused and not too long.
 */
export function profileToPromptContext(profile: UserProfile): string {
  const topCategories = profile.categoryWeights
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 4)
    .map((c) => `${c.category} (${Math.round(c.weight * 100)}%)`)
    .join(', ')

  const topBrands = profile.topBrands.slice(0, 4).join(', ')
  const topTags = profile.topTags.slice(0, 6).join(', ')
  const priceRange = `$${profile.priceRangeMin}–$${profile.priceRangeMax}`

  const recentViews = profile.productAffinities
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((a) => `product:${a.productId}(score:${a.score.toFixed(1)})`)
    .join(', ')

  const quizSummary = profile.quizAnswers
    ? `Quiz taken: ${Object.keys(profile.quizAnswers).length} questions answered`
    : 'Quiz not yet taken'

  return [
    `[User Behavioral Profile — Anonymous UUID: ${profile.uuid.slice(0, 8)}...]`,
    `Top interests: ${topCategories || 'none yet'}`,
    `Favourite brands: ${topBrands || 'exploring'}`,
    `Key beauty concerns/tags: ${topTags || 'discovering'}`,
    `Price comfort zone: ${priceRange}`,
    `High-affinity products: ${recentViews || 'none yet'}`,
    quizSummary,
    profile.interestSummary ? `AI insight: ${profile.interestSummary}` : '',
  ]
    .filter(Boolean)
    .join('\n')
}

/**
 * Returns products sorted by how well they match the user's profile,
 * using a simple weighted scoring system as a client-side fallback
 * when Supabase pgvector is unavailable.
 */
export function scoreProductsForProfile(
  products: Product[],
  profile: UserProfile
): Array<Product & { matchScore: number }> {
  const categoryMap = new Map(
    profile.categoryWeights.map((c) => [c.category, c.weight])
  )
  const brandBoost = new Set(profile.topBrands)
  const tagBoost = new Set(profile.topTags)
  const affinityMap = new Map(
    profile.productAffinities.map((a) => [a.productId, a.score])
  )

  return products
    .map((p) => {
      let score = 0

      // Category match
      score += (categoryMap.get(p.category) ?? 0) * 40

      // Brand match
      if (brandBoost.has(p.brand)) score += 20

      // Tag overlap
      const tagOverlap = p.tags.filter((t) => tagBoost.has(t)).length
      score += tagOverlap * 8

      // Direct affinity (user viewed this product)
      score += (affinityMap.get(p.id) ?? 0) * 5

      // Price range preference
      const inRange =
        p.price >= profile.priceRangeMin && p.price <= profile.priceRangeMax
      if (inRange) score += 10

      // Bestseller bump
      if (p.isBestseller) score += 5

      return { ...p, matchScore: score }
    })
    .sort((a, b) => b.matchScore - a.matchScore)
}

/**
 * Merge updated category weights into existing profile weights.
 * Decays old weights slightly to prevent over-indexing on old data.
 */
export function mergeWeights(
  existing: CategoryWeight[],
  updates: CategoryWeight[]
): CategoryWeight[] {
  const map = new Map(existing.map((c) => [c.category, c.weight * 0.95]))

  for (const update of updates) {
    const current = map.get(update.category) ?? 0
    map.set(update.category, Math.min(1, current + update.weight))
  }

  return Array.from(map.entries()).map(([category, weight]) => ({
    category: category as CategoryWeight['category'],
    weight,
  }))
}

// ── Star rating renderer ──────────────────────────────────────

export function getRatingStars(rating: number): string {
  const full = Math.floor(rating)
  const half = rating % 1 >= 0.5 ? 1 : 0
  const empty = 5 - full - half
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty)
}

// ── Truncate text ─────────────────────────────────────────────

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trimEnd() + '…'
}

// ── Slugify ───────────────────────────────────────────────────

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

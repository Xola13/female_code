// ============================================================
// Luna Beauty — Client-Side Analytics
// Tracks affiliate clicks and engagement for revenue insights
// ============================================================

import type { TrackingEvent, Product } from '@/types'

// ── Session Management ────────────────────────────────────────

let _sessionId: string | null = null

export function getSessionId(): string {
  if (_sessionId) return _sessionId

  if (typeof window === 'undefined') return 'ssr'

  const stored = sessionStorage.getItem('luna_session')
  if (stored) {
    _sessionId = stored
    return _sessionId
  }

  // Generate new session ID
  _sessionId = `s_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  sessionStorage.setItem('luna_session', _sessionId)
  return _sessionId
}

// ── Event Queue ───────────────────────────────────────────────

// Buffer events in memory and flush in batches to reduce API calls
let _eventQueue: TrackingEvent[] = []
let _flushTimer: ReturnType<typeof setTimeout> | null = null

function scheduleFlush() {
  if (_flushTimer) return
  _flushTimer = setTimeout(() => {
    _flushTimer = null
    flushEvents()
  }, 2000) // Flush after 2s of inactivity
}

async function flushEvents() {
  if (_eventQueue.length === 0) return
  const events = [..._eventQueue]
  _eventQueue = []

  try {
    await fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events }),
      // Don't wait for analytics — fire and forget
      keepalive: true,
    })
  } catch {
    // Silently fail — analytics should never break UX
  }
}

// ── Track Helpers ─────────────────────────────────────────────

function getUserUuid(): string {
  if (typeof window === 'undefined') return 'ssr'
  return localStorage.getItem('luna_uuid') ?? 'anonymous'
}

/**
 * Track any Luna event. Batched and sent asynchronously.
 */
export function track(
  type: TrackingEvent['type'],
  data: Partial<TrackingEvent> = {}
): void {
  if (typeof window === 'undefined') return

  const event: TrackingEvent = {
    type,
    userUuid: getUserUuid(),
    sessionId: getSessionId(),
    timestamp: new Date().toISOString(),
    ...data,
  }

  _eventQueue.push(event)
  scheduleFlush()
}

// ── Specific Track Functions ──────────────────────────────────

export function trackProductView(product: Product): void {
  track('product_view', {
    productId: product.id,
    category: product.category,
    data: {
      brand: product.brand,
      price: product.price,
    },
  })
}

/**
 * Track affiliate link click — the main revenue event.
 * This is the most important event to track for ROI analysis.
 */
export function trackAffiliateClick(product: Product, source: string = 'unknown'): void {
  track('affiliate_click', {
    productId: product.id,
    category: product.category,
    data: {
      brand: product.brand,
      price: product.price,
      affiliateUrl: product.affiliateUrl,
      source, // e.g. 'product-card', 'chat', 'recommendation', 'bundle'
    },
  })

  // Also track with Vercel Analytics if available
  if (typeof window !== 'undefined' && (window as unknown as { va?: (e: string, d: Record<string, unknown>) => void }).va) {
    ;(window as unknown as { va: (e: string, d: Record<string, unknown>) => void }).va('event', {
      name: 'affiliate_click',
      productId: product.id,
      brand: product.brand,
      price: product.price,
    })
  }
}

export function trackPageView(path: string): void {
  track('page_view', { data: { path } })
}

export function trackChatMessage(role: 'user' | 'assistant'): void {
  track('chat_message', { data: { role } })
}

export function trackQuizComplete(answersCount: number): void {
  track('quiz_complete', { data: { answersCount } })
}

// ── View Signal (behavioral profiling) ───────────────────────

interface ViewSignalData {
  productId: string
  timeSpentMs: number
  scrollDepthPct: number
  imageZoomed: boolean
}

/**
 * Compute a composite "affinity score" from a view signal.
 * Used to build the user's Interest Vector.
 */
export function computeAffinityScore(signal: ViewSignalData): number {
  let score = 0

  // Time: 0–60s → 0–20 points, >60s → 20 points max
  score += Math.min(20, (signal.timeSpentMs / 1000) * (20 / 60))

  // Scroll depth: 0–100% → 0–10 points
  score += (signal.scrollDepthPct / 100) * 10

  // Image zoom = strong intent signal → +15 points
  if (signal.imageZoomed) score += 15

  return parseFloat(score.toFixed(2))
}

// Flush remaining events on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', () => {
    if (_eventQueue.length > 0) {
      flushEvents()
    }
  })
}

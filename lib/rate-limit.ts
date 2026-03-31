// ============================================================
// Luna Beauty — In-Memory Rate Limiter
// Protects AI endpoints from abuse without external services
// ============================================================

interface RateLimitEntry {
  count: number
  resetAt: number
}

// In-memory store (resets on cold starts — acceptable for edge)
const store = new Map<string, RateLimitEntry>()

// Clean up expired entries every 5 minutes to prevent memory leaks
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of store.entries()) {
      if (entry.resetAt < now) {
        store.delete(key)
      }
    }
  }, 5 * 60 * 1000)
}

interface RateLimitConfig {
  max: number        // Max requests per window
  windowMs: number   // Window duration in milliseconds
}

interface RateLimitResult {
  success: boolean
  remaining: number
  resetAt: number
  retryAfterMs: number
}

/**
 * Check rate limit for a given identifier (IP or user UUID).
 * Returns a result object — never throws.
 *
 * @param identifier - The key to rate limit (e.g. IP address or UUID)
 * @param config - Optional override for max/window (defaults to env vars)
 */
export function checkRateLimit(
  identifier: string,
  config?: Partial<RateLimitConfig>
): RateLimitResult {
  const max = config?.max ?? parseInt(process.env.RATE_LIMIT_MAX ?? '10', 10)
  const windowMs = config?.windowMs ?? parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? '60000', 10)
  const now = Date.now()

  const entry = store.get(identifier)

  // New or expired window — reset
  if (!entry || entry.resetAt < now) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetAt: now + windowMs,
    }
    store.set(identifier, newEntry)
    return {
      success: true,
      remaining: max - 1,
      resetAt: newEntry.resetAt,
      retryAfterMs: 0,
    }
  }

  // Within window — increment
  entry.count += 1
  const remaining = Math.max(0, max - entry.count)
  const success = entry.count <= max

  return {
    success,
    remaining,
    resetAt: entry.resetAt,
    retryAfterMs: success ? 0 : entry.resetAt - now,
  }
}

/**
 * Build rate limit response headers (standard HTTP rate-limit headers).
 */
export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(result.resetAt / 1000).toString(),
    ...(result.retryAfterMs > 0
      ? { 'Retry-After': Math.ceil(result.retryAfterMs / 1000).toString() }
      : {}),
  }
}

/**
 * Extract identifier from a request (prefers X-Forwarded-For, falls back to IP).
 */
export function getIdentifier(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()

  const real = request.headers.get('x-real-ip')
  if (real) return real

  // Last resort — use a shared key (not ideal but prevents crashes)
  return 'shared'
}

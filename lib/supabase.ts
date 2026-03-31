// ============================================================
// Luna Beauty — Supabase Client Setup
// Server-side and client-side clients with proper SSR support
// ============================================================

import { createClient } from '@supabase/supabase-js'
import type { UserProfile, TrackingEvent, ProductRow } from '@/types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// ── Browser / Public Client ───────────────────────────────────
// Safe to use in client components. Uses anon key (RLS enforced).
let _browserClient: ReturnType<typeof createClient> | null = null

export function getSupabaseBrowserClient() {
  if (!_browserClient) {
    _browserClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false, // We use our own anonymous UUID system
      },
    })
  }
  return _browserClient
}

// ── Server / Admin Client ─────────────────────────────────────
// Only use in Server Components, Server Actions, and API routes.
// Uses service role key — bypasses RLS. Handle with care.
export function getSupabaseServerClient() {
  if (!supabaseServiceRoleKey) {
    // Fall back to anon key if service role not configured yet
    return createClient(supabaseUrl, supabaseAnonKey)
  }
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

// ── Profile Operations ────────────────────────────────────────

/**
 * Upsert an anonymous user profile to Supabase.
 * Only called when user has given consent.
 */
export async function upsertProfile(profile: UserProfile): Promise<void> {
  const supabase = getSupabaseServerClient()
  const { error } = await supabase.from('profiles').upsert(
    {
      uuid: profile.uuid,
      profile_data: profile,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'uuid' }
  )
  if (error) {
    console.error('[Supabase] Profile upsert error:', error.message)
  }
}

/**
 * Fetch profile by UUID.
 */
export async function fetchProfile(uuid: string): Promise<UserProfile | null> {
  const supabase = getSupabaseServerClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('profile_data')
    .eq('uuid', uuid)
    .single()

  if (error || !data) return null
  return data.profile_data as UserProfile
}

// ── Event Tracking ────────────────────────────────────────────

/**
 * Log a tracking event for analytics.
 * All events are anonymous — no PII.
 */
export async function logEvent(event: TrackingEvent): Promise<void> {
  const supabase = getSupabaseServerClient()
  const { error } = await supabase.from('events').insert({
    user_uuid: event.userUuid,
    event_type: event.type,
    event_data: {
      productId: event.productId,
      category: event.category,
      sessionId: event.sessionId,
      ...event.data,
    },
  })
  if (error) {
    // Don't throw — event logging should never break the user experience
    console.error('[Supabase] Event log error:', error.message)
  }
}

// ── Product Semantic Search (pgvector) ────────────────────────

/**
 * Perform vector similarity search on products.
 * Requires the pgvector extension enabled in Supabase and
 * products to have pre-computed embeddings.
 *
 * Falls back gracefully if embeddings aren't available.
 */
export async function semanticSearchProducts(
  queryEmbedding: number[],
  limit: number = 8
): Promise<ProductRow[]> {
  const supabase = getSupabaseServerClient()

  // Call the Supabase RPC function (defined in schema.sql)
  const { data, error } = await supabase.rpc('match_products', {
    query_embedding: queryEmbedding,
    match_threshold: 0.5,
    match_count: limit,
  })

  if (error) {
    console.error('[Supabase] Semantic search error:', error.message)
    return []
  }

  return (data ?? []) as ProductRow[]
}

/**
 * Fetch all products from Supabase (for SSR/SSG).
 */
export async function fetchAllProducts(): Promise<ProductRow[]> {
  const supabase = getSupabaseServerClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('is_featured', { ascending: false })

  if (error) {
    console.error('[Supabase] Products fetch error:', error.message)
    return []
  }
  return (data ?? []) as ProductRow[]
}

// ── Analytics ─────────────────────────────────────────────────

export async function fetchAnalyticsSummary() {
  const supabase = getSupabaseServerClient()

  // Total events by type in last 30 days
  const { data: eventCounts } = await supabase
    .from('events')
    .select('event_type')
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

  // Top affiliate clicks
  const { data: affiliateClicks } = await supabase
    .from('events')
    .select('event_data')
    .eq('event_type', 'affiliate_click')
    .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

  return { eventCounts: eventCounts ?? [], affiliateClicks: affiliateClicks ?? [] }
}

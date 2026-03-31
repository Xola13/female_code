// ============================================================
// Luna Beauty — Shared TypeScript Types
// ============================================================

// ── Product Types ────────────────────────────────────────────

export type ProductCategory =
  | 'Foundation'
  | 'Concealer'
  | 'Blush'
  | 'Bronzer'
  | 'Highlighter'
  | 'Eyeshadow'
  | 'Mascara'
  | 'Eyeliner'
  | 'Lipstick'
  | 'Lip Gloss'
  | 'Lip Liner'
  | 'Skincare'
  | 'Serum'
  | 'Moisturizer'
  | 'Cleanser'
  | 'Eye Cream'
  | 'Sunscreen'
  | 'Haircare'
  | 'Hair Treatment'
  | 'Nail Polish'
  | 'Fragrance'
  | 'Primer'
  | 'Setting Spray'
  | 'Setting Powder'
  | 'Brow'

export interface Product {
  id: string
  name: string
  brand: string
  category: ProductCategory
  price: number
  priceDisplay: string        // e.g. "$38.00"
  description: string
  shortDescription: string   // 1–2 sentence hook
  imageUrl: string
  affiliateUrl: string       // Amazon link with ?tag=
  rating: number             // 1–5
  reviewCount: number
  tags: string[]             // e.g. ['hydrating', 'drugstore', 'long-wear']
  isBestseller?: boolean
  isNew?: boolean
  isFeatured?: boolean
  // Pre-computed keyword embedding vector (for pgvector similarity search)
  // Stored as float array; computed from tags + description
  embedding?: number[]
}

// ── User Behavioral Profile ──────────────────────────────────

export interface CategoryWeight {
  category: ProductCategory
  weight: number   // 0–1, higher = stronger interest
}

export interface ProductAffinity {
  productId: string
  score: number    // composite: time * scroll * zoom
  viewCount: number
  lastViewed: string  // ISO timestamp
}

export interface UserProfile {
  uuid: string
  // Consent: has user agreed to anonymous cloud sync?
  cloudSyncConsent: boolean
  // When profile was created
  createdAt: string
  updatedAt: string
  // Category interest weights
  categoryWeights: CategoryWeight[]
  // Per-product affinity signals
  productAffinities: ProductAffinity[]
  // Price range preference (derived from viewed products)
  priceRangeMin: number
  priceRangeMax: number
  // Tags the user keeps gravitating toward
  topTags: string[]
  // Brands user has shown interest in
  topBrands: string[]
  // Quiz result (if taken)
  quizAnswers?: QuizAnswers
  // AI-derived interest summary (updated periodically)
  interestSummary?: string
}

// ── Behavioral Tracking Events ───────────────────────────────

export interface TrackingEvent {
  type: 'product_view' | 'product_click' | 'affiliate_click' | 'quiz_complete' | 'chat_message' | 'page_view'
  userUuid: string
  productId?: string
  category?: ProductCategory
  data?: Record<string, unknown>
  timestamp: string
  sessionId: string
}

export interface ViewSignal {
  productId: string
  timeSpentMs: number    // >30000ms = strong signal
  scrollDepthPct: number // 0–100
  imageZoomed: boolean
  timestamp: string
}

// ── Quiz Types ───────────────────────────────────────────────

export interface QuizQuestion {
  id: string
  text: string
  subtitle?: string
  options: QuizOption[]
}

export interface QuizOption {
  id: string
  label: string
  emoji?: string
  // Which tags/categories this answer signals
  signals: {
    categories?: ProductCategory[]
    tags?: string[]
    priceMin?: number
    priceMax?: number
  }
}

export interface QuizAnswers {
  [questionId: string]: string  // questionId → optionId
}

// ── Chat Types ───────────────────────────────────────────────

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  // Products recommended in this message
  recommendedProducts?: Product[]
}

// ── Recommendation Types ─────────────────────────────────────

export interface Recommendation {
  reason: string           // AI-generated explanation ("Based on your 4 Olaplex views...")
  products: Product[]
  bundleName?: string      // e.g. "Your Hair Repair Ritual"
  bundleDescription?: string
}

// ── Analytics Types (for /admin/analytics) ───────────────────

export interface AnalyticsSummary {
  totalPageViews: number
  totalAffiliateClicks: number
  totalChatMessages: number
  topClickedProducts: Array<{ product: Product; clicks: number }>
  topViewedCategories: Array<{ category: ProductCategory; views: number }>
  conversionRate: number   // affiliate clicks / product views
  last7Days: DayStats[]
}

export interface DayStats {
  date: string
  pageViews: number
  affiliateClicks: number
  chatMessages: number
}

// ── Supabase DB Row Types ────────────────────────────────────

export interface ProfileRow {
  uuid: string
  profile_data: UserProfile
  created_at: string
  updated_at: string
}

export interface EventRow {
  id: string
  user_uuid: string
  event_type: string
  event_data: Record<string, unknown>
  created_at: string
}

export interface ProductRow {
  id: string
  name: string
  brand: string
  category: string
  price: number
  description: string
  short_description: string
  image_url: string
  affiliate_url: string
  rating: number
  review_count: number
  tags: string[]
  is_bestseller: boolean
  is_new: boolean
  is_featured: boolean
  embedding: number[] | null
  created_at: string
}

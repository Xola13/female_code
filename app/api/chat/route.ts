// ============================================================
// Luna Beauty — AI Chat API Route
// Streaming chatbot with tool calling + behavioral profile injection
// ============================================================

import { streamText, tool } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { z } from 'zod'
import { checkRateLimit, getIdentifier, rateLimitHeaders } from '@/lib/rate-limit'
import { buildSystemPrompt } from '@/lib/luna-mind'
import { PRODUCTS, searchProducts, getProductsByCategory } from '@/lib/products'
import type { UserProfile } from '@/types'

export const runtime = 'edge' // Fast streaming at the edge

export async function POST(request: Request) {
  // ── Rate Limiting ──────────────────────────────────────────
  const identifier = getIdentifier(request)
  const rateLimit = checkRateLimit(`chat:${identifier}`, { max: 15, windowMs: 60000 })

  if (!rateLimit.success) {
    return new Response(
      JSON.stringify({
        error: 'Too many requests. Please wait a moment before chatting again.',
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          ...rateLimitHeaders(rateLimit),
        },
      }
    )
  }

  // ── Parse Request ──────────────────────────────────────────
  let body: { messages: Array<{ role: string; content: string }>; profile?: UserProfile }
  try {
    body = await request.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { messages, profile } = body

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return new Response(JSON.stringify({ error: 'Messages required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // ── Build Profile-Aware System Prompt ──────────────────────
  const defaultProfile: UserProfile = {
    uuid: 'anonymous',
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

  const systemPrompt = buildSystemPrompt(profile ?? defaultProfile)

  // ── Tool Definitions ───────────────────────────────────────
  // Luna can use these tools to dynamically query products during a conversation

  const tools = {
    // Search products by query string
    searchProducts: tool({
      description:
        'Search the Luna Beauty product catalog by name, brand, ingredient, or concern (e.g. "damaged hair", "vitamin c serum", "long wear foundation"). Returns matching products with names and affiliate links.',
      parameters: z.object({
        query: z.string().describe('The search query'),
        maxResults: z.number().optional().default(5).describe('Max products to return'),
      }),
      execute: async ({ query, maxResults }) => {
        const results = searchProducts(query).slice(0, maxResults ?? 5)
        if (results.length === 0) {
          return { found: false, message: 'No matching products found for that query.' }
        }
        return {
          found: true,
          products: results.map((p) => ({
            name: p.name,
            brand: p.brand,
            category: p.category,
            price: p.priceDisplay,
            description: p.shortDescription,
            rating: `${p.rating}/5 (${p.reviewCount.toLocaleString()} reviews)`,
            affiliateLink: p.affiliateUrl,
            tags: p.tags.slice(0, 4),
            isBestseller: p.isBestseller ?? false,
          })),
        }
      },
    }),

    // Get products by category
    getProductsByCategory: tool({
      description:
        'Get products from a specific beauty category. Use when user asks about a specific category like "foundations" or "serums".',
      parameters: z.object({
        category: z.string().describe('The product category to fetch'),
        sortBy: z
          .enum(['bestseller', 'price_low', 'price_high', 'rating'])
          .optional()
          .default('bestseller'),
        maxResults: z.number().optional().default(4),
      }),
      execute: async ({ category, sortBy, maxResults }) => {
        let products = getProductsByCategory(category)

        // Sort based on preference
        if (sortBy === 'price_low') products = products.sort((a, b) => a.price - b.price)
        if (sortBy === 'price_high') products = products.sort((a, b) => b.price - a.price)
        if (sortBy === 'rating') products = products.sort((a, b) => b.rating - a.rating)
        if (sortBy === 'bestseller')
          products = products.sort((a, b) => (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0))

        products = products.slice(0, maxResults ?? 4)

        if (products.length === 0) {
          return { found: false, message: `No products found in category: ${category}` }
        }

        return {
          found: true,
          category,
          products: products.map((p) => ({
            name: p.name,
            brand: p.brand,
            price: p.priceDisplay,
            description: p.shortDescription,
            rating: `${p.rating}/5`,
            affiliateLink: p.affiliateUrl,
          })),
        }
      },
    }),

    // Get personalized recommendations based on profile
    getPersonalizedRecommendations: tool({
      description:
        'Get personalized product recommendations based on what the user has been browsing and their preferences. Use when the user asks for recommendations without specifying a specific product.',
      parameters: z.object({
        count: z.number().optional().default(4).describe('Number of products to recommend'),
        focus: z.string().optional().describe('Optional focus area, e.g. "skincare" or "anti-aging"'),
      }),
      execute: async ({ count, focus }) => {
        // Use profile to score products
        const userProfile = profile ?? defaultProfile
        const { scoreProductsForProfile } = await import('@/lib/utils')

        let candidateProducts = focus
          ? PRODUCTS.filter((p) => p.category.toLowerCase().includes(focus.toLowerCase()) ||
              p.tags.some((t) => t.toLowerCase().includes(focus.toLowerCase())))
          : PRODUCTS

        const scored = scoreProductsForProfile(candidateProducts, userProfile)
        const topProducts = scored.slice(0, count ?? 4)

        return {
          count: topProducts.length,
          products: topProducts.map((p) => ({
            name: p.name,
            brand: p.brand,
            price: p.priceDisplay,
            description: p.shortDescription,
            affiliateLink: p.affiliateUrl,
            matchScore: p.matchScore,
            rating: `${p.rating}/5 (${p.reviewCount.toLocaleString()} reviews)`,
          })),
        }
      },
    }),

    // Generate a product bundle
    generateBundle: tool({
      description:
        'Create a curated product bundle (3–4 complementary products) that work together. Use when user asks for a "routine", "kit", or set of products.',
      parameters: z.object({
        theme: z
          .string()
          .describe('The bundle theme, e.g. "nighttime skincare routine" or "everyday glam look"'),
      }),
      execute: async ({ theme }) => {
        const themeProducts = PRODUCTS.filter(
          (p) =>
            p.tags.some((t) => theme.toLowerCase().includes(t.toLowerCase())) ||
            p.category.toLowerCase().includes(theme.toLowerCase())
        )

        const selected = themeProducts.slice(0, 4)

        if (selected.length < 2) {
          // Fallback to bestsellers
          const fallback = PRODUCTS.filter((p) => p.isBestseller).slice(0, 3)
          const totalPrice = fallback.reduce((sum, p) => sum + p.price, 0)
          return {
            bundleName: 'Your Beauty Essentials',
            products: fallback.map((p) => ({
              name: p.name,
              brand: p.brand,
              price: p.priceDisplay,
              affiliateLink: p.affiliateUrl,
            })),
            totalPrice: `$${totalPrice}`,
          }
        }

        const totalPrice = selected.reduce((sum, p) => sum + p.price, 0)

        return {
          bundleName: `Your ${theme.charAt(0).toUpperCase() + theme.slice(1)} Bundle`,
          products: selected.map((p) => ({
            name: p.name,
            brand: p.brand,
            price: p.priceDisplay,
            affiliateLink: p.affiliateUrl,
          })),
          totalPrice: `$${totalPrice}`,
        }
      },
    }),
  }

  // ── Stream Response ────────────────────────────────────────
  try {
    const result = streamText({
      model: anthropic('claude-3-5-sonnet-20241022'),
      system: systemPrompt,
      messages: messages.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      tools,
      maxTokens: 1024,
      temperature: 0.7,
      // Allow multiple tool call rounds
      maxSteps: 3,
    })

    return result.toDataStreamResponse({
      headers: rateLimitHeaders(rateLimit),
    })
  } catch (error) {
    console.error('[Chat API] Stream error:', error)
    return new Response(
      JSON.stringify({
        error: 'Luna is taking a moment to think. Please try again.',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}

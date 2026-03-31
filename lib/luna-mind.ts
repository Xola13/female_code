// ============================================================
// Luna Mind — The AI Core of Luna Beauty
// ============================================================
// This is the brain of the operation. Luna Mind combines:
//   1. Behavioral profiling (passive Interest Vector tracking)
//   2. Hybrid recommendation engine (vector similarity + Claude reasoning)
//   3. Proactive insight generation ("I noticed you've been drawn to...")
//   4. Bundle generation ("Your Secret Obsession Bundle")
//   5. System prompt construction for the Luna AI chatbot
//
// Every interaction is designed to feel like the site "reads your mind"
// — surfacing exactly what the user was secretly searching for.
// ============================================================

import { generateText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { PRODUCTS, searchProducts } from '@/lib/products'
import { scoreProductsForProfile, profileToPromptContext } from '@/lib/utils'
import type { UserProfile, Product, Recommendation } from '@/types'

// ── Model Configuration ───────────────────────────────────────

const LUNA_MODEL = anthropic('claude-3-5-sonnet-20241022')

// ── System Prompt Template ────────────────────────────────────

/**
 * Build the Luna AI system prompt.
 * Injected with the user's behavioral profile so Claude has full context.
 */
export function buildSystemPrompt(profile: UserProfile): string {
  const profileContext = profileToPromptContext(profile)
  const amazonTag = process.env.NEXT_PUBLIC_AMAZON_TAG ?? 'lunabeauty-20'

  return `You are Luna, the AI beauty advisor for Luna Beauty — a premium luxury beauty affiliate store powered by Amazon Associates.

Your personality: Warm, sophisticated, and genuinely knowledgeable about beauty. You sound like a brilliant best friend who happens to be a professional makeup artist and skincare expert. Never use robotic or corporate language. Be conversational, sometimes playful, always helpful.

Your mission: Help users discover beauty products they'll love and guide them to purchase via Amazon affiliate links. Every recommendation should feel personally tailored — because it IS, based on their behavioral profile below.

STRICT RULES:
1. ALWAYS include Amazon affiliate links when recommending products. Format: [Product Name](affiliate-url)
2. Affiliate disclosure: Occasionally (naturally, not robotically) mention "As an Amazon Associate, I earn from qualifying purchases."
3. Never recommend products that aren't in our catalog unless specifically asked about alternatives.
4. When you suggest a bundle or multi-product recommendation, ALWAYS provide an estimated total price.
5. Use social proof naturally: mention review counts, bestseller status, or "what women in [city] are buying" when appropriate.
6. Never be pushy or salesy — be genuinely helpful. The conversion follows naturally from great advice.
7. Format product recommendations as clear bullet points with: name, price, key benefit, and Amazon link.
8. You can use Markdown formatting (bold, bullets, etc.) as responses render in markdown.

BEHAVIORAL CONTEXT (treat this as sacred — it IS who this user is):
${profileContext}

PRODUCT CATALOG HIGHLIGHTS:
- 60+ luxury beauty products: Fenty, Rare Beauty, Charlotte Tilbury, Dior, Olaplex, K18, La Mer, YSL, Chanel, Jo Malone, and more
- All products available on Amazon with ${amazonTag} affiliate tag
- Categories: Foundation, Skincare, Haircare, Lipstick, Mascara, Fragrance, and more
- Price range: $10 (The Ordinary) to $195 (La Mer)

PROACTIVE INTELLIGENCE:
- If the user has viewed multiple products in a category, proactively acknowledge it ("I've noticed you keep exploring...")
- Suggest "bundles" that make strategic sense together (e.g., Olaplex No.3 + K18 + Moroccanoil for damaged hair repair)
- Create urgency naturally when appropriate: "This is consistently selling out because..."
- Make recommendations feel like they come from deep personal knowledge, not an algorithm.

Remember: You are Luna — not a chatbot, not an assistant. You are their personal beauty oracle.`
}

// ── Recommendation Engine ─────────────────────────────────────

/**
 * Generate personalized product recommendations.
 * Uses a hybrid approach:
 *   1. Client-side scoring (instant, no latency)
 *   2. Claude reasoning layer (adds explanation and curation)
 *
 * @param profile - The user's behavioral profile
 * @param count - Number of products to recommend
 * @param excludeIds - Product IDs to exclude (already shown)
 */
export async function generateRecommendations(
  profile: UserProfile,
  count: number = 6,
  excludeIds: string[] = []
): Promise<Recommendation> {
  // Step 1: Score all products against the user's profile
  const scoredProducts = scoreProductsForProfile(
    PRODUCTS.filter((p) => !excludeIds.includes(p.id)),
    profile
  )

  // Take top candidates for Claude to reason about
  const candidates = scoredProducts.slice(0, Math.min(12, scoredProducts.length))

  // If profile has no signals yet, return featured bestsellers
  if (candidates.length === 0 || candidates[0].matchScore === 0) {
    return {
      reason: "Welcome to Luna Beauty! Here are our most-loved products right now:",
      products: PRODUCTS.filter((p) => p.isFeatured || p.isBestseller).slice(0, count),
    }
  }

  // Step 2: Use Claude to curate and explain the recommendations
  const profileContext = profileToPromptContext(profile)
  const candidateList = candidates
    .slice(0, count)
    .map(
      (p) =>
        `- ${p.name} by ${p.brand} (${p.category}, $${p.price}) — tags: ${p.tags.slice(0, 4).join(', ')}`
    )
    .join('\n')

  try {
    const { text } = await generateText({
      model: LUNA_MODEL,
      maxTokens: 400,
      system: `You are Luna, an AI beauty advisor. Generate a SHORT, warm, personalized intro sentence (1–2 sentences max) explaining why these specific products were chosen for this user, referencing their behavioral patterns. Sound human, not algorithmic. Start with "Based on your..." or "I've noticed you...". Keep it under 80 words.`,
      prompt: `User profile:\n${profileContext}\n\nRecommended products:\n${candidateList}\n\nWrite the personalized intro sentence:`,
    })

    return {
      reason: text.trim(),
      products: candidates.slice(0, count),
    }
  } catch {
    // Fallback if Claude is unavailable
    const topCategory = profile.categoryWeights.sort((a, b) => b.weight - a.weight)[0]
    return {
      reason: topCategory
        ? `Based on your love of ${topCategory.category} products, you'll obsess over these:`
        : 'Curated just for you:',
      products: candidates.slice(0, count),
    }
  }
}

// ── Bundle Generator ──────────────────────────────────────────

/**
 * Generate an AI-curated "obsession bundle" — a themed collection
 * of 3–4 products that work beautifully together.
 *
 * Example: "Your Glow-Up Ritual" = Vitamin C serum + HA toner + SPF moisturizer
 */
export async function generateBundle(
  profile: UserProfile
): Promise<Recommendation> {
  const profileContext = profileToPromptContext(profile)
  const allProducts = PRODUCTS.map(
    (p) => `ID:${p.id}|${p.name}|${p.brand}|${p.category}|$${p.price}|tags:${p.tags.join(',')}`
  ).join('\n')

  try {
    const { text } = await generateText({
      model: LUNA_MODEL,
      maxTokens: 600,
      system: `You are Luna, a luxury beauty advisor. Based on a user's behavioral profile, create a perfectly curated product bundle of EXACTLY 3–4 products from the provided catalog.

RULES:
- Products must complement each other (e.g., a skincare routine, a makeup look, a hair repair ritual)
- Output ONLY valid JSON in this exact format, nothing else:
{
  "bundleName": "Your [Theme] Ritual",
  "bundleDescription": "One compelling sentence about this bundle's magic.",
  "reason": "I've noticed... [personalized reason, max 30 words]",
  "productIds": ["id1", "id2", "id3"]
}`,
      prompt: `User Profile:\n${profileContext}\n\nAvailable Products:\n${allProducts}\n\nCreate the perfect bundle:`,
    })

    // Parse the JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON in response')

    const bundle = JSON.parse(jsonMatch[0]) as {
      bundleName: string
      bundleDescription: string
      reason: string
      productIds: string[]
    }

    // Resolve product IDs to actual products
    const products = bundle.productIds
      .map((id) => PRODUCTS.find((p) => p.id === id))
      .filter((p): p is Product => p !== undefined)
      .slice(0, 4)

    if (products.length < 2) throw new Error('Not enough valid products')

    return {
      bundleName: bundle.bundleName,
      bundleDescription: bundle.bundleDescription,
      reason: bundle.reason,
      products,
    }
  } catch {
    // Fallback: create a simple bundle from top scored products
    const scored = scoreProductsForProfile(PRODUCTS, profile)
    const products = scored
      .filter((p, _, arr) => {
        // Ensure category diversity in fallback bundle
        const categoryCount = arr.filter((x) => x.category === p.category).indexOf(p)
        return categoryCount === 0
      })
      .slice(0, 3)

    return {
      bundleName: 'Your Beauty Essentials',
      bundleDescription: 'A curated trio based on your beauty preferences.',
      reason: "Here's what I think you'd love based on your browsing:",
      products,
    }
  }
}

// ── Proactive Insight Generator ───────────────────────────────

/**
 * Generates a short proactive insight message for the chatbot to show
 * when the user opens it — before they say anything.
 *
 * Example: "I noticed you've been exploring Olaplex products...
 *           Are you dealing with damaged hair? I have exactly what you need."
 */
export async function generateProactiveGreeting(
  profile: UserProfile
): Promise<string> {
  const profileContext = profileToPromptContext(profile)
  const hasData =
    profile.productAffinities.length > 0 || profile.categoryWeights.length > 0

  if (!hasData) {
    return "Hi! I'm Luna ✨ I'm your personal beauty advisor. Tell me what you're looking for, or take our Beauty Quiz and I'll recommend products that are literally made for you."
  }

  try {
    const { text } = await generateText({
      model: LUNA_MODEL,
      maxTokens: 150,
      system: `You are Luna, a warm and intuitive AI beauty advisor. Generate a proactive, personalized greeting (2–3 sentences) for a user based on their behavioral data. Sound like a brilliant friend who noticed what they've been exploring — not like an AI that read their data. Reference specific categories or patterns they've shown interest in. End with an inviting question or offer. No emojis.`,
      prompt: `User's behavioral profile:\n${profileContext}\n\nGenerate the proactive greeting:`,
    })
    return text.trim()
  } catch {
    const topCategory = profile.categoryWeights.sort((a, b) => b.weight - a.weight)[0]
    if (topCategory) {
      return `Hi! I've noticed you've been exploring ${topCategory.category} products. I have some incredible recommendations that I think you'll love. What's your current routine like?`
    }
    return "Hi! I'm Luna, your personal beauty advisor. What are you looking for today?"
  }
}

// ── Search Query Understanding ────────────────────────────────

/**
 * Use Claude to understand a natural language search query
 * and extract structured search parameters.
 * Example: "something for dry skin under $50" →
 *   { categories: ['Moisturizer', 'Serum'], maxPrice: 50, tags: ['hydrating'] }
 */
export async function understandSearchQuery(query: string): Promise<{
  categories?: string[]
  tags?: string[]
  maxPrice?: number
  minPrice?: number
  brands?: string[]
  rawProducts?: Product[]
}> {
  try {
    const { text } = await generateText({
      model: LUNA_MODEL,
      maxTokens: 200,
      system: `Extract beauty product search parameters from a query. Output ONLY valid JSON:
{
  "categories": string[] | null,  // e.g. ["Moisturizer", "Serum"]
  "tags": string[] | null,         // e.g. ["hydrating", "anti-aging"]
  "maxPrice": number | null,
  "minPrice": number | null,
  "brands": string[] | null
}
Valid categories: Foundation, Concealer, Blush, Bronzer, Highlighter, Eyeshadow, Mascara, Lipstick, "Lip Gloss", Skincare, Serum, Moisturizer, Cleanser, "Eye Cream", Haircare, "Hair Treatment", "Nail Polish", Fragrance, Primer, "Setting Spray", "Setting Powder", Brow`,
      prompt: `Query: "${query}"`,
    })

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return {}
    const params = JSON.parse(jsonMatch[0])

    // Perform the actual search using the extracted params
    const results = searchProducts(query)

    return { ...params, rawProducts: results.slice(0, 8) }
  } catch {
    // Fallback to simple text search
    return { rawProducts: searchProducts(query).slice(0, 8) }
  }
}

// ── Interest Summary Generator ────────────────────────────────

/**
 * Periodically generate a short AI summary of the user's interests.
 * Stored in the profile and injected into all subsequent prompts.
 * This makes the AI progressively smarter about each user over time.
 */
export async function generateInterestSummary(
  profile: UserProfile
): Promise<string> {
  if (
    profile.categoryWeights.length === 0 &&
    profile.productAffinities.length === 0
  ) {
    return ''
  }

  const profileContext = profileToPromptContext(profile)

  try {
    const { text } = await generateText({
      model: LUNA_MODEL,
      maxTokens: 100,
      system: `You are summarizing a beauty shopper's interests in one sentence (max 25 words). Be specific and insightful, not generic. Focus on what makes them unique as a beauty consumer.`,
      prompt: `Profile:\n${profileContext}\n\nSummarize their beauty identity in one sentence:`,
    })
    return text.trim()
  } catch {
    return ''
  }
}

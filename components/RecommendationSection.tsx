'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, RefreshCw, Package } from 'lucide-react'
import { ProductGrid } from '@/components/ProductGrid'
import { RecommendationSkeleton } from '@/components/LoadingSkeleton'
import { loadProfile } from '@/lib/profile'
import { isProfileReady } from '@/lib/profile'
import { scoreProductsForProfile } from '@/lib/utils'
import { PRODUCTS } from '@/lib/products'
import { trackAffiliateClick } from '@/lib/analytics'
import type { Recommendation, Product } from '@/types'

interface RecommendationSectionProps {
  showBundle?: boolean
  showFull?: boolean
}

export function RecommendationSection({
  showBundle = false,
  showFull = false,
}: RecommendationSectionProps) {
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null)
  const [bundle, setBundle] = useState<Recommendation | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isBundleLoading, setIsBundleLoading] = useState(false)
  const [profileReady, setProfileReady] = useState(false)

  useEffect(() => {
    loadRecommendations()
  }, [])

  async function loadRecommendations() {
    setIsLoading(true)
    try {
      const profile = loadProfile()
      const ready = isProfileReady(profile)
      setProfileReady(ready)

      if (!ready) {
        // Not enough data yet — show featured products
        const featured = PRODUCTS.filter((p) => p.isFeatured).slice(0, 6)
        setRecommendation({
          reason: "Welcome! Here are our most-loved luxury beauty picks to get you started:",
          products: featured,
        })
        setIsLoading(false)
        return
      }

      // Use local scoring (fast, no AI call needed for this section)
      const scored = scoreProductsForProfile(PRODUCTS, profile).slice(0, showFull ? 12 : 6)
      const topCategory = profile.categoryWeights.sort((a, b) => b.weight - a.weight)[0]

      const reason = topCategory
        ? `Based on your love of ${topCategory.category} products, I found these for you:`
        : "Based on what you've been exploring, I think you'll love these:"

      setRecommendation({ reason, products: scored })

      // Optionally fetch AI-generated bundle
      if (showBundle) {
        loadBundle(profile)
      }
    } catch (error) {
      console.error('Failed to load recommendations:', error)
      // Fallback to bestsellers
      const bestsellers = PRODUCTS.filter((p) => p.isBestseller).slice(0, 6)
      setRecommendation({
        reason: "Our bestselling luxury products:",
        products: bestsellers,
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function loadBundle(profile: ReturnType<typeof loadProfile>) {
    setIsBundleLoading(true)
    try {
      const res = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, type: 'bundle' }),
      })
      if (res.ok) {
        const data = await res.json()
        setBundle(data.bundle)
      }
    } catch {
      // Bundle generation is optional — fail silently
    } finally {
      setIsBundleLoading(false)
    }
  }

  function handleRefresh() {
    setRecommendation(null)
    setBundle(null)
    loadRecommendations()
  }

  return (
    <section className="py-16">
      <div className="container">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-luna-gold" />
              <p className="text-sm font-medium text-primary uppercase tracking-widest">
                {profileReady ? 'Luna Picked For You' : "Luna's Top Picks"}
              </p>
            </div>
            <h2 className="text-2xl md:text-3xl font-display font-semibold">
              {profileReady
                ? 'Your Personalized Beauty Edit'
                : 'Discover Your New Obsessions'}
            </h2>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Personalized reason */}
        {recommendation && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-luna-blush/20 to-luna-champagne/20 dark:from-luna-berry/10 dark:to-luna-mink/10 rounded-xl px-5 py-4 mb-8 border border-luna-gold/20"
          >
            <p className="text-sm text-muted-foreground italic">
              <span className="text-luna-gold font-semibold not-italic">Luna says: </span>
              {recommendation.reason}
            </p>
          </motion.div>
        )}

        {/* Products */}
        {isLoading ? (
          <RecommendationSkeleton />
        ) : recommendation ? (
          <ProductGrid products={recommendation.products} source="recommendation" />
        ) : null}

        {/* AI Bundle Section */}
        {(showBundle || showFull) && (
          <div className="mt-16">
            <div className="luna-divider">
              <div className="flex items-center gap-2 px-4">
                <Package className="w-4 h-4 text-luna-gold" />
                <h3 className="text-xl font-display font-semibold whitespace-nowrap">
                  Your Secret Obsession Bundle
                </h3>
              </div>
            </div>

            {isBundleLoading ? (
              <RecommendationSkeleton />
            ) : bundle ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-6"
              >
                <div className="text-center mb-6">
                  <h4 className="text-lg font-display font-semibold mb-2">
                    {bundle.bundleName}
                  </h4>
                  {bundle.bundleDescription && (
                    <p className="text-muted-foreground text-sm max-w-lg mx-auto">
                      {bundle.bundleDescription}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground italic mt-2">
                    {bundle.reason}
                  </p>
                </div>

                <ProductGrid products={bundle.products} source="bundle" />

                {/* Bundle total price */}
                <div className="mt-6 flex flex-col items-center gap-2">
                  <p className="text-sm text-muted-foreground">
                    Bundle total:{' '}
                    <span className="font-bold text-foreground">
                      ${bundle.products.reduce((s, p) => s + p.price, 0)}
                    </span>
                  </p>
                </div>
              </motion.div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <button
                  onClick={() => loadBundle(loadProfile())}
                  className="text-primary hover:underline"
                >
                  Generate my bundle →
                </button>
              </div>
            )}
          </div>
        )}

        {/* CTA to full recommendations */}
        {!showFull && (
          <div className="text-center mt-10">
            <a
              href="/recommendations"
              className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
            >
              <Sparkles className="w-4 h-4" />
              See all my personalized picks →
            </a>
          </div>
        )}
      </div>
    </section>
  )
}

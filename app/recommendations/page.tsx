// ============================================================
// Luna Beauty — Personalized Recommendations Page
// ============================================================

import type { Metadata } from 'next'
import { RecommendationSection } from '@/components/RecommendationSection'

export const metadata: Metadata = {
  title: 'Your Personal Beauty Picks',
  description: 'AI-curated luxury beauty products, matched to your unique profile and browsing behavior.',
}

export default function RecommendationsPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-luna-blush/20 to-luna-champagne/20 py-16 text-center">
        <p className="text-sm font-medium text-primary uppercase tracking-widest mb-2">
          Luna Mind at Work
        </p>
        <h1 className="text-3xl md:text-4xl font-display font-semibold mb-3">
          Products Picked Just For You
        </h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Based on everything you&apos;ve been exploring, Luna has curated these picks.
          The more you browse, the better she gets.
        </p>
      </div>

      {/* Recommendations (fully client-side, profile-driven) */}
      <div className="container py-12">
        <RecommendationSection showBundle showFull />
      </div>
    </div>
  )
}

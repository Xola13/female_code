// ============================================================
// Luna Beauty — Profile Sync API
// Anonymously syncs user profile to Supabase (consent-gated)
// ============================================================

import { NextResponse } from 'next/server'
import { upsertProfile } from '@/lib/supabase'
import type { UserProfile } from '@/types'

export const runtime = 'edge'

export async function POST(request: Request) {
  let body: { profile: UserProfile }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const { profile } = body

  if (!profile?.uuid || !profile.cloudSyncConsent) {
    return NextResponse.json(
      { error: 'Profile UUID required and consent must be given' },
      { status: 400 }
    )
  }

  // Strip any sensitive data before storing
  const safeProfile: UserProfile = {
    uuid: profile.uuid,
    cloudSyncConsent: profile.cloudSyncConsent,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
    categoryWeights: profile.categoryWeights,
    productAffinities: profile.productAffinities.map((a) => ({
      productId: a.productId,
      score: a.score,
      viewCount: a.viewCount,
      lastViewed: a.lastViewed,
    })),
    priceRangeMin: profile.priceRangeMin,
    priceRangeMax: profile.priceRangeMax,
    topTags: profile.topTags,
    topBrands: profile.topBrands,
    quizAnswers: profile.quizAnswers,
    interestSummary: profile.interestSummary,
  }

  await upsertProfile(safeProfile)

  return NextResponse.json({ synced: true })
}

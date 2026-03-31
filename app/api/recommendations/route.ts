// ============================================================
// Luna Beauty — Recommendations API
// Server-side recommendation generation with Claude AI
// ============================================================

import { NextResponse } from 'next/server'
import { checkRateLimit, getIdentifier } from '@/lib/rate-limit'
import { generateRecommendations, generateBundle } from '@/lib/luna-mind'
import type { UserProfile } from '@/types'

export const runtime = 'edge'

export async function POST(request: Request) {
  // Rate limit
  const identifier = getIdentifier(request)
  const rateLimit = checkRateLimit(`recs:${identifier}`, { max: 20, windowMs: 60000 })

  if (!rateLimit.success) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    )
  }

  let body: {
    profile: UserProfile
    type: 'recommendations' | 'bundle'
    count?: number
    excludeIds?: string[]
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { profile, type, count = 6, excludeIds = [] } = body

  if (!profile) {
    return NextResponse.json({ error: 'Profile required' }, { status: 400 })
  }

  try {
    if (type === 'bundle') {
      const bundle = await generateBundle(profile)
      return NextResponse.json({ bundle })
    } else {
      const recommendation = await generateRecommendations(profile, count, excludeIds)
      return NextResponse.json({ recommendation })
    }
  } catch (error) {
    console.error('[Recommendations API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    )
  }
}

// ============================================================
// Luna Beauty — Event Tracking API
// Receives batched analytics events from client
// ============================================================

import { NextResponse } from 'next/server'
import { logEvent } from '@/lib/supabase'
import type { TrackingEvent } from '@/types'

export const runtime = 'edge'

export async function POST(request: Request) {
  let body: { events: TrackingEvent[] }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const { events } = body

  if (!Array.isArray(events) || events.length === 0) {
    return NextResponse.json({ received: 0 })
  }

  // Process up to 50 events per batch
  const batch = events.slice(0, 50)

  // Log all events concurrently (fire-and-forget pattern)
  // We don't await all — we respond immediately for fast UX
  const logPromises = batch.map((event) =>
    logEvent(event).catch(() => {
      // Silently ignore individual event failures
    })
  )

  // Respond immediately, let logging continue in background
  // (Edge runtime will keep the response handler alive for a bit)
  void Promise.allSettled(logPromises)

  return NextResponse.json({ received: batch.length })
}

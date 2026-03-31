// ============================================================
// Luna Beauty — Next.js Middleware
// Runs at the edge before every request
// ============================================================

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  )

  // Cache static pages for 1 hour at the edge
  const { pathname } = request.nextUrl
  if (pathname === '/' || pathname.startsWith('/products') || pathname === '/quiz') {
    response.headers.set('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400')
  }

  return response
}

export const config = {
  // Run middleware on all routes except static files and API routes
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

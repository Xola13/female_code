'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

/**
 * Persistent top-of-page affiliate disclosure banner.
 * Required by Amazon Associates program guidelines.
 * User can dismiss it once per session.
 */
export function AffiliateDisclosure() {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <div className="bg-secondary/40 border-b border-border py-1.5 px-4 text-center relative">
      <p className="text-xs text-muted-foreground">
        <strong>Affiliate Disclosure:</strong> As an Amazon Associate, Luna Beauty earns from
        qualifying purchases. Product links go to Amazon.{' '}
        <a href="/privacy" className="text-primary hover:underline">
          Learn more
        </a>
      </p>
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted transition-colors"
        aria-label="Dismiss disclosure"
      >
        <X className="w-3 h-3 text-muted-foreground" />
      </button>
    </div>
  )
}

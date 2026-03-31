'use client'

import { useEffect } from 'react'
import { Sparkles } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="text-5xl mb-4">💫</div>
      <h2 className="text-2xl font-display font-semibold mb-3">Something went wrong</h2>
      <p className="text-muted-foreground mb-8 max-w-md">
        Luna encountered an unexpected moment. Let&apos;s try that again.
      </p>
      <button
        onClick={reset}
        className="flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
      >
        <Sparkles className="w-4 h-4" />
        Try Again
      </button>
    </div>
  )
}

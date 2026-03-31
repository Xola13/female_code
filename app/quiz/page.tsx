// ============================================================
// Luna Beauty — Beauty Quiz Page
// ============================================================

import type { Metadata } from 'next'
import { BeautyQuiz } from '@/components/BeautyQuiz'

export const metadata: Metadata = {
  title: 'Beauty Quiz — Find Your Perfect Products',
  description:
    'Take Luna\'s 6-question Beauty Quiz and let our AI instantly reveal your perfect product matches based on your skin type, concerns, and beauty goals.',
}

export default function QuizPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-luna-cream via-background to-luna-blush/10 dark:from-background dark:via-background dark:to-luna-berry/5">
      {/* Hero */}
      <div className="text-center py-16 px-4">
        <div className="text-5xl mb-4">✨</div>
        <h1 className="text-3xl md:text-4xl font-display font-semibold mb-3">
          Your Beauty Profile, Revealed
        </h1>
        <p className="text-muted-foreground text-lg max-w-md mx-auto">
          6 quick questions. Then Luna tells you exactly which products were made for you.
        </p>
      </div>

      {/* Quiz Component */}
      <div className="container max-w-2xl pb-20">
        <BeautyQuiz />
      </div>
    </div>
  )
}

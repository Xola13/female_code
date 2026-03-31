'use client'

// ============================================================
// Luna Beauty Quiz 2.0 — Instant Profile Seeding
// 6-question visual quiz that builds the user's Interest Vector
// on completion and immediately shows personalized products.
// ============================================================

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ArrowLeft, Sparkles, CheckCircle2 } from 'lucide-react'
import { ProductGrid } from '@/components/ProductGrid'
import { loadProfile, saveProfile, applyQuizAnswers } from '@/lib/profile'
import { scoreProductsForProfile } from '@/lib/utils'
import { PRODUCTS } from '@/lib/products'
import { trackQuizComplete } from '@/lib/analytics'
import type { QuizQuestion, QuizAnswers, Product } from '@/types'

// ── Quiz Questions ────────────────────────────────────────────

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'skin_type',
    text: 'What\'s your skin type?',
    subtitle: 'This shapes everything — from moisturizers to foundations.',
    options: [
      {
        id: 'dry',
        label: 'Dry & Thirsty',
        emoji: '💧',
        signals: { categories: ['Moisturizer', 'Serum'], tags: ['hydrating', 'dewy', 'plumping'] },
      },
      {
        id: 'oily',
        label: 'Oily & Shiny',
        emoji: '✨',
        signals: { categories: ['Foundation', 'Primer', 'Setting Powder'], tags: ['matte', 'oil-free', 'long-wear'] },
      },
      {
        id: 'combo',
        label: 'Combination',
        emoji: '⚖️',
        signals: { categories: ['Foundation', 'Serum'], tags: ['balancing', 'buildable'] },
      },
      {
        id: 'sensitive',
        label: 'Sensitive & Reactive',
        emoji: '🌸',
        signals: { categories: ['Cleanser', 'Moisturizer'], tags: ['gentle', 'fragrance-free', 'soothing'] },
      },
    ],
  },
  {
    id: 'skin_concern',
    text: 'What\'s your #1 skin concern?',
    subtitle: 'Be honest — Luna won\'t judge.',
    options: [
      {
        id: 'aging',
        label: 'Fine Lines & Aging',
        emoji: '⏰',
        signals: { categories: ['Serum', 'Eye Cream', 'Moisturizer'], tags: ['anti-aging', 'retinol', 'collagen', 'firming'] },
      },
      {
        id: 'dull',
        label: 'Dullness & Uneven Tone',
        emoji: '🌟',
        signals: { categories: ['Serum'], tags: ['vitamin-c', 'brightening', 'glow', 'spots'] },
      },
      {
        id: 'acne',
        label: 'Breakouts & Pores',
        emoji: '🔬',
        signals: { categories: ['Cleanser', 'Serum'], tags: ['salicylic-acid', 'bha', 'pore-minimizing', 'blackheads'] },
      },
      {
        id: 'hydration',
        label: 'Dehydration & Dryness',
        emoji: '🫧',
        signals: { categories: ['Serum', 'Moisturizer'], tags: ['hyaluronic-acid', 'hydrating', 'barrier'] },
      },
    ],
  },
  {
    id: 'makeup_style',
    text: 'How would you describe your everyday makeup look?',
    subtitle: 'No right or wrong — pure you.',
    options: [
      {
        id: 'no_makeup',
        label: 'Skincare & No-Makeup',
        emoji: '🪄',
        signals: { categories: ['Skincare', 'Serum', 'Moisturizer'], tags: ['natural', 'glowing', 'minimal'] },
      },
      {
        id: 'natural',
        label: 'Soft & Natural Glam',
        emoji: '🌷',
        signals: { categories: ['Foundation', 'Blush', 'Mascara', 'Lip Gloss'], tags: ['natural', 'dewy', 'buildable'] },
      },
      {
        id: 'bold',
        label: 'Full Glam & Dramatic',
        emoji: '💄',
        signals: { categories: ['Foundation', 'Eyeshadow', 'Lipstick', 'Concealer'], tags: ['full-coverage', 'bold', 'dramatic', 'long-wear'] },
      },
      {
        id: 'editorial',
        label: 'Trendy & Editorial',
        emoji: '🎨',
        signals: { categories: ['Eyeshadow', 'Highlighter', 'Lipstick', 'Blush'], tags: ['pigmented', 'trending', 'iconic'] },
      },
    ],
  },
  {
    id: 'hair_concern',
    text: 'What\'s your hair situation?',
    options: [
      {
        id: 'damaged',
        label: 'Damaged from Heat or Color',
        emoji: '💔',
        signals: { categories: ['Hair Treatment', 'Haircare'], tags: ['bond-building', 'repair', 'damaged-hair', 'olaplex'] },
      },
      {
        id: 'frizzy',
        label: 'Frizzy & Hard to Manage',
        emoji: '🌀',
        signals: { categories: ['Haircare', 'Hair Treatment'], tags: ['frizz-control', 'smoothing', 'argan-oil'] },
      },
      {
        id: 'fine',
        label: 'Fine & Lacking Volume',
        emoji: '🌬️',
        signals: { categories: ['Haircare'], tags: ['volumizing', 'lightweight', 'all-hair-types'] },
      },
      {
        id: 'healthy',
        label: 'Pretty Healthy — Just Maintaining',
        emoji: '✅',
        signals: { categories: ['Haircare'], tags: ['shine', 'conditioning', 'all-hair-types'] },
      },
    ],
  },
  {
    id: 'budget',
    text: 'What\'s your beauty budget?',
    subtitle: 'Luna has incredible picks at every price point.',
    options: [
      {
        id: 'budget',
        label: 'Under $20',
        emoji: '💚',
        signals: { priceMax: 20, tags: ['budget-friendly', 'drugstore'] },
      },
      {
        id: 'mid',
        label: '$20–$50',
        emoji: '💛',
        signals: { priceMin: 20, priceMax: 50, tags: ['buildable'] },
      },
      {
        id: 'luxury',
        label: '$50–$100',
        emoji: '🧡',
        signals: { priceMin: 50, priceMax: 100, tags: ['luxury', 'award-winning'] },
      },
      {
        id: 'ultra',
        label: 'Sky\'s the Limit',
        emoji: '💎',
        signals: { priceMin: 80, priceMax: 300, tags: ['ultra-premium', 'luxury', 'iconic'] },
      },
    ],
  },
  {
    id: 'scent_preference',
    text: 'If you were a fragrance, you\'d be...',
    subtitle: 'This also shapes your beauty product scent preferences.',
    options: [
      {
        id: 'floral',
        label: 'Soft & Floral',
        emoji: '🌹',
        signals: { categories: ['Fragrance'], tags: ['floral', 'rose', 'peony', 'romantic'] },
      },
      {
        id: 'bold_scent',
        label: 'Bold & Seductive',
        emoji: '🔥',
        signals: { categories: ['Fragrance'], tags: ['bold', 'seductive', 'evening', 'coffee'] },
      },
      {
        id: 'fresh',
        label: 'Fresh & Airy',
        emoji: '🌿',
        signals: { categories: ['Fragrance'], tags: ['fresh', 'light', 'clean'] },
      },
      {
        id: 'warm',
        label: 'Warm & Cosy',
        emoji: '🕯️',
        signals: { categories: ['Fragrance'], tags: ['vanilla', 'warm', 'suede'] },
      },
    ],
  },
]

// ── Component ─────────────────────────────────────────────────

export function BeautyQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<QuizAnswers>({})
  const [quizComplete, setQuizComplete] = useState(false)
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  const question = QUIZ_QUESTIONS[currentQuestion]
  const progress = ((currentQuestion + (quizComplete ? 1 : 0)) / QUIZ_QUESTIONS.length) * 100
  const selectedOption = answers[question?.id]
  const canGoBack = currentQuestion > 0 && !quizComplete
  const canGoNext = !!selectedOption

  function selectOption(optionId: string) {
    setAnswers((prev) => ({ ...prev, [question.id]: optionId }))
  }

  function goNext() {
    if (!canGoNext) return

    if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestion((q) => q + 1)
    } else {
      completeQuiz()
    }
  }

  function goBack() {
    if (canGoBack) setCurrentQuestion((q) => q - 1)
  }

  async function completeQuiz() {
    setIsProcessing(true)
    trackQuizComplete(Object.keys(answers).length)

    // Build quiz config from answers
    const quizConfig = QUIZ_QUESTIONS.map((q) => {
      const answerId = answers[q.id]
      const option = q.options.find((o) => o.id === answerId)
      return {
        questionId: q.id,
        optionId: answerId ?? '',
        signals: option?.signals ?? {},
      }
    })

    // Apply quiz results to user profile
    const profile = loadProfile()
    const updatedProfile = applyQuizAnswers(profile, answers, quizConfig)
    saveProfile(updatedProfile)

    // Score products against the now-seeded profile
    const scored = scoreProductsForProfile(PRODUCTS, updatedProfile)
    setRecommendedProducts(scored.slice(0, 8))
    setQuizComplete(true)
    setIsProcessing(false)
  }

  if (quizComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Success header */}
        <div className="text-center bg-gradient-to-br from-luna-blush/20 to-luna-champagne/20 rounded-2xl p-8 border border-luna-gold/20">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-luna-berry to-luna-gold flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-display font-semibold mb-2">
            Luna has read your beauty profile ✨
          </h2>
          <p className="text-muted-foreground">
            Based on your answers + what I&apos;ve already observed about you, here are the exact products I&apos;d recommend first.
          </p>
        </div>

        {/* Recommended products */}
        <div>
          <p className="text-sm font-medium text-primary uppercase tracking-widest mb-4 text-center">
            Your Personalized Picks
          </p>
          <ProductGrid products={recommendedProducts} source="quiz-result" />
        </div>

        {/* Retake or chat */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => {
              setAnswers({})
              setCurrentQuestion(0)
              setQuizComplete(false)
              setRecommendedProducts([])
            }}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Retake quiz →
          </button>
          <a href="/recommendations" className="flex items-center gap-2 text-primary hover:underline font-medium">
            <Sparkles className="w-4 h-4" />
            See all my picks →
          </a>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Question {currentQuestion + 1} of {QUIZ_QUESTIONS.length}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-luna-berry to-luna-rose rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
          className="space-y-6"
        >
          <div className="text-center">
            <h2 className="text-xl md:text-2xl font-display font-semibold mb-2">
              {question.text}
            </h2>
            {question.subtitle && (
              <p className="text-muted-foreground text-sm">{question.subtitle}</p>
            )}
          </div>

          {/* Options */}
          <div className="grid grid-cols-2 gap-3">
            {question.options.map((option) => (
              <motion.button
                key={option.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => selectOption(option.id)}
                className={cn(
                  'p-4 rounded-2xl border-2 text-left transition-all duration-200',
                  'flex flex-col items-center gap-2 text-center',
                  selectedOption === option.id
                    ? 'border-primary bg-primary/10 shadow-md'
                    : 'border-border bg-card hover:border-primary/50 hover:bg-muted/50'
                )}
              >
                {option.emoji && (
                  <span className="text-2xl">{option.emoji}</span>
                )}
                <span className="font-medium text-sm leading-snug">{option.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={goBack}
          disabled={!canGoBack}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <button
          onClick={goNext}
          disabled={!canGoNext || isProcessing}
          className={cn(
            'flex items-center gap-2 px-6 py-3 rounded-full font-medium text-sm transition-all duration-200',
            canGoNext
              ? 'bg-gradient-to-r from-luna-berry to-luna-rose text-white shadow-md hover:shadow-lg hover:scale-105'
              : 'bg-muted text-muted-foreground cursor-not-allowed'
          )}
        >
          {isProcessing ? (
            <>Processing...</>
          ) : currentQuestion === QUIZ_QUESTIONS.length - 1 ? (
            <>
              <Sparkles className="w-4 h-4" />
              See My Products
            </>
          ) : (
            <>
              Next
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {/* Skip option */}
      <div className="text-center">
        <button
          onClick={goNext}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Skip this question
        </button>
      </div>
    </div>
  )
}

// Helper: cn is imported from utils but we need it here too
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Sparkles, ArrowRight } from 'lucide-react'

const TAGLINES = [
  'reads your mind',
  'knows your skin',
  'finds your obsession',
  'curates your glow',
  'speaks your language',
]

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-luna-cream via-background to-luna-blush/20 dark:from-background dark:via-background dark:to-luna-berry/10 py-20 md:py-28">
      {/* Decorative blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-luna-blush/20 dark:bg-luna-berry/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-20 w-80 h-80 bg-luna-champagne/30 dark:bg-luna-gold/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-luna-rose/10 dark:bg-luna-rose/5 rounded-full blur-3xl" />
      </div>

      <div className="container relative z-10 text-center max-w-4xl mx-auto">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 bg-secondary/60 border border-luna-gold/30 rounded-full px-4 py-1.5 text-sm font-medium mb-6"
        >
          <Sparkles className="w-3.5 h-3.5 text-luna-gold" />
          <span className="text-muted-foreground">Powered by Luna Mind AI</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl md:text-6xl lg:text-7xl font-display font-semibold leading-[1.1] mb-6"
        >
          Luxury beauty that{' '}
          <span className="text-luna-gradient">
            {TAGLINES[0]}
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Luna learns your beauty preferences in real-time and curates the exact products
          you&apos;ve been secretly searching for — from Fenty, Charlotte Tilbury, Dior, Olaplex,
          and 15+ luxury brands.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/quiz"
            className="flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-luna-berry to-luna-rose text-white font-semibold text-base shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
          >
            <Sparkles className="w-4 h-4" />
            Find My Perfect Products
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/products"
            className="flex items-center gap-2 px-8 py-4 rounded-full border-2 border-border bg-card text-foreground font-medium text-base hover:border-primary hover:text-primary transition-all duration-200"
          >
            Browse All Products
          </Link>
        </motion.div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground"
        >
          <div className="flex items-center gap-1.5">
            <div className="flex -space-x-1.5">
              {['🌸', '💄', '✨', '🌙', '💎'].map((emoji, i) => (
                <div
                  key={i}
                  className="w-7 h-7 rounded-full bg-gradient-to-br from-luna-blush to-luna-rose border-2 border-background flex items-center justify-center text-xs"
                >
                  {emoji}
                </div>
              ))}
            </div>
            <span>60+ luxury products</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-amber-400">★★★★★</span>
            <span>AI-curated picks</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span>🛡️</span>
            <span>Amazon buyer protection</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

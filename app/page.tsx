// ============================================================
// Luna Beauty — Homepage
// ============================================================

import type { Metadata } from 'next'
import { HeroSection } from '@/components/HeroSection'
import { RecommendationSection } from '@/components/RecommendationSection'
import { ProductGrid } from '@/components/ProductGrid'
import { getFeaturedProducts, getBestsellerProducts, getCategories } from '@/lib/products'

export const metadata: Metadata = {
  title: 'Luna Beauty — Luxury Beauty, Curated by AI',
  description:
    'Your AI beauty advisor Luna handpicks luxury products from Fenty, Rare Beauty, Charlotte Tilbury, Dior & more. Perfectly matched to your unique beauty profile.',
}

// Revalidate every hour for fresh data
export const revalidate = 3600

export default function HomePage() {
  const featuredProducts = getFeaturedProducts()
  const bestsellers = getBestsellerProducts()
  const categories = getCategories()

  return (
    <div className="flex flex-col">
      {/* Hero section with animated tagline */}
      <HeroSection />

      {/* AI-powered personalized recommendations — client-side */}
      <RecommendationSection />

      {/* Categories quick nav */}
      <section className="py-10 bg-muted/30">
        <div className="container">
          <h2 className="text-2xl font-display font-semibold text-center mb-6">
            Shop by Category
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((cat) => (
              <a
                key={cat}
                href={`/products?category=${encodeURIComponent(cat)}`}
                className="px-4 py-2 rounded-full border border-border bg-card hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200 text-sm font-medium"
              >
                {cat}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="py-16">
        <div className="container">
          <div className="text-center mb-10">
            <p className="text-sm font-medium text-primary uppercase tracking-widest mb-2">
              Luna&apos;s Picks
            </p>
            <h2 className="text-3xl md:text-4xl font-display font-semibold mb-3">
              Featured Luxuries
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              The products our community keeps returning to — editor-loved, AI-curated, and loved by thousands.
            </p>
          </div>
          <ProductGrid products={featuredProducts} source="homepage-featured" />
        </div>
      </section>

      {/* Bestsellers */}
      <section className="py-16 bg-muted/20">
        <div className="container">
          <div className="text-center mb-10">
            <p className="text-sm font-medium text-primary uppercase tracking-widest mb-2">
              Most Loved
            </p>
            <h2 className="text-3xl md:text-4xl font-display font-semibold mb-3">
              Bestsellers
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Products women keep repurchasing, sharing, and obsessing over — for good reason.
            </p>
          </div>
          <ProductGrid products={bestsellers.slice(0, 8)} source="homepage-bestsellers" />
          <div className="text-center mt-10">
            <a
              href="/products"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              View All Products
            </a>
          </div>
        </div>
      </section>

      {/* Quiz CTA */}
      <section className="py-20 bg-gradient-to-br from-luna-blush/30 via-luna-cream to-luna-champagne/40 dark:from-luna-berry/10 dark:via-background dark:to-luna-mink/10">
        <div className="container text-center max-w-2xl">
          <div className="text-4xl mb-4">✨</div>
          <h2 className="text-3xl md:text-4xl font-display font-semibold mb-4">
            Let Luna Read Your Beauty Profile
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Take our 6-question Beauty Quiz and Luna will instantly reveal your perfect
            product matches — curated just for your skin type, concerns, and style.
          </p>
          <a
            href="/quiz"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-luna-berry to-luna-rose text-white font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
          >
            Take the Beauty Quiz
            <span className="ml-1">→</span>
          </a>
          <p className="text-muted-foreground text-sm mt-4">
            Takes 60 seconds · No sign-up needed
          </p>
        </div>
      </section>
    </div>
  )
}

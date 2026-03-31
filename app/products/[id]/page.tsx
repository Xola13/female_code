// ============================================================
// Luna Beauty — Product Detail Page
// ============================================================

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { ShoppingBag, Star, ExternalLink, TrendingUp, Shield } from 'lucide-react'
import { PRODUCTS, getProductById } from '@/lib/products'
import { ProductGrid } from '@/components/ProductGrid'
import { ProductViewTracker } from '@/components/ProfileTracker'
import { formatPrice } from '@/lib/utils'

interface Props {
  params: Promise<{ id: string }>
}

// Pre-generate all product pages at build time
export async function generateStaticParams() {
  return PRODUCTS.map((p) => ({ id: p.id }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const product = getProductById(id)
  if (!product) return { title: 'Product Not Found' }

  return {
    title: `${product.name} by ${product.brand}`,
    description: product.shortDescription,
    openGraph: {
      title: `${product.name} — Luna Beauty`,
      description: product.shortDescription,
      images: [{ url: product.imageUrl, alt: product.name }],
    },
  }
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params
  const product = getProductById(id)

  if (!product) notFound()

  // Get related products (same category, excluding current)
  const related = PRODUCTS.filter(
    (p) => p.category === product.category && p.id !== product.id
  ).slice(0, 4)

  // Star rating display
  const fullStars = Math.floor(product.rating)
  const hasHalfStar = product.rating % 1 >= 0.5

  return (
    <div className="min-h-screen">
      {/* Track this product view via client component */}
      <ProductViewTracker product={product} />

      {/* Breadcrumb */}
      <div className="bg-muted/30 border-b border-border">
        <div className="container py-3">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <a href="/" className="hover:text-foreground transition-colors">Home</a>
            <span>/</span>
            <a href="/products" className="hover:text-foreground transition-colors">Products</a>
            <span>/</span>
            <a
              href={`/products?category=${encodeURIComponent(product.category)}`}
              className="hover:text-foreground transition-colors"
            >
              {product.category}
            </a>
            <span>/</span>
            <span className="text-foreground font-medium truncate max-w-48">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Product Detail */}
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          {/* Product Image */}
          <div className="relative">
            <div className="aspect-square rounded-2xl overflow-hidden bg-muted relative shadow-lg">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.isBestseller && (
                  <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                    Bestseller
                  </span>
                )}
                {product.isNew && (
                  <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    New
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            {/* Brand & Category */}
            <div className="flex items-center gap-3 mb-3">
              <span className="text-primary font-semibold text-lg">{product.brand}</span>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                {product.category}
              </span>
            </div>

            {/* Name */}
            <h1 className="text-2xl md:text-3xl font-display font-semibold leading-tight mb-4">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < fullStars
                        ? 'fill-amber-400 text-amber-400'
                        : i === fullStars && hasHalfStar
                        ? 'fill-amber-200 text-amber-400'
                        : 'fill-muted text-muted-foreground'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-medium">{product.rating}</span>
              <span className="text-sm text-muted-foreground">
                ({product.reviewCount.toLocaleString()} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="mb-6">
              <span className="text-3xl font-display font-bold text-foreground">
                {formatPrice(product.price)}
              </span>
            </div>

            {/* Short description hook */}
            <p className="text-muted-foreground text-base italic mb-5 border-l-4 border-primary/30 pl-4">
              &ldquo;{product.shortDescription}&rdquo;
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-8">
              {product.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-secondary/60 text-secondary-foreground px-3 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* CTA — Shop on Amazon */}
            <a
              href={product.affiliateUrl}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="btn-amazon mb-4 justify-center text-center"
              data-track-affiliate={product.id}
            >
              <ShoppingBag className="w-5 h-5" />
              Shop on Amazon — {formatPrice(product.price)}
              <ExternalLink className="w-4 h-4 opacity-80" />
            </a>

            {/* Trust signals */}
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span>
                  {product.isBestseller
                    ? 'Bestselling product — consistently high demand'
                    : `${product.reviewCount.toLocaleString()} women have reviewed this`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                <span>Sold by Amazon — buyer protection included</span>
              </div>
            </div>

            {/* Affiliate disclosure */}
            <p className="text-xs text-muted-foreground mt-4 pt-4 border-t border-border">
              *As an Amazon Associate, Luna Beauty earns from qualifying purchases.
              Prices may vary. Check Amazon for current pricing.
            </p>
          </div>
        </div>

        {/* Full Description */}
        <div className="max-w-3xl mb-16">
          <h2 className="text-xl font-display font-semibold mb-4">About This Product</h2>
          <p className="text-muted-foreground leading-relaxed">{product.description}</p>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div>
            <div className="luna-divider">
              <h2 className="text-2xl font-display font-semibold whitespace-nowrap px-4">
                You Might Also Love
              </h2>
            </div>
            <ProductGrid products={related} source="product-related" />
          </div>
        )}
      </div>
    </div>
  )
}

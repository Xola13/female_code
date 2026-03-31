'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ShoppingBag, Star, ExternalLink } from 'lucide-react'
import { trackAffiliateClick, trackProductView } from '@/lib/analytics'
import type { Product } from '@/types'
import { formatPrice } from '@/lib/utils'

interface ProductCardProps {
  product: Product
  source?: string   // tracking source (e.g. 'homepage-featured', 'recommendation')
  priority?: boolean
}

export function ProductCard({ product, source = 'unknown', priority = false }: ProductCardProps) {
  function handleAffiliateClick(e: React.MouseEvent) {
    // Track before navigating
    trackAffiliateClick(product, source)
    // Allow the link to open normally
  }

  function handleProductView() {
    trackProductView(product)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="product-card bg-card rounded-2xl border border-border overflow-hidden flex flex-col group"
    >
      {/* Image */}
      <Link
        href={`/products/${product.id}`}
        onClick={handleProductView}
        className="relative block aspect-square overflow-hidden bg-muted"
      >
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          priority={priority}
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.isBestseller && (
            <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2.5 py-1 rounded-full shadow">
              Bestseller
            </span>
          )}
          {product.isNew && (
            <span className="bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow">
              New
            </span>
          )}
        </div>

        {/* Quick shop overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Brand */}
        <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">
          {product.brand}
        </p>

        {/* Name */}
        <Link href={`/products/${product.id}`} onClick={handleProductView}>
          <h3 className="font-medium text-sm leading-snug mb-2 line-clamp-2 hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-3">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${
                  i < Math.floor(product.rating)
                    ? 'fill-amber-400 text-amber-400'
                    : 'fill-muted text-muted-foreground'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">
            ({product.reviewCount.toLocaleString()})
          </span>
        </div>

        {/* Short description */}
        <p className="text-xs text-muted-foreground line-clamp-2 mb-4 flex-1">
          {product.shortDescription}
        </p>

        {/* Price + CTA */}
        <div className="flex items-center justify-between gap-2">
          <span className="font-display font-bold text-base">
            {formatPrice(product.price)}
          </span>

          <a
            href={product.affiliateUrl}
            target="_blank"
            rel="noopener noreferrer nofollow"
            onClick={handleAffiliateClick}
            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-3 py-2 rounded-full shadow hover:shadow-md hover:scale-105 transition-all duration-200"
          >
            <ShoppingBag className="w-3 h-3" />
            Shop
            <ExternalLink className="w-3 h-3 opacity-70" />
          </a>
        </div>
      </div>
    </motion.div>
  )
}

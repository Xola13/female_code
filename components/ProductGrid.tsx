import { ProductCard } from '@/components/ProductCard'
import type { Product } from '@/types'

interface ProductGridProps {
  products: Product[]
  source?: string
}

export function ProductGrid({ products, source = 'grid' }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-4xl mb-4">🌸</div>
        <p className="text-muted-foreground">No products to display.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          source={source}
          priority={index < 4}
        />
      ))}
    </div>
  )
}

// ============================================================
// Luna Beauty — Products Listing Page
// ============================================================

import type { Metadata } from 'next'
import { PRODUCTS, getCategories, getBrands } from '@/lib/products'
import { ProductGrid } from '@/components/ProductGrid'

interface Props {
  searchParams: Promise<{
    category?: string
    brand?: string
    q?: string
    sort?: string
  }>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams
  const category = params.category
  const q = params.q

  if (category) {
    return {
      title: `${category} Products`,
      description: `Shop luxury ${category.toLowerCase()} products at Luna Beauty — curated by AI, available on Amazon.`,
    }
  }
  if (q) {
    return {
      title: `Search: "${q}"`,
      description: `Search results for "${q}" at Luna Beauty.`,
    }
  }
  return {
    title: 'All Products',
    description: 'Browse 60+ luxury beauty products — Fenty, Charlotte Tilbury, Dior, Olaplex & more.',
  }
}

export default async function ProductsPage({ searchParams }: Props) {
  const params = await searchParams
  const { category, brand, q, sort } = params

  const categories = getCategories()
  const brands = getBrands()

  // Filter products
  let products = PRODUCTS

  if (q) {
    const query = q.toLowerCase()
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.brand.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.tags.some((t) => t.includes(query))
    )
  }

  if (category) {
    products = products.filter((p) => p.category === category)
  }

  if (brand) {
    products = products.filter((p) => p.brand === brand)
  }

  // Sort
  if (sort === 'price_low') products = [...products].sort((a, b) => a.price - b.price)
  else if (sort === 'price_high') products = [...products].sort((a, b) => b.price - a.price)
  else if (sort === 'rating') products = [...products].sort((a, b) => b.rating - a.rating)
  else products = [...products].sort((a, b) => (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0))

  const pageTitle = category
    ? `${category}`
    : brand
    ? `${brand}`
    : q
    ? `Results for "${q}"`
    : 'All Products'

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-luna-blush/20 to-luna-champagne/20 py-12">
        <div className="container">
          <h1 className="text-3xl md:text-4xl font-display font-semibold mb-2">{pageTitle}</h1>
          <p className="text-muted-foreground">
            {products.length} product{products.length !== 1 ? 's' : ''} found
          </p>
        </div>
      </div>

      <div className="container py-10">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-56 shrink-0">
            {/* Search */}
            <form className="mb-6">
              <label className="text-sm font-medium mb-2 block">Search</label>
              <input
                type="text"
                name="q"
                defaultValue={q}
                placeholder="Search products..."
                className="w-full px-4 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              {/* Preserve other filters */}
              {category && <input type="hidden" name="category" value={category} />}
              {brand && <input type="hidden" name="brand" value={brand} />}
              {sort && <input type="hidden" name="sort" value={sort} />}
              <button
                type="submit"
                className="mt-2 w-full py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Search
              </button>
            </form>

            {/* Sort */}
            <div className="mb-6">
              <label className="text-sm font-medium mb-2 block">Sort By</label>
              <div className="flex flex-col gap-1">
                {[
                  { value: 'bestseller', label: 'Bestseller' },
                  { value: 'rating', label: 'Highest Rated' },
                  { value: 'price_low', label: 'Price: Low to High' },
                  { value: 'price_high', label: 'Price: High to Low' },
                ].map((option) => (
                  <a
                    key={option.value}
                    href={`/products?${new URLSearchParams({
                      ...(category ? { category } : {}),
                      ...(brand ? { brand } : {}),
                      ...(q ? { q } : {}),
                      sort: option.value,
                    }).toString()}`}
                    className={`px-3 py-1.5 rounded text-sm transition-colors ${
                      sort === option.value
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    {option.label}
                  </a>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div className="mb-6">
              <label className="text-sm font-medium mb-2 block">Category</label>
              <div className="flex flex-col gap-1 max-h-64 overflow-y-auto">
                <a
                  href={`/products?${new URLSearchParams({
                    ...(brand ? { brand } : {}),
                    ...(q ? { q } : {}),
                    ...(sort ? { sort } : {}),
                  }).toString()}`}
                  className={`px-3 py-1.5 rounded text-sm transition-colors ${
                    !category ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                  }`}
                >
                  All Categories
                </a>
                {categories.map((cat) => (
                  <a
                    key={cat}
                    href={`/products?${new URLSearchParams({
                      category: cat,
                      ...(brand ? { brand } : {}),
                      ...(q ? { q } : {}),
                      ...(sort ? { sort } : {}),
                    }).toString()}`}
                    className={`px-3 py-1.5 rounded text-sm transition-colors ${
                      category === cat
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    {cat}
                  </a>
                ))}
              </div>
            </div>

            {/* Brands */}
            <div className="mb-6">
              <label className="text-sm font-medium mb-2 block">Brand</label>
              <div className="flex flex-col gap-1 max-h-64 overflow-y-auto">
                <a
                  href={`/products?${new URLSearchParams({
                    ...(category ? { category } : {}),
                    ...(q ? { q } : {}),
                    ...(sort ? { sort } : {}),
                  }).toString()}`}
                  className={`px-3 py-1.5 rounded text-sm transition-colors ${
                    !brand ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                  }`}
                >
                  All Brands
                </a>
                {brands.map((b) => (
                  <a
                    key={b}
                    href={`/products?${new URLSearchParams({
                      brand: b,
                      ...(category ? { category } : {}),
                      ...(q ? { q } : {}),
                      ...(sort ? { sort } : {}),
                    }).toString()}`}
                    className={`px-3 py-1.5 rounded text-sm transition-colors ${
                      brand === b
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    {b}
                  </a>
                ))}
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {products.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-xl font-display mb-2">No products found</h3>
                <p className="text-muted-foreground mb-6">
                  Try a different search term or browse all products.
                </p>
                <a href="/products" className="text-primary hover:underline">
                  View all products →
                </a>
              </div>
            ) : (
              <ProductGrid products={products} source="products-page" />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

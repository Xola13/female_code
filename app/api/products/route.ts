// ============================================================
// Luna Beauty — Products API
// Serves product data (with optional Supabase fallback to seed)
// ============================================================

import { NextResponse } from 'next/server'
import { PRODUCTS, searchProducts, getProductsByCategory } from '@/lib/products'

export const runtime = 'edge'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const query = searchParams.get('q')
  const category = searchParams.get('category')
  const featured = searchParams.get('featured') === 'true'
  const bestseller = searchParams.get('bestseller') === 'true'
  const limit = parseInt(searchParams.get('limit') ?? '20', 10)

  let products = PRODUCTS

  if (query) {
    products = searchProducts(query)
  } else if (category) {
    products = getProductsByCategory(category)
  } else if (featured) {
    products = PRODUCTS.filter((p) => p.isFeatured)
  } else if (bestseller) {
    products = PRODUCTS.filter((p) => p.isBestseller)
  }

  return NextResponse.json({
    products: products.slice(0, limit),
    total: products.length,
  })
}

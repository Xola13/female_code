import Link from 'next/link'
import { Sparkles } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="text-5xl mb-4">🌸</div>
      <h1 className="text-3xl font-display font-semibold mb-3">Page not found</h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        This page seems to have gone missing. But Luna has plenty of beautiful products waiting for you.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/"
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          Back to Luna Beauty
        </Link>
        <Link
          href="/products"
          className="px-6 py-3 rounded-full border border-border hover:bg-muted transition-colors font-medium"
        >
          Browse Products
        </Link>
      </div>
    </div>
  )
}

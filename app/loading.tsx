import { ProductGridSkeleton } from '@/components/LoadingSkeleton'
import { Sparkles } from 'lucide-react'

export default function Loading() {
  return (
    <div className="container py-12">
      <div className="flex items-center gap-2 mb-8">
        <Sparkles className="w-5 h-5 text-luna-gold animate-pulse" />
        <p className="text-muted-foreground">Luna is curating...</p>
      </div>
      <ProductGridSkeleton count={8} />
    </div>
  )
}

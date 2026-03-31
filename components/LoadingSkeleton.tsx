// Loading skeleton components for all content types

export function ProductCardSkeleton() {
  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden animate-pulse">
      {/* Image skeleton */}
      <div className="aspect-square bg-muted shimmer" />
      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        <div className="h-3 bg-muted rounded w-1/3 shimmer" />
        <div className="h-4 bg-muted rounded w-4/5 shimmer" />
        <div className="h-4 bg-muted rounded w-3/5 shimmer" />
        <div className="h-3 bg-muted rounded w-2/3 shimmer" />
        <div className="flex justify-between items-center">
          <div className="h-5 bg-muted rounded w-1/4 shimmer" />
          <div className="h-8 bg-muted rounded-full w-20 shimmer" />
        </div>
      </div>
    </div>
  )
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function RecommendationSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      {/* Reason text */}
      <div className="h-5 bg-muted rounded shimmer w-3/4 mx-auto" />
      <div className="h-4 bg-muted rounded shimmer w-1/2 mx-auto" />
      <ProductGridSkeleton count={4} />
    </div>
  )
}

export function ChatMessageSkeleton() {
  return (
    <div className="flex gap-3 animate-pulse">
      <div className="w-8 h-8 rounded-full bg-muted shimmer shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-muted rounded shimmer w-3/4" />
        <div className="h-4 bg-muted rounded shimmer w-1/2" />
      </div>
    </div>
  )
}

export function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-luna-berry to-luna-gold flex items-center justify-center shrink-0">
        <span className="text-white text-xs font-bold">L</span>
      </div>
      <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
        <div className="typing-dot" />
        <div className="typing-dot" />
        <div className="typing-dot" />
      </div>
    </div>
  )
}

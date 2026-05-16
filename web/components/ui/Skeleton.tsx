'use client'

export function BlockCardSkeleton() {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="h-3 w-10 bg-zinc-800 rounded mb-2" />
          <div className="h-5 w-24 bg-zinc-800 rounded" />
        </div>
        <div className="h-12 w-14 bg-zinc-800 rounded-lg" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="h-3 w-16 bg-zinc-800 rounded" />
        <div className="h-3 w-14 bg-zinc-800 rounded" />
        <div className="col-span-2 h-3 w-full bg-zinc-800 rounded" />
      </div>
      <div className="mt-3 h-1.5 rounded-full bg-zinc-800" />
    </div>
  )
}

export function BlockListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <BlockCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function BlockDetailSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 animate-pulse">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 mb-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="h-3 w-10 bg-zinc-800 rounded mb-2" />
            <div className="h-8 w-32 bg-zinc-800 rounded" />
          </div>
          <div className="h-16 w-20 bg-zinc-800 rounded-xl" />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 rounded-lg border border-zinc-800 bg-zinc-950/50" />
          ))}
        </div>
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-80 rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6" />
        ))}
      </div>
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 animate-pulse">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl border border-zinc-800 bg-zinc-900/30" />
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-80 rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6" />
        ))}
      </div>
    </div>
  )
}

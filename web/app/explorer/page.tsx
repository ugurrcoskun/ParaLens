'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Loader2 } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import { useLatestBlocks } from '@/hooks/useLatestBlocks'
import { computeParallelScore } from '@/lib/parallelScore'
import type { BlockData } from '@/lib/monad'
import BlockCard from '@/components/blocks/BlockCard'
import Navigation from '@/components/Navigation'
import NetworkUnavailable from '@/components/NetworkUnavailable'

export default function ExplorerPage() {
  const [isClient, setIsClient] = useState(false)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<'live' | 'top'>('live')
  const router = useRouter()
  useEffect(() => { setIsClient(true) }, [])

  const { data: blocks, isLoading, error, refetch } = useLatestBlocks(20, {
    enabled: isClient,
  })

  // Fetch more blocks for Top Parallel tab to find high scorers
  const { data: allBlocks } = useLatestBlocks(120, {
    enabled: isClient && tab === 'top',
  })

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      const q = search.trim()
      if (!q) return

      if (q.startsWith('0x') && q.length === 66) {
        router.push(`/explorer/${q}`)
      } else if (/^\d+$/.test(q)) {
        router.push(`/explorer/${q}`)
      }
    },
    [search, router],
  )

  const topBlocks = useMemo(() => {
    const source = allBlocks ?? blocks
    if (!source) return null
    return [...source]
      .sort((a, b) => computeParallelScore(b).total - computeParallelScore(a).total)
      .slice(0, 12)
  }, [allBlocks, blocks])

  const displayBlocks = (tab === 'top' && topBlocks ? topBlocks : blocks) ?? []

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="pt-14">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-zinc-100">Block Explorer</h2>
            <p className="mt-1 text-sm text-zinc-400">
              Live Monad testnet blocks with parallel execution scoring
            </p>
          </div>

          <form onSubmit={handleSearch} className="mb-8">
            <div className="relative max-w-xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by block number or tx hash..."
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 pl-10 pr-4 py-3 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-orange-600/50 focus:ring-1 focus:ring-orange-600/30 transition-all"
              />
            </div>
          </form>

          {!isClient && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 text-orange-400 animate-spin" />
            </div>
          )}

          {isClient && isLoading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 text-orange-400 animate-spin" />
            </div>
          )}

          {isClient && error && !blocks && (
            <NetworkUnavailable onRetry={() => refetch()} />
          )}

          {blocks && (
            <>
              <div className="flex items-center gap-1 mb-6 border-b border-zinc-800">
                <button
                  onClick={() => setTab('live')}
                  className={`font-mono uppercase text-xs px-4 py-2.5 border border-b-0 transition-colors ${
                    tab === 'live'
                      ? 'bg-orange-600 text-white border-orange-600'
                      : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:text-zinc-300'
                  }`}
                >
                  Live Feed
                </button>
                <button
                  onClick={() => setTab('top')}
                  className={`font-mono uppercase text-xs px-4 py-2.5 border border-b-0 transition-colors ${
                    tab === 'top'
                      ? 'bg-orange-600 text-white border-orange-600'
                      : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:text-zinc-300'
                  }`}
                >
                  Top Parallel
                </button>
                {tab === 'top' && topBlocks && (
                  <div className="ml-auto flex items-center gap-4">
                    <span className="text-xs text-zinc-500 font-mono">
                      Top {topBlocks.length} of {allBlocks?.length ?? blocks.length} blocks scanned
                    </span>
                    {allBlocks && (
                      <span className="text-xs text-orange-400 font-mono">
                        Highest: {computeParallelScore(topBlocks[0]).total}%
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence mode="popLayout">
                  {displayBlocks.map((block) => (
                    <BlockCard key={block.hash} block={block} />
                  ))}
                </AnimatePresence>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

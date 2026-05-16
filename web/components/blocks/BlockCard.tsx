'use client'

import { computeParallelScore, scoreColorHex, scoreLabel } from '@/lib/parallelScore'
import type { BlockData } from '@/lib/monad'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface BlockCardProps {
  block: BlockData
}

export default function BlockCard({ block }: BlockCardProps) {
  const score = computeParallelScore(block)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.3 }}
    >
      <Link
        href={`/explorer/${block.number}`}
        className="block rounded-xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/60 hover:border-zinc-700 transition-all p-4 group"
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="text-xs font-medium text-zinc-500 mb-0.5">Block</div>
            <div className="text-lg font-bold font-mono text-zinc-100 group-hover:text-orange-400 transition-colors">
              #{block.number.toLocaleString()}
            </div>
          </div>
          <div
            className="flex flex-col items-center rounded-lg px-3 py-1.5"
            style={{ backgroundColor: `${scoreColorHex(score.total)}15` }}
          >
            <div
              className="text-lg font-bold font-mono"
              style={{ color: scoreColorHex(score.total) }}
            >
              {score.total}
            </div>
            <div
              className="text-[10px] font-semibold uppercase tracking-wider"
              style={{ color: scoreColorHex(score.total) }}
            >
              {scoreLabel(score.total)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-zinc-500">TXs</span>
            <span className="ml-2 text-zinc-300 font-mono">{block.txCount}</span>
          </div>
          <div>
            <span className="text-zinc-500">Gas</span>
            <span className="ml-2 text-zinc-300 font-mono">
              {(Number(block.gasUsed) / 1_000_000).toFixed(1)}M
            </span>
          </div>
          <div className="col-span-2">
            <span className="text-zinc-500">Hash</span>
            <span className="ml-2 text-zinc-500 font-mono text-[10px] truncate block">
              {block.hash}
            </span>
          </div>
        </div>

        <div className="mt-3 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: scoreColorHex(score.total) }}
            initial={{ width: 0 }}
            animate={{ width: `${score.total}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
      </Link>
    </motion.div>
  )
}

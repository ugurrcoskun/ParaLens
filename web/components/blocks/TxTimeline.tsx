'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import type { BlockData } from '@/lib/monad'

interface TxRow {
  hash: `0x${string}`
  gas: number
  from: string
  to: string | null
  isContractCall: boolean
}

function groupTransactions(txs: BlockData['transactions']): TxRow[][] {
  const rows: TxRow[][] = []
  const mapped: TxRow[] = txs.map((tx) => ({
    hash: tx.hash,
    gas: Number(tx.gas ?? 0n),
    from: tx.from,
    to: tx.to,
    isContractCall: (tx.input ?? '0x').length > 2,
  }))
  mapped.sort((a, b) => b.gas - a.gas)

  let remaining = [...mapped]
  while (remaining.length > 0) {
    const row: TxRow[] = []
    const next: TxRow[] = []
    for (const tx of remaining) {
      if (row.length < 6) {
        row.push(tx)
      } else {
        next.push(tx)
      }
    }
    rows.push(row)
    remaining = next
  }

  return rows
}

function gasColor(gas: number, maxGas: number): string {
  const ratio = maxGas > 0 ? gas / maxGas : 0
  if (ratio > 0.8) return '#EF4444'
  if (ratio > 0.55) return '#F97316'
  if (ratio > 0.3) return '#EAB308'
  return '#A16207'
}

export default function TxTimeline({ block }: { block: BlockData }) {
  const [hoveredTx, setHoveredTx] = useState<string | null>(null)
  const rows = useMemo(() => groupTransactions(block.transactions), [block])
  const maxGas = useMemo(
    () => Math.max(...block.transactions.map((tx) => Number(tx.gas ?? 0n)), 1),
    [block.transactions],
  )
  const totalTx = block.txCount

  if (rows.length === 0) {
    return (
      <div className="text-center text-zinc-500 py-12 font-mono text-xs uppercase tracking-widest">
        No Transactions
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-widest flex items-center gap-2">
          Execution Timeline
          <span className="text-[10px] text-zinc-600 font-normal tracking-normal normal-case">
            {totalTx} tx in {rows.length} groups
          </span>
        </h3>
        <div className="flex items-center gap-3 text-[10px] font-mono text-zinc-500">
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 bg-[#A16207]" />
            Low
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 bg-[#EAB308]" />
            Mid
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 bg-[#F97316]" />
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 bg-[#EF4444]" />
            High
          </div>
        </div>
      </div>

      <div className="border border-zinc-800 bg-[#0f0f0f] overflow-hidden">
        <div className="px-4 py-3 space-y-1.5">
          {rows.map((row, ri) => {
            const rowMaxGas = Math.max(...row.map((t) => t.gas), 1)
            // Scale within row — each bar gets space proportionally
            const totalWeight = row.reduce((a, t) => a + Math.sqrt(t.gas / rowMaxGas), 0)

            return (
              <motion.div
                key={ri}
                className="flex items-center"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: ri * 0.08, duration: 0.3 }}
              >
                <div className="w-12 flex-shrink-0">
                  <span className="text-[9px] font-mono text-zinc-500">
                    GRP{ri}
                  </span>
                </div>
                <div className="flex-1 h-7 bg-zinc-900/60 border border-zinc-800/40 flex items-stretch gap-px overflow-hidden">
                  {row.map((tx, txi) => {
                    // Bar width proportional to sqrt(gas) for better visual balance
                    const weight = Math.sqrt(tx.gas / rowMaxGas)
                    const flexBasis = `${(weight / totalWeight) * 100}%`
                    const color = gasColor(tx.gas, maxGas)
                    const isHovered = hoveredTx === tx.hash

                    return (
                      <motion.div
                        key={tx.hash}
                        className="relative cursor-default group flex items-center justify-center"
                        style={{
                          flexBasis,
                          flexGrow: 0,
                          flexShrink: 0,
                          minWidth: '2px',
                          backgroundColor: color,
                          opacity: isHovered ? 1 : 0.75,
                        }}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{
                          delay: ri * 0.08 + txi * 0.03,
                          duration: 0.4,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                        onMouseEnter={() => setHoveredTx(tx.hash)}
                        onMouseLeave={() => setHoveredTx(null)}
                      >
                        {isHovered && (
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-50 pointer-events-none">
                            <div className="border border-zinc-700 bg-[#18181b] px-2.5 py-1.5 whitespace-nowrap">
                              <div className="text-[10px] font-mono text-zinc-200">
                                TX {tx.hash.slice(2, 8)}
                              </div>
                              <div className="text-[9px] font-mono text-zinc-500 mt-0.5">
                                {(tx.gas / 1000).toFixed(0)}k gas
                                {tx.isContractCall ? ' · Contract' : ' · Transfer'}
                              </div>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>
            )
          })}
        </div>

        <div className="border-t border-zinc-800 px-4 py-2 flex items-center gap-4 text-[9px] font-mono text-zinc-600">
          <span>Each group = potentially parallel txs</span>
          <span className="text-zinc-800">|</span>
          <span>Bar width ∝ √gas</span>
        </div>
      </div>

      <div className="flex justify-between text-[10px] font-mono text-zinc-600">
        <span>{rows.length} PARALLEL GROUPS</span>
        <span>{totalTx} TOTAL TRANSACTIONS</span>
      </div>
    </div>
  )
}

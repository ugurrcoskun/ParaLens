'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import type { BlockData } from '@/lib/monad'

function gasColor(gas: number, maxGas: number): string {
  const ratio = maxGas > 0 ? gas / maxGas : 0
  if (ratio > 0.75) return '#ef4444'
  if (ratio > 0.5) return '#f97316'
  if (ratio > 0.25) return '#eab308'
  return '#a16207'
}

export default function TxHeatmap({ block }: { block: BlockData }) {
  const [hovered, setHovered] = useState<string | null>(null)

  const { bars, maxGas, contractCount, transferCount } = useMemo(() => {
    const txs = [...block.transactions]
      .map((tx) => ({
        hash: tx.hash,
        gas: Number(tx.gas ?? 0n),
        from: tx.from,
        to: tx.to,
        isContract: (tx.input ?? '0x').length > 10,
      }))
      .sort((a, b) => b.gas - a.gas)
      .slice(0, 80)

    const max = Math.max(...txs.map((t) => t.gas), 1)
    const contracts = txs.filter((t) => t.isContract).length

    return {
      bars: txs,
      maxGas: max,
      contractCount: contracts,
      transferCount: txs.length - contracts,
    }
  }, [block.transactions])

  const totalGas = bars.reduce((sum, b) => sum + b.gas, 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-widest flex items-center gap-2">
          Gas Density Spectrum
          <span className="text-[10px] text-zinc-600 font-normal tracking-normal normal-case">
            {bars.length} transactions
          </span>
        </h3>
        <div className="flex items-center gap-3 text-[10px] font-mono text-zinc-500">
          <span>{transferCount} transfers</span>
          <span className="text-zinc-700">|</span>
          <span>{contractCount} contracts</span>
          <span className="text-zinc-700">|</span>
          <span>{(totalGas / 1_000_000).toFixed(1)}M gas</span>
        </div>
      </div>

      <div className="border border-zinc-800 bg-[#0f0f0f] p-3">
        <div className="flex items-center justify-between text-[9px] font-mono text-zinc-600 mb-1.5 px-1">
          <span>TX HASH</span>
          <span>GAS USED</span>
        </div>

        <div className="space-y-px">
          {bars.map((bar, i) => {
            const widthPct = (bar.gas / maxGas) * 100
            const color = gasColor(bar.gas, maxGas)
            const isHovered = hovered === bar.hash

            return (
              <motion.div
                key={bar.hash}
                className="flex items-center h-6 group cursor-default relative"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.015, duration: 0.25 }}
                onMouseEnter={() => setHovered(bar.hash)}
                onMouseLeave={() => setHovered(null)}
              >
                <div className="w-16 flex-shrink-0 pr-2">
                  <span className="text-[9px] font-mono text-zinc-500">
                    {bar.hash.slice(2, 10)}
                  </span>
                </div>

                <div className="flex-1 relative h-4">
                  <div className="absolute inset-0 bg-zinc-900" />
                  <motion.div
                    className="absolute inset-y-0 left-0"
                    style={{
                      backgroundColor: color,
                      opacity: isHovered ? 1 : 0.8,
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${widthPct}%` }}
                    transition={{ delay: i * 0.015 + 0.2, duration: 0.4, ease: 'easeOut' }}
                  />
                  <motion.div
                    className="absolute inset-y-0 left-0 w-px"
                    style={{ backgroundColor: color }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.4, 0] }}
                    transition={{ delay: i * 0.015 + 0.6, duration: 0.3 }}
                  />
                </div>

                <div className="w-20 flex-shrink-0 text-right pl-2">
                  <span
                    className="text-[9px] font-mono tabular-nums"
                    style={{ color: isHovered ? color : '#71717a' }}
                  >
                    {(bar.gas / 1000).toFixed(0)}k
                  </span>
                </div>

                {bar.isContract && (
                  <div className="w-3 flex-shrink-0 flex justify-center">
                    <div
                      className="h-1 w-1"
                      style={{ backgroundColor: color }}
                    />
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>

        <div className="flex items-center gap-3 mt-3 pt-2 border-t border-zinc-800 text-[9px] font-mono text-zinc-600">
          <div className="flex items-center gap-1">
            <div className="h-1.5 w-1.5 bg-[#a16207]" />
            low gas
          </div>
          <div className="flex items-center gap-1">
            <div className="h-1.5 w-1.5 bg-[#eab308]" />
          </div>
          <div className="flex items-center gap-1">
            <div className="h-1.5 w-1.5 bg-[#f97316]" />
          </div>
          <div className="flex items-center gap-1">
            <div className="h-1.5 w-1.5 bg-[#ef4444]" />
            high gas
          </div>
        </div>
      </div>

      {hovered && (
        <div className="border border-zinc-800 bg-[#18181b] p-3 font-mono text-[10px]">
          <div className="flex items-center gap-2 text-zinc-400">
            <span className="text-zinc-600">TX</span>
            <span className="text-zinc-200">
              {bars.find((b) => b.hash === hovered)?.hash.slice(0, 14)}...
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1 text-zinc-500">
            <span className="text-zinc-600">GAS</span>
            <span>{(bars.find((b) => b.hash === hovered)?.gas ?? 0).toLocaleString()}</span>
            <span className="text-zinc-600">
              {bars.find((b) => b.hash === hovered)?.isContract ? 'CONTRACT' : 'TRANSFER'}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

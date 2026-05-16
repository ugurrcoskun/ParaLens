'use client'

import { useParams } from 'next/navigation'
import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useBlockDetail } from '@/hooks/useBlockDetail'
import { computeParallelScore, scoreColorHex, scoreLabel } from '@/lib/parallelScore'
import { analyzeBlock } from '@/lib/contractAnalyzer'
import type { Suggestion } from '@/lib/contractAnalyzer'
import Navigation from '@/components/Navigation'
import TxTimeline from '@/components/blocks/TxTimeline'
import TxHeatmap from '@/components/blocks/TxHeatmap'
import SuggestionCard from '@/components/blocks/SuggestionCard'
import { Loader2, Lightbulb, AlertTriangle, CheckCircle2, Info, ExternalLink } from 'lucide-react'

function DonutChart({ scores }: { scores: { label: string; value: number; max: number; color: string }[] }) {
  const size = 160
  const strokeWidth = 24
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const center = size / 2

  let offset = 0
  const segments = scores.map((s) => {
    const pct = s.max > 0 ? s.value / s.max : 0
    const dashLength = pct * circumference
    const seg = { ...s, dashLength, dashOffset: circumference - offset, pct }
    offset += dashLength
    return seg
  })

  const remaining = circumference - offset
  if (remaining > 0.5) {
    segments.push({
      label: '',
      value: 0,
      max: 0,
      color: '#27272a',
      dashLength: remaining,
      dashOffset: circumference - offset,
      pct: 0,
    })
  }

  const total = scores.reduce((a, s) => a + s.value, 0)

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full -rotate-90">
          {segments.map((seg, i) => (
            <motion.circle
              key={i}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeLinecap="butt"
              strokeDasharray={`${seg.dashLength} ${circumference - seg.dashLength}`}
              strokeDashoffset={-seg.dashOffset}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 + i * 0.15, duration: 0.5 }}
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            className="text-3xl font-bold font-mono text-zinc-100"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.5 }}
          >
            {total}
          </motion.div>
          <div className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest mt-0.5">
            SCORE
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1.5 w-full">
        {scores.map((s, i) => (
          <motion.div
            key={i}
            className="flex items-center justify-between"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 + i * 0.1 }}
          >
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5" style={{ backgroundColor: s.color }} />
              <span className="text-[11px] text-zinc-400 font-mono">{s.label}</span>
            </div>
            <span className="text-[11px] font-mono text-zinc-300">
              {s.value}/{s.max}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function TxTypeDistribution({
  block,
}: {
  block: NonNullable<ReturnType<typeof useBlockDetail>['data']>
}) {
  const distribution = useMemo(() => {
    let transfers = 0
    let contractCalls = 0
    for (const tx of block.transactions) {
      if ((tx.input ?? '0x').length > 2) {
        contractCalls++
      } else {
        transfers++
      }
    }
    const total = transfers + contractCalls || 1
    return {
      transfers,
      contractCalls,
      transferPct: (transfers / total) * 100,
      contractPct: (contractCalls / total) * 100,
    }
  }, [block.transactions])

  return (
    <div className="space-y-3">
      <h4 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">
        Tx Type Distribution
      </h4>
      <div className="flex h-6 border border-zinc-800 bg-zinc-950">
        <motion.div
          className="h-full bg-orange-500"
          initial={{ width: 0 }}
          animate={{ width: `${distribution.transferPct}%` }}
          transition={{ delay: 0.7, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        />
        <motion.div
          className="h-full bg-red-500"
          initial={{ width: 0 }}
          animate={{ width: `${distribution.contractPct}%` }}
          transition={{ delay: 0.7, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
      <div className="flex gap-4 text-[10px] font-mono">
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 bg-orange-500" />
          <span className="text-zinc-400">TRANSFERS</span>
          <span className="text-zinc-600">{distribution.transfers}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 bg-red-500" />
          <span className="text-zinc-400">CONTRACT CALLS</span>
          <span className="text-zinc-600">{distribution.contractCalls}</span>
        </div>
      </div>
    </div>
  )
}

function GasPriceRange({ block }: { block: NonNullable<ReturnType<typeof useBlockDetail>['data']> }) {
  const range = useMemo(() => {
    const prices = block.transactions
      .map((tx) => Number(tx.gasPrice ?? 0n))
      .filter((p) => p > 0)
    if (prices.length === 0) return { min: 0, max: 0, avg: 0, spread: 0 }
    const min = Math.min(...prices)
    const max = Math.max(...prices)
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length
    const spread = max - min || 1
    return { min, max, avg, spread }
  }, [block.transactions])

  const maxGwei = range.max / 1e9
  const minGwei = range.min / 1e9
  const avgGwei = range.avg / 1e9
  const rangeGwei = maxGwei - minGwei || 1
  const avgPos = ((avgGwei - minGwei) / rangeGwei) * 100

  return (
    <div className="space-y-3">
      <h4 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">
        Gas Price Range
      </h4>

      <div className="relative h-8 border border-zinc-800 bg-zinc-950 flex items-center px-2">
        <div className="absolute inset-2 flex items-center">
          <div className="relative w-full h-2 bg-zinc-800">
            <motion.div
              className="absolute h-full bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ delay: 0.8, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            />
            <motion.div
              className="absolute top-1/2 -translate-y-1/2 w-1.5 h-5 bg-zinc-100"
              style={{ left: `${avgPos}%` }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-between text-[10px] font-mono">
        <div className="text-zinc-500">
          MIN <span className="text-zinc-300">{minGwei.toFixed(2)}</span> GWEI
        </div>
        <div className="text-zinc-500">
          AVG <span className="text-zinc-300">{avgGwei.toFixed(2)}</span> GWEI
        </div>
        <div className="text-zinc-500">
          MAX <span className="text-zinc-300">{maxGwei.toFixed(2)}</span> GWEI
        </div>
      </div>
    </div>
  )
}

export default function BlockDetailPage() {
  const params = useParams()
  const blockParam = params.block as string
  const blockNumber = blockParam.startsWith('0x') ? 0n : BigInt(blockParam || '0')
  const { data: block, isLoading, error } = useBlockDetail(blockNumber)

  // ALL hooks must be before any conditional return
  const score = useMemo(() => (block ? computeParallelScore(block) : null), [block])
  const colorHex = score ? scoreColorHex(score.total) : '#ef4444'
  const analysis = useMemo(() => (block && score ? analyzeBlock(block, score) : null), [block, score])
  const timestamp = block ? new Date(Number(block.timestamp) * 1000) : new Date()
  const gasUtilPct = block
    ? (Number(block.gasLimit) > 0 ? ((Number(block.gasUsed) / Number(block.gasLimit)) * 100).toFixed(1) : '0')
    : '0'

  const donutScores = score
    ? [
        { label: 'TX COUNT', value: score.txCountScore, max: 40, color: '#F97316' },
        { label: 'GAS VARIANCE', value: score.gasVarianceScore, max: 35, color: '#EAB308' },
        { label: 'UTILIZATION', value: score.utilizationScore, max: 25, color: '#EF4444' },
      ]
    : []

  const container = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.06 } },
  }

  const item = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } },
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#18181b]">
        <Navigation />
        <main className="pt-14 flex items-center justify-center min-h-[80vh]">
          <Loader2 className="h-8 w-8 text-orange-400 animate-spin" />
        </main>
      </div>
    )
  }

  if (error || !block || !score || !analysis) {
    return (
      <div className="min-h-screen bg-[#18181b]">
        <Navigation />
        <main className="pt-14 flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <p className="text-zinc-400 text-lg font-mono">BLOCK NOT FOUND</p>
            <p className="text-zinc-600 text-xs mt-1 font-mono">
              RPC may be unavailable
            </p>
          </div>
        </main>
      </div>
    )
  }

  // After guards, block/score/analysis are non-null
  const s = score!
  const a = analysis!
  const ts = new Date(Number(block!.timestamp) * 1000)

  return (
    <div className="min-h-screen bg-[#18181b]">
      <Navigation />
      <main className="pt-14">
        <div className="mx-auto max-w-7xl px-4 py-8">
          {/* BLOCK HEADER */}
          <motion.div
            className="border border-zinc-800 bg-[#18181b]/50 mb-6"
            variants={container}
            initial="hidden"
            animate="visible"
          >
            <div className="grid lg:grid-cols-3">
              <div className="lg:col-span-2 p-6 border-b lg:border-b-0 lg:border-r border-zinc-800">
                <motion.div variants={item} className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mb-2">
                  BLOCK NUMBER
                </motion.div>
                <motion.div variants={item} className="flex items-baseline gap-3">
                  <span className="text-5xl font-bold font-mono text-zinc-100">
                    #{block.number.toLocaleString()}
                  </span>
                </motion.div>

                <motion.div variants={item} className="mt-4 font-mono text-xs text-zinc-600 break-all">
                  {block.hash}
                </motion.div>

                <motion.div variants={item} className="mt-4 flex flex-wrap gap-3 text-[10px] font-mono">
                  <div className="border border-zinc-800 px-2.5 py-1.5 bg-zinc-950/50">
                    <span className="text-zinc-600">TIMESTAMP </span>
                    <span className="text-zinc-300">
                      {timestamp.toLocaleDateString('en-US', {
                        month: 'short',
                        day: '2-digit',
                        year: 'numeric',
                      })}{' '}
                      {timestamp.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: false,
                      })}
                    </span>
                  </div>
                  <div className="border border-zinc-800 px-2.5 py-1.5 bg-zinc-950/50">
                    <span className="text-zinc-600">MINER </span>
                    <span className="text-zinc-300">
                      {block.miner.slice(0, 10)}...{block.miner.slice(-6)}
                    </span>
                  </div>
                </motion.div>
              </div>

              <div className="p-6 flex flex-col justify-center items-center gap-3">
                <motion.div
                  variants={item}
                  className="text-center"
                >
                  <motion.div
                    className="text-7xl font-bold font-mono"
                    style={{ color: colorHex }}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 180, damping: 14, delay: 0.2 }}
                  >
                    {score.total}
                  </motion.div>
                  <div
                    className="text-sm font-mono uppercase tracking-[0.2em] mt-1"
                    style={{ color: colorHex }}
                  >
                    {scoreLabel(score.total)} PARALLEL
                  </div>
                </motion.div>
              </div>
            </div>

            {/* STATS ROW */}
            <div className="grid grid-cols-2 lg:grid-cols-4 border-t border-zinc-800">
              {[
                { label: 'TRANSACTIONS', value: block.txCount.toLocaleString() },
                { label: 'GAS USED', value: `${(Number(block.gasUsed) / 1_000_000).toFixed(1)}M` },
                { label: 'GAS LIMIT', value: `${(Number(block.gasLimit) / 1_000_000).toFixed(0)}M` },
                { label: 'UTILIZATION', value: `${gasUtilPct}%` },
              ].map((stat) => (
                <motion.div
                  key={stat.label}
                  variants={item}
                  className="p-4 border-r border-zinc-800 last:border-r-0"
                >
                  <div className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest mb-1">
                    {stat.label}
                  </div>
                  <div className="text-2xl font-bold font-mono text-zinc-100">
                    {stat.value}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* SCORE BREAKDOWN + DISTRIBUTIONS */}
          <div className="grid lg:grid-cols-3 gap-6 mb-6">
            <div className="border border-zinc-800 bg-[#18181b]/50 p-6">
              <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-widest mb-4">
                Score Breakdown
              </h3>
              <DonutChart scores={donutScores} />
            </div>
            <div className="border border-zinc-800 bg-[#18181b]/50 p-6">
              <TxTypeDistribution block={block} />
            </div>
            <div className="border border-zinc-800 bg-[#18181b]/50 p-6">
              <GasPriceRange block={block} />
            </div>
          </div>

          {/* TIMELINE + HEATMAP */}
          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            <div className="border border-zinc-800 bg-[#18181b]/50 p-6">
              <TxHeatmap block={block} />
            </div>
            <div className="border border-zinc-800 bg-[#18181b]/50 p-6">
              <TxTimeline block={block} />
            </div>
          </div>

          {/* CONTRACT ANALYSIS + OPTIMIZATION */}
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="border border-zinc-800 bg-[#18181b]/50 p-6">
              <div className="flex items-center gap-2 mb-4">
                <ExternalLink className="h-4 w-4 text-orange-400" />
                <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-widest">
                  Contract Analysis
                </h3>
                <span className="text-[10px] text-zinc-600 font-mono">
                  {analysis.contracts.length} contracts
                </span>
              </div>

              {analysis.contracts.length === 0 ? (
                <div className="text-[11px] font-mono text-zinc-500 py-8 text-center">
                  No contract calls in this block — all native transfers
                </div>
              ) : (
                <div className="space-y-2">
                  {analysis.contracts.slice(0, 6).map((contract, i) => (
                    <motion.div
                      key={contract.address}
                      className="border border-zinc-800 bg-zinc-950/50 p-3"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + i * 0.05 }}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-mono text-[10px] text-zinc-400 truncate max-w-[200px]">
                            {contract.address}
                          </div>
                          <div className="flex items-center gap-2 mt-1.5 text-[10px] font-mono">
                            <span className="text-zinc-600">{contract.txCount} TXS</span>
                            <span className="text-zinc-800">|</span>
                            <span className="text-zinc-600">{(contract.totalGas / 1000).toFixed(0)}K GAS</span>
                            <span className="text-zinc-800">|</span>
                            <span className="text-zinc-600">{contract.shareOfTxs}% OF BLOCK</span>
                          </div>
                        </div>
                        {contract.dominatesBlock && (
                          <span className="text-[9px] font-mono text-red-400 bg-red-400/10 px-1.5 py-0.5 uppercase">
                            Dominant
                          </span>
                        )}
                        {contract.isHighGasContract && !contract.dominatesBlock && (
                          <span className="text-[9px] font-mono text-orange-400 bg-orange-400/10 px-1.5 py-0.5 uppercase">
                            Gas Heavy
                          </span>
                        )}
                      </div>
                      <div className="mt-2 flex gap-1">
                        {Array.from({ length: Math.min(contract.txCount, 20) }).map((_, j) => {
                          const ratio = contract.avgGas / 500000
                          const h = 8 + ratio * 20
                          return (
                            <motion.div
                              key={j}
                              className="flex-1"
                              style={{
                                height: Math.min(h, 28),
                                backgroundColor: contract.dominatesBlock
                                  ? '#ef4444'
                                  : contract.isHighGasContract
                                    ? '#f97316'
                                    : '#eab308',
                                opacity: 0.6 + (j / contract.txCount) * 0.4,
                              }}
                              initial={{ scaleY: 0 }}
                              animate={{ scaleY: 1 }}
                              transition={{ delay: 1 + i * 0.05 + j * 0.02, duration: 0.2 }}
                            />
                          )
                        })}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Block stats summary */}
              <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-zinc-800">
                {[
                  { label: 'Senders', value: analysis.uniqueSenders },
                  { label: 'Contracts', value: analysis.uniqueContracts },
                  { label: 'Transfers', value: analysis.transferCount },
                  { label: 'Calls', value: analysis.contractCallCount },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <div className="text-lg font-bold font-mono text-zinc-300">{s.value}</div>
                    <div className="text-[9px] text-zinc-600 font-mono uppercase">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-zinc-800 bg-[#18181b]/50 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="h-4 w-4 text-yellow-400" />
                <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-widest">
                  Optimization Insights
                </h3>
                <span className="text-[10px] text-zinc-600 font-mono">
                  {analysis.suggestions.length} tips
                </span>
              </div>

              {analysis.bottleneck && (
                <motion.div
                  className="border border-red-800/30 bg-red-950/10 p-4 mb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                    <span className="text-xs font-bold text-red-400 uppercase tracking-wider">
                      Bottleneck Detected
                    </span>
                    <span className="text-[9px] font-mono text-red-500/70 uppercase">
                      {analysis.bottleneck.severity}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-300 font-mono leading-relaxed">
                    {analysis.bottleneck.reason}
                  </p>
                </motion.div>
              )}

              <div className="space-y-2">
                {analysis.suggestions.map((sug, i) => (
                  <SuggestionCard key={i} suggestion={sug} index={i} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

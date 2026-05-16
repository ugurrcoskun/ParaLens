'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { BarChart3, TrendingUp, Timer, Zap, Gauge, Activity, Loader2 } from 'lucide-react'
import { motion, useSpring, useMotionValue } from 'framer-motion'
import Navigation from '@/components/Navigation'
import WalletTracker from '@/components/WalletTracker'
import NetworkUnavailable from '@/components/NetworkUnavailable'
import { useLatestBlocks, useNetworkStats } from '@/hooks/useLatestBlocks'
import { computeParallelScore } from '@/lib/parallelScore'

const PENTA_ANGLES = [-90, -18, 54, 126, 198].map((d) => (d * Math.PI) / 180)

type RadarMetric = { label: string; monad: number; eth: number; suffix: string }

const RADAR_METRICS: RadarMetric[] = [
  { label: 'TPS', monad: 0.95, eth: 0.02, suffix: '10K' },
  { label: 'Block Time', monad: 0.95, eth: 0.03, suffix: '0.4s' },
  { label: 'Finality', monad: 0.95, eth: 0.01, suffix: '0.8s' },
  { label: 'Gas Limit', monad: 0.90, eth: 0.15, suffix: '200M' },
  { label: 'Par. Exec', monad: 1.0, eth: 0.0, suffix: 'Yes' },
]

function pentaCoord(cx: number, cy: number, r: number, index: number, value: number) {
  const angle = PENTA_ANGLES[index]
  return {
    x: cx + r * value * Math.cos(angle),
    y: cy + r * value * Math.sin(angle),
  }
}

function pentaPath(cx: number, cy: number, r: number, values: number[]): string {
  return values
    .map((v, i) => {
      const { x, y } = pentaCoord(cx, cy, r, i, v)
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`
    })
    .join(' ') + ' Z'
}

function pentaGridPath(cx: number, cy: number, r: number, scale: number): string {
  return pentaPath(cx, cy, r, Array(5).fill(scale))
}

function labelCoord(cx: number, cy: number, r: number, index: number) {
  const angle = PENTA_ANGLES[index]
  const offset = r + 26
  return {
    x: cx + offset * Math.cos(angle),
    y: cy + offset * Math.sin(angle),
  }
}

const SPARK_DATA: Record<string, number[]> = {
  tps: [1100, 1280, 1190, 1350, 1210, 1270],
  blockTime: [0.42, 0.39, 0.44, 0.38, 0.41, 0.40],
  score: [58, 67, 62, 71, 65, 69],
  gas: [200, 200, 200, 200, 200, 200],
}

function Sparkline({ data, color, w = 90, h = 28 }: { data: number[]; color: string; w?: number; h?: number }) {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const points = data
    .map((d, i) => `${(i / (data.length - 1)) * w},${h - ((d - min) / range) * h}`)
    .join(' ')

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.5}
      />
    </svg>
  )
}

function AnimatedCounter({ value, suffix = '', decimals = 0 }: { value: number | string; suffix?: string; decimals?: number }) {
  const numVal = typeof value === 'string' ? parseFloat(value) : value
  const raw = useMotionValue(0)
  const spring = useSpring(raw, { stiffness: 80, damping: 18 })
  const [display, setDisplay] = useState('0')

  useEffect(() => {
    if (isNaN(numVal)) return
    raw.set(numVal)
  }, [numVal, raw])

  useEffect(() => {
    const fmt = (v: number) =>
      v.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }) + suffix
    spring.set(numVal)
    const unsub = spring.on('change', (latest) => setDisplay(fmt(latest)))
    return unsub
  }, [spring, decimals, suffix, numVal])

  if (isNaN(numVal)) return <span className="font-mono tabular-nums">--</span>

  return <span className="font-mono tabular-nums">{display}</span>
}

export default function DashboardPage() {
  const [isClient, setIsClient] = useState(false)
  useEffect(() => { setIsClient(true) }, [])

  const { data: blocks, isLoading: blocksLoading, error: blocksError, refetch: refetchBlocks } =
    useLatestBlocks(20, { enabled: isClient })
  const { data: stats, isLoading: statsLoading, error: statsError, refetch: refetchStats } =
    useNetworkStats({ enabled: isClient })

  const scoreDistribution = useMemo(() => {
    if (!blocks) return { low: 0, medium: 0, high: 0 }
    let low = 0
    let medium = 0
    let high = 0
    for (const block of blocks) {
      const score = computeParallelScore(block).total
      if (score <= 60) low++
      else if (score <= 80) medium++
      else high++
    }
    return { low, medium, high }
  }, [blocks])

  const avgScore = useMemo(() => {
    if (!blocks || blocks.length === 0) return 0
    return Math.round(
      blocks.reduce((sum, b) => sum + computeParallelScore(b).total, 0) / blocks.length,
    )
  }, [blocks])

  const radarValueSets = useMemo(() => {
    const monadVals = RADAR_METRICS.map((m) => m.monad)
    const ethVals = RADAR_METRICS.map((m) => m.eth)
    const cx = 150, cy = 150, r = 110
    return {
      zeroPath: pentaPath(cx, cy, r, Array(5).fill(0)),
      monadPath: pentaPath(cx, cy, r, monadVals),
      ethPath: pentaPath(cx, cy, r, ethVals),
      gridPaths: [0.25, 0.5, 0.75, 1.0].map((s) => pentaGridPath(cx, cy, r, s)),
    }
  }, [])

  const barMeta = useMemo(() => {
    const total = scoreDistribution.low + scoreDistribution.medium + scoreDistribution.high
    const baseY = 200, maxH = 155
    if (total === 0) {
      return {
        bars: [
          { label: 'Low (0-60)', value: 0, pct: 0, color: '#EF4444' },
          { label: 'Medium (61-80)', value: 0, pct: 0, color: '#EAB308' },
          { label: 'High (81-100)', value: 0, pct: 0, color: '#22C55E' },
        ],
        baseY, maxH,
        total: 0,
      }
    }
    const bars = [
      { label: 'Low (0-60)', value: scoreDistribution.low, pct: Math.round((scoreDistribution.low / total) * 100), color: '#EF4444' },
      { label: 'Medium (61-80)', value: scoreDistribution.medium, pct: Math.round((scoreDistribution.medium / total) * 100), color: '#EAB308' },
      { label: 'High (81-100)', value: scoreDistribution.high, pct: Math.round((scoreDistribution.high / total) * 100), color: '#22C55E' },
    ]
    return { bars, baseY, maxH, total }
  }, [scoreDistribution])

  const cx = 150, cy = 150, r = 110

  const [mockTxHash, setMockTxHash] = useState<string | null>(null)
  const [mockTxPending, setMockTxPending] = useState(false)

  const handleMockTestTx = () => {
    setMockTxPending(true)
    setMockTxHash(null)
    // Simulate 2s tx confirmation
    setTimeout(() => {
      const randomHash = '0x' + Array.from({ length: 64 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join('')
      setMockTxHash(randomHash)
      setMockTxPending(false)
    }, 2000)
  }

  const hasCatastrophicError = isClient && blocksError && statsError && !blocks

  if (!isClient) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <main className="pt-14">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 text-orange-400 animate-spin" />
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="pt-14">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-zinc-100">Performance Dashboard</h2>
            <p className="mt-1 text-sm text-zinc-400">
              Network metrics, wallet analysis, and Monad vs Ethereum comparison
            </p>
          </div>

          {hasCatastrophicError ? (
            <div className="mb-8">
              <NetworkUnavailable
                onRetry={() => {
                  refetchBlocks()
                  refetchStats()
                }}
              />
            </div>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 flex flex-col"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="h-4 w-4 text-green-400" />
                    <span className="text-xs text-zinc-500">Current TPS</span>
                  </div>
                  <div className="text-4xl font-bold font-mono text-zinc-100 mb-3">
                    {statsLoading ? (
                      <Loader2 className="h-7 w-7 text-orange-400 animate-spin" />
                    ) : (
                      <AnimatedCounter value={stats?.tps ?? 0} />
                    )}
                  </div>
                  <div className="mt-auto">
                    <Sparkline data={SPARK_DATA.tps} color="#22c55e" />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 }}
                  className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 flex flex-col"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Timer className="h-4 w-4 text-orange-400" />
                    <span className="text-xs text-zinc-500">Block Time</span>
                  </div>
                  <div className="text-4xl font-bold font-mono text-zinc-100 mb-3">
                    {statsLoading ? (
                      <Loader2 className="h-7 w-7 text-orange-400 animate-spin" />
                    ) : (
                      <AnimatedCounter value={stats?.blockTime ?? 0} suffix="s" decimals={2} />
                    )}
                  </div>
                  <div className="mt-auto">
                    <Sparkline data={SPARK_DATA.blockTime} color="#F97316" />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.16 }}
                  className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 flex flex-col"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-4 w-4 text-yellow-400" />
                    <span className="text-xs text-zinc-500">Avg Parallel Score</span>
                  </div>
                  <div className="text-4xl font-bold font-mono text-zinc-100 mb-3">
                    {blocksLoading ? (
                      <Loader2 className="h-7 w-7 text-orange-400 animate-spin" />
                    ) : (
                      <AnimatedCounter value={avgScore} />
                    )}
                  </div>
                  <div className="mt-auto">
                    <Sparkline data={SPARK_DATA.score} color="#EAB308" />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.24 }}
                  className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 flex flex-col"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Gauge className="h-4 w-4 text-blue-400" />
                    <span className="text-xs text-zinc-500">Block Gas Limit</span>
                  </div>
                  <div className="text-4xl font-bold font-mono text-zinc-100 mb-3">
                    <AnimatedCounter value={200} suffix="M" />
                  </div>
                  <div className="mt-auto">
                    <Sparkline data={SPARK_DATA.gas} color="#60a5fa" />
                  </div>
                </motion.div>
              </div>

              <div className="grid lg:grid-cols-2 gap-6 mb-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6"
                >
                  <h3 className="text-lg font-semibold text-zinc-100 mb-6 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-orange-400" />
                    Parallel Score Distribution
                  </h3>
                  {blocksLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-6 w-6 text-orange-400 animate-spin" />
                    </div>
                  ) : !blocks || blocks.length === 0 ? (
                    <div className="text-center py-12 text-zinc-500 text-sm">
                      No block data available
                    </div>
                  ) : (
                    <div>
                      <svg viewBox="0 0 360 250" className="w-full h-auto">
                        <defs>
                          <linearGradient id="barRed" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#EF4444" stopOpacity="0.9" />
                            <stop offset="100%" stopColor="#EF4444" stopOpacity="0.3" />
                          </linearGradient>
                          <linearGradient id="barYellow" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#EAB308" stopOpacity="0.9" />
                            <stop offset="100%" stopColor="#EAB308" stopOpacity="0.3" />
                          </linearGradient>
                          <linearGradient id="barGreen" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#22C55E" stopOpacity="0.9" />
                            <stop offset="100%" stopColor="#22C55E" stopOpacity="0.3" />
                          </linearGradient>
                        </defs>

                        <line x1="20" y1={barMeta.baseY} x2="340" y2={barMeta.baseY} stroke="rgb(63,63,70)" strokeWidth="1" />

                        {barMeta.bars.map((bar, i) => {
                          const barX = 45 + i * 105
                          const barW = 60
                          const targetH = (bar.pct / 100) * barMeta.maxH
                          const barCenter = barX + barW / 2
                          const gradientId = i === 0 ? 'barRed' : i === 1 ? 'barYellow' : 'barGreen'

                          return (
                            <g key={bar.label}>
                              <motion.rect
                                x={barX}
                                width={barW}
                                fill={`url(#${gradientId})`}
                                initial={{ height: 0, y: barMeta.baseY }}
                                animate={{ height: targetH, y: barMeta.baseY - targetH }}
                                transition={{
                                  type: 'spring',
                                  stiffness: 100,
                                  damping: 16,
                                  delay: 0.3 + i * 0.12,
                                }}
                              />
                              <motion.text
                                x={barCenter}
                                y={barMeta.baseY - targetH - 10}
                                textAnchor="middle"
                                className="fill-zinc-300 text-xs font-mono"
                                style={{ fontSize: '12px' }}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6 + i * 0.12, duration: 0.3 }}
                              >
                                {bar.pct}%
                              </motion.text>
                              <text
                                x={barCenter}
                                y={barMeta.baseY + 20}
                                textAnchor="middle"
                                className="fill-zinc-500"
                                style={{ fontSize: '11px' }}
                              >
                                {bar.label}
                              </text>
                              <text
                                x={barCenter}
                                y={barMeta.baseY + 36}
                                textAnchor="middle"
                                className="fill-zinc-600 font-mono"
                                style={{ fontSize: '10px' }}
                              >
                                {bar.value} blocks
                              </text>
                            </g>
                          )
                        })}
                      </svg>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="text-center mt-3"
                      >
                        <span className="text-xs text-zinc-500">
                          <span className="font-mono text-zinc-300 font-semibold">{barMeta.total}</span> blocks analyzed
                        </span>
                      </motion.div>
                    </div>
                  )}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6"
                >
                  <h3 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-orange-400" />
                    Monad vs Ethereum
                  </h3>

                  <svg viewBox="0 0 300 300" className="w-full max-w-[360px] mx-auto">
                    <defs>
                      <linearGradient id="monadGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#F97316" stopOpacity="1" />
                        <stop offset="100%" stopColor="#EA580C" stopOpacity="1" />
                      </linearGradient>
                      <linearGradient id="ethGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#71717A" stopOpacity="0.6" />
                        <stop offset="100%" stopColor="#52525B" stopOpacity="0.4" />
                      </linearGradient>
                    </defs>

                    {radarValueSets.gridPaths.map((gp, i) => (
                      <path
                        key={i}
                        d={gp}
                        fill="none"
                        stroke="rgb(63,63,70)"
                        strokeWidth="1"
                        opacity={i === 3 ? 0.6 : 0.25}
                      />
                    ))}

                    {PENTA_ANGLES.map((angle, i) => {
                      const end = pentaCoord(cx, cy, r, i, 1)
                      return (
                        <line
                          key={i}
                          x1={cx}
                          y1={cy}
                          x2={end.x}
                          y2={end.y}
                          stroke="rgb(63,63,70)"
                          strokeWidth="1"
                          opacity={0.4}
                        />
                      )
                    })}

                    {RADAR_METRICS.map((metric, i) => {
                      const pos = labelCoord(cx, cy, r, i)
                      const textAnchor =
                        pos.x < cx - 25 ? 'end' : pos.x > cx + 25 ? 'start' : 'middle'
                      const baseline =
                        pos.y < cy - 25 ? 'hanging' : pos.y > cy + 25 ? 'alphabetic' : 'middle'
                      return (
                        <g key={i}>
                          <text
                            x={pos.x}
                            y={pos.y}
                            textAnchor={textAnchor}
                            dominantBaseline={baseline}
                            className="fill-zinc-400"
                            style={{ fontSize: '12px', fontWeight: 500 }}
                          >
                            {metric.label}
                          </text>
                          <text
                            x={pos.x}
                            y={pos.y + (baseline === 'hanging' ? 14 : baseline === 'alphabetic' ? -14 : 14)}
                            textAnchor={textAnchor}
                            dominantBaseline="middle"
                            className="fill-zinc-600"
                            style={{ fontSize: '11px' }}
                          >
                            {metric.suffix}
                          </text>
                        </g>
                      )
                    })}

                    <motion.path
                      d={radarValueSets.zeroPath}
                      fill="url(#monadGrad)"
                      fillOpacity="0.35"
                      stroke="#F97316"
                      strokeWidth="1.5"
                      initial={{ d: radarValueSets.zeroPath }}
                      animate={{ d: radarValueSets.monadPath }}
                      style={{ filter: 'drop-shadow(0 0 10px rgba(249,115,22,0.3))' }}
                      transition={{ duration: 1, ease: 'easeOut', delay: 0.4 }}
                    />

                    <motion.path
                      d={radarValueSets.zeroPath}
                      fill="url(#ethGrad)"
                      fillOpacity="0.5"
                      stroke="#71717A"
                      strokeWidth="1.5"
                      initial={{ d: radarValueSets.zeroPath }}
                      animate={{ d: radarValueSets.ethPath }}
                      transition={{ duration: 0.8, ease: 'easeOut', delay: 0.6 }}
                    />

                    <circle cx={cx} cy={cy} r="2" fill="rgb(82,82,91)" />
                  </svg>

                  <div className="flex items-center justify-center gap-6 mt-3">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-sm bg-orange-500 shadow-[0_0_6px_rgba(249,115,22,0.5)]" />
                      <span className="text-xs text-zinc-400">Monad</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-sm bg-zinc-500" />
                      <span className="text-xs text-zinc-400">Ethereum</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </>
          )}

          <WalletTracker />

          <div className="mt-8 border border-zinc-800 bg-[#18181b]/50 p-6">
            <h2 className="text-lg font-semibold text-zinc-100 mb-2">Demo Transaction</h2>
            <p className="text-sm text-zinc-400 mb-4">
              Simulate a transaction to demonstrate how ParaLens visualizes block data.
              No wallet required — this is for demo purposes.
            </p>

            <button
              onClick={handleMockTestTx}
              disabled={mockTxPending}
              className="bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {mockTxPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Simulating...
                </span>
              ) : (
                'Simulate Transaction'
              )}
            </button>

            {mockTxPending && (
              <button
                onClick={() => setMockTxPending(false)}
                className="ml-3 border border-zinc-700 px-3 py-2.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors font-mono"
              >
                Cancel
              </button>
            )}

            {mockTxHash && (
              <div className="mt-4 border border-zinc-800 bg-zinc-950/50 p-4">
                <div className="text-xs text-zinc-500 mb-1">Simulated Transaction Hash</div>
                <a
                  href={`/explorer/${mockTxHash}`}
                  className="font-mono text-sm text-orange-400 hover:text-orange-300 break-all transition-colors"
                >
                  {mockTxHash}
                </a>
                <p className="text-[10px] text-zinc-600 mt-2 font-mono">
                  This is a simulated hash for demo purposes. Real transactions
                  require a wallet connected to Monad testnet.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

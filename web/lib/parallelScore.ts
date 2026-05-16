import type { BlockData } from '@/lib/monad'

export interface ScoreBreakdown {
  txCountScore: number
  gasVarianceScore: number
  utilizationScore: number
  total: number
}

/**
 * Parallel Score Algorithm — Heuristic estimation of block parallelism.
 *
 * Monad testnet blocks typically have 10-50 transactions with varying gas usage.
 * Score is calibrated for Monad's 200M block gas limit and typical testnet activity.
 *
 * Components:
 *   1. Transaction Count (40%): More txs = more parallel potential. Full marks at 40+ txs.
 *   2. Gas Variance   (35%): Diverse gas usage suggests independent operations. Uses std dev.
 *   3. Block Utilization (25%): How much of available capacity is used. Full marks at 50M gas (~25%).
 */
export function computeParallelScore(block: BlockData): ScoreBreakdown {
  const txCount = block.txCount
  if (txCount === 0) {
    return { txCountScore: 0, gasVarianceScore: 0, utilizationScore: 0, total: 0 }
  }

  // Transaction Count — calibrated for Monad testnet (40 txs = full 40 points)
  const txCountScore = Math.min(txCount / 40, 1) * 40

  // Gas Variance — std dev of transaction gas values indicates diverse tx types
  let gasVarianceScore = 0
  if (block.transactions.length > 1) {
    const gasValues = block.transactions.map((tx) => Number(tx.gas ?? 0n))
    const mean = gasValues.reduce((a, b) => a + b, 0) / gasValues.length
    const variance =
      gasValues.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / gasValues.length
    const stdDev = Math.sqrt(variance)
    // Higher stdDev = more diverse tx types = more parallelism. Full at 50k.
    gasVarianceScore = Math.min(stdDev / 50000, 1) * 35
  }

  // Block Utilization — how much of the capacity is used
  const gasUsed = Number(block.gasUsed)
  const gasLimit = Number(block.gasLimit)
  // Reference: 50M gas (~25% of 200M capacity) = full marks for testnet scale
  const utilizationScore = (gasLimit > 0 ? Math.min(gasUsed / 50_000_000, 1) : 0) * 25

  return {
    txCountScore: Math.round(txCountScore),
    gasVarianceScore: Math.round(gasVarianceScore),
    utilizationScore: Math.round(utilizationScore),
    total: Math.round(txCountScore + gasVarianceScore + utilizationScore),
  }
}

export function scoreColor(score: number): 'red' | 'yellow' | 'green' {
  if (score <= 40) return 'red'
  if (score <= 70) return 'yellow'
  return 'green'
}

export function scoreLabel(score: number): string {
  if (score <= 40) return 'Low'
  if (score <= 70) return 'Medium'
  return 'High'
}

export function scoreColorHex(score: number): string {
  if (score <= 40) return '#ef4444'
  if (score <= 70) return '#eab308'
  return '#22c55e'
}

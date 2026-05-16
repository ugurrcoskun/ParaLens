import type { BlockData } from '@/lib/monad'
import type { ScoreBreakdown } from '@/lib/parallelScore'

export interface ContractInsight {
  address: string
  txCount: number
  totalGas: number
  avgGas: number
  isHighGasContract: boolean
  dominatesBlock: boolean
  shareOfTxs: number
  shareOfGas: number
}

export interface BlockAnalysis {
  contracts: ContractInsight[]
  bottleneck: Bottleneck | null
  suggestions: Suggestion[]
  uniqueContracts: number
  uniqueSenders: number
  transferCount: number
  contractCallCount: number
}

export interface Bottleneck {
  address: string
  txCount: number
  severity: 'low' | 'medium' | 'high'
  reason: string
}

export interface Suggestion {
  type: 'contract_split' | 'state_isolation' | 'batch_merge' | 'gas_optimize' | 'good'
  severity: 'info' | 'warning' | 'success'
  title: string
  detail: string
  affectedContract?: string
}

export function analyzeBlock(block: BlockData, score: ScoreBreakdown): BlockAnalysis {
  const contractMap = new Map<string, { count: number; gas: number; isContract: boolean }>()
  const senders = new Set<string>()
  let transfers = 0
  let contractCalls = 0

  for (const tx of block.transactions) {
    senders.add(tx.from)
    const isContractCall = (tx.input ?? '0x').length > 10
    const target = tx.to ?? '0x0000000000000000000000000000000000000000'

    if (isContractCall) {
      contractCalls++
      const existing = contractMap.get(target) || { count: 0, gas: 0, isContract: true }
      existing.count++
      existing.gas += Number(tx.gas ?? 0n)
      contractMap.set(target, existing)
    } else {
      transfers++
    }
  }

  const totalTx = block.txCount
  const totalGas = Number(block.gasUsed)

  const contracts: ContractInsight[] = Array.from(contractMap.entries())
    .map(([address, data]) => ({
      address,
      txCount: data.count,
      totalGas: data.gas,
      avgGas: Math.round(data.gas / data.count),
      isHighGasContract: data.gas / totalGas > 0.3,
      dominatesBlock: data.count / totalTx > 0.5,
      shareOfTxs: Math.round((data.count / totalTx) * 100),
      shareOfGas: Math.round((data.gas / totalGas) * 100),
    }))
    .sort((a, b) => b.txCount - a.txCount)

  const bottleneck = findBottleneck(contracts, totalTx)
  const suggestions = generateSuggestions(block, score, contracts, totalTx)

  return {
    contracts,
    bottleneck,
    suggestions,
    uniqueContracts: contractMap.size,
    uniqueSenders: senders.size,
    transferCount: transfers,
    contractCallCount: contractCalls,
  }
}

function findBottleneck(
  contracts: ContractInsight[],
  totalTx: number,
): Bottleneck | null {
  const dominant = contracts.find((c) => c.dominatesBlock)
  if (dominant) {
    return {
      address: dominant.address,
      txCount: dominant.txCount,
      severity: 'high',
      reason: `Contract ${dominant.address.slice(0, 10)}... handles ${dominant.shareOfTxs}% of block transactions — likely sequential bottleneck`,
    }
  }

  const highGas = contracts.find((c) => c.isHighGasContract)
  if (highGas) {
    return {
      address: highGas.address,
      txCount: highGas.txCount,
      severity: 'medium',
      reason: `Contract consumes ${highGas.shareOfGas}% of block gas despite only ${highGas.txCount} calls`,
    }
  }

  return null
}

function generateSuggestions(
  block: BlockData,
  score: ScoreBreakdown,
  contracts: ContractInsight[],
  totalTx: number,
): Suggestion[] {
  const suggestions: Suggestion[] = []

  if (score.total >= 70) {
    suggestions.push({
      type: 'good',
      severity: 'success',
      title: 'High Parallel Efficiency',
      detail: `Block #${block.number} achieves ${score.total}% estimated parallelism. Transaction diversity and utilization are well-balanced.`,
    })
    return suggestions
  }

  if (block.txCount < 5) {
    suggestions.push({
      type: 'batch_merge',
      severity: 'info',
      title: 'Low Transaction Volume',
      detail: 'Only a few transactions in this block. Low volume naturally limits parallel execution. Consider batching operations to maximize block utilization.',
    })
  }

  if (contracts.length === 1 && contracts[0].txCount === totalTx) {
    const c = contracts[0]
    suggestions.push({
      type: 'contract_split',
      severity: 'warning',
      title: 'Single Contract Dominance',
      detail: `All ${totalTx} transactions target ${c.address.slice(0, 10)}.... Split this contract into independent modules — isolated contracts can execute in parallel.`,
      affectedContract: c.address,
    })
  }

  for (const c of contracts) {
    if (c.txCount >= 3 && c.dominatesBlock) {
      suggestions.push({
        type: 'contract_split',
        severity: 'warning',
        title: `Heavy Contract Usage: ${c.address.slice(0, 10)}...`,
        detail: `Handles ${c.shareOfTxs}% of block transactions. Consider splitting into separate contracts for unrelated functions to enable parallel execution.`,
        affectedContract: c.address,
      })
    }
    if (c.isHighGasContract && c.txCount === 1) {
      suggestions.push({
        type: 'gas_optimize',
        severity: 'warning',
        title: `Gas Heavy Single Call: ${c.address.slice(0, 10)}...`,
        detail: `One transaction uses ${c.shareOfGas}% of block gas. High gas calls may block other transactions. Consider reducing gas or splitting the operation.`,
        affectedContract: c.address,
      })
    }
  }

  if (score.utilizationScore < 10) {
    suggestions.push({
      type: 'batch_merge',
      severity: 'info',
      title: 'Low Block Utilization',
      detail: `Only ${Number(block.gasUsed) / 1_000_000}M of 200M gas used (${Math.round((Number(block.gasUsed) / Number(block.gasLimit)) * 100)}%). Batching or scheduling more txs would improve parallel utilization.`,
    })
  }

  if (score.gasVarianceScore < 10 && block.txCount >= 5) {
    suggestions.push({
      type: 'state_isolation',
      severity: 'warning',
      title: 'Low Gas Variance — Similar Operations',
      detail: 'Transactions have very similar gas profiles. If they access shared state, they cannot run in parallel. Consider using separate storage slots or mappings per user.',
    })
  }

  if (suggestions.length === 0) {
    suggestions.push({
      type: 'state_isolation',
      severity: 'info',
      title: 'Room for Improvement',
      detail: 'Review contract architecture: isolate user state into per-user mappings, avoid global counters, and batch reads to reduce cold storage access costs.',
    })
  }

  return suggestions
}

'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createPublicClient, http } from 'viem'
import { monadTestnet } from 'wagmi/chains'
import { computeParallelScore, scoreColorHex, scoreLabel } from '@/lib/parallelScore'
import type { BlockData } from '@/lib/monad'
import { Search, Wallet, BarChart3, TrendingUp, Activity, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'

const publicClient = createPublicClient({
  chain: monadTestnet,
  transport: http(process.env.MONAD_RPC_URL ?? 'https://testnet-rpc.monad.xyz'),
})

export default function WalletTracker() {
  const [address, setAddress] = useState('')
  const [searchAddress, setSearchAddress] = useState<`0x${string}` | null>(null)

  const { data, isLoading, error } = useQuery({
    queryKey: ['walletTxs', searchAddress],
    queryFn: async () => {
      if (!searchAddress) return null
      const block = await publicClient.getBlockNumber()
      const fromBlock = block - 5000n

      const logs = await publicClient.getLogs({
        address: searchAddress,
        fromBlock,
        toBlock: block,
      })

      const txHashes = logs.slice(0, 20).map((l) => l.transactionHash)
      const txs = await Promise.all(
        txHashes.map((h) => publicClient.getTransaction({ hash: h }))
      )

      const validTxs = txs.filter((tx): tx is NonNullable<typeof tx> => tx !== null)

      let avgScore = 0
      let totalGas = 0n

      for (const tx of validTxs) {
        if (tx.gas) totalGas += tx.gas
        if (tx.blockNumber) {
          const blk = await publicClient.getBlock({
            blockNumber: tx.blockNumber,
            includeTransactions: true,
          })
          const blockData: BlockData = {
            number: blk.number,
            hash: blk.hash,
            timestamp: blk.timestamp,
            gasUsed: blk.gasUsed,
            gasLimit: blk.gasLimit,
            txCount: blk.transactions.length,
            transactions: [...blk.transactions],
            miner: blk.miner,
          }
          avgScore += computeParallelScore(blockData).total
        }
      }

      return {
        txs: validTxs,
        count: validTxs.length,
        avgScore: validTxs.length > 0 ? Math.round(avgScore / validTxs.length) : 0,
        totalGas,
        gasScore: validTxs.length > 0
          ? Math.min(100, Math.round((Number(totalGas) / Number(validTxs.length) / 500000) * 100))
          : 0,
      }
    },
    enabled: !!searchAddress,
    staleTime: 30000,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const addr = address.trim()
    if (addr.startsWith('0x') && addr.length === 42) {
      setSearchAddress(addr as `0x${string}`)
    }
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Wallet className="h-5 w-5 text-orange-400" />
        <h2 className="text-lg font-semibold text-zinc-100">Wallet Tracker</h2>
      </div>

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter wallet address (0x...)"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 pl-10 pr-4 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-orange-600/50 transition-all font-mono"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-500 transition-colors"
          >
            Analyze
          </button>
        </div>
      </form>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-orange-400 animate-spin" />
        </div>
      )}

      {error && (
        <div className="text-center py-8 text-zinc-500 text-sm">
          Failed to fetch wallet data. Check the address or RPC connection.
        </div>
      )}

      {data && !isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4 text-center">
              <div className="text-2xl font-bold font-mono text-orange-400">{data.count}</div>
              <div className="text-[10px] text-zinc-500 mt-1">Recent TXs</div>
            </div>
            <div className="rounded-xl border border-zinc-800 p-4 text-center" style={{ backgroundColor: `${scoreColorHex(data.avgScore)}10` }}>
              <div className="text-2xl font-bold font-mono" style={{ color: scoreColorHex(data.avgScore) }}>
                {data.avgScore}
              </div>
              <div className="text-[10px] text-zinc-500 mt-1">
                Parallel Score ({scoreLabel(data.avgScore)})
              </div>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4 text-center">
              <div className="text-2xl font-bold font-mono text-zinc-300">{data.gasScore}%</div>
              <div className="text-[10px] text-zinc-500 mt-1">Gas Efficiency</div>
            </div>
          </div>

          {data.txs.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-medium text-zinc-500">Recent Transactions</div>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {data.txs.slice(0, 10).map((tx, i) => (
                  <div
                    key={tx.hash}
                    className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950/30 px-3 py-2 text-xs"
                  >
                    <span className="font-mono text-zinc-500 truncate max-w-[200px]">
                      {tx.hash.slice(0, 16)}...
                    </span>
                    <span className="text-zinc-600 font-mono">
                      {tx.gas ? `${(Number(tx.gas) / 1000).toFixed(0)}k gas` : 'N/A'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.txs.length === 0 && (
            <div className="text-center py-6 text-zinc-500 text-sm">
              No recent transactions found for this address on Monad testnet.
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getLatestBlocks, getNetworkTPS, RpcTimeoutError } from '@/lib/monad'
import { MOCK_BLOCKS, USE_MOCK } from '@/lib/mockData'

export function useLatestBlocks(limit = 20, opts?: { enabled?: boolean }) {
  const [isClient, setIsClient] = useState(false)
  useEffect(() => { setIsClient(true) }, [])

  return useQuery({
    queryKey: ['blocks', limit],
    queryFn: async () => {
      if (USE_MOCK) return MOCK_BLOCKS.slice(0, limit)
      try {
        return await getLatestBlocks(limit)
      } catch (err) {
        if (err instanceof RpcTimeoutError) {
          console.warn('RPC timeout — falling back to mock blocks')
        } else {
          console.warn('RPC error — falling back to mock blocks:', err)
        }
        return MOCK_BLOCKS.slice(0, limit)
      }
    },
    enabled: opts?.enabled ?? isClient,
    refetchInterval: 3000,
    staleTime: 2000,
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
  })
}

export function useNetworkStats(opts?: { enabled?: boolean }) {
  const [isClient, setIsClient] = useState(false)
  useEffect(() => { setIsClient(true) }, [])

  return useQuery({
    queryKey: ['networkStats'],
    queryFn: async () => {
      if (USE_MOCK) {
        return { tps: 1250, blockTime: 0.4 }
      }
      try {
        const tps = await getNetworkTPS()
        return { tps, blockTime: 0.4 }
      } catch (err) {
        if (err instanceof RpcTimeoutError) {
          console.warn('RPC timeout — falling back to mock network stats')
        } else {
          console.warn('RPC error — falling back to mock network stats:', err)
        }
        return { tps: 1250, blockTime: 0.4 }
      }
    },
    enabled: opts?.enabled ?? isClient,
    refetchInterval: 3000,
    staleTime: 2000,
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
  })
}

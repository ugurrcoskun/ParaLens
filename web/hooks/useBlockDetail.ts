import { useQuery } from '@tanstack/react-query'
import { getBlockDetail, getTransactionReceipts } from '@/lib/monad'
import { MOCK_BLOCKS, USE_MOCK } from '@/lib/mockData'

export function useBlockDetail(blockNumber: bigint) {
  return useQuery({
    queryKey: ['block', blockNumber.toString()],
    queryFn: async () => {
      if (USE_MOCK) {
        return MOCK_BLOCKS.find((b) => b.number === blockNumber) ?? MOCK_BLOCKS[0]
      }
      return getBlockDetail(blockNumber)
    },
    enabled: blockNumber > 0n,
    staleTime: 60000,
  })
}

export function useBlockReceipts(blockNumber: bigint) {
  return useQuery({
    queryKey: ['receipts', blockNumber.toString()],
    queryFn: () => getTransactionReceipts(blockNumber),
    enabled: blockNumber > 0n && !USE_MOCK,
    staleTime: 60000,
  })
}

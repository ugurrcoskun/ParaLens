import { createPublicClient, http } from 'viem'
import { monadTestnet } from 'wagmi/chains'
import type { Block, Transaction } from 'viem'

export const RPC_TIMEOUT = 10_000

export class RpcTimeoutError extends Error {
  constructor(ms = RPC_TIMEOUT) {
    super(`RPC request timed out after ${ms}ms`)
    this.name = 'RpcTimeoutError'
  }
}

export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = RPC_TIMEOUT,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined

  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new RpcTimeoutError(timeoutMs)), timeoutMs)
  })

  return Promise.race([promise, timeout]).finally(() => {
    if (timer !== undefined) clearTimeout(timer)
  })
}

export const client = createPublicClient({
  chain: monadTestnet,
  transport: http(process.env.MONAD_RPC_URL ?? 'https://testnet-rpc.monad.xyz', {
    timeout: RPC_TIMEOUT,
  }),
})

export interface BlockData {
  number: bigint
  hash: string
  timestamp: bigint
  gasUsed: bigint
  gasLimit: bigint
  txCount: number
  transactions: Transaction[]
  miner: string
}

export async function getLatestBlockNumber(): Promise<bigint> {
  return withTimeout(client.getBlockNumber())
}

export async function getLatestBlocks(limit: number): Promise<BlockData[]> {
  const latest = await withTimeout(client.getBlockNumber())
  const numbers = Array.from({ length: limit }, (_, i) => latest - BigInt(i))

  const perBlockTimeout = Math.max(RPC_TIMEOUT / limit, 2000)
  const blocks = await Promise.all(
    numbers.map((n) =>
      withTimeout(
        client.getBlock({ blockNumber: n, includeTransactions: true }),
        perBlockTimeout,
      ),
    ),
  )
  return blocks.map(mapBlock)
}

export async function getBlockDetail(blockNumber: bigint): Promise<BlockData> {
  const block = await withTimeout(
    client.getBlock({ blockNumber, includeTransactions: true }),
  )
  return mapBlock(block)
}

export async function getBlockByHash(hash: `0x${string}`): Promise<BlockData> {
  const block = await withTimeout(
    client.getBlock({ blockHash: hash, includeTransactions: true }),
  )
  return mapBlock(block)
}

export async function getTransactionReceipts(blockNumber: bigint) {
  const block = await withTimeout(
    client.getBlock({ blockNumber, includeTransactions: true }),
  )
  const receipts = await withTimeout(
    Promise.all(
      block.transactions.map((tx) =>
        client.getTransactionReceipt({ hash: tx.hash }),
      ),
    ),
  )
  return receipts
}

export async function getWalletTransactions(address: `0x${string}`, limit = 20) {
  const latest = await withTimeout(client.getBlockNumber())
  const fromBlock = latest - BigInt(5000)
  const logs = await withTimeout(
    client.getLogs({
      address,
      fromBlock,
      toBlock: latest,
    }),
  )
  return logs.slice(0, limit)
}

export async function getNetworkTPS(): Promise<number> {
  const latest = await withTimeout(client.getBlockNumber())
  const [recentBlock, prevBlock] = await withTimeout(
    Promise.all([
      client.getBlock({ blockNumber: latest, includeTransactions: true }),
      client.getBlock({ blockNumber: latest - 1n }),
    ]),
  )
  const timeDiff = Number(recentBlock.timestamp - prevBlock.timestamp)
  if (timeDiff <= 0) return 0
  return Math.round((recentBlock.transactions.length / timeDiff) * 10) / 10
}

function mapBlock(block: Block<bigint, true>): BlockData {
  return {
    number: block.number!,
    hash: block.hash!,
    timestamp: block.timestamp!,
    gasUsed: block.gasUsed!,
    gasLimit: block.gasLimit!,
    txCount: block.transactions.length,
    transactions: [...block.transactions],
    miner: block.miner!,
  }
}

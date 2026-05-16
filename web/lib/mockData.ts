import type { BlockData } from '@/lib/monad'
import type { Transaction } from 'viem'

const BASE_TIMESTAMP = BigInt(Math.floor(Date.now() / 1000))

function generateMockBlock(number: number, txCount: number): BlockData {
  const transactions = Array.from({ length: txCount }, (_, i) => ({
    hash: `0x${(number * 10000 + i).toString(16).padStart(64, '0')}`,
    blockHash: `0x${number.toString(16).padStart(64, '0')}`,
    blockNumber: BigInt(number),
    from: `0x${(1000 + i).toString(16).padStart(40, '0')}`,
    to: `0x${(2000 + i).toString(16).padStart(40, '0')}`,
    gas: BigInt(21000 + Math.floor(Math.random() * 500000)),
    gasPrice: BigInt(1000000000 + Math.floor(Math.random() * 5000000000)),
    value: BigInt(Math.floor(Math.random() * 1000000000000000000)),
    input: `0x`,
    nonce: i,
    transactionIndex: i,
    v: BigInt(i % 2 === 0 ? 27 : 28),
    r: '0x0000000000000000000000000000000000000000000000000000000000000001',
    s: '0x0000000000000000000000000000000000000000000000000000000000000002',
    type: 'eip1559',
    typeHex: '0x2',
    yParity: 1,
    accessList: [],
    chainId: 10143,
    maxFeePerGas: BigInt(50000000000),
    maxPriorityFeePerGas: BigInt(1000000000),
  })) as unknown as Transaction[]

  const gasUsed = transactions.reduce((sum, tx) => sum + (tx.gas ?? 0n), 0n)

  return {
    number: BigInt(number),
    hash: `0x${number.toString(16).padStart(64, '0')}`,
    timestamp: BASE_TIMESTAMP - BigInt(Math.floor((20 - number / 5) * 2)),
    gasUsed,
    gasLimit: BigInt(200_000_000),
    txCount,
    transactions,
    miner: '0x1111111111111111111111111111111111111111',
  }
}

export const MOCK_BLOCKS: BlockData[] = [
  generateMockBlock(32100000, 38),
  generateMockBlock(32099999, 52),
  generateMockBlock(32099998, 18),
  generateMockBlock(32099997, 44),
  generateMockBlock(32099996, 65),
  generateMockBlock(32099995, 23),
  generateMockBlock(32099994, 47),
  generateMockBlock(32099993, 31),
  generateMockBlock(32099992, 56),
  generateMockBlock(32099991, 14),
  generateMockBlock(32099990, 41),
  generateMockBlock(32099989, 59),
  generateMockBlock(32099988, 27),
  generateMockBlock(32099987, 48),
  generateMockBlock(32099986, 63),
  generateMockBlock(32099985, 35),
  generateMockBlock(32099984, 50),
  generateMockBlock(32099983, 22),
  generateMockBlock(32099982, 46),
  generateMockBlock(32099981, 39),
]

export const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true'

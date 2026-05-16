'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const TX_COUNT = 12

function TxRow({
  index,
  side,
  total,
}: {
  index: number
  side: 'left' | 'right'
  total: number
}) {
  const isParallel = side === 'right'
  const delay = isParallel ? 0 : index * 0.4

  return (
    <motion.div
      className="relative flex items-center gap-3"
      initial={{ opacity: 0, x: side === 'left' ? -20 : 0 }}
      animate={{
        opacity: [0, 1, 1, 0],
        x: side === 'left' ? [-20, 0, 0, 20] : 0,
      }}
      transition={{
        duration: 4.5,
        delay,
        repeat: Infinity,
        times: [0, 0.15, 0.85, 1],
      }}
    >
      <motion.div
        className="h-2 w-2 rounded-full bg-amber-400"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.6, 1, 0.6],
        }}
        transition={{
          duration: 1.5,
          delay,
          repeat: Infinity,
        }}
      />
      <motion.div
        className={`h-px flex-1 rounded-full ${
          isParallel ? 'bg-gradient-to-r from-orange-500/40 to-red-500/20' : 'bg-zinc-700'
        }`}
        animate={
          isParallel
            ? { opacity: [0.3, 0.8, 0.3] }
            : { opacity: [0.2, 0.6, 0.2] }
        }
        transition={{
          duration: 1.5,
          delay,
          repeat: Infinity,
        }}
      />
    </motion.div>
  )
}

function ParallelBurst({ total }: { total: number }) {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {Array.from({ length: total }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-px w-16 bg-gradient-to-r from-transparent via-orange-500 to-transparent"
          style={{
            top: `${((i + 0.5) / total) * 100}%`,
            left: '50%',
          }}
          animate={{
            opacity: [0, 0.8, 0],
            scaleX: [0, 1.2, 0],
          }}
          transition={{
            duration: 2,
            delay: 0.3,
            repeat: Infinity,
            repeatDelay: 2.5,
            times: [0, 0.2, 1],
          }}
        />
      ))}
    </div>
  )
}

export default function HeroAnimation() {
  const [cycle, setCycle] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => setCycle((c) => c + 1), 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="grid grid-cols-2 gap-8 items-center w-full max-w-2xl mx-auto">
      <div className="space-y-2">
        <div className="text-center mb-4">
          <span className="text-sm font-medium text-zinc-500">Ethereum</span>
          <div className="text-xs text-zinc-600">Sequential</div>
        </div>
        <div className="relative rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 h-48 overflow-hidden">
          <div className="space-y-2.5 relative z-10">
            {Array.from({ length: TX_COUNT }).map((_, i) => (
              <TxRow key={`left-${i}-${cycle}`} index={i} side="left" total={TX_COUNT} />
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-center mb-4">
          <span className="text-sm font-medium text-amber-400">Monad</span>
          <div className="text-xs text-red-500/80">Parallel</div>
        </div>
        <div className="relative rounded-xl border border-red-900/40 bg-red-950/20 p-4 h-48 overflow-hidden">
          <ParallelBurst total={TX_COUNT} />
          <div className="space-y-2.5 relative z-10">
            {Array.from({ length: TX_COUNT }).map((_, i) => (
              <TxRow key={`right-${i}-${cycle}`} index={i} side="right" total={TX_COUNT} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

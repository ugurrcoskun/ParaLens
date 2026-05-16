'use client'

import type { Suggestion } from '@/lib/contractAnalyzer'
import { motion } from 'framer-motion'
import { Lightbulb, AlertTriangle, CheckCircle2, Info, ArrowRight } from 'lucide-react'

interface SuggestionCardProps {
  suggestion: Suggestion
  index: number
}

const severityConfig: Record<string, {
  icon: typeof Lightbulb
  border: string
  glow: string
}> = {
  info: { icon: Info, border: 'border-yellow-600', glow: 'shadow-yellow-900/20' },
  warning: { icon: AlertTriangle, border: 'border-orange-600', glow: 'shadow-orange-900/20' },
  success: { icon: CheckCircle2, border: 'border-green-600', glow: 'shadow-green-900/20' },
}

export default function SuggestionCard({ suggestion, index }: SuggestionCardProps) {
  const config = severityConfig[suggestion.severity] ?? severityConfig.info
  const Icon = config.icon

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, delay: index * 0.06 }}
      className={`rounded border ${config.border} bg-zinc-950/50 p-4 ${config.glow}`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0">
          <Icon size={16} className={
            suggestion.severity === 'info' ? 'text-yellow-500' :
            suggestion.severity === 'warning' ? 'text-orange-500' :
            'text-green-500'
          } />
        </div>
        <div className="min-w-0 space-y-1.5">
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-100">
            {suggestion.title}
          </p>
          <p className="text-sm font-mono text-zinc-400">
            {suggestion.detail}
          </p>
          {suggestion.affectedContract && (
            <div className="flex items-center gap-1.5 pt-1">
              <ArrowRight size={12} className="text-zinc-600 shrink-0" />
              <span className="text-xs font-mono text-zinc-500 truncate block">
                {suggestion.affectedContract}
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

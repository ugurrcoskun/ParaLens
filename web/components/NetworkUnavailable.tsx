'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface NetworkUnavailableProps {
  onRetry?: () => void
}

export default function NetworkUnavailable({ onRetry }: NetworkUnavailableProps) {
  useEffect(() => {
    console.warn('Network unavailable — consider enabling USE_MOCK_DATA=true')
  }, [])

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-md px-4">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-800/50 mb-4">
          <AlertTriangle className="h-8 w-8 text-yellow-400" />
        </div>
        <h3 className="text-lg font-semibold text-zinc-200 mb-2">Network Unavailable</h3>
        <p className="text-sm text-zinc-400 mb-6">
          Monad testnet RPC is unreachable. Enable Demo Mode to view pre-generated
          block data instead.
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Retry Connection
          </button>
        )}
        <div className="mt-4 p-3 rounded-lg border border-yellow-800/30 bg-yellow-950/20">
          <p className="text-xs text-yellow-400/80">
            Try setting <code className="text-yellow-300">USE_MOCK_DATA=true</code> in your
            environment variables to use demo data.
          </p>
        </div>
      </div>
    </div>
  )
}

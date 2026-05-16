import Navigation from '@/components/Navigation'

export default function DocsPage() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="pt-14">
        <div className="mx-auto max-w-3xl px-4 py-12">
          <h1 className="text-3xl font-bold text-zinc-100 mb-8">Documentation</h1>

          <section className="space-y-8">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6">
              <h2 className="text-xl font-semibold text-zinc-100 mb-3">
                What is Parallel Execution?
              </h2>
              <p className="text-zinc-400 leading-relaxed">
                Monad uses <span className="text-orange-300 font-medium">Optimistic Parallel Execution</span> to
                process multiple transactions simultaneously within a single block. Unlike Ethereum
                where transactions execute one-by-one in a strict sequence, Monad&apos;s execution
                engine identifies independent transactions and runs them in parallel.
              </p>
              <p className="text-zinc-400 leading-relaxed mt-3">
                The key insight: if two transactions don&apos;t touch the same state, they can execute
                concurrently without affecting each other. If a conflict is detected, the optimistic
                result is rolled back and re-executed sequentially.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6">
              <h2 className="text-xl font-semibold text-zinc-100 mb-3">
                How the Parallel Score Works
              </h2>
              <p className="text-zinc-400 leading-relaxed">
                Our parallel execution score is a heuristic-based metric (0-100) that estimates how
                much parallelism a block achieves:
              </p>
              <div className="mt-4 space-y-3">
                <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-4">
                  <h3 className="font-medium text-zinc-200 flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded bg-orange-600/30 text-xs text-orange-400 font-bold">
                      1
                    </span>
                    Transaction Count (40% weight)
                  </h3>
                  <p className="text-sm text-zinc-500 mt-1">
                    More transactions in a block suggest higher parallelism. Score scales from 0-40
                    based on tx count (max at 100+ txs).
                  </p>
                </div>
                <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-4">
                  <h3 className="font-medium text-zinc-200 flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded bg-orange-600/30 text-xs text-orange-400 font-bold">
                      2
                    </span>
                    Gas Variance (35% weight)
                  </h3>
                  <p className="text-sm text-zinc-500 mt-1">
                    Higher variance in per-tx gas usage indicates diverse transaction types running
                    in parallel. Uniform gas suggests similar, potentially dependent operations.
                  </p>
                </div>
                <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-4">
                  <h3 className="font-medium text-zinc-200 flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded bg-orange-600/30 text-xs text-orange-400 font-bold">
                      3
                    </span>
                    Block Utilization (25% weight)
                  </h3>
                  <p className="text-sm text-zinc-500 mt-1">
                    Higher utilization of the 200M block gas limit indicates efficient use of
                    parallel capacity. Score from gas used / gas limit ratio.
                  </p>
                </div>
              </div>
              <div className="mt-4 p-4 rounded-lg border border-yellow-800/30 bg-yellow-950/10">
                <p className="text-sm text-yellow-400/80">
                  <strong>Important:</strong> This score is heuristic-based. Monad&apos;s RPC does
                  not yet expose actual conflict detection data. The methodology is documented and
                  open to improvement as the protocol evolves.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6">
              <h2 className="text-xl font-semibold text-zinc-100 mb-3">
                Monad Testnet Info
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-zinc-800">
                  <span className="text-zinc-400">Network</span>
                  <span className="text-zinc-200">Monad Testnet</span>
                </div>
                <div className="flex justify-between py-2 border-b border-zinc-800">
                  <span className="text-zinc-400">Chain ID</span>
                  <span className="font-mono text-zinc-200">10143</span>
                </div>
                <div className="flex justify-between py-2 border-b border-zinc-800">
                  <span className="text-zinc-400">RPC</span>
                  <span className="font-mono text-zinc-200 text-xs">testnet-rpc.monad.xyz</span>
                </div>
                <div className="flex justify-between py-2 border-b border-zinc-800">
                  <span className="text-zinc-400">Block Time</span>
                  <span className="text-zinc-200">~0.4s</span>
                </div>
                <div className="flex justify-between py-2 border-b border-zinc-800">
                  <span className="text-zinc-400">TPS</span>
                  <span className="text-zinc-200">Up to 10,000</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-zinc-400">Faucet</span>
                  <span className="text-zinc-200">faucet.monad.xyz</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

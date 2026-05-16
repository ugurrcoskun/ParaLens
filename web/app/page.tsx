import Navigation from '@/components/Navigation'
import { ShaderAnimation } from '@/components/ui/shader-animation'
import Link from 'next/link'
import { Blocks, LayoutDashboard, ArrowRight } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <ShaderAnimation />
      <Navigation />

      <main className="pt-14">
        {/* Hero */}
        <section className="relative">
          <div className="relative mx-auto max-w-7xl px-4 pt-24 pb-20">
            <div
              className="text-center mb-14"
              style={{ animation: 'fadeInUp 0.6s ease-out both' }}
            >
              <h1 className="text-7xl sm:text-8xl lg:text-9xl font-black tracking-tighter leading-none" style={{ fontFamily: 'var(--font-audiowide)' }}>
                <span className="bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 bg-clip-text text-transparent">
                  ParaLens
                </span>
              </h1>

              <div className="mt-8 flex items-center justify-center gap-3">
                <span className="h-px w-12 bg-gradient-to-r from-transparent to-zinc-700" />
                <p className="font-mono text-sm tracking-[0.2em] uppercase text-zinc-400">
                  Optimistic Parallel Execution Visualized
                </p>
                <span className="h-px w-12 bg-gradient-to-l from-transparent to-zinc-700" />
              </div>

              <p className="mt-6 text-lg text-zinc-400 max-w-xl mx-auto font-mono">
                See how transactions execute simultaneously — not sequentially.
                <br />
                Built for{' '}
                <span className="text-orange-400">Monad</span> developers.
              </p>
            </div>

            {/* CTA Buttons */}
            <div
              className="flex items-center justify-center gap-4 flex-wrap"
              style={{ animation: 'fadeInUp 0.6s ease-out 0.15s both' }}
            >
              <Link
                href="/explorer"
                className="group inline-flex items-center gap-2 bg-orange-600 px-8 py-3.5 text-sm font-bold text-white hover:bg-orange-500 transition-colors tracking-wider uppercase"
                style={{ clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)' }}
              >
                <Blocks className="h-4 w-4" />
                Launch Explorer
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 border-2 border-zinc-700 px-8 py-3.5 text-sm font-bold text-zinc-300 hover:border-zinc-500 hover:text-zinc-100 transition-colors tracking-wider uppercase"
              >
                <LayoutDashboard className="h-4 w-4" />
                View Dashboard
              </Link>
            </div>

            {/* Stats strip */}
            <div
              className="mt-20 grid grid-cols-3 border-2 border-zinc-800 divide-x-2 divide-zinc-800"
              style={{ animation: 'fadeInUp 0.6s ease-out 0.3s both' }}
            >
              {[
                { value: '10,000+', label: 'TPS Capacity', sub: 'Parallel execution' },
                { value: '< 1s', label: 'Block Time', sub: 'Lightning finality' },
                { value: '0.01¢', label: 'Avg Gas Cost', sub: 'Near-zero fees' },
              ].map((stat) => (
                <div key={stat.label} className="px-6 py-5 text-center">
                  <div className="font-mono text-3xl font-black text-orange-500 tracking-tight">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-xs font-mono uppercase tracking-widest text-zinc-400">
                    {stat.label}
                  </div>
                  <div className="mt-0.5 text-[10px] text-zinc-600 font-mono uppercase tracking-wide">
                    {stat.sub}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Decorative diagonal slash */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
        </section>

        {/* Feature Cards */}
        <section
          className="mx-auto max-w-7xl px-4 py-20 border-t border-zinc-800/50"
          style={{ animation: 'fadeInUp 0.6s ease-out 0.4s both' }}
        >
          <div className="flex items-center gap-3 mb-12">
            <span className="font-mono text-xs text-orange-500 tracking-[0.3em] uppercase">
              [ 0x00 ]
            </span>
            <h2 className="text-3xl font-black tracking-tight text-zinc-100">
              Core Features
            </h2>
            <span className="h-px flex-1 bg-zinc-800" />
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                idx: '01',
                title: 'Live Block Explorer',
                desc: 'Watch Monad blocks stream in real-time with parallel execution scores, transaction timelines, and gas heatmaps.',
              },
              {
                idx: '02',
                title: 'Performance Dashboard',
                desc: 'Compare Monad vs Ethereum metrics. Track TPS, block times, gas costs, and network-wide parallel efficiency.',
              },
              {
                idx: '03',
                title: 'Wallet Tracker',
                desc: 'Enter any wallet address to analyze transaction performance, gas optimization, and parallel execution benefits.',
              },
            ].map((card) => (
              <div
                key={card.idx}
                className="group relative border-2 border-zinc-800 bg-zinc-950/60 p-6 transition-colors hover:border-orange-500/30"
              >
                {/* Angled corner */}
                <div className="absolute top-0 right-0 w-8 h-8 border-l-2 border-b-2 border-zinc-700 group-hover:border-orange-500/30 transition-colors" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-r-2 border-t-2 border-zinc-700 group-hover:border-orange-500/30 transition-colors" />

                <span className="font-mono text-5xl font-black text-zinc-800 group-hover:text-orange-500/10 transition-colors">
                  {card.idx}
                </span>
                <h3 className="mt-2 text-lg font-bold text-zinc-100 tracking-tight">
                  {card.title}
                </h3>
                <div className="mt-3 border-t border-dashed border-zinc-800 pt-3">
                  <p className="text-sm text-zinc-400 font-mono leading-relaxed">
                    {card.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Why This Tool Matters */}
        <section
          className="mx-auto max-w-7xl px-4 py-20 border-t border-zinc-800/50"
          style={{ animation: 'fadeInUp 0.6s ease-out 0.55s both' }}
        >
          <div className="flex items-center gap-3 mb-12">
            <span className="font-mono text-xs text-orange-500 tracking-[0.3em] uppercase">
              [ 0x01 ]
            </span>
            <h2 className="text-3xl font-black tracking-tight text-zinc-100">
              Why This Tool Matters
            </h2>
            <span className="h-px flex-1 bg-zinc-800" />
          </div>

          <div className="grid md:grid-cols-2 gap-0 max-w-5xl mx-auto border-2 border-zinc-800">
            {[
              {
                num: '01',
                title: 'See Parallelism in Action',
                desc: 'Standard block explorers show raw data. We visualize how many transactions executed in parallel — making Monad\'s core advantage tangible.',
              },
              {
                num: '02',
                title: 'Optimize Your Contracts',
                desc: 'Use the Wallet Tracker to analyze your own transactions and see how well your contracts leverage Monad\'s parallel execution.',
              },
              {
                num: '03',
                title: 'Share & Compare',
                desc: 'Generate shareable block reports with OG metadata. Tweet a block\'s parallel score or compare Monad vs Ethereum metrics side by side.',
              },
              {
                num: '04',
                title: 'Built for the Ecosystem',
                desc: 'Open source, Monad-native. Uses viem + Wagmi for reliable RPC communication. All scores are heuristic-based and transparently documented.',
              },
            ].map((item, i) => (
              <div
                key={item.num}
                className={`flex gap-5 p-6 border-zinc-800 ${
                  i % 2 === 0 ? 'border-r-2' : ''
                } ${i < 2 ? 'border-b-2' : ''}`}
              >
                <span className="flex-shrink-0 font-mono text-4xl font-black text-zinc-700">
                  {item.num}
                </span>
                <div>
                  <h3 className="font-bold text-zinc-100 tracking-tight">
                    {item.title}
                  </h3>
                  <div className="mt-2 border-t border-dashed border-zinc-800 pt-2">
                    <p className="text-sm text-zinc-400 font-mono leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer CTA */}
        <section
          className="mx-auto max-w-7xl px-4 py-16 border-t-2 border-zinc-800"
          style={{ animation: 'fadeInUp 0.6s ease-out 0.7s both' }}
        >
          <div className="relative border-2 border-zinc-800 bg-zinc-950/60 p-10 text-center">
            {/* Diagonal corner cuts */}
            <div className="absolute top-0 left-0 w-12 h-px bg-orange-500/40 origin-top-left rotate-45" />
            <div className="absolute bottom-0 right-0 w-12 h-px bg-orange-500/40 origin-bottom-right rotate-45" />

            <p className="font-mono text-xs text-zinc-500 tracking-[0.3em] uppercase mb-6">
              Ready to explore Monad?
            </p>
            <Link
              href="/explorer"
              className="group inline-flex items-center gap-2 bg-orange-600 px-10 py-4 text-base font-bold text-white hover:bg-orange-500 transition-colors tracking-wider uppercase"
            >
              <Blocks className="h-5 w-5" />
              Enter the Explorer
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}

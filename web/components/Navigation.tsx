'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Blocks, LayoutDashboard, BookOpen, Zap, Activity, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useNetworkStats } from '@/hooks/useLatestBlocks'
import DemoModeToggle from '@/components/DemoModeToggle'

const navItems = [
  { href: '/', label: 'Home', icon: Zap },
  { href: '/explorer', label: 'Explorer', icon: Blocks },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/docs', label: 'Docs', icon: BookOpen },
]

export default function Navigation() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { data: stats } = useNetworkStats()

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-800 bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex h-14 items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 select-none">
              <div className="flex h-7 w-7 items-center justify-center bg-orange-500">
                <Zap className="h-4 w-4 text-zinc-950" />
              </div>
              <span className="hidden sm:inline font-bold text-sm uppercase tracking-[0.25em] text-zinc-100">
                ParaLens
              </span>
              <span className="sm:hidden font-bold text-sm uppercase tracking-[0.25em] text-zinc-100">
                PL
              </span>
            </Link>

            <nav className="hidden md:flex items-center">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative flex items-center gap-1.5 border-r border-zinc-800 px-4 py-2 font-bold text-xs uppercase tracking-[0.2em] transition-colors ${
                      isActive
                        ? 'text-orange-500'
                        : 'text-zinc-400 hover:text-zinc-100'
                    }`}
                  >
                    <item.icon className="h-3.5 w-3.5" />
                    {item.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-orange-500" />
                    )}
                  </Link>
                )
              })}
              <div className="w-px self-stretch bg-zinc-800" />
            </nav>

            <div className="flex items-center gap-3">
              {stats && (
                <div className="hidden lg:flex items-center border border-zinc-800 bg-zinc-900/50">
                  <span className="flex items-center gap-1.5 border-r border-zinc-800 px-3 py-1 font-mono text-[10px] tracking-wider text-zinc-400">
                    <Activity className="h-3 w-3 text-red-500" />
                    <span className="text-zinc-100">{stats.tps.toLocaleString()}</span>
                    <span className="text-zinc-500">TPS</span>
                  </span>
                  <span className="flex items-center gap-1.5 px-3 py-1 font-mono text-[10px] tracking-wider text-zinc-400">
                    <Zap className="h-3 w-3 text-orange-500" />
                    <span className="text-zinc-100">{stats.blockTime}</span>
                    <span className="text-zinc-500">SEC</span>
                  </span>
                </div>
              )}
              <DemoModeToggle />
              <div className="scale-90 origin-right">
                <ConnectButton />
              </div>
              <button
                className="md:hidden p-1.5 text-zinc-400 hover:text-zinc-100"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 top-14 z-40 bg-zinc-950 md:hidden border-t border-zinc-800">
          <div className="border-b border-zinc-800 px-4 py-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500">
              NAVIGATION_
            </span>
          </div>
          <nav className="flex flex-col p-0">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 border-b border-zinc-800 px-4 py-4 font-bold text-sm uppercase tracking-[0.2em] transition-colors ${
                    isActive
                      ? 'bg-zinc-900 text-orange-500 border-l-2 border-l-orange-500'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/50'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
          {stats && (
            <div className="border-t border-zinc-800 px-4 py-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500">
                NETWORK_STATUS
              </span>
              <div className="mt-2 flex items-center gap-4 font-mono text-xs">
                <span className="flex items-center gap-1.5 text-zinc-400">
                  <Activity className="h-3 w-3 text-red-500" />
                  <span className="text-zinc-100 font-bold">{stats.tps.toLocaleString()}</span>
                  <span className="text-zinc-500">TPS</span>
                </span>
                <span className="flex items-center gap-1.5 text-zinc-400">
                  <Zap className="h-3 w-3 text-orange-500" />
                  <span className="text-zinc-100 font-bold">{stats.blockTime}</span>
                  <span className="text-zinc-500">SEC</span>
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}

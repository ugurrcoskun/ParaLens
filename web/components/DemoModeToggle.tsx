'use client'

import { useState, useEffect } from 'react'

export function useDemoMode() {
  const [isDemo, setIsDemo] = useState(false)

  useEffect(() => {
    setIsDemo(process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true')
  }, [])

  const toggle = () => {
    const next = !isDemo
    setIsDemo(next)
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  return { isDemo, toggle }
}

export default function DemoModeToggle() {
  const { isDemo } = useDemoMode()

  return (
    <button
      onClick={() => {
        const current = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true'
        const next = !current
        // Toggle via URL param for this session
        const url = new URL(window.location.href)
        if (next) {
          url.searchParams.set('demo', 'true')
        } else {
          url.searchParams.delete('demo')
        }
        window.location.href = url.toString()
      }}
      className="flex items-center gap-1.5 px-2 py-1 rounded border text-[10px] font-mono uppercase tracking-wider transition-colors"
      style={{
        borderColor: isDemo ? '#854d0e' : '#27272a',
        color: isDemo ? '#fbbf24' : '#52525b',
        backgroundColor: isDemo ? 'rgba(251, 191, 36, 0.05)' : 'transparent',
      }}
      title="Toggle demo mode"
    >
      <div
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: isDemo ? '#fbbf24' : '#52525b' }}
      />
      {isDemo ? 'DEMO ON' : 'LIVE'}
    </button>
  )
}

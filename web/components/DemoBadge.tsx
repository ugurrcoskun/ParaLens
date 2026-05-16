'use client'

export default function DemoBadge() {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA !== 'true') return null

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-full border border-yellow-800/50 bg-yellow-950/80 backdrop-blur-sm px-3 py-1.5">
      <div className="h-1.5 w-1.5 rounded-full bg-yellow-400 animate-pulse" />
      <span className="text-[10px] font-semibold text-yellow-400 tracking-wider uppercase">
        Demo Mode
      </span>
    </div>
  )
}

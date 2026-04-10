import { Suspense } from 'react'
import { RadarContent } from '@/components/radar/RadarContent'
import { Radar } from 'lucide-react'

export const metadata = { title: 'Radar' }

export default function RadarPage() {
  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center justify-between px-8 h-16 border-b border-surface-border flex-shrink-0">
        <div className="flex items-center gap-3">
          <Radar className="w-5 h-5 text-brand-400" />
          <h1 className="text-lg font-semibold text-white">Radar</h1>
          <span className="text-sm text-slate-400">Opportunités hôtelières</span>
        </div>
      </div>

      {/* Content */}
      <Suspense fallback={<RadarSkeleton />}>
        <RadarContent />
      </Suspense>
    </div>
  )
}

function RadarSkeleton() {
  return (
    <div className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-surface-card border border-surface-border rounded-xl h-48" />
      ))}
    </div>
  )
}

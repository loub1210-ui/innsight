import { BarChart3 } from 'lucide-react'
import { SynthetiseurContent } from '@/components/synthetiseur/SynthetiseurContent'
import { Suspense } from 'react'

export const metadata = { title: 'Synthétiseur' }

export default function SynthetiseurPage() {
  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center justify-between px-8 h-16 border-b border-surface-border flex-shrink-0">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-5 h-5 text-brand-400" />
          <h1 className="text-lg font-semibold text-white">Synthétiseur</h1>
          <span className="text-sm text-slate-400">Marché hôtelier par ville</span>
        </div>
      </div>

      {/* Content */}
      <Suspense fallback={<div className="flex-1 p-8 animate-pulse" />}>
        <SynthetiseurContent />
      </Suspense>
    </div>
  )
}

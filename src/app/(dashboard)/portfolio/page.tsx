import { PortfolioContent } from '@/components/portfolio/PortfolioContent'
import { LayoutDashboard } from 'lucide-react'

export const metadata = { title: 'Portfolio' }

export default function PortfolioPage() {
  return (
    <div className="flex flex-col h-screen">
      <div className="flex items-center gap-3 px-8 h-16 border-b border-surface-border flex-shrink-0">
        <LayoutDashboard className="w-5 h-5 text-brand-400" />
        <h1 className="text-lg font-semibold text-white">Portfolio</h1>
        <span className="text-sm text-slate-400">Parc immobilier hôtelier</span>
      </div>
      <PortfolioContent />
    </div>
  )
}

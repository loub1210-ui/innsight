import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getVille } from '@/data/villes'
import { VilleDetailContent } from '@/components/synthetiseur/VilleDetailContent'

export function generateMetadata({ params }: { params: { slug: string } }) {
  const v = getVille(params.slug)
  return { title: v ? `${v.ville} — Synthétiseur` : 'Ville inconnue' }
}

export default function VillePage({ params }: { params: { slug: string } }) {
  const ville = getVille(params.slug)
  if (!ville) notFound()

  return (
    <div className="flex flex-col h-screen">
      <div className="flex items-center gap-3 px-8 h-16 border-b border-surface-border flex-shrink-0">
        <Link
          href="/synthetiseur"
          className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />Retour
        </Link>
        <span className="text-surface-border">·</span>
        <h1 className="text-lg font-semibold text-white">{ville.ville}</h1>
        <span className="text-sm text-slate-400 truncate">
          {ville.region} ({ville.dept}) — Fiche marché complète
        </span>
      </div>

      <div className="flex-1 overflow-y-auto">
        <VilleDetailContent ville={ville} />
      </div>
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { CLASSE_ACTIF_LABELS, DPE_COLORS } from '@/types'
import { ArrowLeft, MapPin, TrendingUp, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export default async function OpportuniteDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: opp } = await supabase.from('opportunites').select('*').eq('id', params.id).single()

  if (!opp) notFound()

  const keyscoreColor = opp.keyscore >= 70 ? '#22c55e' : opp.keyscore >= 50 ? '#f59e0b' : '#ef4444'

  return (
    <div className="flex flex-col h-screen">
      <div className="flex items-center gap-4 px-8 h-16 border-b border-surface-border flex-shrink-0">
        <Link href="/radar" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" />Retour
        </Link>
        <span className="text-surface-border">·</span>
        <h1 className="text-sm font-semibold text-white truncate">{opp.titre}</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-8 max-w-3xl">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <span className="text-xs font-medium text-brand-400 bg-brand-500/10 px-2.5 py-1 rounded-md">
              {CLASSE_ACTIF_LABELS[opp.classe_actif]}
            </span>
            <h2 className="text-xl font-bold text-white mt-2">{opp.titre}</h2>
            <div className="flex items-center gap-1.5 text-slate-400 text-sm mt-1">
              <MapPin className="w-4 h-4" />
              {opp.commune} — {opp.dept_code}
            </div>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center border-2 text-2xl font-black"
              style={{ borderColor: keyscoreColor, color: keyscoreColor, backgroundColor: `${keyscoreColor}15` }}>
              {opp.keyscore}
            </div>
            <p className="text-xs text-slate-500 mt-1">Keyscore</p>
          </div>
        </div>

        {/* Financier */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Prix affiché', value: `${(opp.prix_affiche / 1000).toFixed(0)}k €` },
            ...(opp.surface_m2 ? [{ label: 'Surface', value: `${opp.surface_m2} m²` }] : []),
            ...(opp.rendement_brut_estime ? [{ label: 'Rendement brut', value: `${opp.rendement_brut_estime.toFixed(2)} %` }] : []),
            ...(opp.decote_vs_benchmark ? [{ label: 'Décote marché', value: `${opp.decote_vs_benchmark.toFixed(1)} %` }] : []),
          ].map(item => (
            <div key={item.label} className="bg-surface-card border border-surface-border rounded-xl p-4">
              <p className="text-xs text-slate-500 mb-1">{item.label}</p>
              <p className="text-lg font-bold text-white">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Description */}
        {opp.description && (
          <div className="bg-surface-card border border-surface-border rounded-xl p-5 mb-4">
            <h3 className="text-sm font-semibold text-white mb-2">Description</h3>
            <p className="text-sm text-slate-400 leading-relaxed">{opp.description}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          {opp.source_url && (
            <a href={opp.source_url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
              <ExternalLink className="w-4 h-4" />Voir l&apos;annonce
            </a>
          )}
          <Link href={`/stratege`}
            className="flex items-center gap-2 bg-surface-card hover:bg-surface-hover border border-surface-border text-slate-300 hover:text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
            <TrendingUp className="w-4 h-4" />Simuler
          </Link>
        </div>
      </div>
    </div>
  )
}

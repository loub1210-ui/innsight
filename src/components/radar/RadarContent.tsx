'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchOpportunites, type FiltresOpportunites } from '@/services/opportunites'
import { CLASSE_ACTIF_LABELS, type ClasseActif } from '@/types'
import { formatCurrency, formatPercent, cn } from '@/lib/utils'
import { Search, SlidersHorizontal, TrendingUp, MapPin, ExternalLink } from 'lucide-react'
import Link from 'next/link'

const CLASSES: { value: ClasseActif | 'all'; label: string }[] = [
  { value: 'all', label: 'Tous' },
  { value: 'hotel_existant', label: 'Hôtel' },
  { value: 'hotel_distressed', label: 'Distressed' },
  { value: 'marchand_biens', label: 'MdB' },
  { value: 'coliving', label: 'Coliving' },
  { value: 'self_stockage', label: 'Self-stockage' },
  { value: 'dark_kitchen', label: 'Dark Kitchen' },
  { value: 'parking_pl', label: 'Parking PL' },
  { value: 'camping', label: 'Camping' },
]

function KeyscoreBadge({ score }: { score: number }) {
  const cls = score >= 70 ? 'badge-keyscore-high' : score >= 50 ? 'badge-keyscore-mid' : 'badge-keyscore-low'
  return (
    <span className={cn('inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border', cls)}>
      <TrendingUp className="w-3 h-3" />
      {score}
    </span>
  )
}

export function RadarContent() {
  const [filtres, setFiltres] = useState<FiltresOpportunites>({})
  const [search, setSearch] = useState('')
  const [classeFilter, setClasseFilter] = useState<ClasseActif | 'all'>('all')

  const activeFiltres: FiltresOpportunites = {
    ...filtres,
    ...(classeFilter !== 'all' && { classe_actif: classeFilter }),
    ...(search && { search }),
  }

  const { data: opportunites = [], isLoading, error } = useQuery({
    queryKey: ['opportunites', activeFiltres],
    queryFn: () => fetchOpportunites(activeFiltres),
  })

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Filters bar */}
      <div className="px-8 py-4 border-b border-surface-border flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 min-w-48 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-surface border border-surface-border rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {CLASSES.map(c => (
            <button
              key={c.value}
              onClick={() => setClasseFilter(c.value)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                classeFilter === c.value
                  ? 'bg-brand-600 text-white'
                  : 'bg-surface-card text-slate-400 hover:text-slate-200 border border-surface-border'
              )}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <span className="text-sm text-slate-400">
            {isLoading ? '…' : `${opportunites.length} opportunité${opportunites.length > 1 ? 's' : ''}`}
          </span>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-8">
        {error && (
          <div className="text-center py-16 text-slate-400">
            <p className="text-red-400 mb-2">Erreur de chargement</p>
            <p className="text-sm">Vérifiez votre connexion Supabase</p>
          </div>
        )}

        {!isLoading && !error && opportunites.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-surface-card border border-surface-border rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-500" />
            </div>
            <p className="text-slate-300 font-medium mb-1">Aucune opportunité trouvée</p>
            <p className="text-slate-500 text-sm">Modifiez vos filtres ou attendez le prochain scan</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {opportunites.map(opp => (
            <Link
              key={opp.id}
              href={`/radar/${opp.id}`}
              className="bg-surface-card border border-surface-border rounded-xl p-5 hover:border-brand-500/40 hover:bg-surface-card/80 transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-medium text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-md">
                    {CLASSE_ACTIF_LABELS[opp.classe_actif]}
                  </span>
                  <h3 className="text-sm font-semibold text-white mt-2 truncate group-hover:text-brand-300 transition-colors">
                    {opp.titre}
                  </h3>
                </div>
                <KeyscoreBadge score={opp.keyscore} />
              </div>

              <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-4">
                <MapPin className="w-3.5 h-3.5" />
                {opp.commune} ({opp.dept_code})
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-surface-border">
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Prix</p>
                  <p className="text-sm font-semibold text-white">{formatCurrency(opp.prix_affiche, true)}</p>
                </div>
                {opp.rendement_brut_estime && (
                  <div>
                    <p className="text-xs text-slate-500 mb-0.5">Rendement brut</p>
                    <p className="text-sm font-semibold text-emerald-400">{formatPercent(opp.rendement_brut_estime)}</p>
                  </div>
                )}
                {opp.decote_vs_benchmark && (
                  <div>
                    <p className="text-xs text-slate-500 mb-0.5">Décote marché</p>
                    <p className={cn('text-sm font-semibold', opp.decote_vs_benchmark > 0 ? 'text-emerald-400' : 'text-red-400')}>
                      {opp.decote_vs_benchmark > 0 ? '-' : '+'}{Math.abs(opp.decote_vs_benchmark).toFixed(1)}%
                    </p>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

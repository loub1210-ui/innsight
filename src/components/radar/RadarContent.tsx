'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import { fetchOpportunites, type FiltresOpportunites } from '@/services/opportunites'
import { CLASSE_ACTIF_LABELS, type ClasseActif } from '@/types'
import { formatCurrency, formatPercent, cn } from '@/lib/utils'
import { Search, SlidersHorizontal, TrendingUp, MapPin, ExternalLink, X } from 'lucide-react'
import Link from 'next/link'

const CLASSES: { value: ClasseActif | 'all'; label: string }[] = [
  { value: 'all', label: 'Tous' },
  { value: 'hotel', label: 'Hôtel' },
  { value: 'appart_hotel', label: 'Appart-hôtel' },
  { value: 'coliving', label: 'Coliving' },
  { value: 'self_stockage', label: 'Self-stockage' },
  { value: 'dark_kitchen', label: 'Dark Kitchen' },
  { value: 'parking_pl', label: 'Parking PL' },
  { value: 'camping', label: 'Camping' },
  { value: 'auberge', label: 'Auberge' },
  { value: 'gite', label: 'Gîte' },
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
  const searchParams = useSearchParams()
  const villeParam = searchParams.get('ville')

  const [filtres, setFiltres] = useState<FiltresOpportunites>({})
  const [search, setSearch] = useState('')
  const [classeFilter, setClasseFilter] = useState<ClasseActif | 'all'>('all')
  const [villeFilter, setVilleFilter] = useState<string | null>(villeParam)

  // Sync ville filter when URL changes
  useEffect(() => {
    setVilleFilter(villeParam)
  }, [villeParam])

  const activeFiltres: FiltresOpportunites = {
    ...filtres,
    ...(classeFilter !== 'all' && { classe_actif: classeFilter }),
    ...(search && { search }),
    ...(villeFilter && { ville: villeFilter }),
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

        {villeFilter && (
          <div className="flex items-center gap-1.5 bg-brand-500/15 border border-brand-500/30 text-brand-300 px-3 py-1.5 rounded-lg text-xs font-medium">
            <MapPin className="w-3 h-3" />
            {villeFilter}
            <button
              onClick={() => {
                setVilleFilter(null)
                // Clean URL without reload
                window.history.replaceState(null, '', '/radar')
              }}
              className="ml-1 hover:text-white transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

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
                    {opp.nom}
                  </h3>
                </div>
                <KeyscoreBadge score={opp.keyscore} />
              </div>

              <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-4">
                <MapPin className="w-3.5 h-3.5" />
                {opp.commune} ({opp.dept_code})
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-surface-border">
                {opp.prix_demande && (
                  <div>
                    <p className="text-xs text-slate-500 mb-0.5">Prix</p>
                    <p className="text-sm font-semibold text-white">{formatCurrency(opp.prix_demande, true)}</p>
                  </div>
                )}
                {opp.nombre_chambres && (
                  <div>
                    <p className="text-xs text-slate-500 mb-0.5">Chambres</p>
                    <p className="text-sm font-semibold text-white">{opp.nombre_chambres}</p>
                  </div>
                )}
                {opp.revpar_estime && (
                  <div>
                    <p className="text-xs text-slate-500 mb-0.5">RevPAR estimé</p>
                    <p className="text-sm font-semibold text-emerald-400">{formatCurrency(opp.revpar_estime)}</p>
                  </div>
                )}
                {opp.taux_occupation_estime && (
                  <div>
                    <p className="text-xs text-slate-500 mb-0.5">Taux occupation</p>
                    <p className="text-sm font-semibold text-emerald-400">{opp.taux_occupation_estime}%</p>
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

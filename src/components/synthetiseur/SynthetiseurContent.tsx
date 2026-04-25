'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Search,
  Train,
  Building2,
  Calendar,
  Euro,
  Star,
  Tent,
  RefreshCw,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  VILLES,
  VILLES_PRIORITAIRES_HMA,
  ratioHotelsParKm2,
  ratioIndependantsParKm2,
  ratioMiceParKm2,
  ratioTouristesParKm2,
  type VilleDetail,
} from '@/data/villes'

type Tri = 'score' | 'mice' | 'hotels_km2' | 'adr' | 'rendement' | 'prix_m2'

const TRI_OPTIONS: { value: Tri; label: string }[] = [
  { value: 'score', label: 'Score attractivité' },
  { value: 'mice', label: 'MICE / km²' },
  { value: 'hotels_km2', label: 'Hôtels / km²' },
  { value: 'adr', label: 'ADR' },
  { value: 'rendement', label: 'Rendement brut' },
  { value: 'prix_m2', label: 'Prix /m² (croissant)' },
]

type FiltreEtoiles = 'toutes' | '2' | '3' | '4'

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 80 ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
    : score >= 70 ? 'text-amber-400 border-amber-500/30 bg-amber-500/10'
    : 'text-slate-400 border-slate-500/30 bg-slate-500/10'
  return (
    <span className={cn('inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border', color)}>
      {score}
    </span>
  )
}

function TendanceBadge({ tendance }: { tendance: VilleDetail['tendance_marche'] }) {
  return (
    <span className={cn(
      'text-[10px] font-medium px-2 py-0.5 rounded-md',
      tendance === 'hausse' ? 'text-emerald-400 bg-emerald-500/10' :
      tendance === 'baisse' ? 'text-red-400 bg-red-500/10' :
      'text-slate-400 bg-slate-500/10',
    )}>
      {tendance === 'hausse' ? '↗ Hausse' : tendance === 'baisse' ? '↘ Baisse' : '→ Stable'}
    </span>
  )
}

function PrioritaireBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-brand-300 bg-brand-500/15 border border-brand-500/30 px-1.5 py-0.5 rounded">
      <Sparkles className="w-2.5 h-2.5" />
      HMA
    </span>
  )
}

export function SynthetiseurContent() {
  const [search, setSearch] = useState('')
  const [tri, setTri] = useState<Tri>('score')
  const [etoiles, setEtoiles] = useState<FiltreEtoiles>('toutes')
  const [showCamping, setShowCamping] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<string>(new Date().toLocaleString('fr-FR'))

  const villes = useMemo(() => {
    return VILLES
      .filter(v => {
        if (!search) return true
        const s = search.toLowerCase()
        return (
          v.ville.toLowerCase().includes(s) ||
          v.gare_principale.toLowerCase().includes(s) ||
          v.region.toLowerCase().includes(s)
        )
      })
      .sort((a, b) => {
        const aHma = VILLES_PRIORITAIRES_HMA.includes(a.slug) ? 1 : 0
        const bHma = VILLES_PRIORITAIRES_HMA.includes(b.slug) ? 1 : 0
        if (aHma !== bHma) return bHma - aHma
        switch (tri) {
          case 'score': return b.score_attractivite - a.score_attractivite
          case 'mice': return ratioMiceParKm2(b) - ratioMiceParKm2(a)
          case 'hotels_km2': return ratioHotelsParKm2(b) - ratioHotelsParKm2(a)
          case 'adr': return b.adr_moyen - a.adr_moyen
          case 'rendement': return b.rendement_brut - a.rendement_brut
          case 'prix_m2': return a.prix_m2_immobilier - b.prix_m2_immobilier
          default: return 0
        }
      })
  }, [search, tri])

  function handleRefresh() {
    setRefreshing(true)
    setTimeout(() => {
      setLastRefresh(new Date().toLocaleString('fr-FR'))
      setRefreshing(false)
    }, 800)
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-8 py-4 border-b border-surface-border flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher ville, gare, région…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-surface border border-surface-border rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center gap-1 bg-surface-card border border-surface-border rounded-lg p-0.5">
          {(['toutes', '2', '3', '4'] as FiltreEtoiles[]).map(e => (
            <button
              key={e}
              onClick={() => setEtoiles(e)}
              className={cn(
                'px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1',
                etoiles === e ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-slate-200',
              )}
            >
              {e === 'toutes' ? 'Toutes' : <>{e}<Star className="w-3 h-3 fill-current" /></>}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowCamping(!showCamping)}
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all',
            showCamping
              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
              : 'bg-surface-card text-slate-400 border-surface-border hover:text-slate-200',
          )}
        >
          <Tent className="w-3.5 h-3.5" />
          Camping
        </button>

        <div className="flex items-center gap-1.5 flex-wrap">
          {TRI_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setTri(opt.value)}
              className={cn(
                'px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all',
                tri === opt.value
                  ? 'bg-brand-600 text-white'
                  : 'bg-surface-card text-slate-400 hover:text-slate-200 border border-surface-border',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <span className="text-[11px] text-slate-500">MAJ : {lastRefresh}</span>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 bg-surface-card hover:bg-surface-hover border border-surface-border text-slate-200 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={cn('w-3.5 h-3.5', refreshing && 'animate-spin')} />
            Rafraîchir
          </button>
          <span className="text-sm text-slate-400">{villes.length} villes</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
          {villes.map(v => (
            <VilleCard key={v.slug} ville={v} etoilesFilter={etoiles} />
          ))}
        </div>
      </div>
    </div>
  )
}

function VilleCard({ ville: v, etoilesFilter }: { ville: VilleDetail; etoilesFilter: FiltreEtoiles }) {
  const isPrioritaire = VILLES_PRIORITAIRES_HMA.includes(v.slug)
  const hotelsByStars = etoilesFilter === '2' ? v.nb_hotels_2etoiles
    : etoilesFilter === '3' ? v.nb_hotels_3etoiles
    : etoilesFilter === '4' ? v.nb_hotels_4etoiles
    : v.nb_hotels_total

  return (
    <Link
      href={`/synthetiseur/${v.slug}`}
      className="bg-surface-card border border-surface-border rounded-xl p-5 hover:border-brand-500/40 transition-all group block"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <h3 className="text-base font-bold text-white truncate group-hover:text-brand-300">{v.ville}</h3>
            {isPrioritaire && <PrioritaireBadge />}
            <TendanceBadge tendance={v.tendance_marche} />
          </div>
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
            <Train className="w-3 h-3" />
            <span className="truncate">{v.gare_principale}</span>
            <span>·</span>
            <span>{v.region} ({v.dept})</span>
          </div>
        </div>
        <ScoreBadge score={v.score_attractivite} />
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <Ratio
          icon={<Building2 className="w-3 h-3" />}
          label={etoilesFilter === 'toutes' ? 'Hôtels / km²' : `${etoilesFilter}★ / km²`}
          value={(hotelsByStars / v.surface_km2).toFixed(2)}
          sub={`${hotelsByStars} hôtels`}
        />
        <Ratio
          icon={<Building2 className="w-3 h-3" />}
          label="Indé. / km²"
          value={ratioIndependantsParKm2(v).toFixed(2)}
          sub={`${v.nb_hotels_independants} indé.`}
          highlight
        />
        <Ratio
          icon={<Calendar className="w-3 h-3" />}
          label="MICE / an"
          value={v.mice_evenements_an.toString()}
          sub={`${v.mice_visiteurs_an}k visiteurs`}
          accent
        />
        <Ratio
          icon={<Euro className="w-3 h-3" />}
          label="ADR moyen"
          value={`${v.adr_moyen} €`}
          sub={`RevPAR ${v.revpar_moyen} €`}
        />
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 pt-3 border-t border-surface-border text-[11px]">
        <Detail label="Touristes / km²" value={`${(ratioTouristesParKm2(v) / 1000).toFixed(1)}k`} />
        <Detail label="Note Booking" value={`${v.note_booking_moyenne}/10`} />
        <Detail label="Prix /m²" value={`${v.prix_m2_immobilier.toLocaleString('fr-FR')} €`} />
        <Detail label="Rdt brut" value={`${v.rendement_brut}%`} accent />
        <Detail label="Entreprises" value={v.nb_entreprises.toLocaleString('fr-FR')} />
        <Detail label="Population" value={`${(v.population / 1000).toFixed(0)}k`} />
      </div>

      <div className="mt-3 pt-3 border-t border-surface-border flex items-center justify-between">
        <div className="flex gap-1 text-[10px]">
          <span className="text-slate-500">2★</span><span className="text-slate-300">{v.nb_hotels_2etoiles}</span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-500">3★</span><span className="text-slate-300">{v.nb_hotels_3etoiles}</span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-500">4★</span><span className="text-slate-300">{v.nb_hotels_4etoiles}</span>
        </div>
        <span className="text-[11px] text-brand-400 group-hover:text-brand-300 flex items-center gap-1 font-medium">
          Voir la fiche <ChevronRight className="w-3 h-3" />
        </span>
      </div>
    </Link>
  )
}

function Ratio({
  icon, label, value, sub, accent, highlight,
}: { icon: React.ReactNode; label: string; value: string; sub?: string; accent?: boolean; highlight?: boolean }) {
  return (
    <div className={cn(
      'rounded-lg p-2.5 border',
      highlight
        ? 'bg-brand-500/10 border-brand-500/30'
        : accent
          ? 'bg-emerald-500/5 border-emerald-500/20'
          : 'bg-surface border-surface-border',
    )}>
      <div className={cn('flex items-center gap-1 text-[10px]', accent ? 'text-emerald-400' : 'text-slate-500')}>
        {icon}<span className="uppercase tracking-wider">{label}</span>
      </div>
      <p className={cn('text-base font-bold mt-0.5', accent ? 'text-emerald-300' : 'text-white')}>{value}</p>
      {sub && <p className="text-[10px] text-slate-500">{sub}</p>}
    </div>
  )
}

function Detail({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-500">{label}</span>
      <span className={cn('font-medium', accent ? 'text-emerald-400' : 'text-white')}>{value}</span>
    </div>
  )
}

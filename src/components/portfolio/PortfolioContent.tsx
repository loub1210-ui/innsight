'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchActifs, calculerKPIs, genererAlertes } from '@/services/portfolio'
import { CLASSE_ACTIF_LABELS, STATUT_ACTIF_LABELS, DPE_COLORS, type ActifPortefeuille } from '@/types'
import { formatCurrency, formatPercent, cn } from '@/lib/utils'
import { rendementBrut } from '@/utils/finance/rendement'
import Link from 'next/link'
import {
  TrendingUp, TrendingDown, AlertTriangle, Plus, Building2,
  Euro, BarChart3, Wallet
} from 'lucide-react'

function StatCard({ label, value, sub, icon: Icon, trend }: {
  label: string; value: string; sub?: string
  icon: React.ElementType; trend?: 'up' | 'down' | 'neutral'
}) {
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{label}</p>
        <Icon className="w-4 h-4 text-slate-500" />
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      {sub && (
        <p className={cn('text-xs font-medium flex items-center gap-1',
          trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-slate-400'
        )}>
          {trend === 'up' && <TrendingUp className="w-3 h-3" />}
          {trend === 'down' && <TrendingDown className="w-3 h-3" />}
          {sub}
        </p>
      )}
    </div>
  )
}

function DPEBadge({ classe }: { classe: string }) {
  const color = DPE_COLORS[classe as keyof typeof DPE_COLORS] ?? '#94a3b8'
  return (
    <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded border"
      style={{ color, borderColor: `${color}40`, backgroundColor: `${color}15` }}>
      DPE {classe}
    </span>
  )
}

function ActifCard({ actif }: { actif: ActifPortefeuille }) {
  const investissement = actif.prix_acquisition + actif.frais_notaire + actif.cout_travaux
  const rdtBrut = rendementBrut({ loyersAnnuels: actif.revenus_annuels, prixAcquisition: investissement })
  const plusValue = (actif.valeur_estimee ?? actif.prix_acquisition) - investissement

  return (
    <Link
      href={`/portfolio/${actif.id}`}
      className="bg-surface-card border border-surface-border rounded-xl p-5 hover:border-brand-500/40 transition-all group"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs text-brand-400 font-medium">{CLASSE_ACTIF_LABELS[actif.classe_actif]}</p>
          <h3 className="text-sm font-semibold text-white mt-0.5 group-hover:text-brand-300 transition-colors">
            {actif.nom}
          </h3>
          <p className="text-xs text-slate-500">{actif.commune} ({actif.dept_code})</p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          {actif.dpe_classe && <DPEBadge classe={actif.dpe_classe} />}
          <span className={cn('text-xs px-2 py-0.5 rounded-full border',
            actif.statut === 'actif' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' :
            actif.statut === 'en_acquisition' ? 'text-amber-400 bg-amber-500/10 border-amber-500/30' :
            'text-slate-400 bg-slate-500/10 border-slate-500/30'
          )}>
            {STATUT_ACTIF_LABELS[actif.statut]}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 pt-3 border-t border-surface-border">
        <div>
          <p className="text-xs text-slate-500 mb-0.5">Valeur</p>
          <p className="text-sm font-semibold text-white">{formatCurrency(actif.valeur_estimee ?? actif.prix_acquisition, true)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-0.5">Rendement</p>
          <p className="text-sm font-semibold text-emerald-400">{formatPercent(rdtBrut)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-0.5">Plus-value</p>
          <p className={cn('text-sm font-semibold', plusValue >= 0 ? 'text-emerald-400' : 'text-red-400')}>
            {formatCurrency(plusValue, true)}
          </p>
        </div>
      </div>

      {(actif.dpe_classe === 'F' || actif.dpe_classe === 'G' || actif.huwart_conforme === false) && (
        <div className="flex items-center gap-1.5 mt-3 text-xs text-amber-400">
          <AlertTriangle className="w-3.5 h-3.5" />
          {actif.dpe_classe === 'G' || actif.dpe_classe === 'F' ? 'Passoire DPE' : ''}
          {actif.huwart_conforme === false ? ' · Huwart KO' : ''}
        </div>
      )}
    </Link>
  )
}

export function PortfolioContent() {
  const { data: actifs = [], isLoading } = useQuery({
    queryKey: ['actifs-portefeuille'],
    queryFn: () => fetchActifs(),
  })

  const kpis = calculerKPIs(actifs)
  const alertes = genererAlertes(actifs)

  if (isLoading) {
    return (
      <div className="flex-1 p-8 animate-pulse space-y-4">
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-surface-card rounded-xl" />)}
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-40 bg-surface-card rounded-xl" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Valeur du parc" value={formatCurrency(kpis.valeurTotale, true)} icon={Building2}
          sub={`${kpis.nbActifs} actif${kpis.nbActifs > 1 ? 's' : ''}`} trend="neutral" />
        <StatCard label="Plus-value latente" value={formatCurrency(kpis.plusValueLatente, true)} icon={TrendingUp}
          sub={kpis.plusValueLatente >= 0 ? 'Gain latent' : 'Perte latente'}
          trend={kpis.plusValueLatente >= 0 ? 'up' : 'down'} />
        <StatCard label="Rendement brut moy." value={formatPercent(kpis.rendementBrutMoyen)} icon={BarChart3}
          sub="Pondéré par actif" trend="neutral" />
        <StatCard label="Cashflow annuel" value={formatCurrency(kpis.cashflowAnnuel, true)} icon={Wallet}
          sub={kpis.cashflowAnnuel >= 0 ? 'Cash positif' : 'Cash négatif'}
          trend={kpis.cashflowAnnuel >= 0 ? 'up' : 'down'} />
      </div>

      {/* Alertes */}
      {alertes.length > 0 && (
        <div className="bg-surface-card border border-amber-500/20 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-semibold text-white">Alertes réglementaires</h2>
            <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/30">
              {alertes.length}
            </span>
          </div>
          <div className="space-y-2">
            {alertes.slice(0, 5).map((alerte, i) => (
              <Link key={i} href={`/portfolio/${alerte.actifId}`}
                className="flex items-start gap-3 text-sm hover:bg-surface-hover rounded-lg px-2 py-1.5 transition-colors">
                <span className={cn('mt-0.5 w-2 h-2 rounded-full flex-shrink-0',
                  alerte.severite === 'critique' ? 'bg-red-400' : 'bg-amber-400'
                )} />
                <div>
                  <span className="text-slate-300 font-medium">{alerte.actifNom}</span>
                  <span className="text-slate-500 mx-1.5">·</span>
                  <span className="text-slate-400">{alerte.message}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Actifs */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white">
            Actifs <span className="text-slate-500 font-normal ml-1">{actifs.length}</span>
          </h2>
          <Link href="/portfolio/add"
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            <Plus className="w-4 h-4" />
            Ajouter un actif
          </Link>
        </div>

        {actifs.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-surface-border rounded-xl">
            <Building2 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-300 font-medium mb-1">Aucun actif dans le portfolio</p>
            <p className="text-slate-500 text-sm mb-4">Ajoutez votre premier bien hôtelier</p>
            <Link href="/portfolio/add"
              className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
              <Plus className="w-4 h-4" />Ajouter un actif
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {actifs.map(actif => <ActifCard key={actif.id} actif={actif} />)}
          </div>
        )}
      </div>
    </div>
  )
}

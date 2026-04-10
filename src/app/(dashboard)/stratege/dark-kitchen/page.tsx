'use client'

import { useState } from 'react'
import { ArrowLeft, UtensilsCrossed } from 'lucide-react'
import Link from 'next/link'
import { cn, formatCurrency } from '@/lib/utils'

function NumInput({ label, value, onChange, suffix, hint }: { label: string; value: number; onChange: (v: number) => void; suffix?: string; hint?: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-1.5">
        {label}{hint && <span className="ml-1 text-slate-600 text-xs">({hint})</span>}
      </label>
      <div className="relative">
        <input type="number" value={value || ''} onChange={e => onChange(Number(e.target.value))}
          className="w-full bg-surface border border-surface-border rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500 pr-10" />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">{suffix}</span>}
      </div>
    </div>
  )
}

function KpiBox({ label, value, sub, highlight }: { label: string; value: string; sub?: string; highlight?: boolean }) {
  return (
    <div className={cn('rounded-xl p-4 border', highlight ? 'bg-brand-600/15 border-brand-500/30' : 'bg-surface-card border-surface-border')}>
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <p className={cn('text-xl font-bold', highlight ? 'text-brand-300' : 'text-white')}>{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
    </div>
  )
}

export default function DarkKitchenPage() {
  const [form, setForm] = useState({
    investissementTotal: 450000,
    nbPostes: 8,
    loyerParPoste: 1800,
    tauxOccupation: 75,
    chargesFixesAnnuelles: 85000,
    mensualiteCredit: 2200,
    // Revenus services additionnels
    revenusServicesPct: 15, // % du CA location
  })
  const set = (k: keyof typeof form) => (v: number) => setForm(p => ({ ...p, [k]: v }))

  const caLocationAnnuel = form.nbPostes * form.loyerParPoste * 12 * (form.tauxOccupation / 100)
  const caServices = caLocationAnnuel * form.revenusServicesPct / 100
  const caTotal = caLocationAnnuel + caServices

  const revenuParPoste = form.nbPostes > 0 ? caTotal / form.nbPostes / 12 : 0
  const revenuNet = caTotal - form.chargesFixesAnnuelles
  const cashflow = revenuNet - form.mensualiteCredit * 12
  const rendementBrut = form.investissementTotal > 0 ? (caTotal / form.investissementTotal) * 100 : 0
  const rendementNet = form.investissementTotal > 0 ? (revenuNet / form.investissementTotal) * 100 : 0

  // Seuil de rentabilité
  const seuilTO = form.nbPostes > 0 && form.loyerParPoste > 0
    ? ((form.chargesFixesAnnuelles + form.mensualiteCredit * 12) / (form.nbPostes * form.loyerParPoste * 12 * (1 + form.revenusServicesPct / 100))) * 100
    : 0

  const signal = rendementNet >= 12 ? 'ok' : rendementNet >= 7 ? 'warn' : 'danger'

  return (
    <div className="flex flex-col h-screen">
      <div className="flex items-center gap-4 px-8 h-16 border-b border-surface-border flex-shrink-0">
        <Link href="/stratege" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" />Stratège
        </Link>
        <span className="text-slate-600">·</span>
        <UtensilsCrossed className="w-4 h-4 text-orange-400" />
        <h1 className="text-sm font-semibold text-white">Dark Kitchen</h1>
        <span className="text-xs text-slate-500">Rendement par poste cuisine</span>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-3xl grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-5">
            <div className="bg-surface-card border border-surface-border rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-semibold text-white">Investissement</h2>
              <NumInput label="Investissement total (€)" value={form.investissementTotal} onChange={set('investissementTotal')} suffix="€" hint="Achat/loyer + équip. cuisine" />
            </div>

            <div className="bg-surface-card border border-surface-border rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-semibold text-white">Modèle de revenu</h2>
              <NumInput label="Nombre de postes cuisine" value={form.nbPostes} onChange={set('nbPostes')} />
              <NumInput label="Loyer par poste/mois (€)" value={form.loyerParPoste} onChange={set('loyerParPoste')} suffix="€" hint="Location cuisine équipée" />
              <NumInput label="Taux d'occupation (%)" value={form.tauxOccupation} onChange={set('tauxOccupation')} suffix="%" />
              <NumInput label="Services additionnels (%)" value={form.revenusServicesPct} onChange={set('revenusServicesPct')} suffix="%" hint="Livraison, stockage, admin" />
            </div>

            <div className="bg-surface-card border border-surface-border rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-semibold text-white">Charges</h2>
              <NumInput label="Charges fixes annuelles (€)" value={form.chargesFixesAnnuelles} onChange={set('chargesFixesAnnuelles')} suffix="€" />
              <NumInput label="Mensualité crédit (€)" value={form.mensualiteCredit} onChange={set('mensualiteCredit')} suffix="€" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <KpiBox label="CA total annuel" value={formatCurrency(caTotal)} sub="Location + services" />
              <KpiBox label="CA par poste/mois" value={formatCurrency(revenuParPoste)} highlight />
              <KpiBox label="Rendement brut" value={`${rendementBrut.toFixed(2)} %`} highlight />
              <KpiBox label="Rendement net" value={`${rendementNet.toFixed(2)} %`} highlight />
              <KpiBox label="Cashflow annuel" value={formatCurrency(cashflow)} sub="Après crédit" />
              <KpiBox label="CA services add." value={formatCurrency(caServices)} sub={`${form.revenusServicesPct}% du CA`} />
            </div>

            <div className="bg-surface-card border border-surface-border rounded-xl p-4">
              <h3 className="text-sm font-semibold text-white mb-2">Seuil de rentabilité</h3>
              <p className="text-2xl font-bold text-brand-300">{seuilTO.toFixed(1)} % TO</p>
              <p className="text-xs text-slate-500 mt-1">Taux minimum pour couvrir charges + crédit</p>
              <p className={cn('text-xs mt-2 font-medium', form.tauxOccupation >= seuilTO ? 'text-emerald-400' : 'text-red-400')}>
                {form.tauxOccupation >= seuilTO
                  ? `✓ TO actuel (${form.tauxOccupation}%) au-dessus du seuil`
                  : `✗ TO actuel (${form.tauxOccupation}%) en dessous du seuil`}
              </p>
            </div>

            <div className={cn('rounded-lg border px-4 py-3 text-sm flex items-center justify-between',
              signal === 'ok' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
              signal === 'warn' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
              'bg-red-500/10 border-red-500/20 text-red-400'
            )}>
              <span>Rendement net : <strong>{rendementNet.toFixed(1)}%</strong></span>
              <span>{signal === 'ok' ? '✓ Excellent (>12%)' : signal === 'warn' ? '⚠ Acceptable (7-12%)' : '✗ Insuffisant (<7%)'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

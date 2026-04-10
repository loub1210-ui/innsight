'use client'

import { useState } from 'react'
import { ArrowLeft, Tent } from 'lucide-react'
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

// Saisonnalité camping 3★ : mois actifs + pondération
const MOIS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
const SEASONALITY = [0, 0, 0.3, 0.5, 0.7, 0.85, 1, 1, 0.75, 0.4, 0, 0] // TO relatif par mois

export default function CampingPage() {
  const [form, setForm] = useState({
    investissementTotal: 1800000,
    nbEmplacements: 120,
    prixNuiteeEmplacement: 35,
    nbMobilHomes: 40,
    prixNuiteeMobilHome: 120,
    chargesFixesAnnuelles: 280000,
    tauxOccupationPeak: 90,
    mensualiteCredit: 7500,
    horizonAns: 10,
  })
  const set = (k: keyof typeof form) => (v: number) => setForm(p => ({ ...p, [k]: v }))

  // Calcul saisonnalité
  const caParMois = SEASONALITY.map(coef => {
    const toMois = coef * form.tauxOccupationPeak / 100
    const nbJours = 30
    const caEmpl = form.nbEmplacements * form.prixNuiteeEmplacement * toMois * nbJours
    const caMH = form.nbMobilHomes * form.prixNuiteeMobilHome * toMois * nbJours
    return caEmpl + caMH
  })
  const caTotal = caParMois.reduce((a, b) => a + b, 0)

  const nbUnitesTotal = form.nbEmplacements + form.nbMobilHomes
  const nbNuiteesTotal = 365 * nbUnitesTotal

  // RevPAC (Revenue Per Available Camper)
  const revpac = nbUnitesTotal > 0 ? caTotal / (nbUnitesTotal * 365) : 0

  const revenuNet = caTotal - form.chargesFixesAnnuelles
  const cashflow = revenuNet - form.mensualiteCredit * 12
  const rendementBrut = form.investissementTotal > 0 ? (caTotal / form.investissementTotal) * 100 : 0
  const rendementNet = form.investissementTotal > 0 ? (revenuNet / form.investissementTotal) * 100 : 0

  const signal = rendementNet >= 10 ? 'ok' : rendementNet >= 6 ? 'warn' : 'danger'

  // Mois ouverts
  const moisOuverts = SEASONALITY.filter(s => s > 0).length

  return (
    <div className="flex flex-col h-screen">
      <div className="flex items-center gap-4 px-8 h-16 border-b border-surface-border flex-shrink-0">
        <Link href="/stratege" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" />Stratège
        </Link>
        <span className="text-slate-600">·</span>
        <Tent className="w-4 h-4 text-green-400" />
        <h1 className="text-sm font-semibold text-white">Camping 3★</h1>
        <span className="text-xs text-slate-500">RevPAC · Saisonnalité · TRI {form.horizonAns} ans</span>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-5">
            <div className="bg-surface-card border border-surface-border rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-semibold text-white">Investissement</h2>
              <NumInput label="Investissement total (€)" value={form.investissementTotal} onChange={set('investissementTotal')} suffix="€" />
            </div>

            <div className="bg-surface-card border border-surface-border rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-semibold text-white">Hébergements</h2>
              <div className="grid grid-cols-2 gap-3">
                <NumInput label="Emplacements nu" value={form.nbEmplacements} onChange={set('nbEmplacements')} />
                <NumInput label="Prix/nuit empl. (€)" value={form.prixNuiteeEmplacement} onChange={set('prixNuiteeEmplacement')} suffix="€" />
                <NumInput label="Mobil-homes" value={form.nbMobilHomes} onChange={set('nbMobilHomes')} />
                <NumInput label="Prix/nuit MH (€)" value={form.prixNuiteeMobilHome} onChange={set('prixNuiteeMobilHome')} suffix="€" />
              </div>
            </div>

            <div className="bg-surface-card border border-surface-border rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-semibold text-white">Exploitation</h2>
              <NumInput label="TO en haute saison (%)" value={form.tauxOccupationPeak} onChange={set('tauxOccupationPeak')} suffix="%" hint="Juillet-Août" />
              <NumInput label="Charges fixes annuelles (€)" value={form.chargesFixesAnnuelles} onChange={set('chargesFixesAnnuelles')} suffix="€" />
              <NumInput label="Mensualité crédit (€)" value={form.mensualiteCredit} onChange={set('mensualiteCredit')} suffix="€" />
              <NumInput label="Horizon (ans)" value={form.horizonAns} onChange={set('horizonAns')} suffix="ans" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <KpiBox label="CA annuel total" value={formatCurrency(caTotal)} sub={`Modèle saisonnalité 3★`} />
              <KpiBox label="RevPAC" value={`${revpac.toFixed(2)} €`} sub="Rev. par unité/nuit" highlight />
              <KpiBox label="Rendement brut" value={`${rendementBrut.toFixed(2)} %`} highlight />
              <KpiBox label="Rendement net" value={`${rendementNet.toFixed(2)} %`} highlight />
              <KpiBox label="Cashflow annuel" value={formatCurrency(cashflow)} sub="Après crédit" />
              <KpiBox label="Mois d'exploitation" value={`${moisOuverts} mois`} />
            </div>

            {/* Saisonnalité visuelle */}
            <div className="bg-surface-card border border-surface-border rounded-xl p-4">
              <h3 className="text-xs font-semibold text-white mb-3">CA mensuel estimé</h3>
              <div className="space-y-1.5">
                {MOIS.map((mois, i) => {
                  const pct = caTotal > 0 ? (caParMois[i] / Math.max(...caParMois)) * 100 : 0
                  return (
                    <div key={mois} className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 w-7">{mois}</span>
                      <div className="flex-1 h-2 bg-surface rounded-full overflow-hidden">
                        <div className="h-full bg-green-500/60 rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-slate-400 w-16 text-right">{formatCurrency(caParMois[i])}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className={cn('rounded-lg border px-4 py-3 text-sm flex items-center justify-between',
              signal === 'ok' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
              signal === 'warn' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
              'bg-red-500/10 border-red-500/20 text-red-400'
            )}>
              <span>Rendement net : <strong>{rendementNet.toFixed(1)}%</strong></span>
              <span>{signal === 'ok' ? '✓ Excellent (>10%)' : signal === 'warn' ? '⚠ Acceptable (6-10%)' : '✗ Insuffisant (<6%)'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

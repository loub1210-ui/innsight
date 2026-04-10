'use client'

import { useState } from 'react'
import { ArrowLeft, ParkingCircle, AlertTriangle, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { cn, formatCurrency } from '@/lib/utils'
import { conformiteHuwart } from '@/utils/finance/marge'

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

export default function ParkingPLPage() {
  const [form, setForm] = useState({
    investissementTotal: 900000,
    surfaceLogistiqueM2: 2500,
    nbPlacesPL: 3,
    coutPlacePL: 15000,
    // Revenus
    nbEmplacementsLocation: 45,
    loyerEmplacement: 180,
    tauxOccupation: 85,
    chargesAnnuelles: 32000,
    mensualiteCredit: 4200,
  })
  const set = (k: keyof typeof form) => (v: number) => setForm(p => ({ ...p, [k]: v }))

  const huwart = conformiteHuwart(form.surfaceLogistiqueM2, form.nbPlacesPL, form.coutPlacePL)

  const caAnnuel = form.nbEmplacementsLocation * form.loyerEmplacement * 12 * (form.tauxOccupation / 100)
  const revenuNet = caAnnuel - form.chargesAnnuelles - huwart.coutMiseConformite / 10 // amortissement sur 10 ans
  const investissementTotal = form.investissementTotal + huwart.coutMiseConformite
  const rendementBrut = investissementTotal > 0 ? (caAnnuel / investissementTotal) * 100 : 0
  const rendementNet = investissementTotal > 0 ? (revenuNet / investissementTotal) * 100 : 0
  const cashflow = revenuNet - form.mensualiteCredit * 12

  const signal = rendementNet >= 7 ? 'ok' : rendementNet >= 4 ? 'warn' : 'danger'

  return (
    <div className="flex flex-col h-screen">
      <div className="flex items-center gap-4 px-8 h-16 border-b border-surface-border flex-shrink-0">
        <Link href="/stratege" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" />Stratège
        </Link>
        <span className="text-slate-600">·</span>
        <ParkingCircle className="w-4 h-4 text-emerald-400" />
        <h1 className="text-sm font-semibold text-white">Parking PL</h1>
        <span className="text-xs text-slate-500">Rendement + Conformité loi Huwart</span>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-3xl grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-5">
            <div className="bg-surface-card border border-surface-border rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-semibold text-white">Acquisition & Site</h2>
              <NumInput label="Investissement total (€)" value={form.investissementTotal} onChange={set('investissementTotal')} suffix="€" />
              <NumInput label="Surface logistique (m²)" value={form.surfaceLogistiqueM2} onChange={set('surfaceLogistiqueM2')} suffix="m²" hint="Pour calcul loi Huwart" />
              <NumInput label="Places PL existantes" value={form.nbPlacesPL} onChange={set('nbPlacesPL')} />
              <NumInput label="Coût création place PL (€)" value={form.coutPlacePL} onChange={set('coutPlacePL')} suffix="€" />
            </div>

            <div className="bg-surface-card border border-surface-border rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-semibold text-white">Exploitation</h2>
              <NumInput label="Emplacements loués" value={form.nbEmplacementsLocation} onChange={set('nbEmplacementsLocation')} />
              <NumInput label="Loyer par emplacement (€/mois)" value={form.loyerEmplacement} onChange={set('loyerEmplacement')} suffix="€" />
              <NumInput label="Taux d'occupation (%)" value={form.tauxOccupation} onChange={set('tauxOccupation')} suffix="%" />
              <NumInput label="Charges annuelles (€)" value={form.chargesAnnuelles} onChange={set('chargesAnnuelles')} suffix="€" />
              <NumInput label="Mensualité crédit (€)" value={form.mensualiteCredit} onChange={set('mensualiteCredit')} suffix="€" />
            </div>
          </div>

          <div className="space-y-4">
            {/* Huwart */}
            <div className={cn('rounded-xl border p-4', huwart.conforme ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20')}>
              <div className="flex items-center gap-2 mb-3">
                {huwart.conforme
                  ? <CheckCircle className="w-5 h-5 text-emerald-400" />
                  : <AlertTriangle className="w-5 h-5 text-red-400" />}
                <h3 className={cn('text-sm font-semibold', huwart.conforme ? 'text-emerald-400' : 'text-red-400')}>
                  Loi Huwart — {huwart.conforme ? 'Conforme' : 'Non conforme'}
                </h3>
              </div>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Places requises (1 / 1 500 m²)</span>
                  <span className="text-white font-medium">{Math.ceil(form.surfaceLogistiqueM2 / 1500)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Places existantes</span>
                  <span className="text-white font-medium">{form.nbPlacesPL}</span>
                </div>
                {!huwart.conforme && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Places manquantes</span>
                      <span className="text-red-400 font-semibold">{huwart.placesManquantes}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Coût mise en conformité</span>
                      <span className="text-red-400 font-semibold">{formatCurrency(huwart.coutMiseConformite)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 gap-3">
              <KpiBox label="Investissement total" value={formatCurrency(investissementTotal)} sub="Avec mise en conformité" />
              <KpiBox label="CA annuel" value={formatCurrency(caAnnuel)} />
              <KpiBox label="Rendement brut" value={`${rendementBrut.toFixed(2)} %`} highlight />
              <KpiBox label="Rendement net" value={`${rendementNet.toFixed(2)} %`} highlight />
              <KpiBox label="Cashflow annuel" value={formatCurrency(cashflow)} sub="Après crédit" />
              <KpiBox label="Revenu net annuel" value={formatCurrency(revenuNet)} />
            </div>

            <div className={cn('rounded-lg border px-4 py-3 text-sm flex items-center justify-between',
              signal === 'ok' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
              signal === 'warn' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
              'bg-red-500/10 border-red-500/20 text-red-400'
            )}>
              <span>Rendement net : <strong>{rendementNet.toFixed(1)}%</strong></span>
              <span>{signal === 'ok' ? '✓ Excellent (>7%)' : signal === 'warn' ? '⚠ Acceptable (4-7%)' : '✗ Insuffisant (<4%)'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

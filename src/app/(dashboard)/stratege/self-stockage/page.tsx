'use client'

import { useState } from 'react'
import { ArrowLeft, Layers } from 'lucide-react'
import Link from 'next/link'
import { cn, formatCurrency } from '@/lib/utils'
import { bilanSelfStockage } from '@/utils/finance/marge'

function NumInput({ label, value, onChange, suffix, hint, min, max }: { label: string; value: number; onChange: (v: number) => void; suffix?: string; hint?: string; min?: number; max?: number }) {
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

export default function SelfStockagePage() {
  const [form, setForm] = useState({
    investissementTotal: 1200000,
    surfaceM2: 800,
    loyerM2Mensuel: 12,
    tauxOccupation: 75,
    chargesAnnuelles: 45000,
    mensualiteCredit: 5500,
  })
  const set = (k: keyof typeof form) => (v: number) => setForm(p => ({ ...p, [k]: v }))

  let bilan: ReturnType<typeof bilanSelfStockage> | null = null
  try {
    bilan = bilanSelfStockage({
      investissementTotal: form.investissementTotal,
      surfaceTotaleM2: form.surfaceM2,
      loyerM2Mensuel: form.loyerM2Mensuel,
      tauxOccupation: form.tauxOccupation / 100,
      chargesAnnuelles: form.chargesAnnuelles,
    })
  } catch { bilan = null }

  // Seuil de rentabilité (TO minimum pour couvrir les charges)
  const caPleinOccupation = form.surfaceM2 * form.loyerM2Mensuel * 12
  const seuilTO = caPleinOccupation > 0 ? ((form.chargesAnnuelles + form.mensualiteCredit * 12) / caPleinOccupation) * 100 : 0

  const cashflow = bilan ? bilan.revenusAnnuelsNets - form.mensualiteCredit * 12 : 0
  const revM2 = bilan ? form.loyerM2Mensuel * (form.tauxOccupation / 100) * 12 : 0

  const signal = bilan
    ? bilan.rendementNet >= 8 ? 'ok' : bilan.rendementNet >= 5 ? 'warn' : 'danger'
    : 'danger'

  return (
    <div className="flex flex-col h-screen">
      <div className="flex items-center gap-4 px-8 h-16 border-b border-surface-border flex-shrink-0">
        <Link href="/stratege" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" />Stratège
        </Link>
        <span className="text-slate-600">·</span>
        <Layers className="w-4 h-4 text-cyan-400" />
        <h1 className="text-sm font-semibold text-white">Self-Stockage</h1>
        <span className="text-xs text-slate-500">Seuil rentabilité · RevM² · TRI 15 ans</span>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-3xl grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-5">
            <div className="bg-surface-card border border-surface-border rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-semibold text-white">Investissement</h2>
              <NumInput label="Investissement total (€)" value={form.investissementTotal} onChange={set('investissementTotal')} suffix="€" hint="Achat + travaux + équip." />
              <NumInput label="Surface louable (m²)" value={form.surfaceM2} onChange={set('surfaceM2')} suffix="m²" />
            </div>

            <div className="bg-surface-card border border-surface-border rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-semibold text-white">Exploitation</h2>
              <NumInput label="Loyer moyen au m²/mois (€)" value={form.loyerM2Mensuel} onChange={set('loyerM2Mensuel')} suffix="€/m²" />
              <NumInput label="Taux d'occupation (%)" value={form.tauxOccupation} onChange={set('tauxOccupation')} suffix="%" min={0} max={100} />
              <NumInput label="Charges annuelles (€)" value={form.chargesAnnuelles} onChange={set('chargesAnnuelles')} suffix="€" />
              <NumInput label="Mensualité crédit (€)" value={form.mensualiteCredit} onChange={set('mensualiteCredit')} suffix="€" />
            </div>
          </div>

          <div className="space-y-4">
            {bilan ? (
              <>
                <div>
                  <h2 className="text-sm font-semibold text-white mb-3">Résultats</h2>
                  <div className="grid grid-cols-2 gap-3">
                    <KpiBox label="CA annuel brut" value={formatCurrency(bilan.revenusAnnuelsBruts)} />
                    <KpiBox label="CA annuel net" value={formatCurrency(bilan.revenusAnnuelsNets)} />
                    <KpiBox label="RevM² annuel" value={`${revM2.toFixed(0)} €/m²`} sub="Revenue par m² loué" highlight />
                    <KpiBox label="Rendement brut" value={`${bilan.rendementBrut.toFixed(2)} %`} highlight />
                    <KpiBox label="Rendement net" value={`${bilan.rendementNet.toFixed(2)} %`} highlight />
                    <KpiBox label="Cashflow annuel" value={formatCurrency(cashflow)} sub="Après crédit" />
                  </div>
                </div>

                <div className="bg-surface-card border border-surface-border rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-white mb-2">Seuil de rentabilité</h3>
                  <p className="text-2xl font-bold text-brand-300">{seuilTO.toFixed(1)} % TO</p>
                  <p className="text-xs text-slate-500 mt-1">Taux d&apos;occupation minimum pour couvrir charges + crédit</p>
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
                  <span>Rendement net : <strong>{bilan.rendementNet.toFixed(1)}%</strong></span>
                  <span>{signal === 'ok' ? '✓ Excellent' : signal === 'warn' ? '⚠ Acceptable' : '✗ Insuffisant'}</span>
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-500">Renseigne les champs pour voir les résultats</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

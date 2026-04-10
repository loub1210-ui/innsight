'use client'

import { useState } from 'react'
import { ArrowLeft, Home } from 'lucide-react'
import Link from 'next/link'
import { cn, formatCurrency } from '@/lib/utils'
import { bilanColiving } from '@/utils/finance/marge'
import { calculTRI } from '@/utils/finance/tri'

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

export default function ColivingPage() {
  const [form, setForm] = useState({
    prixAchat: 650000,
    fraisNotaire: 52000,
    travaux: 120000,
    mobilier: 40000,
    nbChambres: 8,
    loyerParChambre: 680,
    tauxOccupation: 90,
    chargesAnnuelles: 18000,
    mensualiteCredit: 3200,
    horizonAns: 10,
  })
  const set = (k: keyof typeof form) => (v: number) => setForm(p => ({ ...p, [k]: v }))

  let bilan: ReturnType<typeof bilanColiving> | null = null
  try {
    bilan = bilanColiving({
      prixAchat: form.prixAchat,
      fraisNotaire: form.fraisNotaire,
      travaux: form.travaux,
      mobilier: form.mobilier,
      loyerMensuelParChambre: form.loyerParChambre,
      nbChambres: form.nbChambres,
      tauxOccupation: form.tauxOccupation / 100,
      chargesAnnuelles: form.chargesAnnuelles,
    })
  } catch { bilan = null }

  const cashflowNet = bilan ? bilan.revenuNetAnnuel - form.mensualiteCredit * 12 : 0
  const cashflowParChambre = form.nbChambres > 0 ? cashflowNet / form.nbChambres / 12 : 0

  // TRI sur 10 ans
  let tri = 0
  if (bilan && bilan.investissementTotal > 0) {
    const flux: number[] = [-bilan.investissementTotal]
    for (let i = 0; i < form.horizonAns; i++) flux.push(cashflowNet)
    // valeur terminale = 15x cashflow net
    flux[form.horizonAns] += cashflowNet * 15
    try { const r = calculTRI(flux); tri = r !== null ? r * 100 : 0 } catch { tri = 0 }
  }

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
        <Home className="w-4 h-4 text-blue-400" />
        <h1 className="text-sm font-semibold text-white">Coliving</h1>
        <span className="text-xs text-slate-500">Rendement par chambre · TRI {form.horizonAns} ans</span>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-3xl grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-5">
            <div className="bg-surface-card border border-surface-border rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-semibold text-white">Acquisition</h2>
              <NumInput label="Prix d'achat (€)" value={form.prixAchat} onChange={set('prixAchat')} suffix="€" />
              <NumInput label="Frais de notaire (€)" value={form.fraisNotaire} onChange={set('fraisNotaire')} suffix="€" />
              <NumInput label="Travaux d'aménagement (€)" value={form.travaux} onChange={set('travaux')} suffix="€" />
              <NumInput label="Mobilier & équipements (€)" value={form.mobilier} onChange={set('mobilier')} suffix="€" />
            </div>

            <div className="bg-surface-card border border-surface-border rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-semibold text-white">Exploitation</h2>
              <NumInput label="Nombre de chambres" value={form.nbChambres} onChange={set('nbChambres')} />
              <NumInput label="Loyer par chambre (€/mois)" value={form.loyerParChambre} onChange={set('loyerParChambre')} suffix="€" />
              <NumInput label="Taux d'occupation (%)" value={form.tauxOccupation} onChange={set('tauxOccupation')} suffix="%" min={0} max={100} />
              <NumInput label="Charges annuelles (€)" value={form.chargesAnnuelles} onChange={set('chargesAnnuelles')} suffix="€" hint="Copro, taxe, assurance" />
              <NumInput label="Mensualité crédit (€)" value={form.mensualiteCredit} onChange={set('mensualiteCredit')} suffix="€" />
            </div>

            <div className="bg-surface-card border border-surface-border rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-semibold text-white">Sortie</h2>
              <NumInput label="Horizon d'investissement (ans)" value={form.horizonAns} onChange={set('horizonAns')} suffix="ans" />
            </div>
          </div>

          <div className="space-y-4">
            {bilan ? (
              <>
                <div>
                  <h2 className="text-sm font-semibold text-white mb-3">Performance</h2>
                  <div className="grid grid-cols-2 gap-3">
                    <KpiBox label="Investissement total" value={formatCurrency(bilan.investissementTotal)} />
                    <KpiBox label="CA annuel brut" value={formatCurrency(bilan.chiffreAffairesAnnuel)} />
                    <KpiBox label="Rendement brut" value={`${bilan.rendementBrut.toFixed(2)} %`} highlight />
                    <KpiBox label="Rendement net" value={`${bilan.rendementNet.toFixed(2)} %`} highlight />
                    <KpiBox label="Cashflow net annuel" value={formatCurrency(cashflowNet)} sub="Après crédit" />
                    <KpiBox label="CF par chambre/mois" value={formatCurrency(cashflowParChambre)} />
                    <KpiBox label={`TRI (${form.horizonAns} ans)`} value={`${tri.toFixed(1)} %`} highlight />
                    <KpiBox label="Revenu net annuel" value={formatCurrency(bilan.revenuNetAnnuel)} />
                  </div>
                </div>

                <div className={cn('rounded-lg border px-4 py-3 text-sm flex items-center justify-between',
                  signal === 'ok' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                  signal === 'warn' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                  'bg-red-500/10 border-red-500/20 text-red-400'
                )}>
                  <span>Rendement net : <strong>{bilan.rendementNet.toFixed(1)}%</strong></span>
                  <span>{signal === 'ok' ? '✓ Excellent (>8%)' : signal === 'warn' ? '⚠ Acceptable (5-8%)' : '✗ Insuffisant (<5%)'}</span>
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

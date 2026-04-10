'use client'

import { useState, useMemo } from 'react'
import { ArrowLeft, Building2 } from 'lucide-react'
import Link from 'next/link'
import { cn, formatCurrency } from '@/lib/utils'
import { calculTRI } from '@/utils/finance/tri'

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

// Tableau d'amortissement simplifié
function genTableau(capital: number, tauxAnnuel: number, dureeAns: number, nRows = 10) {
  const tauxMensuel = tauxAnnuel / 12
  const nbMois = dureeAns * 12
  const mensualite = tauxMensuel > 0
    ? capital * tauxMensuel / (1 - Math.pow(1 + tauxMensuel, -nbMois))
    : capital / nbMois
  const rows: { annee: number; capitalRestant: number; interets: number; capital: number }[] = []
  let restant = capital
  for (let a = 1; a <= Math.min(nRows, dureeAns); a++) {
    let interetsAnnee = 0, capitalAnnee = 0
    for (let m = 0; m < 12; m++) {
      const intMois = restant * tauxMensuel
      const capMois = mensualite - intMois
      interetsAnnee += intMois
      capitalAnnee += capMois
      restant -= capMois
    }
    rows.push({ annee: a, capitalRestant: Math.max(0, restant), interets: interetsAnnee, capital: capitalAnnee })
  }
  return { mensualite, rows }
}

export default function ImmeubleRapportPage() {
  const [form, setForm] = useState({
    prixAchat: 1200000,
    fraisNotaire: 96000,
    travaux: 180000,
    apportPct: 25,
    tauxCredit: 4.5,
    dureeCredit: 20,
    revenus: 85000,
    charges: 22000,
    valeurRevente: 1600000,
    horizonAns: 15,
  })
  const set = (k: keyof typeof form) => (v: number) => setForm(p => ({ ...p, [k]: v }))

  const investissement = form.prixAchat + form.fraisNotaire + form.travaux
  const fondsProppres = investissement * form.apportPct / 100
  const dette = investissement - fondsProppres

  const { mensualite, rows } = useMemo(() =>
    genTableau(dette, form.tauxCredit / 100, form.dureeCredit),
    [dette, form.tauxCredit, form.dureeCredit]
  )

  const revenuNet = form.revenus - form.charges
  const cashflowAnnuel = revenuNet - mensualite * 12
  const rendementBrut = investissement > 0 ? (form.revenus / investissement) * 100 : 0
  const rendementNet = investissement > 0 ? (revenuNet / investissement) * 100 : 0

  // TRI fonds propres
  const flux: number[] = [-fondsProppres]
  for (let i = 0; i < form.horizonAns; i++) flux.push(cashflowAnnuel)
  const plusValue = form.valeurRevente - investissement
  flux[form.horizonAns] = cashflowAnnuel + plusValue
  const tri = calculTRI(flux) ?? 0

  const signal = rendementNet >= 7 ? 'ok' : rendementNet >= 4 ? 'warn' : 'danger'

  return (
    <div className="flex flex-col h-screen">
      <div className="flex items-center gap-4 px-8 h-16 border-b border-surface-border flex-shrink-0">
        <Link href="/stratege" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" />Stratège
        </Link>
        <span className="text-slate-600">·</span>
        <Building2 className="w-4 h-4 text-pink-400" />
        <h1 className="text-sm font-semibold text-white">Immeuble de rapport</h1>
        <span className="text-xs text-slate-500">Cashflow · TRI fonds propres · Tableau crédit</span>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-5">
            <div className="bg-surface-card border border-surface-border rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-semibold text-white">Acquisition</h2>
              <div className="grid grid-cols-2 gap-3">
                <NumInput label="Prix d'achat (€)" value={form.prixAchat} onChange={set('prixAchat')} suffix="€" />
                <NumInput label="Frais de notaire (€)" value={form.fraisNotaire} onChange={set('fraisNotaire')} suffix="€" />
                <NumInput label="Travaux (€)" value={form.travaux} onChange={set('travaux')} suffix="€" />
                <NumInput label="Apport (%)" value={form.apportPct} onChange={set('apportPct')} suffix="%" />
              </div>
            </div>

            <div className="bg-surface-card border border-surface-border rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-semibold text-white">Crédit</h2>
              <div className="grid grid-cols-2 gap-3">
                <NumInput label="Taux d'intérêt (%)" value={form.tauxCredit} onChange={set('tauxCredit')} suffix="%" />
                <NumInput label="Durée (ans)" value={form.dureeCredit} onChange={set('dureeCredit')} suffix="ans" />
              </div>
            </div>

            <div className="bg-surface-card border border-surface-border rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-semibold text-white">Exploitation & Sortie</h2>
              <div className="grid grid-cols-2 gap-3">
                <NumInput label="Revenus annuels (€)" value={form.revenus} onChange={set('revenus')} suffix="€" />
                <NumInput label="Charges annuelles (€)" value={form.charges} onChange={set('charges')} suffix="€" />
                <NumInput label="Valeur de revente (€)" value={form.valeurRevente} onChange={set('valeurRevente')} suffix="€" />
                <NumInput label="Horizon (ans)" value={form.horizonAns} onChange={set('horizonAns')} suffix="ans" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <KpiBox label="Investissement total" value={formatCurrency(investissement)} />
              <KpiBox label="Fonds propres" value={formatCurrency(fondsProppres)} />
              <KpiBox label="Mensualité crédit" value={formatCurrency(mensualite)} sub={`${form.dureeCredit} ans @ ${form.tauxCredit}%`} />
              <KpiBox label="Cashflow annuel" value={`${cashflowAnnuel >= 0 ? '+' : ''}${formatCurrency(cashflowAnnuel)}`} highlight />
              <KpiBox label="Rendement brut" value={`${rendementBrut.toFixed(2)} %`} highlight />
              <KpiBox label="Rendement net" value={`${rendementNet.toFixed(2)} %`} highlight />
              <KpiBox label={`TRI FP (${form.horizonAns} ans)`} value={`${tri.toFixed(1)} %`} highlight />
              <KpiBox label="Plus-value latente" value={`${plusValue >= 0 ? '+' : ''}${formatCurrency(plusValue)}`} />
            </div>

            <div className={cn('rounded-lg border px-4 py-3 text-sm flex items-center justify-between',
              signal === 'ok' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
              signal === 'warn' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
              'bg-red-500/10 border-red-500/20 text-red-400'
            )}>
              <span>Rendement net : <strong>{rendementNet.toFixed(1)}%</strong></span>
              <span>{signal === 'ok' ? '✓ Excellent (>7%)' : signal === 'warn' ? '⚠ Acceptable (4-7%)' : '✗ Insuffisant (<4%)'}</span>
            </div>

            {/* Tableau crédit */}
            <div className="bg-surface-card border border-surface-border rounded-xl p-4">
              <h3 className="text-sm font-semibold text-white mb-3">Tableau d&apos;amortissement (10 premières années)</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-slate-500 border-b border-surface-border">
                      <th className="text-left pb-2">An.</th>
                      <th className="text-right pb-2">Capital restant</th>
                      <th className="text-right pb-2">Intérêts</th>
                      <th className="text-right pb-2">Capital remboursé</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map(r => (
                      <tr key={r.annee} className="border-b border-surface-border/30 last:border-0">
                        <td className="py-1.5 text-slate-400">{r.annee}</td>
                        <td className="py-1.5 text-right text-slate-300">{formatCurrency(r.capitalRestant)}</td>
                        <td className="py-1.5 text-right text-red-400/80">{formatCurrency(r.interets)}</td>
                        <td className="py-1.5 text-right text-emerald-400/80">{formatCurrency(r.capital)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

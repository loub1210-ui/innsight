'use client'

import { useState } from 'react'
import { ArrowLeft, Hotel, Info } from 'lucide-react'
import Link from 'next/link'
import { cn, formatCurrency, formatPercent } from '@/lib/utils'

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label className="flex items-center gap-1 text-xs font-medium text-slate-400 mb-1.5">
        {label}
        {hint && <span className="text-slate-600 cursor-help" title={hint}><Info className="w-3 h-3" /></span>}
      </label>
      {children}
    </div>
  )
}

function NumInput({ value, onChange, suffix, ...props }: { value: number; onChange: (v: number) => void; suffix?: string } & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'>) {
  return (
    <div className="relative">
      <input
        type="number"
        value={value || ''}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full bg-surface border border-surface-border rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500 pr-10"
        {...props}
      />
      {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">{suffix}</span>}
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

export default function HotelDistressedPage() {
  const [form, setForm] = useState({
    // Acquisition
    prixAchat: 2500000,
    fraisNotaire: 200000,
    travaux: 800000,
    ffondsPopresPct: 30, // % apport
    // Exploitation
    chambres: 40,
    tauxOccupation: 68,
    revpar: 85,
    trevparPct: 35, // autres revenus / RevPAR %
    // Charges
    coutsChambresPct: 25, // en % du CA
    chargesFixes: 320000,
    gopMarginCible: 32,
    // Sortie
    horizonAns: 7,
    tauxCapSortie: 7.5,
  })

  const set = (k: keyof typeof form) => (v: number) => setForm(p => ({ ...p, [k]: v }))

  // Calculs
  const investissement = form.prixAchat + form.fraisNotaire + form.travaux
  const fondsProppres = investissement * form.ffondsPopresPct / 100
  const dette = investissement - fondsProppres

  const caChambres = form.chambres * (form.tauxOccupation / 100) * form.revpar * 365
  const caTotal = caChambres * (1 + form.trevparPct / 100)
  const trevpar = caTotal / (form.chambres * 365)

  const coutsChambresMontant = caChambres * form.coutsChambresPct / 100
  const gop = caTotal - coutsChambresMontant - form.chargesFixes
  const gopMargin = caTotal > 0 ? (gop / caTotal) * 100 : 0

  const mensualiteEstimee = dette * (0.045 / 12) / (1 - Math.pow(1 + 0.045 / 12, -240)) // 20 ans 4.5%
  const ebitda = gop - mensualiteEstimee * 12

  // Valorisation et TRI simplifié
  const valeurSortie = gop / (form.tauxCapSortie / 100)
  const plusValue = valeurSortie - investissement

  // TRI simplifié (méthode approximative Newton)
  const cashflowAnnuel = ebitda
  function computeTRI(): number {
    let rate = 0.1
    for (let i = 0; i < 50; i++) {
      let npv = -fondsProppres
      for (let y = 1; y <= form.horizonAns; y++) {
        npv += cashflowAnnuel / Math.pow(1 + rate, y)
      }
      npv += plusValue / Math.pow(1 + rate, form.horizonAns)
      const dnpv = form.horizonAns * cashflowAnnuel / Math.pow(1 + rate, form.horizonAns + 1)
      rate -= npv / dnpv
    }
    return rate
  }
  const tri = isFinite(cashflowAnnuel) && cashflowAnnuel > 0 ? computeTRI() * 100 : 0

  const em = fondsProppres > 0 ? (fondsProppres + cashflowAnnuel * form.horizonAns + plusValue) / fondsProppres : 0

  const signal = gopMargin >= form.gopMarginCible ? 'ok' : gopMargin >= form.gopMarginCible * 0.8 ? 'warn' : 'danger'
  const triSignal = tri >= 15 ? 'ok' : tri >= 10 ? 'warn' : 'danger'

  return (
    <div className="flex flex-col h-screen">
      <div className="flex items-center gap-4 px-8 h-16 border-b border-surface-border flex-shrink-0">
        <Link href="/stratege" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" />Stratège
        </Link>
        <span className="text-slate-600">·</span>
        <Hotel className="w-4 h-4 text-gold-500" />
        <h1 className="text-sm font-semibold text-white">Hôtel Distressed</h1>
        <span className="text-xs text-slate-500">RevPAR · TRevPAR · GOP · TRI Global</span>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Colonne gauche : inputs */}
          <div className="space-y-5">

            <div className="bg-surface-card border border-surface-border rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-semibold text-white">Acquisition & Financement</h2>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Prix d'achat (€)"><NumInput value={form.prixAchat} onChange={set('prixAchat')} suffix="€" /></Field>
                <Field label="Frais notaire (€)"><NumInput value={form.fraisNotaire} onChange={set('fraisNotaire')} suffix="€" /></Field>
                <Field label="Travaux / Réno (€)"><NumInput value={form.travaux} onChange={set('travaux')} suffix="€" /></Field>
                <Field label="Apport fonds propres" hint="% de l'investissement total"><NumInput value={form.ffondsPopresPct} onChange={set('ffondsPopresPct')} suffix="%" min={0} max={100} /></Field>
              </div>
            </div>

            <div className="bg-surface-card border border-surface-border rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-semibold text-white">Exploitation Hôtelière</h2>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Nombre de chambres"><NumInput value={form.chambres} onChange={set('chambres')} /></Field>
                <Field label="Taux d'occupation" hint="TO cible après reprise"><NumInput value={form.tauxOccupation} onChange={set('tauxOccupation')} suffix="%" min={0} max={100} /></Field>
                <Field label="RevPAR (€/nuit)" hint="Revenue Per Available Room"><NumInput value={form.revpar} onChange={set('revpar')} suffix="€" /></Field>
                <Field label="Autres revenus" hint="% du CA hébergement (bar, resto, spa...)"><NumInput value={form.trevparPct} onChange={set('trevparPct')} suffix="%" /></Field>
              </div>
            </div>

            <div className="bg-surface-card border border-surface-border rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-semibold text-white">Structure de Charges</h2>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Coûts variables chambres" hint="% du CA hébergement"><NumInput value={form.coutsChambresPct} onChange={set('coutsChambresPct')} suffix="%" min={0} max={100} /></Field>
                <Field label="Charges fixes annuelles (€)" hint="Salaires, énergie, assurance, CAPEX..."><NumInput value={form.chargesFixes} onChange={set('chargesFixes')} suffix="€" /></Field>
                <Field label="Marge GOP cible" hint="GOP margin benchmark hôtellerie 3★ : 28-35%"><NumInput value={form.gopMarginCible} onChange={set('gopMarginCible')} suffix="%" /></Field>
              </div>
            </div>

            <div className="bg-surface-card border border-surface-border rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-semibold text-white">Sortie</h2>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Horizon de détention"><NumInput value={form.horizonAns} onChange={set('horizonAns')} suffix="ans" min={1} max={30} /></Field>
                <Field label="Taux cap. sortie" hint="Cap rate de cession"><NumInput value={form.tauxCapSortie} onChange={set('tauxCapSortie')} suffix="%" min={1} max={20} /></Field>
              </div>
            </div>
          </div>

          {/* Colonne droite : résultats */}
          <div className="space-y-5">

            {/* Synthèse investissement */}
            <div className="bg-surface-card border border-surface-border rounded-xl p-5">
              <h2 className="text-sm font-semibold text-white mb-3">Investissement</h2>
              <div className="space-y-2 text-sm">
                {[
                  ['Prix d\'achat', formatCurrency(form.prixAchat)],
                  ['Frais de notaire', formatCurrency(form.fraisNotaire)],
                  ['Travaux / Rénovation', formatCurrency(form.travaux)],
                  ['Investissement total', formatCurrency(investissement), true],
                  ['Fonds propres', formatCurrency(fondsProppres)],
                  ['Dette', formatCurrency(dette)],
                ].map(([l, v, bold]) => (
                  <div key={l as string} className="flex justify-between py-1.5 border-b border-surface-border/50 last:border-0">
                    <span className="text-slate-400">{l}</span>
                    <span className={bold ? 'font-semibold text-white' : 'text-slate-300'}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* KPIs performance */}
            <div>
              <h2 className="text-sm font-semibold text-white mb-3">Métriques Hôtelières</h2>
              <div className="grid grid-cols-2 gap-3">
                <KpiBox label="RevPAR" value={formatCurrency(form.revpar)} sub="Rev. par chambre dispo" />
                <KpiBox label="TRevPAR" value={formatCurrency(trevpar)} sub="Rev. total par chambre dispo" />
                <KpiBox label="CA Total" value={formatCurrency(caTotal)} sub="Hébergement + autres" />
                <KpiBox label="GOP" value={formatCurrency(gop)} sub={`Marge GOP : ${gopMargin.toFixed(1)}%`} highlight />
              </div>
            </div>

            {/* Signal GOP */}
            <div className={cn('rounded-lg border px-4 py-3 text-sm flex items-center justify-between',
              signal === 'ok' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
              signal === 'warn' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
              'bg-red-500/10 border-red-500/20 text-red-400'
            )}>
              <span>Marge GOP : <strong>{gopMargin.toFixed(1)}%</strong> (cible : {form.gopMarginCible}%)</span>
              <span>{signal === 'ok' ? '✓ OK' : signal === 'warn' ? '⚠ Limite' : '✗ Insuffisant'}</span>
            </div>

            {/* TRI & sortie */}
            <div>
              <h2 className="text-sm font-semibold text-white mb-3">Rendement & Sortie</h2>
              <div className="grid grid-cols-2 gap-3">
                <KpiBox label={`TRI (${form.horizonAns} ans)`} value={`${tri.toFixed(1)} %`} highlight />
                <KpiBox label="Equity Multiple" value={`× ${em.toFixed(2)}`} />
                <KpiBox label="Valeur à la cession" value={formatCurrency(valeurSortie)} sub={`Cap rate ${form.tauxCapSortie}%`} />
                <KpiBox label="Plus-value latente" value={`${plusValue >= 0 ? '+' : ''}${formatCurrency(plusValue)}`} />
              </div>
            </div>

            {/* Signal TRI */}
            <div className={cn('rounded-lg border px-4 py-3 text-sm flex items-center justify-between',
              triSignal === 'ok' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
              triSignal === 'warn' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
              'bg-red-500/10 border-red-500/20 text-red-400'
            )}>
              <span>TRI global fonds propres : <strong>{tri.toFixed(1)}%</strong></span>
              <span>{triSignal === 'ok' ? '✓ Excellent (>15%)' : triSignal === 'warn' ? '⚠ Acceptable (10-15%)' : '✗ Insuffisant (<10%)'}</span>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

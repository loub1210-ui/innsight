'use client'

import { useState } from 'react'
import { ArrowLeft, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { cn, formatCurrency } from '@/lib/utils'
import { bilanMarchandBiens, prixAchatMaxMarchand } from '@/utils/finance/marge'

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

function Row({ l, v, bold }: { l: string; v: string; bold?: boolean }) {
  return (
    <div className="flex justify-between py-2 border-b border-surface-border/50 last:border-0">
      <span className="text-sm text-slate-400">{l}</span>
      <span className={cn('text-sm', bold ? 'font-bold text-white' : 'text-slate-300')}>{v}</span>
    </div>
  )
}

export default function MarchandBiensPage() {
  const [form, setForm] = useState({
    prixAchat: 800000,
    fraisNotaire: 64000,
    travaux: 150000,
    fraisFinanciers: 12000,
    fraisCommerciaux: 20000,
    prixVente: 1150000,
  })
  const set = (k: keyof typeof form) => (v: number) => setForm(p => ({ ...p, [k]: v }))

  let resultat: ReturnType<typeof bilanMarchandBiens> | null = null
  let errMsg = ''
  try {
    resultat = bilanMarchandBiens({
      prixAchat: form.prixAchat,
      fraisNotaire: form.fraisNotaire,
      coutTravaux: form.travaux,
      fraisFinanciers: form.fraisFinanciers,
      fraisCommerciaux: form.fraisCommerciaux,
      prixVente: form.prixVente,
    })
  } catch (e) {
    errMsg = (e as Error).message
  }

  const autresCouts = form.fraisNotaire + form.travaux + form.fraisFinanciers + form.fraisCommerciaux
  const prixMax = form.prixVente > 0 ? prixAchatMaxMarchand(form.prixVente, 15, autresCouts) : 0

  const signal = resultat
    ? resultat.margeBrutePct >= 20 ? 'ok' : resultat.margeBrutePct >= 12 ? 'warn' : 'danger'
    : 'danger'

  return (
    <div className="flex flex-col h-screen">
      <div className="flex items-center gap-4 px-8 h-16 border-b border-surface-border flex-shrink-0">
        <Link href="/stratege" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" />Stratège
        </Link>
        <span className="text-slate-600">·</span>
        <TrendingUp className="w-4 h-4 text-violet-400" />
        <h1 className="text-sm font-semibold text-white">Marchand de Biens</h1>
        <span className="text-xs text-slate-500">Marge brute · TRI · Prix max</span>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-3xl grid grid-cols-1 lg:grid-cols-2 gap-6">

          <div className="space-y-5">
            <div className="bg-surface-card border border-surface-border rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-semibold text-white">Acquisition</h2>
              <NumInput label="Prix d'achat (€)" value={form.prixAchat} onChange={set('prixAchat')} suffix="€" />
              <NumInput label="Frais de notaire / mutation (€)" value={form.fraisNotaire} onChange={set('fraisNotaire')} suffix="€" />
              <NumInput label="Travaux (€)" value={form.travaux} onChange={set('travaux')} suffix="€" />
            </div>

            <div className="bg-surface-card border border-surface-border rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-semibold text-white">Autres coûts</h2>
              <NumInput label="Frais de financement (€)" value={form.fraisFinanciers} onChange={set('fraisFinanciers')} suffix="€" hint="Intérêts, frais dossier" />
              <NumInput label="Frais commerciaux (€)" value={form.fraisCommerciaux} onChange={set('fraisCommerciaux')} suffix="€" hint="Agence, marketing" />
            </div>

            <div className="bg-surface-card border border-surface-border rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-semibold text-white">Vente</h2>
              <NumInput label="Prix de vente (€)" value={form.prixVente} onChange={set('prixVente')} suffix="€" />
            </div>
          </div>

          <div className="space-y-5">
            <div className="bg-surface-card border border-surface-border rounded-xl p-5">
              <h2 className="text-sm font-semibold text-white mb-4">Résultats</h2>
              {resultat ? (
                <>
                  <Row l="Revient total" v={formatCurrency(resultat.revient)} bold />
                  <Row l="Prix de vente" v={formatCurrency(form.prixVente)} />
                  <Row l="Marge brute" v={formatCurrency(resultat.margeBrute)} bold />
                  <Row l="Marge / Prix de vente" v={`${resultat.margeBrutePct.toFixed(1)} %`} bold />
                  <Row l="Marge / Revient" v={`${resultat.margeBruteSurRevientPct.toFixed(1)} %`} />
                </>
              ) : (
                <p className="text-sm text-red-400">{errMsg || 'Renseigne les champs pour voir les résultats'}</p>
              )}
            </div>

            {resultat && (
              <div className={cn('rounded-lg border px-4 py-3 text-sm flex items-center justify-between',
                signal === 'ok' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                signal === 'warn' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                'bg-red-500/10 border-red-500/20 text-red-400'
              )}>
                <span>Marge : <strong>{resultat.margeBrutePct.toFixed(1)}%</strong></span>
                <span>{signal === 'ok' ? '✓ Excellent (>20%)' : signal === 'warn' ? '⚠ Acceptable (12-20%)' : '✗ Insuffisant (<12%)'}</span>
              </div>
            )}

            <div className="bg-surface-card border border-surface-border rounded-xl p-5">
              <h2 className="text-sm font-semibold text-white mb-3">Prix d&apos;achat maximum</h2>
              <p className="text-xs text-slate-500 mb-3">Pour atteindre une marge cible de 15% sur le prix de vente</p>
              <p className="text-2xl font-bold text-brand-300">{formatCurrency(prixMax)}</p>
              <p className={cn('text-xs mt-1', form.prixAchat <= prixMax ? 'text-emerald-400' : 'text-red-400')}>
                {form.prixAchat <= prixMax ? '✓ Prix en dessous du maximum' : '✗ Prix dépasse le maximum recommandé'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

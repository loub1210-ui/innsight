'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { insertActif } from '@/services/portfolio'
import { CLASSE_ACTIF_LABELS, STATUT_ACTIF_LABELS, type ClasseActif, type StatutActif } from '@/types'
import { parseNum, cn } from '@/lib/utils'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

const CLASSES = Object.entries(CLASSE_ACTIF_LABELS) as [ClasseActif, string][]
const STATUTS = Object.entries(STATUT_ACTIF_LABELS) as [StatutActif, string][]

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-1.5">{label}</label>
      {children}
    </div>
  )
}

function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input {...props}
      className={cn('w-full bg-surface border border-surface-border rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500', className)}
    />
  )
}

export default function AddActifPage() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const [form, setForm] = useState({
    nom: '', commune: '', adresse: '', dept_code: '', region_code: '',
    surface_m2: '', date_acquisition: '',
    prix_acquisition: '', frais_notaire: '', cout_travaux: '',
    valeur_estimee: '', revenus_annuels: '', charges_annuelles: '',
    classe_actif: '' as ClasseActif | '',
    statut: 'actif' as StatutActif,
  })

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }))

  const mutation = useMutation({
    mutationFn: insertActif,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actifs-portefeuille'] })
      router.push('/portfolio')
    },
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.classe_actif) return
    mutation.mutate({
      nom: form.nom,
      commune: form.commune,
      adresse: form.adresse || null,
      dept_code: form.dept_code,
      region_code: form.region_code,
      surface_m2: form.surface_m2 ? parseNum(form.surface_m2) : null,
      date_acquisition: form.date_acquisition || null,
      classe_actif: form.classe_actif,
      statut: form.statut,
      prix_acquisition: parseNum(form.prix_acquisition),
      frais_notaire: parseNum(form.frais_notaire),
      cout_travaux: parseNum(form.cout_travaux),
      valeur_estimee: form.valeur_estimee ? parseNum(form.valeur_estimee) : null,
      revenus_annuels: parseNum(form.revenus_annuels),
      charges_annuelles: parseNum(form.charges_annuelles),
      mensualite_credit: null, dpe_classe: null, huwart_conforme: null, huwart_echeance: null,
    })
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="flex items-center gap-4 px-8 h-16 border-b border-surface-border flex-shrink-0">
        <Link href="/portfolio" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" />Retour
        </Link>
        <span className="text-slate-600">·</span>
        <h1 className="text-sm font-semibold text-white">Ajouter un actif</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8">
        <div className="max-w-2xl space-y-6">

          {/* Classe actif */}
          <div>
            <p className="text-xs font-medium text-slate-400 mb-2">Classe d&apos;actif *</p>
            <div className="flex flex-wrap gap-2">
              {CLASSES.map(([value, label]) => (
                <button key={value} type="button" onClick={() => setForm(p => ({ ...p, classe_actif: value }))}
                  className={cn('px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                    form.classe_actif === value
                      ? 'bg-brand-600 border-brand-500 text-white'
                      : 'bg-surface border-surface-border text-slate-400 hover:text-white'
                  )}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Identification */}
          <div className="bg-surface-card border border-surface-border rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-white">Identification</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2"><Field label="Nom *"><Input value={form.nom} onChange={set('nom')} placeholder="Hôtel du Centre" required /></Field></div>
              <Field label="Commune *"><Input value={form.commune} onChange={set('commune')} placeholder="Lyon" required /></Field>
              <Field label="Code département *"><Input value={form.dept_code} onChange={set('dept_code')} placeholder="69" required /></Field>
              <Field label="Code région"><Input value={form.region_code} onChange={set('region_code')} placeholder="84" /></Field>
              <Field label="Surface (m²)"><Input type="number" value={form.surface_m2} onChange={set('surface_m2')} placeholder="1200" /></Field>
              <div className="col-span-2"><Field label="Adresse"><Input value={form.adresse} onChange={set('adresse')} placeholder="12 rue de la République" /></Field></div>
              <Field label="Date d&apos;acquisition"><Input type="date" value={form.date_acquisition} onChange={set('date_acquisition')} /></Field>
            </div>
          </div>

          {/* Statut */}
          <div>
            <p className="text-xs font-medium text-slate-400 mb-2">Statut</p>
            <div className="flex gap-2">
              {STATUTS.map(([value, label]) => (
                <button key={value} type="button" onClick={() => setForm(p => ({ ...p, statut: value }))}
                  className={cn('px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                    form.statut === value
                      ? 'bg-brand-600 border-brand-500 text-white'
                      : 'bg-surface border-surface-border text-slate-400 hover:text-white'
                  )}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Financier */}
          <div className="bg-surface-card border border-surface-border rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-white">Données financières</h2>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Prix d&apos;acquisition (€) *"><Input type="number" value={form.prix_acquisition} onChange={set('prix_acquisition')} placeholder="500000" required /></Field>
              <Field label="Frais de notaire (€)"><Input type="number" value={form.frais_notaire} onChange={set('frais_notaire')} placeholder="40000" /></Field>
              <Field label="Coût travaux (€)"><Input type="number" value={form.cout_travaux} onChange={set('cout_travaux')} placeholder="80000" /></Field>
              <Field label="Valeur estimée (€)"><Input type="number" value={form.valeur_estimee} onChange={set('valeur_estimee')} placeholder="720000" /></Field>
              <Field label="Revenus annuels (€) *"><Input type="number" value={form.revenus_annuels} onChange={set('revenus_annuels')} placeholder="60000" required /></Field>
              <Field label="Charges annuelles (€) *"><Input type="number" value={form.charges_annuelles} onChange={set('charges_annuelles')} placeholder="18000" required /></Field>
            </div>
          </div>

          {mutation.error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              Erreur : {(mutation.error as Error).message}
            </p>
          )}

          <div className="flex gap-3 pb-8">
            <button type="submit" disabled={mutation.isPending || !form.classe_actif}
              className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-medium px-6 py-2.5 rounded-lg transition-colors">
              {mutation.isPending ? <><Loader2 className="w-4 h-4 animate-spin" />Enregistrement…</> : 'Enregistrer l\'actif'}
            </button>
            <Link href="/portfolio"
              className="px-6 py-2.5 rounded-lg border border-surface-border text-slate-400 hover:text-white hover:bg-surface-hover text-sm font-medium transition-colors">
              Annuler
            </Link>
          </div>
        </div>
      </form>
    </div>
  )
}

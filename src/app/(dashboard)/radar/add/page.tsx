'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { type ClasseActif, type ClasseDPE, CLASSE_ACTIF_LABELS } from '@/types'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import Link from 'next/link'

const DPE_OPTIONS: ClasseDPE[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G']

export default function AddOpportunitePage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    nom: '',
    commune: '',
    dept_code: '',
    adresse: '',
    classe_actif: 'hotel' as ClasseActif,
    prix_demande: '',
    surface_m2: '',
    nombre_chambres: '',
    revpar_estime: '',
    taux_occupation_estime: '',
    dpe_classe: '' as ClasseDPE | '',
    url_source: '',
    notes: '',
  })

  function updateField(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nom || !form.commune || !form.dept_code) {
      setError('Nom, commune et département sont requis.')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Non authentifié')

      const { error: insertError } = await supabase
        .from('opportunites_radar')
        .insert({
          user_id: user.id,
          nom: form.nom,
          commune: form.commune,
          dept_code: form.dept_code,
          adresse: form.adresse || null,
          classe_actif: form.classe_actif,
          prix_demande: form.prix_demande ? Number(form.prix_demande) : null,
          surface_m2: form.surface_m2 ? Number(form.surface_m2) : null,
          nombre_chambres: form.nombre_chambres ? Number(form.nombre_chambres) : null,
          revpar_estime: form.revpar_estime ? Number(form.revpar_estime) : null,
          taux_occupation_estime: form.taux_occupation_estime ? Number(form.taux_occupation_estime) : null,
          dpe_classe: form.dpe_classe || null,
          url_source: form.url_source || null,
          notes: form.notes || null,
          statut: 'nouvelle',
          keyscore: null,
        })

      if (insertError) throw insertError
      router.push('/radar')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde')
    }
    setSaving(false)
  }

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/radar" className="p-2 hover:bg-surface-card rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white">Ajouter une opportunité</h1>
            <p className="text-sm text-slate-400">Saisissez les informations du bien</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Infos principales */}
          <div className="bg-surface-card border border-surface-border rounded-xl p-6 space-y-4">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Informations générales</h2>

            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Nom du bien *</label>
              <input
                type="text"
                value={form.nom}
                onChange={e => updateField('nom', e.target.value)}
                placeholder="Ex: Hôtel de la Gare - Lyon Part-Dieu"
                className="w-full bg-surface border border-surface-border rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Commune *</label>
                <input
                  type="text"
                  value={form.commune}
                  onChange={e => updateField('commune', e.target.value)}
                  placeholder="Lyon"
                  className="w-full bg-surface border border-surface-border rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Département *</label>
                <input
                  type="text"
                  value={form.dept_code}
                  onChange={e => updateField('dept_code', e.target.value)}
                  placeholder="69"
                  maxLength={3}
                  className="w-full bg-surface border border-surface-border rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Adresse</label>
              <input
                type="text"
                value={form.adresse}
                onChange={e => updateField('adresse', e.target.value)}
                placeholder="12 place de la gare"
                className="w-full bg-surface border border-surface-border rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Type d&apos;actif</label>
              <select
                value={form.classe_actif}
                onChange={e => updateField('classe_actif', e.target.value)}
                className="w-full bg-surface border border-surface-border rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                {Object.entries(CLASSE_ACTIF_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1.5">URL de l&apos;annonce</label>
              <input
                type="url"
                value={form.url_source}
                onChange={e => updateField('url_source', e.target.value)}
                placeholder="https://..."
                className="w-full bg-surface border border-surface-border rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Chiffres */}
          <div className="bg-surface-card border border-surface-border rounded-xl p-6 space-y-4">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Données financières</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Prix demandé (€)</label>
                <input
                  type="number"
                  value={form.prix_demande}
                  onChange={e => updateField('prix_demande', e.target.value)}
                  placeholder="850000"
                  className="w-full bg-surface border border-surface-border rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Surface (m²)</label>
                <input
                  type="number"
                  value={form.surface_m2}
                  onChange={e => updateField('surface_m2', e.target.value)}
                  placeholder="450"
                  className="w-full bg-surface border border-surface-border rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Nb chambres</label>
                <input
                  type="number"
                  value={form.nombre_chambres}
                  onChange={e => updateField('nombre_chambres', e.target.value)}
                  placeholder="25"
                  className="w-full bg-surface border border-surface-border rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">RevPAR estimé (€)</label>
                <input
                  type="number"
                  value={form.revpar_estime}
                  onChange={e => updateField('revpar_estime', e.target.value)}
                  placeholder="75"
                  className="w-full bg-surface border border-surface-border rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Occupation (%)</label>
                <input
                  type="number"
                  value={form.taux_occupation_estime}
                  onChange={e => updateField('taux_occupation_estime', e.target.value)}
                  placeholder="70"
                  max={100}
                  className="w-full bg-surface border border-surface-border rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1.5">DPE</label>
              <div className="flex gap-2">
                {DPE_OPTIONS.map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => updateField('dpe_classe', form.dpe_classe === d ? '' : d)}
                    className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${
                      form.dpe_classe === d
                        ? d <= 'B' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : d <= 'D' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          : 'bg-red-500/20 text-red-400 border border-red-500/40'
                        : 'bg-surface border border-surface-border text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-surface-card border border-surface-border rounded-xl p-6 space-y-4">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Notes</h2>
            <textarea
              value={form.notes}
              onChange={e => updateField('notes', e.target.value)}
              rows={3}
              placeholder="Observations, contexte, points d'attention…"
              className="w-full bg-surface border border-surface-border rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-500 resize-none"
            />
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3">
            <Link href="/radar" className="px-5 py-2.5 text-sm text-slate-400 hover:text-white transition-colors">
              Annuler
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

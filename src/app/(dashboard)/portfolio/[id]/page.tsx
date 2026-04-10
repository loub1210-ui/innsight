import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { CLASSE_ACTIF_LABELS, STATUT_ACTIF_LABELS, DPE_COLORS, ClasseActif, StatutActif } from '@/types'
import { rendementBrut, rendementNet, cashflowAnnuel } from '@/utils/finance/rendement'
import { ArrowLeft, AlertTriangle, Pencil } from 'lucide-react'
import Link from 'next/link'

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-surface-border last:border-0">
      <span className="text-sm text-slate-400">{label}</span>
      <span className={highlight ? 'text-sm font-semibold text-white' : 'text-sm text-slate-300'}>{value}</span>
    </div>
  )
}

export default async function ActifDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: actif } = await supabase.from('actifs_portefeuille').select('*').eq('id', params.id).single()

  if (!actif) notFound()

  const investissement = actif.prix_acquisition + actif.frais_notaire + actif.cout_travaux
  const rdtBrut = rendementBrut({ loyersAnnuels: actif.revenus_annuels, prixAcquisition: investissement })
  const rdtNet = rendementNet({ loyersAnnuels: actif.revenus_annuels, prixAcquisition: investissement, chargesAnnuelles: actif.charges_annuelles })
  const cashflow = cashflowAnnuel({ loyersAnnuels: actif.revenus_annuels, chargesAnnuelles: actif.charges_annuelles, mensualiteCredit: actif.mensualite_credit ? actif.mensualite_credit * 12 : undefined })
  const plusValue = (actif.valeur_estimee ?? actif.prix_acquisition) - investissement

  const alertes = []
  if (actif.dpe_classe === 'G') alertes.push({ msg: 'DPE G — Location interdite dès 2025', sev: 'critique' })
  if (actif.dpe_classe === 'F') alertes.push({ msg: 'DPE F — Location interdite dès 2028', sev: 'attention' })
  if (actif.huwart_conforme === false) alertes.push({ msg: 'Non-conforme loi Huwart', sev: 'attention' })

  const dpeColor = actif.dpe_classe ? DPE_COLORS[actif.dpe_classe as keyof typeof DPE_COLORS] : null

  return (
    <div className="flex flex-col h-screen">
      <div className="flex items-center gap-4 px-8 h-16 border-b border-surface-border flex-shrink-0">
        <Link href="/portfolio" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" />Retour
        </Link>
        <span className="text-slate-600">·</span>
        <h1 className="text-sm font-semibold text-white truncate">{actif.nom}</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-2xl space-y-5">

          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-medium text-brand-400 bg-brand-500/10 px-2.5 py-1 rounded-md">
                {CLASSE_ACTIF_LABELS[actif.classe_actif as ClasseActif]}
              </span>
              <h2 className="text-xl font-bold text-white mt-2">{actif.nom}</h2>
              <p className="text-slate-400 text-sm">{actif.commune} ({actif.dept_code})</p>
              <span className="text-xs text-slate-400 mt-1 inline-block">{STATUT_ACTIF_LABELS[actif.statut as StatutActif]}</span>
            </div>
            {dpeColor && (
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black border-2"
                  style={{ borderColor: dpeColor, color: dpeColor, backgroundColor: `${dpeColor}15` }}>
                  {actif.dpe_classe}
                </div>
                <p className="text-xs text-slate-500 mt-1">DPE</p>
              </div>
            )}
          </div>

          {/* Alertes */}
          {alertes.length > 0 && (
            <div className="space-y-2">
              {alertes.map((a, i) => (
                <div key={i} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm ${
                  a.sev === 'critique' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                }`}>
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  {a.msg}
                </div>
              ))}
            </div>
          )}

          {/* Financier */}
          <div className="bg-surface-card border border-surface-border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-3">Investissement</h3>
            <Row label="Prix d'acquisition" value={`${actif.prix_acquisition.toLocaleString('fr-FR')} €`} />
            <Row label="Frais de notaire" value={`${actif.frais_notaire.toLocaleString('fr-FR')} €`} />
            <Row label="Coût travaux" value={`${actif.cout_travaux.toLocaleString('fr-FR')} €`} />
            <Row label="Investissement total" value={`${investissement.toLocaleString('fr-FR')} €`} highlight />
            <Row label="Valeur estimée" value={`${(actif.valeur_estimee ?? actif.prix_acquisition).toLocaleString('fr-FR')} €`} />
            <Row label="Plus-value latente" value={`${plusValue >= 0 ? '+' : ''}${plusValue.toLocaleString('fr-FR')} €`} highlight />
          </div>

          {/* Performance */}
          <div className="bg-surface-card border border-surface-border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-3">Performance</h3>
            <Row label="Revenus annuels" value={`${actif.revenus_annuels.toLocaleString('fr-FR')} €`} />
            <Row label="Charges annuelles" value={`${actif.charges_annuelles.toLocaleString('fr-FR')} €`} />
            <Row label="Rendement brut" value={`${rdtBrut.toFixed(2)} %`} highlight />
            <Row label="Rendement net" value={`${rdtNet.toFixed(2)} %`} highlight />
            <Row label="Cashflow annuel" value={`${cashflow >= 0 ? '+' : ''}${cashflow.toLocaleString('fr-FR')} €`} highlight />
            {actif.surface_m2 && (
              <Row label="Surface" value={`${actif.surface_m2} m²`} />
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

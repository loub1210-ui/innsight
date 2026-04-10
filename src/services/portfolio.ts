import { createClient } from '@/lib/supabase/client'
import type { ActifPortefeuille, ActifPortefeuilleInsert, ActifPortefeuilleUpdate, StatutActif } from '@/types'
import { rendementBrut, cashflowAnnuel } from '@/utils/finance/rendement'

export interface KPIsPortefeuille {
  nbActifs: number
  valeurTotale: number
  investissementTotal: number
  plusValueLatente: number
  revenusAnnuels: number
  chargesAnnuelles: number
  rendementBrutMoyen: number
  cashflowAnnuel: number
  nbPassoiresDPE: number
  nbNonConformesHuwart: number
  surfaceTotale: number
}

export interface AlertePortefeuille {
  actifId: string
  actifNom: string
  type: 'dpe_passoire' | 'huwart_non_conforme' | 'huwart_echeance_proche'
  message: string
  severite: 'critique' | 'attention'
}

export async function fetchActifs(filtreStatut?: StatutActif): Promise<ActifPortefeuille[]> {
  const supabase = createClient()
  let query = supabase.from('actifs_portefeuille').select('*').order('created_at', { ascending: false })
  if (filtreStatut) query = query.eq('statut', filtreStatut)
  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function fetchActifById(id: string): Promise<ActifPortefeuille | null> {
  const supabase = createClient()
  const { data, error } = await supabase.from('actifs_portefeuille').select('*').eq('id', id).single()
  if (error) return null
  return data
}

export async function insertActif(actif: ActifPortefeuilleInsert): Promise<ActifPortefeuille> {
  const supabase = createClient()
  const { data, error } = await supabase.from('actifs_portefeuille').insert(actif).select().single()
  if (error) throw error
  return data
}

export async function updateActif(id: string, updates: ActifPortefeuilleUpdate): Promise<ActifPortefeuille> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('actifs_portefeuille')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteActif(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('actifs_portefeuille').delete().eq('id', id)
  if (error) throw error
}

export function calculerKPIs(actifs: ActifPortefeuille[]): KPIsPortefeuille {
  const actifsFiltres = actifs.filter(a => a.statut !== 'vendu')
  if (!actifsFiltres.length) {
    return { nbActifs: 0, valeurTotale: 0, investissementTotal: 0, plusValueLatente: 0, revenusAnnuels: 0, chargesAnnuelles: 0, rendementBrutMoyen: 0, cashflowAnnuel: 0, nbPassoiresDPE: 0, nbNonConformesHuwart: 0, surfaceTotale: 0 }
  }
  const valeurTotale = actifsFiltres.reduce((s, a) => s + (a.valeur_estimee ?? a.prix_acquisition), 0)
  const investissementTotal = actifsFiltres.reduce((s, a) => s + a.prix_acquisition + a.frais_notaire + a.cout_travaux, 0)
  const revenusAnnuels = actifsFiltres.reduce((s, a) => s + a.revenus_annuels, 0)
  const chargesAnnuelles = actifsFiltres.reduce((s, a) => s + a.charges_annuelles, 0)
  const cashflow = actifsFiltres.reduce((s, a) => s + cashflowAnnuel({ loyersAnnuels: a.revenus_annuels, chargesAnnuelles: a.charges_annuelles, mensualiteCredit: a.mensualite_credit ? a.mensualite_credit * 12 : undefined }), 0)
  const rendements = actifsFiltres.map(a => rendementBrut({ loyersAnnuels: a.revenus_annuels, prixAcquisition: a.prix_acquisition + a.frais_notaire + a.cout_travaux }))
  const rendementBrutMoyen = rendements.reduce((s, r) => s + r, 0) / rendements.length
  return {
    nbActifs: actifsFiltres.length,
    valeurTotale,
    investissementTotal,
    plusValueLatente: valeurTotale - investissementTotal,
    revenusAnnuels,
    chargesAnnuelles,
    rendementBrutMoyen,
    cashflowAnnuel: cashflow,
    nbPassoiresDPE: actifsFiltres.filter(a => a.dpe_classe === 'F' || a.dpe_classe === 'G').length,
    nbNonConformesHuwart: actifsFiltres.filter(a => a.huwart_conforme === false).length,
    surfaceTotale: actifsFiltres.reduce((s, a) => s + (a.surface_m2 ?? 0), 0),
  }
}

export function genererAlertes(actifs: ActifPortefeuille[]): AlertePortefeuille[] {
  const alertes: AlertePortefeuille[] = []
  const actifsFiltres = actifs.filter(a => a.statut !== 'vendu')
  for (const actif of actifsFiltres) {
    if (actif.dpe_classe === 'G') {
      alertes.push({ actifId: actif.id, actifNom: actif.nom, type: 'dpe_passoire', message: `DPE G — Location interdite dès 2025`, severite: 'critique' })
    } else if (actif.dpe_classe === 'F') {
      alertes.push({ actifId: actif.id, actifNom: actif.nom, type: 'dpe_passoire', message: `DPE F — Location interdite dès 2028`, severite: 'attention' })
    }
    if (actif.huwart_conforme === false) {
      const echeance = actif.huwart_echeance ? new Date(actif.huwart_echeance) : null
      const moisRestants = echeance ? Math.floor((echeance.getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30)) : null
      if (moisRestants !== null && moisRestants < 6) {
        alertes.push({ actifId: actif.id, actifNom: actif.nom, type: 'huwart_echeance_proche', message: `Échéance Huwart dans ${moisRestants} mois`, severite: 'critique' })
      } else {
        alertes.push({ actifId: actif.id, actifNom: actif.nom, type: 'huwart_non_conforme', message: `Non-conforme loi Huwart`, severite: 'attention' })
      }
    }
  }
  return alertes.sort((a, b) => (a.severite === 'critique' ? -1 : 1))
}

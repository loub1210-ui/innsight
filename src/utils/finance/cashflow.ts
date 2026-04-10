/**
 * Utilitaires — Cashflow & emprunt immobilier
 * Toutes les fonctions sont pures (pas d'effets de bord).
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export interface EmpruntParams {
  /** Montant emprunté (€) */
  capital: number
  /** Taux annuel (ex: 0.035 pour 3,5%) */
  tauxAnnuel: number
  /** Durée en années */
  dureeAns: number
}

export interface TableauAmortissementRow {
  mois: number
  capitalRestant: number
  interet: number
  amortissement: number
  mensualite: number
}

export interface VanParams {
  /** Flux de trésorerie par période (€) */
  fluxPeriodiques: number[]
  /** Investissement initial (€, positif) */
  investissementInitial: number
  /** Taux d'actualisation annuel (ex: 0.08 pour 8%) */
  tauxActualisation: number
}

// ── Mensualité crédit ─────────────────────────────────────────────────────────

/**
 * Mensualité d'un crédit immobilier (formule annuité constante)
 * @returns Mensualité en euros (arrondie à 2 décimales)
 */
export function mensualiteCredit({ capital, tauxAnnuel, dureeAns }: EmpruntParams): number {
  if (capital <= 0) throw new RangeError('capital doit être > 0')
  if (tauxAnnuel < 0) throw new RangeError('tauxAnnuel doit être >= 0')
  if (dureeAns <= 0) throw new RangeError('dureeAns doit être > 0')

  // Cas taux = 0 : remboursement linéaire
  if (tauxAnnuel === 0) {
    return Math.round((capital / (dureeAns * 12)) * 100) / 100
  }

  const tauxMensuel = tauxAnnuel / 12
  const n = dureeAns * 12
  const mensualite = (capital * tauxMensuel) / (1 - Math.pow(1 + tauxMensuel, -n))
  return Math.round(mensualite * 100) / 100
}

// ── Tableau d'amortissement ───────────────────────────────────────────────────

/**
 * Génère le tableau d'amortissement complet mois par mois
 */
export function tableauAmortissement(params: EmpruntParams): TableauAmortissementRow[] {
  const { capital, tauxAnnuel, dureeAns } = params
  if (capital <= 0) throw new RangeError('capital doit être > 0')
  if (dureeAns <= 0) throw new RangeError('dureeAns doit être > 0')

  const mensualite = mensualiteCredit(params)
  const tauxMensuel = tauxAnnuel === 0 ? 0 : tauxAnnuel / 12
  const n = dureeAns * 12

  const rows: TableauAmortissementRow[] = []
  let capitalRestant = capital

  for (let mois = 1; mois <= n; mois++) {
    const interet = Math.round(capitalRestant * tauxMensuel * 100) / 100
    const amortissement = Math.round((mensualite - interet) * 100) / 100
    capitalRestant = Math.max(0, Math.round((capitalRestant - amortissement) * 100) / 100)

    rows.push({ mois, capitalRestant, interet, amortissement, mensualite })
  }

  return rows
}

// ── Intérêts totaux payés ─────────────────────────────────────────────────────

/**
 * Total des intérêts payés sur la durée du crédit
 */
export function interetsTotaux(params: EmpruntParams): number {
  if (params.tauxAnnuel === 0) return 0
  const mensualite = mensualiteCredit(params)
  const totalRembourse = mensualite * params.dureeAns * 12
  return Math.round((totalRembourse - params.capital) * 100) / 100
}

// ── Coût total du crédit ──────────────────────────────────────────────────────

/**
 * Coût total du crédit (capital + intérêts)
 */
export function coutTotalCredit(params: EmpruntParams): number {
  return Math.round((mensualiteCredit(params) * params.dureeAns * 12) * 100) / 100
}

// ── Valeur Actuelle Nette (VAN) ───────────────────────────────────────────────

/**
 * Valeur Actuelle Nette d'un investissement
 * VAN = -I₀ + Σ(Fₜ / (1+r)^t)
 * - VAN > 0 → projet rentable au taux d'actualisation
 * - VAN = 0 → le projet rapporte exactement le taux d'actualisation (= TRI)
 * @returns Montant en euros
 */
export function vanInvestissement({
  fluxPeriodiques,
  investissementInitial,
  tauxActualisation,
}: VanParams): number {
  if (investissementInitial < 0) throw new RangeError('investissementInitial doit être >= 0')
  if (tauxActualisation <= -1) throw new RangeError('tauxActualisation doit être > -1')
  if (fluxPeriodiques.length === 0) return -investissementInitial

  const van = fluxPeriodiques.reduce((acc, flux, index) => {
    return acc + flux / Math.pow(1 + tauxActualisation, index + 1)
  }, -investissementInitial)

  return Math.round(van * 100) / 100
}

// ── Effet de levier ───────────────────────────────────────────────────────────

/**
 * Calcule l'effet de levier financier
 * Effet de levier = rendement fonds propres / rendement actif
 * @param rendementActif Rendement net de l'actif (en %)
 * @param coutEndettement Taux du crédit annuel (en %)
 * @param tauxEndettement Part du financement par emprunt (ex: 0.8 pour 80%)
 * @returns Ratio (> 1 = levier positif)
 */
export function effetLevier(
  rendementActif: number,
  coutEndettement: number,
  tauxEndettement: number
): number {
  if (tauxEndettement < 0 || tauxEndettement >= 1)
    throw new RangeError('tauxEndettement doit être entre 0 et 1 exclus')

  const tauxFondsPropres = 1 - tauxEndettement
  const rendementFondsPropres =
    (rendementActif - coutEndettement * tauxEndettement) / tauxFondsPropres

  return Math.round((rendementFondsPropres / rendementActif) * 100) / 100
}

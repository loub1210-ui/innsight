/**
 * Utilitaires — Rendement immobilier
 * Toutes les fonctions sont pures (pas d'effets de bord).
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export interface RendementBrutParams {
  /** Loyers annuels bruts (€) */
  loyersAnnuels: number
  /** Prix d'acquisition frais inclus (€) */
  prixAcquisition: number
}

export interface RendementNetParams extends RendementBrutParams {
  /** Charges annuelles : taxes, assurances, gestion, entretien (€) */
  chargesAnnuelles: number
  /** Intérêts d'emprunt annuels (€) — optionnel */
  interetsAnnuels?: number
}

export interface RendementNetNetParams extends RendementNetParams {
  /** Tranche marginale d'imposition (ex : 0.30 pour 30%) */
  tmi: number
  /** Prélèvements sociaux (ex : 0.172) */
  prelevementsSociaux?: number
  /** Amortissement déductible annuel en LMNP/IS (€) — optionnel */
  amortissementDeductible?: number
}

// ── Rendement brut ────────────────────────────────────────────────────────────

/**
 * Rendement brut = (loyers annuels / prix acquisition) × 100
 * @returns Pourcentage (ex: 8.5 pour 8,5%)
 */
export function rendementBrut({ loyersAnnuels, prixAcquisition }: RendementBrutParams): number {
  if (prixAcquisition <= 0) throw new RangeError('prixAcquisition doit être > 0')
  return (loyersAnnuels / prixAcquisition) * 100
}

// ── Rendement net de charges ──────────────────────────────────────────────────

/**
 * Rendement net de charges = ((loyers - charges) / prix) × 100
 * @returns Pourcentage
 */
export function rendementNet({
  loyersAnnuels,
  prixAcquisition,
  chargesAnnuelles,
  interetsAnnuels = 0,
}: RendementNetParams): number {
  if (prixAcquisition <= 0) throw new RangeError('prixAcquisition doit être > 0')
  const revenuNet = loyersAnnuels - chargesAnnuelles - interetsAnnuels
  return (revenuNet / prixAcquisition) * 100
}

// ── Rendement net-net (après fiscalité) ───────────────────────────────────────

/**
 * Rendement net-net = ((loyers - charges - intérêts - impôts) / prix) × 100
 * Applicable en régime réel (LMNP réel, SCI IS, etc.)
 * @returns Pourcentage
 */
export function rendementNetNet({
  loyersAnnuels,
  prixAcquisition,
  chargesAnnuelles,
  interetsAnnuels = 0,
  tmi,
  prelevementsSociaux = 0.172,
  amortissementDeductible = 0,
}: RendementNetNetParams): number {
  if (prixAcquisition <= 0) throw new RangeError('prixAcquisition doit être > 0')
  if (tmi < 0 || tmi > 1) throw new RangeError('tmi doit être entre 0 et 1')

  const revenuImposable = Math.max(
    0,
    loyersAnnuels - chargesAnnuelles - interetsAnnuels - amortissementDeductible
  )

  const impots = revenuImposable * (tmi + prelevementsSociaux)
  const revenuNetNet = loyersAnnuels - chargesAnnuelles - interetsAnnuels - impots

  return (revenuNetNet / prixAcquisition) * 100
}

// ── Cashflow annuel net ───────────────────────────────────────────────────────

/**
 * Cashflow annuel = loyers - charges - mensualité × 12 - impôts
 * @returns Montant en euros
 */
export function cashflowAnnuel({
  loyersAnnuels,
  chargesAnnuelles,
  mensualiteCredit = 0,
  impots = 0,
}: {
  loyersAnnuels: number
  chargesAnnuelles: number
  mensualiteCredit?: number
  impots?: number
}): number {
  return loyersAnnuels - chargesAnnuelles - mensualiteCredit * 12 - impots
}

// ── Prix au m² ────────────────────────────────────────────────────────────────

/**
 * Calcule le prix au m² (arrondi à 2 décimales)
 */
export function prixAuM2(prix: number, surfaceM2: number): number {
  if (surfaceM2 <= 0) throw new RangeError('surfaceM2 doit être > 0')
  return Math.round((prix / surfaceM2) * 100) / 100
}

// ── Décote vs benchmark ───────────────────────────────────────────────────────

/**
 * Calcule la décote par rapport au prix de marché (positif = sous le marché)
 * @returns Pourcentage (ex: 15.3 = 15,3% sous le marché)
 */
export function decoteVsBenchmark(prixM2: number, benchmarkM2: number): number {
  if (benchmarkM2 <= 0) throw new RangeError('benchmarkM2 doit être > 0')
  return ((benchmarkM2 - prixM2) / benchmarkM2) * 100
}

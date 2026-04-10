/**
 * Utilitaires — Marge et bilans financiers
 * Spécialisé pour les opérations de type marchand de biens,
 * coliving, self-stockage, camping, hôtel distressed.
 * Toutes les fonctions sont pures (pas d'effets de bord).
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export interface BilanMarchandBiens {
  /** Prix d'achat du bien (€) */
  prixAchat: number
  /** Frais de notaire (€) */
  fraisNotaire: number
  /** Coût total des travaux (€) */
  coutTravaux: number
  /** Frais financiers (intérêts crédit court terme, €) */
  fraisFinanciers?: number
  /** Frais de commercialisation (agence, publicité, €) */
  fraisCommerciaux?: number
  /** Autres frais (géomètre, architecte, assurance DO, €) */
  autresFrais?: number
  /** Prix de vente visé (€) */
  prixVente: number
}

export interface MargeResult {
  /** Revient total (€) */
  revient: number
  /** Marge brute (€) */
  margeBrute: number
  /** Marge brute en % du prix de vente */
  margeBrutePct: number
  /** Marge brute en % du revient */
  margeBruteSurRevientPct: number
  /** Rentabilité de l'opération (marge / fonds propres engagés) */
  roi?: number
}

export interface BilanColiving {
  /** Prix d'achat (€) */
  prixAchat: number
  /** Frais de notaire (€) */
  fraisNotaire: number
  /** Travaux d'aménagement (€) */
  travaux: number
  /** Mobilier et équipements (€) */
  mobilier: number
  /** Loyers mensuels bruts par chambre (€) */
  loyerMensuelParChambre: number
  /** Nombre de chambres */
  nbChambres: number
  /** Taux d'occupation attendu (ex: 0.90 pour 90%) */
  tauxOccupation: number
  /** Charges annuelles propriétaire (€) */
  chargesAnnuelles: number
}

export interface BilanSelfStockage {
  /** Prix d'achat ou construction (€) */
  investissementTotal: number
  /** Surface louable totale (m²) */
  surfaceTotaleM2: number
  /** Loyer mensuel moyen au m² (€/m²) */
  loyerM2Mensuel: number
  /** Taux d'occupation attendu (ex: 0.75 pour 75%) */
  tauxOccupation: number
  /** Charges annuelles exploitation (€) */
  chargesAnnuelles: number
}

// ── Marchand de biens — bilan financier ──────────────────────────────────────

/**
 * Calcule la marge d'une opération de marchand de biens.
 * Marge brute = Prix de vente - Revient total
 *
 * Règle du pouce : marge brute >= 15% du prix de vente pour être viable.
 */
export function bilanMarchandBiens(params: BilanMarchandBiens): MargeResult {
  const {
    prixAchat,
    fraisNotaire,
    coutTravaux,
    fraisFinanciers = 0,
    fraisCommerciaux = 0,
    autresFrais = 0,
    prixVente,
  } = params

  if (prixAchat <= 0) throw new RangeError('prixAchat doit être > 0')
  if (prixVente <= 0) throw new RangeError('prixVente doit être > 0')

  const revient =
    prixAchat + fraisNotaire + coutTravaux + fraisFinanciers + fraisCommerciaux + autresFrais

  const margeBrute = prixVente - revient
  const margeBrutePct = (margeBrute / prixVente) * 100
  const margeBruteSurRevientPct = (margeBrute / revient) * 100

  return {
    revient: Math.round(revient * 100) / 100,
    margeBrute: Math.round(margeBrute * 100) / 100,
    margeBrutePct: Math.round(margeBrutePct * 100) / 100,
    margeBruteSurRevientPct: Math.round(margeBruteSurRevientPct * 100) / 100,
  }
}

/**
 * Calcule le prix d'achat maximum pour atteindre une marge cible.
 * @param prixVente Prix de revente visé (€)
 * @param margeCiblePct Marge souhaitée sur prix de vente (ex: 15 pour 15%)
 * @param autresCouts Somme de tous les autres coûts hors achat (€)
 * @returns Prix d'achat maximum (€)
 */
export function prixAchatMaxMarchand(
  prixVente: number,
  margeCiblePct: number,
  autresCouts: number
): number {
  if (prixVente <= 0) throw new RangeError('prixVente doit être > 0')
  if (margeCiblePct < 0 || margeCiblePct >= 100) throw new RangeError('margeCiblePct entre 0 et 100')

  const revenirCible = prixVente * (1 - margeCiblePct / 100)
  const prixAchatMax = revenirCible - autresCouts
  return Math.round(prixAchatMax * 100) / 100
}

// ── Coliving — rentabilité ────────────────────────────────────────────────────

/**
 * Calcule la rentabilité nette d'un projet coliving
 */
export function bilanColiving(params: BilanColiving): {
  investissementTotal: number
  chiffreAffairesAnnuel: number
  revenuNetAnnuel: number
  rendementBrut: number
  rendementNet: number
} {
  const {
    prixAchat,
    fraisNotaire,
    travaux,
    mobilier,
    loyerMensuelParChambre,
    nbChambres,
    tauxOccupation,
    chargesAnnuelles,
  } = params

  if (nbChambres <= 0) throw new RangeError('nbChambres doit être > 0')
  if (tauxOccupation < 0 || tauxOccupation > 1) throw new RangeError('tauxOccupation entre 0 et 1')

  const investissementTotal = prixAchat + fraisNotaire + travaux + mobilier
  const caAnnuel = loyerMensuelParChambre * nbChambres * 12 * tauxOccupation
  const revenuNetAnnuel = caAnnuel - chargesAnnuelles

  return {
    investissementTotal: Math.round(investissementTotal),
    chiffreAffairesAnnuel: Math.round(caAnnuel),
    revenuNetAnnuel: Math.round(revenuNetAnnuel),
    rendementBrut: Math.round((caAnnuel / investissementTotal) * 10000) / 100,
    rendementNet: Math.round((revenuNetAnnuel / investissementTotal) * 10000) / 100,
  }
}

// ── Self-stockage — rentabilité ───────────────────────────────────────────────

/**
 * Calcule la rentabilité d'un projet self-stockage
 */
export function bilanSelfStockage(params: BilanSelfStockage): {
  revenusAnnuelsBruts: number
  revenusAnnuelsNets: number
  rendementBrut: number
  rendementNet: number
  revenusParM2Annuel: number
} {
  const { investissementTotal, surfaceTotaleM2, loyerM2Mensuel, tauxOccupation, chargesAnnuelles } =
    params

  if (surfaceTotaleM2 <= 0) throw new RangeError('surfaceTotaleM2 doit être > 0')
  if (tauxOccupation < 0 || tauxOccupation > 1) throw new RangeError('tauxOccupation entre 0 et 1')
  if (investissementTotal <= 0) throw new RangeError('investissementTotal doit être > 0')

  const revenusAnnuelsBruts = loyerM2Mensuel * surfaceTotaleM2 * 12 * tauxOccupation
  const revenusAnnuelsNets = revenusAnnuelsBruts - chargesAnnuelles

  return {
    revenusAnnuelsBruts: Math.round(revenusAnnuelsBruts),
    revenusAnnuelsNets: Math.round(revenusAnnuelsNets),
    rendementBrut: Math.round((revenusAnnuelsBruts / investissementTotal) * 10000) / 100,
    rendementNet: Math.round((revenusAnnuelsNets / investissementTotal) * 10000) / 100,
    revenusParM2Annuel: Math.round((revenusAnnuelsBruts / surfaceTotaleM2) * 100) / 100,
  }
}

// ── Taxe loi Huwart (parking PL) ─────────────────────────────────────────────

/**
 * Évalue la conformité et le coût potentiel loi Huwart (parking PL)
 * La loi Huwart impose 1 place PL pour X m² de surface logistique.
 * Ratio légal : 1 place / 1 500 m² (approximation pour usage de simulateur)
 *
 * @param surfaceLogistiqueM2 Surface logistique totale (m²)
 * @param nbPlacesPL Nombre de places PL actuelles
 * @param coutCreationPlacePL Coût de création d'une place PL (€)
 * @returns Conformité et coût de mise en conformité
 */
export function conformiteHuwart(
  surfaceLogistiqueM2: number,
  nbPlacesPL: number,
  coutCreationPlacePL = 15000
): { conforme: boolean; placesManquantes: number; coutMiseConformite: number } {
  const placesRequises = Math.ceil(surfaceLogistiqueM2 / 1500)
  const placesManquantes = Math.max(0, placesRequises - nbPlacesPL)
  const coutMiseConformite = placesManquantes * coutCreationPlacePL

  return {
    conforme: placesManquantes === 0,
    placesManquantes,
    coutMiseConformite,
  }
}

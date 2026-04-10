/**
 * Utilitaires — Taux de Rendement Interne (TRI / IRR)
 * Algorithme Newton-Raphson + bisection de secours.
 * Toutes les fonctions sont pures (pas d'effets de bord).
 */

// ── Constantes ────────────────────────────────────────────────────────────────

const MAX_ITER = 1000
const TOLERANCE = 1e-7
const TRI_MIN = -0.999
const TRI_MAX = 100 // 10 000%

// ── VAN à taux donné (interne) ────────────────────────────────────────────────

function van(fluxBruts: number[], taux: number): number {
  return fluxBruts.reduce((acc, flux, idx) => acc + flux / Math.pow(1 + taux, idx), 0)
}

// Dérivée de la VAN par rapport au taux
function vanPrime(fluxBruts: number[], taux: number): number {
  return fluxBruts.reduce((acc, flux, idx) => {
    if (idx === 0) return acc
    return acc - (idx * flux) / Math.pow(1 + taux, idx + 1)
  }, 0)
}

// ── TRI (Taux de Rendement Interne) ──────────────────────────────────────────

/**
 * Calcule le TRI d'une série de flux de trésorerie.
 *
 * Convention : le premier flux est l'investissement initial (négatif).
 * Exemple : [-100000, 12000, 12000, 12000, 12000, 120000]
 *
 * Algorithme :
 * 1. Vérification de la validité (changement de signe)
 * 2. Newton-Raphson depuis une estimation initiale
 * 3. Bisection si Newton diverge
 *
 * @param flux Tableau de flux (premier = investissement, négatif)
 * @param estimation Taux initial pour Newton-Raphson (défaut : 0.10)
 * @returns TRI en pourcentage (ex: 8.5 pour 8,5%) ou null si non convergent
 */
export function calculTRI(flux: number[], estimation = 0.1): number | null {
  if (flux.length < 2) return null

  // Vérification : doit avoir au moins un changement de signe
  const positifs = flux.filter(f => f > 0).length
  const negatifs = flux.filter(f => f < 0).length
  if (positifs === 0 || negatifs === 0) return null

  // ── Newton-Raphson ──────────────────────────────────────────────────────────
  let taux = estimation
  for (let i = 0; i < MAX_ITER; i++) {
    const vanVal = van(flux, taux)
    const vanPrimeVal = vanPrime(flux, taux)

    if (Math.abs(vanPrimeVal) < 1e-10) break // Éviter division par zéro

    const tauxSuivant = taux - vanVal / vanPrimeVal

    if (Math.abs(tauxSuivant - taux) < TOLERANCE) {
      taux = tauxSuivant
      // Vérification du résultat
      if (taux > TRI_MIN && taux < TRI_MAX && Math.abs(van(flux, taux)) < 0.01) {
        return Math.round(taux * 10000) / 100 // En %
      }
      break
    }

    taux = tauxSuivant
    if (taux <= TRI_MIN) taux = TRI_MIN + 0.001
  }

  // ── Bisection de secours ────────────────────────────────────────────────────
  let lo = -0.99
  let hi = 10 // 1000%

  if (Math.sign(van(flux, lo)) === Math.sign(van(flux, hi))) {
    // Pas de racine dans l'intervalle — chercher une borne haute plus petite
    hi = 4 // 400%
    if (Math.sign(van(flux, lo)) === Math.sign(van(flux, hi))) {
      return null
    }
  }

  for (let i = 0; i < MAX_ITER; i++) {
    const mid = (lo + hi) / 2
    const vanMid = van(flux, mid)

    if (Math.abs(vanMid) < TOLERANCE || (hi - lo) / 2 < TOLERANCE) {
      return Math.round(mid * 10000) / 100
    }

    if (Math.sign(vanMid) === Math.sign(van(flux, lo))) {
      lo = mid
    } else {
      hi = mid
    }
  }

  return null
}

// ── TRI sur durée de détention ────────────────────────────────────────────────

/**
 * Calcule le TRI d'un investissement immobilier sur une durée de détention.
 *
 * @param prixAcquisition Prix d'acquisition frais inclus (€)
 * @param cashflowsAnnuels Tableau des cashflows annuels nets (€)
 * @param valeurRevente Valeur de revente nette (après frais d'agence et impôt plus-value) (€)
 * @returns TRI en % ou null
 */
export function triImmobilier(
  prixAcquisition: number,
  cashflowsAnnuels: number[],
  valeurRevente: number
): number | null {
  if (prixAcquisition <= 0) throw new RangeError('prixAcquisition doit être > 0')
  if (cashflowsAnnuels.length === 0) throw new RangeError('Au moins 1 année de cashflow requis')
  if (valeurRevente < 0) throw new RangeError('valeurRevente doit être >= 0')

  // Dernier flux = cashflow dernière année + valeur de revente
  const flux = [
    -prixAcquisition,
    ...cashflowsAnnuels.slice(0, -1),
    (cashflowsAnnuels[cashflowsAnnuels.length - 1] ?? 0) + valeurRevente,
  ]

  return calculTRI(flux)
}

// ── Interprétation TRI ────────────────────────────────────────────────────────

/**
 * Interprète le TRI par rapport à un taux cible
 */
export function interpreteTRI(
  tri: number | null,
  tauxCible: number
): 'excellent' | 'bon' | 'acceptable' | 'insuffisant' | 'negatif' | 'incalculable' {
  if (tri === null) return 'incalculable'
  if (tri < 0) return 'negatif'
  if (tri >= tauxCible * 1.5) return 'excellent'
  if (tri >= tauxCible) return 'bon'
  if (tri >= tauxCible * 0.7) return 'acceptable'
  return 'insuffisant'
}

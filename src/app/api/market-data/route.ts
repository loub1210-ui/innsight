import { NextRequest, NextResponse } from 'next/server'

// Mapping ville → code INSEE commune (principales)
const CODES_INSEE: Record<string, string> = {
  'Paris': '75056',
  'Lyon': '69123',
  'Marseille': '13055',
  'Bordeaux': '33063',
  'Lille': '59350',
  'Toulouse': '31555',
  'Nice': '06088',
  'Nantes': '44109',
  'Strasbourg': '67482',
  'Montpellier': '34172',
  'Rennes': '35238',
  'Grenoble': '38185',
}

// Mapping ville → code département
const CODES_DEPT: Record<string, string> = {
  'Paris': '75',
  'Lyon': '69',
  'Marseille': '13',
  'Bordeaux': '33',
  'Lille': '59',
  'Toulouse': '31',
  'Nice': '06',
  'Nantes': '44',
  'Strasbourg': '67',
  'Montpellier': '34',
  'Rennes': '35',
  'Grenoble': '38',
}

interface DVFMutation {
  valeur_fonciere: number
  surface_reelle_bati: number
  type_local: string
}

interface MarketData {
  ville: string
  prix_m2_dvf: number | null
  nb_transactions_dvf: number
  population_insee: number | null
  source_dvf: string
  source_insee: string
  derniere_maj: string
}

// Fetch real estate prices from DVF API (Demandes de Valeurs Foncières)
async function fetchDVF(codeCommune: string): Promise<{ prix_m2: number | null; nb_transactions: number }> {
  try {
    // DVF API - last 12 months of real estate transactions
    const url = `https://api.cquest.org/dvf?code_commune=${codeCommune}&nature_mutation=Vente&type_local=Appartement`
    const res = await fetch(url, { next: { revalidate: 86400 } }) // Cache 24h

    if (!res.ok) {
      // Fallback: try the official DVF API
      return await fetchDVFOfficiel(codeCommune)
    }

    const data = await res.json()
    const mutations: DVFMutation[] = data.resultats || []

    if (mutations.length === 0) {
      return await fetchDVFOfficiel(codeCommune)
    }

    // Calculate median price per m²
    const prixM2 = mutations
      .filter((m: DVFMutation) => m.surface_reelle_bati > 0 && m.valeur_fonciere > 0)
      .map((m: DVFMutation) => m.valeur_fonciere / m.surface_reelle_bati)
      .sort((a: number, b: number) => a - b)

    if (prixM2.length === 0) return { prix_m2: null, nb_transactions: 0 }

    const median = prixM2[Math.floor(prixM2.length / 2)]
    return { prix_m2: Math.round(median), nb_transactions: prixM2.length }
  } catch {
    return await fetchDVFOfficiel(codeCommune)
  }
}

// Fallback: Official DVF API from data.gouv.fr
async function fetchDVFOfficiel(codeCommune: string): Promise<{ prix_m2: number | null; nb_transactions: number }> {
  try {
    const url = `https://apidf-preprod.cerema.fr/dvf_opendata/mutations?code_commune=${codeCommune}&nature_mutation=Vente&page_size=200`
    const res = await fetch(url, { next: { revalidate: 86400 } })

    if (!res.ok) return { prix_m2: null, nb_transactions: 0 }

    const data = await res.json()
    const results = data.results || []

    const prixM2 = results
      .filter((m: { valeur_fonciere: number; surface_reelle_bati: number }) =>
        m.surface_reelle_bati > 0 && m.valeur_fonciere > 0
      )
      .map((m: { valeur_fonciere: number; surface_reelle_bati: number }) =>
        m.valeur_fonciere / m.surface_reelle_bati
      )
      .sort((a: number, b: number) => a - b)

    if (prixM2.length === 0) return { prix_m2: null, nb_transactions: 0 }

    const median = prixM2[Math.floor(prixM2.length / 2)]
    return { prix_m2: Math.round(median), nb_transactions: prixM2.length }
  } catch {
    return { prix_m2: null, nb_transactions: 0 }
  }
}

// Fetch population from INSEE Geo API
async function fetchPopulationINSEE(codeCommune: string): Promise<number | null> {
  try {
    const url = `https://geo.api.gouv.fr/communes/${codeCommune}?fields=population`
    const res = await fetch(url, { next: { revalidate: 604800 } }) // Cache 7 days

    if (!res.ok) return null

    const data = await res.json()
    return data.population || null
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const ville = searchParams.get('ville')

  if (!ville) {
    return NextResponse.json({ error: 'Paramètre ville requis' }, { status: 400 })
  }

  const codeInsee = CODES_INSEE[ville]
  if (!codeInsee) {
    return NextResponse.json({ error: `Ville non supportée: ${ville}` }, { status: 400 })
  }

  // Fetch data in parallel
  const [dvfResult, population] = await Promise.all([
    fetchDVF(codeInsee),
    fetchPopulationINSEE(codeInsee),
  ])

  const result: MarketData = {
    ville,
    prix_m2_dvf: dvfResult.prix_m2,
    nb_transactions_dvf: dvfResult.nb_transactions,
    population_insee: population,
    source_dvf: 'DVF (Demandes de Valeurs Foncières) — data.gouv.fr',
    source_insee: 'API Géo / INSEE — geo.api.gouv.fr',
    derniere_maj: new Date().toISOString(),
  }

  return NextResponse.json(result)
}

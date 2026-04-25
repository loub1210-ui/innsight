/**
 * Testeurs de connexion par service. Renvoient { ok, message }.
 * Pour les APIs publiques on teste juste la disponibilité.
 */

export interface TestResult {
  ok: boolean
  message: string
}

type Tester = (creds: Record<string, string>) => Promise<TestResult>

const TESTERS: Record<string, Tester> = {
  // ─── Données publiques ──────────────────────────────────────────────────
  dvf: async () => {
    const res = await fetch('https://api.cquest.org/dvf?code_commune=75056&page_size=1')
    return res.ok ? { ok: true, message: 'API DVF accessible' } : { ok: false, message: `HTTP ${res.status}` }
  },
  insee_geo: async () => {
    const res = await fetch('https://geo.api.gouv.fr/communes/75056?fields=population')
    return res.ok ? { ok: true, message: 'API Géo accessible' } : { ok: false, message: `HTTP ${res.status}` }
  },

  insee_bpe: async (creds) => {
    if (!creds.consumer_key || !creds.consumer_secret) return { ok: false, message: 'Credentials manquants' }
    try {
      const tokenRes = await fetch('https://api.insee.fr/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(`${creds.consumer_key}:${creds.consumer_secret}`).toString('base64')}`,
        },
        body: 'grant_type=client_credentials',
      })
      if (!tokenRes.ok) return { ok: false, message: `Auth INSEE échouée (HTTP ${tokenRes.status})` }
      const json = await tokenRes.json() as { access_token?: string }
      return json.access_token
        ? { ok: true, message: 'Token OAuth INSEE BPE obtenu' }
        : { ok: false, message: 'Pas de token reçu' }
    } catch (e) {
      return { ok: false, message: (e as Error).message }
    }
  },

  insee_sirene: async (creds) => TESTERS.insee_bpe(creds), // mêmes credentials

  // ─── Entreprises ────────────────────────────────────────────────────────
  pappers: async (creds) => {
    if (!creds.api_key) return { ok: false, message: 'API key manquante' }
    const res = await fetch(`https://api.pappers.fr/v2/entreprise?api_token=${encodeURIComponent(creds.api_key)}&siren=552032534`)
    if (res.ok) return { ok: true, message: 'Pappers OK' }
    return { ok: false, message: `Pappers HTTP ${res.status}` }
  },

  infogreffe: async (creds) => {
    if (!creds.api_key) return { ok: false, message: 'API key manquante' }
    return { ok: true, message: 'Clé enregistrée (test live à câbler)' }
  },

  societecom: async (creds) => {
    if (!creds.api_key) return { ok: false, message: 'API key manquante' }
    return { ok: true, message: 'Clé enregistrée (test live à câbler)' }
  },

  // ─── Hôtellerie / marché ────────────────────────────────────────────────
  mkg: async (creds) => creds.api_key
    ? { ok: true, message: 'Clé enregistrée (endpoint test à câbler avec MKG)' }
    : { ok: false, message: 'API key manquante' },
  inextenso_tourisme: async (creds) => creds.api_key
    ? { ok: true, message: 'Clé enregistrée' }
    : { ok: false, message: 'API key manquante' },
  atout_france: async () => ({ ok: true, message: 'API publique' }),

  // ─── Avis ───────────────────────────────────────────────────────────────
  booking_affiliate: async (creds) => {
    if (!creds.affiliate_id || !creds.api_key) return { ok: false, message: 'Affiliate ID + API key requis' }
    return { ok: true, message: 'Credentials enregistrés (test live à câbler avec Booking Demand API)' }
  },
  tripadvisor: async (creds) => {
    if (!creds.api_key) return { ok: false, message: 'API key manquante' }
    const res = await fetch(`https://api.content.tripadvisor.com/api/v1/location/search?key=${encodeURIComponent(creds.api_key)}&searchQuery=Paris&category=hotels&language=fr`)
    return res.ok ? { ok: true, message: 'Tripadvisor OK' } : { ok: false, message: `Tripadvisor HTTP ${res.status}` }
  },
  google_places: async (creds) => {
    if (!creds.api_key) return { ok: false, message: 'API key manquante' }
    const res = await fetch(`https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=hotel&inputtype=textquery&key=${encodeURIComponent(creds.api_key)}`)
    if (!res.ok) return { ok: false, message: `Google HTTP ${res.status}` }
    const json = await res.json() as { status?: string; error_message?: string }
    return json.status === 'OK' || json.status === 'ZERO_RESULTS'
      ? { ok: true, message: 'Google Places OK' }
      : { ok: false, message: json.error_message ?? json.status ?? 'Erreur inconnue' }
  },

  // ─── IA ─────────────────────────────────────────────────────────────────
  anthropic: async (creds) => {
    if (!creds.api_key) return { ok: false, message: 'API key manquante' }
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': creds.api_key,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 5,
        messages: [{ role: 'user', content: 'ping' }],
      }),
    })
    if (res.ok) return { ok: true, message: 'Claude API OK' }
    const text = await res.text()
    return { ok: false, message: `Anthropic HTTP ${res.status} : ${text.slice(0, 120)}` }
  },
  openai: async (creds) => {
    if (!creds.api_key) return { ok: false, message: 'API key manquante' }
    const res = await fetch('https://api.openai.com/v1/models', {
      headers: { Authorization: `Bearer ${creds.api_key}` },
    })
    return res.ok ? { ok: true, message: 'OpenAI OK' } : { ok: false, message: `OpenAI HTTP ${res.status}` }
  },

  // ─── Cartes ─────────────────────────────────────────────────────────────
  mapbox: async (creds) => {
    const token = creds.access_token
    if (!token) return { ok: false, message: 'Access token manquant' }
    const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/Paris.json?access_token=${encodeURIComponent(token)}&limit=1`)
    return res.ok ? { ok: true, message: 'Mapbox OK' } : { ok: false, message: `Mapbox HTTP ${res.status}` }
  },
  google_maps: async (creds) => {
    if (!creds.api_key) return { ok: false, message: 'API key manquante' }
    const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=Paris&key=${encodeURIComponent(creds.api_key)}`)
    if (!res.ok) return { ok: false, message: `Google HTTP ${res.status}` }
    const json = await res.json() as { status?: string; error_message?: string }
    return json.status === 'OK'
      ? { ok: true, message: 'Google Maps OK' }
      : { ok: false, message: json.error_message ?? json.status ?? 'Erreur' }
  },
}

export async function testIntegration(service: string, creds: Record<string, string>): Promise<TestResult> {
  const tester = TESTERS[service]
  if (!tester) return { ok: false, message: `Service inconnu : ${service}` }
  try {
    return await tester(creds)
  } catch (e) {
    return { ok: false, message: (e as Error).message }
  }
}

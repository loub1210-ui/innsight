/**
 * Registre centralisé de toutes les intégrations API d'InnSight.
 *
 * Pour ajouter une nouvelle API :
 *   1. Ajouter l'entrée ici
 *   2. Implémenter la fonction de test dans `src/lib/integrations/testers.ts`
 *   3. (optionnel) implémenter le wrapper d'appel dans `src/lib/integrations/clients/`
 */

export type IntegrationCategory =
  | 'donnees_publiques'    // INSEE, DVF, géo — gratuit
  | 'entreprises'          // SIRENE, Pappers, Infogreffe, Societe.com
  | 'hotellerie_marche'    // MKG, In Extenso, Atout France
  | 'avis_hotels'          // Booking, Tripadvisor, Google Places
  | 'ia'                   // Anthropic, OpenAI
  | 'cartes'               // Mapbox, Google Maps

export type IntegrationPricing = 'gratuit' | 'freemium' | 'payant'

export interface IntegrationDefinition {
  /** Identifiant technique (slug) — utilisé en clé en base */
  service: string
  /** Nom affiché dans l'UI */
  label: string
  /** Catégorie d'affichage */
  category: IntegrationCategory
  /** Description courte du rôle dans InnSight */
  usage: string
  /** Lien vers la doc / page d'inscription */
  docUrl: string
  /** Modèle économique */
  pricing: IntegrationPricing
  /** Si true → aucune clé requise (API publique) */
  publicApi: boolean
  /** Champs requis (en plus ou à la place de la clé) */
  fields?: Array<{
    name: string
    label: string
    type: 'text' | 'password' | 'url'
    placeholder?: string
    required?: boolean
  }>
  /** Indique si l'API doit être activée pour les flows InnSight */
  required: boolean
  /** Texte d'aide / coût indicatif */
  notes?: string
}

export const INTEGRATIONS: IntegrationDefinition[] = [
  // ─── Données publiques (gratuit) ────────────────────────────────────────────
  {
    service: 'dvf',
    label: 'DVF — Demandes de Valeurs Foncières',
    category: 'donnees_publiques',
    usage: 'Prix /m² médian + nb transactions immobilières par commune',
    docUrl: 'https://www.data.gouv.fr/fr/datasets/demandes-de-valeurs-foncieres/',
    pricing: 'gratuit',
    publicApi: true,
    required: true,
  },
  {
    service: 'insee_geo',
    label: 'INSEE Géo API',
    category: 'donnees_publiques',
    usage: 'Population + métadonnées communes',
    docUrl: 'https://geo.api.gouv.fr/',
    pricing: 'gratuit',
    publicApi: true,
    required: true,
  },
  {
    service: 'insee_bpe',
    label: 'INSEE BPE — Base Permanente des Équipements',
    category: 'donnees_publiques',
    usage: 'Nb hôtels par commune et catégorie (2★/3★/4★)',
    docUrl: 'https://api.insee.fr/catalogue/',
    pricing: 'freemium',
    publicApi: false,
    fields: [
      { name: 'consumer_key', label: 'Consumer Key', type: 'password', required: true },
      { name: 'consumer_secret', label: 'Consumer Secret', type: 'password', required: true },
    ],
    required: true,
    notes: 'Compte gratuit api.insee.fr (token OAuth)',
  },
  {
    service: 'insee_sirene',
    label: 'INSEE SIRENE',
    category: 'entreprises',
    usage: 'Nb entreprises et sièges sociaux par commune',
    docUrl: 'https://api.insee.fr/catalogue/',
    pricing: 'freemium',
    publicApi: false,
    fields: [
      { name: 'consumer_key', label: 'Consumer Key', type: 'password', required: true },
      { name: 'consumer_secret', label: 'Consumer Secret', type: 'password', required: true },
    ],
    required: true,
    notes: 'Mêmes credentials qu\'INSEE BPE possible',
  },

  // ─── Données entreprises (payant) ───────────────────────────────────────────
  {
    service: 'pappers',
    label: 'Pappers',
    category: 'entreprises',
    usage: 'Bilans, dirigeants, P&L hôtels indépendants',
    docUrl: 'https://www.pappers.fr/api',
    pricing: 'payant',
    publicApi: false,
    fields: [
      { name: 'api_key', label: 'API Token', type: 'password', required: true },
    ],
    required: true,
    notes: '~199 €/mois plan Standard — quota 10k requêtes/mois',
  },
  {
    service: 'infogreffe',
    label: 'Infogreffe',
    category: 'entreprises',
    usage: 'Bilans officiels (KBIS, comptes annuels)',
    docUrl: 'https://www.infogreffe.fr/services-aux-entreprises/api',
    pricing: 'payant',
    publicApi: false,
    fields: [
      { name: 'api_key', label: 'API Key', type: 'password', required: true },
    ],
    required: false,
    notes: 'À utiliser en complément de Pappers si bilans manquants',
  },
  {
    service: 'societecom',
    label: 'Societe.com',
    category: 'entreprises',
    usage: 'Nom du dirigeant + numéro téléphone hôtels indépendants',
    docUrl: 'https://www.societe.com/api',
    pricing: 'payant',
    publicApi: false,
    fields: [
      { name: 'api_key', label: 'API Key', type: 'password', required: true },
    ],
    required: false,
    notes: 'Fallback : scraping (à activer dans paramètres scraping)',
  },

  // ─── Hôtellerie / marché ────────────────────────────────────────────────────
  {
    service: 'mkg',
    label: 'MKG Hospitality / HotStats',
    category: 'hotellerie_marche',
    usage: 'RevPAR, ADR, taux d\'occupation par ville et catégorie',
    docUrl: 'https://www.mkg-group.com/fr/',
    pricing: 'payant',
    publicApi: false,
    fields: [
      { name: 'api_key', label: 'Token API', type: 'password', required: true },
    ],
    required: false,
    notes: 'Contrat sur devis — données indispensables pour benchmarks fiables',
  },
  {
    service: 'inextenso_tourisme',
    label: 'In Extenso Tourisme',
    category: 'hotellerie_marche',
    usage: 'Baromètres tourisme régional, tendances',
    docUrl: 'https://www.inextenso-tourisme.fr/',
    pricing: 'payant',
    publicApi: false,
    fields: [
      { name: 'api_key', label: 'API Key', type: 'password', required: true },
    ],
    required: false,
  },
  {
    service: 'atout_france',
    label: 'Atout France',
    category: 'hotellerie_marche',
    usage: 'Nuitées touristiques, MICE, fréquentation',
    docUrl: 'https://www.atout-france.fr/',
    pricing: 'gratuit',
    publicApi: true,
    required: false,
  },

  // ─── Avis hôtels (notes Booking) ────────────────────────────────────────────
  {
    service: 'booking_affiliate',
    label: 'Booking.com Affiliate / Demand API',
    category: 'avis_hotels',
    usage: 'Notes Booking, prix et disponibilités hôtels d\'une zone',
    docUrl: 'https://developers.booking.com/',
    pricing: 'freemium',
    publicApi: false,
    fields: [
      { name: 'affiliate_id', label: 'Affiliate ID', type: 'text', required: true },
      { name: 'api_key', label: 'API Token', type: 'password', required: true },
    ],
    required: true,
    notes: 'Privilégier API Affiliate (légal). Scraping en fallback uniquement.',
  },
  {
    service: 'tripadvisor',
    label: 'Tripadvisor Content API',
    category: 'avis_hotels',
    usage: 'Notes & avis Tripadvisor',
    docUrl: 'https://developer-tripadvisor.com/content-api/',
    pricing: 'freemium',
    publicApi: false,
    fields: [
      { name: 'api_key', label: 'API Key', type: 'password', required: true },
    ],
    required: false,
  },
  {
    service: 'google_places',
    label: 'Google Places API',
    category: 'avis_hotels',
    usage: 'Notes Google + photos + horaires hôtels',
    docUrl: 'https://developers.google.com/maps/documentation/places/web-service',
    pricing: 'freemium',
    publicApi: false,
    fields: [
      { name: 'api_key', label: 'API Key', type: 'password', required: true },
    ],
    required: false,
    notes: '$200 de crédit gratuit/mois Google Cloud',
  },

  // ─── IA ────────────────────────────────────────────────────────────────────
  {
    service: 'anthropic',
    label: 'Anthropic Claude',
    category: 'ia',
    usage: 'Résumé IA marché ville + détection prix anormaux + analyse concurrence',
    docUrl: 'https://console.anthropic.com/',
    pricing: 'payant',
    publicApi: false,
    fields: [
      { name: 'api_key', label: 'API Key (sk-ant-…)', type: 'password', required: true },
    ],
    required: true,
    notes: 'Recommandé : Claude Sonnet (meilleur rapport coût/qualité)',
  },
  {
    service: 'openai',
    label: 'OpenAI',
    category: 'ia',
    usage: 'Alternative à Claude pour résumés IA',
    docUrl: 'https://platform.openai.com/',
    pricing: 'payant',
    publicApi: false,
    fields: [
      { name: 'api_key', label: 'API Key (sk-…)', type: 'password', required: true },
    ],
    required: false,
  },

  // ─── Cartes ────────────────────────────────────────────────────────────────
  {
    service: 'mapbox',
    label: 'Mapbox',
    category: 'cartes',
    usage: 'Carte interactive opportunités + isochrones gare',
    docUrl: 'https://docs.mapbox.com/',
    pricing: 'freemium',
    publicApi: false,
    fields: [
      { name: 'access_token', label: 'Access Token (pk.…)', type: 'password', required: true },
    ],
    required: false,
    notes: '50 000 chargements/mois gratuits',
  },
  {
    service: 'google_maps',
    label: 'Google Maps Geocoding',
    category: 'cartes',
    usage: 'Géocodage adresses + matrice de distance vers gares',
    docUrl: 'https://developers.google.com/maps/documentation/geocoding',
    pricing: 'freemium',
    publicApi: false,
    fields: [
      { name: 'api_key', label: 'API Key', type: 'password', required: true },
    ],
    required: false,
  },
]

export const CATEGORY_LABELS: Record<IntegrationCategory, string> = {
  donnees_publiques: 'Données publiques',
  entreprises: 'Données entreprises',
  hotellerie_marche: 'Hôtellerie / Marché',
  avis_hotels: 'Avis & notes hôtels',
  ia: 'Intelligence artificielle',
  cartes: 'Cartes & géocodage',
}

export const PRICING_LABELS: Record<IntegrationPricing, string> = {
  gratuit: 'Gratuit',
  freemium: 'Freemium',
  payant: 'Payant',
}

export function getIntegration(service: string): IntegrationDefinition | undefined {
  return INTEGRATIONS.find(i => i.service === service)
}

export function getIntegrationsByCategory(): Record<IntegrationCategory, IntegrationDefinition[]> {
  const out = {} as Record<IntegrationCategory, IntegrationDefinition[]>
  for (const def of INTEGRATIONS) {
    if (!out[def.category]) out[def.category] = []
    out[def.category].push(def)
  }
  return out
}

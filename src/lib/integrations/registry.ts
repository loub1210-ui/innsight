/**
 * Registre centralisé de toutes les intégrations API d'InnSight.
 * L'entreprise renseigne ses clés API depuis Paramètres → Intégrations.
 * Chaque entrée doit fournir un lien `signupUrl` clair pour souscrire.
 */

export type IntegrationCategory =
  | 'donnees_publiques'    // INSEE, DVF, géo — gratuit
  | 'entreprises'          // SIRENE, Pappers, Infogreffe, Societe.com
  | 'hotellerie_marche'    // MKG, In Extenso, Atout France
  | 'avis_hotels'          // Booking, Tripadvisor, Google Places
  | 'ia'                   // Anthropic, OpenAI
  | 'cartes'               // Mapbox, Google Maps

export type IntegrationPricing = 'gratuit' | 'freemium' | 'payant'

export interface IntegrationField {
  name: string
  label: string
  type: 'text' | 'password' | 'url'
  placeholder?: string
  required?: boolean
}

export interface IntegrationDefinition {
  /** Identifiant technique (slug) — utilisé en clé en base */
  service: string
  /** Nom affiché dans l'UI */
  label: string
  /** Catégorie d'affichage */
  category: IntegrationCategory
  /** Description courte de ce que ça apporte à InnSight */
  usage: string
  /** Page de documentation technique */
  docUrl: string
  /** Page d'inscription / souscription (URL où l'entreprise crée son compte) */
  signupUrl: string
  /** Modèle économique */
  pricing: IntegrationPricing
  /** Étiquette de prix lisible (ex: "Gratuit", "199 €/mois", "Pay-as-you-go") */
  priceLabel: string
  /** Si true → aucune clé requise (API publique) */
  publicApi: boolean
  /** Champs à saisir par l'utilisateur */
  fields?: IntegrationField[]
  /** Cette intégration est requise au minimum pour qu'InnSight fonctionne */
  required: boolean
  /** Texte d'aide complémentaire (souvent : ce qu'il faut faire après inscription) */
  setupNotes?: string
}

export const INTEGRATIONS: IntegrationDefinition[] = [
  // ─── Données publiques ─────────────────────────────────────────────
  {
    service: 'dvf',
    label: 'DVF — Demandes de Valeurs Foncières',
    category: 'donnees_publiques',
    usage: 'Prix /m² médian + nombre de transactions immobilières par commune',
    docUrl: 'https://www.data.gouv.fr/fr/datasets/demandes-de-valeurs-foncieres/',
    signupUrl: 'https://api.cquest.org/dvf',
    pricing: 'gratuit',
    priceLabel: 'Gratuit — API publique',
    publicApi: true,
    required: true,
    setupNotes: 'API publique data.gouv.fr — aucune inscription requise.',
  },
  {
    service: 'insee_geo',
    label: 'INSEE Géo API',
    category: 'donnees_publiques',
    usage: 'Population, surface, métadonnées des communes françaises',
    docUrl: 'https://geo.api.gouv.fr/',
    signupUrl: 'https://geo.api.gouv.fr/',
    pricing: 'gratuit',
    priceLabel: 'Gratuit — API publique',
    publicApi: true,
    required: true,
    setupNotes: 'API publique du gouvernement — aucune inscription requise.',
  },
  {
    service: 'insee_bpe',
    label: 'INSEE BPE — Base Permanente des Équipements',
    category: 'donnees_publiques',
    usage: 'Nombre d\'hôtels par commune et catégorie (2★ / 3★ / 4★)',
    docUrl: 'https://api.insee.fr/catalogue/site/themes/wso2/subthemes/insee/pages/list-apis.jag',
    signupUrl: 'https://portail-api.insee.fr/inscription',
    pricing: 'freemium',
    priceLabel: 'Gratuit — quota 30 req/min',
    publicApi: false,
    fields: [
      { name: 'consumer_key', label: 'Consumer Key', type: 'password', placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', required: true },
      { name: 'consumer_secret', label: 'Consumer Secret', type: 'password', required: true },
    ],
    required: true,
    setupNotes: 'Créer un compte sur portail-api.insee.fr → Souscrire à l\'API « BPE ‒ Données ouvertes » → Récupérer Consumer Key + Consumer Secret.',
  },
  {
    service: 'insee_sirene',
    label: 'INSEE SIRENE',
    category: 'entreprises',
    usage: 'Nombre d\'entreprises et sièges sociaux par commune (densité business)',
    docUrl: 'https://api.insee.fr/catalogue/',
    signupUrl: 'https://portail-api.insee.fr/inscription',
    pricing: 'freemium',
    priceLabel: 'Gratuit — quota 30 req/min',
    publicApi: false,
    fields: [
      { name: 'consumer_key', label: 'Consumer Key', type: 'password', required: true },
      { name: 'consumer_secret', label: 'Consumer Secret', type: 'password', required: true },
    ],
    required: true,
    setupNotes: 'Mêmes credentials que BPE possible. Souscrire à l\'API « Sirene V3 » sur portail-api.insee.fr.',
  },

  // ─── Données entreprises ───────────────────────────────────────────
  {
    service: 'pappers',
    label: 'Pappers',
    category: 'entreprises',
    usage: 'Bilans, dirigeants, contacts et P&L des hôtels indépendants',
    docUrl: 'https://www.pappers.fr/api/documentation',
    signupUrl: 'https://www.pappers.fr/api',
    pricing: 'payant',
    priceLabel: 'À partir de 199 €/mois (10 000 req)',
    publicApi: false,
    fields: [
      { name: 'api_key', label: 'API Token', type: 'password', placeholder: 'ABC123…', required: true },
    ],
    required: true,
    setupNotes: 'Souscrire un plan Pappers Standard → Espace client → API → générer un token. Plan suffisant pour usage InnSight (1 actu / mois).',
  },
  {
    service: 'infogreffe',
    label: 'Infogreffe',
    category: 'entreprises',
    usage: 'Bilans officiels (KBIS, comptes annuels) — complément Pappers',
    docUrl: 'https://www.infogreffe.fr/services-aux-entreprises/api',
    signupUrl: 'https://www.infogreffe.fr/services-aux-entreprises/api',
    pricing: 'payant',
    priceLabel: 'Pay-as-you-go (~ 0,50 € / bilan)',
    publicApi: false,
    fields: [
      { name: 'api_key', label: 'API Key', type: 'password', required: true },
    ],
    required: false,
    setupNotes: 'Optionnel — utile uniquement si Pappers ne couvre pas un dossier (rare).',
  },
  {
    service: 'societecom',
    label: 'Societe.com',
    category: 'entreprises',
    usage: 'Nom du dirigeant + numéro de téléphone (pour prospection hôtels indépendants)',
    docUrl: 'https://www.societe.com/societe/api',
    signupUrl: 'https://www.societe.com/societe/api',
    pricing: 'payant',
    priceLabel: 'Sur devis',
    publicApi: false,
    fields: [
      { name: 'api_key', label: 'API Key', type: 'password', required: true },
    ],
    required: false,
    setupNotes: 'Alternative : data scrappée depuis societe.com en fallback (à activer dans paramètres scraping).',
  },

  // ─── Hôtellerie / Marché ───────────────────────────────────────────
  {
    service: 'mkg',
    label: 'MKG Hospitality',
    category: 'hotellerie_marche',
    usage: 'RevPAR, ADR, taux d\'occupation par ville et catégorie d\'étoiles',
    docUrl: 'https://www.mkg-group.com/fr/observatoire-hotelier-en-ligne/',
    signupUrl: 'https://www.mkg-group.com/fr/contact/',
    pricing: 'payant',
    priceLabel: 'Sur devis (à partir de ~3k €/an)',
    publicApi: false,
    fields: [
      { name: 'api_key', label: 'Token API', type: 'password', required: true },
    ],
    required: false,
    setupNotes: 'Indispensable pour des benchmarks RevPAR/ADR fiables. Contact commercial via le formulaire MKG.',
  },
  {
    service: 'inextenso_tourisme',
    label: 'In Extenso Tourisme — Baromètre',
    category: 'hotellerie_marche',
    usage: 'Baromètres tourisme régional, tendances marché hôtelier',
    docUrl: 'https://www.inextenso-tourisme.fr/',
    signupUrl: 'https://www.inextenso-tourisme.fr/contact/',
    pricing: 'payant',
    priceLabel: 'Sur devis',
    publicApi: false,
    fields: [
      { name: 'api_key', label: 'API Key', type: 'password', required: true },
    ],
    required: false,
    setupNotes: 'Données complémentaires à MKG. Souscription via contact commercial In Extenso.',
  },
  {
    service: 'atout_france',
    label: 'Atout France',
    category: 'hotellerie_marche',
    usage: 'Nuitées touristiques, MICE, fréquentation par destination',
    docUrl: 'https://www.atout-france.fr/contenus-pro',
    signupUrl: 'https://www.atout-france.fr/',
    pricing: 'gratuit',
    priceLabel: 'Gratuit — données publiques',
    publicApi: true,
    required: false,
    setupNotes: 'Données publiques disponibles sur le portail Atout France.',
  },

  // ─── Avis hôtels (notes Booking) ───────────────────────────────────
  {
    service: 'booking_affiliate',
    label: 'Booking.com — Demand API',
    category: 'avis_hotels',
    usage: 'Notes Booking, prix et disponibilités des hôtels concurrents',
    docUrl: 'https://developers.booking.com/api/index.html',
    signupUrl: 'https://www.booking.com/affiliate-program/v2/index.html',
    pricing: 'freemium',
    priceLabel: 'Gratuit (programme Affiliate)',
    publicApi: false,
    fields: [
      { name: 'affiliate_id', label: 'Affiliate ID', type: 'text', placeholder: '1234567', required: true },
      { name: 'api_key', label: 'API Token', type: 'password', required: true },
    ],
    required: true,
    setupNotes: 'S\'inscrire au programme Affiliate Booking → Demander accès à la Demand API → 2-3 semaines de validation. Privilégier l\'API officielle au scraping (légal + stable).',
  },
  {
    service: 'tripadvisor',
    label: 'Tripadvisor Content API',
    category: 'avis_hotels',
    usage: 'Notes & avis Tripadvisor — complément Booking',
    docUrl: 'https://tripadvisor-content-api.readme.io/',
    signupUrl: 'https://www.tripadvisor.com/developers',
    pricing: 'freemium',
    priceLabel: 'Gratuit (5 000 req/mois)',
    publicApi: false,
    fields: [
      { name: 'api_key', label: 'API Key', type: 'password', required: true },
    ],
    required: false,
    setupNotes: 'Inscription développeur Tripadvisor → créer une app → récupérer la clé. Quota gratuit largement suffisant pour InnSight.',
  },
  {
    service: 'google_places',
    label: 'Google Places API',
    category: 'avis_hotels',
    usage: 'Notes Google + photos + horaires des hôtels',
    docUrl: 'https://developers.google.com/maps/documentation/places/web-service/overview',
    signupUrl: 'https://console.cloud.google.com/google/maps-apis/start',
    pricing: 'freemium',
    priceLabel: '200 $ de crédit gratuit / mois',
    publicApi: false,
    fields: [
      { name: 'api_key', label: 'API Key', type: 'password', placeholder: 'AIza…', required: true },
    ],
    required: false,
    setupNotes: 'Créer un projet Google Cloud → activer Places API → générer une clé. Restreindre la clé par IP/référeur pour la sécurité.',
  },

  // ─── Intelligence artificielle ─────────────────────────────────────
  {
    service: 'anthropic',
    label: 'Anthropic Claude',
    category: 'ia',
    usage: 'Résumé IA marché par ville + détection prix anormaux + analyse concurrence',
    docUrl: 'https://docs.claude.com/',
    signupUrl: 'https://console.anthropic.com/',
    pricing: 'payant',
    priceLabel: 'Pay-as-you-go (~ 5 € / 100 villes analysées)',
    publicApi: false,
    fields: [
      { name: 'api_key', label: 'API Key', type: 'password', placeholder: 'sk-ant-…', required: true },
    ],
    required: true,
    setupNotes: 'Créer un compte sur console.anthropic.com → Add credit (min 5 $) → Generate API Key. Recommandé : modèle Claude Sonnet (meilleur ratio coût/qualité).',
  },
  {
    service: 'openai',
    label: 'OpenAI (alternative)',
    category: 'ia',
    usage: 'Alternative à Claude pour les résumés IA',
    docUrl: 'https://platform.openai.com/docs',
    signupUrl: 'https://platform.openai.com/signup',
    pricing: 'payant',
    priceLabel: 'Pay-as-you-go',
    publicApi: false,
    fields: [
      { name: 'api_key', label: 'API Key', type: 'password', placeholder: 'sk-…', required: true },
    ],
    required: false,
    setupNotes: 'Optionnel — uniquement si tu préfères ChatGPT à Claude. Une seule des deux APIs IA suffit.',
  },

  // ─── Cartes & géocodage ────────────────────────────────────────────
  {
    service: 'mapbox',
    label: 'Mapbox',
    category: 'cartes',
    usage: 'Carte interactive des opportunités + isochrones (temps de marche vers la gare)',
    docUrl: 'https://docs.mapbox.com/',
    signupUrl: 'https://account.mapbox.com/auth/signup/',
    pricing: 'freemium',
    priceLabel: 'Gratuit < 50 000 chargements / mois',
    publicApi: false,
    fields: [
      { name: 'access_token', label: 'Access Token', type: 'password', placeholder: 'pk.eyJ1…', required: true },
    ],
    required: false,
    setupNotes: 'Compte Mapbox → Account → Access tokens → utiliser le « default public token ». Largement suffisant pour InnSight.',
  },
  {
    service: 'google_maps',
    label: 'Google Maps Geocoding',
    category: 'cartes',
    usage: 'Géocodage adresses + matrice de distance vers les gares',
    docUrl: 'https://developers.google.com/maps/documentation/geocoding',
    signupUrl: 'https://console.cloud.google.com/google/maps-apis/start',
    pricing: 'freemium',
    priceLabel: '200 $ de crédit gratuit / mois',
    publicApi: false,
    fields: [
      { name: 'api_key', label: 'API Key', type: 'password', placeholder: 'AIza…', required: true },
    ],
    required: false,
    setupNotes: 'Même projet Google Cloud que Places possible. Activer « Geocoding API » + « Distance Matrix API ».',
  },
]

export const CATEGORY_LABELS: Record<IntegrationCategory, string> = {
  donnees_publiques: 'Données publiques',
  entreprises: 'Données entreprises',
  hotellerie_marche: 'Hôtellerie & marché',
  avis_hotels: 'Avis & notes hôtels',
  ia: 'Intelligence artificielle',
  cartes: 'Cartes & géocodage',
}

export const CATEGORY_DESCRIPTIONS: Record<IntegrationCategory, string> = {
  donnees_publiques: 'Sources gouvernementales pour la donnée brute (gratuit ou freemium).',
  entreprises: 'Bilans, dirigeants et contacts des hôtels indépendants à prospecter.',
  hotellerie_marche: 'Benchmarks RevPAR / ADR / occupation par marché.',
  avis_hotels: 'Notes et tarifs des hôtels concurrents pour analyse de positionnement.',
  ia: 'Modèles IA pour les résumés, l\'analyse concurrence et la détection d\'anomalies.',
  cartes: 'Cartes interactives, géocodage et calcul d\'itinéraires vers les gares.',
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

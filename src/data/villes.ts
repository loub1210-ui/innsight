/**
 * Dataset MOCK pour la démo InnSight (avant branchement APIs réelles).
 * Données indicatives, calibrées sur les fiches RDV Antonin (Strasbourg, Toulon)
 * et le Weekly Acquisition Meeting Alfred Hotels.
 *
 * Pour passer en data live : remplacer ces objets par des appels à
 * /api/market-data + INSEE BPE/SIRENE + scraping notes Booking.
 */

export type SourceLink = { label: string; url: string }

export interface RatioWithSource {
  value: number
  unit?: string
  sources: SourceLink[]
}

export interface Hotel {
  nom: string
  adresse: string
  etoiles: 2 | 3 | 4 | 5
  chambres: number
  note_booking: number
  prix_nuit_moyen: number
  independant: boolean
  prix_anormalement_bas?: boolean
  url_booking?: string
  dirigeant?: string
  telephone?: string
  url_bilan?: string
  ca_estime?: number
}

export interface EvenementMarche {
  nom: string
  type: 'salon' | 'festival' | 'congres' | 'sport' | 'culturel' | 'saison_haute'
  mois_debut: number  // 1-12
  mois_fin: number    // 1-12
  impact_adr: 'haut' | 'moyen' | 'bas'
  description?: string
}

export interface ProjetStructurant {
  titre: string
  categorie: 'transport' | 'urbanisme' | 'equipement' | 'autre'
  echeance: string
  impact: 'fort' | 'moyen' | 'faible'
  source?: SourceLink
}

export interface VilleDetail {
  slug: string
  ville: string
  region: string
  dept: string
  gare_principale: string

  // ── Démographie ────────────────────────────────────────────────────
  population: number
  population_metropole: number
  aire_attraction: number
  surface_km2: number

  // ── Marché hôtelier — vue agrégée ──────────────────────────────────
  nb_hotels_total: number
  nb_hotels_2etoiles: number
  nb_hotels_3etoiles: number
  nb_hotels_4etoiles: number
  nb_hotels_independants: number
  nb_chambres_total: number

  // ── Tourisme ───────────────────────────────────────────────────────
  nuitees_an: number          // nuitées touristiques annuelles
  touristes_an: number        // visiteurs uniques estimés
  saison_haute_mois: number[] // ex: [11, 12]
  ratio_loisir_pct: number
  ratio_business_pct: number
  ratio_mice_pct: number

  // ── MICE (le ratio le plus important selon Anto) ───────────────────
  mice_evenements_an: number
  mice_visiteurs_an: number   // en milliers

  // ── Performance hôtelière ──────────────────────────────────────────
  adr_moyen: number
  revpar_moyen: number
  note_booking_moyenne: number

  // ── Économie / Business ────────────────────────────────────────────
  nb_entreprises: number
  nb_groupes_majeurs: number  // sièges sociaux > 250 salariés
  prix_m2_immobilier: number
  rendement_brut: number
  tendance_marche: 'hausse' | 'stable' | 'baisse'

  // ── Score & infos qualitatives ─────────────────────────────────────
  score_attractivite: number
  resume_ia: string
  evenements: EvenementMarche[]
  projets: ProjetStructurant[]
  hotels: Hotel[]
  brokers_actifs: string[]

  // ── Sources globales ───────────────────────────────────────────────
  sources_globales: SourceLink[]
}

const SOURCES_DEFAUT: SourceLink[] = [
  { label: 'INSEE — Populations légales', url: 'https://www.insee.fr/fr/statistiques/6683035' },
  { label: 'INSEE BPE — Hôtels par commune', url: 'https://www.insee.fr/fr/statistiques?theme=12' },
  { label: 'DVF — data.gouv.fr', url: 'https://www.data.gouv.fr/fr/datasets/demandes-de-valeurs-foncieres/' },
  { label: 'Atout France', url: 'https://www.atout-france.fr/' },
  { label: 'MKG Hospitality', url: 'https://www.mkg-group.com/fr/' },
  { label: 'Booking.com', url: 'https://www.booking.com/' },
]

// ──────────────────────────────────────────────────────────────────────
// 6 villes prioritaires Alfred Hotels (cf. Weekly Acquisition Meeting)
// ──────────────────────────────────────────────────────────────────────

const STRASBOURG: VilleDetail = {
  slug: 'strasbourg',
  ville: 'Strasbourg',
  region: 'Grand Est',
  dept: '67',
  gare_principale: 'Gare de Strasbourg',

  population: 290_000,
  population_metropole: 515_000,
  aire_attraction: 790_000,
  surface_km2: 78,

  nb_hotels_total: 193,
  nb_hotels_2etoiles: 38,
  nb_hotels_3etoiles: 92,
  nb_hotels_4etoiles: 49,
  nb_hotels_independants: 87,
  nb_chambres_total: 10_290,

  nuitees_an: 3_870_000,
  touristes_an: 2_400_000,
  saison_haute_mois: [11, 12],
  ratio_loisir_pct: 45,
  ratio_business_pct: 35,
  ratio_mice_pct: 20,

  mice_evenements_an: 236,
  mice_visiteurs_an: 675,

  adr_moyen: 128,
  revpar_moyen: 85,
  note_booking_moyenne: 8.1,

  nb_entreprises: 48_500,
  nb_groupes_majeurs: 42,
  prix_m2_immobilier: 3_600,
  rendement_brut: 5.7,
  tendance_marche: 'stable',

  score_attractivite: 84,
  resume_ia: "Capitale européenne stable, dominée par un parc midscale en montée en gamme. La saisonnalité est très marquée par le Marché de Noël (ADR killer en novembre-décembre) et les sessions parlementaires. Forte demande long-stay institutionnelle (≈20k résidents internationaux). 2 hôtels signalés en sous-pricing : Hotel Adonis*** et Ibis Styles Centre Gare*** (-15% vs marché). Concurrence midscale dynamique mais peu de très gros hôtels. Cible Alfred (3-4* corpo gare) très adaptée — l'opportunité Adonis 29# est sur le marché à 3.7M€.",
  evenements: [
    { nom: 'Marché de Noël', type: 'saison_haute', mois_debut: 11, mois_fin: 12, impact_adr: 'haut', description: 'ADR x2, contraintes opérationnelles fortes' },
    { nom: 'Session Parlement Européen', type: 'congres', mois_debut: 1, mois_fin: 12, impact_adr: 'haut', description: '12 sessions/an, mardi-jeudi' },
    { nom: 'Festival Musica', type: 'festival', mois_debut: 9, mois_fin: 10, impact_adr: 'moyen' },
    { nom: 'Foire Européenne', type: 'salon', mois_debut: 9, mois_fin: 9, impact_adr: 'moyen' },
    { nom: 'Eurovins', type: 'salon', mois_debut: 4, mois_fin: 4, impact_adr: 'moyen' },
  ],
  projets: [
    { titre: 'Quartier Gare 360° — requalification flux', categorie: 'urbanisme', echeance: '2026-2028', impact: 'fort', source: { label: 'Eurométropole Strasbourg', url: 'https://www.strasbourg.eu/' } },
    { titre: 'Halles — futur hub multimodal', categorie: 'transport', echeance: 'Fin 2025', impact: 'fort' },
    { titre: 'Deux-Rives / Port du Rhin (+10k logements, +8k emplois)', categorie: 'urbanisme', echeance: '2030', impact: 'fort' },
    { titre: 'Wacken / Archipel 2 — pôle affaires & événements', categorie: 'equipement', echeance: '2026-2027', impact: 'moyen' },
    { titre: 'Tram Nord + TSPO', categorie: 'transport', echeance: '2026-2028', impact: 'moyen' },
    { titre: 'OUIGO Strasbourg-Marseille (low-cost direct)', categorie: 'transport', echeance: 'Fin 2026', impact: 'moyen' },
    { titre: 'Aéroport Entzheim — 1.3M passagers 2025 (+vs avant Covid)', categorie: 'transport', echeance: '2025', impact: 'moyen' },
  ],
  hotels: [
    { nom: 'Hotel Adonis', adresse: '5 Rue Turenne, 67000', etoiles: 3, chambres: 29, note_booking: 7.9, prix_nuit_moyen: 105, independant: true, prix_anormalement_bas: true, ca_estime: 900_000, dirigeant: 'L. Adonis', telephone: '03 88 32 14 76', url_bilan: 'https://www.pappers.fr/' },
    { nom: 'Ibis Styles Centre Gare', adresse: '67000 Strasbourg', etoiles: 3, chambres: 124, note_booking: 8.2, prix_nuit_moyen: 110, independant: false, prix_anormalement_bas: true },
    { nom: 'Sofitel Strasbourg Grande Île', adresse: 'Place Saint-Pierre-le-Jeune', etoiles: 4, chambres: 100, note_booking: 8.6, prix_nuit_moyen: 220, independant: false },
    { nom: 'Hotel D', adresse: '15 Rue du 22 Novembre', etoiles: 4, chambres: 36, note_booking: 8.7, prix_nuit_moyen: 165, independant: true, dirigeant: 'M. Becker', telephone: '03 88 15 13 67' },
    { nom: 'Hôtel Cathédrale', adresse: '12 Place de la Cathédrale', etoiles: 3, chambres: 47, note_booking: 8.4, prix_nuit_moyen: 135, independant: true },
    { nom: 'Mercure Centre Petite France', adresse: '5 Rue des Moulins', etoiles: 4, chambres: 95, note_booking: 8.3, prix_nuit_moyen: 175, independant: false },
  ],
  brokers_actifs: ['Christie & Co', 'BNP Real Estate', 'CBRE Hotels'],
  sources_globales: SOURCES_DEFAUT,
}

const TOULON: VilleDetail = {
  slug: 'toulon',
  ville: 'Toulon',
  region: "Provence-Alpes-Côte d'Azur",
  dept: '83',
  gare_principale: 'Gare de Toulon',

  population: 180_000,
  population_metropole: 440_000,
  aire_attraction: 600_000,
  surface_km2: 42.84,

  nb_hotels_total: 80,
  nb_hotels_2etoiles: 28,
  nb_hotels_3etoiles: 38,
  nb_hotels_4etoiles: 14,
  nb_hotels_independants: 52,
  nb_chambres_total: 4_120,

  nuitees_an: 3_000_000,
  touristes_an: 1_650_000,
  saison_haute_mois: [6, 7, 8, 9],
  ratio_loisir_pct: 60,
  ratio_business_pct: 25,
  ratio_mice_pct: 15,

  mice_evenements_an: 87,
  mice_visiteurs_an: 145,

  adr_moyen: 112,
  revpar_moyen: 76,
  note_booking_moyenne: 7.8,

  nb_entreprises: 26_500,
  nb_groupes_majeurs: 18,
  prix_m2_immobilier: 3_900,
  rendement_brut: 6.0,
  tendance_marche: 'hausse',

  score_attractivite: 76,
  resume_ia: "3e pôle urbain méditerranéen, image en mutation. ADN maritime/militaire (1er port militaire européen, 24k emplois directs). Faible présence haut de gamme international = vrai potentiel boutique/lifestyle. Forte saisonnalité estivale + croissance des croisières (332k passagers, 6e port français). L'Eautel**** signalé comme opportunité (12.6M€, 77 chambres). 2 hôtels en sous-pricing détectés : Les 3 Dauphins* et Hotel Little Palace** (1.34M€ pour 38 chambres, ratio prix/clé très bas). Cible Alfred 3-4* corpo : marché peu concurrentiel sur ce segment.",
  evenements: [
    { nom: 'Saison estivale', type: 'saison_haute', mois_debut: 6, mois_fin: 9, impact_adr: 'haut', description: '+45% ADR juin-septembre' },
    { nom: 'RCT — saison Top 14', type: 'sport', mois_debut: 9, mois_fin: 6, impact_adr: 'moyen', description: 'Stade Mayol 18k places, week-ends matchs' },
    { nom: 'Festival de Musique Classique de Toulon', type: 'festival', mois_debut: 5, mois_fin: 6, impact_adr: 'moyen' },
    { nom: 'Salon Nautique de Toulon', type: 'salon', mois_debut: 9, mois_fin: 9, impact_adr: 'moyen' },
    { nom: 'Escales croisière', type: 'saison_haute', mois_debut: 4, mois_fin: 10, impact_adr: 'bas', description: '82 escales en 2024' },
  ],
  projets: [
    { titre: 'Cœur de Ville — modernisation centre', categorie: 'urbanisme', echeance: '2026-2028', impact: 'fort' },
    { titre: 'Réhabilitation Halles de Toulon', categorie: 'urbanisme', echeance: '2026', impact: 'moyen' },
    { titre: 'Quartier Chalucet — pôle créatif & universitaire', categorie: 'urbanisme', echeance: '2027', impact: 'fort' },
    { titre: 'BHNS — Bus à Haut Niveau de Service', categorie: 'transport', echeance: '2026', impact: 'fort' },
    { titre: 'Modernisation ports varois (transition écologique)', categorie: 'transport', echeance: '2027-2030', impact: 'moyen' },
    { titre: 'Fréjus — Hôtel premium Crédit Agricole', categorie: 'equipement', echeance: '2030', impact: 'faible', source: { label: 'Annonce projet', url: 'https://www.varmatin.com/' } },
  ],
  hotels: [
    { nom: 'L\'Eautel', adresse: '15 Rue Victor Micholet', etoiles: 4, chambres: 77, note_booking: 8.5, prix_nuit_moyen: 140, independant: true, ca_estime: 3_100_000, dirigeant: 'C. Maurin', telephone: '04 94 42 21 00' },
    { nom: 'Les 3 Dauphins', adresse: '9 Place des Trois Dauphins', etoiles: 1, chambres: 22, note_booking: 7.7, prix_nuit_moyen: 65, independant: true, prix_anormalement_bas: true, ca_estime: 220_000 },
    { nom: 'Hotel Little Palace', adresse: '6 Rue Berthelot', etoiles: 2, chambres: 16, note_booking: 7.7, prix_nuit_moyen: 70, independant: true, prix_anormalement_bas: true, ca_estime: 224_000 },
    { nom: 'Holiday Inn Toulon City Centre', adresse: 'Av. Vauban', etoiles: 4, chambres: 102, note_booking: 8.0, prix_nuit_moyen: 130, independant: false },
    { nom: 'Best Western Hôtel La Corniche', adresse: '17 Littoral Frédéric Mistral', etoiles: 4, chambres: 23, note_booking: 8.2, prix_nuit_moyen: 145, independant: false },
    { nom: 'Ibis Toulon La Seyne', adresse: 'La Seyne-sur-Mer', etoiles: 3, chambres: 75, note_booking: 7.9, prix_nuit_moyen: 95, independant: false },
  ],
  brokers_actifs: ['Christie & Co', 'JLL Hotels', 'Coldwell Banker'],
  sources_globales: SOURCES_DEFAUT,
}

const COLMAR: VilleDetail = {
  slug: 'colmar',
  ville: 'Colmar',
  region: 'Grand Est',
  dept: '68',
  gare_principale: 'Gare de Colmar',
  population: 70_000,
  population_metropole: 110_000,
  aire_attraction: 138_000,
  surface_km2: 66.57,
  nb_hotels_total: 48,
  nb_hotels_2etoiles: 12,
  nb_hotels_3etoiles: 24,
  nb_hotels_4etoiles: 12,
  nb_hotels_independants: 28,
  nb_chambres_total: 2_180,
  nuitees_an: 1_250_000,
  touristes_an: 850_000,
  saison_haute_mois: [11, 12, 6, 7, 8],
  ratio_loisir_pct: 75,
  ratio_business_pct: 15,
  ratio_mice_pct: 10,
  mice_evenements_an: 42,
  mice_visiteurs_an: 65,
  adr_moyen: 132,
  revpar_moyen: 92,
  note_booking_moyenne: 8.4,
  nb_entreprises: 7_800,
  nb_groupes_majeurs: 6,
  prix_m2_immobilier: 3_100,
  rendement_brut: 6.3,
  tendance_marche: 'hausse',
  score_attractivite: 82,
  resume_ia: "Pépite Alsacienne ultra-touristique. Saisonnalité bipolaire : Marché de Noël (ADR x2.5) + été. Ratio loisir/business très déséquilibré → cible Alfred « bureau corpo » risquée hors événements. Bouygues Immo en cours de transformation 65# **** sur Place de la Cathédrale (Kill du Weekly Anto). Concurrence haut de gamme limitée mais marché tendu sur prime location.",
  evenements: [
    { nom: 'Marché de Noël', type: 'saison_haute', mois_debut: 11, mois_fin: 12, impact_adr: 'haut' },
    { nom: 'Saison estivale', type: 'saison_haute', mois_debut: 6, mois_fin: 8, impact_adr: 'haut' },
    { nom: 'Foire aux Vins de Colmar', type: 'salon', mois_debut: 7, mois_fin: 8, impact_adr: 'haut' },
    { nom: 'Festival International de Musique', type: 'festival', mois_debut: 7, mois_fin: 7, impact_adr: 'moyen' },
  ],
  projets: [
    { titre: 'Pôle Gare — refonte parvis', categorie: 'transport', echeance: '2026', impact: 'moyen' },
    { titre: 'Plan vélo & piétonnisation centre', categorie: 'urbanisme', echeance: '2026-2027', impact: 'faible' },
  ],
  hotels: [
    { nom: 'Hôtel Le Maréchal', adresse: '4 Place des Six Montagnes Noires', etoiles: 4, chambres: 30, note_booking: 8.9, prix_nuit_moyen: 195, independant: true },
    { nom: 'Hôtel Quatorze', adresse: '14 Rue des Augustins', etoiles: 4, chambres: 14, note_booking: 9.1, prix_nuit_moyen: 245, independant: true },
    { nom: 'Hôtel Saint-Martin', adresse: '38 Grand Rue', etoiles: 3, chambres: 40, note_booking: 8.4, prix_nuit_moyen: 145, independant: true },
    { nom: 'Mercure Colmar Centre Unterlinden', adresse: '15 Rue Golbéry', etoiles: 4, chambres: 76, note_booking: 8.5, prix_nuit_moyen: 175, independant: false },
  ],
  brokers_actifs: ['Christie & Co', 'BNP Real Estate'],
  sources_globales: SOURCES_DEFAUT,
}

const DIJON: VilleDetail = {
  slug: 'dijon',
  ville: 'Dijon',
  region: 'Bourgogne-Franche-Comté',
  dept: '21',
  gare_principale: 'Gare de Dijon-Ville',
  population: 159_000,
  population_metropole: 260_000,
  aire_attraction: 380_000,
  surface_km2: 40.41,
  nb_hotels_total: 74,
  nb_hotels_2etoiles: 22,
  nb_hotels_3etoiles: 36,
  nb_hotels_4etoiles: 16,
  nb_hotels_independants: 41,
  nb_chambres_total: 3_650,
  nuitees_an: 1_580_000,
  touristes_an: 1_100_000,
  saison_haute_mois: [9, 10, 5],
  ratio_loisir_pct: 50,
  ratio_business_pct: 35,
  ratio_mice_pct: 15,
  mice_evenements_an: 96,
  mice_visiteurs_an: 180,
  adr_moyen: 105,
  revpar_moyen: 71,
  note_booking_moyenne: 8.0,
  nb_entreprises: 22_400,
  nb_groupes_majeurs: 19,
  prix_m2_immobilier: 2_950,
  rendement_brut: 5.9,
  tendance_marche: 'stable',
  score_attractivite: 73,
  resume_ia: "Capitale gastronomique en repositionnement (Cité Internationale de la Gastronomie ouverte 2022). 2 actifs sur le marché : Hôtel Montchapet** (42#, 2.2M€ travaux) et Hôtel de Paris** (37# face à la gare, état moyen). Localisation gare = ++, état hôtels = --. Marché stable, peu de pression concurrentielle. Cible Alfred 3-4* gare très pertinente, repositionnement nécessaire.",
  evenements: [
    { nom: 'Foire Internationale et Gastronomique', type: 'salon', mois_debut: 11, mois_fin: 11, impact_adr: 'haut' },
    { nom: 'Vendanges de l\'Or', type: 'culturel', mois_debut: 9, mois_fin: 9, impact_adr: 'moyen' },
    { nom: 'Vente des Vins des Hospices de Beaune', type: 'culturel', mois_debut: 11, mois_fin: 11, impact_adr: 'haut' },
  ],
  projets: [
    { titre: 'Cité Internationale de la Gastronomie & Vin', categorie: 'equipement', echeance: 'Ouverte 2022', impact: 'fort' },
    { titre: 'OnDijon — smart city, premier de France', categorie: 'urbanisme', echeance: 'En cours', impact: 'moyen' },
    { titre: 'Tram T3 — extension', categorie: 'transport', echeance: '2027', impact: 'moyen' },
  ],
  hotels: [
    { nom: 'Hôtel Montchapet', adresse: '26 Rue Jacques Cellerier', etoiles: 2, chambres: 42, note_booking: 7.9, prix_nuit_moyen: 75, independant: true, ca_estime: 0, dirigeant: 'P. Cellerier' },
    { nom: 'Hôtel de Paris', adresse: '9 Av. Maréchal Foch', etoiles: 2, chambres: 37, note_booking: 6.7, prix_nuit_moyen: 70, independant: true },
    { nom: 'Sofitel La Cloche Dijon', adresse: '14 Place Darcy', etoiles: 5, chambres: 69, note_booking: 8.6, prix_nuit_moyen: 280, independant: false },
    { nom: 'Mercure Dijon Centre Clémenceau', adresse: '22 Bd de la Marne', etoiles: 4, chambres: 121, note_booking: 8.0, prix_nuit_moyen: 115, independant: false },
  ],
  brokers_actifs: ['Christie & Co', 'Coldwell Banker'],
  sources_globales: SOURCES_DEFAUT,
}

const NICE: VilleDetail = {
  slug: 'nice',
  ville: 'Nice',
  region: "Provence-Alpes-Côte d'Azur",
  dept: '06',
  gare_principale: 'Gare de Nice-Ville',
  population: 343_000,
  population_metropole: 547_000,
  aire_attraction: 1_010_000,
  surface_km2: 71.92,
  nb_hotels_total: 235,
  nb_hotels_2etoiles: 48,
  nb_hotels_3etoiles: 105,
  nb_hotels_4etoiles: 68,
  nb_hotels_independants: 142,
  nb_chambres_total: 12_580,
  nuitees_an: 5_200_000,
  touristes_an: 5_000_000,
  saison_haute_mois: [5, 6, 7, 8, 9],
  ratio_loisir_pct: 65,
  ratio_business_pct: 20,
  ratio_mice_pct: 15,
  mice_evenements_an: 312,
  mice_visiteurs_an: 540,
  adr_moyen: 168,
  revpar_moyen: 112,
  note_booking_moyenne: 8.2,
  nb_entreprises: 71_500,
  nb_groupes_majeurs: 38,
  prix_m2_immobilier: 5_800,
  rendement_brut: 5.1,
  tendance_marche: 'hausse',
  score_attractivite: 88,
  resume_ia: "Marché ultra-concurrentiel (235 hôtels) mais très dynamique. Aéroport 14M passagers/an, MICE en croissance. Hôtel St Georges**** (34# sur 13M€) signalé sur le marché — possibilité de monter à 50# avec rachat fonds resto. Hotel Le Carlone* (28# sur 5M€) à 200m plage = transformation 3* envisageable. Villa Otéro**** (segment Honotel) seul actif à vrai potentiel d'upside. Cible Alfred 3-4* corpo : viable hors saison haute, ADR très favorable.",
  evenements: [
    { nom: 'Carnaval de Nice', type: 'festival', mois_debut: 2, mois_fin: 3, impact_adr: 'haut' },
    { nom: 'Saison estivale Côte d\'Azur', type: 'saison_haute', mois_debut: 5, mois_fin: 9, impact_adr: 'haut' },
    { nom: 'Nice Jazz Festival', type: 'festival', mois_debut: 7, mois_fin: 7, impact_adr: 'haut' },
    { nom: 'IMEX (MICE)', type: 'congres', mois_debut: 5, mois_fin: 5, impact_adr: 'moyen' },
    { nom: 'OGC Nice — saison Ligue 1', type: 'sport', mois_debut: 8, mois_fin: 5, impact_adr: 'bas' },
  ],
  projets: [
    { titre: 'Ligne 5 Tramway — études', categorie: 'transport', echeance: '2030', impact: 'moyen' },
    { titre: 'Eco-Vallée Plaine du Var', categorie: 'urbanisme', echeance: 'En cours', impact: 'fort' },
    { titre: 'Aéroport Nice Côte d\'Azur — terminal 3', categorie: 'transport', echeance: '2028', impact: 'fort' },
  ],
  hotels: [
    { nom: 'Hotel St Georges', adresse: '7 Av. Georges Clemenceau', etoiles: 4, chambres: 34, note_booking: 7.4, prix_nuit_moyen: 175, independant: true, dirigeant: 'M. Vincenti' },
    { nom: 'Hotel Le Carlone', adresse: '2 Bd François Grosso', etoiles: 1, chambres: 28, note_booking: 7.2, prix_nuit_moyen: 95, independant: true, prix_anormalement_bas: true },
    { nom: 'Villa Otéro', adresse: 'Promenade des Anglais', etoiles: 4, chambres: 88, note_booking: 8.1, prix_nuit_moyen: 220, independant: false },
    { nom: 'Le Negresco', adresse: '37 Promenade des Anglais', etoiles: 5, chambres: 124, note_booking: 8.6, prix_nuit_moyen: 480, independant: true },
    { nom: 'Anantara Plaza Nice', adresse: '12 Av. de Verdun', etoiles: 5, chambres: 151, note_booking: 8.7, prix_nuit_moyen: 395, independant: false },
  ],
  brokers_actifs: ['Christie & Co', 'JLL Hotels', 'CBRE Hotels', 'Honotel'],
  sources_globales: SOURCES_DEFAUT,
}

const NANTES: VilleDetail = {
  slug: 'nantes',
  ville: 'Nantes',
  region: 'Pays de la Loire',
  dept: '44',
  gare_principale: 'Gare de Nantes',
  population: 320_000,
  population_metropole: 670_000,
  aire_attraction: 1_010_000,
  surface_km2: 65.19,
  nb_hotels_total: 142,
  nb_hotels_2etoiles: 38,
  nb_hotels_3etoiles: 72,
  nb_hotels_4etoiles: 32,
  nb_hotels_independants: 78,
  nb_chambres_total: 6_980,
  nuitees_an: 2_200_000,
  touristes_an: 1_400_000,
  saison_haute_mois: [6, 7, 8, 9],
  ratio_loisir_pct: 50,
  ratio_business_pct: 35,
  ratio_mice_pct: 15,
  mice_evenements_an: 154,
  mice_visiteurs_an: 280,
  adr_moyen: 108,
  revpar_moyen: 73,
  note_booking_moyenne: 8.1,
  nb_entreprises: 56_300,
  nb_groupes_majeurs: 31,
  prix_m2_immobilier: 4_100,
  rendement_brut: 5.5,
  tendance_marche: 'hausse',
  score_attractivite: 79,
  resume_ia: "Métropole en forte croissance, 2h Paris en TGV. Hôtel Voltaire Opéra*** (37# face gare) signalé comme localisation idéale corpo — TrevPAR 35k€. Marché business sain, demande tertiaire/tech soutenue (Atlanpole, French Tech). Cible Alfred 3-4* corpo : très adaptée, peu de très bons indépendants disponibles.",
  evenements: [
    { nom: 'Voyage à Nantes', type: 'culturel', mois_debut: 6, mois_fin: 9, impact_adr: 'haut' },
    { nom: 'La Folle Journée', type: 'festival', mois_debut: 1, mois_fin: 2, impact_adr: 'moyen' },
    { nom: 'Hellfest (Clisson)', type: 'festival', mois_debut: 6, mois_fin: 6, impact_adr: 'haut' },
    { nom: 'FC Nantes — saison Ligue 1', type: 'sport', mois_debut: 8, mois_fin: 5, impact_adr: 'bas' },
  ],
  projets: [
    { titre: 'YelloPark — nouveau stade et quartier', categorie: 'urbanisme', echeance: '2030', impact: 'fort' },
    { titre: 'CHU sur l\'Île de Nantes', categorie: 'equipement', echeance: '2027', impact: 'fort' },
    { titre: 'Tram-train Nantes-Châteaubriant', categorie: 'transport', echeance: '2026', impact: 'moyen' },
  ],
  hotels: [
    { nom: 'Hotel Voltaire Opéra', adresse: '10 Rue Gresset', etoiles: 3, chambres: 37, note_booking: 8.8, prix_nuit_moyen: 115, independant: true },
    { nom: 'Sozo Hotel', adresse: '16 Rue Frédéric Cailliaud', etoiles: 4, chambres: 24, note_booking: 9.0, prix_nuit_moyen: 195, independant: true },
    { nom: 'Okko Hotels Nantes Château', adresse: '15bis Rue de Strasbourg', etoiles: 4, chambres: 80, note_booking: 8.9, prix_nuit_moyen: 145, independant: false },
    { nom: 'Mercure Nantes Centre Gare', adresse: '4 Bd Stalingrad', etoiles: 4, chambres: 102, note_booking: 8.2, prix_nuit_moyen: 135, independant: false },
  ],
  brokers_actifs: ['Christie & Co', 'BNP Real Estate', 'JLL Hotels'],
  sources_globales: SOURCES_DEFAUT,
}

// ──────────────────────────────────────────────────────────────────────
// 6 villes en attente d'enrichissement (data partielle)
// ──────────────────────────────────────────────────────────────────────

const VILLES_LIGHT: VilleDetail[] = [
  {
    slug: 'metz', ville: 'Metz', region: 'Grand Est', dept: '57', gare_principale: 'Gare de Metz-Ville',
    population: 117_000, population_metropole: 220_000, aire_attraction: 390_000, surface_km2: 41.94,
    nb_hotels_total: 56, nb_hotels_2etoiles: 16, nb_hotels_3etoiles: 28, nb_hotels_4etoiles: 12,
    nb_hotels_independants: 31, nb_chambres_total: 2_650,
    nuitees_an: 920_000, touristes_an: 720_000, saison_haute_mois: [11, 12, 5, 6],
    ratio_loisir_pct: 50, ratio_business_pct: 40, ratio_mice_pct: 10,
    mice_evenements_an: 78, mice_visiteurs_an: 120,
    adr_moyen: 96, revpar_moyen: 64, note_booking_moyenne: 8.0,
    nb_entreprises: 14_800, nb_groupes_majeurs: 11,
    prix_m2_immobilier: 2_400, rendement_brut: 6.5, tendance_marche: 'stable',
    score_attractivite: 70,
    resume_ia: "Marché business actif (Centre Pompidou-Metz, frontière Lux). Ibis Styles Centre Gare (72#, 9M€) en pipeline Alfred. Bonne cible Alfred — peu de concurrence haut de gamme, corpo Lux solide.",
    evenements: [
      { nom: 'Marché de Noël', type: 'saison_haute', mois_debut: 11, mois_fin: 12, impact_adr: 'haut' },
      { nom: 'Mirabelle de Metz', type: 'culturel', mois_debut: 8, mois_fin: 9, impact_adr: 'moyen' },
    ],
    projets: [{ titre: 'Mettis BHNS — extension', categorie: 'transport', echeance: '2027', impact: 'moyen' }],
    hotels: [
      { nom: 'Ibis Styles Centre Gare', adresse: '23 Av. Foch', etoiles: 3, chambres: 72, note_booking: 8.1, prix_nuit_moyen: 105, independant: true, ca_estime: 1_900_000 },
      { nom: 'Hotel Alérion', adresse: 'Pl. du Général de Gaulle', etoiles: 2, chambres: 41, note_booking: 5.8, prix_nuit_moyen: 70, independant: true, ca_estime: 600_000 },
    ],
    brokers_actifs: ['Christie & Co'], sources_globales: SOURCES_DEFAUT,
  },
  {
    slug: 'pau', ville: 'Pau', region: 'Nouvelle-Aquitaine', dept: '64', gare_principale: 'Gare de Pau',
    population: 75_000, population_metropole: 162_000, aire_attraction: 248_000, surface_km2: 31.51,
    nb_hotels_total: 38, nb_hotels_2etoiles: 12, nb_hotels_3etoiles: 18, nb_hotels_4etoiles: 8,
    nb_hotels_independants: 22, nb_chambres_total: 1_680,
    nuitees_an: 480_000, touristes_an: 360_000, saison_haute_mois: [7, 8],
    ratio_loisir_pct: 55, ratio_business_pct: 35, ratio_mice_pct: 10,
    mice_evenements_an: 38, mice_visiteurs_an: 52,
    adr_moyen: 92, revpar_moyen: 58, note_booking_moyenne: 7.9,
    nb_entreprises: 9_400, nb_groupes_majeurs: 7,
    prix_m2_immobilier: 2_100, rendement_brut: 6.8, tendance_marche: 'stable',
    score_attractivite: 64,
    resume_ia: "Hotel Le Bourbon** (31# possible R+4 = +9#) en pipeline Alfred. Marché modeste mais stable, bon potentiel pour cible Alfred sur acquisition modérée.",
    evenements: [
      { nom: 'Grand Prix de Pau Historique', type: 'sport', mois_debut: 5, mois_fin: 5, impact_adr: 'haut' },
      { nom: 'Festival des Émotions', type: 'festival', mois_debut: 6, mois_fin: 6, impact_adr: 'moyen' },
    ],
    projets: [{ titre: 'Halle aux Vins — réhabilitation', categorie: 'urbanisme', echeance: '2026', impact: 'moyen' }],
    hotels: [
      { nom: 'Hotel Le Bourbon', adresse: '12 Pl. Georges Clemenceau', etoiles: 2, chambres: 31, note_booking: 7.6, prix_nuit_moyen: 85, independant: true },
    ],
    brokers_actifs: ['Coldwell Banker'], sources_globales: SOURCES_DEFAUT,
  },
  {
    slug: 'la-rochelle', ville: 'La Rochelle', region: 'Nouvelle-Aquitaine', dept: '17', gare_principale: 'Gare de La Rochelle',
    population: 78_000, population_metropole: 175_000, aire_attraction: 220_000, surface_km2: 28.43,
    nb_hotels_total: 62, nb_hotels_2etoiles: 18, nb_hotels_3etoiles: 32, nb_hotels_4etoiles: 12,
    nb_hotels_independants: 38, nb_chambres_total: 2_350,
    nuitees_an: 1_120_000, touristes_an: 950_000, saison_haute_mois: [6, 7, 8, 9],
    ratio_loisir_pct: 75, ratio_business_pct: 15, ratio_mice_pct: 10,
    mice_evenements_an: 41, mice_visiteurs_an: 68,
    adr_moyen: 124, revpar_moyen: 88, note_booking_moyenne: 8.3,
    nb_entreprises: 11_500, nb_groupes_majeurs: 6,
    prix_m2_immobilier: 4_650, rendement_brut: 5.4, tendance_marche: 'hausse',
    score_attractivite: 75,
    resume_ia: "Hotel Le Champlain**** (41#) en pipeline. Marché loisir dominant, concurrence forte été, faible hors-saison. Cible Alfred bureau corpo : limitée à 6 mois/an, pas idéale.",
    evenements: [
      { nom: 'Francofolies', type: 'festival', mois_debut: 7, mois_fin: 7, impact_adr: 'haut' },
      { nom: 'Grand Pavois', type: 'salon', mois_debut: 9, mois_fin: 9, impact_adr: 'haut' },
    ],
    projets: [{ titre: 'Ile de Ré — pont gratuit hors saison', categorie: 'transport', echeance: '2027', impact: 'moyen' }],
    hotels: [{ nom: 'Hotel Le Champlain', adresse: '30 Rue Rambaud', etoiles: 4, chambres: 41, note_booking: 8.8, prix_nuit_moyen: 175, independant: true, ca_estime: 1_700_000 }],
    brokers_actifs: ['Christie & Co', 'JLL'], sources_globales: SOURCES_DEFAUT,
  },
  {
    slug: 'reims', ville: 'Reims', region: 'Grand Est', dept: '51', gare_principale: 'Gare de Reims',
    population: 182_000, population_metropole: 318_000, aire_attraction: 348_000, surface_km2: 47.02,
    nb_hotels_total: 88, nb_hotels_2etoiles: 24, nb_hotels_3etoiles: 42, nb_hotels_4etoiles: 22,
    nb_hotels_independants: 52, nb_chambres_total: 4_180,
    nuitees_an: 1_350_000, touristes_an: 1_080_000, saison_haute_mois: [5, 6, 9, 10],
    ratio_loisir_pct: 55, ratio_business_pct: 30, ratio_mice_pct: 15,
    mice_evenements_an: 92, mice_visiteurs_an: 165,
    adr_moyen: 118, revpar_moyen: 78, note_booking_moyenne: 8.2,
    nb_entreprises: 16_200, nb_groupes_majeurs: 14,
    prix_m2_immobilier: 2_750, rendement_brut: 5.8, tendance_marche: 'stable',
    score_attractivite: 71,
    resume_ia: "Capitale du champagne — tourisme business UNESCO + viticole haut de gamme. Bon mix corpo/loisir. Marché peu d'actifs disponibles côté Alfred.",
    evenements: [
      { nom: 'Vendanges en Champagne', type: 'culturel', mois_debut: 9, mois_fin: 10, impact_adr: 'haut' },
      { nom: 'Reims Sessions', type: 'congres', mois_debut: 5, mois_fin: 5, impact_adr: 'moyen' },
    ],
    projets: [{ titre: 'Tram extension Sud', categorie: 'transport', echeance: '2028', impact: 'moyen' }],
    hotels: [],
    brokers_actifs: ['Christie & Co'], sources_globales: SOURCES_DEFAUT,
  },
  {
    slug: 'tours', ville: 'Tours', region: 'Centre-Val de Loire', dept: '37', gare_principale: 'Gare de Tours',
    population: 138_000, population_metropole: 295_000, aire_attraction: 510_000, surface_km2: 36.74,
    nb_hotels_total: 78, nb_hotels_2etoiles: 22, nb_hotels_3etoiles: 38, nb_hotels_4etoiles: 18,
    nb_hotels_independants: 45, nb_chambres_total: 3_420,
    nuitees_an: 1_180_000, touristes_an: 920_000, saison_haute_mois: [5, 6, 7, 8, 9],
    ratio_loisir_pct: 60, ratio_business_pct: 30, ratio_mice_pct: 10,
    mice_evenements_an: 64, mice_visiteurs_an: 105,
    adr_moyen: 102, revpar_moyen: 68, note_booking_moyenne: 8.1,
    nb_entreprises: 14_800, nb_groupes_majeurs: 9,
    prix_m2_immobilier: 2_950, rendement_brut: 6.0, tendance_marche: 'stable',
    score_attractivite: 69,
    resume_ia: "Porte des Châteaux de la Loire — 1h Paris TGV. Tissu business universitaire/santé. Marché stable, opportunités à sourcer.",
    evenements: [{ nom: 'Saison Châteaux Loire', type: 'saison_haute', mois_debut: 4, mois_fin: 10, impact_adr: 'moyen' }],
    projets: [], hotels: [], brokers_actifs: [], sources_globales: SOURCES_DEFAUT,
  },
  {
    slug: 'le-havre', ville: 'Le Havre', region: 'Normandie', dept: '76', gare_principale: 'Gare du Havre',
    population: 168_000, population_metropole: 270_000, aire_attraction: 290_000, surface_km2: 46.95,
    nb_hotels_total: 64, nb_hotels_2etoiles: 22, nb_hotels_3etoiles: 28, nb_hotels_4etoiles: 14,
    nb_hotels_independants: 38, nb_chambres_total: 2_780,
    nuitees_an: 720_000, touristes_an: 580_000, saison_haute_mois: [6, 7, 8],
    ratio_loisir_pct: 45, ratio_business_pct: 45, ratio_mice_pct: 10,
    mice_evenements_an: 52, mice_visiteurs_an: 78,
    adr_moyen: 92, revpar_moyen: 60, note_booking_moyenne: 7.9,
    nb_entreprises: 13_900, nb_groupes_majeurs: 17,
    prix_m2_immobilier: 2_250, rendement_brut: 6.6, tendance_marche: 'stable',
    score_attractivite: 67,
    resume_ia: "Port maritime majeur, UNESCO Auguste Perret. Tissu business industriel/maritime fort. Marché de niche — cible Alfred corpo viable.",
    evenements: [
      { nom: 'Transat Jacques Vabre', type: 'sport', mois_debut: 10, mois_fin: 11, impact_adr: 'haut' },
      { nom: 'Un Été Au Havre', type: 'culturel', mois_debut: 6, mois_fin: 9, impact_adr: 'moyen' },
    ],
    projets: [{ titre: 'Smart Port — modernisation portuaire', categorie: 'transport', echeance: '2027', impact: 'fort' }],
    hotels: [], brokers_actifs: [], sources_globales: SOURCES_DEFAUT,
  },
]

export const VILLES: VilleDetail[] = [
  STRASBOURG,
  TOULON,
  COLMAR,
  DIJON,
  NICE,
  NANTES,
  ...VILLES_LIGHT,
]

export const VILLES_PRIORITAIRES_HMA = ['strasbourg', 'colmar', 'dijon', 'toulon', 'nice', 'nantes']

export function getVille(slug: string): VilleDetail | undefined {
  return VILLES.find(v => v.slug === slug)
}

// Helpers ratios
export const ratioHotelsParKm2 = (v: VilleDetail) => v.nb_hotels_total / v.surface_km2
export const ratioIndependantsParKm2 = (v: VilleDetail) => v.nb_hotels_independants / v.surface_km2
export const ratio2EtoilesParKm2 = (v: VilleDetail) => v.nb_hotels_2etoiles / v.surface_km2
export const ratio3EtoilesParKm2 = (v: VilleDetail) => v.nb_hotels_3etoiles / v.surface_km2
export const ratio4EtoilesParKm2 = (v: VilleDetail) => v.nb_hotels_4etoiles / v.surface_km2
export const ratioTouristesParKm2 = (v: VilleDetail) => v.touristes_an / v.surface_km2
export const ratioMiceParKm2 = (v: VilleDetail) => v.mice_evenements_an / v.surface_km2
export const ratioEntreprisesParHotel = (v: VilleDetail) => v.nb_entreprises / v.nb_hotels_total
export const conjectureTouristesXHotelsParKm2 = (v: VilleDetail) =>
  (v.touristes_an * v.nb_hotels_total) / (v.surface_km2 * v.surface_km2)

export const MOIS_LABELS = ['', 'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jui', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']

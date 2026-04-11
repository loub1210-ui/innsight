// ─── Opportunités (RADAR) ─────────────────────────────────────────────────────

export type ClasseActif =
  | 'hotel'
  | 'appart_hotel'
  | 'camping'
  | 'auberge'
  | 'gite'
  | 'villa'
  | 'maison_hotes'
  | 'coliving'
  | 'self_stockage'
  | 'dark_kitchen'
  | 'parking_pl'
  | 'immeuble'
  | 'autre'

export type StatutOpportunite = 'nouvelle' | 'en_analyse' | 'qualifiee' | 'archivee'

export interface Opportunite {
  id: string
  user_id: string
  nom: string
  commune: string
  dept_code: string
  region_code: string | null
  adresse: string | null
  classe_actif: ClasseActif
  prix_demande: number | null
  surface_m2: number | null
  nombre_chambres: number | null
  revpar_estime: number | null
  taux_occupation_estime: number | null
  dpe_classe: ClasseDPE | null
  keyscore: number | null
  keyscore_details: Record<string, unknown> | null
  statut: StatutOpportunite
  url_source: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

// ─── Actifs portefeuille (PORTFOLIO) ─────────────────────────────────────────

export type StatutActif = 'actif' | 'en_acquisition' | 'en_renovation' | 'vendu'

export type ClasseDPE = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G'

export interface ActifPortefeuille {
  id: string
  user_id: string
  nom: string
  commune: string
  adresse: string | null
  dept_code: string
  region_code: string
  classe_actif: ClasseActif
  statut: StatutActif
  surface_m2: number | null
  date_acquisition: string | null
  prix_acquisition: number
  frais_notaire: number
  cout_travaux: number
  valeur_estimee: number | null
  revenus_annuels: number
  charges_annuelles: number
  mensualite_credit: number | null
  dpe_classe: ClasseDPE | null
  huwart_conforme: boolean | null
  huwart_echeance: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type ActifPortefeuilleInsert = Omit<ActifPortefeuille, 'id' | 'user_id' | 'created_at' | 'updated_at'>
export type ActifPortefeuilleUpdate = Partial<ActifPortefeuilleInsert>

// ─── Benchmarks ───────────────────────────────────────────────────────────────

export interface BenchmarkRegional {
  id: string
  region_code: string
  dept_code: string | null
  classe_actif: ClasseActif
  prix_m2_p25: number
  prix_m2_p50: number
  prix_m2_p75: number
  annee: number
}

// ─── Labels ───────────────────────────────────────────────────────────────────

export const CLASSE_ACTIF_LABELS: Record<ClasseActif, string> = {
  hotel:          'Hôtel',
  appart_hotel:   'Appart-hôtel',
  camping:        'Camping',
  auberge:        'Auberge',
  gite:           'Gîte',
  villa:          'Villa',
  maison_hotes:   'Maison d\'hôtes',
  coliving:       'Coliving',
  self_stockage:  'Self-stockage',
  dark_kitchen:   'Dark Kitchen',
  parking_pl:     'Parking PL',
  immeuble:       'Immeuble',
  autre:          'Autre',
}

export const STATUT_ACTIF_LABELS: Record<StatutActif, string> = {
  actif:          'Actif',
  en_acquisition: 'En acquisition',
  en_renovation:  'En rénovation',
  vendu:          'Vendu',
}

export const DPE_COLORS: Record<ClasseDPE, string> = {
  A: '#22c55e', B: '#84cc16', C: '#eab308',
  D: '#f97316', E: '#ef4444', F: '#dc2626', G: '#991b1b',
}

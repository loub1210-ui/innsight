// ─── Opportunités (RADAR) ─────────────────────────────────────────────────────

export type ClasseActif =
  | 'hotel_existant'
  | 'hotel_distressed'
  | 'marchand_biens'
  | 'coliving'
  | 'self_stockage'
  | 'dark_kitchen'
  | 'parking_pl'
  | 'camping'

export type StatutOpportunite = 'nouvelle' | 'en_analyse' | 'qualifiee' | 'archivee'

export interface Opportunite {
  id: string
  titre: string
  commune: string
  dept_code: string
  region_code: string
  classe_actif: ClasseActif
  prix_affiche: number
  surface_m2: number | null
  keyscore: number
  statut: StatutOpportunite
  decote_vs_benchmark: number | null
  rendement_brut_estime: number | null
  source_url: string | null
  description: string | null
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
  hotel_existant:   'Hôtel existant',
  hotel_distressed: 'Hôtel distressed',
  marchand_biens:   'Marchand de biens',
  coliving:         'Coliving',
  self_stockage:    'Self-stockage',
  dark_kitchen:     'Dark Kitchen',
  parking_pl:       'Parking PL',
  camping:          'Camping',
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

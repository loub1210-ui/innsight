import { createClient } from '@/lib/supabase/client'
import type { Opportunite, ClasseActif, StatutOpportunite } from '@/types'

export interface FiltresOpportunites {
  region_code?: string
  classe_actif?: ClasseActif
  statut?: StatutOpportunite
  keyscore_min?: number
  prix_max?: number
  search?: string
}

export async function fetchOpportunites(filtres: FiltresOpportunites = {}): Promise<Opportunite[]> {
  const supabase = createClient()
  let query = supabase
    .from('opportunites')
    .select('*')
    .order('keyscore', { ascending: false })

  if (filtres.region_code) query = query.eq('region_code', filtres.region_code)
  if (filtres.classe_actif) query = query.eq('classe_actif', filtres.classe_actif)
  if (filtres.statut) query = query.eq('statut', filtres.statut)
  if (filtres.keyscore_min) query = query.gte('keyscore', filtres.keyscore_min)
  if (filtres.prix_max) query = query.lte('prix_affiche', filtres.prix_max)
  if (filtres.search) query = query.ilike('titre', `%${filtres.search}%`)

  const { data, error } = await query.limit(100)
  if (error) throw error
  return data ?? []
}

export async function fetchOpportuniteById(id: string): Promise<Opportunite | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('opportunites')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return null
  return data
}

export async function updateOpportuniteStatut(id: string, statut: StatutOpportunite): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('opportunites')
    .update({ statut, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

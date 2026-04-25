/**
 * Couche d'accès aux credentials d'intégration. Server-side uniquement.
 */

import { createClient } from '@/lib/supabase/server'
import { encryptJson, decryptJson } from './crypto'

export interface IntegrationStatus {
  service: string
  is_active: boolean
  is_configured: boolean
  last_test_at: string | null
  last_test_status: 'ok' | 'fail' | 'untested' | null
  last_test_message: string | null
  last_used_at: string | null
}

export async function listStatuses(): Promise<IntegrationStatus[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('api_integrations')
    .select('service, is_active, credentials_enc, last_test_at, last_test_status, last_test_message, last_used_at')
  if (error) throw error
  return (data ?? []).map(row => ({
    service: row.service as string,
    is_active: row.is_active as boolean,
    is_configured: row.credentials_enc != null,
    last_test_at: row.last_test_at as string | null,
    last_test_status: row.last_test_status as IntegrationStatus['last_test_status'],
    last_test_message: row.last_test_message as string | null,
    last_used_at: row.last_used_at as string | null,
  }))
}

export async function saveCredentials(service: string, fields: Record<string, string>): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non authentifié')

  const enc = encryptJson(fields)
  const { error } = await supabase
    .from('api_integrations')
    .upsert({
      user_id: user.id,
      service,
      credentials_enc: enc,
      is_active: true,
      last_test_status: 'untested',
      last_test_message: null,
    }, { onConflict: 'user_id,service' })
  if (error) throw error
}

export async function deleteCredentials(service: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.from('api_integrations').delete().eq('service', service)
  if (error) throw error
}

export async function setActive(service: string, isActive: boolean): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('api_integrations')
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq('service', service)
  if (error) throw error
}

export async function recordTest(service: string, ok: boolean, message: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('api_integrations')
    .update({
      last_test_at: new Date().toISOString(),
      last_test_status: ok ? 'ok' : 'fail',
      last_test_message: message,
    })
    .eq('service', service)
  if (error) throw error
}

/**
 * Renvoie les credentials déchiffrés pour un service. Server-side uniquement.
 * Fallback sur les variables d'environnement si la clé n'est pas en base.
 */
export async function getCredentials<T extends Record<string, string> = Record<string, string>>(
  service: string,
): Promise<T | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('api_integrations')
    .select('credentials_enc, is_active')
    .eq('service', service)
    .maybeSingle()

  if (data?.credentials_enc && data.is_active) {
    const blob = data.credentials_enc as Buffer | string
    const buf = typeof blob === 'string'
      ? Buffer.from(blob.replace(/^\\x/, ''), 'hex')
      : Buffer.from(blob)
    return decryptJson<T>(buf)
  }

  // Fallback sur les variables d'environnement (ex: ANTHROPIC_API_KEY)
  const envKey = `${service.toUpperCase()}_API_KEY`
  if (process.env[envKey]) {
    return { api_key: process.env[envKey] } as unknown as T
  }
  return null
}

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCredentials, recordTest } from '@/lib/integrations/store'
import { testIntegration } from '@/lib/integrations/testers'
import { getIntegration } from '@/lib/integrations/registry'

export async function POST(
  request: NextRequest,
  { params }: { params: { service: string } },
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const def = getIntegration(params.service)
  if (!def) return NextResponse.json({ error: 'service inconnu' }, { status: 404 })

  // Permet de tester depuis le formulaire AVANT enregistrement
  let creds: Record<string, string> | null = null
  try {
    const body = await request.json() as { fields?: Record<string, string> }
    if (body.fields) creds = body.fields
  } catch {
    // pas de body : on lit en base
  }
  if (!creds) creds = await getCredentials(params.service) ?? {}

  const result = await testIntegration(params.service, creds)
  // Enregistre en base seulement si déjà configuré
  try {
    await recordTest(params.service, result.ok, result.message)
  } catch {
    // Pas grave si pas encore en base
  }
  return NextResponse.json(result)
}

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { saveCredentials, deleteCredentials, setActive } from '@/lib/integrations/store'
import { getIntegration } from '@/lib/integrations/registry'

async function requireUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { service: string } },
) {
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const def = getIntegration(params.service)
  if (!def) return NextResponse.json({ error: 'service inconnu' }, { status: 404 })

  const body = await request.json() as { fields?: Record<string, string>; is_active?: boolean }

  // Toggle activation seul
  if (body.is_active !== undefined && !body.fields) {
    await setActive(params.service, body.is_active)
    return NextResponse.json({ ok: true })
  }

  // Sauvegarde des credentials
  const fields = body.fields ?? {}
  for (const f of def.fields ?? []) {
    if (f.required && !fields[f.name]) {
      return NextResponse.json({ error: `Champ requis : ${f.label}` }, { status: 400 })
    }
  }

  await saveCredentials(params.service, fields)
  return NextResponse.json({ ok: true })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { service: string } },
) {
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  await deleteCredentials(params.service)
  return NextResponse.json({ ok: true })
}

import { NextResponse } from 'next/server'
import { listStatuses } from '@/lib/integrations/store'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const statuses = await listStatuses()
  return NextResponse.json({ statuses })
}

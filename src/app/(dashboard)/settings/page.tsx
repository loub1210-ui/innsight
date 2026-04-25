import { Settings } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { listStatuses } from '@/lib/integrations/store'
import { IntegrationsManager } from '@/components/settings/IntegrationsManager'

export const metadata = { title: 'Paramètres' }

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let statuses: Awaited<ReturnType<typeof listStatuses>> = []
  try {
    statuses = await listStatuses()
  } catch {
    // Table peut ne pas exister à la première installation
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="flex items-center gap-3 px-8 h-16 border-b border-surface-border flex-shrink-0">
        <Settings className="w-5 h-5 text-brand-400" />
        <h1 className="text-lg font-semibold text-white">Paramètres</h1>
        <span className="text-sm text-slate-400">Compte & intégrations API</span>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Compte */}
          <section className="bg-surface-card border border-surface-border rounded-xl p-6">
            <h2 className="text-sm font-semibold text-white mb-4">Compte</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">Email</p>
                <p className="text-sm text-white">{user?.email}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">ID utilisateur</p>
                <p className="text-xs text-slate-400 font-mono break-all">{user?.id}</p>
              </div>
            </div>
          </section>

          {/* Intégrations */}
          <IntegrationsManager initialStatuses={statuses} />

          {/* Footer */}
          <section className="bg-surface-card border border-surface-border rounded-xl p-6">
            <h2 className="text-sm font-semibold text-white mb-2">À propos</h2>
            <p className="text-sm text-slate-400">InnSight v0.2.0 — Intelligence Foncière Hôtelière</p>
            <p className="text-xs text-slate-500 mt-1">
              Les clés API sont chiffrées (AES-256-GCM) avant stockage. Elles ne sont jamais exposées au navigateur.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

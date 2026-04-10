import { Settings } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export const metadata = { title: 'Paramètres' }

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="flex flex-col h-screen">
      <div className="flex items-center gap-3 px-8 h-16 border-b border-surface-border flex-shrink-0">
        <Settings className="w-5 h-5 text-brand-400" />
        <h1 className="text-lg font-semibold text-white">Paramètres</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-8 max-w-2xl">
        <div className="bg-surface-card border border-surface-border rounded-xl p-6 mb-4">
          <h2 className="text-sm font-semibold text-white mb-4">Compte</h2>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-slate-500 mb-1">Email</p>
              <p className="text-sm text-white">{user?.email}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">ID utilisateur</p>
              <p className="text-xs text-slate-400 font-mono">{user?.id}</p>
            </div>
          </div>
        </div>

        <div className="bg-surface-card border border-surface-border rounded-xl p-6">
          <h2 className="text-sm font-semibold text-white mb-2">À propos</h2>
          <p className="text-sm text-slate-400">InnSight v0.1.0 — Intelligence Foncière Hôtelière</p>
        </div>
      </div>
    </div>
  )
}

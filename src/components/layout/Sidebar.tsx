'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import {
  Building2,
  Radar,
  Calculator,
  LayoutDashboard,
  Settings,
  LogOut,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  {
    label: 'Radar',
    href: '/radar',
    icon: Radar,
    description: 'Opportunités hôtelières',
  },
  {
    label: 'Stratège',
    href: '/stratege',
    icon: Calculator,
    description: 'Simulateurs financiers',
  },
  {
    label: 'Portfolio',
    href: '/portfolio',
    icon: LayoutDashboard,
    description: 'Parc immobilier',
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-surface-card border-r border-surface-border flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 h-16 border-b border-surface-border">
        <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <Building2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="text-white font-bold text-lg tracking-tight">InnSight</span>
          <p className="text-slate-500 text-xs leading-none mt-0.5">Foncier Hôtelier</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider px-3 mb-3">
          Piliers
        </p>
        {navItems.map(item => {
          const active = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group',
                active
                  ? 'bg-brand-600/15 text-brand-400 border border-brand-500/20'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-surface-hover'
              )}
            >
              <item.icon className={cn('w-5 h-5 flex-shrink-0', active ? 'text-brand-400' : 'text-slate-400 group-hover:text-slate-300')} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.label}</p>
                <p className={cn('text-xs truncate', active ? 'text-brand-400/70' : 'text-slate-500')}>
                  {item.description}
                </p>
              </div>
              {active && <ChevronRight className="w-4 h-4 text-brand-400/50" />}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 border-t border-surface-border pt-3 space-y-1">
        <Link
          href="/settings"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-slate-400 hover:text-slate-100 hover:bg-surface-hover',
            pathname.startsWith('/settings') && 'bg-surface-hover text-slate-100'
          )}
        >
          <Settings className="w-5 h-5" />
          <span className="text-sm font-medium">Paramètres</span>
        </Link>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-slate-400 hover:text-red-400 hover:bg-red-500/10"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Déconnexion</span>
        </button>
      </div>
    </aside>
  )
}

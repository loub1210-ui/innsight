import Link from 'next/link'
import { Calculator, TrendingUp, Home, Layers, UtensilsCrossed, ParkingCircle, Tent, Hotel, Building2 } from 'lucide-react'

export const metadata = { title: 'Stratège' }

const simulateurs = [
  { href: '/stratege/marchand-biens',   icon: TrendingUp,      label: 'Marchand de biens',   desc: 'Marge brute, TRI, prix d\'achat maximum', color: 'text-violet-400 bg-violet-500/10' },
  { href: '/stratege/coliving',         icon: Home,            label: 'Coliving',             desc: 'Rendement par chambre, TRI 10 ans',        color: 'text-blue-400 bg-blue-500/10' },
  { href: '/stratege/self-stockage',    icon: Layers,          label: 'Self-stockage',        desc: 'Seuil rentabilité, RevM², TRI 15 ans',     color: 'text-cyan-400 bg-cyan-500/10' },
  { href: '/stratege/dark-kitchen',     icon: UtensilsCrossed, label: 'Dark Kitchen',         desc: 'Rendement par poste cuisine',              color: 'text-orange-400 bg-orange-500/10' },
  { href: '/stratege/parking-pl',       icon: ParkingCircle,   label: 'Parking PL',           desc: 'Rendement + conformité loi Huwart',        color: 'text-emerald-400 bg-emerald-500/10' },
  { href: '/stratege/camping',          icon: Tent,            label: 'Camping 3★',           desc: 'RevPAC, saisonnalité, TRI 10 ans',         color: 'text-green-400 bg-green-500/10' },
  { href: '/stratege/hotel-distressed', icon: Hotel,           label: 'Hôtel Distressed',     desc: 'RevPAR, TRevPAR, GOP, TRI global',         color: 'text-gold-500 bg-amber-500/10' },
  { href: '/stratege/immeuble',         icon: Building2,       label: 'Immeuble de rapport',  desc: 'Cashflow, TRI fonds propres, tableau crédit', color: 'text-pink-400 bg-pink-500/10' },
]

export default function StrategePage() {
  return (
    <div className="flex flex-col h-screen">
      <div className="flex items-center gap-3 px-8 h-16 border-b border-surface-border flex-shrink-0">
        <Calculator className="w-5 h-5 text-brand-400" />
        <h1 className="text-lg font-semibold text-white">Stratège</h1>
        <span className="text-sm text-slate-400">Simulateurs financiers</span>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <p className="text-slate-400 text-sm mb-8 max-w-xl">
          Analysez la rentabilité de vos projets hôteliers et immobiliers avec des simulations financières détaillées.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {simulateurs.map(sim => (
            <Link
              key={sim.href}
              href={sim.href}
              className="bg-surface-card border border-surface-border rounded-xl p-6 hover:border-brand-500/40 hover:bg-surface-card/80 transition-all group"
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${sim.color}`}>
                <sim.icon className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-1 group-hover:text-brand-300 transition-colors">
                {sim.label}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">{sim.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

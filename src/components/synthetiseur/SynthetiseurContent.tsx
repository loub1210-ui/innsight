'use client'

import { useState } from 'react'
import { Search, MapPin, TrendingUp, Train, Building2, Users, BedDouble, Euro, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'

// Sources de données par indicateur
const SOURCES = {
  revpar: {
    label: 'RevPAR & Occupation',
    sources: [
      { nom: 'MKG Group – Observatoire hôtelier', url: 'https://www.mkg-group.com/fr/' },
      { nom: 'In Extenso Tourisme – Baromètre', url: 'https://www.inextenso-tourisme.fr/' },
    ],
  },
  prix_m2: {
    label: 'Prix immobilier / m²',
    sources: [
      { nom: 'MeilleursAgents – Prix au m²', url: 'https://www.meilleursagents.com/prix-immobilier/' },
      { nom: 'SeLoger – Estimation prix', url: 'https://www.seloger.com/prix-de-l-immo/' },
    ],
  },
  tourisme: {
    label: 'Fréquentation touristique',
    sources: [
      { nom: 'INSEE – Hébergements touristiques', url: 'https://www.insee.fr/fr/statistiques?taille=100&debut=0&theme=13' },
      { nom: 'Atout France – Chiffres du tourisme', url: 'https://www.atout-france.fr/' },
    ],
  },
  rendement: {
    label: 'Rendement & Investissement',
    sources: [
      { nom: 'CBRE – Hôtels France', url: 'https://www.cbre.fr/services/secteurs/hotels' },
      { nom: 'Cushman & Wakefield – Hospitality', url: 'https://www.cushmanwakefield.com/fr-fr/france/insights/hospitality' },
    ],
  },
  population: {
    label: 'Population & Démographie',
    sources: [
      { nom: 'INSEE – Populations légales', url: 'https://www.insee.fr/fr/statistiques/6683035' },
    ],
  },
}

// Données marché des grandes villes françaises (gares principales)
// Sources indicatives : INSEE, Atout France, MKG Group
const VILLES_DATA = [
  {
    ville: 'Paris',
    gare: 'Gare de Lyon / Gare du Nord',
    region: 'Île-de-France',
    dept: '75',
    revpar_moyen: 125,
    taux_occupation: 78,
    prix_moyen_chambre: 160,
    nb_hotels_zone_gare: 85,
    prix_m2_moyen: 12500,
    rendement_brut: 4.8,
    tendance: 'hausse',
    score_attractivite: 92,
    population: 2161000,
    touristes_annuels: 38000000,
  },
  {
    ville: 'Lyon',
    gare: 'Gare de Lyon Part-Dieu',
    region: 'Auvergne-Rhône-Alpes',
    dept: '69',
    revpar_moyen: 82,
    taux_occupation: 72,
    prix_moyen_chambre: 114,
    nb_hotels_zone_gare: 42,
    prix_m2_moyen: 5200,
    rendement_brut: 5.6,
    tendance: 'hausse',
    score_attractivite: 85,
    population: 522969,
    touristes_annuels: 6000000,
  },
  {
    ville: 'Marseille',
    gare: 'Gare Saint-Charles',
    region: 'Provence-Alpes-Côte d\'Azur',
    dept: '13',
    revpar_moyen: 74,
    taux_occupation: 68,
    prix_moyen_chambre: 109,
    nb_hotels_zone_gare: 35,
    prix_m2_moyen: 3800,
    rendement_brut: 6.1,
    tendance: 'stable',
    score_attractivite: 78,
    population: 873076,
    touristes_annuels: 5000000,
  },
  {
    ville: 'Bordeaux',
    gare: 'Gare Saint-Jean',
    region: 'Nouvelle-Aquitaine',
    dept: '33',
    revpar_moyen: 78,
    taux_occupation: 71,
    prix_moyen_chambre: 110,
    nb_hotels_zone_gare: 28,
    prix_m2_moyen: 4600,
    rendement_brut: 5.3,
    tendance: 'hausse',
    score_attractivite: 82,
    population: 260958,
    touristes_annuels: 4200000,
  },
  {
    ville: 'Lille',
    gare: 'Gare Lille-Flandres / Europe',
    region: 'Hauts-de-France',
    dept: '59',
    revpar_moyen: 68,
    taux_occupation: 66,
    prix_moyen_chambre: 103,
    nb_hotels_zone_gare: 32,
    prix_m2_moyen: 3400,
    rendement_brut: 5.9,
    tendance: 'hausse',
    score_attractivite: 76,
    population: 236234,
    touristes_annuels: 3500000,
  },
  {
    ville: 'Toulouse',
    gare: 'Gare Matabiau',
    region: 'Occitanie',
    dept: '31',
    revpar_moyen: 71,
    taux_occupation: 69,
    prix_moyen_chambre: 103,
    nb_hotels_zone_gare: 25,
    prix_m2_moyen: 3900,
    rendement_brut: 5.5,
    tendance: 'stable',
    score_attractivite: 74,
    population: 504078,
    touristes_annuels: 3800000,
  },
  {
    ville: 'Nice',
    gare: 'Gare de Nice-Ville',
    region: 'Provence-Alpes-Côte d\'Azur',
    dept: '06',
    revpar_moyen: 95,
    taux_occupation: 74,
    prix_moyen_chambre: 128,
    nb_hotels_zone_gare: 38,
    prix_m2_moyen: 5800,
    rendement_brut: 5.1,
    tendance: 'hausse',
    score_attractivite: 86,
    population: 342669,
    touristes_annuels: 5000000,
  },
  {
    ville: 'Nantes',
    gare: 'Gare de Nantes',
    region: 'Pays de la Loire',
    dept: '44',
    revpar_moyen: 65,
    taux_occupation: 67,
    prix_moyen_chambre: 97,
    nb_hotels_zone_gare: 22,
    prix_m2_moyen: 4100,
    rendement_brut: 5.4,
    tendance: 'hausse',
    score_attractivite: 73,
    population: 320732,
    touristes_annuels: 2800000,
  },
  {
    ville: 'Strasbourg',
    gare: 'Gare de Strasbourg',
    region: 'Grand Est',
    dept: '67',
    revpar_moyen: 72,
    taux_occupation: 70,
    prix_moyen_chambre: 103,
    nb_hotels_zone_gare: 30,
    prix_m2_moyen: 3600,
    rendement_brut: 5.7,
    tendance: 'stable',
    score_attractivite: 77,
    population: 287228,
    touristes_annuels: 3200000,
  },
  {
    ville: 'Montpellier',
    gare: 'Gare Saint-Roch',
    region: 'Occitanie',
    dept: '34',
    revpar_moyen: 67,
    taux_occupation: 66,
    prix_moyen_chambre: 101,
    nb_hotels_zone_gare: 20,
    prix_m2_moyen: 3500,
    rendement_brut: 5.8,
    tendance: 'hausse',
    score_attractivite: 75,
    population: 299096,
    touristes_annuels: 2500000,
  },
  {
    ville: 'Rennes',
    gare: 'Gare de Rennes',
    region: 'Bretagne',
    dept: '35',
    revpar_moyen: 62,
    taux_occupation: 65,
    prix_moyen_chambre: 95,
    nb_hotels_zone_gare: 18,
    prix_m2_moyen: 3800,
    rendement_brut: 5.2,
    tendance: 'stable',
    score_attractivite: 70,
    population: 222485,
    touristes_annuels: 2100000,
  },
  {
    ville: 'Grenoble',
    gare: 'Gare de Grenoble',
    region: 'Auvergne-Rhône-Alpes',
    dept: '38',
    revpar_moyen: 58,
    taux_occupation: 62,
    prix_moyen_chambre: 94,
    nb_hotels_zone_gare: 16,
    prix_m2_moyen: 2800,
    rendement_brut: 6.2,
    tendance: 'stable',
    score_attractivite: 68,
    population: 158454,
    touristes_annuels: 1800000,
  },
]

type Tri = 'score' | 'revpar' | 'rendement' | 'prix_m2'

const TRI_OPTIONS: { value: Tri; label: string }[] = [
  { value: 'score', label: 'Score attractivité' },
  { value: 'revpar', label: 'RevPAR' },
  { value: 'rendement', label: 'Rendement brut' },
  { value: 'prix_m2', label: 'Prix/m² (croissant)' },
]

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 80 ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
    : score >= 70 ? 'text-amber-400 border-amber-500/30 bg-amber-500/10'
    : 'text-slate-400 border-slate-500/30 bg-slate-500/10'
  return (
    <span className={cn('inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border', color)}>
      {score}
    </span>
  )
}

function TendanceBadge({ tendance }: { tendance: string }) {
  return (
    <span className={cn(
      'text-xs font-medium px-2 py-0.5 rounded-md',
      tendance === 'hausse' ? 'text-emerald-400 bg-emerald-500/10' :
      tendance === 'baisse' ? 'text-red-400 bg-red-500/10' :
      'text-slate-400 bg-slate-500/10'
    )}>
      {tendance === 'hausse' ? '↗ Hausse' : tendance === 'baisse' ? '↘ Baisse' : '→ Stable'}
    </span>
  )
}

function SourcesPanel({ ville }: { ville: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="mt-3 pt-3 border-t border-surface-border">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-brand-400 transition-colors w-full"
      >
        <ExternalLink className="w-3 h-3" />
        <span>Sources des données</span>
        {open ? <ChevronUp className="w-3 h-3 ml-auto" /> : <ChevronDown className="w-3 h-3 ml-auto" />}
      </button>
      {open && (
        <div className="mt-2 space-y-2">
          {Object.values(SOURCES).map(cat => (
            <div key={cat.label}>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">{cat.label}</p>
              <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                {cat.sources.map(s => (
                  <a
                    key={s.url}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-brand-400 hover:text-brand-300 hover:underline transition-colors"
                  >
                    {s.nom} ↗
                  </a>
                ))}
              </div>
            </div>
          ))}
          <p className="text-[10px] text-slate-600 italic mt-1">
            Données indicatives — croisement de sources publiques et professionnelles.
          </p>
        </div>
      )}
    </div>
  )
}

export function SynthetiseurContent() {
  const [search, setSearch] = useState('')
  const [tri, setTri] = useState<Tri>('score')

  const villesFiltrees = VILLES_DATA
    .filter(v => {
      if (!search) return true
      const s = search.toLowerCase()
      return v.ville.toLowerCase().includes(s) || v.gare.toLowerCase().includes(s) || v.region.toLowerCase().includes(s)
    })
    .sort((a, b) => {
      switch (tri) {
        case 'score': return b.score_attractivite - a.score_attractivite
        case 'revpar': return b.revpar_moyen - a.revpar_moyen
        case 'rendement': return b.rendement_brut - a.rendement_brut
        case 'prix_m2': return a.prix_m2_moyen - b.prix_m2_moyen
        default: return 0
      }
    })

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Filters bar */}
      <div className="px-8 py-4 border-b border-surface-border flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 min-w-48 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher une ville, gare, région…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-surface border border-surface-border rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Trier par :</span>
          {TRI_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setTri(opt.value)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                tri === opt.value
                  ? 'bg-brand-600 text-white'
                  : 'bg-surface-card text-slate-400 hover:text-slate-200 border border-surface-border'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <span className="text-sm text-slate-400 ml-auto">
          {villesFiltrees.length} ville{villesFiltrees.length > 1 ? 's' : ''}
        </span>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {villesFiltrees.map(v => (
            <div
              key={v.ville}
              className="bg-surface-card border border-surface-border rounded-xl p-6 hover:border-brand-500/30 transition-all"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-white">{v.ville}</h3>
                    <TendanceBadge tendance={v.tendance} />
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                    <Train className="w-3.5 h-3.5" />
                    {v.gare}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{v.region} ({v.dept})</p>
                </div>
                <ScoreBadge score={v.score_attractivite} />
              </div>

              {/* KPIs */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-surface border border-surface-border rounded-lg p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Euro className="w-3 h-3 text-slate-500" />
                    <p className="text-xs text-slate-500">RevPAR</p>
                  </div>
                  <p className="text-base font-bold text-white">{v.revpar_moyen} €</p>
                </div>
                <div className="bg-surface border border-surface-border rounded-lg p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <BedDouble className="w-3 h-3 text-slate-500" />
                    <p className="text-xs text-slate-500">Occupation</p>
                  </div>
                  <p className="text-base font-bold text-white">{v.taux_occupation}%</p>
                </div>
                <div className="bg-surface border border-surface-border rounded-lg p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <TrendingUp className="w-3 h-3 text-slate-500" />
                    <p className="text-xs text-slate-500">Rdt brut</p>
                  </div>
                  <p className="text-base font-bold text-emerald-400">{v.rendement_brut}%</p>
                </div>
              </div>

              {/* Détails */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-3 border-t border-surface-border text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Prix/m²</span>
                  <span className="text-white font-medium">{v.prix_m2_moyen.toLocaleString('fr-FR')} €</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Chambre moy.</span>
                  <span className="text-white font-medium">{v.prix_moyen_chambre} €/nuit</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Hôtels zone gare</span>
                  <span className="text-white font-medium">{v.nb_hotels_zone_gare}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Touristes/an</span>
                  <span className="text-white font-medium">{(v.touristes_annuels / 1000000).toFixed(1)}M</span>
                </div>
              </div>

              {/* Sources */}
              <SourcesPanel ville={v.ville} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

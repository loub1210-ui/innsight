'use client'

import { useState } from 'react'
import {
  Sparkles,
  Calendar,
  Building2,
  Train,
  Users,
  Euro,
  TrendingUp,
  AlertTriangle,
  ExternalLink,
  Phone,
  FileText,
  Star,
  ChevronDown,
  Bot,
  MapPin,
  Construction,
  Plane,
  Briefcase,
  Tent,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  type VilleDetail,
  type Hotel,
  type EvenementMarche,
  type ProjetStructurant,
  ratioHotelsParKm2,
  ratioIndependantsParKm2,
  ratio2EtoilesParKm2,
  ratio3EtoilesParKm2,
  ratio4EtoilesParKm2,
  ratioTouristesParKm2,
  ratioMiceParKm2,
  ratioEntreprisesParHotel,
  conjectureTouristesXHotelsParKm2,
  MOIS_LABELS,
  VILLES_PRIORITAIRES_HMA,
} from '@/data/villes'

export function VilleDetailContent({ ville: v }: { ville: VilleDetail }) {
  const isPrioritaire = VILLES_PRIORITAIRES_HMA.includes(v.slug)

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header carte d'identité */}
      <section className="bg-gradient-to-br from-brand-600/10 via-surface-card to-surface-card border border-brand-500/20 rounded-2xl p-6">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <h2 className="text-3xl font-black text-white">{v.ville}</h2>
              {isPrioritaire && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-brand-300 bg-brand-500/20 border border-brand-500/40 px-2 py-1 rounded">
                  <Sparkles className="w-3 h-3" />
                  PRIORITÉ HMA
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-400">
              <span className="flex items-center gap-1"><Train className="w-4 h-4" />{v.gare_principale}</span>
              <span>·</span>
              <span>{v.region}</span>
              <span>·</span>
              <span>{v.surface_km2} km²</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Stat label="Population" value={`${(v.population / 1000).toFixed(0)}k`} sub={`${(v.population_metropole / 1000).toFixed(0)}k métropole`} />
            <Stat label="Aire d'attraction" value={`${(v.aire_attraction / 1000).toFixed(0)}k`} />
            <Stat label="Score" value={v.score_attractivite.toString()} accent />
          </div>
        </div>
      </section>

      {/* RATIOS COEUR — la grille demandée par Anto */}
      <section>
        <h3 className="text-xs uppercase tracking-wider text-slate-500 font-medium mb-3">
          Ratios marché — accessibles dès l'ouverture
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          <RatioCard
            icon={<Building2 className="w-4 h-4" />}
            label="Hôtels / km²"
            value={ratioHotelsParKm2(v).toFixed(2)}
            sub={`${v.nb_hotels_total} hôtels totaux`}
            sources={[
              { label: 'INSEE BPE', url: 'https://www.insee.fr/fr/statistiques?theme=12' },
            ]}
          />
          <RatioCard
            icon={<Building2 className="w-4 h-4" />}
            label="Indépendants / km²"
            value={ratioIndependantsParKm2(v).toFixed(2)}
            sub={`${v.nb_hotels_independants} indépendants`}
            highlight
            sources={[{ label: 'INSEE + scraping Booking', url: 'https://www.booking.com/' }]}
          />
          <RatioCard
            icon={<Star className="w-4 h-4" />}
            label="2★ / km²"
            value={ratio2EtoilesParKm2(v).toFixed(2)}
            sub={`${v.nb_hotels_2etoiles} hôtels 2★`}
            sources={[{ label: 'Atout France', url: 'https://www.atout-france.fr/' }]}
          />
          <RatioCard
            icon={<Star className="w-4 h-4" />}
            label="3★ / km²"
            value={ratio3EtoilesParKm2(v).toFixed(2)}
            sub={`${v.nb_hotels_3etoiles} hôtels 3★`}
            sources={[{ label: 'Atout France', url: 'https://www.atout-france.fr/' }]}
          />
          <RatioCard
            icon={<Star className="w-4 h-4" />}
            label="4★ / km²"
            value={ratio4EtoilesParKm2(v).toFixed(2)}
            sub={`${v.nb_hotels_4etoiles} hôtels 4★`}
            sources={[{ label: 'Atout France', url: 'https://www.atout-france.fr/' }]}
          />
          <RatioCard
            icon={<Calendar className="w-4 h-4" />}
            label="MICE / an"
            value={v.mice_evenements_an.toString()}
            sub={`${v.mice_visiteurs_an}k visiteurs/an`}
            accent
            badge="LE + IMPORTANT"
            sources={[{ label: 'France Congrès & Événements', url: 'https://www.francecongres.org/' }]}
          />
          <RatioCard
            icon={<Calendar className="w-4 h-4" />}
            label="MICE / km²"
            value={ratioMiceParKm2(v).toFixed(2)}
            sub="événements / km²"
            accent
            sources={[{ label: 'France Congrès & Événements', url: 'https://www.francecongres.org/' }]}
          />
          <RatioCard
            icon={<Euro className="w-4 h-4" />}
            label="ADR moyen"
            value={`${v.adr_moyen} €`}
            sub={`Profil : ${v.ratio_business_pct >= 30 ? 'corpo dominant' : 'loisir dominant'}`}
            sources={[{ label: 'MKG Hospitality', url: 'https://www.mkg-group.com/fr/' }]}
          />
          <RatioCard
            icon={<Users className="w-4 h-4" />}
            label="Touristes / km²"
            value={`${(ratioTouristesParKm2(v) / 1000).toFixed(1)}k`}
            sub={`${(v.touristes_an / 1_000_000).toFixed(2)}M /an`}
            sources={[{ label: 'INSEE Tourisme', url: 'https://www.insee.fr/fr/statistiques?taille=100&theme=13' }]}
          />
          <RatioCard
            icon={<TrendingUp className="w-4 h-4" />}
            label="Touristes × Hôtels / km²"
            value={(conjectureTouristesXHotelsParKm2(v) / 1000).toFixed(2) + 'k'}
            sub="Conjecture Anto"
            sources={[{ label: 'Calcul interne', url: '#' }]}
          />
          <RatioCard
            icon={<Briefcase className="w-4 h-4" />}
            label="NB entreprises"
            value={v.nb_entreprises.toLocaleString('fr-FR')}
            sub={`${v.nb_groupes_majeurs} groupes majeurs`}
            sources={[{ label: 'INSEE SIRENE', url: 'https://www.sirene.fr/' }]}
          />
          <RatioCard
            icon={<TrendingUp className="w-4 h-4" />}
            label="Entreprises / hôtel"
            value={Math.round(ratioEntreprisesParHotel(v)).toString()}
            sub="Densité business"
            sources={[{ label: 'INSEE SIRENE', url: 'https://www.sirene.fr/' }]}
          />
        </div>
      </section>

      {/* Résumé IA */}
      <ResumeIA resume={v.resume_ia} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FriseSaisonniere evenements={v.evenements} />
        <AttractiviteEconomique projets={v.projets} ville={v} />
      </div>

      <ConcurrenceSection ville={v} />

      <BrokersSection brokers={v.brokers_actifs} />
    </div>
  )
}

// ───────────────────────────────────────────────────────────────────────────
// Composants
// ───────────────────────────────────────────────────────────────────────────

function Stat({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div className="text-right">
      <p className={cn('text-2xl font-black', accent ? 'text-emerald-400' : 'text-white')}>{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-slate-500">{label}</p>
      {sub && <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>}
    </div>
  )
}

function RatioCard({
  icon, label, value, sub, accent, highlight, badge, sources,
}: {
  icon: React.ReactNode
  label: string
  value: string
  sub?: string
  accent?: boolean
  highlight?: boolean
  badge?: string
  sources: { label: string; url: string }[]
}) {
  const [open, setOpen] = useState(false)
  return (
    <button
      type="button"
      onClick={() => setOpen(!open)}
      className={cn(
        'group text-left rounded-xl border p-4 transition-all relative overflow-hidden',
        highlight
          ? 'bg-brand-500/10 border-brand-500/30 hover:border-brand-500/50'
          : accent
            ? 'bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40'
            : 'bg-surface-card border-surface-border hover:border-brand-500/30',
      )}
    >
      {badge && (
        <span className="absolute top-1.5 right-1.5 text-[8px] font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
          {badge}
        </span>
      )}
      <div className={cn('flex items-center gap-1.5 text-xs mb-1', accent ? 'text-emerald-400' : highlight ? 'text-brand-300' : 'text-slate-500')}>
        {icon}
        <span className="uppercase tracking-wider font-medium">{label}</span>
      </div>
      <p className={cn('text-2xl font-black mt-1', accent ? 'text-emerald-300' : 'text-white')}>{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
      <div className="mt-3 pt-3 border-t border-surface-border/60 flex items-center justify-between">
        <span className="text-[10px] text-slate-500 flex items-center gap-1">
          <ExternalLink className="w-2.5 h-2.5" />
          {sources.length} source{sources.length > 1 ? 's' : ''}
        </span>
        <ChevronDown className={cn('w-3 h-3 text-slate-500 transition-transform', open && 'rotate-180')} />
      </div>
      {open && (
        <div className="mt-2 space-y-1">
          {sources.map(s => (
            <a
              key={s.url}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="block text-[11px] text-brand-400 hover:text-brand-300 hover:underline truncate"
            >
              ↗ {s.label}
            </a>
          ))}
        </div>
      )}
    </button>
  )
}

function ResumeIA({ resume }: { resume: string }) {
  return (
    <section className="bg-surface-card border border-surface-border rounded-xl p-5">
      <h3 className="text-xs uppercase tracking-wider text-slate-500 font-medium mb-3 flex items-center gap-2">
        <Bot className="w-3.5 h-3.5 text-brand-400" />
        Résumé IA — analyse marché & opportunités
      </h3>
      <p className="text-sm text-slate-200 leading-relaxed">{resume}</p>
      <p className="text-[10px] text-slate-600 italic mt-3">
        Généré par Claude (mock pour la démo) — sera mis à jour à chaque rafraîchissement mensuel.
      </p>
    </section>
  )
}

function FriseSaisonniere({ evenements }: { evenements: EvenementMarche[] }) {
  return (
    <section className="bg-surface-card border border-surface-border rounded-xl p-5">
      <h3 className="text-xs uppercase tracking-wider text-slate-500 font-medium mb-4 flex items-center gap-2">
        <Calendar className="w-3.5 h-3.5 text-brand-400" />
        Frise saisonnalité événements
      </h3>
      <div className="grid grid-cols-12 gap-px text-[9px] text-slate-500 mb-2">
        {MOIS_LABELS.slice(1).map(m => (
          <div key={m} className="text-center font-medium uppercase">{m}</div>
        ))}
      </div>
      <div className="space-y-1.5">
        {evenements.map((ev, i) => {
          const isWraparound = ev.mois_fin < ev.mois_debut
          return (
            <div key={i} className="grid grid-cols-12 gap-px relative h-7">
              {Array.from({ length: 12 }).map((_, monthIdx) => {
                const mois = monthIdx + 1
                const inRange = isWraparound
                  ? mois >= ev.mois_debut || mois <= ev.mois_fin
                  : mois >= ev.mois_debut && mois <= ev.mois_fin
                return (
                  <div
                    key={monthIdx}
                    className={cn(
                      'rounded',
                      !inRange && 'bg-surface',
                      inRange && ev.impact_adr === 'haut' && 'bg-rose-500/40',
                      inRange && ev.impact_adr === 'moyen' && 'bg-amber-500/40',
                      inRange && ev.impact_adr === 'bas' && 'bg-sky-500/30',
                    )}
                  />
                )
              })}
              <div className="absolute inset-0 flex items-center px-2 pointer-events-none">
                <span className="text-[10px] text-white font-medium truncate" title={ev.description}>
                  {ev.nom}
                </span>
              </div>
            </div>
          )
        })}
      </div>
      <div className="flex items-center gap-3 mt-4 text-[10px] text-slate-500">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-rose-500/40" /> Impact ADR fort</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-amber-500/40" /> Moyen</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-sky-500/30" /> Faible</span>
      </div>
    </section>
  )
}

function AttractiviteEconomique({ projets, ville: v }: { projets: ProjetStructurant[]; ville: VilleDetail }) {
  return (
    <section className="bg-surface-card border border-surface-border rounded-xl p-5">
      <h3 className="text-xs uppercase tracking-wider text-slate-500 font-medium mb-4 flex items-center gap-2">
        <Construction className="w-3.5 h-3.5 text-brand-400" />
        Attractivité économique & projets
      </h3>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <MiniStat icon={<Briefcase className="w-3 h-3" />} label="Entreprises" value={v.nb_entreprises.toLocaleString('fr-FR')} />
        <MiniStat icon={<Building2 className="w-3 h-3" />} label="Groupes majeurs" value={v.nb_groupes_majeurs.toString()} />
        <MiniStat icon={<Plane className="w-3 h-3" />} label="Aire attraction" value={`${(v.aire_attraction / 1000).toFixed(0)}k`} />
      </div>

      <ul className="space-y-2">
        {projets.map((p, i) => (
          <li key={i} className="flex items-start gap-2 p-2 rounded-lg bg-surface border border-surface-border">
            <span className={cn(
              'w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0',
              p.impact === 'fort' ? 'bg-emerald-400' : p.impact === 'moyen' ? 'bg-amber-400' : 'bg-slate-500',
            )} />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white font-medium">{p.titre}</p>
              <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                <span className="uppercase">{p.categorie}</span>
                <span>·</span>
                <span>{p.echeance}</span>
                {p.source && (
                  <>
                    <span>·</span>
                    <a href={p.source.url} target="_blank" rel="noopener noreferrer" className="text-brand-400 hover:text-brand-300 hover:underline">
                      source ↗
                    </a>
                  </>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

function MiniStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-surface border border-surface-border rounded-lg p-2.5">
      <div className="flex items-center gap-1 text-[10px] text-slate-500 uppercase tracking-wider">
        {icon}{label}
      </div>
      <p className="text-sm font-bold text-white mt-0.5">{value}</p>
    </div>
  )
}

function ConcurrenceSection({ ville: v }: { ville: VilleDetail }) {
  const sortedHotels = [...v.hotels].sort((a, b) => b.note_booking - a.note_booking)
  const prixAnormaux = v.hotels.filter(h => h.prix_anormalement_bas)

  return (
    <section className="bg-surface-card border border-surface-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs uppercase tracking-wider text-slate-500 font-medium flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-brand-400" />
          Analyse concurrence — hôtels de la ville
        </h3>
        <span className="text-[10px] text-slate-500">{v.hotels.length} hôtels analysés</span>
      </div>

      {prixAnormaux.length > 0 && (
        <div className="mb-4 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
          <div className="flex items-center gap-2 text-xs text-amber-300 font-medium mb-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            Prix anormalement bas détectés
          </div>
          <p className="text-[11px] text-slate-400">
            {prixAnormaux.map(h => h.nom).join(' · ')} pratiquent des tarifs &lt; -15 % vs marché — opportunité de repositionnement.
          </p>
        </div>
      )}

      <div className="space-y-2">
        {sortedHotels.map((h, i) => (
          <HotelRow key={i} hotel={h} />
        ))}
      </div>
    </section>
  )
}

function HotelRow({ hotel: h }: { hotel: Hotel }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={cn(
      'rounded-lg border overflow-hidden',
      h.prix_anormalement_bas
        ? 'border-amber-500/30 bg-amber-500/5'
        : 'border-surface-border bg-surface',
    )}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-3 text-left hover:bg-surface-hover transition-colors"
      >
        <div className="flex items-center gap-0.5 text-amber-400">
          {Array.from({ length: h.etoiles }).map((_, i) => (
            <Star key={i} className="w-3 h-3 fill-current" />
          ))}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-white truncate">{h.nom}</p>
            {h.independant && (
              <span className="text-[9px] uppercase font-bold text-brand-300 bg-brand-500/15 px-1.5 py-0.5 rounded">
                Indé.
              </span>
            )}
            {h.prix_anormalement_bas && (
              <span className="text-[9px] uppercase font-bold text-amber-300 bg-amber-500/15 px-1.5 py-0.5 rounded">
                Prix bas
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 truncate">{h.adresse}</p>
        </div>
        <div className="hidden sm:grid grid-cols-3 gap-3 text-right text-[11px]">
          <div><span className="text-slate-500">Note </span><span className="text-white font-medium">{h.note_booking}</span></div>
          <div><span className="text-slate-500">Cha. </span><span className="text-white font-medium">{h.chambres}</span></div>
          <div><span className="text-slate-500">€/nuit </span><span className="text-white font-medium">{h.prix_nuit_moyen}</span></div>
        </div>
        <ChevronDown className={cn('w-4 h-4 text-slate-500 transition-transform', open && 'rotate-180')} />
      </button>
      {open && h.independant && (
        <div className="px-3 pb-3 pt-1 border-t border-surface-border">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px] mt-2">
            {h.dirigeant && (
              <div>
                <p className="text-slate-500">Dirigeant</p>
                <p className="text-white font-medium">{h.dirigeant}</p>
              </div>
            )}
            {h.telephone && (
              <a href={`tel:${h.telephone.replace(/\s/g, '')}`} className="flex items-start gap-1 text-brand-400 hover:text-brand-300">
                <Phone className="w-3 h-3 mt-0.5" />
                <div>
                  <p className="text-slate-500">Téléphone</p>
                  <p className="font-medium">{h.telephone}</p>
                </div>
              </a>
            )}
            {h.ca_estime !== undefined && h.ca_estime > 0 && (
              <div>
                <p className="text-slate-500">CA estimé</p>
                <p className="text-white font-medium">{(h.ca_estime / 1000).toFixed(0)}k€</p>
              </div>
            )}
            {h.url_bilan && (
              <a href={h.url_bilan} target="_blank" rel="noopener noreferrer" className="flex items-start gap-1 text-brand-400 hover:text-brand-300">
                <FileText className="w-3 h-3 mt-0.5" />
                <div>
                  <p className="text-slate-500">Bilan</p>
                  <p className="font-medium">Pappers ↗</p>
                </div>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function BrokersSection({ brokers }: { brokers: string[] }) {
  if (brokers.length === 0) return null
  return (
    <section className="bg-surface-card border border-surface-border rounded-xl p-5">
      <h3 className="text-xs uppercase tracking-wider text-slate-500 font-medium mb-3 flex items-center gap-2">
        <Briefcase className="w-3.5 h-3.5 text-brand-400" />
        Brokers actifs sur la zone
      </h3>
      <div className="flex flex-wrap gap-2">
        {brokers.map(b => (
          <span key={b} className="px-3 py-1.5 bg-surface border border-surface-border rounded-full text-xs text-slate-300">
            {b}
          </span>
        ))}
      </div>
    </section>
  )
}

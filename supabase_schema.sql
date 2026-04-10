-- ============================================================
-- InnSight — Schéma Supabase
-- À exécuter dans l'éditeur SQL Supabase : supabase.com
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";

-- ── Table : opportunites_radar ────────────────────────────────────────────────
-- Opportunités hôtelières détectées (pilier RADAR)

create table if not exists public.opportunites_radar (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid references auth.users(id) on delete cascade not null,

  -- Identification
  nom               text not null,
  commune           text not null,
  dept_code         text not null,
  region_code       text,
  adresse           text,

  -- Classification
  classe_actif      text not null check (classe_actif in (
    'hotel', 'appart_hotel', 'camping', 'auberge', 'gite', 'villa',
    'maison_hotes', 'coliving', 'self_stockage', 'dark_kitchen',
    'parking_pl', 'immeuble', 'autre'
  )),

  -- Financiers
  prix_demande      numeric(14,2),
  surface_m2        numeric(8,2),
  nombre_chambres   integer,
  revpar_estime     numeric(8,2),
  taux_occupation_estime numeric(5,2),

  -- DPE
  dpe_classe        text check (dpe_classe in ('A','B','C','D','E','F','G')),

  -- Scoring
  keyscore          integer check (keyscore between 0 and 100),
  keyscore_details  jsonb,

  -- Statut workflow
  statut            text not null default 'nouvelle' check (statut in (
    'nouvelle', 'en_analyse', 'qualifiee', 'archivee'
  )),

  -- Lien source
  url_source        text,
  notes             text,

  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- Index
create index on public.opportunites_radar(user_id);
create index on public.opportunites_radar(statut);
create index on public.opportunites_radar(classe_actif);
create index on public.opportunites_radar(keyscore desc);

-- RLS (Row Level Security)
alter table public.opportunites_radar enable row level security;

create policy "Utilisateurs voient leurs propres opportunités"
  on public.opportunites_radar for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- ── Table : actifs_portefeuille ───────────────────────────────────────────────
-- Parc immobilier détenu (pilier PORTFOLIO)

create table if not exists public.actifs_portefeuille (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid references auth.users(id) on delete cascade not null,

  -- Identification
  nom               text not null,
  commune           text not null,
  dept_code         text not null,
  region_code       text,
  adresse           text,
  surface_m2        numeric(8,2),
  date_acquisition  date,

  -- Classification
  classe_actif      text not null check (classe_actif in (
    'hotel', 'appart_hotel', 'camping', 'auberge', 'gite', 'villa',
    'maison_hotes', 'coliving', 'self_stockage', 'dark_kitchen',
    'parking_pl', 'immeuble', 'autre'
  )),
  statut            text not null default 'actif' check (statut in (
    'actif', 'en_acquisition', 'en_renovation', 'vendu'
  )),

  -- Financiers acquisition
  prix_acquisition  numeric(14,2) not null,
  frais_notaire     numeric(14,2) not null default 0,
  cout_travaux      numeric(14,2) not null default 0,
  valeur_estimee    numeric(14,2),

  -- Revenus & charges
  revenus_annuels   numeric(14,2) not null default 0,
  charges_annuelles numeric(14,2) not null default 0,
  mensualite_credit numeric(14,2),

  -- DPE & conformité
  dpe_classe        text check (dpe_classe in ('A','B','C','D','E','F','G')),
  huwart_conforme   boolean,
  huwart_echeance   date,

  notes             text,

  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- Index
create index on public.actifs_portefeuille(user_id);
create index on public.actifs_portefeuille(statut);
create index on public.actifs_portefeuille(classe_actif);

-- RLS
alter table public.actifs_portefeuille enable row level security;

create policy "Utilisateurs voient leurs propres actifs"
  on public.actifs_portefeuille for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- ── Table : benchmarks_regionaux ─────────────────────────────────────────────
-- Données de benchmarks par région/département (lecture seule pour tous les users)

create table if not exists public.benchmarks_regionaux (
  id                uuid primary key default uuid_generate_v4(),
  dept_code         text not null,
  region_code       text,
  classe_actif      text not null,
  revpar_median     numeric(8,2),
  rendement_median  numeric(5,2),
  prix_m2_median    numeric(10,2),
  taux_vacance_pct  numeric(5,2),
  source            text,
  annee_donnees     integer,
  created_at        timestamptz not null default now()
);

create index on public.benchmarks_regionaux(dept_code, classe_actif);

-- Lecture publique pour les utilisateurs connectés
alter table public.benchmarks_regionaux enable row level security;

create policy "Lecture benchmarks pour utilisateurs connectés"
  on public.benchmarks_regionaux for select
  using (auth.role() = 'authenticated');


-- ── Trigger : updated_at automatique ─────────────────────────────────────────

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at_opportunites
  before update on public.opportunites_radar
  for each row execute function public.set_updated_at();

create trigger set_updated_at_actifs
  before update on public.actifs_portefeuille
  for each row execute function public.set_updated_at();


-- ── Données de test (optionnel) ───────────────────────────────────────────────
-- Décommenter pour insérer des données de démo

/*
-- Insérer une opportunité de demo (remplace 'VOTRE_USER_ID' par votre UUID Supabase)
insert into public.opportunites_radar (user_id, nom, commune, dept_code, classe_actif, prix_demande, nombre_chambres, revpar_estime, taux_occupation_estime, keyscore, statut)
values
  ('VOTRE_USER_ID', 'Hôtel du Commerce', 'Bordeaux', '33', 'hotel', 850000, 28, 72, 65, 78, 'nouvelle'),
  ('VOTRE_USER_ID', 'Camping Les Pins', 'Arcachon', '33', 'camping', 1200000, null, null, 70, 65, 'en_analyse');

-- Insérer un actif de demo
insert into public.actifs_portefeuille (user_id, nom, commune, dept_code, classe_actif, statut, prix_acquisition, frais_notaire, cout_travaux, valeur_estimee, revenus_annuels, charges_annuelles, mensualite_credit, dpe_classe)
values
  ('VOTRE_USER_ID', 'Hôtel Le Bellevue', 'Biarritz', '64', 'hotel', 'actif', 2400000, 192000, 350000, 3100000, 280000, 85000, 12500, 'C');
*/

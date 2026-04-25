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


-- ── Table : api_integrations ─────────────────────────────────────────────────
-- Clés API que l'utilisateur configure depuis la page Settings.
-- Les credentials sont stockés chiffrés (pgcrypto) ; jamais lus côté client.

create extension if not exists pgcrypto;

create table if not exists public.api_integrations (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid references auth.users(id) on delete cascade not null,

  -- Identifiant du service (cf. registry.ts)
  service           text not null,

  -- Credentials chiffrés (jsonb chiffré en bytea via pgp_sym_encrypt)
  -- Schema : { api_key: "...", consumer_key: "...", ... }
  credentials_enc   bytea,

  -- Métadonnées
  is_active         boolean not null default true,
  last_test_at      timestamptz,
  last_test_status  text check (last_test_status in ('ok', 'fail', 'untested')),
  last_test_message text,
  last_used_at      timestamptz,

  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  unique(user_id, service)
);

create index on public.api_integrations(user_id);
create index on public.api_integrations(service);

alter table public.api_integrations enable row level security;

create policy "Utilisateurs gèrent leurs propres clés API"
  on public.api_integrations for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger set_updated_at_integrations
  before update on public.api_integrations
  for each row execute function public.set_updated_at();


-- ── Données de test (optionnel) ───────────────────────────────────────────────
-- Décommenter pour insérer des données de démo

/*
-- Insérer une opportunité de demo (remplace 'VOTRE_USER_ID' par votre UUID Supabase)
insert into public.opportunites_radar (user_id, nom, commune, dept_code, classe_actif, prix_demande, nombre_chambres, revpar_estime, taux_occupation_estime, keyscore, statut)
values
  ('VOTRE_USER_ID', 'Hôtel du Commerce', 'Bordeaux', '33', 'hotel', 850000, 28, 72, 65, 78, 'nouvelle'),
  ('VOTRE_USER_ID', 'Camping Les Pins', 'Arcachon', '33', 'camping', 1200000, null, null, 70, 65, 'en_analyse');
*/

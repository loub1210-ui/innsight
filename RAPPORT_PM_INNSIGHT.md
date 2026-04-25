# RAPPORT CHEF DE PROJET — INNSIGHT

_Dernière mise à jour : 25/04/2026 — Synthèse post RDV Antonin_

---

## 1. CONTEXTE — Pour qui on construit le site

**Client : Alfred Hotels** — opérateur d'hôtels « bureau » (sans restauration) pour clientèle corpo internationale.

### Cible idéale Alfred (KPI Type Hotel)
| Critère | Cible |
|---|---|
| Type | Hôtel bureau (sans restauration) |
| Achat | Murs (valeur refuge) + fonds |
| Ville | Taille moyenne, **50 à 200k habitants** |
| Capacité | **≥ 50 chambres** (villes ≥ 50k hab. et non « premium ») |
| RH | < 10 salariés / hôtel |
| Segment | **2–3–4 étoiles** (3–4★ le plus rentable, 2★ inclus) |
| Emplacement | **Cœur de ville + proche d'une gare** |
| Mix client | 75 % domestique min — **65 % corpo / 35 % loisirs** |
| Économie | > 1,5 M€ de CA, > 35 % d'EBITDA |

### Profil clientèle Alfred
- 30 % Marocains (secteur public + grandes entreprises), 30 % Français, 25 % Européens, 15 % Africains subsahariens
- Secteurs : banque/finance, BTP, énergie, conseil, télécom, pharma, salons, événementiel, immobilier
- Voyageurs masculins à 70 %, cadres / consultants / techniciens 35–60 ans
- Durée séjour : 1 à 3 nuits (mardi → jeudi)
- Référence concurrentielle : 4* urbains type Barcelo / Kenzi / Radisson + apparthôtels & clubs business type Casa Finance City

> **Conséquence pour Innsight** : tous les filtres et ratios par défaut doivent être calibrés pour ce profil (villes 100k+ habitants, hôtels indépendants 3–4*, proximité gare).

---

## 2. CE QUI A ÉTÉ FAIT SUR LE SITE

### Stack technique
- **Next.js 14 App Router**, TypeScript strict, Tailwind, Radix UI, lucide-react
- **Supabase** (auth Magic Link + RLS) + `@tanstack/react-query` + Zustand + Zod
- **Recharts** prêt mais non encore branché

### Structure actuelle (`src/`)
```
app/
  (auth)/login                   ← Magic Link Supabase
  (dashboard)/
    radar/                       ← Liste opportunités + détail + ajout
    synthetiseur/                ← Marché par ville (12 villes)
    settings/                    ← (vide)
  api/market-data/               ← DVF + INSEE pour prix/m² et population
components/layout/Sidebar.tsx    ← Nav : Radar / Synthétiseur / Settings
components/radar/RadarContent.tsx
components/synthetiseur/SynthetiseurContent.tsx
services/opportunites.ts         ← CRUD Supabase opportunités
services/portfolio.ts            ← ⚠️ PORTFOLIO non exposé dans la nav
utils/finance/                   ← ⚠️ rendement, marge, cashflow, tri non utilisés
types/index.ts                   ← Types Opportunite + ActifPortefeuille (inutilisé)
lib/supabase/{client,server}.ts
scripts/scrape-hotels.ts         ← Squelette scraping BureauxLocaux + Commerce-Immo
```

### Fonctionnalités opérationnelles
1. **Auth** Magic Link Supabase + middleware de redirection
2. **Radar** : grille opportunités (filtres classe d'actif, ville, recherche), fiche détail, formulaire d'ajout manuel
3. **Synthétiseur** : 12 villes (Paris, Lyon, Marseille, Bordeaux, Lille, Toulouse, Nice, Nantes, Strasbourg, Montpellier, Rennes, Grenoble) avec RevPAR, occupation, prix/m², rendement brut, prix chambre moyenne, nb hôtels zone gare, touristes/an, population, score d'attractivité, tendance
4. **API live** `/api/market-data` : DVF (prix/m² médian, nb transactions) + INSEE (population) — cache 24 h / 7 j
5. **Sources documentaires** : MKG Group, In Extenso, MeilleursAgents, INSEE, Atout France, CBRE, C&W (panneau dépliant)
6. **DB Supabase** : tables `opportunites_radar`, `actifs_portefeuille`, `benchmarks_regionaux` + RLS + trigger `updated_at`

---

## 3. INVENTAIRE DU CODE OBSOLÈTE À NETTOYER

> Suppression non autorisée depuis l'agent — voici la liste à passer manuellement (tu peux aussi confirmer ici et je relancerai la commande).

### Dans `innsight/`
| Chemin | Raison |
|---|---|
| `src/services/portfolio.ts` | Pilier Portfolio non exposé dans la sidebar |
| `src/utils/finance/cashflow.ts` | Importé seulement par `portfolio.ts` |
| `src/utils/finance/marge.ts` | Idem |
| `src/utils/finance/rendement.ts` | Idem |
| `src/utils/finance/tri.ts` | Idem |
| `tsconfig.tsbuildinfo` | Artefact build (102 ko) |
| `InnSight.url` | Raccourci Windows hors source |
| Types dans `src/types/index.ts` : `ActifPortefeuille*`, `BenchmarkRegional`, `STATUT_ACTIF_LABELS`, `DPE_COLORS` | Liés à Portfolio |
| Table SQL `actifs_portefeuille` + `benchmarks_regionaux` | Inutilisées (laisser tant que la décision Portfolio n'est pas tranchée) |

### Dans le dossier parent `Chercheur d'hotel/`
| Chemin | Raison |
|---|---|
| `innsight.zip` (139 Mo) | Backup obsolète |
| `hotel-dashboard/` | Proto Vite vide (un index, pas relié à Innsight) |
| `propscan/` | Ancien projet React Native Expo (PropScan IA) remplacé par Innsight |
| `propscan/innsight.zip`, `propscan/zizcufUv` | Doublons binaires |
| `Nouveau dossier/` | Vide |
| `RDV anto/Weekly Acquisition Meeting_compressed (1)-1.pdf` | Doublon exact du fichier sans `-1` |
| `RDV anto/~$te ANTONIN 260424.docx` | Fichier verrou Word |

---

## 4. CE QUE LA NOTE ANTONIN DEMANDE — GAP ANALYSIS

### Ratios attendus à l'ouverture du site

| Ratio demandé | État actuel | Action |
|---|---|---|
| **Hôtels / m² (par ville)** | ❌ absent | À calculer (nb hôtels INSEE / surface ville) — afficher en KPI principal |
| **Hôtels indépendants / m²** | ❌ absent | Filtrer base hôtels par chaîne, recalculer |
| **Ratios séparés 2★ / 3★ / 4★** | ❌ absent | ✅ Décomposition par étoiles (les 3 catégories cibles Alfred) |
| **MICE estimé** | ❌ absent | **« LE RATIO LE PLUS IMPORTANT »** selon Anto — à dériver des PDFs marché |
| **ADR moyen + profil clientèle** | ⚠️ partiel (RevPAR seul) | Ajouter ADR et étiquette de clientèle type |
| **Touristes annuels / m²** | ⚠️ touristes/an seul | Ajouter ratio /m² |
| **Touristes × NB hôtels / m²** | ❌ absent | Conjecture demandée par Anto |
| **NB entreprises implantées + groupes** | ❌ absent | Source SIRENE / API INSEE |
| **NB hôtels / lignes de groupe** | ❌ absent | À spécifier avec Anto |
| **Ratio à supprimer : Taux d'occupation** | ⚠️ encore présent | À retirer du Synthétiseur |

### Fonctionnalités produit demandées

| Demande Anto | État | Action |
|---|---|---|
| **Cible villes moyennes 100k+ habitants** | ⚠️ 12 grandes villes seulement | Élargir à toutes les villes 100k–500k (Metz, Pau, La Rochelle, Dieppe, Colmar, Dijon, Reims, Tours, Limoges, Brest, Caen, Angers, Le Mans, Clermont, Nîmes, Saint-Étienne, Le Havre, Toulon…) — cf. Weekly Acquisition Meeting |
| **Frise des événements par ville (concerts, salons, festivals)** | ❌ | Scraper des sites tourisme officiels |
| **Cliquer un ratio → accéder aux sources** | ⚠️ Sources globales seulement | Lien direct par ratio → URL source |
| **Résumé IA par ville** (avec hôtels au prix anormalement bas) | ❌ | Ajouter résumé GPT/Claude par ville |
| **Notes Booking par hôtel** | ❌ | Scraper Booking par fiche hôtel |
| **Analyse concurrence + noms** | ❌ | Liste comparative dans la fiche ville |
| **Lien vers annonces (broker)** | ⚠️ champ `url_source` existe | Bouton dédié visible dans la grille |
| **Attractivité économique : projets mairie, autoroute, train, avion, implantations** | ❌ | Bloc dédié + sources cliquables |
| **Cliquer = voir les sources** | ⚠️ | Généraliser |
| **Hôtels indépendants : contact dirigeant + tel** | ❌ | Scraping `societe.com` du dirigeant + numéro |
| **Liens vers bilans (Pappers, Infogreffe)** | ❌ | À ajouter sur fiche opportunité |
| **Case Camping option** | ⚠️ classe_actif `camping` existe | Toggle UI dédié |
| **Refresh manuel + scraping max 1×/mois** | ⚠️ scraping mensuel non plannifié | Cron + bouton « Rafraîchir » |
| **Frise saisonnalité événements** | ❌ | Composant timeline Recharts |

### Direction stratégique
Le profil Alfred (Casa Finance City, corpo) implique de **prioriser les villes business / institutionnelles** et de pondérer le score d'attractivité avec :
- présence MICE / centres de congrès
- proximité gare TGV
- nb d'entreprises et de sièges (indicateur business)
- saisonnalité (Strasbourg = Noël ADR killer ; Toulon = saison estivale)
- projets structurants (BHNS Toulon, Tram Nord Strasbourg, croisières, aéroport…)

---

## 4 ter. PROTOTYPE DEMO — Sprint 1 livré sans API (25/04/2026)

✅ **Synthétiseur refondu** (vue grille `/synthetiseur`) :
- Tri par : Score, **MICE/km²**, Hôtels/km², ADR, Rendement, Prix /m²
- Filtres : étoiles **2★/3★/4★** + toggle **Camping**
- Bouton **Rafraîchir** avec timestamp
- Cards villes avec ratios coeur Anto en évidence : Hôtels/km², Indé/km², MICE/an, ADR
- Badge **HMA** sur les 6 villes prioritaires (remontées en tête)
- Décompte 2★/3★/4★ visible sur chaque card
- **Taux d'occupation supprimé** (demande Anto)

✅ **Page détail ville** `/synthetiseur/[slug]` :
- Carte d'identité (population intra/métropole/aire d'attraction, surface)
- **12 ratios coeur cliquables** : chaque ratio ouvre la liste de ses sources (URL directes)
- Badge "LE + IMPORTANT" sur le ratio **MICE / an**
- Ratios par étoiles 2/3/4 séparés
- **Conjecture Touristes × Hôtels / km²** d'Anto
- **Résumé IA** par ville (mock Claude — texte calibré sur les fiches Strasbourg/Toulon)
- **Frise saisonnalité événements** (12 mois, code couleur impact ADR fort/moyen/faible)
- **Attractivité économique & projets structurants** (catégories transport/urbanisme/équipement, sources cliquables)
- **Analyse concurrence** : liste des hôtels par note Booking, badge "Indé" et "Prix bas", panneau dépliant avec dirigeant + téléphone + bilan Pappers
- **Brokers actifs** sur la zone

✅ **Dataset mock** (`src/data/villes.ts`) — 12 villes :
- 6 prioritaires HMA enrichies : Strasbourg, Toulon, Colmar, Dijon, Nice, Nantes
- 6 secondaires : Metz, Pau, La Rochelle, Reims, Tours, Le Havre
- Pour chaque ville prioritaire : 4-7 hôtels concurrents (notes Booking, prix, indé, dirigeants, prix bas), 4-7 projets structurants, 3-6 événements saisonniers
- Toutes les données calibrées sur les fiches Antonin et le Weekly Acquisition Meeting

🔌 **Aucune API externe requise** pour la démo — tout est statique. Dès que tu veux passer en live, brancher les API dans Settings et remplacer les imports `@/data/villes` par des appels `/api/...`.

---

## 4 bis. AJOUT DU 25/04/2026 — Module Intégrations API (Settings)

✅ Livré :
- Page **Settings → Intégrations API** avec 17 services (DVF, INSEE Géo/BPE/SIRENE, Pappers, Infogreffe, Societe.com, MKG, In Extenso, Atout France, Booking, Tripadvisor, Google Places, Anthropic, OpenAI, Mapbox, Google Maps)
- Catégorisation : Données publiques / Entreprises / Hôtellerie marché / Avis / IA / Cartes
- Pour chaque service : badge gratuit/freemium/payant, badge "requis", lien doc, bouton **Tester** (test live), bouton **Enregistrer**, bouton **Supprimer**
- **Sécurité** : clés chiffrées AES-256-GCM avant stockage Supabase, jamais exposées au navigateur. Masquage par défaut dans l'UI.
- Fallback : possibilité de définir une clé via `.env.local` (`<SERVICE>_API_KEY`)
- Table SQL `api_integrations` avec RLS user-scoped + `pgcrypto`
- Helper serveur `useCredentials(service)` à utiliser dans les routes `/api/*`

🔧 Conf à appliquer 1 fois :
- Générer `APP_ENCRYPTION_KEY` (32 bytes hex) dans `.env.local`
- Exécuter `supabase_schema.sql` (création table + extension `pgcrypto`)

---

## 5. PLAN D'ACTION PROPOSÉ — 3 SPRINTS

### Sprint 1 (1 semaine) — Refonte fiche ville + ratios coeur
1. Retirer le ratio « Taux d'occupation » du Synthétiseur
2. Ajouter dans la fiche ville :
   - Hôtels / km² (total + indépendants + par étoiles)
   - MICE estimé (nombre d'événements/an + visiteurs MICE)
   - ADR moyen
   - Touristes/an / km²
   - NB entreprises (SIRENE)
3. Étendre `VILLES_DATA` à toutes les villes 100k+ habitants ciblées par Alfred
4. Chaque ratio → tooltip + lien direct vers la source

### Sprint 2 (1–2 semaines) — Données live + scraping
1. API INSEE BPE (Base Permanente des Équipements) → nb hôtels par commune et par catégorie (2/3/4★)
2. API SIRENE → nb entreprises par commune
3. Scraping Booking pour notes hôtels (max 1×/mois, déclenchable manuellement)
4. Scraping Pappers / Societe.com pour dirigeants + tel des hôtels indépendants
5. Bouton « Rafraîchir » avec timestamp dernière maj

### Sprint 3 (1 semaine) — Analyse & enrichissement
1. Résumé IA par ville (Claude API) : 200 mots + hôtels au prix anormalement bas
2. Analyse concurrence par opportunité
3. Frise événements (saisonnalité festivals, salons, concerts)
4. Bloc « Attractivité économique » : projets mairie + transport (sources Strasbourg/Toulon comme template)
5. Liens bilans (Pappers, Infogreffe) sur fiche hôtel

---

## 6. ARBITRAGES VALIDÉS (25/04/2026)

| Sujet | Décision Louis |
|---|---|
| **Étoiles cibles** | ✅ Inclure **2★ + 3★ + 4★** (les 3 catégories) |
| **Camping** | ✅ Activé, **mêmes critères** que les hôtels (taille ville, gare, ratio /m²…) — toggle UI dédié |
| **API payantes** | ✅ OK — **1 actualisation / mois max** pour cap budget (Pappers + Infogreffe + INSEE BPE) |
| **Scraping Booking & autres** | ✅ OK — Booking + sources additionnelles si nécessaire (Tripadvisor, Google Places) — toujours 1×/mois |
| **Short-list villes** | ✅ OK — démarrer avec les **6 villes prioritaires HMA** : Strasbourg, Colmar, Dijon, Toulon, Nice, Nantes — puis élargir aux 100k+ habitants |
| **Pilier Portfolio** | ❌ **Supprimé** — code Portfolio à retirer (services, utils finance, types, table SQL) |

### Conséquences immédiates pour le code
- Bloc « Étoiles » dans la fiche ville : afficher 3 colonnes 2★ / 3★ / 4★ (pas seulement 3-4)
- Filtre `classe_actif` Radar : `camping` doit garder le même panneau de ratios que `hotel`
- Cron mensuel : un seul job qui lance scraping + appels API payantes + refresh DVF/INSEE
- Liste villes par défaut au lancement = les 6 prioritaires HMA, le reste accessible via recherche

---

_Rapport généré pour servir de référence projet. À synchroniser avec le board d'avancement après validation._

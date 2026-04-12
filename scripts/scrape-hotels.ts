/**
 * Script de scraping d'annonces hôtelières
 *
 * Sources supportées :
 * - BureauxLocaux.com (annonces commerciales)
 * - Commerce-Immo.com (fonds de commerce hôteliers)
 *
 * Usage :
 *   npx tsx scripts/scrape-hotels.ts
 *
 * Variables d'environnement requises :
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY  (pas la clé anon, pour bypasser RLS)
 *
 * Pour un cron automatique, ajouter dans package.json :
 *   "scrape": "tsx scripts/scrape-hotels.ts"
 *
 * Architecture :
 * 1. Fetch les pages de résultats depuis les sources
 * 2. Parse les annonces (titre, prix, ville, lien)
 * 3. Déduplique par URL source
 * 4. Insère les nouvelles annonces dans Supabase
 */

import { createClient } from '@supabase/supabase-js'

// ─── Config ──────────────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Villes cibles (proches gares)
const VILLES_CIBLES = [
  'Paris', 'Lyon', 'Marseille', 'Bordeaux', 'Lille', 'Toulouse',
  'Nice', 'Nantes', 'Strasbourg', 'Montpellier', 'Rennes', 'Grenoble',
]

const DEPT_MAP: Record<string, string> = {
  'Paris': '75', 'Lyon': '69', 'Marseille': '13', 'Bordeaux': '33',
  'Lille': '59', 'Toulouse': '31', 'Nice': '06', 'Nantes': '44',
  'Strasbourg': '67', 'Montpellier': '34', 'Rennes': '35', 'Grenoble': '38',
}

interface ScrapedAnnonce {
  nom: string
  commune: string
  dept_code: string
  prix_demande: number | null
  classe_actif: string
  url_source: string
  nombre_chambres: number | null
  surface_m2: number | null
  notes: string | null
}

// ─── Scraper: BureauxLocaux ──────────────────────────────────────────────────

async function scrapeBureauxLocaux(ville: string): Promise<ScrapedAnnonce[]> {
  const annonces: ScrapedAnnonce[] = []
  const dept = DEPT_MAP[ville]
  if (!dept) return annonces

  try {
    // BureauxLocaux search URL for hotels
    const url = `https://www.bureauxlocaux.com/recherche/achat-hotel/${dept}`
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html',
      },
    })

    if (!res.ok) {
      console.log(`  BureauxLocaux ${ville}: HTTP ${res.status}`)
      return annonces
    }

    const html = await res.text()

    // Simple regex-based extraction (no heavy DOM parser needed)
    // Look for listing cards with title, price, location
    const listingPattern = /<a[^>]*href="(\/annonce\/[^"]+)"[^>]*>[\s\S]*?<h[23][^>]*>(.*?)<\/h[23]>[\s\S]*?(?:(\d[\d\s]*)\s*€)?/gi
    let match

    while ((match = listingPattern.exec(html)) !== null) {
      const [, path, titre, prixStr] = match
      if (!titre) continue

      const prix = prixStr ? parseInt(prixStr.replace(/\s/g, ''), 10) : null

      annonces.push({
        nom: titre.replace(/<[^>]+>/g, '').trim(),
        commune: ville,
        dept_code: dept,
        prix_demande: prix,
        classe_actif: 'hotel',
        url_source: `https://www.bureauxlocaux.com${path}`,
        nombre_chambres: null,
        surface_m2: null,
        notes: `[Auto-scraping] BureauxLocaux - ${new Date().toISOString().split('T')[0]}`,
      })
    }

    console.log(`  BureauxLocaux ${ville}: ${annonces.length} annonce(s)`)
  } catch (err) {
    console.error(`  BureauxLocaux ${ville}: erreur`, err)
  }

  return annonces
}

// ─── Scraper: Commerce-Immo ──────────────────────────────────────────────────

async function scrapeCommerceImmo(ville: string): Promise<ScrapedAnnonce[]> {
  const annonces: ScrapedAnnonce[] = []
  const dept = DEPT_MAP[ville]
  if (!dept) return annonces

  try {
    const url = `https://www.commerce-immo.com/annonces/hotel/${ville.toLowerCase()}`
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html',
      },
    })

    if (!res.ok) {
      console.log(`  Commerce-Immo ${ville}: HTTP ${res.status}`)
      return annonces
    }

    const html = await res.text()

    // Extract listings
    const listingPattern = /<a[^>]*href="(\/annonce[^"]+)"[^>]*>[\s\S]*?<h[23][^>]*>(.*?)<\/h[23]>[\s\S]*?(?:(\d[\d\s]*)\s*€)?/gi
    let match

    while ((match = listingPattern.exec(html)) !== null) {
      const [, path, titre, prixStr] = match
      if (!titre) continue

      const prix = prixStr ? parseInt(prixStr.replace(/\s/g, ''), 10) : null

      annonces.push({
        nom: titre.replace(/<[^>]+>/g, '').trim(),
        commune: ville,
        dept_code: dept,
        prix_demande: prix,
        classe_actif: 'hotel',
        url_source: `https://www.commerce-immo.com${path}`,
        nombre_chambres: null,
        surface_m2: null,
        notes: `[Auto-scraping] Commerce-Immo - ${new Date().toISOString().split('T')[0]}`,
      })
    }

    console.log(`  Commerce-Immo ${ville}: ${annonces.length} annonce(s)`)
  } catch (err) {
    console.error(`  Commerce-Immo ${ville}: erreur`, err)
  }

  return annonces
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🏨 InnSight - Scraping annonces hôtelières')
  console.log('━'.repeat(50))

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Variables NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY requises')
    console.log('\nCréez un fichier .env.local avec :')
    console.log('  NEXT_PUBLIC_SUPABASE_URL=https://okkjxouukiyuxfczyhhj.supabase.co')
    console.log('  SUPABASE_SERVICE_ROLE_KEY=votre_clé_service')
    process.exit(1)
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  // Get existing URLs to avoid duplicates
  const { data: existing } = await supabase
    .from('opportunites_radar')
    .select('url_source')
    .not('url_source', 'is', null)

  const existingUrls = new Set((existing || []).map(e => e.url_source))
  console.log(`📊 ${existingUrls.size} annonce(s) existante(s) en base\n`)

  let totalNew = 0

  for (const ville of VILLES_CIBLES) {
    console.log(`\n🔍 ${ville} :`)

    const [bureauxLocaux, commerceImmo] = await Promise.all([
      scrapeBureauxLocaux(ville),
      scrapeCommerceImmo(ville),
    ])

    const allAnnonces = [...bureauxLocaux, ...commerceImmo]
      .filter(a => !existingUrls.has(a.url_source))

    if (allAnnonces.length === 0) {
      console.log('  → Aucune nouvelle annonce')
      continue
    }

    // Insert new listings
    // Note: using service role key bypasses RLS
    // We need to assign a user_id - use the first user in the system
    const { data: users } = await supabase.auth.admin.listUsers()
    const userId = users?.users?.[0]?.id

    if (!userId) {
      console.error('  ❌ Aucun utilisateur trouvé dans Supabase')
      continue
    }

    const toInsert = allAnnonces.map(a => ({
      ...a,
      user_id: userId,
      statut: 'nouvelle',
      keyscore: null,
      region_code: null,
    }))

    const { error } = await supabase.from('opportunites_radar').insert(toInsert)

    if (error) {
      console.error(`  ❌ Erreur insertion: ${error.message}`)
    } else {
      console.log(`  ✅ ${allAnnonces.length} nouvelle(s) annonce(s) ajoutée(s)`)
      totalNew += allAnnonces.length
    }

    // Rate limiting - be respectful
    await new Promise(r => setTimeout(r, 1000))
  }

  console.log('\n' + '━'.repeat(50))
  console.log(`✅ Terminé. ${totalNew} nouvelle(s) annonce(s) au total.`)
}

main().catch(console.error)

import { NextResponse } from 'next/server'

const VILLES = [
  'Paris', 'Lyon', 'Marseille', 'Bordeaux', 'Lille', 'Toulouse',
  'Nice', 'Nantes', 'Strasbourg', 'Montpellier', 'Rennes', 'Grenoble',
]

export async function GET(request: Request) {
  const baseUrl = new URL(request.url).origin

  // Fetch all cities in parallel
  const results = await Promise.all(
    VILLES.map(async (ville) => {
      try {
        const res = await fetch(`${baseUrl}/api/market-data?ville=${encodeURIComponent(ville)}`, {
          next: { revalidate: 86400 }, // Cache 24h
        })
        if (!res.ok) return { ville, error: true }
        return await res.json()
      } catch {
        return { ville, error: true }
      }
    })
  )

  return NextResponse.json({
    villes: results,
    derniere_maj: new Date().toISOString(),
  })
}

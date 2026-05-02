/** Server-side geocoding (Nominatim). No Google billing. */

const UA = 'MonferratoImmobiliare/1.0 (https://github.com/)'

export type GeocodeResult = { lat: number; lng: number; display_name?: string }

export async function geocodeItaliaAddress(parts: {
  indirizzo?: string | null
  citta?: string | null
}): Promise<GeocodeResult | null> {
  const q = [parts.indirizzo?.trim(), parts.citta?.trim(), 'Italia'].filter(Boolean).join(', ')
  if (q.replace(/,/g, '').trim().length < 4) return null

  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1&countrycodes=it`
  const res = await fetch(url, { headers: { 'User-Agent': UA } })
  if (!res.ok) return null
  const data = (await res.json()) as Array<{ lat: string; lon: string; display_name?: string }>
  if (!data?.length) return null
  return {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon),
    display_name: data[0].display_name,
  }
}

/** Deterministic ~150–400m offset so approximate listings don’t pinpoint the door. */
export function applyPrivacyJitter(lat: number, lng: number, seed: string): GeocodeResult {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = Math.imul(31, h) + seed.charCodeAt(i) | 0
  const ang = ((Math.abs(h) % 628) / 100) * Math.PI / 50
  const dist = 0.0012 + (Math.abs(h >> 7) % 1800) / 1_000_000
  return {
    lat: lat + Math.cos(ang) * dist,
    lng: lng + Math.sin(ang) * dist,
  }
}

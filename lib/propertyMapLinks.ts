/**
 * Mappa pubblica scheda: con posizione approssimativa non esponiamo coordinate
 * (embed, “Apri in Google Maps” e centro mappa = comune).
 */
export function propertyMapPlaceQuery(
  isApproximate: boolean,
  municipality: string | null | undefined,
  lat: number,
  lng: number,
): { q: string; z: number; usesExactCoords: boolean } {
  const city = municipality?.trim()
  if (isApproximate && city) {
    return { q: `${city}, Italia`, z: 12, usesExactCoords: false }
  }
  return { q: `${lat},${lng}`, z: isApproximate ? 13 : 16, usesExactCoords: true }
}

export function propertyMapEmbedSrc(
  isApproximate: boolean,
  municipality: string | null | undefined,
  lat: number,
  lng: number,
): string {
  const { q, z } = propertyMapPlaceQuery(isApproximate, municipality, lat, lng)
  return `https://maps.google.com/maps?q=${encodeURIComponent(q)}&z=${z}&output=embed`
}

/** Link per aprire Maps (stessa logica dell’embed: comune se approssimativo). */
export function propertyMapExternalHref(
  isApproximate: boolean,
  municipality: string | null | undefined,
  lat: number,
  lng: number,
): string {
  const { q } = propertyMapPlaceQuery(isApproximate, municipality, lat, lng)
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`
}

/**
 * Ordina per home / cataloghi: prima gli in evidenza (by viste DESC), poi il resto (by data creazione DESC).
 */

export type SortablePublishRow = {
  featured?: boolean | null
  viste?: number | null
  created_at?: string | null
}

export function sortFeaturedFirstByViewsThenRest<T extends SortablePublishRow>(rows: T[]): T[] {
  const featured = rows.filter((r) => r.featured).sort((a, b) => (b.viste ?? 0) - (a.viste ?? 0))
  const rest = rows
    .filter((r) => !r.featured)
    .sort((a, b) => {
      const tb = new Date(b.created_at ?? 0).getTime()
      const ta = new Date(a.created_at ?? 0).getTime()
      return tb - ta
    })
  return [...featured, ...rest]
}

export function takeFeaturedOrderedHomeCarousel<T extends SortablePublishRow>(rows: T[], limit = 6): T[] {
  return sortFeaturedFirstByViewsThenRest(rows).slice(0, limit)
}

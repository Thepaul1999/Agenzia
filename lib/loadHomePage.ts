import { createClient } from '@/lib/server'
import fs from 'node:fs/promises'
import path from 'node:path'
import { getPublishedPageContent } from '@/lib/cms/serverApi'
import { takeFeaturedOrderedHomeCarousel } from '@/lib/sortPublishedProperties'
import { countImmobileViewsThisMonthById } from '@/lib/monthlyImmobileViews'
import { isAdminSession } from '@/lib/adminSession'

export type HomePageLoaderResult = {
  isAdmin: boolean
  properties: Array<{
    id: string
    titolo: string
    slug: string
    citta: string | null
    prezzo: number | null
    immaginecopertina: string | null
    descrizione: string | null
    featured: boolean | null
    tipo_contratto: string | null
    mq: number | null
    locali: number | null
    /** Visite cliente nel mese corrente (UTC), solo per in evidenza in home */
    visiteClienteQuestoMese?: number
  }>
  homeContent: Record<string, unknown>
  cmsContent: Awaited<ReturnType<typeof getPublishedPageContent>> | null
}

export async function loadHomePageData(): Promise<HomePageLoaderResult> {
  const isAdmin = await isAdminSession()

  const supabase = await createClient()

  const { data: pool } = await supabase
    .from('immobili')
    .select(
      'id, titolo, slug, citta, prezzo, immaginecopertina, descrizione, featured, tipo_contratto, mq, locali, viste, created_at',
    )
    .eq('pubblicato', true)
    .limit(80)

  const sorted = takeFeaturedOrderedHomeCarousel(pool ?? [], 6)
  const featuredIds = sorted.filter((p) => p.featured).map((p) => p.id as string)
  const monthMap = await countImmobileViewsThisMonthById(featuredIds)

  const properties = sorted.map((row) => {
    const id = row.id as string
    const featured = Boolean(row.featured)
    return {
      id,
      titolo: row.titolo as string,
      slug: row.slug as string,
      citta: row.citta as string | null,
      prezzo: row.prezzo as number | null,
      immaginecopertina: row.immaginecopertina as string | null,
      descrizione: row.descrizione as string | null,
      featured: row.featured as boolean | null,
      tipo_contratto: row.tipo_contratto as string | null,
      mq: row.mq as number | null,
      locali: row.locali as number | null,
      ...(featured ? { visiteClienteQuestoMese: monthMap[id] ?? 0 } : {}),
    }
  })
  let homeContent: Record<string, unknown> = {}
  try {
    const raw = await fs.readFile(path.join(process.cwd(), 'editor-data', 'home-content.json'), 'utf8')
    homeContent = JSON.parse(raw) as Record<string, unknown>
  } catch {
    homeContent = {}
  }

  const cmsContent = await getPublishedPageContent('home').catch(() => null)
  const cmsHasBlocks = Boolean(cmsContent && cmsContent.blocks && cmsContent.blocks.length > 0)

  return {
    isAdmin,
    properties,
    homeContent,
    cmsContent: cmsHasBlocks ? cmsContent : null,
  }
}

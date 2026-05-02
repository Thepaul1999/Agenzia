import { cookies } from 'next/headers'
import { createClient } from '@/lib/server'
import fs from 'node:fs/promises'
import path from 'node:path'
import { getPublishedPageContent } from '@/lib/cms/serverApi'

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
  }>
  homeContent: Record<string, unknown>
  cmsContent: Awaited<ReturnType<typeof getPublishedPageContent>> | null
}

export async function loadHomePageData(): Promise<HomePageLoaderResult> {
  const cookieStore = await cookies()
  const isAdmin = cookieStore.get('site_admin')?.value === 'true'

  const supabase = await createClient()

  const { data: immobili } = await supabase
    .from('immobili')
    .select('id, titolo, slug, citta, prezzo, immaginecopertina, descrizione, featured, tipo_contratto, mq, locali')
    .eq('pubblicato', true)
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(6)

  const properties = immobili ?? []
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

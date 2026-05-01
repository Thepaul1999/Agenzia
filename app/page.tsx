import { cookies } from 'next/headers'
import HomePage from './HomePage'
import { createClient } from '@/lib/server'
import fs from 'node:fs/promises'
import path from 'node:path'
import { getPublishedPageContent } from '@/lib/cms/serverApi'

export const revalidate = 60

export default async function Page() {
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
  let homeContent = {}
  try {
    const raw = await fs.readFile(path.join(process.cwd(), 'editor-data', 'home-content.json'), 'utf8')
    homeContent = JSON.parse(raw)
  } catch {
    homeContent = {}
  }

  // Pull CMS published content for the home (if available).
  const cmsContent = await getPublishedPageContent('home').catch(() => null)
  const cmsHasBlocks = Boolean(cmsContent && cmsContent.blocks && cmsContent.blocks.length > 0)

  return (
    <HomePage
      properties={properties}
      isAdmin={isAdmin}
      homeContent={homeContent}
      cmsContent={cmsHasBlocks ? cmsContent : null}
    />
  )
}

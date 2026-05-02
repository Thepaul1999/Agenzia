import { notFound } from 'next/navigation'
import { getDraftPageContent } from '@/lib/cms/serverApi'
import { PAGE_CATALOG } from '@/lib/cms/defaults'
import { createAdminClient } from '@/lib/server'
import Builder from './Builder'

export const dynamic = 'force-dynamic'

type Params = { params: Promise<{ slug: string }> }

export default async function BuilderPage({ params }: Params) {
  const { slug } = await params
  const cat = PAGE_CATALOG.find((p) => p.slug === slug)
  if (!cat) notFound()

  const content = await getDraftPageContent(slug)

  // Pre-load some sample properties so the renderer can show the
  // properties carousel block in the canvas.
  let properties: unknown[] = []
  try {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('immobili')
      .select('id, titolo, slug, citta, prezzo, immaginecopertina, descrizione, featured, tipo_contratto, mq, locali')
      .eq('pubblicato', true)
      .limit(8)
    properties = data ?? []
  } catch {
    properties = []
  }

  return (
    <Builder slug={slug} initialContent={content} title={cat.title} route={cat.route} properties={properties} />
  )
}

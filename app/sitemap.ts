import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/server'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://agenzia-2026.vercel.app'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const pages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/home`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/immobili`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE_URL}/cookie`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
  ]

  try {
    const supabase = await createClient()
    const { data } = await supabase.from('immobili').select('slug').eq('pubblicato', true).limit(500)
    for (const row of data ?? []) {
      if (row.slug) {
        pages.push({
          url: `${SITE_URL}/immobili/${row.slug}`,
          lastModified: now,
          changeFrequency: 'weekly',
          priority: 0.8,
        })
      }
    }
  } catch {
    // se il database non risponde, la sitemap resta con le pagine fisse
  }

  return pages
}

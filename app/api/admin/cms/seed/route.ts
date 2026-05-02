import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/server'
import { PAGE_CATALOG, defaultContentForSlug } from '@/lib/cms/defaults'
import { isAdminSession } from '@/lib/adminSession'

async function ensureAdmin() {
  return isAdminSession()
}

// Seeds rows for every catalog page that doesn't yet have one. Useful
// to bootstrap the CMS with the current content already in draft form.
export async function POST() {
  if (!(await ensureAdmin())) {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
  }
  try {
    const supabase = createAdminClient()
    const seeded: string[] = []
    for (const cat of PAGE_CATALOG) {
      const { data: existing } = await supabase
        .from('site_pages')
        .select('id')
        .eq('slug', cat.slug)
        .maybeSingle()
      if (existing?.id) continue
      const initial = defaultContentForSlug(cat.slug)
      const { error } = await supabase.from('site_pages').insert({
        slug: cat.slug,
        title: cat.title,
        description: cat.description,
        draft_content: initial,
        published_content: null,
      })
      if (!error) seeded.push(cat.slug)
    }
    return NextResponse.json({ ok: true, seeded })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Errore' }, { status: 500 })
  }
}

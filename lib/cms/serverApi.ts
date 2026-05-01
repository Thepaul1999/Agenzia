import 'server-only'
import { createAdminClient } from '@/lib/server'
import { defaultContentForSlug, PAGE_CATALOG } from './defaults'
import type { PageContent, PageRow, PageSummary, RevisionRow } from './types'

const PAGES_TABLE = 'site_pages'
const REVISIONS_TABLE = 'site_revisions'

function rowToContent(value: unknown): PageContent | null {
  if (!value) return null
  if (typeof value !== 'object') return null
  const candidate = value as Partial<PageContent>
  if (!Array.isArray(candidate.blocks)) return null
  return {
    meta: candidate.meta ?? {},
    global: candidate.global ?? {},
    blocks: candidate.blocks,
  }
}

// Returns published content for a slug. Returns `null` when no
// publication exists yet (so callers can fall back to the legacy
// hardcoded UI). Safe to call from public pages.
export async function getPublishedPageContent(slug: string): Promise<PageContent | null> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from(PAGES_TABLE)
      .select('published_content')
      .eq('slug', slug)
      .maybeSingle()

    if (error) {
      console.warn(`[cms] published lookup error for ${slug}:`, error.message)
      return null
    }

    const published = rowToContent(data?.published_content)
    return published ?? null
  } catch (err) {
    console.warn('[cms] getPublishedPageContent failed:', err)
    return null
  }
}

export async function getDraftPageContent(slug: string): Promise<PageContent> {
  try {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from(PAGES_TABLE)
      .select('draft_content, published_content')
      .eq('slug', slug)
      .maybeSingle()

    const draft = rowToContent(data?.draft_content)
    if (draft && draft.blocks.length > 0) return draft

    const published = rowToContent(data?.published_content)
    if (published) return published
  } catch (err) {
    console.warn('[cms] getDraftPageContent failed:', err)
  }
  return defaultContentForSlug(slug)
}

export async function listPagesSummary(): Promise<PageSummary[]> {
  const fromDb: PageSummary[] = []
  try {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from(PAGES_TABLE)
      .select('slug, title, description, draft_updated_at, published_at, published_content, version')

    if (data) {
      for (const row of data as Array<Partial<PageRow>>) {
        if (!row.slug) continue
        fromDb.push({
          slug: row.slug,
          title: row.title ?? null,
          description: row.description ?? null,
          hasPublished: Boolean(row.published_content),
          publishedAt: row.published_at ?? null,
          draftUpdatedAt: row.draft_updated_at ?? null,
          version: row.version ?? 1,
        })
      }
    }
  } catch (err) {
    console.warn('[cms] listPagesSummary failed:', err)
  }

  // Merge with catalog so admin sees all known pages even if not yet in DB.
  const known = new Map(fromDb.map((p) => [p.slug, p]))
  for (const cat of PAGE_CATALOG) {
    if (!known.has(cat.slug)) {
      known.set(cat.slug, {
        slug: cat.slug,
        title: cat.title,
        description: cat.description,
        hasPublished: false,
        publishedAt: null,
        draftUpdatedAt: null,
        version: 0,
      })
    } else {
      const existing = known.get(cat.slug)!
      if (!existing.title) existing.title = cat.title
      if (!existing.description) existing.description = cat.description
    }
  }
  return Array.from(known.values()).sort((a, b) => a.slug.localeCompare(b.slug))
}

export async function ensurePageRow(slug: string) {
  const supabase = createAdminClient()
  const { data: existing } = await supabase
    .from(PAGES_TABLE)
    .select('id')
    .eq('slug', slug)
    .maybeSingle()

  if (existing?.id) return existing.id as string

  const meta = PAGE_CATALOG.find((p) => p.slug === slug)
  const initial = defaultContentForSlug(slug)

  const { data, error } = await supabase
    .from(PAGES_TABLE)
    .insert({
      slug,
      title: meta?.title ?? slug,
      description: meta?.description ?? null,
      draft_content: initial,
      published_content: null,
    })
    .select('id')
    .single()

  if (error || !data) {
    throw new Error(`Impossibile creare riga pagina '${slug}': ${error?.message}`)
  }
  return data.id as string
}

export async function saveDraft(slug: string, content: PageContent) {
  const supabase = createAdminClient()
  await ensurePageRow(slug)
  const { error } = await supabase
    .from(PAGES_TABLE)
    .update({
      draft_content: content,
      title: content.meta?.title ?? null,
      description: content.meta?.description ?? null,
      draft_updated_at: new Date().toISOString(),
    })
    .eq('slug', slug)
  if (error) throw new Error(error.message)
}

export async function publishPage(slug: string, createdBy: string | null) {
  const supabase = createAdminClient()
  await ensurePageRow(slug)

  const { data: page, error: fetchErr } = await supabase
    .from(PAGES_TABLE)
    .select('id, draft_content, version')
    .eq('slug', slug)
    .single()

  if (fetchErr || !page) throw new Error(fetchErr?.message ?? 'Pagina non trovata')

  const nextVersion = (page.version ?? 1) + 1

  const { error: updateErr } = await supabase
    .from(PAGES_TABLE)
    .update({
      published_content: page.draft_content,
      published_at: new Date().toISOString(),
      version: nextVersion,
    })
    .eq('id', page.id)

  if (updateErr) throw new Error(updateErr.message)

  await supabase.from(REVISIONS_TABLE).insert({
    page_id: page.id,
    version: nextVersion,
    content: page.draft_content,
    created_by: createdBy,
  })
}

export async function listRevisions(slug: string): Promise<RevisionRow[]> {
  try {
    const supabase = createAdminClient()
    const { data: page } = await supabase
      .from(PAGES_TABLE)
      .select('id')
      .eq('slug', slug)
      .maybeSingle()
    if (!page?.id) return []
    const { data } = await supabase
      .from(REVISIONS_TABLE)
      .select('id, page_id, version, content, created_at, created_by')
      .eq('page_id', page.id)
      .order('version', { ascending: false })
      .limit(20)
    return (data as RevisionRow[]) ?? []
  } catch (err) {
    console.warn('[cms] listRevisions failed:', err)
    return []
  }
}

export async function revertToRevision(slug: string, revisionId: string) {
  const supabase = createAdminClient()
  const { data: rev, error: fetchErr } = await supabase
    .from(REVISIONS_TABLE)
    .select('id, content')
    .eq('id', revisionId)
    .single()
  if (fetchErr || !rev) throw new Error(fetchErr?.message ?? 'Revisione non trovata')

  const { error } = await supabase
    .from(PAGES_TABLE)
    .update({
      draft_content: rev.content,
      draft_updated_at: new Date().toISOString(),
    })
    .eq('slug', slug)
  if (error) throw new Error(error.message)
}

export async function resetDraftToDefault(slug: string) {
  const supabase = createAdminClient()
  const initial = defaultContentForSlug(slug)
  await ensurePageRow(slug)
  const { error } = await supabase
    .from(PAGES_TABLE)
    .update({
      draft_content: initial,
      draft_updated_at: new Date().toISOString(),
    })
    .eq('slug', slug)
  if (error) throw new Error(error.message)
}

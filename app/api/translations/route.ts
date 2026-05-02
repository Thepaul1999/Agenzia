import { NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

// GET /api/translations?lang=it   — lettura pubblica degli override DB
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const lang = searchParams.get('lang') === 'en' ? 'en' : 'it'

  try {
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    )

    const { data, error } = await supabase
      .from('site_translations')
      .select('key, value')
      .eq('lang', lang)

    if (error) {
      return NextResponse.json({})
    }

    const result: Record<string, string> = {}
    for (const row of data ?? []) {
      result[row.key] = row.value
    }
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({})
  }
}

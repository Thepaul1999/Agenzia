// app/api/logout/route.ts
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createClient } from '../../../lib/server'

export async function POST(request: Request) {
  const cookieStore = await cookies()
  cookieStore.delete('site_admin')

  const supabase = await createClient()
  await supabase.auth.signOut()

  const origin = new URL(request.url).origin
  return NextResponse.redirect(`${origin}/`, { status: 302 })
}

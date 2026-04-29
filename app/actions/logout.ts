'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/server'

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('site_admin')

  const supabase = await createClient()
  await supabase.auth.signOut()

  redirect('/')
}

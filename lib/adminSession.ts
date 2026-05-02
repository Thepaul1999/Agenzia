import { cookies } from 'next/headers'
import { createClient } from '@/lib/server'

/**
 * Valid admin session requires:
 * 1) explicit site_admin cookie
 * 2) valid Supabase user session
 * 3) user present in admin_users with is_admin = true
 *
 * If any check fails, the site_admin cookie is removed.
 */
export async function isAdminSession(): Promise<boolean> {
  const cookieStore = await cookies()
  const hasAdminCookie = cookieStore.get('site_admin')?.value === 'true'
  if (!hasAdminCookie) return false

  const supabase = await createClient()
  const { data: userData, error: userError } = await supabase.auth.getUser()
  const user = userData.user

  if (userError || !user?.email) {
    cookieStore.delete('site_admin')
    return false
  }

  const { data: adminUser, error: adminError } = await supabase
    .from('admin_users')
    .select('is_admin')
    .eq('email', user.email)
    .maybeSingle()

  const isAdmin = !adminError && !!adminUser?.is_admin
  if (!isAdmin) cookieStore.delete('site_admin')
  return isAdmin
}

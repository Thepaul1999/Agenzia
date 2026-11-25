// app/login/action.ts
'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '../../lib/server'

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = await createClient()

  const { data, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (authError) {
    redirect('/login?error=' + encodeURIComponent('Credenziali non valide'))
  }

  const user = data.user

  // LEGGI DA admin_users, non profiles
  const { data: adminUser, error: adminUserError } = await supabase
    .from('admin_users')
    .select('is_admin')
    .eq('email', user.email)
    .single()

  const isCurrentUserAdmin = !adminUserError && !!adminUser?.is_admin

  const cookieStore = await cookies()

  if (isCurrentUserAdmin) {
    cookieStore.set('site_admin', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      // Resta valido anche dopo aver chiuso il browser (il vero controllo resta la sessione Supabase).
      maxAge: 60 * 60 * 24 * 30,
    })
    redirect('/admin/home')
  } else {
    cookieStore.delete('site_admin')
    redirect('/home')
  }
}
// app/api/admin/users/route.ts
// Gestione utenti dall'area admin: elenco, creazione, promozione/revoca amministratore.
import { NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/server'
import { isAdminSession } from '@/lib/adminSession'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

async function requireAdmin() {
  if (!(await isAdminSession())) {
    return { error: NextResponse.json({ error: 'Accesso negato' }, { status: 403 }) }
  }
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()
  return { currentEmail: data.user?.email?.toLowerCase() ?? '' }
}

async function setAdminFlag(userId: string, email: string, isAdmin: boolean) {
  const admin = createAdminClient()
  const { data: existing } = await admin
    .from('admin_users')
    .select('email')
    .ilike('email', email)
    .maybeSingle()

  if (existing) {
    const { error } = await admin.from('admin_users').update({ is_admin: isAdmin }).ilike('email', email)
    return error?.message ?? null
  }
  if (!isAdmin) return null

  const withId = await admin.from('admin_users').insert({ id: userId, email, is_admin: true })
  if (!withId.error) return null
  const withoutId = await admin.from('admin_users').insert({ email, is_admin: true })
  return withoutId.error?.message ?? null
}

export async function GET() {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  try {
    const admin = createAdminClient()
    const [{ data: usersData, error: usersError }, { data: admins }] = await Promise.all([
      admin.auth.admin.listUsers({ page: 1, perPage: 200 }),
      admin.from('admin_users').select('email, is_admin'),
    ])
    if (usersError) return NextResponse.json({ error: usersError.message }, { status: 500 })

    const adminEmails = new Set(
      (admins ?? []).filter((a) => a.is_admin).map((a) => String(a.email).toLowerCase())
    )
    const users = (usersData?.users ?? []).map((u) => ({
      id: u.id,
      email: u.email ?? '',
      confirmed: !!u.email_confirmed_at,
      createdAt: u.created_at,
      lastSignInAt: u.last_sign_in_at ?? null,
      isAdmin: adminEmails.has((u.email ?? '').toLowerCase()),
    }))
    return NextResponse.json({ users })
  } catch {
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  try {
    const body = await req.json()
    const email = String(body.email ?? '').trim().toLowerCase()
    const password = String(body.password ?? '')
    const isAdmin = body.isAdmin !== false

    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'Email non valida' }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'La password deve avere almeno 8 caratteri' }, { status: 400 })
    }

    const admin = createAdminClient()
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // nessuna email di conferma: l'utente può entrare subito
    })
    if (error || !data.user) {
      const msg = error?.message ?? 'Creazione non riuscita'
      const already = /already|registered|exists/i.test(msg)
      return NextResponse.json(
        { error: already ? 'Esiste già un utente con questa email' : msg },
        { status: already ? 409 : 500 }
      )
    }

    if (isAdmin) {
      const flagError = await setAdminFlag(data.user.id, email, true)
      if (flagError) {
        return NextResponse.json(
          { error: `Utente creato, ma non è stato reso amministratore: ${flagError}` },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({ success: true, id: data.user.id, email, isAdmin })
  } catch {
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  try {
    const body = await req.json()
    const email = String(body.email ?? '').trim().toLowerCase()
    const userId = String(body.id ?? '')
    const isAdmin = body.isAdmin === true

    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'Email non valida' }, { status: 400 })
    }
    if (!isAdmin && email === auth.currentEmail) {
      return NextResponse.json(
        { error: 'Non puoi togliere i permessi al tuo stesso account' },
        { status: 400 }
      )
    }

    const flagError = await setAdminFlag(userId, email, isAdmin)
    if (flagError) return NextResponse.json({ error: flagError }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}

import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

/**
 * Rinnova l'accesso (sessione Supabase) a ogni visita di chi è collegato.
 *
 * Senza questo passaggio il token di accesso scade dopo circa un'ora: le pagine del server non possono
 * salvare il token rinnovato, quindi l'amministratore veniva scollegato nel mezzo di un lavoro
 * (e il salvataggio di un immobile falliva). Qui il rinnovo viene salvato nei cookie del browser.
 *
 * I visitatori normali non hanno cookie di accesso: per loro non succede nulla e non c'è nessun ritardo.
 */
export async function proxy(request: NextRequest) {
  const hasAuthCookie = request.cookies.getAll().some((c) => c.name.startsWith('sb-'))
  if (!hasAuthCookie) return NextResponse.next()

  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    },
  )

  try {
    // Controlla l'accesso e, se il token è scaduto, lo rinnova (e aggiorna i cookie sopra).
    await supabase.auth.getUser()
  } catch {
    // In caso di problemi di rete la pagina si apre comunque.
  }

  return response
}

export const config = {
  // Tutte le pagine e le API, tranne file statici e immagini.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|css|js)$).*)'],
}

import type { Metadata } from 'next'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import AdminSessionGuard from './AdminSessionGuard'

export const metadata: Metadata = {
  title: 'Area Admin — Monferrato Immobiliare',
  description: 'Gestione immobili e statistiche',
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const isAdmin = cookieStore.get('site_admin')?.value === 'true'

  if (!isAdmin) redirect('/login')

  return (
    <>
      <style>{`
        .adm-shell {
          background: var(--warm, #f5f3f0);
          min-height: 100vh;
          font-family: 'Manrope', Arial, Helvetica, sans-serif;
        }

        /* Top bar */
        .adm-topbar {
          position: sticky; top: 0; z-index: 90;
          background: var(--ink, #0c0c0a);
          border-bottom: 1px solid rgba(255,255,255,.08);
        }
        .adm-topbar-inner {
          display: flex; align-items: center; gap: 1.2rem;
          height: 56px;
          padding: 0 clamp(1rem, 3vw, 2.5rem);
          max-width: 1360px; margin: 0 auto;
        }
        .adm-brand {
          font-family: 'Syne', sans-serif; font-weight: 800; font-size: .8rem;
          letter-spacing: .05em; text-transform: uppercase;
          color: rgba(255,255,255,.9); text-decoration: none;
          margin-right: .5rem; white-space: nowrap;
        }
        .adm-nav {
          display: flex; align-items: center; gap: .2rem; flex: 1;
        }
        .adm-nav-link {
          display: inline-flex; align-items: center;
          padding: .35rem .85rem; border-radius: 999px;
          font-family: 'Syne', sans-serif; font-size: .67rem; font-weight: 700;
          letter-spacing: .07em; text-transform: uppercase;
          color: rgba(255,255,255,.55); text-decoration: none;
          transition: color .18s, background .18s;
          background: transparent; border: none; cursor: pointer;
          white-space: nowrap;
        }
        .adm-nav-link:hover { color: #fff; background: rgba(255,255,255,.1); }
        .adm-nav-link-active { color: var(--tc, #c4622d) !important; }

        /* Logout */
        .adm-logout-form { margin-left: auto; }
        .adm-logout-btn {
          display: inline-flex; align-items: center; gap: .4rem;
          padding: .35rem .85rem; border-radius: 999px;
          font-family: 'Syne', sans-serif; font-size: .67rem; font-weight: 700;
          letter-spacing: .07em; text-transform: uppercase;
          color: rgba(255,255,255,.45); background: transparent; border: none;
          cursor: pointer; transition: color .18s, background .18s;
        }
        .adm-logout-btn:hover { color: #fff; background: rgba(196,98,45,.3); }

        /* Content */
        .adm-content {
          max-width: 1360px; margin: 0 auto;
          padding: 2.5rem clamp(1rem, 3vw, 2.5rem) 6rem;
        }
      `}</style>

      <div className="adm-shell">
        <header className="adm-topbar">
          <div className="adm-topbar-inner">
            <Link href="/admin" className="adm-brand">Admin</Link>

            <nav className="adm-nav" aria-label="Navigazione admin">
              <Link href="/admin/stats" className="adm-nav-link">
                Statistiche
              </Link>
              <Link href="/" className="adm-nav-link" target="_blank">
                ↗ Sito
              </Link>
            </nav>

            <form action="/api/logout" method="POST" className="adm-logout-form">
              <button type="submit" className="adm-logout-btn">
                Esci
              </button>
            </form>
          </div>
        </header>

        <main className="adm-content">
          <AdminSessionGuard timeoutMinutes={15} />
          {children}
        </main>
      </div>
    </>
  )
}

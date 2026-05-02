import type { Metadata } from 'next'
import Link from 'next/link'
import AdminDrawerNav from '@/app/components/AdminDrawerNav'

export const metadata: Metadata = {
  title: 'Area Admin — Monferrato Immobiliare',
  description: 'Gestione immobili e statistiche',
}

export default function AdminToolsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`
        .adm-shell {
          background: var(--warm, #f5f3f0);
          min-height: 100vh;
          font-family: 'Manrope', Arial, Helvetica, sans-serif;
        }

        .adm-topbar {
          position: sticky; top: 0; z-index: 90;
          background: var(--ink, #0c0c0a);
          border-bottom: 1px solid rgba(255,255,255,.08);
        }
        .adm-topbar-inner {
          display: flex; align-items: center; gap: 1rem;
          height: 56px;
          padding: 0 clamp(1rem, 3vw, 2.5rem);
          max-width: 1360px; margin: 0 auto;
        }
        .adm-topbar-slot {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: flex-end;
        }
        .adm-exit-public {
          font-family: 'Syne', sans-serif;
          font-size: .62rem;
          font-weight: 700;
          letter-spacing: .08em;
          text-transform: uppercase;
          color: rgba(255,255,255,.52);
          text-decoration: none;
          padding: .35rem .75rem;
          border-radius: 999px;
          transition: background .18s, color .18s;
        }
        .adm-exit-public:hover { color: #fff; background: rgba(255,255,255,.08); }

        .adm-content {
          max-width: 1360px; margin: 0 auto;
          padding: 2.5rem clamp(1rem, 3vw, 2.5rem) 6rem;
        }
      `}</style>

      <div className="adm-shell">
        <header className="adm-topbar">
          <div className="adm-topbar-inner">
            <AdminDrawerNav
              logoutSlot={
                <form action="/api/logout" method="POST" style={{ margin: 0 }}>
                  <button type="submit" className="adm-drawer-logout">
                    Esci
                  </button>
                </form>
              }
            />
            <div className="adm-topbar-slot">
              <Link href="/home" className="adm-exit-public">
                ← Sito pubblico
              </Link>
            </div>
          </div>
        </header>

        <main className="adm-content">{children}</main>
      </div>
    </>
  )
}

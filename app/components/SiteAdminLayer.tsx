'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEditMode } from '@/app/context/EditModeContext'
import { useAdminDrawer } from '@/app/context/AdminDrawerContext'
import AdminDrawerNav from '@/app/components/AdminDrawerNav'
import { isAdminBrowseMirror } from '@/lib/adminChromePaths'

/**
 * Barra admin: chip + drawer. Su home/mirror la chip è nascosta (c’è «Admin» in header a destra)
 * e --admin-bar è 0 così casetta e nav restano una fascia unica.
 */
export default function SiteAdminLayer() {
  const pathname = usePathname() ?? ''
  const { isAdmin, isEditing, saving, toggleEdit, save, discard } = useEditMode()
  const drawer = useAdminDrawer()

  const hidden =
    !isAdmin ||
    pathname.startsWith('/login') ||
    (pathname.startsWith('/admin') && !isAdminBrowseMirror(pathname))

  const isImmobiliList = pathname === '/immobili' || pathname === '/admin/immobili'
  const legacyHome =
    pathname === '/home' || pathname === '/admin/home' ? toggleEdit : undefined

  const isHomeMirror = pathname === '/home' || pathname === '/admin/home'
  /** Home: niente doppia chip in alto; in modifica testi serve la barra con Salva */
  const collapseTopChip = isHomeMirror && !isEditing

  useEffect(() => {
    const root = document.documentElement
    if (!hidden) {
      root.style.setProperty('--admin-bar', collapseTopChip ? '0px' : '44px')
    } else {
      root.style.removeProperty('--admin-bar')
    }
    return () => {
      root.style.removeProperty('--admin-bar')
    }
  }, [hidden, collapseTopChip])

  if (hidden) return null

  const drawerTrigger = (
    <div className={`sal-admin-chrome-wrap${collapseTopChip ? ' sal-admin-chrome-wrap--no-chip' : ''}`}>
      {!collapseTopChip ? (
        <div className="sal-admin-chrome site-nav-chip sal-admin-chrome--gestione-only" aria-hidden={false}>
          <button
            type="button"
            className="sal-admin-gestione-btn sal-admin-gestione-btn--solo"
            aria-expanded={drawer.open}
            aria-controls="admin-drawer-panel"
            aria-label="Apri menu admin"
            onClick={() => drawer.setOpen(true)}
          >
            <span className="sal-admin-mini-lines" aria-hidden>
              <span />
              <span />
              <span />
            </span>
            Admin
          </button>
        </div>
      ) : null}
      <AdminDrawerNav
        open={drawer.open}
        onOpenChange={drawer.setOpen}
        onLegacyHomeEdit={legacyHome}
        trigger={<span className="sal-admin-drawer-hidden-trigger" aria-hidden />}
        logoutSlot={
          <form action="/api/logout" method="POST" style={{ margin: 0 }}>
            <button type="submit" className="adm-drawer-logout">
              Esci
            </button>
          </form>
        }
      />
    </div>
  )

  return (
    <div
      className={`site-admin-layer-root${isEditing ? ' is-editing-tools' : ''}${collapseTopChip ? ' is-home-collapsed' : ''}`}
    >
      {drawerTrigger}

      <div style={{ flex: 1, minWidth: 8 }} aria-hidden />

      {isImmobiliList && (
        <Link
          href="/admin/immobili/gestione/new"
          prefetch={false}
          className="sal-top-link sal-top-muted"
        >
          + Immobile
        </Link>
      )}

      {isEditing ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
          <button type="button" onClick={save} disabled={saving} className="sal-save-btn">
            {saving ? '…' : 'Salva'}
          </button>
          <button type="button" onClick={discard} className="sal-discard-btn">
            Annulla
          </button>
          <span className="sal-edit-hint">Clicca testi evidenziati</span>
        </div>
      ) : null}

      <style>{`
        .site-admin-layer-root {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          min-height: 44px;
          z-index: 2147483600;
          display: flex;
          align-items: center;
          gap: 0.65rem;
          padding: 0.35rem 0.85rem 0.35rem 0.55rem;
          flex-wrap: wrap;
          align-content: center;
          background: transparent;
          font-family: 'Syne', sans-serif;
          pointer-events: none;
        }
        .site-admin-layer-root.is-home-collapsed {
          min-height: 0;
          padding: 0;
          align-items: flex-start;
        }
        .site-admin-layer-root.is-home-collapsed .sal-admin-chrome-wrap--no-chip {
          min-height: 0;
        }
        .site-admin-layer-root > * { pointer-events: auto; }

        .site-admin-layer-root.is-editing-tools {
          background: linear-gradient(90deg,#1a1a2e 0%,#16213e 100%);
          border-bottom: 2px solid #c4622d;
          pointer-events: auto;
        }
        .sal-admin-drawer-hidden-trigger {
          display: none !important;
        }
        .sal-admin-chrome--gestione-only {
          padding-left: 0.65rem;
          padding-right: 0.65rem;
        }
        .sal-admin-gestione-btn--solo {
          padding-left: 0.85rem;
          padding-right: 1rem;
        }
        .sal-top-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.26rem 0.85rem;
          border-radius: 999px;
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          text-decoration: none;
          white-space: nowrap;
          border: 1px solid transparent;
        }
        .sal-top-muted {
          background: rgba(12,12,10,0.06);
          color: rgba(12,12,10,0.88);
          border-color: rgba(12,12,10,0.12);
        }
        .sal-top-muted:hover {
          background: rgba(12,12,10,0.1);
        }
        .sal-save-btn {
          display: inline-flex;
          align-items: center;
          padding: 0.26rem 0.8rem;
          border-radius: 999px;
          background: #22c55e;
          color: #fff;
          border: none;
          font-family: inherit;
          font-size: 0.66rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          cursor: pointer;
        }
        .sal-save-btn:disabled {
          background: #444;
          cursor: not-allowed;
        }
        .sal-discard-btn {
          display: inline-flex;
          align-items: center;
          padding: 0.26rem 0.7rem;
          border-radius: 999px;
          background: transparent;
          color: rgba(255,255,255,0.82);
          border: 1px solid rgba(255,255,255,0.2);
          font-family: inherit;
          font-size: 0.64rem;
          font-weight: 600;
          cursor: pointer;
        }
        .sal-edit-hint {
          color: #fbbf24;
          font-size: 0.6rem;
          max-width: 10rem;
          line-height: 1.2;
        }
      `}</style>
    </div>
  )
}

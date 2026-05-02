'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEditMode } from '@/app/context/EditModeContext'
import { useAdminDrawer } from '@/app/context/AdminDrawerContext'
import AdminDrawerNav from '@/app/components/AdminDrawerNav'
import { isAdminBrowseMirror } from '@/lib/adminChromePaths'

/**
 * Barra admin: casetta → home + chip «Gestione admin» + drawer.
 * Su home/mirror senza editing: --admin-bar 0 per allinearsi alla header pubblica su un’unica fascia.
 */
export default function SiteAdminLayer() {
  const pathname = usePathname() ?? ''
  const { isAdmin, isEditing, saving, toggleEdit, save, discard } = useEditMode()
  const drawer = useAdminDrawer()

  const hidden =
    !isAdmin ||
    pathname.startsWith('/login') ||
    (pathname.startsWith('/admin') && !isAdminBrowseMirror(pathname))

  const legacyHome =
    pathname === '/home' || pathname === '/admin/home' ? toggleEdit : undefined

  const isHomeMirror = pathname === '/home' || pathname === '/admin/home'
  /** Home: fascia unica con la nav del sito; in modifica serve altezza per Salva */
  const collapseTopChip = isHomeMirror && !isEditing

  const browseHomeHref = pathname.startsWith('/admin') ? '/admin/home' : '/home'

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
    <div
      className={`sal-admin-chrome-wrap${collapseTopChip ? ' sal-admin-chrome-wrap--compact' : ''}`}
    >
      <Link
        href={browseHomeHref}
        prefetch={false}
        className="sal-admin-home-mini"
        aria-label="Vai alla home"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M3 10.5L12 3l9 7.5V21h-5.5v-5.5h-7V21H3z" />
        </svg>
      </Link>
      <div className="sal-admin-chrome site-nav-chip sal-admin-chrome--gestione-only">
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
          Gestione admin
        </button>
      </div>
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
          flex-wrap: nowrap;
          align-content: center;
          background: transparent;
          font-family: 'Syne', sans-serif;
          pointer-events: none;
        }
        .site-admin-layer-root.is-home-collapsed {
          min-height: 44px;
          padding: var(--header-top, 1rem) 0.85rem 0.35rem 0.85rem;
          align-items: center;
          box-sizing: border-box;
        }
        .sal-admin-chrome-wrap--compact {
          flex-shrink: 0;
        }
        .sal-admin-home-mini {
          pointer-events: auto;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          min-width: 42px;
          min-height: 42px;
          flex-shrink: 0;
          box-sizing: border-box;
          line-height: 0;
          border-radius: 50%;
          backdrop-filter: blur(10px) saturate(1.4);
          -webkit-backdrop-filter: blur(10px) saturate(1.4);
          text-decoration: none;
          transition: background 0.2s, transform 0.2s, box-shadow 0.2s, border-color 0.2s, color 0.2s;
          border: 1px solid rgba(255, 255, 255, 0.28);
          background: rgba(255, 255, 255, 0.14);
          box-shadow: 0 2px 12px rgba(12, 12, 10, 0.18);
          color: #fff;
        }
        .sal-admin-home-mini:hover {
          background: rgba(196, 98, 45, 0.88);
          border-color: rgba(196, 98, 45, 0.55);
          color: #fff;
          transform: scale(1.06);
        }
        .sal-admin-home-mini svg {
          width: 1.2rem;
          height: 1.2rem;
          flex-shrink: 0;
        }
        html[data-site-header-theme="light"] .sal-admin-home-mini {
          border: 1px solid rgba(12, 12, 10, 0.12);
          background: rgba(255, 255, 255, 0.92);
          box-shadow: 0 8px 24px rgba(12, 12, 10, 0.08);
          color: var(--ink, #0c0c0a);
        }
        html[data-site-header-theme="light"] .sal-admin-home-mini:hover {
          background: var(--ink, #0c0c0a);
          border-color: var(--ink, #0c0c0a);
          color: #fff;
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
          align-self: center;
        }
        .sal-admin-gestione-btn--solo {
          min-height: 42px;
          height: 42px;
          box-sizing: border-box;
          padding-left: 0.85rem;
          padding-right: 1rem;
          align-items: center;
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

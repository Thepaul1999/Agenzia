'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

const MAIN_LINKS: { href: string; label: string; match: (pathname: string) => boolean }[] = [
  { href: '/admin/builder', label: 'Pagine & testi', match: (p) => p === '/admin/builder' || p.startsWith('/admin/builder/') },
  {
    href: '/admin/immobili/gestione',
    label: 'Gestisci immobili',
    match: (p) => p.startsWith('/admin/immobili/gestione'),
  },
  {
    href: '/admin/dashboard',
    label: 'Dashboard',
    match: (p) => p === '/admin' || p === '/admin/' || p.startsWith('/admin/dashboard'),
  },
]

type Props = {
  logoutSlot?: React.ReactNode
  triggerClassName?: string
  /** Drawer controllato (es. pulsante Admin sulla home). */
  open?: boolean
  onOpenChange?: (next: boolean) => void
  /** Sostituisce il pulsante predefinito “Menu …” */
  trigger?: React.ReactNode
  /** Attiva modifica testi legacy home (solo homepage pubblica/mirror) */
  onLegacyHomeEdit?: () => void
}

export default function AdminDrawerNav({
  logoutSlot,
  triggerClassName,
  open: openControlled,
  onOpenChange,
  trigger,
  onLegacyHomeEdit,
}: Props) {
  const pathname = usePathname() ?? ''
  const [internalOpen, setInternalOpen] = useState(false)
  const clientSiteHref = pathname.startsWith('/admin/immobili/')
    ? pathname.replace('/admin/immobili', '/immobili')
    : pathname === '/admin/immobili'
      ? '/immobili'
      : pathname === '/admin/home'
        ? '/home'
        : '/home'

  const isControlled = openControlled !== undefined && onOpenChange !== undefined
  const open = isControlled ? openControlled : internalOpen

  function setOpen(next: boolean) {
    if (isControlled) {
      onOpenChange!(next)
    } else {
      setInternalOpen(next)
    }
  }

  useEffect(() => {
    setOpen(false)
  }, [pathname]) // eslint-disable-line react-hooks/exhaustive-deps -- chiudi dopo navigazione

  useEffect(() => {
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    if (open) {
      window.addEventListener('keydown', onEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      window.removeEventListener('keydown', onEscape)
      document.body.style.overflow = ''
    }
  }, [open])

  const defaultTrigger = (
    <button
      type="button"
      className={`adm-drawer-trigger${triggerClassName ? ` ${triggerClassName}` : ''}`}
      aria-expanded={open}
      aria-label="Menu area admin"
      aria-controls="admin-drawer-panel"
      onClick={() => setOpen(true)}
    >
      <span className="adm-drawer-triggerLines" aria-hidden>
        <span />
        <span />
        <span />
      </span>
      Menu
    </button>
  )

  return (
    <>
      <style>{`
        .adm-drawer-trigger {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.45rem;
          padding: 0.38rem 0.72rem;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,.28);
          background: rgba(255,255,255,.08);
          color: rgba(255,255,255,.92);
          cursor: pointer;
          font-family: 'Syne', sans-serif;
          font-size: 0.65rem;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          transition: background .15s, border-color .15s;
        }
        .adm-drawer-trigger:hover {
          background: rgba(255,255,255,.14);
          border-color: rgba(255,255,255,.42);
        }
        .adm-drawer-triggerLines {
          display: flex;
          flex-direction: column;
          gap: 4px;
          width: 16px;
        }
        .adm-drawer-triggerLines span {
          display: block;
          height: 2px;
          border-radius: 2px;
          background: currentColor;
        }
        .adm-drawer-overlay {
          position: fixed;
          inset: 0;
          background: rgba(12,12,10,.55);
          z-index: 2147483640;
          animation: admDrawerFade .2s ease;
          border: 0;
          padding: 0;
          cursor: pointer;
          display: block;
        }
        @keyframes admDrawerFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .adm-drawer-panel {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: min(20rem, 88vw);
          background: linear-gradient(180deg,#0c0c0a 0%,#171512 100%);
          border-right: 1px solid rgba(255,255,255,.09);
          z-index: 2147483646;
          padding: 1.1rem 1.15rem 1.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
          box-shadow: 12px 0 48px rgba(0,0,0,.35);
          animation: admDrawerSlide .22s ease;
          pointer-events: auto;
          text-align: left;
        }
        @keyframes admDrawerSlide {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        .adm-drawer-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          margin-bottom: 0.95rem;
          padding-bottom: 0.95rem;
          border-bottom: 1px solid rgba(255,255,255,.1);
        }
        .adm-drawer-brand {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 1.05rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(255,255,255,.95);
          margin: 0;
        }
        .adm-drawer-close {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 2.35rem;
          height: 2.35rem;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,.22);
          background: rgba(255,255,255,.06);
          color: rgba(255,255,255,.92);
          font-size: 1.05rem;
          line-height: 1;
          cursor: pointer;
          transition: background .15s, color .15s;
          flex-shrink: 0;
        }
        .adm-drawer-close:hover {
          background: rgba(196,98,45,.42);
          color: #fff;
          border-color: rgba(196,98,45,.55);
        }
        .adm-drawer-link {
          display: block;
          padding: 0.82rem 0.95rem;
          border-radius: 12px;
          text-decoration: none;
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 0.78rem;
          letter-spacing: 0.05em;
          color: rgba(255,255,255,.76);
          transition: background .15s, color .15s;
        }
        .adm-drawer-link:hover {
          color: #fff;
          background: rgba(255,255,255,.07);
        }
        .adm-drawer-link.is-active {
          background: rgba(196,98,45,.26);
          color: #fff;
          box-shadow: inset 2px 0 0 var(--tc, #c4622d);
        }
        button.adm-drawer-link {
          width: 100%;
          text-align: left;
          border: none;
          cursor: pointer;
          font-family: 'Syne', sans-serif;
        }
        .adm-drawer-muted {
          font-size: .62rem;
          font-weight: 700;
          letter-spacing: .12em;
          text-transform: uppercase;
          color: rgba(255,255,255,.35);
          margin: 1.05rem 0 .5rem;
        }
        .adm-drawer-logout {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          padding: .75rem .85rem;
          border-radius: 12px;
          font-family: 'Syne', sans-serif;
          font-size: .72rem;
          font-weight: 700;
          letter-spacing: .08em;
          text-transform: uppercase;
          border: 1px solid rgba(255,255,255,.22);
          color: rgba(255,255,255,.88);
          background: rgba(196,98,45,.35);
          cursor: pointer;
          transition: background .18s;
        }
        .adm-drawer-logout:hover {
          background: rgba(196,98,45,.5);
          color: #fff;
        }
      `}</style>

      {trigger ?? defaultTrigger}

      {open ? (
        <div role="presentation" style={{ zIndex: 2147483636, position: 'fixed', inset: 0, pointerEvents: 'none' }}>
          <button type="button" className="adm-drawer-overlay" aria-label="Chiudi menu" style={{ pointerEvents: 'auto' }} onClick={() => setOpen(false)} />
          <nav id="admin-drawer-panel" className="adm-drawer-panel" aria-label="Area admin">
            <div className="adm-drawer-head">
              <p className="adm-drawer-brand">Admin</p>
              <button
                type="button"
                className="adm-drawer-close"
                aria-label="Chiudi menu"
                onClick={() => setOpen(false)}
              >
                ✕
              </button>
            </div>
            {onLegacyHomeEdit ? (
              <>
                <p className="adm-drawer-muted">Home</p>
                <button
                  type="button"
                  className="adm-drawer-link"
                  onClick={() => {
                    onLegacyHomeEdit()
                    setOpen(false)
                  }}
                >
                  Testi legacy home
                </button>
              </>
            ) : null}
            {MAIN_LINKS.map(({ href, label, match }) => (
              <Link key={href} href={href} className={`adm-drawer-link${match(pathname) ? ' is-active' : ''}`} onClick={() => setOpen(false)}>
                {label}
              </Link>
            ))}
            <p className="adm-drawer-muted">Altri</p>
            <Link
              href="/admin/statistiche"
              className={`adm-drawer-link${pathname.startsWith('/admin/statistiche') ? ' is-active' : ''}`}
              onClick={() => setOpen(false)}
            >
              Statistiche
            </Link>
            <Link href={clientSiteHref} className="adm-drawer-link" target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>
              ↗ Apri il sito
            </Link>
            {logoutSlot ? <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>{logoutSlot}</div> : null}
          </nav>
        </div>
      ) : null}
    </>
  )
}

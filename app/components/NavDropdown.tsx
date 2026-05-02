'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

type DropdownItem = {
  label: string
  href?: string
  onClick?: () => void
}

export default function NavDropdown({
  trigger,
  items,
}: {
  trigger: React.ReactNode
  items: DropdownItem[]
}) {
  const [isOpen, setIsOpen] = useState(false)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const cancelScheduledClose = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }

  /** Resta aperto ~3s dopo che il puntatore esce (tempo per cliccare le voci). */
  const scheduleClose = () => {
    cancelScheduledClose()
    closeTimerRef.current = setTimeout(() => setIsOpen(false), 3000)
  }

  const openNow = () => {
    cancelScheduledClose()
    setIsOpen(true)
  }

  const closeNow = () => {
    cancelScheduledClose()
    setIsOpen(false)
  }

  useEffect(() => () => cancelScheduledClose(), [])

  return (
    <div
      className="ndw"
      onMouseEnter={openNow}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        className="site-nav-link ndw-trigger"
        aria-expanded={isOpen}
        onClick={() => (isOpen ? closeNow() : openNow())}
      >
        {trigger}
        <span className={`ndw-chevron ${isOpen ? 'ndw-chevron--open' : ''}`}>▾</span>
      </button>

      {isOpen && (
        <div className="ndw-menu">
          {items.map((item, idx) =>
            item.href ? (
              <Link key={idx} href={item.href} className="ndw-item" onClick={closeNow}>
                {item.label}
              </Link>
            ) : (
              <button
                key={idx}
                type="button"
                className="ndw-item"
                onClick={() => { item.onClick?.(); closeNow() }}
              >
                {item.label}
              </button>
            )
          )}
        </div>
      )}

      <style>{`
        .ndw { position: relative; display: inline-flex; }

        .ndw-trigger { gap: .3rem; }

        .ndw-chevron {
          font-size: .55rem;
          opacity: .6;
          transition: transform .18s;
          display: inline-block;
          line-height: 1;
        }
        .ndw-chevron--open { transform: rotate(180deg); opacity: 1; }

        /* Menu — stessa estetica del .site-nav (frosted pill) */
        .ndw-menu {
          position: absolute;
          top: calc(100% + 6px);
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          gap: 2px;
          padding: .4rem;
          border-radius: 18px;
          min-width: 200px;
          z-index: 200;
          /* Eredita lo stesso stile frosted del nav */
          background: rgba(20, 20, 18, .72);
          backdrop-filter: blur(16px) saturate(1.5);
          -webkit-backdrop-filter: blur(16px) saturate(1.5);
          border: 1px solid rgba(255,255,255,.12);
          box-shadow: 0 8px 32px rgba(0,0,0,.28);
          animation: ndwIn .14s ease;
        }
        @keyframes ndwIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-6px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }

        /* Voci del menu — identiche a .site-nav-link */
        .ndw-item {
          display: inline-flex;
          align-items: center;
          min-height: 42px;
          padding: 0 1rem;
          border-radius: 999px;
          font-family: 'Syne', sans-serif;
          font-size: .74rem;
          font-weight: 700;
          letter-spacing: .08em;
          text-transform: uppercase;
          color: rgba(255,255,255,.88);
          background: transparent;
          border: none;
          cursor: pointer;
          text-decoration: none;
          transition: background .15s, color .15s;
          white-space: nowrap;
          width: 100%;
          text-align: left;
        }
        .ndw-item:hover {
          background: rgba(255,255,255,.12);
          color: #fff;
        }

        /* Light theme: quando il nav è su sfondo chiaro */
        .header-light .ndw-menu {
          background: rgba(255,255,255,.88);
          border-color: rgba(12,12,10,.1);
          box-shadow: 0 8px 32px rgba(12,12,10,.12);
        }
        .header-light .ndw-item {
          color: rgba(12,12,10,.82);
        }
        .header-light .ndw-item:hover {
          background: rgba(12,12,10,.06);
          color: #0c0c0a;
        }

        @media (max-width: 768px) {
          .ndw-menu {
            position: static;
            transform: none;
            background: transparent;
            backdrop-filter: none;
            border: none;
            box-shadow: none;
            padding: .2rem 0 0;
            animation: none;
            min-width: 0;
          }
          .ndw-item {
            min-height: 36px;
            font-size: .7rem;
            color: rgba(255,255,255,.7);
          }
        }
      `}</style>
    </div>
  )
}

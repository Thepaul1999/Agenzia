'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

const ATTR = 'data-site-header-theme'

export default function FixedHeader() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')

  useEffect(() => {
    const root = document.documentElement
    const read = () => {
      const v = root.getAttribute(ATTR)
      if (v === 'light' || v === 'dark') setTheme(v)
      else setTheme('dark')
    }
    read()
    const mo = new MutationObserver(read)
    mo.observe(root, { attributes: true, attributeFilter: [ATTR] })
    return () => mo.disconnect()
  }, [])

  return (
    <>
      <style>{`
        .fh-root {
          position: fixed;
          top: var(--admin-bar, 0px);
          left: 0;
          z-index: 200;
          padding: var(--header-top, 1rem) clamp(.8rem, 3vw, 1.5rem)
            clamp(.35rem, 1vw, 0.55rem) clamp(.8rem, 3vw, 1.5rem);
          pointer-events: none;
        }
        .fh-btn {
          pointer-events: auto;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 2.55rem;
          height: 2.55rem;
          border-radius: 50%;
          backdrop-filter: blur(10px) saturate(1.4);
          -webkit-backdrop-filter: blur(10px) saturate(1.4);
          text-decoration: none;
          transition: background .2s, transform .2s, box-shadow .2s, border-color .2s, color .2s;
        }
        .fh-btn svg {
          width: 1.2rem;
          height: 1.2rem;
          flex-shrink: 0;
        }
        .fh-theme-dark .fh-btn {
          background: rgba(255,255,255,.18);
          border: 1px solid rgba(255,255,255,.28);
          box-shadow: 0 2px 12px rgba(12,12,10,.18);
          color: #fff;
        }
        .fh-theme-dark .fh-btn:hover {
          background: rgba(196,98,45,.85);
          border-color: rgba(196,98,45,.6);
          box-shadow: 0 4px 20px rgba(196,98,45,.35);
          transform: scale(1.08);
        }
        /* Come header-light / pill centrale sopra fondo chiaro */
        .fh-theme-light .fh-btn {
          border: 1px solid rgba(12,12,10,.12);
          background: rgba(255,255,255,.92);
          box-shadow: 0 8px 24px rgba(12,12,10,.08);
          color: var(--ink, #0c0c0a);
        }
        .fh-theme-light .fh-btn:hover {
          background: var(--ink, #0c0c0a);
          border-color: var(--ink, #0c0c0a);
          color: #fff;
          transform: scale(1.06);
          box-shadow: 0 4px 18px rgba(12,12,10,.22);
        }
        @media (max-width: 480px) {
          .fh-root { padding: .55rem; }
          .fh-btn { width: 2.2rem; height: 2.2rem; }
          .fh-btn svg { width: 1.05rem; height: 1.05rem; }
        }
      `}</style>

      <div className={`fh-root fh-theme-${theme}`}>
        <Link href="/home" prefetch={false} className="fh-btn" aria-label="Vai alla home">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M3 10.5L12 3l9 7.5V21h-5.5v-5.5h-7V21H3z"/>
          </svg>
        </Link>
      </div>
    </>
  )
}

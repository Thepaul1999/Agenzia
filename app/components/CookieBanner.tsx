'use client'

import { useState, useEffect } from 'react'

const COOKIE_KEY = 'cookie_consent'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(COOKIE_KEY)
      if (!saved) setVisible(true)
    } catch {
      // localStorage non disponibile (SSR/private mode)
    }
  }, [])

  const accept = () => {
    localStorage.setItem(COOKIE_KEY, 'accepted')
    setVisible(false)
  }

  const decline = () => {
    localStorage.setItem(COOKIE_KEY, 'declined')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <>
      <div className="cb-wrap" role="dialog" aria-label="Consenso cookie">
        <p className="cb-title">🍪 Usiamo i cookie</p>
        <p className="cb-text">
          Utilizziamo cookie tecnici e, con il tuo consenso, analitici per migliorare l&apos;esperienza.
          Leggi la nostra{' '}
          <a href="/cookie" className="cb-link">Cookie Policy</a>.
        </p>
        <div className="cb-actions">
          <button className="cb-btn cb-btn--secondary" onClick={decline}>
            Solo necessari
          </button>
          <button className="cb-btn cb-btn--primary" onClick={accept}>
            Accetta tutto
          </button>
        </div>
      </div>

      <style>{`
        .cb-wrap {
          position: fixed;
          bottom: 1.5rem;
          left: 1.5rem;
          z-index: 8500;
          max-width: 340px;
          background: #fff;
          border: 1.5px solid #e9e4dd;
          border-radius: 18px;
          padding: 1.4rem 1.5rem;
          box-shadow: 0 16px 48px rgba(12,12,10,.14), 0 4px 16px rgba(12,12,10,.08);
          animation: cbSlideUp .28s cubic-bezier(.34,1.56,.64,1) both;
        }
        @keyframes cbSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .cb-title {
          font-family: 'Syne', sans-serif;
          font-size: .88rem;
          font-weight: 800;
          color: #0c0c0a;
          margin: 0 0 .55rem;
        }
        .cb-text {
          font-family: 'Manrope', Arial, sans-serif;
          font-size: .78rem;
          line-height: 1.65;
          color: #7c7770;
          margin: 0 0 1rem;
        }
        .cb-link {
          color: #c4622d;
          text-decoration: none;
          font-weight: 600;
        }
        .cb-link:hover { text-decoration: underline; }
        .cb-actions {
          display: flex;
          gap: .6rem;
          flex-wrap: wrap;
        }
        .cb-btn {
          flex: 1;
          padding: .52rem .9rem;
          border-radius: 999px;
          font-family: 'Syne', sans-serif;
          font-size: .68rem;
          font-weight: 700;
          letter-spacing: .05em;
          text-transform: uppercase;
          cursor: pointer;
          border: 1.5px solid;
          transition: background .18s, color .18s;
          white-space: nowrap;
        }
        .cb-btn--primary {
          background: #c4622d;
          color: #fff;
          border-color: #c4622d;
        }
        .cb-btn--primary:hover { background: #a0501f; border-color: #a0501f; }
        .cb-btn--secondary {
          background: transparent;
          color: #7c7770;
          border-color: #e9e4dd;
        }
        .cb-btn--secondary:hover { background: #f5f3f0; color: #0c0c0a; }

        @media (max-width: 480px) {
          .cb-wrap {
            bottom: 0;
            left: 0;
            right: 0;
            max-width: none;
            border-radius: 18px 18px 0 0;
            border-left: none;
            border-right: none;
            border-bottom: none;
          }
        }
      `}</style>
    </>
  )
}

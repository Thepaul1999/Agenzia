'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import type { ReactNode } from 'react'
import type { Lang } from '@/lib/language'

const STORAGE_KEY = 'lang_session'

function getSavedLang(): Lang | null {
  // 1. sessionStorage (tab corrente — non persiste oltre la sessione)
  try {
    const ss = sessionStorage.getItem(STORAGE_KEY)
    if (ss === 'it' || ss === 'en') return ss
  } catch {}
  // 2. cookie (impostato in questa sessione)
  try {
    const m = document.cookie.match(/(?:^|;\s*)lang=([^;]+)/)
    if (m && (m[1] === 'it' || m[1] === 'en')) return m[1] as Lang
  } catch {}
  return null
}

export default function LanguageGate({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const saved = getSavedLang()
    if (saved) {
      // Sincronizza sessionStorage se mancante
      try { sessionStorage.setItem(STORAGE_KEY, saved) } catch {}
      setLang(saved)
    } else {
      const t = setTimeout(() => setVisible(true), 80)
      return () => clearTimeout(t)
    }
  }, [])

  const choose = (l: Lang) => {
    try { sessionStorage.setItem(STORAGE_KEY, l) } catch {}
    // Cookie valido 1 anno — richiesto di nuovo alla prossima sessione browser
    // se sessionStorage è vuoto (nessun localStorage per "sempre chiedere")
    document.cookie = `lang=${l}; path=/; max-age=31536000; SameSite=Lax`
    window.dispatchEvent(new CustomEvent('lang-change', { detail: l }))
    setLang(l)
  }

  useEffect(() => {
    ;(window as unknown as Record<string, unknown>).__setLang = (l: Lang) => {
      sessionStorage.removeItem(STORAGE_KEY)
      setLang(null)
      setTimeout(() => {
        sessionStorage.setItem(STORAGE_KEY, l)
        window.dispatchEvent(new CustomEvent('lang-change', { detail: l }))
        setLang(l)
      }, 50)
    }
    return () => {
      delete (window as unknown as Record<string, unknown>).__setLang
    }
  }, [])

  if (lang) return <>{children}</>

  return (
    <>
      <div style={{ visibility: 'hidden', position: 'fixed', pointerEvents: 'none' }}>
        {children}
      </div>

      <div className="lg-wrap" style={{ opacity: visible ? 1 : 0, transition: 'opacity .5s ease' }}>

        {/* Foto — desktop: landscape centrato, mobile: portrait */}
        <picture>
          <source media="(max-width: 640px)" srcSet="/LangPage/Sfondo_LangPage_SmartPhone.jpg" />
          <source media="(min-width: 641px)" srcSet="/LangPage/Sfondo_LangPage_PC.jpg" />
          <img src="/LangPage/Sfondo_LangPage_PC.jpg" alt="" className="lg-photo" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
        </picture>

        {/* Overlay scuro globale leggero — abbassa la luminosità della foto */}
        <div className="lg-dim" />

        {/* Contenuto centrato */}
        <div className="lg-body">

          {/* Logo */}
          <div className="lg-logo-wrap">
            <Image
              src="/images/logo/Logo_agenzia.jpg"
              alt="Agenzia Immobiliare Monferrato"
              width={900}
              height={260}
              priority
              className="lg-logo"
            />
          </div>

          {/* Titolo + sub */}
          <h1 className="lg-title">
            Benvenuto <span>Welcome</span>
          </h1>
          <p className="lg-sub">Scegli la tua lingua — Choose your language</p>

          {/* Pulsanti */}
          <div className="lg-actions">
            <button className="lg-btn lg-btn--it" onClick={() => choose('it')}>
              <span className="lg-flag">🇮🇹</span> Italiano
            </button>
            <button className="lg-btn lg-btn--en" onClick={() => choose('en')}>
              <span className="lg-flag">🇬🇧</span> English
            </button>
          </div>
        </div>
      </div>

      <style>{`
        /* ── Wrapper pieno schermo ── */
        .lg-wrap {
          position: fixed; inset: 0; z-index: 9999;
          display: flex; align-items: center; justify-content: center;
          overflow: hidden;
        }

        /* ── Foto: desktop landscape, mobile portrait (crop sinistra) ── */
        .lg-photo {
          object-fit: cover;
          object-position: center center;
        }
        @media (max-width: 640px) {
          .lg-photo { object-position: 30% center; }
        }

        /* ── Overlay scuro globale: abbassa luminosità foto al 45% ── */
        .lg-dim {
          position: absolute; inset: 0; z-index: 1;
          background: rgba(0, 0, 0, 0.45);
        }

        /* ── Corpo contenuto ── */
        .lg-body {
          position: relative; z-index: 2;
          text-align: center;
          padding: clamp(2rem, 5vw, 3.5rem) clamp(2rem, 8vw, 6rem);
          /* Pannello vetro scuro — quasi invisibile ma dà profondità */
          background: rgba(0, 0, 0, 0.28);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          border-radius: 24px;
          /* Nessun bordo visibile — solo un sottile highlight interno */
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.08),
            0 24px 60px rgba(0,0,0,0.35);
          max-width: 560px;
          width: calc(100% - 3rem);
          animation: lgUp .6s cubic-bezier(.22,.68,0,1.2) both;
          animation-delay: .1s;
        }
        @keyframes lgUp {
          from { opacity:0; transform: translateY(20px) scale(.98); }
          to   { opacity:1; transform: translateY(0) scale(1); }
        }

        /* ── Logo ── */
        .lg-logo-wrap {
          display: flex; justify-content: center;
          margin-bottom: 1.8rem;
        }
        .lg-logo {
          width: 100% !important; height: auto !important;
          max-width: 300px;
          object-fit: contain;
          border-radius: 6px;
          /* Leggero ritaglio del bordo bianco del logo per far emergere */
          filter: drop-shadow(0 2px 8px rgba(0,0,0,0.6));
        }

        /* ── Testo ── */
        .lg-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(1.9rem, 4.5vw, 2.8rem);
          font-weight: 800; line-height: 1.1;
          color: #fff; margin: 0 0 .7rem;
          letter-spacing: -.4px;
          text-shadow: 0 2px 12px rgba(0,0,0,0.4);
        }
        .lg-title span { color: #e8824e; }

        .lg-sub {
          font-size: .95rem;
          color: rgba(255,255,255,.75);
          margin: 0 0 2rem;
          text-shadow: 0 1px 6px rgba(0,0,0,0.4);
        }

        /* ── Bottoni ── */
        .lg-actions {
          display: flex; gap: .85rem;
          justify-content: center; flex-wrap: wrap;
        }
        .lg-btn {
          display: inline-flex; align-items: center; gap: .5rem;
          padding: .88rem 2rem;
          border-radius: 999px;
          font-family: 'Syne', sans-serif;
          font-size: .74rem; font-weight: 700;
          letter-spacing: .08em; text-transform: uppercase;
          cursor: pointer; min-width: 148px; justify-content: center;
          transition: transform .15s, box-shadow .2s, background .18s;
        }
        .lg-flag { font-size: 1.1rem; line-height: 1; }

        .lg-btn--it {
          background: #c4622d; color: #fff;
          border: none;
          box-shadow: 0 4px 20px rgba(196,98,45,.45);
        }
        .lg-btn--it:hover {
          background: #a8501f;
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(196,98,45,.5);
        }
        .lg-btn--en {
          background: rgba(255,255,255,.15);
          color: #fff;
          border: 1.5px solid rgba(255,255,255,.45);
          backdrop-filter: blur(4px);
        }
        .lg-btn--en:hover {
          background: rgba(255,255,255,.25);
          border-color: rgba(255,255,255,.8);
          transform: translateY(-2px);
        }

        /* ── Mobile ── */
        @media (max-width: 640px) {
          .lg-body {
            padding: 1.75rem 1.4rem;
            border-radius: 18px;
            max-width: calc(100% - 3rem);
            margin: 0 1.5rem;
          }
          .lg-photo { object-position: 70% center; }
          .lg-logo { max-width: 220px; }
          .lg-title { font-size: 1.7rem; }
          .lg-btn { padding: .8rem 1.6rem; font-size: .7rem; min-width: 130px; }
        }
      `}</style>
    </>
  )
}

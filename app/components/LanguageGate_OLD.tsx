'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'  // ← IMPORT CORRETTO
import type { ReactNode } from 'react'
import type { Lang } from '@/lib/language'

const STORAGE_KEY = 'lang_session'

export default function LanguageGate({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY)
    if (saved === 'it' || saved === 'en') {
      setLang(saved)
    } else {
      const t = setTimeout(() => setVisible(true), 80)
      return () => clearTimeout(t)
    }
  }, [])

  const choose = (l: Lang) => {
    sessionStorage.setItem(STORAGE_KEY, l)
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

      <div
        className="lang-gate-overlay"
        style={{ opacity: visible ? 1 : 0, transition: 'opacity .4s ease' }}
      >
        <div className="lang-gate-bg-el lang-gate-bg-el--1" />
        <div className="lang-gate-bg-el lang-gate-bg-el--2" />

        {/* VERSIONE DESKTOP */}
        <div className="lang-gate-desktop">
          <div className="lang-gate-mark-desktop">
            <Image
              src="/images/logo/Logo_agenzia.jpg"
              alt=""
              width={1400}
              height={400}
              priority
              className="logo-gate-image-desktop"
            />
          </div>

          <h1 className="lang-gate-title-desktop">
            Benvenuto <span style={{ color: 'var(--tc)' }}>Welcome</span>
          </h1>
          <p className="lang-gate-sub-desktop">Scegli la tua lingua — Choose your language</p>
          <div className="lang-gate-actions-desktop">
            <button className="lang-gate-btn lang-gate-btn--primary" onClick={() => choose('it')}>
              <span className="lang-gate-flag">🇮🇹</span>
              Italiano
            </button>
            <button className="lang-gate-btn lang-gate-btn--outline" onClick={() => choose('en')}>
              <span className="lang-gate-flag">🇬🇧</span>
              English
            </button>
          </div>
        </div>

        {/* VERSIONE MOBILE */}
        <div className="lang-gate-mobile">
          <div className="lang-gate-mark">
            <Image
              src="/images/logo/Logo_agenzia.jpg"
              alt=""
              width={1200}
              height={350}
              priority
              className="logo-gate-image"
            />
          </div>

          <h1 className="lang-gate-title">
            Benvenuto <span style={{ color: 'var(--tc)' }}>Welcome</span>
          </h1>
          <p className="lang-gate-sub">Scegli la tua lingua — Choose your language</p>
          <div className="lang-gate-actions">
            <button className="lang-gate-btn lang-gate-btn--primary" onClick={() => choose('it')}>
              <span className="lang-gate-flag">🇮🇹</span>
              Italiano
            </button>
            <button className="lang-gate-btn lang-gate-btn--outline" onClick={() => choose('en')}>
              <span className="lang-gate-flag">🇬🇧</span>
              English
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .lang-gate-overlay {
          position: fixed; inset: 0; z-index: 9999;
          background: var(--bg, #fff);
          display: flex; align-items: center; justify-content: center;
          padding: 0; overflow: hidden;
        }
        .lang-gate-bg-el { position: absolute; border-radius: 50%; pointer-events: none; }
        .lang-gate-bg-el--1 { width:600px;height:600px;background:radial-gradient(circle,rgba(196,98,45,.08) 0%,transparent 70%);top:-150px;right:-150px; }
        .lang-gate-bg-el--2 { width:400px;height:400px;background:radial-gradient(circle,rgba(196,98,45,.05) 0%,transparent 70%);bottom:-100px;left:-100px; }

        /* DESKTOP VERSION */
        .lang-gate-desktop { display: none; }

        /* MOBILE VERSION */
        .lang-gate-mobile {
          position:relative;text-align:center;max-width:480px;width:100%;animation:lgFadeUp .55s cubic-bezier(.22,.68,0,1.2) both;animation-delay:.12s;padding:2rem;
        }

        @keyframes lgFadeUp { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
        .lang-gate-mark { display:flex;justify-content:center;margin-bottom:2.5rem;width:100%;}
        .logo-gate-image { width: 100%; max-width: 90vw; height:auto; object-fit:contain; }
        .lang-gate-eyebrow { font-family:'Syne',sans-serif;font-size:.68rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--tc,#c4622d);margin:0 0 1.2rem; }
        .lang-gate-title { font-family:'Syne',sans-serif;font-size: clamp(1.6rem, 4vw, 2.4rem);font-weight:800;color:var(--ink,#0c0c0a);line-height:1.2;margin:0 0 1.2rem;letter-spacing:-.5px; }
        .lang-gate-title span { color:var(--tc);margin-left:.4em; }
        .lang-gate-sub { font-size:.95rem;color:var(--mid,#7c7770);margin:0 0 2.2rem;line-height:1.6; }
        .lang-gate-actions { display:flex;gap:1rem;justify-content:center;flex-wrap:wrap; }
        .lang-gate-btn { display:inline-flex;align-items:center;gap:.55rem;padding:.85rem 2rem;border-radius:999px;font-family:'Syne',sans-serif;font-size:.75rem;font-weight:700;letter-spacing:.07em;text-transform:uppercase;cursor:pointer;transition:transform .15s,background .2s,box-shadow .2s;border:1.5px solid transparent;min-width:160px;justify-content:center; }
        .lang-gate-btn--primary { background:var(--tc,#c4622d);color:#fff;border-color:var(--tc,#c4622d);box-shadow:0 4px 20px rgba(196,98,45,.25); }
        .lang-gate-btn--primary:hover { background:var(--tc-dk,#a0501f);transform:translateY(-2px);box-shadow:0 8px 28px rgba(196,98,45,.32); }
        .lang-gate-btn--outline { background:transparent;color:var(--ink,#0c0c0a);border-color:var(--line,#e9e4dd); }
        .lang-gate-btn--outline:hover { background:var(--ink,#0c0c0a);color:#fff;border-color:var(--ink,#0c0c0a);transform:translateY(-2px); }
        .lang-gate-flag { font-size:1.2rem;line-height:1; }

        /* DESKTOP BREAKPOINT */
        @media (min-width: 1024px) {
          .lang-gate-desktop { display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; max-width: 1100px; animation:lgFadeUp .55s cubic-bezier(.22,.68,0,1.2) both;animation-delay:.12s; }
          .lang-gate-mobile { display: none; }

          .lang-gate-mark-desktop { display:flex;justify-content:center;margin-bottom:2.5rem;width:100%; }
          .logo-gate-image-desktop { width: 100%; max-width: 1000px; height:auto; object-fit:contain; }
          .lang-gate-title-desktop { font-family:'Syne',sans-serif;font-size: 2.8rem;font-weight:800;color:var(--ink,#0c0c0a);line-height:1.2;margin:0 0 1.5rem;letter-spacing:-.5px; }
          .lang-gate-title-desktop span { color:var(--tc);margin-left:.5em; }
          .lang-gate-sub-desktop { font-size:1.05rem;color:var(--mid,#7c7770);margin:0 0 2.8rem;line-height:1.6; }
          .lang-gate-actions-desktop { display:flex;gap:1.5rem;justify-content:center;flex-wrap:wrap; }
        }
        }

        /* TABLET */
        @media (max-width: 1023px) {
          .lang-gate-mobile { margin-bottom: 2.5rem; }
        }

        /* SMALL MOBILE */
        @media (max-width: 480px) {
          .lang-gate-mobile { margin-bottom: 1.5rem; padding: 1rem; }
          .lang-gate-btn { padding: .75rem 1.5rem; font-size: .7rem; min-width: 140px; }
        }
      `}</style>
    </>
  )
}
'use client'

import { useState, useEffect } from 'react'
import type { Lang } from '@/lib/language'

const STORAGE_KEY = 'lang_session'

export default function LanguageSwitcher() {
  const [current, setCurrent] = useState<Lang>('it')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY)
    if (saved === 'it' || saved === 'en') setCurrent(saved)
    const handler = (e: CustomEvent) => {
      if (e.detail === 'it' || e.detail === 'en') setCurrent(e.detail)
    }
    window.addEventListener('lang-change', handler as EventListener)
    return () => window.removeEventListener('lang-change', handler as EventListener)
  }, [])

  const switchTo = (l: Lang) => {
    setOpen(false)
    document.cookie = `lang=${l}; path=/; max-age=604800; SameSite=Lax`
    const setter = (window as unknown as Record<string, unknown>).__setLang
    if (typeof setter === 'function') {
      setter(l)
    } else {
      sessionStorage.setItem(STORAGE_KEY, l)
      window.dispatchEvent(new CustomEvent('lang-change', { detail: l }))
      setCurrent(l)
    }
  }

  return (
    <>
      <div className="lang-switcher-wrap">
        <button
          className="lang-switcher-btn"
          onClick={() => setOpen((v) => !v)}
          aria-label="Cambia lingua"
        >
          <span className="lang-switcher-flag">{current === 'it' ? '🇮🇹' : '🇬🇧'}</span>
          <span className="lang-switcher-label">{current.toUpperCase()}</span>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
            style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>
            <path d="M1.5 3.5L5 7L8.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
        {open && (
          <div className="lang-switcher-dropdown">
            {(['it', 'en'] as Lang[]).map((l) => (
              <button key={l} className={`lang-switcher-option ${current === l ? 'is-active' : ''}`} onClick={() => switchTo(l)}>
                <span>{l === 'it' ? '🇮🇹' : '🇬🇧'}</span>
                <span>{l === 'it' ? 'Italiano' : 'English'}</span>
                {current === l && <span className="lang-check">✓</span>}
              </button>
            ))}
          </div>
        )}
      </div>
      <style>{`
        .lang-switcher-wrap { position:fixed;bottom:1.5rem;right:1.5rem;z-index:9000; }
        .lang-switcher-btn { display:inline-flex;align-items:center;gap:.4rem;padding:.5rem .9rem;border-radius:999px;background:rgba(12,12,10,.78);backdrop-filter:blur(10px);color:rgba(255,255,255,.9);border:1.5px solid rgba(255,255,255,.12);font-family:'Syne',sans-serif;font-size:.68rem;font-weight:700;letter-spacing:.06em;cursor:pointer;transition:background .2s,transform .15s,box-shadow .2s;box-shadow:0 4px 20px rgba(0,0,0,.18); }
        .lang-switcher-btn:hover { background:rgba(12,12,10,.92);transform:translateY(-2px); }
        .lang-switcher-flag { font-size:1rem;line-height:1; }
        .lang-switcher-label { font-size:.62rem; }
        .lang-switcher-dropdown { position:absolute;bottom:calc(100% + .6rem);right:0;background:#fff;border:1.5px solid var(--line,#e9e4dd);border-radius:16px;padding:.4rem;min-width:150px;box-shadow:0 16px 48px rgba(0,0,0,.12);animation:ddFadeUp .18s ease; }
        @keyframes ddFadeUp { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        .lang-switcher-option { display:flex;align-items:center;gap:.7rem;width:100%;padding:.65rem .85rem;border-radius:10px;border:none;background:transparent;font-family:'Syne',sans-serif;font-size:.74rem;font-weight:600;color:var(--ink,#0c0c0a);cursor:pointer;transition:background .15s; }
        .lang-switcher-option:hover { background:var(--warm,#f5f3f0); }
        .lang-switcher-option.is-active { color:var(--tc,#c4622d); }
        .lang-check { margin-left:auto;font-size:.7rem;color:var(--tc,#c4622d);font-weight:800; }
        @media(max-width:480px){.lang-switcher-wrap{bottom:1rem;right:1rem;}}
      `}</style>
    </>
  )
}

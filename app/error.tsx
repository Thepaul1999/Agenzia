'use client'

import Link from 'next/link'
import { useLang } from '@/lib/useLang'

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const en = useLang() === 'en'
  return (
    <section className="er-wrap">
      <h1 className="er-title">{en ? 'Something went wrong' : 'Qualcosa è andato storto'}</h1>
      <p className="er-text">
        {en
          ? 'A temporary problem occurred. Please try again in a moment; if it persists, contact us and we will help right away.'
          : 'Si è verificato un problema temporaneo. Riprova tra un momento: se persiste, contattaci e ti aiutiamo subito.'}
      </p>
      <div className="er-actions">
        <button type="button" onClick={() => reset()} className="er-btn er-btn--primary">{en ? 'Try again' : 'Riprova'}</button>
        <Link href="/home" className="er-btn">{en ? 'Back to home' : 'Torna alla home'}</Link>
      </div>
      <style>{`
        .er-wrap { min-height: 70vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 7rem 1.4rem 4rem; font-family: var(--font-body); }
        .er-title { font-family: var(--font-body); font-weight: 800; font-size: clamp(1.6rem, 4vw, 2.2rem); color: #0c0c0a; margin: 0 0 .8rem; }
        .er-text { max-width: 28rem; color: #6e6962; line-height: 1.7; margin: 0 0 1.8rem; }
        .er-actions { display: flex; gap: .7rem; flex-wrap: wrap; justify-content: center; }
        .er-btn { padding: .7rem 1.4rem; border-radius: 999px; border: 1.5px solid #e9e4dd; background: transparent; font-family: var(--font-body); font-size: .72rem; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: #0c0c0a; text-decoration: none; cursor: pointer; }
        .er-btn:hover { background: #f5f3f0; }
        .er-btn--primary { background: #c4622d; border-color: #c4622d; color: #fff; }
        .er-btn--primary:hover { background: #a0501f; border-color: #a0501f; }
      `}</style>
    </section>
  )
}

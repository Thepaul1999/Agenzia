'use client'

import Link from 'next/link'
import { useLang } from '@/lib/useLang'

export default function NotFound() {
  const en = useLang() === 'en'
  return (
    <section className="nf-wrap">
      <p className="nf-code">404</p>
      <h1 className="nf-title">{en ? 'Page not found' : 'Pagina non trovata'}</h1>
      <p className="nf-text">
        {en
          ? 'The page you are looking for does not exist or has been moved. You can go back home or browse the available properties.'
          : 'La pagina che cerchi non esiste o è stata spostata. Puoi tornare alla home o guardare gli immobili disponibili.'}
      </p>
      <div className="nf-actions">
        <Link href="/home" className="nf-btn nf-btn--primary">{en ? 'Back to home' : 'Torna alla home'}</Link>
        <Link href="/immobili" className="nf-btn">{en ? 'View properties' : 'Vedi gli immobili'}</Link>
      </div>
      <style>{`
        .nf-wrap { min-height: 70vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 7rem 1.4rem 4rem; font-family: var(--font-body); }
        .nf-code { font-family: var(--font-body); font-weight: 800; font-size: clamp(4rem, 14vw, 8rem); line-height: 1; color: #c4622d; margin: 0 0 .5rem; }
        .nf-title { font-family: var(--font-body); font-weight: 800; font-size: clamp(1.6rem, 4vw, 2.2rem); color: #0c0c0a; margin: 0 0 .8rem; }
        .nf-text { max-width: 28rem; color: #6e6962; line-height: 1.7; margin: 0 0 1.8rem; }
        .nf-actions { display: flex; gap: .7rem; flex-wrap: wrap; justify-content: center; }
        .nf-btn { padding: .7rem 1.4rem; border-radius: 999px; border: 1.5px solid #e9e4dd; font-family: var(--font-body); font-size: .72rem; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: #0c0c0a; text-decoration: none; }
        .nf-btn:hover { background: #f5f3f0; }
        .nf-btn--primary { background: #c4622d; border-color: #c4622d; color: #fff; }
        .nf-btn--primary:hover { background: #a0501f; border-color: #a0501f; }
      `}</style>
    </section>
  )
}

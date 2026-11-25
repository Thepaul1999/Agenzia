'use client'

import Link from 'next/link'
import { useLang } from '@/lib/useLang'
import { COMPANY } from '@/lib/company'

export type LegalSection = { title: string; body: string[] }
export type LegalContent = {
  title: string
  intro: string
  sections: LegalSection[]
}

type Props = { it: LegalContent; en: LegalContent }

export default function LegalPage({ it, en }: Props) {
  const lang = useLang()
  const c = lang === 'en' ? en : it
  const updated = lang === 'en' ? COMPANY.lastUpdateEn : COMPANY.lastUpdate

  const holder = [
    COMPANY.legalName || COMPANY.name,
    COMPANY.address,
    COMPANY.vatNumber && `P.IVA ${COMPANY.vatNumber}`,
    COMPANY.reaNumber && `REA ${COMPANY.reaNumber}`,
    COMPANY.email,
  ].filter(Boolean)

  return (
    <article className="legal-page">
      <Link href="/home" className="legal-back">
        ← {lang === 'en' ? 'Back to home' : 'Torna alla home'}
      </Link>
      <h1>{c.title}</h1>
      <p className="legal-updated">
        {lang === 'en' ? 'Last updated' : 'Ultimo aggiornamento'}: {updated}
      </p>
      <p className="legal-intro">{c.intro}</p>

      {c.sections.map(s => (
        <section key={s.title}>
          <h2>{s.title}</h2>
          {s.body.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </section>
      ))}

      <section>
        <h2>{lang === 'en' ? 'Data controller' : 'Titolare del trattamento'}</h2>
        <p className="legal-holder">
          {holder.map((line, i) => (
            <span key={i}>
              {line}
              <br />
            </span>
          ))}
        </p>
      </section>

      <style>{`
        .legal-page {
          max-width: 760px;
          margin: 0 auto;
          padding: 7rem 1.4rem 4rem;
          font-family: var(--font-body);
          color: #3a3733;
          line-height: 1.75;
        }
        .legal-back {
          display: inline-block;
          margin-bottom: 1.5rem;
          font-family: var(--font-body);
          font-size: .72rem;
          font-weight: 700;
          letter-spacing: .06em;
          text-transform: uppercase;
          color: #c4622d;
          text-decoration: none;
        }
        .legal-back:hover { text-decoration: underline; }
        .legal-page h1 {
          font-family: var(--font-body);
          font-size: clamp(2rem, 5vw, 2.8rem);
          font-weight: 800;
          line-height: 1.15;
          color: #0c0c0a;
          margin: 0 0 .5rem;
        }
        .legal-updated { font-size: .8rem; color: #7c7770; margin: 0 0 1.5rem; }
        .legal-intro { font-size: 1rem; margin: 0 0 1.5rem; }
        .legal-page h2 {
          font-family: var(--font-body);
          font-size: 1.1rem;
          font-weight: 800;
          color: #0c0c0a;
          margin: 2rem 0 .5rem;
        }
        .legal-page p { margin: 0 0 .8rem; font-size: .93rem; }
        .legal-holder { font-weight: 500; }
      `}</style>
    </article>
  )
}

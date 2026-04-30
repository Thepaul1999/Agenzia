'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useLang } from '@/lib/useLang'
import { translations } from '@/lib/language'

const WA = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '393332397206'
const MAIL = 'info@agenziamonferrato.it'
const TEL_DISPLAY = '+39 333 239 7206'
const TEL_HREF = `tel:+${WA}`
const WA_HREF = `https://wa.me/${WA}?text=Buongiorno%2C%20vorrei%20avere%20informazioni%20su%20un%20immobile%20nel%20Monferrato.`

export default function Footer() {
  const lang = useLang()
  const t = translations[lang]
  const year = new Date().getFullYear()

  return (
    <footer className="sf-root">

      {/* ── Main grid ── */}
      <div className="sf-inner">

        {/* Col 1 — brand + logo + nav */}
        <div className="sf-brand-col">
          <Link href="/" className="sf-logo-wrap" aria-label="Home">
            <Image
              src="/images/logo/Logo_agenzia.jpg"
              alt="Monferrato Immobiliare"
              width={140}
              height={70}
              className="sf-logo"
            />
          </Link>
          <div className="sf-brand-name">
            <span className="sf-dot" />
            {t.brandName}
          </div>
          <p className="sf-tagline">{t.footerTagline}</p>
          <p className="sf-tagline sf-tagline--muted">Monferrato, Piemonte — Italia</p>

          <nav className="sf-nav" aria-label="Footer navigation">
            <Link href="/immobili" className="sf-nav-link">{t.properties}</Link>
            <Link href="/#servizi" className="sf-nav-link">{t.services}</Link>
            <Link href="/#contatti" className="sf-nav-link">{t.contacts}</Link>
          </nav>
        </div>

        {/* Col 2 — contact card (stile screen 2) */}
        <div className="sf-contact-col">
          <p className="sf-contact-label">{lang === 'it' ? 'Contatti' : 'Contact'}</p>

          <div className="sf-contact-card">
            {/* WhatsApp */}
            <div className="sf-contact-row sf-contact-row--line">
              <span className="sf-contact-key">WhatsApp</span>
              <a href={WA_HREF} target="_blank" rel="noopener noreferrer" className="sf-contact-pill">
                {lang === 'it' ? 'Scrivici su WhatsApp' : 'Write on WhatsApp'}
                <span>↗</span>
              </a>
            </div>

            {/* Mail */}
            <div className="sf-contact-row sf-contact-row--line">
              <span className="sf-contact-key">{lang === 'it' ? 'Mail' : 'Email'}</span>
              <a href={`mailto:${MAIL}`} className="sf-contact-link">
                {MAIL}
                <span className="sf-contact-arrow">↗</span>
              </a>
            </div>

            {/* Telefono */}
            <div className="sf-contact-row">
              <span className="sf-contact-key">{lang === 'it' ? 'Telefono' : 'Phone'}</span>
              <a href={TEL_HREF} className="sf-contact-link">{TEL_DISPLAY}</a>
            </div>
          </div>
        </div>

      </div>

      {/* ── Bottom bar ── */}
      <div className="sf-bottom">
        <div className="sf-bottom-inner">
          <p className="sf-copy">© {year} {t.agencyName}. {t.footerRights}</p>
          <div className="sf-legal">
            <Link href="/privacy">{t.footerPrivacy}</Link>
            <span className="sf-sep">·</span>
            <Link href="/cookie">{t.footerCookies}</Link>
          </div>
        </div>
      </div>

      <style>{`
        .sf-root {
          background: #0c0c0a;
          color: rgba(255,255,255,.75);
          margin-top: auto;
          font-family: 'Manrope', Arial, sans-serif;
        }
        .sf-inner {
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          gap: 3rem;
          max-width: 1360px;
          margin: 0 auto;
          padding: 4rem clamp(1.4rem, 5vw, 4.5rem) 3rem;
          align-items: start;
        }

        /* Brand col */
        .sf-logo-wrap { display: inline-block; margin-bottom: 1.2rem; border-radius: 12px; overflow: hidden; background: #fff; padding: 6px 10px; }
        .sf-logo { width: 140px; height: 70px; object-fit: contain; display: block; }
        .sf-brand-name {
          display: flex;
          align-items: center;
          gap: .55rem;
          font-family: 'Syne', sans-serif;
          font-size: .82rem;
          font-weight: 800;
          letter-spacing: .05em;
          text-transform: uppercase;
          color: rgba(255,255,255,.92);
          margin-bottom: .75rem;
        }
        .sf-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: #c4622d;
          flex-shrink: 0;
        }
        .sf-tagline {
          font-size: .82rem;
          color: rgba(255,255,255,.45);
          line-height: 1.65;
          margin: 0 0 .25rem;
        }
        .sf-tagline--muted { opacity: .55; }
        .sf-nav {
          display: flex;
          gap: 1.5rem;
          margin-top: 1.6rem;
          flex-wrap: wrap;
        }
        .sf-nav-link {
          font-family: 'Syne', sans-serif;
          font-size: .72rem;
          font-weight: 700;
          letter-spacing: .06em;
          text-transform: uppercase;
          color: rgba(255,255,255,.45);
          text-decoration: none;
          transition: color .15s;
        }
        .sf-nav-link:hover { color: rgba(255,255,255,.9); }

        /* Contact col */
        .sf-contact-col { display: flex; flex-direction: column; gap: 1rem; padding-top: .5rem; }
        .sf-contact-label {
          font-family: 'Syne', sans-serif;
          font-size: .6rem;
          font-weight: 700;
          letter-spacing: .1em;
          text-transform: uppercase;
          color: rgba(255,255,255,.3);
          margin: 0;
        }
        .sf-contact-card {
          background: rgba(255,255,255,.05);
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 18px;
          overflow: hidden;
        }
        .sf-contact-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding: 1rem 1.4rem;
          flex-wrap: wrap;
        }
        .sf-contact-row--line {
          border-bottom: 1px solid rgba(255,255,255,.07);
        }
        .sf-contact-key {
          font-family: 'Syne', sans-serif;
          font-size: .65rem;
          font-weight: 700;
          letter-spacing: .09em;
          text-transform: uppercase;
          color: rgba(255,255,255,.38);
          white-space: nowrap;
        }
        /* WhatsApp pill button */
        .sf-contact-pill {
          display: inline-flex;
          align-items: center;
          gap: .45rem;
          padding: .5rem 1.1rem;
          border-radius: 999px;
          background: #c4622d;
          color: #fff;
          font-family: 'Syne', sans-serif;
          font-size: .7rem;
          font-weight: 700;
          letter-spacing: .05em;
          text-transform: uppercase;
          text-decoration: none;
          transition: background .18s;
          white-space: nowrap;
        }
        .sf-contact-pill:hover { background: #a0501f; }
        /* Email / phone links */
        .sf-contact-link {
          display: inline-flex;
          align-items: center;
          gap: .4rem;
          font-size: .88rem;
          color: rgba(255,255,255,.78);
          text-decoration: none;
          transition: color .15s;
        }
        .sf-contact-link:hover { color: #fff; }
        .sf-contact-arrow { font-size: .8rem; color: rgba(255,255,255,.4); }

        /* Bottom bar */
        .sf-bottom {
          border-top: 1px solid rgba(255,255,255,.07);
        }
        .sf-bottom-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
          max-width: 1360px;
          margin: 0 auto;
          padding: 1.2rem clamp(1.4rem, 5vw, 4.5rem);
        }
        .sf-copy {
          font-size: .73rem;
          color: rgba(255,255,255,.28);
          margin: 0;
        }
        .sf-legal {
          display: flex;
          align-items: center;
          gap: .6rem;
          font-size: .73rem;
        }
        .sf-legal a {
          color: rgba(255,255,255,.28);
          text-decoration: none;
          transition: color .15s;
        }
        .sf-legal a:hover { color: rgba(255,255,255,.7); }
        .sf-sep { color: rgba(255,255,255,.18); }

        /* Responsive */
        @media (max-width: 768px) {
          .sf-inner {
            grid-template-columns: 1fr;
            gap: 2.5rem;
          }
        }
        @media (max-width: 480px) {
          .sf-bottom-inner {
            flex-direction: column;
            align-items: flex-start;
            gap: .5rem;
          }
          .sf-contact-row {
            flex-direction: column;
            align-items: flex-start;
            gap: .6rem;
          }
        }
      `}</style>
    </footer>
  )
}

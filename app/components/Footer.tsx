'use client'

import Link from 'next/link'
import { useLang } from '@/lib/useLang'
import { translations } from '@/lib/language'

export default function Footer() {
  const lang = useLang()
  const t = translations[lang]
  const year = new Date().getFullYear()

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">

        {/* Brand + tagline */}
        <div className="footer-brand-col">
          <span className="footer-brand">
            <span className="footer-brand-dot" />
            {t.brandName}
          </span>
          <p className="footer-tagline">{t.footerTagline}</p>
          <p className="footer-tagline" style={{ marginTop: '.3rem', opacity: .55 }}>Monferrato, Piemonte — Italia</p>
        </div>

        {/* Nav */}
        <nav className="footer-nav-col" aria-label="Footer navigation">
          <p className="footer-col-title">{lang === 'it' ? 'Esplora' : 'Explore'}</p>
          <ul className="footer-nav-list">
            <li><Link href="/#servizi">{t.services}</Link></li>
            <li><Link href="/immobili">{t.properties}</Link></li>
            <li><Link href="/#contatti">{t.contacts}</Link></li>
          </ul>
        </nav>

        {/* Contatti */}
        <div className="footer-contact-col">
          <p className="footer-col-title">{t.contacts}</p>
          <ul className="footer-nav-list">
            {process.env.NEXT_PUBLIC_WHATSAPP_NUMBER && (
              <li>
                <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer">
                  WhatsApp
                </a>
              </li>
            )}
            <li><span style={{ color: 'var(--mid)' }}>{lang === 'it' ? 'Lun–Ven 9:00–12:00' : 'Mon–Fri 9:00–12:00'}</span></li>
            <li><span style={{ color: 'var(--mid)' }}>{lang === 'it' ? 'Pomeriggio su appuntamento' : 'Afternoon by appointment'}</span></li>
          </ul>
        </div>

      </div>

      {/* Bottom bar */}
      <div className="footer-bottom">
        <div className="footer-bottom-inner">
          <p className="footer-copy">
            © {year} {t.agencyName}. {t.footerRights}
          </p>
          <div className="footer-legal-links">
            <Link href="/privacy">{t.footerPrivacy}</Link>
            <span className="footer-sep">·</span>
            <Link href="/cookie">{t.footerCookies}</Link>
          </div>
        </div>
      </div>

      <style>{`
        .site-footer {
          background: var(--ink, #0c0c0a);
          color: rgba(255,255,255,.75);
          margin-top: auto;
        }
        .site-footer-inner {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 3rem;
          max-width: 1360px;
          margin: 0 auto;
          padding: 4rem clamp(1.2rem, 4vw, 3rem) 3rem;
        }
        .footer-brand {
          display: flex;
          align-items: center;
          gap: .55rem;
          font-family: 'Syne', sans-serif;
          font-size: .82rem;
          font-weight: 800;
          letter-spacing: .05em;
          text-transform: uppercase;
          color: rgba(255,255,255,.92);
          margin-bottom: .9rem;
        }
        .footer-brand-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: var(--tc, #c4622d);
          flex-shrink: 0;
        }
        .footer-tagline {
          font-size: .82rem;
          color: rgba(255,255,255,.45);
          line-height: 1.6;
          margin: 0;
        }
        .footer-col-title {
          font-family: 'Syne', sans-serif;
          font-size: .6rem;
          font-weight: 700;
          letter-spacing: .1em;
          text-transform: uppercase;
          color: rgba(255,255,255,.35);
          margin: 0 0 1rem;
        }
        .footer-nav-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: .55rem;
        }
        .footer-nav-list a {
          font-size: .84rem;
          color: rgba(255,255,255,.6);
          text-decoration: none;
          transition: color .15s;
        }
        .footer-nav-list a:hover { color: rgba(255,255,255,.95); }
        /* Bottom */
        .footer-bottom {
          border-top: 1px solid rgba(255,255,255,.08);
        }
        .footer-bottom-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
          max-width: 1360px;
          margin: 0 auto;
          padding: 1.2rem clamp(1.2rem, 4vw, 3rem);
        }
        .footer-copy {
          font-size: .75rem;
          color: rgba(255,255,255,.3);
          margin: 0;
        }
        .footer-legal-links {
          display: flex;
          align-items: center;
          gap: .6rem;
          font-size: .75rem;
        }
        .footer-legal-links a {
          color: rgba(255,255,255,.3);
          text-decoration: none;
          transition: color .15s;
        }
        .footer-legal-links a:hover { color: rgba(255,255,255,.7); }
        .footer-sep { color: rgba(255,255,255,.2); }

        @media (max-width: 860px) {
          .site-footer-inner {
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
          }
          .footer-brand-col { grid-column: 1 / -1; }
        }
        @media (max-width: 540px) {
          .site-footer-inner {
            grid-template-columns: 1fr;
            gap: 2rem;
            padding-bottom: 2rem;
          }
          .footer-bottom-inner {
            flex-direction: column;
            align-items: flex-start;
            gap: .5rem;
          }
        }
      `}</style>
    </footer>
  )
}

'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useLang } from '@/lib/useLang'
import { translations } from '@/lib/language'
import { buildWhatsAppHref } from '@/lib/whatsappUrl'

const WA_RAW = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '393332397206'
const MAIL = 'info@agenziamonferrato.it'
const TEL_DISPLAY = '+39 333 239 7206'
const OFFICE_MAPS_URL = 'https://maps.app.goo.gl/L8Pmb65Z2Ytihb6p7'
const LOGO_PATH = '/images/logo/Logo_agenzia_scontornato.png'

type SiteCopy = { contactCopy?: string; footerTagline?: string }

function IconWhatsApp({ className }: { className?: string }) {
  return (
    <svg className={className} width={24} height={24} viewBox="0 0 24 24" aria-hidden>
      <circle cx={12} cy={12} r={12} fill="#25d366" />
      <path
        fill="#fff"
        d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.148-.197.297-.767.965-.94 1.164-.173.199-.347.223-.644.074-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.519.149-.174.198-.297.297-.497.098-.197.049-.371-.026-.519s-.688-1.611-.916-2.207-.489-.5-.716-.526c-.173-.018-.371-.026-.569-.026-.196 0-.497.074-.759.371-.273.297-1.04 1.016-1.04 2.478 0 1.463 1.065 2.875 1.213 3.073.148.197 2.095 3.2 5.068 4.572.713.307 1.263.489 1.694.624.713.226 1.372.193 1.867.117.569-.086 1.758-.726 2.006-1.422.246-.694.246-1.289.173-1.413-.074-.126-.274-.194-.569-.446zM12 20.848c-.041 0-.082 0-.123-.004-1.338-.086-2.619-.491-3.676-1.158l-.264-.173-3.743.986.982-3.642-.207-.354a9.734 9.734 0 01-1.511-5.264c-.002-5.45 4.434-9.884 9.892-9.884 2.646 0 5.139 1.031 7.017 2.902a9.866 9.866 0 012.917 7.086c-.002 5.451-4.434 9.884-9.892 9.884h-.035z"
      />
    </svg>
  )
}

function IconMail({ className }: { className?: string }) {
  return (
    <svg className={className} width={20} height={20} viewBox="0 0 24 24" fill="none" aria-hidden stroke="currentColor">
      <path
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 7h16v11H4V7zm16 0-8 5-8-5"
      />
    </svg>
  )
}

function IconMapPin({ className }: { className?: string }) {
  return (
    <svg className={className} width={20} height={20} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        stroke="#c4622d"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 21s7-4.436 7-11a7 7 0 10-14 0c0 6.564 7 11 7 11zm0-10a3 3 0 110-6 3 3 0 010 6z"
      />
    </svg>
  )
}

export default function Footer() {
  const lang = useLang()
  const t = translations[lang]
  const year = new Date().getFullYear()
  const [siteCopy, setSiteCopy] = useState<SiteCopy>({})

  useEffect(() => {
    fetch('/api/public/site-copy')
      .then(r => r.json())
      .then((d: SiteCopy) => setSiteCopy(d))
      .catch(() => {})
  }, [])

  const contactIntro =
    lang === 'it' && siteCopy.contactCopy?.trim() ? siteCopy.contactCopy : t.contactCopy
  const tagline =
    lang === 'it' && siteCopy.footerTagline?.trim() ? siteCopy.footerTagline : t.footerTagline

  const waMessage =
    lang === 'it'
      ? 'Buongiorno, vorrei avere informazioni su un immobile nel Monferrato.'
      : 'Hello, I would like information about a property in Monferrato.'

  const waHref = buildWhatsAppHref(WA_RAW, waMessage)

  return (
    <footer id="contatti" className="sf-root" data-scroll-anchor="contatti">

      <div className="sf-contact-header">
        <div className="sf-ch-inner">
          <span className="sf-ch-eyebrow">{t.contacts}</span>
          <h2 className="sf-ch-title">
            <span>{t.lookingForHouse}</span>{' '}
            <span>{t.inMonferrato}</span>{' '}
            <span className="sf-ch-accent">{t.startHere}</span>
          </h2>
          <p className="sf-ch-copy">{contactIntro}</p>
        </div>
      </div>

      <div className="sf-inner">
        {/* Colonna sinistra: brand + nav */}
        <div className="sf-brand-col">
          <div className="sf-brand-name">
            <span className="sf-dot" />
            {t.brandName}
          </div>
          <p className="sf-tagline">{tagline}</p>
          <p className="sf-tagline sf-tagline--muted">Monferrato, Piemonte — Italia</p>

          <nav className="sf-nav" aria-label="Footer navigation">
            <Link href="/immobili" className="sf-nav-link">{t.properties}</Link>
            <Link href="/#servizi" className="sf-nav-link">{t.services}</Link>
            <Link href="/#contatti" className="sf-nav-link">{t.contacts}</Link>
          </nav>
        </div>

        {/* Colonna destra: logo + caption, poi card contatti */}
        <div className="sf-contact-stack">
          <div className="sf-logo-intro">
            <p className="sf-logo-caption">{t.footerLogoCaption}</p>
            <Link href="/" className="sf-logo-link-wrap" aria-label={t.agencyName}>
              <Image
                src={LOGO_PATH}
                alt="Agenzia Immobiliare Monferrato"
                width={220}
                height={140}
                className="sf-logo-scontornato"
                sizes="(max-width: 600px) 200px, 220px"
              />
            </Link>
          </div>

          <div className="sf-contact-block">
            <p className="sf-contact-label">{lang === 'it' ? 'Contatti diretti' : 'Contact us'}</p>

            <div className="sf-contact-card">
              {/* Telefono: numero + icona → entrambi WhatsApp */}
              <div className="sf-contact-row sf-contact-row--line">
                <span className="sf-contact-key">{lang === 'it' ? 'Telefono' : 'Phone'}</span>
                <div className="sf-phone-wa-group">
                  <a href={waHref} target="_blank" rel="noopener noreferrer" className="sf-contact-link">
                    {TEL_DISPLAY}
                  </a>
                  <a
                    href={waHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="sf-wa-icon-btn"
                    aria-label={t.footerWaAria}
                    title={t.footerWaAria}
                  >
                    <IconWhatsApp />
                  </a>
                </div>
              </div>

              {/* Mail: testo + bustina, senza pill arancione */}
              <div className="sf-contact-row sf-contact-row--line">
                <span className="sf-contact-key">{lang === 'it' ? 'Mail' : 'Email'}</span>
                <a href={`mailto:${MAIL}`} className="sf-mail-link">
                  <IconMail />
                  <span>{MAIL}</span>
                </a>
              </div>

              {/* Sede / Maps */}
              <div className="sf-contact-row sf-contact-row--line">
                <span className="sf-contact-key">{t.footerSede}</span>
                <a href={OFFICE_MAPS_URL} target="_blank" rel="noopener noreferrer" className="sf-maps-link">
                  <IconMapPin />
                  <span>{t.footerOpenMaps}</span>
                  <span className="sf-maps-arrow" aria-hidden>↗</span>
                </a>
              </div>

              <div className="sf-contact-row">
                <span className="sf-contact-key">{lang === 'it' ? 'Orari' : 'Hours'}</span>
                <span className="sf-hours-text">{t.hoursText}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

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

        .sf-contact-header {
          border-bottom: 1px solid rgba(255,255,255,.07);
        }
        .sf-ch-inner {
          max-width: 1360px;
          margin: 0 auto;
          padding: 4rem clamp(1.4rem, 5vw, 4.5rem) 3rem;
        }
        .sf-ch-eyebrow {
          display: inline-block;
          font-family: 'Syne', sans-serif;
          font-size: .65rem;
          font-weight: 700;
          letter-spacing: .1em;
          text-transform: uppercase;
          color: #c4622d;
          border: 1px solid #c4622d;
          border-radius: 999px;
          padding: .25rem .75rem;
          margin-bottom: 1.2rem;
        }
        .sf-ch-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(1.8rem, 3.5vw, 2.8rem);
          font-weight: 800;
          line-height: 1.2;
          letter-spacing: -.02em;
          color: #fff;
          margin: 0 0 1rem;
        }
        .sf-ch-accent { color: #c4622d; }
        .sf-ch-copy {
          font-size: .9rem;
          color: rgba(255,255,255,.5);
          max-width: 36rem;
          line-height: 1.7;
          margin: 0;
        }

        .sf-inner {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: clamp(2rem, 4vw, 3.5rem);
          max-width: 1360px;
          margin: 0 auto;
          padding: 3rem clamp(1.4rem, 5vw, 4.5rem) 3rem;
          align-items: start;
        }

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

        .sf-contact-stack {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 2rem;
        }
        .sf-logo-intro {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: .85rem;
          max-width: 280px;
        }
        .sf-logo-caption {
          font-family: 'Syne', sans-serif;
          font-size: .8rem;
          font-weight: 600;
          letter-spacing: .02em;
          color: rgba(255,255,255,.55);
          text-align: right;
          margin: 0;
          line-height: 1.45;
          font-style: italic;
        }
        .sf-logo-link-wrap {
          display: block;
          line-height: 0;
        }

        .sf-contact-block {
          width: 100%;
          max-width: 440px;
        }
        .sf-contact-label {
          font-family: 'Syne', sans-serif;
          font-size: .6rem;
          font-weight: 700;
          letter-spacing: .1em;
          text-transform: uppercase;
          color: rgba(255,255,255,.3);
          margin: 0 0 .85rem;
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
          padding: .9rem 1.35rem;
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

        .sf-phone-wa-group {
          display: inline-flex;
          align-items: center;
          gap: .65rem;
        }
        .sf-contact-link {
          font-size: .88rem;
          color: rgba(255,255,255,.78);
          text-decoration: none;
          transition: color .15s;
        }
        .sf-contact-link:hover { color: #fff; }
        .sf-wa-icon-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          line-height: 0;
          border-radius: 50%;
          transition: transform .18s, box-shadow .18s;
        }
        .sf-wa-icon-btn:hover {
          transform: scale(1.06);
          box-shadow: 0 6px 20px rgba(37,211,102,.35);
        }
        .sf-wa-icon-btn:focus-visible {
          outline: 2px solid #25d366;
          outline-offset: 3px;
        }

        .sf-mail-link {
          display: inline-flex;
          align-items: center;
          gap: .5rem;
          font-size: .86rem;
          font-weight: 500;
          color: rgba(255,255,255,.82);
          text-decoration: none;
          transition: color .15s;
        }
        .sf-mail-link:hover { color: #fff; }
        .sf-mail-link svg {
          opacity: .75;
          flex-shrink: 0;
        }

        .sf-maps-link {
          display: inline-flex;
          align-items: center;
          gap: .45rem;
          font-family: 'Syne', sans-serif;
          font-size: .72rem;
          font-weight: 700;
          letter-spacing: .05em;
          text-transform: uppercase;
          color: rgba(255,255,255,.78);
          text-decoration: none;
          transition: color .15s;
        }
        .sf-maps-link:hover {
          color: #c4622d;
        }
        .sf-maps-arrow {
          font-size: .75rem;
          opacity: .6;
          margin-left: .15rem;
        }

        .sf-hours-text {
          font-size: .82rem;
          color: rgba(255,255,255,.6);
          white-space: pre-line;
          line-height: 1.6;
          text-align: right;
        }

        .sf-logo-scontornato {
          width: 100%;
          max-width: 220px;
          height: auto;
          object-fit: contain;
          opacity: .93;
          transition: opacity .2s;
        }
        .sf-logo-link-wrap:hover .sf-logo-scontornato { opacity: 1; }

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

        @media (max-width: 900px) {
          .sf-inner {
            grid-template-columns: 1fr;
          }
          .sf-contact-stack {
            align-items: flex-start;
          }
          .sf-logo-intro {
            align-items: flex-start;
            max-width: 100%;
          }
          .sf-logo-caption {
            text-align: left;
          }
        }
        @media (max-width: 600px) {
          .sf-contact-row {
            flex-direction: column;
            align-items: flex-start;
            gap: .5rem;
          }
          .sf-hours-text { text-align: left; }
          .sf-bottom-inner {
            flex-direction: column;
            align-items: flex-start;
            gap: .5rem;
          }
          .sf-contact-block {
            max-width: 100%;
          }
        }
      `}</style>
    </footer>
  )
}

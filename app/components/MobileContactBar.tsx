'use client'

import { useEffect } from 'react'
import { useLang } from '@/lib/useLang'
import { buildWhatsAppHref } from '@/lib/whatsappUrl'

const WA_RAW = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '393332397206'
const TEL_HREF = 'tel:+393332397206'
const BAR_H = 64

/**
 * Barra fissa in basso, solo su telefono: Chiama e WhatsApp a un tocco.
 * Imposta la classe `has-contact-bar` su <html> per spostare gli altri elementi fissi.
 */
export default function MobileContactBar() {
  const lang = useLang()

  useEffect(() => {
    const root = document.documentElement
    root.classList.add('has-contact-bar')
    root.style.setProperty('--cbar-h', `${BAR_H}px`)
    return () => {
      root.classList.remove('has-contact-bar')
      root.style.removeProperty('--cbar-h')
    }
  }, [])

  const en = lang === 'en'
  const waMessage = en
    ? 'Hello! I would like some information about your properties.'
    : 'Ciao! Vorrei qualche informazione sui vostri immobili.'

  return (
    <>
      <nav className="mcb" aria-label={en ? 'Contact us' : 'Contattaci'}>
        <a className="mcb-btn mcb-call" href={TEL_HREF}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" />
          </svg>
          {en ? 'Call' : 'Chiama'}
        </a>
        <a className="mcb-btn mcb-wa" href={buildWhatsAppHref(WA_RAW, waMessage)} target="_blank" rel="noopener noreferrer">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.5.07-.76.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.21 3.08.15.2 2.1 3.2 5.07 4.57.71.31 1.26.49 1.7.63.71.23 1.37.2 1.87.12.57-.09 1.76-.72 2-1.42.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35zM12 21.8a9.9 9.9 0 0 1-5.04-1.38l-.36-.21-3.74.98 1-3.65-.24-.37A9.8 9.8 0 0 1 2.2 12C2.2 6.6 6.6 2.2 12 2.2c2.64 0 5.1 1.03 6.96 2.9A9.8 9.8 0 0 1 21.8 12c0 5.4-4.4 9.8-9.8 9.8z" />
          </svg>
          WhatsApp
        </a>
      </nav>

      <style>{`
        .mcb { display: none; }
        @media (max-width: 768px) {
          .mcb {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: .6rem;
            position: fixed;
            left: 0; right: 0; bottom: 0;
            z-index: 8000;
            padding: .6rem .8rem calc(.6rem + env(safe-area-inset-bottom));
            background: rgba(255,255,255,.96);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border-top: 1px solid #e9e4dd;
            box-shadow: 0 -8px 24px rgba(12,12,10,.08);
          }
          .mcb-btn {
            display: inline-flex; align-items: center; justify-content: center; gap: .5rem;
            min-height: 46px;
            border-radius: 999px;
            font-family: 'Syne', sans-serif;
            font-size: .78rem; font-weight: 700; letter-spacing: .05em; text-transform: uppercase;
            text-decoration: none;
          }
          .mcb-call { background: #0c0c0a; color: #fff; }
          .mcb-wa { background: #25d366; color: #fff; }
          html.has-contact-bar body { padding-bottom: calc(var(--cbar-h, 64px) + env(safe-area-inset-bottom)); }
          html.has-contact-bar .lang-switcher-wrap { bottom: calc(var(--cbar-h, 64px) + 1rem) !important; }
          html.has-contact-bar .admin-immo-float { bottom: calc(var(--cbar-h, 64px) + 1rem) !important; }
        }
      `}</style>
    </>
  )
}

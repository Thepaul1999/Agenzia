'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import WhatsAppButton from './WhatsAppButton'
import ImmobileEditModal from './ImmobileEditModal'
import { useLang } from '@/lib/useLang'
import { translations } from '@/lib/language'
import { buildWhatsAppHref } from '@/lib/whatsappUrl'
import { propertyMapEmbedSrc, propertyMapExternalHref } from '@/lib/propertyMapLinks'

type Props = {
  isAdmin: boolean
  immobile: {
    id: string
    titolo: string
    titolo_en: string | null
    descrizione: string | null
    descrizione_en: string | null
    citta: string | null
    prezzo: number | null
    prezzoFormattato: string | null
    featured: boolean
    stato: string
    tipo_contratto: string | null
    mq: number | null
    locali: number | null
    lat: number | null
    lng: number | null
    indirizzo: string | null
    posizione_approssimativa: boolean
    imageUrl: string | null
    slug: string
    waNumber: string
    propertyUrl: string
  }
}

export default function ImmobileDetailClient({ isAdmin, immobile }: Props) {
  const lang = useLang()
  const t = translations[lang]
  const [showEditModal, setShowEditModal] = useState(false)

  const titolo      = (lang === 'en' && immobile.titolo_en)      ? immobile.titolo_en      : immobile.titolo
  const descrizione = (lang === 'en' && immobile.descrizione_en) ? immobile.descrizione_en : immobile.descrizione
  const isSold = immobile.stato === 'venduto'

  const waMessagePlain =
    lang === 'en'
      ? `${immobile.propertyUrl}\n\nHello! I'm interested in this property. Could you provide more information?`
      : `${immobile.propertyUrl}\n\nCiao! Sono interessato a questo immobile. Potrei avere maggiori informazioni?`
  const waUrl = buildWhatsAppHref(immobile.waNumber, waMessagePlain)

  return (
    <>
      <style>{`
        .det-page{background:var(--bg);color:var(--ink);min-height:100vh}
        .det-header{position:sticky;top:var(--admin-bar,0px);z-index:90;background:rgba(255,255,255,.92);backdrop-filter:blur(14px);border-bottom:1px solid var(--line)}
        .det-header-inner{display:flex;align-items:center;justify-content:space-between;height:64px;padding:0 clamp(1.2rem,4vw,3rem);max-width:1360px;margin:0 auto;gap:1rem}
        .det-back{display:inline-flex;align-items:center;gap:.4rem;font-family:'Syne',sans-serif;font-size:.7rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--mid);text-decoration:none;padding:.4rem .9rem;border-radius:999px;border:1.5px solid var(--line);transition:background .18s,color .18s}
        .det-back:hover{background:var(--ink);color:#fff;border-color:var(--ink)}
        .det-brand{font-family:'Syne',sans-serif;font-weight:800;font-size:.85rem;letter-spacing:.04em;text-transform:uppercase;color:var(--ink);text-decoration:none}
        .det-admin-bar{background:rgba(196,98,45,.07);border-bottom:1px solid rgba(196,98,45,.18);padding:.6rem clamp(1.2rem,4vw,3rem)}
        .det-admin-bar-inner{max-width:1360px;margin:0 auto;display:flex;align-items:center;gap:.75rem;flex-wrap:wrap}
        .det-admin-label{font-family:'Syne',sans-serif;font-size:.68rem;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--tc);display:flex;align-items:center;gap:.4rem}
        .det-admin-dot{width:6px;height:6px;border-radius:50%;background:var(--tc);flex-shrink:0}
        .det-admin-btn{display:inline-flex;align-items:center;gap:.4rem;padding:.38rem .9rem;border-radius:999px;font-family:'Syne',sans-serif;font-size:.65rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;text-decoration:none;transition:background .18s,color .18s;cursor:pointer;border:1.5px solid}
        .det-admin-btn-edit{background:var(--ink);color:#fff;border-color:var(--ink)}
        .det-admin-btn-edit:hover{background:var(--tc);border-color:var(--tc)}
        .det-admin-btn-ghost{background:transparent;color:var(--mid);border-color:var(--line)}
        .det-admin-btn-ghost:hover{background:var(--ink);color:#fff;border-color:var(--ink)}
        .det-hero-img{width:100%;aspect-ratio:16/7;position:relative;background:var(--warm);overflow:hidden;max-height:520px}
        .det-content{max-width:1360px;margin:0 auto;padding:3rem clamp(1.2rem,4vw,3rem) 6rem;display:grid;grid-template-columns:1fr 360px;gap:3rem;align-items:start}
        .det-city{font-family:'Syne',sans-serif;font-size:.7rem;font-weight:700;letter-spacing:.09em;text-transform:uppercase;color:var(--tc);display:flex;align-items:center;gap:.4rem;margin-bottom:.8rem}
        .det-city::before{content:'';width:7px;height:7px;border-radius:50%;background:var(--tc);flex-shrink:0}
        .det-title{font-family:'Syne',sans-serif;font-size:clamp(1.6rem,3vw,2.4rem);font-weight:800;color:var(--ink);line-height:1.12;margin:0 0 1.6rem}
        .det-divider{height:1px;background:var(--line);margin:2rem 0}
        .det-desc-label{font-family:'Syne',sans-serif;font-size:.7rem;font-weight:700;letter-spacing:.09em;text-transform:uppercase;color:var(--mid);margin:0 0 .8rem}
        .det-desc{font-size:.96rem;color:var(--ink);line-height:1.8;white-space:pre-wrap}
        .det-details{display:flex;flex-direction:column;gap:.6rem;margin-top:2rem}
        .det-detail-row{display:flex;align-items:baseline;gap:.6rem;font-size:.88rem}
        .det-detail-key{font-family:'Syne',sans-serif;font-size:.68rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--mid);min-width:100px}
        .det-detail-val{color:var(--ink)}
        .det-sidebar{position:sticky;top:84px}
        .det-price-card{background:#fff;border:1.5px solid var(--line);border-radius:20px;padding:1.8rem;margin-bottom:1rem}
        .det-price-label{font-family:'Syne',sans-serif;font-size:.65rem;font-weight:700;letter-spacing:.09em;text-transform:uppercase;color:var(--mid);margin:0 0 .4rem}
        .det-price-val{font-family:'Syne',sans-serif;font-size:2rem;font-weight:800;color:var(--ink);line-height:1;margin:0 0 1.4rem}
        .det-sold-badge,.det-featured-badge{display:inline-flex;align-items:center;gap:.35rem;font-family:'Syne',sans-serif;font-size:.62rem;font-weight:700;letter-spacing:.07em;text-transform:uppercase;padding:.3rem .75rem;border-radius:999px;margin-bottom:1rem}
        .det-sold-badge{background:rgba(192,57,43,.1);color:#c0392b}
        .det-featured-badge{background:rgba(196,98,45,.1);color:var(--tc)}
        .det-wa-note{font-size:.75rem;color:var(--mid);text-align:center;margin-top:.75rem;line-height:1.5}
        .det-contact-card{background:var(--warm);border:1.5px solid var(--line);border-radius:20px;padding:1.6rem}
        .det-contact-title{font-family:'Syne',sans-serif;font-size:.82rem;font-weight:700;color:var(--ink);margin:0 0 .4rem}
        .det-contact-sub{font-size:.8rem;color:var(--mid);line-height:1.6;margin:0}
        .det-map-wrap{border-radius:16px;overflow:hidden;border:1.5px solid var(--line);margin-top:2rem;aspect-ratio:4/3;position:relative}
        .det-map-label{font-family:'Syne',sans-serif;font-size:.65rem;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--mid);margin:.8rem 0 .3rem;display:flex;align-items:center;gap:.35rem}
        @media(max-width:860px){.det-content{grid-template-columns:1fr;gap:2.5rem}.det-sidebar{position:static}.det-hero-img{aspect-ratio:4/3;max-height:360px}}
        @media(max-width:480px){.det-content{padding:2rem 1.2rem 4rem}}
      `}</style>

      <div className="det-page">
        {/* Header */}
        <header className="det-header">
          <div className="det-header-inner">
            <Link href="/immobili" className="det-back">{t.backToList}</Link>
            <Link href="/" className="det-brand">{t.brandName}</Link>
          </div>
        </header>

        {/* ── Barra admin — visibile solo se loggato ── */}
        {isAdmin && (
          <div className="det-admin-bar">
            <div className="det-admin-bar-inner">
              <span className="det-admin-label">
                <span className="det-admin-dot" />
                Admin
              </span>
              <button
                type="button"
                onClick={() => setShowEditModal(true)}
                className="det-admin-btn det-admin-btn-edit"
                style={{ cursor: 'pointer', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '.4rem' }}
              >
                ✏️ Modifica questo immobile
              </button>
              <Link href="/admin/immobili/gestione" className="det-admin-btn det-admin-btn-ghost">
                ← Gestione immobili
              </Link>
              <Link href="/admin/statistiche" className="det-admin-btn det-admin-btn-ghost">
                📊 Statistiche
              </Link>
            </div>
          </div>
        )}

        {/* Hero image */}
        <div className="det-hero-img">
          {immobile.imageUrl ? (
            <Image src={immobile.imageUrl} alt={titolo} fill priority className="object-cover" sizes="100vw" />
          ) : (
            <div style={{ height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'.9rem',color:'var(--mid)' }}>
              {lang === 'en' ? 'No image available' : 'Nessuna immagine disponibile'}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="det-content">
          <main>
            {immobile.citta && <p className="det-city">{immobile.citta}</p>}
            <h1 className="det-title">{titolo}</h1>

            <div className="det-details">
              {immobile.prezzo !== null && (
                <div className="det-detail-row">
                  <span className="det-detail-key">{lang === 'en' ? 'Price' : 'Prezzo'}</span>
                  <span className="det-detail-val" style={{ fontWeight:700 }}>{immobile.prezzoFormattato}</span>
                </div>
              )}
              {immobile.citta && (
                <div className="det-detail-row">
                  <span className="det-detail-key">{lang === 'en' ? 'Municipality' : 'Comune'}</span>
                  <span className="det-detail-val">{immobile.citta}</span>
                </div>
              )}
              {immobile.mq && (
                <div className="det-detail-row">
                  <span className="det-detail-key">{lang === 'en' ? 'Area' : 'Superficie'}</span>
                  <span className="det-detail-val">{immobile.mq} m²</span>
                </div>
              )}
              {immobile.locali && (
                <div className="det-detail-row">
                  <span className="det-detail-key">{lang === 'en' ? 'Rooms' : 'Locali'}</span>
                  <span className="det-detail-val">{immobile.locali}</span>
                </div>
              )}
              {isSold && (
                <div className="det-detail-row">
                  <span className="det-detail-key">{lang === 'en' ? 'Status' : 'Stato'}</span>
                  <span className="det-detail-val" style={{ color:'#c0392b',fontWeight:700 }}>
                    {lang === 'en' ? '🔴 Sold' : '🔴 Venduto'}
                  </span>
                </div>
              )}
            </div>

            {descrizione && (
              <>
                <div className="det-divider" />
                <p className="det-desc-label">{lang === 'en' ? 'Description' : 'Descrizione'}</p>
                <p className="det-desc">{descrizione}</p>
              </>
            )}

            {/* Mappa */}
            {immobile.lat && immobile.lng && (
              <>
                <div className="det-divider" />
                <p className="det-map-label">
                  📍 {immobile.posizione_approssimativa
                    ? (lang === 'en' ? t.approximatePosition : 'Posizione approssimativa')
                    : (lang === 'en' ? t.exactPosition : 'Posizione')
                  }
                  {immobile.posizione_approssimativa && (
                    <span style={{ fontWeight:400,textTransform:'none',letterSpacing:0,color:'var(--mid)',fontSize:'.7rem' }}>
                      — {t.mapNote}
                    </span>
                  )}
                </p>
                {!immobile.posizione_approssimativa && immobile.indirizzo && (
                  <p style={{ fontSize:'.82rem',color:'var(--mid)',margin:'0 0 .5rem' }}>{immobile.indirizzo}</p>
                )}
                <div className="det-map-wrap">
                  <iframe
                    src={propertyMapEmbedSrc(
                      immobile.posizione_approssimativa,
                      immobile.citta,
                      immobile.lat!,
                      immobile.lng!,
                    )}
                    width="100%"
                    height="100%"
                    style={{ border: 0, position: 'absolute', inset: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                  {immobile.posizione_approssimativa && (
                    <div style={{ position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(255,255,255,.05)', pointerEvents: 'none' }}>
                      <div style={{ background:'rgba(12,12,10,.72)',backdropFilter:'blur(6px)',borderRadius:999,padding:'.5rem 1.1rem',fontFamily:'Syne,sans-serif',fontSize:'.68rem',fontWeight:700,color:'#fff',letterSpacing:'.05em',textTransform:'uppercase' }}>
                        📍 {lang === 'en' ? 'Town area' : 'Zona comunale'}
                      </div>
                    </div>
                  )}
                </div>
                <p style={{ marginTop: '.65rem' }}>
                  <a
                    href={propertyMapExternalHref(
                      immobile.posizione_approssimativa,
                      immobile.citta,
                      immobile.lat!,
                      immobile.lng!,
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontFamily: 'Syne,sans-serif', fontSize: '.74rem', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--tc)', textDecoration: 'none' }}
                  >
                    {t.openInGoogleMaps} ↗
                  </a>
                </p>
              </>
            )}
          </main>

          <aside className="det-sidebar">
            <div className="det-price-card">
              {isSold
                ? <div className="det-sold-badge">🔴 {lang === 'en' ? 'Sold' : 'Venduto'}</div>
                : immobile.featured && <div className="det-featured-badge">★ {t.featured}</div>
              }
              <p className="det-price-label">{lang === 'en' ? 'Asking price' : 'Prezzo richiesto'}</p>
              <p className="det-price-val">{immobile.prezzoFormattato ?? t.priceOnRequest}</p>

              {!isSold && (
                <>
                  <WhatsAppButton url={waUrl} label={t.whatsappLabel} />
                  <p className="det-wa-note">
                    {lang === 'en'
                      ? "Your message will include the property name and link — the agent will know exactly which one."
                      : "Il messaggio includerà il nome e il link dell'immobile — l'agente saprà subito di quale si tratta."}
                  </p>
                </>
              )}
            </div>

            <div className="det-contact-card">
              <p className="det-contact-title">Agenzia Immobiliare Monferrato</p>
              <p className="det-contact-sub">
                {lang === 'en'
                  ? <>We respond quickly to every enquiry. For more details visit our <Link href="/#contatti" style={{ color:'var(--tc)',fontWeight:600 }}>contact page</Link>.</>
                  : <>Rispondiamo a ogni richiesta. Per informazioni visita la nostra <Link href="/#contatti" style={{ color:'var(--tc)',fontWeight:600 }}>pagina contatti</Link>.</>
                }
              </p>
            </div>
          </aside>
        </div>
      </div>

      {showEditModal && (
        <ImmobileEditModal
          immobile={immobile}
          onClose={() => setShowEditModal(false)}
          onSave={() => window.location.reload()}
        />
      )}
    </>
  )
}

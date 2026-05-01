import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { cookies, headers } from 'next/headers'
import { createClient } from '@/lib/server'
import { getLang } from '@/lib/getLang'
import { translations } from '@/lib/language'
import ViewTracker from './ViewTracker'
import WhatsAppButton from './WhatsAppButton'
import ImageGallery from './ImageGallery'
import EditButtonWrapper from './EditButtonWrapper'
import DeleteImmobileButton from './DeleteImmobileButton'
import dynamic from 'next/dynamic'
const DetailMap = dynamic(() => import('./DetailMap'), { ssr: false })
export const revalidate = 0

type Props = { params: Promise<{ slug: string }> }

function formatPrice(value: number | null, priceOnRequest: string) {
  if (value === null) return priceOnRequest
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value)
}

export default async function ImmobileDetailPage({ params }: Props) {
  const { slug } = await params
  const cookieStore = await cookies()
  const isAdmin = cookieStore.get('site_admin')?.value === 'true'
  const lang = await getLang()
  const t = translations[lang]
  const supabase = await createClient()

  const { data: immobile, error } = await supabase
    .from('immobili')
    .select('*')
    .eq('slug', slug)
    .eq('pubblicato', true)
    .single()

  if (!immobile || error) notFound()

  const { data: photos } = await supabase
    .from('immobili_foto')
    .select('id, filename, ordine')
    .eq('immobile_id', immobile.id)
    .order('ordine', { ascending: true })

  const imageUrl = immobile.immaginecopertina
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/immobili/${immobile.immaginecopertina}`
    : null

  const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? ''
  const headersList = await headers()
  const host = headersList.get('host') ?? 'localhost:3000'
  const protocol = host.startsWith('localhost') ? 'http' : 'https'
  const propertyUrl = `${protocol}://${host}/immobili/${immobile.slug}`
  const displayTitle = lang === 'en' && immobile.titolo_en ? immobile.titolo_en : immobile.titolo
  const displayDesc = lang === 'en' && immobile.descrizione_en ? immobile.descrizione_en : immobile.descrizione
  const waMessage = encodeURIComponent(
    lang === 'en'
      ? `Hello! I'm interested in: ${propertyUrl}\nCould I have more information?`
      : `Ciao! Sono interessato all'immobile: ${propertyUrl}\nPotrei avere maggiori informazioni?`
  )
  const waUrl = `https://wa.me/${waNumber}?text=${waMessage}`

  return (
    <>
      <ViewTracker immobileId={immobile.id} />

      <style>{`
        .det-page { background: var(--bg); color: var(--ink); min-height: 100vh; }

        /* Admin edit bar */
        .det-admin-bar { background:#0c0c0a;color:#fff;padding:.65rem clamp(1.2rem,4vw,3rem);display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap }
        .det-admin-bar-label { font-family:'Syne',sans-serif;font-size:.65rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:rgba(255,255,255,.5);display:flex;align-items:center;gap:.5rem }
        .det-admin-bar-dot { width:6px;height:6px;border-radius:50%;background:#c4622d;flex-shrink:0 }
        .det-admin-edit-btn { display:inline-flex;align-items:center;gap:.45rem;padding:.42rem 1rem;border-radius:999px;background:#c4622d;color:#fff;font-family:'Syne',sans-serif;font-size:.68rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;text-decoration:none;transition:background .15s }
        .det-admin-edit-btn:hover { background:#a0501f }
        /* Header */
        .det-header {
          position: sticky; top: 0; z-index: 90;
          background: rgba(255,255,255,.92);
          backdrop-filter: blur(14px);
          border-bottom: 1px solid var(--line);
        }
        .det-header-inner {
          display: flex; align-items: center; justify-content: space-between;
          height: 64px; padding: 0 clamp(1.2rem, 4vw, 3rem);
          max-width: 1360px; margin: 0 auto; gap: 1rem;
        }
        .det-back {
          display: inline-flex; align-items: center; gap: .4rem;
          font-family: 'Syne', sans-serif; font-size: .7rem; font-weight: 700;
          letter-spacing: .06em; text-transform: uppercase;
          color: var(--mid); text-decoration: none;
          padding: .4rem .9rem; border-radius: 999px;
          border: 1.5px solid var(--line);
          transition: background .18s, color .18s;
        }
        .det-back:hover { background: var(--ink); color: #fff; border-color: var(--ink); }
        .det-brand {
          font-family: 'Syne', sans-serif; font-weight: 800; font-size: .85rem;
          letter-spacing: .04em; text-transform: uppercase; color: var(--ink);
          text-decoration: none;
        }

        /* Hero image */
        .det-hero-img {
          width: 100%; aspect-ratio: 16/7; position: relative;
          background: var(--warm); overflow: hidden;
          max-height: 520px;
        }
        .det-hero-img-placeholder {
          height: 100%; display: flex; align-items: center; justify-content: center;
          font-size: .9rem; color: var(--mid);
        }

        /* Content layout */
        .det-content {
          max-width: 1360px; margin: 0 auto;
          padding: 3rem clamp(1.2rem, 4vw, 3rem) 6rem;
          display: grid;
          grid-template-columns: 1fr 360px;
          gap: 3rem;
          align-items: start;
        }

        .det-main {}

        .det-city {
          font-family: 'Syne', sans-serif; font-size: .7rem; font-weight: 700;
          letter-spacing: .09em; text-transform: uppercase; color: var(--tc);
          display: flex; align-items: center; gap: .4rem; margin-bottom: .8rem;
        }
        .det-city::before {
          content: ''; width: 7px; height: 7px; border-radius: 50%;
          background: var(--tc); flex-shrink: 0;
        }

        .det-title {
          font-family: 'Syne', sans-serif; font-size: clamp(1.6rem, 3vw, 2.4rem);
          font-weight: 800; color: var(--ink); line-height: 1.12;
          margin: 0 0 1.6rem;
        }

        .det-divider {
          height: 1px; background: var(--line); margin: 2rem 0;
        }

        .det-desc-label {
          font-family: 'Syne', sans-serif; font-size: .7rem; font-weight: 700;
          letter-spacing: .09em; text-transform: uppercase; color: var(--mid);
          margin: 0 0 .8rem;
        }
        .det-desc {
          font-size: .96rem; color: var(--ink); line-height: 1.8;
          white-space: pre-wrap;
        }

        .det-details { display: flex; flex-direction: column; gap: .6rem; margin-top: 2rem; }
        .det-detail-row {
          display: flex; align-items: baseline; gap: .6rem;
          font-size: .88rem;
        }
        .det-detail-key {
          font-family: 'Syne', sans-serif; font-size: .68rem; font-weight: 700;
          letter-spacing: .06em; text-transform: uppercase; color: var(--mid);
          min-width: 100px;
        }
        .det-detail-val { color: var(--ink); }

        /* Sidebar */
        .det-sidebar {
          position: sticky; top: 84px;
        }

        .det-price-card {
          background: #fff; border: 1.5px solid var(--line);
          border-radius: 20px; padding: 1.8rem;
          margin-bottom: 1rem;
        }
        .det-price-label {
          font-family: 'Syne', sans-serif; font-size: .65rem; font-weight: 700;
          letter-spacing: .09em; text-transform: uppercase; color: var(--mid);
          margin: 0 0 .4rem;
        }
        .det-price-val {
          font-family: 'Syne', sans-serif; font-size: 2rem; font-weight: 800;
          color: var(--ink); line-height: 1;
          margin: 0 0 1.4rem;
        }
        .det-featured-badge {
          display: inline-flex; align-items: center; gap: .35rem;
          background: rgba(196,98,45,.1); color: var(--tc);
          font-family: 'Syne', sans-serif; font-size: .62rem; font-weight: 700;
          letter-spacing: .07em; text-transform: uppercase;
          padding: .3rem .75rem; border-radius: 999px; margin-bottom: 1rem;
        }

        .det-wa-note {
          font-size: .75rem; color: var(--mid); text-align: center;
          margin-top: .75rem; line-height: 1.5;
        }

        .det-contact-card {
          background: var(--warm); border: 1.5px solid var(--line);
          border-radius: 20px; padding: 1.6rem;
        }
        .det-contact-title {
          font-family: 'Syne', sans-serif; font-size: .82rem; font-weight: 700;
          color: var(--ink); margin: 0 0 .4rem;
        }
        .det-contact-sub {
          font-size: .8rem; color: var(--mid); line-height: 1.6; margin: 0;
        }

        .det-map-label {
          font-family: 'Syne', sans-serif; font-size: .65rem; font-weight: 700;
          letter-spacing: .07em; text-transform: uppercase; color: var(--mid);
          margin: .8rem 0 .3rem; display: flex; align-items: center; gap: .35rem;
        }
        .det-map-note {
          font-weight: 400; text-transform: none; letter-spacing: 0;
          color: var(--mid); font-size: .7rem;
        }
        .det-map-wrap {
          border-radius: 16px; overflow: hidden; border: 1.5px solid var(--line);
          margin-top: .5rem; aspect-ratio: 4/3; position: relative;
        }
        .det-map-overlay {
          position: absolute; inset: 0; display: flex; align-items: center;
          justify-content: center; background: rgba(255,255,255,.05); pointer-events: none;
        }
        .det-map-overlay-badge {
          background: rgba(12,12,10,.72); backdrop-filter: blur(6px);
          border-radius: 999px; padding: .5rem 1.1rem;
          font-family: 'Syne',sans-serif; font-size: .68rem; font-weight: 700;
          color: #fff; letter-spacing: .05em; text-transform: uppercase;
        }

        /* ── Caratteristiche grid ── */
        .det-features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: .75rem;
          margin-top: 1rem;
        }
        .det-feature-item {
          display: flex;
          flex-direction: column;
          gap: .25rem;
          background: var(--warm, #f5f3f0);
          border: 1.5px solid var(--line, #e9e4dd);
          border-radius: 14px;
          padding: .9rem 1rem;
        }
        .det-feature-icon { font-size: 1.1rem; line-height: 1; }
        .det-feature-label {
          font-family: 'Syne', sans-serif;
          font-size: .58rem;
          font-weight: 700;
          letter-spacing: .08em;
          text-transform: uppercase;
          color: var(--mid, #7c7770);
          margin-top: .1rem;
        }
        .det-feature-val {
          font-size: .92rem;
          font-weight: 700;
          color: var(--ink, #0c0c0a);
          line-height: 1.2;
        }

        @media (max-width: 860px) {
          .det-content {
            grid-template-columns: 1fr;
            gap: 2.5rem;
          }
          .det-sidebar { position: static; }
          .det-hero-img { aspect-ratio: 4/3; max-height: 360px; }
        }

        @media (max-width: 480px) {
          .det-content { padding: 2rem 1.2rem 4rem; }
          .det-features-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>

      <div className="det-page">
        {/* Admin bar — visibile solo se loggato */}
        {isAdmin && (
          <div className="det-admin-bar">
            <span className="det-admin-bar-label">
              <span className="det-admin-bar-dot" />
              {t.adminMode}
            </span>
            <div style={{ display: 'flex', gap: '.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <EditButtonWrapper immobile={immobile} isAdmin={isAdmin} />
              <DeleteImmobileButton immobileId={String(immobile.id)} />
            </div>
          </div>
        )}

        {/* Header */}
        <header className="det-header">
          <div className="det-header-inner">
            <Link href="/immobili" className="det-back">{t.backToAllProperties}</Link>
            <Link href="/" className="det-brand">{t.brandName}</Link>
          </div>
        </header>

        {/* Hero image / Gallery */}
        {photos && photos.length > 0 ? (
          <div style={{ paddingTop: '1rem' }}>
            <ImageGallery
              photos={photos}
              title={displayTitle}
              supabaseUrl={process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''}
            />
          </div>
        ) : (
          <div className="det-hero-img">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={displayTitle}
                fill
                priority
                className="object-cover"
                sizes="100vw"
              />
            ) : (
              <div className="det-hero-img-placeholder">{t.noImageAvailable}</div>
            )}
          </div>
        )}

        {/* Content */}
        <div className="det-content">
          {/* ── Main ── */}
          <main className="det-main">
            {immobile.citta && <p className="det-city">{immobile.citta}</p>}
            <h1 className="det-title">{displayTitle}</h1>

            {/* Quick details */}
            <div className="det-details">
              {immobile.prezzo !== null && (
                <div className="det-detail-row">
                  <span className="det-detail-key">{t.price}</span>
                  <span className="det-detail-val" style={{ fontWeight: 700 }}>
                    {formatPrice(immobile.prezzo, t.priceOnRequest)}
                  </span>
                </div>
              )}
              {immobile.citta && (
                <div className="det-detail-row">
                  <span className="det-detail-key">{t.municipality}</span>
                  <span className="det-detail-val">{immobile.citta}</span>
                </div>
              )}
              {immobile.mq && (
                <div className="det-detail-row">
                  <span className="det-detail-key">{t.surface}</span>
                  <span className="det-detail-val">{immobile.mq} m²</span>
                </div>
              )}
              {immobile.locali && (
                <div className="det-detail-row">
                  <span className="det-detail-key">{t.rooms}</span>
                  <span className="det-detail-val">{immobile.locali}</span>
                </div>
              )}
              {immobile.tipo_contratto && (
                <div className="det-detail-row">
                  <span className="det-detail-key">{t.contract}</span>
                  <span className="det-detail-val" style={{ textTransform: 'capitalize', fontWeight: 600, color: immobile.tipo_contratto === 'affitto' ? '#1a6e8e' : 'var(--tc)' }}>
                    {immobile.tipo_contratto === 'affitto' ? t.rentBadge : t.saleBadge}
                  </span>
                </div>
              )}
            </div>

            {/* Description */}
            {displayDesc && (
              <>
                <div className="det-divider" />
                <p className="det-desc-label">{t.description}</p>
                <p className="det-desc">{displayDesc}</p>
              </>
            )}

            {/* ── Caratteristiche ── */}
            {(immobile.mq || immobile.locali || immobile.tipo_contratto || immobile.stato || immobile.citta) && (
              <>
                <div className="det-divider" />
                <p className="det-map-label">🏡 Caratteristiche</p>
                <div className="det-features-grid">
                  {immobile.mq && (
                    <div className="det-feature-item">
                      <span className="det-feature-icon">📐</span>
                      <span className="det-feature-label">{t.surface}</span>
                      <span className="det-feature-val">{immobile.mq} m²</span>
                    </div>
                  )}
                  {immobile.locali && (
                    <div className="det-feature-item">
                      <span className="det-feature-icon">🛏</span>
                      <span className="det-feature-label">{t.rooms}</span>
                      <span className="det-feature-val">{immobile.locali}</span>
                    </div>
                  )}
                  {immobile.tipo_contratto && (
                    <div className="det-feature-item">
                      <span className="det-feature-icon">📋</span>
                      <span className="det-feature-label">{t.contract}</span>
                      <span className="det-feature-val" style={{ color: immobile.tipo_contratto === 'affitto' ? '#1a6e8e' : 'var(--tc)', fontWeight: 700 }}>
                        {immobile.tipo_contratto === 'affitto' ? t.rentBadge : t.saleBadge}
                      </span>
                    </div>
                  )}
                  {immobile.stato && (
                    <div className="det-feature-item">
                      <span className="det-feature-icon">{immobile.stato === 'venduto' ? '🔴' : '🟢'}</span>
                      <span className="det-feature-label">Stato</span>
                      <span className="det-feature-val" style={{ textTransform: 'capitalize' }}>{immobile.stato}</span>
                    </div>
                  )}
                  {immobile.citta && (
                    <div className="det-feature-item">
                      <span className="det-feature-icon">📍</span>
                      <span className="det-feature-label">{t.municipality}</span>
                      <span className="det-feature-val">{immobile.citta}</span>
                    </div>
                  )}
                  {immobile.posizione_approssimativa && (
                    <div className="det-feature-item">
                      <span className="det-feature-icon">🔒</span>
                      <span className="det-feature-label">Posizione</span>
                      <span className="det-feature-val" style={{ color: 'var(--mid)', fontSize: '.8rem' }}>Approssimativa</span>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ── Mappa ── */}
            {immobile.lat && immobile.lng && (
              <>
                <div className="det-divider" />
                <p className="det-map-label">🗺 {t.exactPosition}</p>
                {immobile.posizione_approssimativa && (
                  <p style={{ fontSize: '.82rem', color: 'var(--mid)', margin: '0 0 .8rem', lineHeight: 1.5 }}>
                    ℹ️ La posizione mostrata è indicativa per motivi di privacy.
                  </p>
                )}
                <DetailMap
                  lat={immobile.lat}
                  lng={immobile.lng}
                  title={displayTitle}
                  isApproximate={immobile.posizione_approssimativa}
                />
              </>
            )}

            {/* Planimetria */}
            {immobile.planimetria && (
              <>
                <div className="det-divider" />
                <p className="det-map-label">
                  📐 Planimetria
                </p>
                <div style={{ marginTop: '1rem' }}>
                  {immobile.planimetria.toLowerCase().endsWith('.pdf') ? (
                    <a
                      href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/immobili/${immobile.planimetria}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl border border-var(--line) px-4 py-2.5 text-sm font-semibold bg-white hover:bg-var(--warm) transition-colors"
                      style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}
                    >
                      📄 Visualizza planimetria (PDF)
                    </a>
                  ) : (
                    <div className="relative w-full rounded-xl overflow-hidden border border-var(--line)" style={{ borderColor: 'var(--line)', aspectRatio: '4/3' }}>
                      <Image
                        src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/immobili/${immobile.planimetria}`}
                        alt="Planimetria"
                        fill
                        className="object-contain"
                        sizes="100vw"
                      />
                    </div>
                  )}
                </div>
              </>
            )}
          </main>

          {/* ── Sidebar ── */}
          <aside className="det-sidebar">
            <div className="det-price-card">
              {immobile.featured && (
                <div className="det-featured-badge">★ {t.featured}</div>
              )}
              <p className="det-price-label">{t.requestedPrice}</p>
              <p className="det-price-val">{formatPrice(immobile.prezzo, t.priceOnRequest)}</p>

              <WhatsAppButton
                url={waUrl}
                label={t.contactOnWhatsapp}
              />
              <p className="det-wa-note">{t.whatsappHint}</p>
            </div>

            <div className="det-contact-card">
              <p className="det-contact-title">{t.agencyName}</p>
              <p className="det-contact-sub">
                {t.agencyContactSub.split(t.contactPageLink)[0]}
                <Link href="/#contatti" style={{ color: 'var(--tc)', fontWeight: 600 }}>{t.contactPageLink}</Link>
                {t.agencyContactSub.split(t.contactPageLink)[1]}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </>
  )
}

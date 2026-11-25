import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/server'
import { getLang } from '@/lib/getLang'
import { translations } from '@/lib/language'
import ViewTracker from './ViewTracker'
import WhatsAppButton from './WhatsAppButton'
import ImageGallery from './ImageGallery'
import PhotoStack from './PhotoStack'
import EditButtonWrapper from './EditButtonWrapper'
import RemoveFromFeaturedButton from '@/app/immobili/RemoveFromFeaturedButton'
import DeleteImmobileButton from './DeleteImmobileButton'
import DetailMap from './DetailMap'
import { buildWhatsAppHref } from '@/lib/whatsappUrl'
import { buildWhatsAppText } from '@/lib/whatsappMessage'
import { isAdminSession } from '@/lib/adminSession'
import {
  TIPOLOGIE,
  STATI_CONSERVAZIONE,
  ORIENTAMENTI,
  DOTAZIONI,
  RISCALDAMENTI,
  labelOf,
  sanitizeCaratteristiche,
} from '@/lib/caratteristiche'

export type ImmobileDetailNav = {
  /** Elenco immobili (indietro) */
  catalogHref: string
  /** Home / brand */
  homeHref: string
  /** Base path schede (es. `/immobili`, `/admin/immobili`) */
  propertyBasePath: string
}

function formatPrice(value: number | null, priceOnRequest: string) {
  if (value === null) return priceOnRequest
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value)
}

export default async function ImmobileDetailPageContent({
  slug,
  nav,
}: {
  slug: string
  nav: ImmobileDetailNav
}) {
  const isAdmin = await isAdminSession()
  const lang = await getLang()
  const t = translations[lang]
  const supabase = await createClient()

  // I visitatori vedono solo gli immobili pubblicati; l'amministratore vede anche le bozze (anteprima).
  let immobileQuery = supabase.from('immobili').select('*').eq('slug', slug)
  if (!isAdmin) immobileQuery = immobileQuery.eq('pubblicato', true)
  const { data: immobile, error } = await immobileQuery.single()

  if (!immobile || error) notFound()
  const isDraftPreview = isAdmin && immobile.pubblicato !== true
  const car = sanitizeCaratteristiche(immobile.caratteristiche)
  const hasCar = Object.keys(car).length > 0
  const L = (it: string, en: string) => (lang === 'en' ? en : it)
  const extraFeatures: { icon: string; label: string; value: string }[] = [
    car.tipologia && { icon: '🏠', label: L('Tipologia', 'Type'), value: labelOf(TIPOLOGIE, car.tipologia, lang) },
    car.mq_calpestabili && { icon: '📏', label: L('Calpestabili', 'Floor area'), value: `${car.mq_calpestabili} m²` },
    car.mq_terreno && { icon: '🌳', label: L('Terreno', 'Land'), value: `${car.mq_terreno} m²` },
    car.bagni !== undefined && { icon: '🛁', label: L('Bagni', 'Bathrooms'), value: String(car.bagni) },
    car.piani !== undefined && { icon: '🪜', label: L('Piani', 'Floors'), value: String(car.piani) },
    car.stato_conservazione && { icon: '🔧', label: L('Condizioni', 'Condition'), value: labelOf(STATI_CONSERVAZIONE, car.stato_conservazione, lang) },
    car.ascensore !== undefined && { icon: '🛗', label: L('Ascensore', 'Lift'), value: car.ascensore ? L('Sì', 'Yes') : L('No', 'No') },
    car.anno_costruzione && { icon: '🗓', label: L('Anno', 'Built'), value: String(car.anno_costruzione) },
    car.riscaldamento && { icon: '🔥', label: L('Riscaldamento', 'Heating'), value: labelOf(RISCALDAMENTI, car.riscaldamento, lang) },
    car.classe_energetica && { icon: '⚡', label: L('Classe energetica', 'Energy class'), value: car.classe_energetica },
  ].filter(Boolean) as { icon: string; label: string; value: string }[]
  const chipLabels = [
    ...(car.orientamento ?? []).map(v => `${L('Esposizione', 'Facing')} ${labelOf(ORIENTAMENTI, v, lang)}`),
    ...(car.dotazioni ?? []).map(v => labelOf(DOTAZIONI, v, lang)),
  ]

  const { data: photos } = await supabase
    .from('immobili_foto')
    .select('id, filename, ordine')
    .eq('immobile_id', immobile.id)
    .order('ordine', { ascending: true })

  const { data: relatedRaw } = await supabase
    .from('immobili')
    .select('id, titolo, titolo_en, slug, citta, prezzo, immaginecopertina, featured, tipo_contratto')
    .eq('pubblicato', true)
    .neq('id', immobile.id)
    .eq('citta', immobile.citta ?? '')
    .limit(3)

  const related = (relatedRaw ?? []).slice(0, 3)

  const photosList = photos ?? []
  const coverFn = immobile.immaginecopertina
  const coverInGallery = Boolean(coverFn && photosList.some(p => p.filename === coverFn))
  const galleryPhotos =
    coverFn && !coverInGallery
      ? [{ id: `cover-${immobile.id}`, filename: coverFn, ordine: -1 }, ...photosList]
      : photosList

  /** Galleria hero: fallback se in DB c’è solo copertina senza righe in gallery (stato anomalo) */
  const heroPhotos =
    galleryPhotos.length > 0
      ? galleryPhotos
      : immobile.immaginecopertina
        ? [{ id: `cover-${immobile.id}`, filename: immobile.immaginecopertina, ordine: 0 }]
        : []

  const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? ''
  const headersList = await headers()
  const host = headersList.get('host') ?? 'localhost:3000'
  const protocol = host.startsWith('localhost') ? 'http' : 'https'
  const propertyUrl = `${protocol}://${host}/immobili/${immobile.slug}`
  const displayTitle = lang === 'en' && immobile.titolo_en ? immobile.titolo_en : immobile.titolo
  const displayDesc = lang === 'en' && immobile.descrizione_en ? immobile.descrizione_en : immobile.descrizione
  const waMessagePlain = buildWhatsAppText(lang, propertyUrl)
  const waUrl = buildWhatsAppHref(waNumber, waMessagePlain)

  return (
    <>
      {!isDraftPreview && <ViewTracker immobileId={immobile.id} />}

      {isDraftPreview && (
        <div
          role="status"
          style={{
            position: 'fixed',
            top: '.75rem',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 99999,
            maxWidth: 'min(94vw, 34rem)',
            display: 'flex',
            alignItems: 'center',
            gap: '.75rem',
            flexWrap: 'wrap',
            justifyContent: 'center',
            padding: '.6rem 1rem',
            borderRadius: '14px',
            background: '#fff7d6',
            border: '1.5px solid #e2c24a',
            color: '#5c4a00',
            fontSize: '.82rem',
            fontWeight: 600,
            boxShadow: '0 8px 28px rgba(0,0,0,.18)',
          }}
        >
          <span>📝 Anteprima bozza — i visitatori non vedono questo immobile.</span>
          <a
            href={`/admin/immobili/gestione?id=${encodeURIComponent(String(immobile.id))}`}
            style={{ color: '#7a3f12', textDecoration: 'underline', whiteSpace: 'nowrap' }}
          >
            Modifica / pubblica →
          </a>
        </div>
      )}

      <style>{`
        .det-page { background: var(--bg); color: var(--ink); min-height: 100vh; }

        /* Admin edit bar */
        .admin-immo-float {
          position: fixed;
          bottom: 1.1rem;
          right: max(1rem, env(safe-area-inset-right));
          z-index: 9998;
          display: flex;
          flex-wrap: wrap;
          gap: .45rem;
          justify-content: flex-end;
          align-items: center;
          max-width: min(calc(100vw - 2rem), 22rem);
          padding: .55rem .65rem;
          border-radius: 16px;
          background: rgba(12,12,10,.94);
          border: 1px solid rgba(255,255,255,.1);
          box-shadow: 0 12px 40px rgba(0,0,0,.35);
        }
        .det-admin-edit-btn { display:inline-flex;align-items:center;gap:.45rem;padding:.42rem 1rem;border-radius:999px;background:#c4622d;color:#fff;font-family:var(--font-body);font-size:.68rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;text-decoration:none;transition:background .15s;border:none;cursor:pointer }
        .det-admin-edit-btn:hover { background:#a0501f }
        .det-admin-unfeature-btn {
          display: inline-flex; align-items: center; justify-content: center;
          padding: .4rem .85rem; border-radius: 999px;
          font-family: var(--font-body); font-size: .6rem; font-weight: 700;
          letter-spacing: .055em; text-transform: uppercase;
          background: transparent; color: rgba(255,255,255,.9);
          border: 1.5px solid rgba(255,255,255,.32); cursor: pointer;
          transition: border-color .15s, color .15s;
        }
        .det-admin-unfeature-btn:hover:not(:disabled) {
          border-color: #c4622d;
          color: #fff;
        }
        .det-admin-unfeature-btn:disabled { opacity: .55; cursor: not-allowed; }
        /* Header */
        .det-header {
          position: sticky; top: var(--admin-bar, 0px); z-index: 90;
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
          font-family: var(--font-body); font-size: .7rem; font-weight: 700;
          letter-spacing: .06em; text-transform: uppercase;
          color: var(--mid); text-decoration: none;
          padding: .4rem .9rem; border-radius: 999px;
          border: 1.5px solid var(--line);
          transition: background .18s, color .18s;
        }
        .det-back:hover { background: var(--ink); color: #fff; border-color: var(--ink); }
        .det-brand {
          font-family: var(--font-body); font-weight: 800; font-size: .85rem;
          letter-spacing: .04em; text-transform: uppercase; color: var(--ink);
          text-decoration: none;
          text-align: right; line-height: 1.15; min-width: 0;
        }
        .det-back { white-space: nowrap; flex-shrink: 0; }
        @media (max-width: 520px) {
          .det-header-inner { gap: .6rem; }
          .det-brand { font-size: .66rem; letter-spacing: .03em; }
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
        .det-card {
          background: #fff; border: 1.5px solid var(--line); border-radius: 18px;
          padding: 1.5rem 1.6rem; margin-bottom: 1.25rem;
        }
        .det-card--title .det-title { margin: 0; }
        .det-card .det-desc-label { margin-top: 0; }
        @media (max-width: 520px) { .det-card { padding: 1.2rem 1.15rem; border-radius: 16px; } }
        .det-city {
          font-family: var(--font-body); font-size: .7rem; font-weight: 700;
          letter-spacing: .09em; text-transform: uppercase; color: var(--tc);
          display: flex; align-items: center; gap: .4rem; margin-bottom: .8rem;
        }
        .det-city::before {
          content: ''; width: 7px; height: 7px; border-radius: 50%;
          background: var(--tc); flex-shrink: 0;
        }

        .det-title {
          font-family: var(--font-body); font-size: clamp(1.6rem, 3vw, 2.4rem);
          font-weight: 800; color: var(--ink); line-height: 1.12;
          margin: 0 0 1.6rem;
        }

        .det-divider {
          height: 1px; background: var(--line); margin: 2rem 0;
        }

        .det-desc-label {
          font-family: var(--font-body); font-size: .7rem; font-weight: 700;
          letter-spacing: .09em; text-transform: uppercase; color: var(--mid);
          margin: 0 0 .8rem;
        }
        .det-desc {
          font-size: .96rem; color: var(--ink); line-height: 1.8;
          white-space: pre-wrap;
        }

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
          font-family: var(--font-body); font-size: .65rem; font-weight: 700;
          letter-spacing: .09em; text-transform: uppercase; color: var(--mid);
          margin: 0 0 .4rem;
        }
        .det-price-val {
          font-family: var(--font-body); font-size: 2rem; font-weight: 800;
          color: var(--ink); line-height: 1;
          margin: 0 0 1.4rem;
        }
        .det-featured-badge {
          display: inline-flex; align-items: center; gap: .35rem;
          background: rgba(196,98,45,.1); color: var(--tc);
          font-family: var(--font-body); font-size: .62rem; font-weight: 700;
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
          font-family: var(--font-body); font-size: .82rem; font-weight: 700;
          color: var(--ink); margin: 0 0 .4rem;
        }
        .det-contact-sub {
          font-size: .8rem; color: var(--mid); line-height: 1.6; margin: 0;
        }

        .det-map-label {
          font-family: var(--font-body); font-size: .65rem; font-weight: 700;
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
        .det-related {
          max-width: 1360px;
          margin: 0 auto 5rem;
          padding: 0 clamp(1.2rem, 4vw, 3rem);
        }
        .det-related-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 1rem;
          flex-wrap: wrap;
        }
        .det-related-title {
          margin: 0;
          font-family: var(--font-body);
          font-size: .9rem;
          font-weight: 800;
          letter-spacing: .06em;
          text-transform: uppercase;
          color: var(--ink);
        }
        .det-related-grid {
          display: grid;
          gap: 1rem;
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }
        .det-related-card {
          text-decoration: none;
          color: inherit;
          background: #fff;
          border: 1.5px solid var(--line);
          border-radius: 16px;
          overflow: hidden;
          transition: transform .18s;
        }
        .det-related-card:hover { transform: translateY(-3px); }
        .det-related-img-wrap {
          position: relative;
          aspect-ratio: 16/10;
          background: var(--warm);
        }
        .det-related-copy {
          padding: .9rem 1rem 1rem;
          display: grid;
          gap: .35rem;
        }
        .det-related-city {
          font-family: var(--font-body);
          font-size: .6rem;
          font-weight: 700;
          letter-spacing: .08em;
          text-transform: uppercase;
          color: var(--tc);
        }
        .det-related-name {
          font-size: .9rem;
          font-weight: 700;
          color: var(--ink);
          line-height: 1.3;
        }
        .det-related-price {
          font-family: var(--font-body);
          font-size: .78rem;
          font-weight: 800;
          color: var(--ink);
        }
        .det-map-overlay {
          position: absolute; inset: 0; display: flex; align-items: center;
          justify-content: center; background: rgba(255,255,255,.05); pointer-events: none;
        }
        .det-map-overlay-badge {
          background: rgba(12,12,10,.72); backdrop-filter: blur(6px);
          border-radius: 999px; padding: .5rem 1.1rem;
          font-family: var(--font-body); font-size: .68rem; font-weight: 700;
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
          font-family: var(--font-body);
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
          .det-related-grid { grid-template-columns: 1fr; }
        }

        @media (max-width: 480px) {
          .det-content { padding: 2rem 1.2rem 4rem; }
          .det-features-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>

      <div className="det-page">
        {/* Admin bar — visibile solo se loggato */}
        {isAdmin && (
          <div className="admin-immo-float" role="toolbar" aria-label="Gestione immobile">
            <EditButtonWrapper immobile={immobile} isAdmin={isAdmin} />
            {immobile.featured && (
              <RemoveFromFeaturedButton immobileId={String(immobile.id)} className="det-admin-unfeature-btn" />
            )}
            <DeleteImmobileButton immobileId={String(immobile.id)} catalogHref={nav.catalogHref} />
          </div>
        )}

        {/* Header */}
        <header className="det-header">
          <div className="det-header-inner">
            <Link href={nav.catalogHref} className="det-back">{t.backToAllProperties}</Link>
            <Link href={nav.homeHref} className="det-brand">{t.brandName}</Link>
          </div>
        </header>

        {/* Hero image / Gallery (copertina + galleria, autoplay come i portali) */}
        {heroPhotos.length > 0 ? (
          <div style={{ paddingTop: '1rem' }}>
            <ImageGallery
              photos={heroPhotos}
              title={displayTitle}
              supabaseUrl={process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''}
              lang={lang}
              autoAdvanceMs={heroPhotos.length > 1 ? 6000 : 0}
              thumbnailsHint={
                heroPhotos.length > 1
                  ? lang === 'en'
                    ? 'All photos — scroll or tap a thumbnail'
                    : 'Tutte le foto — scorri o tocca una miniatura'
                  : lang === 'en'
                    ? 'Cover photo'
                    : 'Foto in evidenza'
              }
            />
          </div>
        ) : (
          <div className="det-hero-img">
            <div className="det-hero-img-placeholder">{t.noImageAvailable}</div>
          </div>
        )}

        {/* Content */}
        <div className="det-content">
          {/* ── Main ── */}
          <main className="det-main">
            {/* Titolo e descrizione: due riquadri separati */}
            <section className="det-card det-card--title">
              {immobile.citta && <p className="det-city">{immobile.citta}</p>}
              <h1 className="det-title">{displayTitle}</h1>
            </section>

            {displayDesc && (
              <section className="det-card">
                <p className="det-desc-label">{t.description}</p>
                <p className="det-desc">{displayDesc}</p>
              </section>
            )}

            {/* ── Caratteristiche (unica sezione riepilogo, con icone) ── */}
            {(immobile.prezzo !== null ||
              immobile.mq ||
              immobile.locali ||
              immobile.tipo_contratto ||
              immobile.stato ||
              immobile.citta ||
              hasCar ||
              immobile.posizione_approssimativa) && (
              <>
                <div className="det-divider" />
                <p className="det-map-label">🏡 {lang === 'en' ? 'Highlights' : 'Caratteristiche'}</p>
                <div className="det-features-grid">
                  {immobile.prezzo !== null && (
                    <div className="det-feature-item">
                      <span className="det-feature-icon">💶</span>
                      <span className="det-feature-label">{t.price}</span>
                      <span className="det-feature-val">{formatPrice(immobile.prezzo, t.priceOnRequest)}</span>
                    </div>
                  )}
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
                  {extraFeatures.map(f => (
                    <div className="det-feature-item" key={f.label}>
                      <span className="det-feature-icon">{f.icon}</span>
                      <span className="det-feature-label">{f.label}</span>
                      <span className="det-feature-val">{f.value}</span>
                    </div>
                  ))}
                  {immobile.citta && immobile.mostra_posizione !== 'nascosta' && (
                    <div className="det-feature-item">
                      <span className="det-feature-icon">📍</span>
                      <span className="det-feature-label">{t.municipality}</span>
                      <span className="det-feature-val">{immobile.citta}</span>
                    </div>
                  )}
                  {immobile.posizione_approssimativa && (immobile.mostra_posizione ?? 'mappa') === 'mappa' && (
                    <div className="det-feature-item">
                      <span className="det-feature-icon">🔒</span>
                      <span className="det-feature-label">Posizione</span>
                      <span className="det-feature-val" style={{ color: 'var(--mid)', fontSize: '.8rem' }}>Approssimativa</span>
                    </div>
                  )}
                </div>
              </>
            )}

            {chipLabels.length > 0 && (
              <>
                <div className="det-divider" />
                <p className="det-map-label">✨ {L('Dotazioni', 'Features')}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem', marginTop: '.8rem' }}>
                  {chipLabels.map(c => (
                    <span
                      key={c}
                      style={{
                        padding: '.4rem .9rem',
                        borderRadius: '999px',
                        border: '1.5px solid var(--line, #e9e4dd)',
                        background: 'var(--warm, #f5f3f0)',
                        fontSize: '.84rem',
                        fontWeight: 600,
                        color: 'var(--ink)',
                      }}
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </>
            )}

            {/* ── Tutte le foto, una sotto l'altra (a tocco si ingrandiscono) ── */}
            {heroPhotos.length >= 2 && (
              <>
                <div className="det-divider" />
                <p className="det-map-label">📸 {L('Tutte le foto', 'All photos')} ({heroPhotos.length})</p>
                <PhotoStack
                  photos={heroPhotos}
                  title={displayTitle}
                  supabaseUrl={process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''}
                  lang={lang}
                />
              </>
            )}

            {/* Indirizzo completo solo senza posizione approssimativa (altrimenti si contrasta con la privacy sulla mappa) */}
            {immobile.indirizzo && !immobile.posizione_approssimativa && (immobile.mostra_posizione ?? 'mappa') === 'mappa' && (
              <>
                <div className="det-divider" />
                <p className="det-map-label">📍 {lang === 'en' ? 'Address' : 'Indirizzo'}</p>
                <p style={{ margin: '0', color: 'var(--ink)', lineHeight: 1.7 }}>{immobile.indirizzo}</p>
              </>
            )}

            {/* ── Solo paese: banner senza mappa (come i portali) ── */}
            {immobile.mostra_posizione === 'paese' && immobile.citta && (
              <>
                <div className="det-divider" />
                <p className="det-map-label">🗺 {lang === 'en' ? 'Location' : 'Zona'}</p>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1.25rem 1.4rem',
                    borderRadius: '16px',
                    border: '1.5px solid var(--line, #e9e4dd)',
                    borderLeft: '5px solid var(--tc, #c4622d)',
                    background: 'var(--warm, #f5f3f0)',
                  }}
                >
                  <span style={{ fontSize: '1.8rem', lineHeight: 1 }} aria-hidden>📍</span>
                  <div>
                    <div style={{ fontFamily: "var(--font-body)", fontWeight: 800, fontSize: '1.15rem', color: 'var(--ink)' }}>
                      {immobile.citta}
                    </div>
                    <div style={{ fontSize: '.85rem', color: 'var(--mid)', marginTop: '.2rem', lineHeight: 1.5 }}>
                      {lang === 'en'
                        ? 'The exact address is shared when you get in touch with us.'
                        : "L'indirizzo esatto viene comunicato contattandoci."}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ── Mappa ── */}
            {(immobile.mostra_posizione ?? 'mappa') === 'mappa' && immobile.lat && immobile.lng && (
              <>
                <div className="det-divider" />
                <p className="det-map-label">
                  🗺{' '}
                  {immobile.posizione_approssimativa ? t.approximatePosition : t.exactPosition}
                </p>
                {immobile.posizione_approssimativa && (
                  <p style={{ fontSize: '.82rem', color: 'var(--mid)', margin: '0 0 .8rem', lineHeight: 1.5 }}>
                    ℹ️ {t.mapNote}
                  </p>
                )}
                <DetailMap
                  lat={immobile.lat}
                  lng={immobile.lng}
                  title={displayTitle}
                  isApproximate={immobile.posizione_approssimativa}
                  municipality={immobile.citta}
                  openMapsLabel={t.openInGoogleMaps}
                />
              </>
            )}

            {/* Planimetria — sezione sempre visibile */}
            <>
              <div className="det-divider" />
              <p className="det-map-label">📐 {t.planimetriaLabel}</p>
              <div style={{ marginTop: '1rem' }}>
                {immobile.planimetria ? (
                  immobile.planimetria.toLowerCase().endsWith('.pdf') ? (
                    <a
                      href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/immobili/${immobile.planimetria}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl border border-var(--line) px-4 py-2.5 text-sm font-semibold bg-white hover:bg-var(--warm) transition-colors"
                      style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}
                    >
                      📄 {t.planimetriaViewPdf}
                    </a>
                  ) : (
                    <div className="relative w-full rounded-xl overflow-hidden border border-var(--line)" style={{ borderColor: 'var(--line)', aspectRatio: '4/3' }}>
                      <Image
                        src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/immobili/${immobile.planimetria}`}
                        alt={t.planimetriaLabel}
                        fill
                        className="object-contain"
                        sizes="100vw"
                      />
                    </div>
                  )
                ) : (
                  <p style={{ margin: 0, color: 'var(--mid)', fontSize: '.95rem', lineHeight: 1.6 }}>{t.planimetriaEmpty}</p>
                )}
              </div>
            </>
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
                <Link href={`${nav.homeHref}#contatti`} style={{ color: 'var(--tc)', fontWeight: 600 }}>{t.contactPageLink}</Link>
                {t.agencyContactSub.split(t.contactPageLink)[1]}
              </p>
            </div>
          </aside>
        </div>

        {related.length > 0 && (
          <section className="det-related">
            <div className="det-related-head">
              <h2 className="det-related-title">
                {lang === 'it' ? 'Altri immobili nella stessa zona' : 'Other properties in the same area'}
              </h2>
              <Link href={nav.catalogHref} className="det-back">
                {lang === 'it' ? 'Vedi tutti' : 'View all'}
              </Link>
            </div>
            <div className="det-related-grid">
              {related.map((item) => {
                const relTitle = lang === 'en' && item.titolo_en ? item.titolo_en : item.titolo
                const relImg = item.immaginecopertina
                  ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/immobili/${item.immaginecopertina}`
                  : null
                return (
                  <Link key={item.id} href={`${nav.propertyBasePath}/${item.slug}`} className="det-related-card">
                    <div className="det-related-img-wrap">
                      {relImg ? (
                        <Image src={relImg} alt={relTitle} fill className="object-cover" sizes="(max-width: 860px) 100vw, 33vw" />
                      ) : null}
                    </div>
                    <div className="det-related-copy">
                      {item.citta && <div className="det-related-city">{item.citta}</div>}
                      <div className="det-related-name">{relTitle}</div>
                      <div className="det-related-price">{formatPrice(item.prezzo ?? null, t.priceOnRequest)}</div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )}
      </div>
    </>
  )
}

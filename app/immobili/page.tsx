import Link from 'next/link'
import Image from 'next/image'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/server'
import { getLang } from '@/lib/getLang'
import { translations } from '@/lib/language'
import ImmobiliFilter from './ImmobiliFilter'
import ImmobiliMapWrapper from './ImmobiliMapWrapper'
import ImmobileCard from './ImmobileCard'
import GlobalLogin from '../GlobalLogin'
import './immobili.css'

export const revalidate = 0

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''

function imgUrl(src: string | null) {
  if (!src) return null
  if (src.startsWith('http') || src.startsWith('/')) return src
  return `${SUPABASE_URL}/storage/v1/object/public/immobili/${src}`
}

function fmt(v: number | null) {
  if (v === null) return null
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v)
}

type SearchParams = Promise<{ tipo?: string; q?: string; pmin?: string; pmax?: string; mqmin?: string; locali?: string; sort?: string; view?: string }>

export default async function ImmobiliPage({ searchParams }: { searchParams: SearchParams }) {
  const cookieStore = await cookies()
  const isAdmin = cookieStore.get('site_admin')?.value === 'true'
  const lang = await getLang()
  const t = translations[lang]
  const params = await searchParams
  const tipoParam = params.tipo
  const searchQuery = params.q?.trim().toLowerCase() ?? ''
  const prezzoMin = params.pmin ? Number(params.pmin) : null
  const prezzoMax = params.pmax ? Number(params.pmax) : null
  const mqMin = params.mqmin ? Number(params.mqmin) : null
  const localiMin = params.locali ? Number(params.locali) : null
  const sortParam = params.sort ?? 'newest'
  const viewMode = params.view === 'mappa' ? 'mappa' : 'lista'
  const activeFilter: 'tutti' | 'vendita' | 'affitto' =
    tipoParam === 'affitto' ? 'affitto' : tipoParam === 'vendita' ? 'vendita' : 'tutti'

  const supabase = await createClient()
  const { data } = await supabase
    .from('immobili')
    .select('id, titolo, titolo_en, slug, citta, prezzo, immaginecopertina, descrizione, descrizione_en, featured, stato, mq, locali, tipo_contratto, lat, lng, created_at')
    .eq('pubblicato', true)
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false })

  const all = data ?? []

  const list = all.filter(item => {
    const matchesTipo = activeFilter === 'tutti' || item.tipo_contratto === activeFilter
    const matchesSearch = !searchQuery ||
      item.titolo?.toLowerCase().includes(searchQuery) ||
      (item.titolo_en?.toLowerCase().includes(searchQuery)) ||
      item.citta?.toLowerCase().includes(searchQuery) ||
      item.descrizione?.toLowerCase().includes(searchQuery)
    const matchesPrezzoMin = prezzoMin === null || (item.prezzo !== null && item.prezzo >= prezzoMin)
    const matchesPrezzoMax = prezzoMax === null || (item.prezzo !== null && item.prezzo <= prezzoMax)
    const matchesMq = mqMin === null || (item.mq !== null && item.mq >= mqMin)
    const matchesLocali = localiMin === null || (item.locali !== null && item.locali >= localiMin)
    return matchesTipo && matchesSearch && matchesPrezzoMin && matchesPrezzoMax && matchesMq && matchesLocali
  })

  const disponibiliRaw = list.filter(i => i.stato !== 'venduto')
  const disponibili = [...disponibiliRaw].sort((a, b) => {
    if (sortParam === 'price_asc') return (a.prezzo ?? Infinity) - (b.prezzo ?? Infinity)
    if (sortParam === 'price_desc') return (b.prezzo ?? -Infinity) - (a.prezzo ?? -Infinity)
    return 0
  })
  const venduti = activeFilter === 'tutti' && !searchQuery
    ? all.filter(i => i.stato === 'venduto')
    : []

  const totalDisponibili = all.filter(i => i.stato !== 'venduto').length

  const sectionTitle =
    activeFilter === 'affitto' ? t.forRentSection :
    activeFilter === 'vendita' ? t.forSaleSection :
    t.availableSection

  return (
    <div className="imm-page">
      <GlobalLogin />

      {/* Admin bar */}
      {isAdmin && (
        <div className="imm-admin-bar">
          <span className="imm-admin-label">
            <span className="imm-admin-dot" />
            {t.adminBarLabel}
          </span>
          <div className="imm-admin-actions">
            <Link href="/admin/immobili" className="imm-admin-btn imm-admin-btn--ghost">Dashboard</Link>
            <Link href="/admin/immobili/new" className="imm-admin-btn imm-admin-btn--primary">{t.addPropertyBtn}</Link>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="imm-header">
        <div className="imm-header-inner">
          <Link href="/" className="imm-brand">
            <span className="imm-brand-dot" />
            {t.brandName}
          </Link>
          <Link href="/" className="imm-back">{t.backHome}</Link>
        </div>
      </header>

      {/* Hero + controls */}
      <section className="imm-hero">
        <div className="imm-hero-inner">
          <span className="imm-eyebrow">{t.catalogComplete}</span>
          <h1 className="imm-hero-title">
            {t.allProperties.split(' ').slice(0, -1).join(' ')}{' '}
            <span>{t.allProperties.split(' ').slice(-1)}</span>
          </h1>
          <p className="imm-hero-sub">
            {totalDisponibili} {t.propertiesAvailableCount}
            {venduti.length > 0 ? ` · ${venduti.length} ${t.soldCount}` : ''}.{' '}
            {t.contactForVisits}
          </p>
          <ImmobiliFilter
            current={activeFilter}
            currentQ={searchQuery}
            currentPrezzoMin={params.pmin ?? ''}
            currentPrezzoMax={params.pmax ?? ''}
            currentMqMin={params.mqmin ?? ''}
            currentLocali={params.locali ?? ''}
            currentSort={sortParam}
            currentView={viewMode}
          />
        </div>
      </section>

      {/* Vista Mappa */}
      {viewMode === 'mappa' && (
        <ImmobiliMapWrapper
          items={list.filter(i => i.lat && i.lng).map(i => ({
            id: i.id,
            titolo: lang === 'en' && i.titolo_en ? i.titolo_en : i.titolo,
            slug: i.slug,
            citta: i.citta,
            prezzo: i.prezzo,
            lat: i.lat!,
            lng: i.lng!,
            immaginecopertina: i.immaginecopertina,
            tipo_contratto: i.tipo_contratto,
            featured: i.featured,
            stato: i.stato,
          }))}
          supabaseUrl={SUPABASE_URL}
        />
      )}

      {/* Vista Lista — Disponibili */}
      {viewMode === 'lista' && (
      <section className="imm-section">
        <div className="imm-section-inner">
          <div className="imm-section-head">
            <h2 className="imm-section-title">
              <span className="imm-section-title-dot" style={{ background: '#22c55e' }} />
              {sectionTitle}
            </h2>
            <span className="imm-section-count">
              {disponibili.length} {disponibili.length === 1 ? t.propertySingular : t.propertyPlural}
              {searchQuery ? ` ${t.forSearchLabel} "${searchQuery}"` : ''}
            </span>
          </div>

          <div className="imm-grid">
            {disponibili.length === 0 ? (
              <div className="imm-empty">
                <p className="imm-empty-title">
                  {searchQuery ? `${t.noResultsFor} "${searchQuery}"` : t.noPropertiesTitle}
                </p>
                <p className="imm-empty-sub">
                  {searchQuery ? t.tryDifferentSearch : t.contactCustomSearch}
                </p>
              </div>
            ) : disponibili.map(item => (
              <ImmobileCard key={item.id} item={item} isAdmin={isAdmin} lang={lang} t={t} />
            ))}
          </div>
        </div>
      </section>
      )}

      {/* Venduti — solo admin in vista lista "tutti" senza ricerca attiva */}
      {viewMode === 'lista' && venduti.length > 0 && isAdmin && (
        <>
          <hr className="imm-divider" />
          <section className="imm-section imm-section--sold">
            <div className="imm-section-inner">
              <div className="imm-section-head">
                <h2 className="imm-section-title">
                  <span className="imm-section-title-dot" style={{ background: '#ef4444' }} />
                  {t.soldSection}
                </h2>
                <span className="imm-section-count">{venduti.length} {venduti.length === 1 ? t.propertySingular : t.propertyPlural}</span>
              </div>
              <div className="imm-grid">
                {venduti.map(item => (
                  <ImmobileCard key={item.id} item={item} sold lang={lang} t={t} />
                ))}
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  )
}

'use client'

import { useEffect, useState, useRef, useTransition } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import './home.css'
import { useLang } from '@/lib/useLang'
import { translations } from '@/lib/language'
import PropertyCard from './components/PropertyCard'
import NavDropdown from './components/NavDropdown'
import { EditableText } from './components/EditableText'
import { logout } from './actions/logout'
import PageRenderer, { type PropertyForBlocks } from './components/cms/PageRenderer'
import type { PageContent } from '@/lib/cms/types'

type PropertyItem = {
  id?: string | number
  titolo?: string
  slug?: string
  citta?: string | null
  prezzo?: number | string | null
  immaginecopertina?: string | null
  descrizione?: string | null
  featured?: boolean | null
  tipo_contratto?: string | null
  mq?: number | null
  locali?: number | null
}

type HomeContentOverrides = {
  heroTitle1?: string
  heroTitle2?: string
  serviceCopy?: string
  territoryCopy?: string
  contactCopy?: string
  navProperties?: string
  navServices?: string
  navTerritory?: string
  navTestimonials?: string
  navContacts?: string
  navReservedArea?: string
  showServices?: boolean
  showTerritory?: boolean
  showTestimonials?: boolean
  showStats?: boolean
}

export default function HomePage({
  properties = [],
  isAdmin = false,
  homeContent = {},
  cmsContent,
}: {
  properties?: PropertyItem[]
  isAdmin?: boolean
  homeContent?: HomeContentOverrides
  cmsContent?: PageContent | null
}) {
  const useCms = Boolean(cmsContent && cmsContent.blocks && cmsContent.blocks.length > 0)
  const lang = useLang()
  const t = translations[lang]
  const navProperties = lang === 'it' ? homeContent.navProperties || t.properties : t.properties
  const navServices = lang === 'it' ? homeContent.navServices || t.services : t.services
  const navTerritory = lang === 'it' ? homeContent.navTerritory || t.theTerritory : t.theTerritory
  const navTestimonials = lang === 'it' ? homeContent.navTestimonials || t.testimonials : t.testimonials
  const navContacts = lang === 'it' ? homeContent.navContacts || t.contacts : t.contacts
  const navReservedArea = lang === 'it' ? homeContent.navReservedArea || t.reservedArea : t.reservedArea
  const showServices = lang !== 'it' ? true : homeContent.showServices !== false
  const showTerritory = lang !== 'it' ? true : homeContent.showTerritory !== false
  const showTestimonials = lang !== 'it' ? true : homeContent.showTestimonials !== false
  const showStats = lang !== 'it' ? true : homeContent.showStats !== false
  const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '393332397206'
  const waHref = `https://wa.me/${waNumber}?text=Buongiorno%2C%20vorrei%20avere%20informazioni%20su%20un%20immobile%20nel%20Monferrato.`

  const [menuOpen, setMenuOpen] = useState(false)
  const [isCompact, setIsCompact] = useState(false)
  const [headerTheme, setHeaderTheme] = useState<'light' | 'dark'>('dark')
  const [activeFilter, setActiveFilter] = useState<'tutti' | 'vendita' | 'affitto'>('tutti')
  const carouselRef = useRef<HTMLDivElement>(null)
  const isHoveringCarousel = useRef(false)
  const [isPending, startTransition] = useTransition()

  const scrollCarousel = (dir: 1 | -1) => {
    const el = carouselRef.current
    if (!el) return
    const card = el.querySelector<HTMLElement>('.property-card')
    const cardWidth = (card?.offsetWidth ?? 300) + 24
    el.scrollBy({ left: dir * cardWidth, behavior: 'smooth' })
  }

  
  useEffect(() => {
    const onScroll = () => setIsCompact(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  
  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>('[data-header-theme]')
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting)
        const best = visible.sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (!best) return
        const theme = best.target.getAttribute('data-header-theme')
        if (theme === 'light' || theme === 'dark') setHeaderTheme(theme)
      },
      { threshold: 0.45 }
    )
    sections.forEach((s) => observer.observe(s))
    return () => observer.disconnect()
  }, [])

  
  const safeProperties = Array.isArray(properties) ? properties : []
  const filteredProperties =
    activeFilter === 'tutti'
      ? safeProperties
      : safeProperties.filter((p) => p.tipo_contratto === activeFilter)


  useEffect(() => {
    const el = carouselRef.current
    if (!el || filteredProperties.length <= 3) return
    let rafId: number
    let last = performance.now()
    const speed = 0.04

    const onEnter = () => { isHoveringCarousel.current = true }
    const onLeave = () => { isHoveringCarousel.current = false }
    el.addEventListener('mouseenter', onEnter)
    el.addEventListener('mouseleave', onLeave)

    const step = (now: number) => {
      const delta = now - last
      last = now
      if (!isHoveringCarousel.current && el.scrollWidth > el.clientWidth) {
        el.scrollLeft += delta * speed
        if (el.scrollLeft >= el.scrollWidth - el.clientWidth) el.scrollLeft = 0
      }
      rafId = requestAnimationFrame(step)
    }
    rafId = requestAnimationFrame(step)
    return () => {
      cancelAnimationFrame(rafId)
      el.removeEventListener('mouseenter', onEnter)
      el.removeEventListener('mouseleave', onLeave)
    }
  }, [filteredProperties.length])

  
  const testimonials = [
    { text: "Servizio preciso, disponibile e trasparente. Ci siamo sentiti seguiti dall'inizio alla fine.", role: 'Cliente — Vendita', initial: 'M.R.' },
    { text: 'Abbiamo trovato casa con tempi rapidi e con informazioni sempre chiare su ogni passaggio.', role: 'Cliente — Acquisto', initial: 'L.B.' },
    { text: 'Ottima conoscenza del territorio e approccio professionale, ma sempre molto umano.', role: 'Cliente — Consulenza', initial: 'F.T.' },
  ]

  const stats = [
    { n: '10', suffix: '+', label: t.yearsInTerritory },
    { n: '200', suffix: '+', label: t.propertiesHandled },
    { n: '98', suffix: '%', label: t.satisfiedClients },
    { n: '15', suffix: '', label: t.municipalities },
  ]

  
  const handleLogout = () => startTransition(() => logout())

  const scrollTo = (id: string) => {
    const anchor = document.querySelector<HTMLElement>(`[data-scroll-anchor="${id}"]`)
    const el = anchor ?? document.getElementById(id)
    if (!el) return
    const header = document.querySelector('.site-header') as HTMLElement | null
    const headerH = header ? header.getBoundingClientRect().height : 72
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - headerH - 12, behavior: 'smooth' })
  }

  return (
    <main className="home-shell">

      {/* ─── HEADER — solo nav + telefono, nessun logo ─── */}
      <header
        className={`site-header ${isCompact ? 'is-compact' : ''} ${
          headerTheme === 'dark' ? 'header-dark' : 'header-light'
        }`}
      >
        <div className="site-header-inner site-width">



          {/* Nav centrale — solo desktop */}
          <div className="site-nav-area">
            <nav className="site-nav">
              <div className="site-nav-buttons">
                <NavDropdown
                  trigger={navProperties}
                  items={[
                    { label: lang === 'it' ? 'Immobili in evidenza' : 'Featured properties', onClick: () => scrollTo('immobili') },
                    { label: lang === 'it' ? 'Tutti gli immobili' : 'All properties', href: '/immobili' },
                  ]}
                />
                <button className="site-nav-link" onClick={() => scrollTo('servizi')}>{navServices}</button>
                <button className="site-nav-link" onClick={() => scrollTo('territorio')}>{navTerritory}</button>
                <button className="site-nav-link" onClick={() => scrollTo('testimonianze')}>{navTestimonials}</button>
                <NavDropdown
                  trigger={navContacts}
                  items={[
                    { label: 'WhatsApp', onClick: () => window.open(waHref, '_blank') },
                    { label: 'Mail', onClick: () => window.location.href = 'mailto:info@agenziamonferrato.it' },
                    { label: lang === 'it' ? 'Sezione contatti' : 'Contact section', onClick: () => scrollTo('contatti') },
                  ]}
                />
              </div>
            </nav>
            {isAdmin && (
              <div className="admin-under-nav">
                <span className="admin-under-nav-dot" />
                {t.loggedAsAdmin}
              </div>
            )}
          </div>

          {/* Login / Admin — area destra header */}
          <div className="header-right-area">
            <div className="header-right-pill">
              {!isAdmin ? (
                <Link href="/login" className="header-login-link">{navReservedArea}</Link>
              ) : (
                <div className="header-admin-actions">
                  <button type="button" disabled={isPending} onClick={handleLogout} className="header-logout-btn">
                    {isPending ? '…' : t.logout}
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu trigger — solo mobile */}
            <button
              className={`nav-menu-btn ${menuOpen ? 'is-open' : ''}`}
              aria-label={menuOpen ? 'Chiudi menu' : 'Apri menu'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
              type="button"
            >
              <span className="nav-menu-label">{menuOpen ? '✕' : 'Menu'}</span>
            </button>
          </div>

          {/* Overlay full-screen nav — solo mobile */}
          {menuOpen && (
            <div className="nav-overlay" onClick={() => setMenuOpen(false)}>
              <div className="nav-overlay-inner" onClick={(e) => e.stopPropagation()}>
                <button className="nav-overlay-close" onClick={() => setMenuOpen(false)} type="button" aria-label="Chiudi">✕</button>
                <nav className="nav-overlay-links">
                  {!isAdmin ? (
                    <>
                      <Link href="/immobili" onClick={() => setMenuOpen(false)}>{t.properties}</Link>
                      <button type="button" onClick={() => { scrollTo('servizi'); setMenuOpen(false) }}>{t.services}</button>
                      <button type="button" onClick={() => { scrollTo('territorio'); setMenuOpen(false) }}>{t.theTerritory}</button>
                      <button type="button" onClick={() => { scrollTo('testimonianze'); setMenuOpen(false) }}>{t.testimonials}</button>
                      <button type="button" onClick={() => { scrollTo('contatti'); setMenuOpen(false) }}>{t.contacts}</button>
                      <div className="nav-overlay-divider" />
                      <Link href="/login" onClick={() => setMenuOpen(false)} className="nav-overlay-secondary">{t.reservedArea}</Link>
                      <div className="nav-overlay-divider" />
                      <div className="nav-overlay-lang">
                        <button className={`nav-overlay-lang-btn${lang === 'it' ? ' is-active' : ''}`} onClick={() => { if (typeof window !== 'undefined') { document.cookie = 'lang=it; path=/; max-age=604800; SameSite=Lax'; window.location.reload() } }}>🇮🇹 Italiano</button>
                        <button className={`nav-overlay-lang-btn${lang === 'en' ? ' is-active' : ''}`} onClick={() => { if (typeof window !== 'undefined') { document.cookie = 'lang=en; path=/; max-age=604800; SameSite=Lax'; window.location.reload() } }}>🇬🇧 English</button>
                      </div>
                    </>
                  ) : (
                    <>
                      <Link href="/admin" onClick={() => setMenuOpen(false)}>{t.adminDashboard}</Link>
                      <Link href="/admin/stats" onClick={() => setMenuOpen(false)}>{t.statistics}</Link>
                      <button type="button" disabled={isPending} onClick={() => { handleLogout(); setMenuOpen(false) }}>{isPending ? '…' : t.logout}</button>
                    </>
                  )}
                </nav>
              </div>
            </div>
          )}
        </div>
      </header>

      {useCms && cmsContent ? (
        <PageRenderer
          content={cmsContent}
          context={{ isAdmin, immobili: properties as PropertyForBlocks[] }}
        />
      ) : (
        <>
      {/* 1 ─── HERO ─── */}
      <section className="hero-home" data-header-theme="dark">
        <div className="hero-media" aria-hidden="true">
          <Image
            key={`hero-${lang}`}
            src="/images/hero/sfondo-home.jpg"
            alt=""
            fill
            priority
            className="hero-image"
            sizes="100vw"
          />
          <div className="hero-overlay" />
        </div>
        <div className="site-width hero-inner">
          <div className="hero-copy">
            <h1 className="hero-title au d1">
              <span className="title-black"><EditableText i18nKey="heroTitle1" /></span>
              <br />
              <span className="title-orange"><EditableText i18nKey="heroTitle2" /></span>
            </h1>

            <div className="hero-actions au d2">
              <Link href="/immobili" className="btn-tc">
                {t.discoverProperties}
              </Link>
              <button type="button" onClick={() => scrollTo('contatti')} className="btn-ghost btn-ghost-white">
                {t.contactUs}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2 ─── IMMOBILI IN EVIDENZA ─── */}
      <section id="immobili" className="section" data-header-theme="light">
        <div className="site-width">
          <div className="section-head section-head-left">
            <div data-scroll-anchor="immobili">
              <span className="eyebrow eyebrow-accent"><EditableText i18nKey="inEvidence" /></span>
              <h2 className="section-title au d1">
                <span className="title-black"><EditableText i18nKey="selectedProposals1" /></span>
                <br />
                <span className="title-orange"><EditableText i18nKey="selectedProposals2" /></span>
              </h2>
            </div>
            <div className="filter-tabs-wrap">
              <div className="filter-tabs">
                <button type="button" className={`filter-tab ${activeFilter === 'tutti' ? 'filter-tab--active' : ''}`} onClick={() => setActiveFilter('tutti')}>{t.filterAll}</button>
                <button type="button" className={`filter-tab ${activeFilter === 'vendita' ? 'filter-tab--active' : ''}`} onClick={() => setActiveFilter('vendita')}>{t.filterSale}</button>
                <button type="button" className={`filter-tab ${activeFilter === 'affitto' ? 'filter-tab--active' : ''}`} onClick={() => setActiveFilter('affitto')}>{t.filterRent}</button>
              </div>
              <div className="carousel-nav">
                <button type="button" className="carousel-btn" aria-label="Precedente" onClick={() => scrollCarousel(-1)}>←</button>
                <button type="button" className="carousel-btn" aria-label="Successivo" onClick={() => scrollCarousel(1)}>→</button>
              </div>
              <Link href="/immobili" className="btn-ghost">{t.viewAll}</Link>
              {isAdmin && (
                <Link href="/admin/immobili" className="btn-ghost" style={{ borderColor: '#c4622d', color: '#c4622d' }}>
                  ⚙ {t.manageProperties}
                </Link>
              )}
            </div>
          </div>

          {filteredProperties.length > 0 ? (
            <div className="property-carousel" ref={carouselRef}>
              {filteredProperties.map((property, idx) => {
                const slug = property.slug || String(property.id)
                return (
                  <PropertyCard key={slug} property={property} index={idx} />
                )
              })}
            </div>
          ) : safeProperties.length > 0 ? (
            <div className="empty-state-box">
              <p className="empty-state-title">{t.noPropertiesFilter}</p>
              <p className="empty-state-copy">Prova a selezionare un filtro diverso.</p>
            </div>
          ) : (
            <div className="empty-state-box">
              <p className="empty-state-title">{t.noPropertiesTitle}</p>
              <p className="empty-state-copy">{t.noPropertiesCopy}</p>
            </div>
          )}
        </div>
      </section>

      {/* 3 ─── I NOSTRI SERVIZI ─── */}
      {showServices && (
      <section id="servizi" className="section section--warm" data-header-theme="light">
        <div className="site-width">
          <div className="section-head section-head-left">
            <div data-scroll-anchor="servizi">
              <span className="eyebrow eyebrow-accent"><EditableText i18nKey="ourServices" /></span>
              <h2 className="section-title au d1">
                <span className="title-black"><EditableText i18nKey="serviceSubtitle1" /></span>
                <br />
                <span className="title-orange"><EditableText i18nKey="serviceSubtitle2" /></span>
              </h2>
            </div>

            <p className="section-copy au d2"><EditableText i18nKey="serviceCopy" /></p>
          </div>
          <div className="card-grid">
            {([
              ['service1Title', 'service1Body'],
              ['service2Title', 'service2Body'],
              ['service3Title', 'service3Body'],
            ] as const).map(([titleKey, bodyKey], i) => (
              <div key={titleKey} className={`service-card service-card--centered au d${i + 1}`}>
                <h3 className="svc-title"><EditableText i18nKey={titleKey} /></h3>
                <p className="svc-body"><EditableText i18nKey={bodyKey} /></p>
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* 4 ─── TERRITORIO ─── */}
      {showTerritory && (
      <section id="territorio" className="territory-section" data-header-theme="light">
        <div className="site-width territory-grid">
          <div className="au d1" data-scroll-anchor="territorio">
            <span className="eyebrow eyebrow-accent"><EditableText i18nKey="theTerritory" /></span>
            <h2 className="territory-title">
              <span className="title-black"><EditableText i18nKey="livingInMonferrato" /></span>
              <br />
              <span className="title-orange"><EditableText i18nKey="meanChoosing" /></span>
              <br />
              <span className="title-orange"><EditableText i18nKey="qualityAndCharacter" /></span>
            </h2>

            <p className="territory-copy"><EditableText i18nKey="territoryCopy" /></p>
            <button type="button" onClick={() => document.getElementById('immobili')?.scrollIntoView({ behavior: 'smooth', block: 'start' })} className="btn-tc">
              {t.exploreProperties}
            </button>
          </div>
          <div className="territory-image-wrap au d2">
            <Image
              src="/images/hero/FotoPanorama.JPG"
              alt="Vista sul Monferrato"
              fill
              className="territory-image"
              style={{ objectPosition: 'center 35%' }}
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="territory-overlay" />
            <div className="territory-tag">
              <span className="dot" />
              <span>Vignale Monferrato · Piemonte</span>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* 5 ─── RECENSIONI ─── */}
      {showTestimonials && (
      <section id="testimonianze" className="testimonials-section" data-header-theme="light">
        <div className="site-width">
          <div className="section-head section-head-left">
            <div data-scroll-anchor="testimonianze">
              <span className="eyebrow eyebrow-accent"><EditableText i18nKey="testimonials" /></span>
              <h2 className="section-title au">
                <span className="title-black"><EditableText i18nKey="whatClients1" /></span>
                <br />
                <span className="title-orange"><EditableText i18nKey="whatClients2" /></span>
              </h2>
            </div>

          </div>
          <div className="quote-grid">
            {testimonials.map((q, i) => (
              <blockquote key={i} className={`quote-card au d${i + 1}`}>
                <div className="quote-avatar">{q.initial}</div>
                <p className="quote-text">&ldquo;{q.text}&rdquo;</p>
                <footer className="quote-footer">{q.role}</footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* 6 ─── NUMERI — striscia chiara prima dei contatti ─── */}
      {showStats && (
      <section className="proof-section" data-header-theme="light">
        <div className="site-width">
          <div className="proof-grid">
            {stats.map((item, i) => (
              <div key={item.label} className={`proof-item au d${i + 1}`}>
                <div className="proof-n">{item.n}<span>{item.suffix}</span></div>
                <div className="proof-label">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      )}
        </>
      )}

    </main>
  )
}

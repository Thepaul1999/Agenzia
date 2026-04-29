'use client'

import { useEffect, useState, useRef, useTransition } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import './home.css'
import { useLang } from '@/lib/useLang'
import { translations } from '@/lib/language'
import PropertyCard from './components/PropertyCard'
import { logout } from './actions/logout'

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

export default function HomePage({ properties = [], isAdmin = false }: { properties?: PropertyItem[]; isAdmin?: boolean }) {
  const lang = useLang()
  const t = translations[lang]

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

  
  const services = [
    { title: t.service1Title, body: t.service1Body },
    { title: t.service2Title, body: t.service2Body },
    { title: t.service3Title, body: t.service3Body },
  ]

  
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
                <button className="site-nav-link" onClick={() => document.getElementById('immobili')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>{t.properties}</button>
                <button className="site-nav-link" onClick={() => document.getElementById('servizi')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>{t.services}</button>
                <button className="site-nav-link" onClick={() => document.getElementById('territorio')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>{t.theTerritory}</button>
                <button className="site-nav-link" onClick={() => document.getElementById('testimonianze')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>{t.testimonials}</button>
                <button className="site-nav-link" onClick={() => document.getElementById('contatti')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>{t.contacts}</button>
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
            {!isAdmin ? (
              <Link href="/login" className="header-login-link">{t.reservedArea}</Link>
            ) : (
              <div className="header-admin-actions">
                <Link href="/admin/immobili" className="header-login-link">{t.manageProperties}</Link>
                <button type="button" disabled={isPending} onClick={handleLogout} className="header-logout-btn">
                  {isPending ? '…' : t.logout}
                </button>
              </div>
            )}

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
                      <button type="button" onClick={() => { document.getElementById('immobili')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); setMenuOpen(false) }}>{t.properties}</button>
                      <button type="button" onClick={() => { document.getElementById('servizi')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); setMenuOpen(false) }}>{t.services}</button>
                      <button type="button" onClick={() => { document.getElementById('territorio')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); setMenuOpen(false) }}>{t.theTerritory}</button>
                      <button type="button" onClick={() => { document.getElementById('testimonianze')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); setMenuOpen(false) }}>{t.testimonials}</button>
                      <button type="button" onClick={() => { document.getElementById('contatti')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); setMenuOpen(false) }}>{t.contacts}</button>
                      <div className="nav-overlay-divider" />
                      <Link href="/login" onClick={() => setMenuOpen(false)} className="nav-overlay-secondary">{t.reservedArea}</Link>
                    </>
                  ) : (
                    <>
                      <Link href="/admin" onClick={() => setMenuOpen(false)}>{t.adminDashboard}</Link>
                      <Link href="/admin/immobili" onClick={() => setMenuOpen(false)}>{t.manageProperties}</Link>
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
              <span className="title-black">{t.heroTitle1}</span>
              <br />
              <span className="title-orange">{t.heroTitle2}</span>
            </h1>

            <div className="hero-actions au d2">
              <button type="button" onClick={() => document.getElementById('immobili')?.scrollIntoView({ behavior: 'smooth', block: 'start' })} className="btn-tc">
                {t.discoverProperties}
              </button>
              <button type="button" onClick={() => document.getElementById('contatti')?.scrollIntoView({ behavior: 'smooth', block: 'start' })} className="btn-ghost btn-ghost-white">
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
            <div>
              <span className="eyebrow eyebrow-accent">{t.inEvidence}</span>
              <h2 className="section-title au d1">
                <span className="title-black">{t.selectedProposals1}</span>
                <br />
                <span className="title-orange">{t.selectedProposals2}</span>
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
      <section id="servizi" className="section section--warm" data-header-theme="light">
        <div className="site-width">
          <div className="section-head section-head-left">
            <div>
              <span className="eyebrow eyebrow-accent">{t.ourServices}</span>
              <h2 className="section-title au d1">
                <span className="title-black">{t.serviceSubtitle1}</span>
                <br />
                <span className="title-orange">{t.serviceSubtitle2}</span>
              </h2>
            </div>

            <p className="section-copy au d2">{t.serviceCopy}</p>
          </div>
          <div className="card-grid">
            {services.map((s, i) => (
              <div key={s.title} className={`service-card service-card--centered au d${i + 1}`}>
                <h3 className="svc-title">{s.title}</h3>
                <p className="svc-body">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4 ─── TERRITORIO ─── */}
      <section id="territorio" className="territory-section" data-header-theme="light">
        <div className="site-width territory-grid">
          <div className="au d1">
            <span className="eyebrow eyebrow-accent">{t.theTerritory}</span>
            <h2 className="territory-title">
              <span className="title-black">{t.livingInMonferrato}</span>
              <br />
              <span className="title-orange">{t.meanChoosing}</span>
              <br />
              <span className="title-orange">{t.qualityAndCharacter}</span>
            </h2>

            <p className="territory-copy">{t.territoryCopy}</p>
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

      {/* 5 ─── RECENSIONI ─── */}
      <section id="testimonianze" className="testimonials-section" data-header-theme="light">
        <div className="site-width">
          <div className="section-head section-head-left">
            <div>
              <span className="eyebrow eyebrow-accent">{t.testimonials}</span>
              <h2 className="section-title au">
                <span className="title-black">{t.whatClients1}</span>
                <br />
                <span className="title-orange">{t.whatClients2}</span>
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

      {/* 6 ─── NUMERI — striscia chiara prima dei contatti ─── */}
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

      {/* 7 ─── CONTATTI ─── */}
      <section id="contatti" className="contact-section" data-header-theme="dark">
        <div className="site-width">
          <div className="contact-grid">
            <div>
              <span className="eyebrow eyebrow-accent">{t.contacts}</span>
              <h2 className="contact-title au">
                <span className="contact-line-white">{t.lookingForHouse}</span>
                <br />
                <span className="contact-line-white">{t.inMonferrato}</span>
                <br />
                <span className="title-orange">{t.startHere}</span>
              </h2>

              <p className="contact-copy au d2">{t.contactCopy}</p>
            </div>

            <div className="contact-box">
              <div className="contact-row contact-row-line">
                <span className="contact-label">{t.whatsapp}</span>
                <a
                  href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=Buongiorno%2C%20vorrei%20avere%20informazioni%20su%20un%20immobile%20nel%20Monferrato.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-row-right contact-pill"
                >
                  {t.writeOnWhatsapp} <span>↗</span>
                </a>
              </div>
              <div className="contact-row contact-row-line">
                <span className="contact-label">{t.mail}</span>
                <a href="mailto:info@agenziamonferrato.it" className="contact-row-right contact-link-inline">
                  <span>info@agenziamonferrato.it</span>
                  <span className="contact-arrow">↗</span>
                </a>
              </div>
              <div className="contact-row contact-row-line">
                <span className="contact-label">{t.phone}</span>
                <a href={`tel:+${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`} className="contact-row-right contact-link-inline">
                  <span>+39 {process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.slice(2).replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3')}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

    </main>
  )
}

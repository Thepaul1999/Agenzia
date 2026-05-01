import type { Block, PageContent } from './types'

// Helper to generate a stable-ish id for seeded blocks.
let seedCounter = 0
function seedId(prefix: string) {
  seedCounter += 1
  return `${prefix}-${seedCounter.toString(36)}`
}

// Reset the seed counter so default content is reproducible.
function resetSeed() {
  seedCounter = 0
}

function block(type: string, props: Record<string, unknown>, children?: Block[]): Block {
  return {
    id: seedId(type),
    type,
    props,
    children,
  }
}

// ---------------- HOME ----------------
function buildHomeDefault(): PageContent {
  resetSeed()
  return {
    meta: { title: 'Agenzia Immobiliare Monferrato', description: 'Immobili nel cuore del Monferrato.' },
    global: { background: '#ffffff', textColor: '#0c0c0a', containerWidth: '1180px' },
    blocks: [
      block(
        'section',
        {
          anchorId: 'hero',
          background: '#0c0c0a',
          backgroundImage: '/images/hero/sfondo-home.jpg',
          backgroundOverlay: 'linear-gradient(90deg, rgba(12,12,10,.74) 0%, rgba(12,12,10,.46) 42%, rgba(12,12,10,.18) 72%, rgba(12,12,10,.06) 100%)',
          paddingY: '8rem',
          paddingX: '1.5rem',
          contentWidth: '1180px',
          headerTheme: 'dark',
          minHeight: '90vh',
        },
        [
          block('eyebrow', { text: 'Monferrato', color: '#c4622d', bordered: true }),
          block('heading', {
            level: 'h1',
            text: 'Immobili nel Monferrato,',
            accentText: 'scelti con attenzione',
            color: '#ffffff',
            accentColor: '#c4622d',
            align: 'left',
            size: 'clamp(2.4rem, 5vw, 4.6rem)',
          }),
          block('buttonGroup', {
            buttons: [
              { text: 'Scopri gli immobili', href: '/immobili', variant: 'primary' },
              { text: 'Contattaci', href: '#contatti', variant: 'ghost-white' },
            ],
            align: 'left',
            gap: '1rem',
          }),
        ]
      ),

      block(
        'section',
        {
          anchorId: 'immobili',
          background: '#ffffff',
          paddingY: '5rem',
          paddingX: '1.5rem',
          contentWidth: '1180px',
          headerTheme: 'light',
        },
        [
          block('eyebrow', { text: 'In evidenza', color: '#c4622d', bordered: true }),
          block('heading', {
            level: 'h2',
            text: 'Proposte',
            accentText: 'selezionate',
            color: '#0c0c0a',
            accentColor: '#c4622d',
            align: 'left',
          }),
          block('propertiesCarousel', {
            filter: 'featured',
            limit: 6,
            showFilters: true,
            showCta: true,
          }),
        ]
      ),

      block(
        'section',
        {
          anchorId: 'servizi',
          background: '#f5f3f0',
          paddingY: '5rem',
          paddingX: '1.5rem',
          contentWidth: '1180px',
          headerTheme: 'light',
        },
        [
          block('eyebrow', { text: 'I nostri servizi', color: '#c4622d', bordered: true }),
          block('heading', {
            level: 'h2',
            text: 'Un supporto attento,',
            accentText: 'dall’inizio alla fine',
            color: '#0c0c0a',
            accentColor: '#c4622d',
            align: 'left',
          }),
          block('text', {
            text: 'Lavoriamo con attenzione reale su vendita, acquisto e valorizzazione degli immobili nel Monferrato.',
            color: '#7c7770',
            align: 'left',
            maxWidth: '34rem',
          }),
          block('cards', {
            columns: 3,
            align: 'center',
            cardBackground: '#ffffff',
            cardBorder: '#e9e4dd',
            items: [
              { title: 'Selezione accurata', body: 'Scegliamo immobili che hanno qualità, identità e potenziale.' },
              { title: 'Conoscenza del territorio', body: 'Ti aiutiamo a capire davvero il Monferrato.' },
              { title: 'Consulenza chiara', body: 'Parliamo in modo semplice e trasparente.' },
            ],
          }),
        ]
      ),

      block(
        'section',
        {
          anchorId: 'territorio',
          background: '#ffffff',
          paddingY: '5rem',
          paddingX: '1.5rem',
          contentWidth: '1180px',
          headerTheme: 'light',
        },
        [
          block('columns', { columns: 2, gap: '2rem', align: 'center' }, [
            block('section', { background: 'transparent', paddingY: '0', paddingX: '0' }, [
              block('eyebrow', { text: 'Il territorio', color: '#c4622d', bordered: true }),
              block('heading', {
                level: 'h2',
                text: 'Vivere nel Monferrato',
                accentText: 'qualità e carattere',
                color: '#0c0c0a',
                accentColor: '#c4622d',
                align: 'left',
              }),
              block('text', {
                text: 'Colline, vigne, borghi e case con identità. Il nostro lavoro è aiutarti a trovare la proprietà giusta nel contesto giusto.',
                color: '#7c7770',
                align: 'left',
                maxWidth: '32rem',
              }),
              block('button', {
                text: 'Esplora gli immobili',
                href: '/immobili',
                variant: 'primary',
                align: 'left',
              }),
            ]),
            block('image', {
              src: '/images/hero/FotoPanorama.JPG',
              alt: 'Vista sul Monferrato',
              rounded: '1.5rem',
              ratio: '4 / 3',
              objectFit: 'cover',
              objectPosition: 'center 35%',
            }),
          ]),
        ]
      ),

      block(
        'section',
        {
          anchorId: 'testimonianze',
          background: '#f5f3f0',
          paddingY: '5rem',
          paddingX: '1.5rem',
          contentWidth: '1180px',
          headerTheme: 'light',
        },
        [
          block('eyebrow', { text: 'Recensioni', color: '#c4622d', bordered: true }),
          block('heading', {
            level: 'h2',
            text: 'Cosa dicono',
            accentText: 'i nostri clienti',
            color: '#0c0c0a',
            accentColor: '#c4622d',
            align: 'left',
          }),
          block('testimonials', {
            columns: 3,
            items: [
              { text: 'Servizio preciso, disponibile e trasparente.', role: 'Cliente — Vendita', initial: 'M.R.' },
              { text: 'Abbiamo trovato casa con tempi rapidi e con informazioni sempre chiare.', role: 'Cliente — Acquisto', initial: 'L.B.' },
              { text: 'Ottima conoscenza del territorio e approccio professionale.', role: 'Cliente — Consulenza', initial: 'F.T.' },
            ],
          }),
        ]
      ),

      block(
        'section',
        {
          anchorId: 'numeri',
          background: '#ffffff',
          paddingY: '4rem',
          paddingX: '1.5rem',
          contentWidth: '1180px',
          headerTheme: 'light',
        },
        [
          block('stats', {
            items: [
              { n: '10', suffix: '+', label: 'Anni nel territorio' },
              { n: '200', suffix: '+', label: 'Immobili trattati' },
              { n: '98', suffix: '%', label: 'Clienti soddisfatti' },
              { n: '15', suffix: '', label: 'Comuni seguiti' },
            ],
          }),
        ]
      ),
    ],
  }
}

// ---------------- IMMOBILI LIST ----------------
function buildImmobiliDefault(): PageContent {
  resetSeed()
  return {
    meta: { title: 'Tutti gli immobili', description: 'Catalogo completo' },
    global: { background: '#ffffff' },
    blocks: [
      block(
        'section',
        {
          background: '#ffffff',
          paddingY: '4rem',
          paddingX: '1.5rem',
          contentWidth: '1180px',
          headerTheme: 'light',
        },
        [
          block('eyebrow', { text: 'Catalogo completo', color: '#c4622d', bordered: true }),
          block('heading', {
            level: 'h1',
            text: 'Tutti gli',
            accentText: 'immobili',
            color: '#0c0c0a',
            accentColor: '#c4622d',
            align: 'left',
          }),
          block('text', {
            text: 'Scopri tutti gli immobili attualmente disponibili. Contattaci per informazioni o sopralluoghi.',
            color: '#7c7770',
            align: 'left',
            maxWidth: '34rem',
          }),
          block('propertiesCarousel', {
            filter: 'all',
            limit: 50,
            showFilters: true,
            showCta: false,
          }),
        ]
      ),
    ],
  }
}

// ---------------- IMMOBILE TEMPLATE ----------------
// Template stub used as a fallback / starting point for the detail page
// (the renderer keeps the dynamic data fetched server-side).
function buildImmobileTemplateDefault(): PageContent {
  resetSeed()
  return {
    meta: { title: 'Immobile — Monferrato' },
    blocks: [
      block(
        'section',
        {
          background: '#ffffff',
          paddingY: '3rem',
          paddingX: '1.5rem',
          contentWidth: '1180px',
        },
        [
          block('text', {
            text: 'La pagina di dettaglio immobile usa un layout dedicato. Personalizza qui blocchi accessori (CTA, garanzie, FAQ).',
            color: '#7c7770',
            align: 'left',
          }),
        ]
      ),
    ],
  }
}

// ---------------- LOGIN ----------------
function buildLoginDefault(): PageContent {
  resetSeed()
  return {
    meta: { title: 'Area riservata' },
    blocks: [
      block(
        'section',
        {
          background: '#0c0c0a',
          backgroundImage: '/LangPage/Sfondo_LangPage_PC.jpg',
          backgroundOverlay: 'rgba(12,12,10,.55)',
          paddingY: '6rem',
          paddingX: '1.5rem',
          contentWidth: '480px',
          headerTheme: 'dark',
          minHeight: '100vh',
        },
        [
          block('heading', {
            level: 'h1',
            text: 'Area',
            accentText: 'riservata',
            color: '#ffffff',
            accentColor: '#c4622d',
            align: 'center',
          }),
          block('text', {
            text: 'Accedi con le tue credenziali per gestire il sito.',
            color: 'rgba(255,255,255,.7)',
            align: 'center',
            maxWidth: '28rem',
          }),
        ]
      ),
    ],
  }
}

// ---------------- LANGUAGE ----------------
function buildLanguageDefault(): PageContent {
  resetSeed()
  return {
    meta: { title: 'Scegli la tua lingua' },
    blocks: [
      block(
        'section',
        {
          background: '#0c0c0a',
          backgroundImage: '/LangPage/Sfondo_LangPage_PC.jpg',
          backgroundOverlay: 'rgba(0,0,0,.45)',
          paddingY: '5rem',
          paddingX: '1.5rem',
          contentWidth: '560px',
          headerTheme: 'dark',
          minHeight: '100vh',
        },
        [
          block('image', {
            src: '/images/logo/Logo_agenzia.jpg',
            alt: 'Agenzia Immobiliare Monferrato',
            rounded: '8px',
            ratio: '4 / 1',
            objectFit: 'contain',
          }),
          block('heading', {
            level: 'h1',
            text: 'Benvenuto',
            accentText: 'Welcome',
            color: '#ffffff',
            accentColor: '#e8824e',
            align: 'center',
          }),
          block('text', {
            text: 'Scegli la tua lingua — Choose your language',
            color: 'rgba(255,255,255,.75)',
            align: 'center',
          }),
        ]
      ),
    ],
  }
}

export const PAGE_DEFAULTS: Record<string, () => PageContent> = {
  home: buildHomeDefault,
  immobili: buildImmobiliDefault,
  'immobile-template': buildImmobileTemplateDefault,
  login: buildLoginDefault,
  language: buildLanguageDefault,
}

export const PAGE_CATALOG: { slug: string; title: string; description: string; route: string }[] = [
  { slug: 'home', title: 'Home', description: 'Pagina principale del sito', route: '/' },
  { slug: 'immobili', title: 'Immobili', description: 'Listing pubblico immobili', route: '/immobili' },
  { slug: 'immobile-template', title: 'Pagina immobile (template)', description: 'Blocchi accessori della pagina dettaglio', route: '/immobili/[slug]' },
  { slug: 'login', title: 'Login', description: 'Area riservata', route: '/login' },
  { slug: 'language', title: 'Selezione lingua', description: 'Schermata scelta lingua', route: '/' },
]

export function defaultContentForSlug(slug: string): PageContent {
  const builder = PAGE_DEFAULTS[slug]
  if (!builder) {
    return { meta: { title: slug }, blocks: [] }
  }
  return builder()
}

import type { BlockDefinition } from './types'

// Central registry of block definitions used by both the renderer and
// the visual builder (inspector and library).
export const BLOCK_DEFINITIONS: BlockDefinition[] = [
  // ----- Layout -----
  {
    type: 'section',
    name: 'Sezione',
    category: 'layout',
    icon: 'S',
    description: 'Contenitore con sfondo, padding e larghezza massima',
    acceptsChildren: true,
    defaultProps: {
      background: '#ffffff',
      paddingY: '4rem',
      paddingX: '1.5rem',
      contentWidth: '1180px',
      headerTheme: 'light',
      anchorId: '',
      minHeight: '0',
      backgroundImage: '',
      backgroundOverlay: '',
    },
    fields: [
      { key: 'anchorId', label: 'ID ancora (es. immobili)', type: 'text', group: 'Generale' },
      { key: 'background', label: 'Colore sfondo', type: 'color', group: 'Stile' },
      { key: 'backgroundImage', label: 'Immagine sfondo (URL)', type: 'image', group: 'Stile' },
      { key: 'backgroundOverlay', label: 'Overlay (es. rgba(0,0,0,.4))', type: 'text', group: 'Stile' },
      { key: 'paddingY', label: 'Padding verticale', type: 'text', group: 'Spaziature' },
      { key: 'paddingX', label: 'Padding orizzontale', type: 'text', group: 'Spaziature' },
      { key: 'contentWidth', label: 'Larghezza contenuto', type: 'text', group: 'Layout' },
      { key: 'minHeight', label: 'Altezza minima (vh/px)', type: 'text', group: 'Layout' },
      {
        key: 'headerTheme',
        label: 'Tema header sopra la sezione',
        type: 'select',
        options: [
          { value: 'light', label: 'Chiaro' },
          { value: 'dark', label: 'Scuro' },
        ],
        group: 'Layout',
      },
    ],
  },
  {
    type: 'columns',
    name: 'Colonne',
    category: 'layout',
    icon: '⫴',
    description: 'Layout a colonne con gap configurabile',
    acceptsChildren: true,
    defaultProps: {
      columns: 2,
      gap: '1.5rem',
      align: 'stretch',
    },
    fields: [
      { key: 'columns', label: 'Numero colonne', type: 'number' },
      { key: 'gap', label: 'Gap', type: 'text' },
      {
        key: 'align',
        label: 'Allineamento verticale',
        type: 'select',
        options: [
          { value: 'start', label: 'Inizio' },
          { value: 'center', label: 'Centro' },
          { value: 'end', label: 'Fine' },
          { value: 'stretch', label: 'Stretch' },
        ],
      },
    ],
  },
  {
    type: 'spacer',
    name: 'Spaziatore',
    category: 'layout',
    icon: '↕',
    defaultProps: { size: '3rem' },
    fields: [{ key: 'size', label: 'Altezza', type: 'text' }],
  },
  {
    type: 'divider',
    name: 'Divisore',
    category: 'layout',
    icon: '—',
    defaultProps: { color: '#e9e4dd', thickness: '1px' },
    fields: [
      { key: 'color', label: 'Colore', type: 'color' },
      { key: 'thickness', label: 'Spessore', type: 'text' },
    ],
  },

  // ----- Text -----
  {
    type: 'eyebrow',
    name: 'Etichetta',
    category: 'text',
    icon: 'T',
    defaultProps: { text: 'In evidenza', color: '#c4622d', bordered: true },
    fields: [
      { key: 'text', label: 'Testo', type: 'text' },
      { key: 'color', label: 'Colore', type: 'color' },
      { key: 'bordered', label: 'Con bordo', type: 'boolean' },
    ],
  },
  {
    type: 'heading',
    name: 'Titolo',
    category: 'text',
    icon: 'H',
    defaultProps: {
      text: 'Titolo',
      accentText: '',
      level: 'h2',
      color: '#0c0c0a',
      accentColor: '#c4622d',
      align: 'left',
      size: '',
    },
    fields: [
      { key: 'text', label: 'Testo principale', type: 'text' },
      { key: 'accentText', label: 'Testo accentato (arancione)', type: 'text' },
      {
        key: 'level',
        label: 'Livello',
        type: 'select',
        options: [
          { value: 'h1', label: 'H1' },
          { value: 'h2', label: 'H2' },
          { value: 'h3', label: 'H3' },
          { value: 'h4', label: 'H4' },
        ],
      },
      {
        key: 'align',
        label: 'Allineamento',
        type: 'select',
        options: [
          { value: 'left', label: 'Sinistra' },
          { value: 'center', label: 'Centro' },
          { value: 'right', label: 'Destra' },
        ],
      },
      { key: 'size', label: 'Override dimensione (es. 2.4rem)', type: 'text' },
      { key: 'color', label: 'Colore principale', type: 'color' },
      { key: 'accentColor', label: 'Colore accento', type: 'color' },
    ],
  },
  {
    type: 'text',
    name: 'Paragrafo',
    category: 'text',
    icon: 'P',
    defaultProps: {
      text: 'Inserisci qui il tuo testo.',
      color: '#7c7770',
      size: '1rem',
      align: 'left',
      maxWidth: '36rem',
    },
    fields: [
      { key: 'text', label: 'Testo', type: 'textarea' },
      { key: 'color', label: 'Colore', type: 'color' },
      { key: 'size', label: 'Dimensione', type: 'text' },
      {
        key: 'align',
        label: 'Allineamento',
        type: 'select',
        options: [
          { value: 'left', label: 'Sinistra' },
          { value: 'center', label: 'Centro' },
          { value: 'right', label: 'Destra' },
        ],
      },
      { key: 'maxWidth', label: 'Larghezza max', type: 'text' },
    ],
  },

  // ----- Actions -----
  {
    type: 'button',
    name: 'Pulsante',
    category: 'actions',
    icon: '▭',
    defaultProps: {
      text: 'Scopri',
      href: '/immobili',
      variant: 'primary',
      newTab: false,
      align: 'left',
    },
    fields: [
      { key: 'text', label: 'Testo', type: 'text' },
      { key: 'href', label: 'Link', type: 'href' },
      {
        key: 'variant',
        label: 'Stile',
        type: 'select',
        options: [
          { value: 'primary', label: 'Primario (arancione)' },
          { value: 'ghost', label: 'Ghost' },
          { value: 'ghost-white', label: 'Ghost bianco' },
        ],
      },
      { key: 'newTab', label: 'Apri in nuova scheda', type: 'boolean' },
      {
        key: 'align',
        label: 'Allineamento',
        type: 'select',
        options: [
          { value: 'left', label: 'Sinistra' },
          { value: 'center', label: 'Centro' },
          { value: 'right', label: 'Destra' },
        ],
      },
    ],
  },
  {
    type: 'buttonGroup',
    name: 'Gruppo pulsanti',
    category: 'actions',
    icon: '▭▭',
    defaultProps: {
      buttons: [
        { text: 'Scopri immobili', href: '/immobili', variant: 'primary' },
        { text: 'Contattaci', href: '#contatti', variant: 'ghost-white' },
      ],
      align: 'left',
      gap: '1rem',
    },
    fields: [
      {
        key: 'align',
        label: 'Allineamento',
        type: 'select',
        options: [
          { value: 'left', label: 'Sinistra' },
          { value: 'center', label: 'Centro' },
          { value: 'right', label: 'Destra' },
        ],
      },
      { key: 'gap', label: 'Gap', type: 'text' },
    ],
  },

  // ----- Media -----
  {
    type: 'image',
    name: 'Immagine',
    category: 'media',
    icon: '🖼',
    defaultProps: {
      src: '/images/hero/sfondo-home.jpg',
      alt: '',
      rounded: '1rem',
      objectFit: 'cover',
      objectPosition: 'center',
      ratio: '16 / 9',
      shadow: true,
    },
    fields: [
      { key: 'src', label: 'URL immagine', type: 'image' },
      { key: 'alt', label: 'Testo alternativo', type: 'text' },
      { key: 'rounded', label: 'Bordo arrotondato', type: 'text' },
      { key: 'ratio', label: 'Aspect ratio', type: 'text' },
      {
        key: 'objectFit',
        label: 'Object fit',
        type: 'select',
        options: [
          { value: 'cover', label: 'Cover' },
          { value: 'contain', label: 'Contain' },
        ],
      },
      { key: 'objectPosition', label: 'Object position', type: 'text' },
      { key: 'shadow', label: 'Ombra', type: 'boolean' },
    ],
  },
  {
    type: 'gallery',
    name: 'Galleria',
    category: 'media',
    icon: '▦',
    defaultProps: {
      images: [
        { src: '/images/hero/sfondo-home.jpg', alt: '' },
        { src: '/images/hero/FotoPanorama.JPG', alt: '' },
      ],
      columns: 3,
      gap: '1rem',
      ratio: '4 / 3',
    },
    fields: [
      { key: 'columns', label: 'Colonne', type: 'number' },
      { key: 'gap', label: 'Gap', type: 'text' },
      { key: 'ratio', label: 'Aspect ratio', type: 'text' },
    ],
  },

  // ----- Data -----
  {
    type: 'propertiesCarousel',
    name: 'Carosello immobili',
    category: 'data',
    icon: '⌗',
    description: 'Carosello immobili in evidenza dal database',
    defaultProps: {
      filter: 'featured',
      limit: 6,
      showFilters: true,
      showCta: true,
    },
    fields: [
      {
        key: 'filter',
        label: 'Filtro',
        type: 'select',
        options: [
          { value: 'featured', label: 'In evidenza' },
          { value: 'all', label: 'Tutti i pubblicati' },
          { value: 'sale', label: 'Solo vendita' },
          { value: 'rent', label: 'Solo affitto' },
        ],
      },
      { key: 'limit', label: 'Numero max', type: 'number' },
      { key: 'showFilters', label: 'Mostra filtri vendita/affitto', type: 'boolean' },
      { key: 'showCta', label: "Mostra CTA 'Vedi tutti'", type: 'boolean' },
    ],
  },
  {
    type: 'cards',
    name: 'Card grid',
    category: 'data',
    icon: '▤',
    defaultProps: {
      items: [
        { title: 'Servizio 1', body: 'Descrizione del servizio.', icon: '' },
        { title: 'Servizio 2', body: 'Descrizione del servizio.', icon: '' },
        { title: 'Servizio 3', body: 'Descrizione del servizio.', icon: '' },
      ],
      columns: 3,
      align: 'center',
      cardBackground: '#f5f3f0',
      cardBorder: '#e9e4dd',
    },
    fields: [
      { key: 'columns', label: 'Colonne', type: 'number' },
      {
        key: 'align',
        label: 'Allineamento',
        type: 'select',
        options: [
          { value: 'left', label: 'Sinistra' },
          { value: 'center', label: 'Centro' },
        ],
      },
      { key: 'cardBackground', label: 'Sfondo card', type: 'color' },
      { key: 'cardBorder', label: 'Bordo card', type: 'color' },
    ],
  },
  {
    type: 'testimonials',
    name: 'Recensioni',
    category: 'data',
    icon: '“',
    defaultProps: {
      items: [
        { text: 'Servizio preciso, disponibile e trasparente.', role: 'Cliente — Vendita', initial: 'M.R.' },
        { text: 'Abbiamo trovato casa con tempi rapidi e con informazioni sempre chiare.', role: 'Cliente — Acquisto', initial: 'L.B.' },
      ],
      columns: 3,
    },
    fields: [{ key: 'columns', label: 'Colonne', type: 'number' }],
  },
  {
    type: 'stats',
    name: 'Numeri',
    category: 'data',
    icon: '#',
    defaultProps: {
      items: [
        { n: '10', suffix: '+', label: 'Anni nel territorio' },
        { n: '200', suffix: '+', label: 'Immobili trattati' },
        { n: '98', suffix: '%', label: 'Clienti soddisfatti' },
        { n: '15', suffix: '', label: 'Comuni seguiti' },
      ],
    },
    fields: [],
  },
  {
    type: 'contactCard',
    name: 'Card contatti',
    category: 'data',
    icon: '✉',
    defaultProps: {
      whatsapp: '393332397206',
      mail: 'info@agenziamonferrato.it',
      phone: '+39 333 239 7206',
      hours: 'Lun-Ven 9.00–12.00\nPomeriggio su appuntamento',
      logo: '/images/logo/Logo_agenzia_scontornato.png',
    },
    fields: [
      { key: 'whatsapp', label: 'Numero WhatsApp', type: 'text' },
      { key: 'mail', label: 'Email', type: 'text' },
      { key: 'phone', label: 'Telefono visualizzato', type: 'text' },
      { key: 'hours', label: 'Orari', type: 'textarea' },
      { key: 'logo', label: 'Logo (URL)', type: 'image' },
    ],
  },
  {
    type: 'map',
    name: 'Mappa',
    category: 'data',
    icon: '📍',
    defaultProps: {
      lat: 45.04,
      lng: 8.4,
      zoom: 12,
      title: 'Monferrato',
      height: '420px',
    },
    fields: [
      { key: 'lat', label: 'Latitudine', type: 'number' },
      { key: 'lng', label: 'Longitudine', type: 'number' },
      { key: 'zoom', label: 'Zoom', type: 'number' },
      { key: 'title', label: 'Etichetta', type: 'text' },
      { key: 'height', label: 'Altezza', type: 'text' },
    ],
  },

  // ----- Advanced -----
  {
    type: 'html',
    name: 'HTML',
    category: 'advanced',
    icon: '</>',
    description: 'HTML grezzo (uso esperto)',
    defaultProps: { html: '<p>Contenuto HTML</p>' },
    fields: [{ key: 'html', label: 'HTML', type: 'textarea' }],
  },
]

export const BLOCK_DEF_BY_TYPE: Record<string, BlockDefinition> = Object.fromEntries(
  BLOCK_DEFINITIONS.map((b) => [b.type, b])
)

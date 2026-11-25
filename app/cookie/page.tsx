import LegalPage, { type LegalContent } from '../components/LegalPage'

export const metadata = {
  title: 'Cookie Policy – Agenzia Immobiliare Monferrato',
}

const it: LegalContent = {
  title: 'Cookie Policy',
  intro:
    'Questa pagina spiega quali cookie e tecnologie simili usa il sito e come puoi gestire le tue scelte.',
  sections: [
    {
      title: 'Cosa sono i cookie',
      body: [
        'I cookie sono piccoli file di testo che il sito salva sul tuo dispositivo per farlo funzionare o per ricordare le tue scelte.',
      ],
    },
    {
      title: 'Cookie e dati tecnici che usiamo',
      body: [
        'Lingua: un cookie “lang” ricorda la lingua scelta (italiano o inglese). È necessario al funzionamento del sito.',
        'Preferenze di sessione: la scelta della lingua viene salvata anche nella memoria della sessione del browser e si cancella alla chiusura.',
        'Accesso all’area riservata: per il solo personale autorizzato vengono usati cookie di autenticazione e di sessione. Sono tecnici e non servono a profilarti.',
        'Mappe: le mappe degli immobili possono caricare risorse da servizi esterni (ad esempio OpenStreetMap o Google Maps), che possono impostare propri cookie secondo le loro informative.',
      ],
    },
    {
      title: 'Cookie analitici e di profilazione',
      body: [
        'Il sito non usa cookie di profilazione né strumenti di pubblicità. Le visite alle pagine sono contate in modo anonimo, senza identificarti. Se in futuro verranno introdotti strumenti di analisi, ti chiederemo prima il consenso.',
      ],
    },
    {
      title: 'Come gestire le tue scelte',
      body: [
        'Poiché usiamo solo cookie tecnici, non è richiesto il tuo consenso. Puoi comunque cancellare o bloccare i cookie dalle impostazioni del tuo browser: in tal caso alcune funzioni, come il ricordare la lingua, potrebbero non funzionare.',
      ],
    },
  ],
}

const en: LegalContent = {
  title: 'Cookie Policy',
  intro:
    'This page explains which cookies and similar technologies the website uses and how you can manage your choices.',
  sections: [
    {
      title: 'What cookies are',
      body: [
        'Cookies are small text files the site stores on your device so it can work or remember your choices.',
      ],
    },
    {
      title: 'Cookies and technical data we use',
      body: [
        'Language: a “lang” cookie remembers the language you chose (Italian or English). It is necessary for the site to work.',
        'Session preferences: your language choice is also kept in the browser’s session memory and is cleared when you close it.',
        'Reserved-area access: authentication and session cookies are used for authorised staff only. They are technical and are not used to profile you.',
        'Maps: property maps may load resources from external services (for example OpenStreetMap or Google Maps), which may set their own cookies under their own notices.',
      ],
    },
    {
      title: 'Analytics and profiling cookies',
      body: [
        'The site uses no profiling cookies or advertising tools. Page views are counted anonymously, without identifying you. If analytics tools are introduced in the future, we will ask for your consent first.',
      ],
    },
    {
      title: 'How to manage your choices',
      body: [
        'Because we only use technical cookies, your consent is not required. You can still delete or block cookies in your browser settings; some features, such as remembering your language, may then stop working.',
      ],
    },
  ],
}

export default function CookiePage() {
  return <LegalPage it={it} en={en} />
}

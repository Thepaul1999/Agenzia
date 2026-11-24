import LegalPage, { type LegalContent } from '../components/LegalPage'

export const metadata = {
  title: 'Privacy Policy – Agenzia Immobiliare Monferrato',
}

const it: LegalContent = {
  title: 'Privacy Policy',
  intro:
    'Questa informativa spiega come trattiamo i dati personali di chi visita questo sito e ci contatta, ai sensi del Regolamento UE 2016/679 (GDPR).',
  sections: [
    {
      title: 'Quali dati trattiamo',
      body: [
        'Dati di contatto che ci fornisci volontariamente: se ci scrivi per email, ci chiami o ci contatti su WhatsApp, trattiamo il tuo nome, il numero di telefono, l’indirizzo email e il contenuto del messaggio.',
        'Dati di navigazione: il sito registra in forma anonima e aggregata le pagine visitate (ad esempio quante volte è stata aperta la scheda di un immobile). Non memorizziamo il tuo indirizzo IP né altri dati che permettano di identificarti.',
        'Dati degli utenti dell’area riservata: per il personale autorizzato trattiamo email e credenziali di accesso, gestite tramite un servizio di autenticazione dedicato.',
      ],
    },
    {
      title: 'Perché li trattiamo e su quale base',
      body: [
        'Rispondere alle tue richieste di informazioni su immobili e servizi (esecuzione di misure precontrattuali richieste da te).',
        'Gestire la nostra attività di intermediazione immobiliare e adempiere agli obblighi di legge (obbligo legale).',
        'Capire quali pagine del sito sono più utili, in forma anonima, per migliorarlo (legittimo interesse).',
      ],
    },
    {
      title: 'Con chi li condividiamo',
      body: [
        'I dati non vengono venduti. Possono essere trattati da fornitori che ci offrono servizi tecnici (hosting del sito e database) in qualità di responsabili del trattamento, e da professionisti che ci assistono nell’attività, vincolati alla riservatezza.',
        'Se usi i link a WhatsApp o a Google Maps, esci dal nostro sito e valgono le informative di quei servizi.',
      ],
    },
    {
      title: 'Per quanto tempo li conserviamo',
      body: [
        'Conserviamo i dati di contatto per il tempo necessario a rispondere alla tua richiesta e, se si instaura un rapporto, per la durata prevista dalla legge. I dati di navigazione anonimi non sono riferibili a una persona.',
      ],
    },
    {
      title: 'I tuoi diritti',
      body: [
        'Puoi chiedere in qualsiasi momento accesso, rettifica, cancellazione, limitazione od opposizione al trattamento, oltre alla portabilità dei dati, scrivendo all’indirizzo email indicato qui sotto.',
        'Hai inoltre il diritto di proporre reclamo al Garante per la protezione dei dati personali (www.garanteprivacy.it).',
      ],
    },
  ],
}

const en: LegalContent = {
  title: 'Privacy Policy',
  intro:
    'This notice explains how we handle the personal data of people who visit this website and contact us, in accordance with Regulation (EU) 2016/679 (GDPR).',
  sections: [
    {
      title: 'What data we process',
      body: [
        'Contact details you give us voluntarily: if you email us, call us or message us on WhatsApp, we process your name, phone number, email address and the content of your message.',
        'Browsing data: the website records, anonymously and in aggregate, which pages are viewed (for example how many times a property page was opened). We do not store your IP address or any data that could identify you.',
        'Reserved-area users: for authorised staff we process email and login credentials, handled by a dedicated authentication service.',
      ],
    },
    {
      title: 'Why we process it and on what basis',
      body: [
        'To answer your enquiries about properties and services (pre-contractual steps requested by you).',
        'To run our real-estate brokerage business and comply with legal obligations (legal obligation).',
        'To understand, anonymously, which pages are most useful so we can improve the site (legitimate interest).',
      ],
    },
    {
      title: 'Who we share it with',
      body: [
        'We do not sell your data. It may be processed by providers of technical services (website hosting and database) acting as data processors, and by professionals who assist us, bound by confidentiality.',
        'If you use the WhatsApp or Google Maps links, you leave our site and those services’ own notices apply.',
      ],
    },
    {
      title: 'How long we keep it',
      body: [
        'We keep contact details for as long as needed to answer your request and, if a relationship begins, for the period required by law. Anonymous browsing data cannot be linked to a person.',
      ],
    },
    {
      title: 'Your rights',
      body: [
        'You can ask at any time for access, rectification, erasure, restriction or objection, as well as data portability, by writing to the email address below.',
        'You also have the right to lodge a complaint with the Italian data protection authority (www.garanteprivacy.it).',
      ],
    },
  ],
}

export default function PrivacyPage() {
  return <LegalPage it={it} en={en} />
}

import './globals.css'
import './home.css'
import LanguageGateWrapper from './LanguageGateWrapper'
import FixedHeader from './components/FixedHeader'
import SiteAdminLayer from './components/SiteAdminLayer'
import { AdminDrawerProvider } from './context/AdminDrawerContext'
import { EditModeProvider } from './context/EditModeContext'
import type { Metadata, Viewport } from 'next'
import { isAdminSession } from '@/lib/adminSession'

// Caratteri serviti dal sito stesso (pacchetti @fontsource): più veloci e senza chiamate a Google.
import '@fontsource/manrope/latin-400.css'
import '@fontsource/manrope/latin-500.css'
import '@fontsource/manrope/latin-600.css'
import '@fontsource/manrope/latin-700.css'
import '@fontsource/manrope/latin-800.css'
import '@fontsource/playfair-display/latin-600.css'
import '@fontsource/playfair-display/latin-700.css'
import '@fontsource/playfair-display/latin-800.css'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://agenzia-2026.vercel.app'
const SITE_DESCRIPTION =
  'Agenzia immobiliare nel cuore del Monferrato: case, cascinali e appartamenti selezionati con attenzione. Vendita, acquisto e consulenza sul territorio.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Agenzia Immobiliare Monferrato – Case e cascinali in vendita e affitto',
    template: '%s | Agenzia Immobiliare Monferrato',
  },
  description: SITE_DESCRIPTION,
  applicationName: 'Agenzia Immobiliare Monferrato',
  openGraph: {
    type: 'website',
    locale: 'it_IT',
    siteName: 'Agenzia Immobiliare Monferrato',
    title: 'Agenzia Immobiliare Monferrato',
    description: SITE_DESCRIPTION,
    images: [{ url: '/images/hero/sfondo-home.jpg', width: 1600, height: 900, alt: 'Colline e vigneti del Monferrato' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Agenzia Immobiliare Monferrato',
    description: SITE_DESCRIPTION,
    images: ['/images/hero/sfondo-home.jpg'],
  },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0c0c0a',
}

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'RealEstateAgent',
  name: 'Agenzia Immobiliare Monferrato',
  url: SITE_URL,
  image: `${SITE_URL}/images/logo/Logo_agenzia_scontornato.png`,
  telephone: '+39 333 239 7206',
  email: 'info@agenziamonferrato.it',
  areaServed: { '@type': 'AdministrativeArea', name: 'Monferrato, Piemonte' },
  address: { '@type': 'PostalAddress', addressRegion: 'Piemonte', addressCountry: 'IT' },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '12:00',
    },
  ],
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const isAdmin = await isAdminSession()

  return (
    <html lang="it" data-scroll-behavior="smooth">
      <body suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <EditModeProvider isAdmin={isAdmin}>
          <AdminDrawerProvider>
            <SiteAdminLayer />
            <FixedHeader />
            <main className="min-h-screen">
              <LanguageGateWrapper>{children}</LanguageGateWrapper>
            </main>
          </AdminDrawerProvider>
        </EditModeProvider>
      </body>
    </html>
  )
}

import Link from 'next/link'
import { listPagesSummary } from '@/lib/cms/serverApi'
import { PAGE_CATALOG } from '@/lib/cms/defaults'
import SeedAllButton from './SeedAllButton'

export const dynamic = 'force-dynamic'

export default async function BuilderIndex() {
  const pages = await listPagesSummary()
  return (
    <>
      <div style={{ marginBottom: '1.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <span className="eyebrow eyebrow-accent">Editor visuale</span>
          <h1 className="section-title" style={{ margin: '.4rem 0 0' }}>
            <span className="title-black">Builder</span>{' '}
            <span className="title-orange">CMS</span>
          </h1>
          <p style={{ color: 'var(--mid)', maxWidth: '38rem', marginTop: '.5rem' }}>
            Gestisci tutte le pagine del sito: testi, blocchi, layout e pubblicazione. Le modifiche restano in bozza
            finché non clicchi su <strong>Pubblica</strong>. La home è <strong>home</strong> in elenco; usa{' '}
            <strong>Anteprima grande</strong> nell’editor per vedere quasi a tutto schermo.
          </p>
        </div>
        <SeedAllButton />
      </div>
      <div
        style={{
          display: 'grid',
          gap: '1rem',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        }}
      >
        {pages.map((page) => {
          const cat = PAGE_CATALOG.find((c) => c.slug === page.slug)
          return (
            <Link
              key={page.slug}
              href={`/admin/builder/${page.slug}`}
              style={{
                display: 'block',
                background: '#fff',
                border: '1.5px solid var(--line)',
                borderRadius: '1.25rem',
                padding: '1.4rem 1.5rem',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'border-color .18s, transform .18s',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '.3rem' }}>
                <span
                  style={{
                    fontFamily: 'Syne, sans-serif',
                    fontSize: '.66rem',
                    fontWeight: 700,
                    letterSpacing: '.08em',
                    textTransform: 'uppercase',
                    color: '#c4622d',
                  }}
                >
                  {page.slug}
                </span>
                <span
                  style={{
                    fontSize: '.7rem',
                    color: page.hasPublished ? '#36774b' : '#a8a39c',
                  }}
                >
                  {page.hasPublished ? '● Pubblicata' : '○ Bozza'}
                </span>
              </div>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.1rem', margin: '0 0 .5rem' }}>
                {page.title || cat?.title || page.slug}
              </h3>
              {(page.description || cat?.description) && (
                <p style={{ color: 'var(--mid)', fontSize: '.86rem', margin: 0, lineHeight: 1.55 }}>
                  {page.description || cat?.description}
                </p>
              )}
              {cat?.route && (
                <p style={{ color: '#a8a39c', fontSize: '.74rem', margin: '.7rem 0 0', fontFamily: 'monospace' }}>
                  {cat.route}
                </p>
              )}
            </Link>
          )
        })}
      </div>
    </>
  )
}

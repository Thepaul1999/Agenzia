import Link from 'next/link'
import { createClient } from '@/lib/server'

export const revalidate = 60

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [{ data: immobili }, { data: topViews }] = await Promise.all([
    supabase
      .from('immobili')
      .select('id, pubblicato, featured, viste')
      .order('created_at', { ascending: false }),
    supabase
      .from('immobili')
      .select('id, titolo, citta, viste')
      .order('viste', { ascending: false })
      .limit(3),
  ])

  const list = immobili ?? []
  const totalViews = list.reduce((s, i) => s + (i.viste ?? 0), 0)
  const published = list.filter(i => i.pubblicato).length
  const featured  = list.filter(i => i.featured).length

  return (
    <>
      <style>{`
        .dash-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px,1fr)); gap: 1rem; margin-bottom: 2.5rem; }
        .dash-card { background: #fff; border: 1.5px solid var(--line); border-radius: 18px; padding: 1.5rem 1.6rem; }
        .dash-n { font-family: 'Syne',sans-serif; font-size: 2.4rem; font-weight: 800; color: var(--ink); line-height: 1; }
        .dash-l { font-size: .78rem; color: var(--mid); margin-top: .35rem; }
        .dash-actions { display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 2.5rem; }
        .dash-top { background: #fff; border: 1.5px solid var(--line); border-radius: 18px; overflow: hidden; }
        .dash-top-head { padding: 1.2rem 1.6rem; border-bottom: 1px solid var(--line); }
        .dash-top-title { font-family: 'Syne',sans-serif; font-size: .78rem; font-weight: 700; letter-spacing: .07em; text-transform: uppercase; color: var(--ink); margin: 0; }
        .dash-top-row { display: flex; align-items: center; justify-content: space-between; padding: .9rem 1.6rem; border-bottom: 1px solid var(--line); font-size: .88rem; }
        .dash-top-row:last-child { border-bottom: none; }
        .dash-top-prop { font-weight: 600; color: var(--ink); }
        .dash-top-city { color: var(--mid); font-size: .8rem; }
        .dash-top-views { font-family: 'Syne',sans-serif; font-weight: 800; font-size: .95rem; color: var(--tc); }
      `}</style>

      <div style={{ marginBottom: '2.2rem' }}>
        <span className="eyebrow eyebrow-accent">Benvenuto</span>
        <h1 className="section-title" style={{ margin: '.4rem 0 0' }}>
          <span className="title-black">Dashboard</span>{' '}
          <span className="title-orange">Admin</span>
        </h1>
      </div>

      {/* Stats */}
      <div className="dash-grid">
        {[
          { n: list.length, l: 'Immobili totali' },
          { n: published, l: 'Pubblicati' },
          { n: featured, l: 'In evidenza' },
          { n: totalViews, l: 'Visite totali' },
        ].map(s => (
          <div key={s.l} className="dash-card">
            <div className="dash-n">{s.n}</div>
            <div className="dash-l">{s.l}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="dash-actions">
        <Link href="/admin/immobili" className="btn-tc" style={{ textDecoration: 'none', fontSize: '.7rem' }}>
          Gestisci immobili →
        </Link>
        <Link href="/admin/stats" className="btn-ghost" style={{ textDecoration: 'none', fontSize: '.7rem' }}>
          Vedi statistiche →
        </Link>
      </div>

      {/* Top viewed */}
      {(topViews ?? []).length > 0 && (
        <div className="dash-top">
          <div className="dash-top-head">
            <p className="dash-top-title">Immobili più visti</p>
          </div>
          {(topViews ?? []).map(item => (
            <div key={item.id} className="dash-top-row">
              <div>
                <p className="dash-top-prop">{item.titolo}</p>
                {item.citta && <p className="dash-top-city">{item.citta}</p>}
              </div>
              <span className="dash-top-views">{item.viste ?? 0} visite</span>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

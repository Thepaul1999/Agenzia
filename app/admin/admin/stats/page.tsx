import Link from 'next/link'
import { createClient } from '@/lib/server'

export const revalidate = 30

export default async function StatsPage() {
  const supabase = await createClient()

  const [
    { data: immobili },
    { data: today },
    { data: week },
    { data: month },
    { count: totalSiteVisits },
  ] = await Promise.all([
    // Property views
    supabase
      .from('immobili')
      .select('id, titolo, citta, viste, featured, pubblicato')
      .order('viste', { ascending: false }),

    // Site visits today
    supabase
      .from('visite_sito')
      .select('id', { count: 'exact', head: true })
      .gte('visited_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),

    // Site visits last 7 days
    supabase
      .from('visite_sito')
      .select('id', { count: 'exact', head: true })
      .gte('visited_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),

    // Site visits last 30 days
    supabase
      .from('visite_sito')
      .select('id', { count: 'exact', head: true })
      .gte('visited_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),

    // Total site visits ever
    supabase
      .from('visite_sito')
      .select('id', { count: 'exact', head: true }),
  ])

  const list = immobili ?? []
  const maxViews = Math.max(...list.map((i) => i.viste ?? 0), 1)
  const totalPropertyViews = list.reduce((s, i) => s + (i.viste ?? 0), 0)

  return (
    <>
      <style>{`
        .stats-hero { margin-bottom: 2.5rem; }
        .stats-kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
          margin-bottom: 2.5rem;
        }
        .stats-kpi {
          background: #fff;
          border: 1.5px solid var(--line);
          border-radius: 18px;
          padding: 1.4rem 1.6rem;
        }
        .stats-kpi-n {
          font-family: 'Syne', sans-serif;
          font-size: 2.2rem;
          font-weight: 800;
          color: var(--ink);
          line-height: 1;
        }
        .stats-kpi-n.accent { color: var(--tc); }
        .stats-kpi-l {
          font-size: .75rem;
          color: var(--mid);
          margin-top: .3rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: .05em;
          font-family: 'Syne', sans-serif;
        }

        .stats-section-title {
          font-family: 'Syne', sans-serif;
          font-size: .72rem;
          font-weight: 800;
          letter-spacing: .09em;
          text-transform: uppercase;
          color: var(--mid);
          margin: 0 0 1rem;
          padding-bottom: .65rem;
          border-bottom: 1.5px solid var(--line);
        }

        .stats-list { display: flex; flex-direction: column; gap: .7rem; margin-bottom: 3rem; }

        .stats-row {
          background: #fff;
          border: 1.5px solid var(--line);
          border-radius: 14px;
          padding: 1rem 1.4rem;
          display: grid;
          grid-template-columns: 1.4rem 1fr auto;
          align-items: center;
          gap: 1.2rem;
          transition: box-shadow .2s, transform .18s;
        }
        .stats-row:hover { box-shadow: 0 4px 18px rgba(0,0,0,.06); transform: translateY(-1px); }

        .stats-rank {
          font-family: 'Syne', sans-serif;
          font-size: .7rem;
          font-weight: 800;
          color: var(--tc);
        }

        .stats-prop-title {
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: .9rem;
          color: var(--ink);
          margin: 0 0 .1rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .stats-prop-city { font-size: .76rem; color: var(--mid); margin: 0; }

        .stats-views-wrap { display: flex; align-items: center; gap: .9rem; flex-shrink: 0; }
        .stats-bar { width: 100px; height: 6px; background: var(--line); border-radius: 999px; overflow: hidden; }
        .stats-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--tc-dk), var(--tc));
          border-radius: 999px;
          transition: width .7s cubic-bezier(.22,.68,0,1.2);
        }
        .stats-views-n {
          font-family: 'Syne', sans-serif;
          font-size: .9rem;
          font-weight: 800;
          color: var(--ink);
          min-width: 36px;
          text-align: right;
        }
        .stats-views-label { font-size: .65rem; color: var(--mid); display: block; text-align: right; }

        .stats-empty {
          text-align: center;
          padding: 3rem 1rem;
          border: 1.5px dashed var(--line);
          border-radius: 18px;
          background: var(--warm);
          color: var(--mid);
          font-size: .88rem;
        }

        .badge-sm {
          display: inline-flex;
          align-items: center;
          padding: .15rem .5rem;
          border-radius: 999px;
          font-family: 'Syne', sans-serif;
          font-size: .58rem;
          font-weight: 700;
          letter-spacing: .05em;
          text-transform: uppercase;
          margin-left: .4rem;
        }
        .badge-draft { background: rgba(0,0,0,.07); color: var(--mid); }
        .badge-featured { background: rgba(196,98,45,.12); color: var(--tc); }

        @media (max-width: 640px) {
          .stats-row { grid-template-columns: 1.4rem 1fr; }
          .stats-views-wrap { display: none; }
          .stats-views-n { display: block; text-align: left; font-size: .8rem; }
        }
      `}</style>

      {/* Page title */}
      <div className="stats-hero">
        <span className="eyebrow eyebrow-accent">Analytics</span>
        <h1 className="section-title" style={{ margin: '.4rem 0 .6rem' }}>
          <span className="title-black">Statistiche</span>{' '}
          <span className="title-orange">visite</span>
        </h1>
        <p style={{ color: 'var(--mid)', fontSize: '.88rem', margin: 0 }}>
          Quante persone hanno visitato il sito e quali immobili hanno guardato.
        </p>
      </div>

      {/* ── KPI: visite sito ── */}
      <p className="stats-section-title">Visite al sito</p>
      <div className="stats-kpi-grid">
        {[
          { n: today ?? 0, l: 'Oggi', accent: true },
          { n: week ?? 0, l: 'Ultimi 7 giorni', accent: false },
          { n: month ?? 0, l: 'Ultimi 30 giorni', accent: false },
          { n: totalSiteVisits ?? 0, l: 'Totale visite', accent: false },
        ].map((k) => (
          <div key={k.l} className="stats-kpi">
            <div className={`stats-kpi-n${k.accent ? ' accent' : ''}`}>{Number(k.n)}</div>
            <div className="stats-kpi-l">{k.l}</div>
          </div>
        ))}
      </div>

      {/* ── KPI: immobili ── */}
      <p className="stats-section-title">Panoramica immobili</p>
      <div className="stats-kpi-grid" style={{ marginBottom: '2.5rem' }}>
        {[
          { n: list.length, l: 'Totale immobili' },
          { n: list.filter((i) => i.pubblicato).length, l: 'Pubblicati' },
          { n: list.filter((i) => i.featured).length, l: 'In evidenza' },
          { n: totalPropertyViews, l: 'Visite totali' },
        ].map((k) => (
          <div key={k.l} className="stats-kpi">
            <div className="stats-kpi-n">{Number(k.n)}</div>
            <div className="stats-kpi-l">{k.l}</div>
          </div>
        ))}
      </div>

      {/* ── Rankings immobili ── */}
      <p className="stats-section-title">Immobili per visite</p>

      {list.length === 0 ? (
        <div className="stats-empty">
          Nessun immobile ancora. Aggiungili dalla{' '}
          <Link href="/admin/immobili/gestione" style={{ color: 'var(--tc)', fontWeight: 600 }}>
            sezione immobili
          </Link>
          .
        </div>
      ) : (
        <div className="stats-list">
          {list.map((item, idx) => {
            const pct = maxViews > 0 ? Math.round(((item.viste ?? 0) / maxViews) * 100) : 0
            return (
              <div key={item.id} className="stats-row">
                <span className="stats-rank">#{idx + 1}</span>
                <div style={{ minWidth: 0 }}>
                  <p className="stats-prop-title">
                    {item.titolo}
                    {!item.pubblicato && <span className="badge-sm badge-draft">bozza</span>}
                    {item.featured && <span className="badge-sm badge-featured">★ evidenza</span>}
                  </p>
                  {item.citta && <p className="stats-prop-city">{item.citta}</p>}
                </div>
                <div className="stats-views-wrap">
                  <div className="stats-bar">
                    <div className="stats-bar-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <div>
                    <span className="stats-views-n">{item.viste ?? 0}</span>
                    <span className="stats-views-label">visite</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div style={{ marginTop: '1rem' }}>
        <Link
          href="/admin"
          className="btn-ghost"
          style={{ textDecoration: 'none', fontSize: '.7rem' }}
        >
          ← Dashboard
        </Link>
      </div>
    </>
  )
}

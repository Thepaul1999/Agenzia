'use client'

import { Suspense, useCallback, useEffect, useState, type ComponentProps } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import UnifiedImmobileForm from '@/app/admin/immobili/UnifiedImmobileForm'

type ImmobileListRow = {
  id: string
  titolo: string
  citta: string | null
  prezzo: number | null
  featured: boolean
  pubblicato: boolean
  stato: string
  tipo_contratto: string | null
  viste: number
  slug: string
}

type ImmobileFormItem = Exclude<ComponentProps<typeof UnifiedImmobileForm>['item'], null | undefined>

function fmt(v: number | null) {
  if (v === null) return 'Su richiesta'
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v)
}

function GestioneEditorSection({
  editId,
  isNew,
  onBack,
  onReloadList,
}: {
  editId: string | null
  isNew: boolean
  onBack: () => void
  onReloadList: () => void
}) {
  const loadKey = editId ?? (isNew ? 'new' : '')
  const [item, setItem] = useState<ImmobileFormItem | null>(null)
  const [loading, setLoading] = useState(editId !== null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (isNew) {
      setItem(null)
      setLoading(false)
      setNotFound(false)
      return
    }
    if (!editId) {
      setItem(null)
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    setNotFound(false)
    fetch(`/api/admin/immobili/${editId}`)
      .then(async (res) => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? 'Errore')
        if (cancelled) return
        setItem({
          ...(data.immobile as ImmobileFormItem),
          slug: (data.immobile as ImmobileFormItem).slug ?? '',
        })
      })
      .catch(() => {
        if (!cancelled) setNotFound(true)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [editId, isNew, loadKey])

  const title = isNew ? 'Nuovo immobile' : 'Modifica immobile'
  const subtitle = isNew
    ? 'Compila i campi per aggiungere un immobile al catalogo'
    : loading
      ? 'Caricamento…'
      : notFound || !item
        ? 'Immobile non trovato'
        : item.titolo

  return (
    <>
      <style>{`
        body { background: #f5f3f0; }
        .edit-page-wrap { max-width: 780px; margin: 0 auto 2rem; }
        .edit-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem; flex-wrap: wrap; }
        .edit-back {
          display: inline-flex; align-items: center; gap: .4rem; font-family: 'Syne', sans-serif; font-size: .7rem; font-weight: 700;
          letter-spacing: .06em; text-transform: uppercase; color: #7c7770; text-decoration: none; padding: .4rem .9rem;
          border-radius: 999px; border: 1.5px solid #e9e4dd; transition: background .18s, color .18s; cursor: pointer; background: #fff;
        }
        .edit-back:hover { background: #0c0c0a; color: #fff; border-color: #0c0c0a; }
        .edit-title { font-family: 'Syne', sans-serif; font-size: 1.5rem; font-weight: 800; color: #0c0c0a; margin: 0; }
        .edit-subtitle { font-size: .88rem; color: #7c7770; margin: .2rem 0 0; }
        .edit-card { background: #fff; border-radius: 1.5rem; border: 1.5px solid #e9e4dd; padding: 2rem; }
      `}</style>
      <div className="edit-page-wrap">
        <div className="edit-header">
          <button type="button" className="edit-back" onClick={onBack}>
            ← Elenco gestione
          </button>
          <div>
            <h1 className="edit-title">{title}</h1>
            <p className="edit-subtitle">{subtitle}</p>
          </div>
        </div>
        <div className="edit-card">
          {loading ? (
            <p style={{ color: '#7c7770', fontSize: '.9rem' }}>Caricamento dati immobile…</p>
          ) : editId !== null && (notFound || !item) ? (
            <>
              <p style={{ color: '#c0392b', fontSize: '.9rem' }}>Immobile non trovato.</p>
              <button type="button" className="edit-back" style={{ marginTop: '1rem' }} onClick={onBack}>
                Torna all&apos;elenco
              </button>
            </>
          ) : (
            <UnifiedImmobileForm item={item} onPersisted={onReloadList} />
          )}
        </div>
      </div>
    </>
  )
}

function AdminImmobiliGestioneInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('id')
  const isNew = searchParams.get('new') === '1'

  const [immobili, setImmobili] = useState<ImmobileListRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const editorOpen = Boolean(isNew || (editId && editId.trim() !== ''))

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/immobili')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Errore')
      setImmobili(data.immobili)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Errore')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function toggleFeatured(item: ImmobileListRow) {
    setBusyId(item.id)
    try {
      const res = await fetch(`/api/admin/immobili/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: !item.featured }),
      })
      if (res.ok) setImmobili((prev) => prev.map((x) => (x.id === item.id ? { ...x, featured: !x.featured } : x)))
    } finally {
      setBusyId(null)
    }
  }

  async function togglePubblicato(item: ImmobileListRow) {
    setBusyId(item.id)
    try {
      const res = await fetch(`/api/admin/immobili/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pubblicato: !item.pubblicato }),
      })
      if (res.ok) setImmobili((prev) => prev.map((x) => (x.id === item.id ? { ...x, pubblicato: !x.pubblicato } : x)))
    } finally {
      setBusyId(null)
    }
  }

  async function toggleStato(item: ImmobileListRow) {
    const nuovoStato = item.stato === 'venduto' ? 'disponibile' : 'venduto'
    setBusyId(item.id)
    try {
      const res = await fetch(`/api/admin/immobili/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stato: nuovoStato }),
      })
      if (res.ok) setImmobili((prev) => prev.map((x) => (x.id === item.id ? { ...x, stato: nuovoStato } : x)))
    } finally {
      setBusyId(null)
    }
  }

  async function handleDelete(item: ImmobileListRow) {
    if (!confirm(`Eliminare definitivamente "${item.titolo}"? L'azione non è reversibile.`)) return
    setDeletingId(item.id)
    try {
      const res = await fetch(`/api/admin/immobili/${item.id}`, { method: 'DELETE' })
      if (res.ok) {
        setImmobili((prev) => prev.filter((x) => x.id !== item.id))
      } else {
        const data = await res.json()
        alert(`Errore eliminazione: ${data.error ?? 'sconosciuto'}`)
      }
    } finally {
      setDeletingId(null)
    }
  }

  const disponibili = immobili.filter((i) => i.stato !== 'venduto')
  const venduti = immobili.filter((i) => i.stato === 'venduto')
  const totalViews = immobili.reduce((s, i) => s + (i.viste ?? 0), 0)

  function goEditorNew() {
    router.push('/admin/immobili/gestione?new=1')
  }

  function goEditor(id: string) {
    router.push(`/admin/immobili/gestione?id=${encodeURIComponent(id)}`)
  }

  function closeEditor() {
    router.push('/admin/immobili/gestione')
  }

  if (editorOpen) {
    const idNorm = editId?.trim() || null
    return (
      <>
        <GestioneEditorSection
          editId={isNew ? null : idNorm}
          isNew={isNew}
          onBack={closeEditor}
          onReloadList={load}
        />
      </>
    )
  }

  return (
    <>
      <style>{`
        .adm-card { background:#fff;border:1.5px solid var(--line);border-radius:18px;padding:1.4rem 1.6rem; }
        .adm-stat-row { display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:.9rem;margin-bottom:2.5rem; }
        .adm-stat-n { font-family:'Syne',sans-serif;font-size:2rem;font-weight:800;color:var(--ink);line-height:1; }
        .adm-stat-l { font-size:.78rem;color:var(--mid);margin-top:.3rem; }
        .adm-section-title { font-family:'Syne',sans-serif;font-size:.72rem;font-weight:800;letter-spacing:.09em;text-transform:uppercase;color:var(--mid);margin:2rem 0 .8rem;padding-bottom:.5rem;border-bottom:1.5px solid var(--line); }
        .adm-table { width:100%;border-collapse:collapse; }
        .adm-table th { font-family:'Syne',sans-serif;font-size:.6rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--mid);text-align:left;padding:.6rem .9rem;border-bottom:1.5px solid var(--line); }
        .adm-table td { padding:.9rem .9rem;font-size:.85rem;color:var(--ink);border-bottom:1px solid var(--line);vertical-align:middle; }
        .adm-table tr:last-child td { border-bottom:none; }
        .adm-table tr:hover td { background:var(--warm); }
        .badge { display:inline-flex;align-items:center;padding:.2rem .6rem;border-radius:999px;font-family:'Syne',sans-serif;font-size:.58rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase; }
        .badge-green { background:rgba(39,174,96,.12);color:#1e8449; }
        .badge-gray  { background:rgba(0,0,0,.07);color:var(--mid); }
        .badge-orange{ background:rgba(196,98,45,.12);color:var(--tc); }
        .badge-red   { background:rgba(192,57,43,.1);color:#c0392b; }
        .adm-actions { display:flex;gap:.4rem;align-items:center;flex-wrap:wrap; }
        .adm-btn { display:inline-flex;align-items:center;padding:.34rem .75rem;border-radius:999px;border:1.5px solid;font-family:'Syne',sans-serif;font-size:.6rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;cursor:pointer;transition:background .18s,color .18s;white-space:nowrap;text-decoration:none; }
        .adm-btn:disabled { opacity:.5;cursor:not-allowed; }
        .adm-btn-edit { background:var(--ink);color:#fff;border-color:var(--ink); }
        .adm-btn-edit:hover { background:var(--tc);border-color:var(--tc); }
        .adm-btn-feature { background:transparent;color:var(--tc);border-color:var(--tc); }
        .adm-btn-feature:hover { background:var(--tc);color:#fff; }
        .adm-btn-unfeature { background:transparent;color:var(--mid);border-color:var(--line); }
        .adm-btn-pub { background:transparent;color:#27ae60;border-color:rgba(39,174,96,.4); }
        .adm-btn-pub:hover { background:#27ae60;color:#fff;border-color:#27ae60; }
        .adm-btn-unpub { background:transparent;color:var(--mid);border-color:var(--line); }
        .adm-btn-sold { background:transparent;color:#c0392b;border-color:rgba(192,57,43,.3); }
        .adm-btn-sold:hover { background:#c0392b;color:#fff;border-color:#c0392b; }
        .adm-btn-unsold { background:transparent;color:#27ae60;border-color:rgba(39,174,96,.4); }
        .adm-btn-delete { background:transparent;color:#c0392b;border-color:rgba(192,57,43,.25); }
        .adm-btn-delete:hover { background:#c0392b;color:#fff;border-color:#c0392b; }
        @media(max-width:700px){.adm-table th:nth-child(3),.adm-table td:nth-child(3){display:none}}
      `}</style>

      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '2rem',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <span className="eyebrow eyebrow-accent">Area Admin</span>
          <h1 className="section-title" style={{ margin: '.4rem 0 0' }}>
            <span className="title-black">Gestione</span> <span className="title-orange">Immobili</span>
          </h1>
        </div>
        <Link href="/admin/statistiche" className="btn-ghost" style={{ textDecoration: 'none', fontSize: '.7rem' }}>
          Statistiche
        </Link>
      </div>

      <div className="adm-stat-row">
        {[
          { n: immobili.length, l: 'Totale' },
          { n: immobili.filter((i) => i.pubblicato).length, l: 'Pubblicati' },
          { n: disponibili.length, l: 'Disponibili' },
          { n: venduti.length, l: 'Venduti' },
          { n: immobili.filter((i) => i.featured).length, l: 'In evidenza' },
          { n: totalViews, l: 'Visite totali' },
        ].map((s) => (
          <div key={s.l} className="adm-card">
            <div className="adm-stat-n">{s.n}</div>
            <div className="adm-stat-l">{s.l}</div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={goEditorNew}
        className="adm-btn"
        style={{
          position: 'fixed',
          right: 20,
          bottom: 20,
          zIndex: 250,
          background: 'var(--tc)',
          borderColor: 'var(--tc)',
          color: '#fff',
          padding: '.8rem 1rem',
          borderRadius: 999,
        }}
      >
        + Crea immobile
      </button>

      <p className="adm-section-title">Disponibili ({disponibili.length})</p>
      <ImmobiliTable
        items={disponibili}
        loading={loading}
        error={error}
        busyId={busyId}
        deletingId={deletingId}
        emptyMsg="Nessun immobile disponibile."
        onEdit={(i) => goEditor(i.id)}
        onToggleFeatured={toggleFeatured}
        onTogglePubblicato={togglePubblicato}
        onToggleStato={toggleStato}
        onDelete={handleDelete}
      />

      <p className="adm-section-title" style={{ marginTop: '2.5rem' }}>
        Venduti ({venduti.length})
      </p>
      <ImmobiliTable
        items={venduti}
        loading={loading}
        error={error}
        busyId={busyId}
        deletingId={deletingId}
        emptyMsg="Nessun immobile venduto."
        onEdit={(i) => goEditor(i.id)}
        onToggleFeatured={toggleFeatured}
        onTogglePubblicato={togglePubblicato}
        onToggleStato={toggleStato}
        onDelete={handleDelete}
      />
    </>
  )
}

function ImmobiliTable({
  items,
  loading,
  error,
  busyId,
  deletingId,
  emptyMsg,
  onEdit,
  onToggleFeatured,
  onTogglePubblicato,
  onToggleStato,
  onDelete,
}: {
  items: ImmobileListRow[]
  loading: boolean
  error: string
  busyId: string | null
  deletingId: string | null
  emptyMsg: string
  onEdit: (i: ImmobileListRow) => void
  onToggleFeatured: (i: ImmobileListRow) => void
  onTogglePubblicato: (i: ImmobileListRow) => void
  onToggleStato: (i: ImmobileListRow) => void
  onDelete: (i: ImmobileListRow) => void
}) {
  if (loading)
    return <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--mid)', fontSize: '.88rem' }}>Caricamento…</p>
  if (error) return <p style={{ padding: '1rem', color: '#c0392b', fontSize: '.88rem' }}>{error}</p>
  if (items.length === 0) return <p style={{ padding: '1rem', color: 'var(--mid)', fontSize: '.88rem' }}>{emptyMsg}</p>

  return (
    <div className="adm-card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table className="adm-table">
          <thead>
            <tr>
              <th>Titolo</th>
              <th>Città</th>
              <th>Prezzo</th>
              <th>Stato pub.</th>
              <th>Visite</th>
              <th>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>
                  <span style={{ fontWeight: 600 }}>{item.titolo}</span>
                  {item.featured && (
                    <span className="badge badge-orange" style={{ marginLeft: '.4rem' }}>
                      ★
                    </span>
                  )}
                </td>
                <td style={{ color: 'var(--mid)' }}>{item.citta ?? '—'}</td>
                <td style={{ fontWeight: 700 }}>{fmt(item.prezzo)}</td>
                <td>
                  <div style={{ display: 'flex', gap: '.3rem', flexWrap: 'wrap' }}>
                    <span className={`badge ${item.pubblicato ? 'badge-green' : 'badge-gray'}`}>{item.pubblicato ? 'Pub.' : 'Bozza'}</span>
                    {item.tipo_contratto && (
                      <span className={`badge ${item.tipo_contratto === 'affitto' ? 'badge-orange' : 'badge-gray'}`}>
                        {item.tipo_contratto === 'affitto' ? 'Affitto' : 'Vendita'}
                      </span>
                    )}
                  </div>
                </td>
                <td style={{ fontWeight: 600, color: 'var(--tc)' }}>{item.viste ?? 0}</td>
                <td>
                  <div className="adm-actions">
                    <button type="button" className="adm-btn adm-btn-edit" onClick={() => onEdit(item)}>
                      Modifica
                    </button>
                    <button
                      type="button"
                      className={`adm-btn ${item.pubblicato ? 'adm-btn-unpub' : 'adm-btn-pub'}`}
                      disabled={busyId === item.id}
                      onClick={() => onTogglePubblicato(item)}
                    >
                      {item.pubblicato ? 'Nascondi' : 'Pubblica'}
                    </button>
                    <button
                      type="button"
                      className={`adm-btn ${item.featured ? 'adm-btn-unfeature' : 'adm-btn-feature'}`}
                      disabled={busyId === item.id}
                      onClick={() => onToggleFeatured(item)}
                    >
                      {item.featured ? '★ Togli' : '★ Evidenzia'}
                    </button>
                    <button
                      type="button"
                      className={`adm-btn ${item.stato === 'venduto' ? 'adm-btn-unsold' : 'adm-btn-sold'}`}
                      disabled={busyId === item.id}
                      onClick={() => onToggleStato(item)}
                    >
                      {item.stato === 'venduto' ? '→ Disponibile' : '→ Venduto'}
                    </button>
                    <button
                      type="button"
                      className="adm-btn adm-btn-delete"
                      disabled={deletingId === item.id}
                      onClick={() => onDelete(item)}
                    >
                      {deletingId === item.id ? '…' : 'Elimina'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function AdminImmobiliPage() {
  return (
    <Suspense fallback={<p style={{ padding: '3rem', textAlign: 'center', color: 'var(--mid)' }}>Caricamento…</p>}>
      <AdminImmobiliGestioneInner />
    </Suspense>
  )
}

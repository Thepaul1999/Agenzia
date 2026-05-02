'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import MultiPhotoUpload from '@/app/admin/MultiPhotoUpload'

type Immobile = {
  id: string
  titolo: string
  citta: string | null
  prezzo: number | null
  featured: boolean
  pubblicato: boolean
  stato: string          // 'disponibile' | 'venduto'
  tipo_contratto: string | null // 'vendita' | 'affitto'
  viste: number
  slug: string
  descrizione: string | null
  immaginecopertina: string | null
  indirizzo: string | null
  lat: number | null
  lng: number | null
  posizione_approssimativa: boolean
  mq: number | null
  locali: number | null
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''

function imgUrl(path: string | null) {
  if (!path) return null
  if (path.startsWith('http') || path.startsWith('/')) return path
  return `${SUPABASE_URL}/storage/v1/object/public/immobili/${path}`
}

function fmt(v: number | null) {
  if (v === null) return 'Su richiesta'
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v)
}

/* ── Edit modal ─────────────────────────────────────────────── */
function EditModal({ item, onClose, onSaved }: {
  item: Immobile
  onClose: () => void
  onSaved: (updated: Immobile) => void
}) {
  const [form, setForm] = useState({
    titolo: item.titolo,
    citta: item.citta ?? '',
    prezzo: item.prezzo !== null ? String(item.prezzo) : '',
    descrizione: item.descrizione ?? '',
    featured: item.featured,
    pubblicato: item.pubblicato,
    stato: item.stato ?? 'disponibile',
    tipo_contratto: item.tipo_contratto ?? 'vendita',
    indirizzo: item.indirizzo ?? '',
    lat: item.lat !== null ? String(item.lat) : '',
    lng: item.lng !== null ? String(item.lng) : '',
    posizione_approssimativa: item.posizione_approssimativa,
    mq: item.mq !== null ? String(item.mq) : '',
    locali: item.locali !== null ? String(item.locali) : '',
  })
  const [foto, setFoto] = useState<File | null>(null)
  const [photos, setPhotos] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [warning, setWarning] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  // Carica foto esistenti dell'immobile
  useEffect(() => {
    async function loadPhotos() {
      try {
        const res = await fetch(`/api/admin/immobili/${item.id}/photos`)
        if (res.ok) {
          const data = await res.json()
          setPhotos(data.photos || [])
        }
      } catch (err) {
        console.error('Load photos error:', err)
      }
    }
    loadPhotos()
  }, [item.id])

  async function handleSave() {
    setSaving(true)
    setError('')
    setWarning('')
    try {
      const fd = new FormData()
      fd.append('titolo', form.titolo)
      fd.append('citta', form.citta)
      fd.append('prezzo', form.prezzo)
      fd.append('descrizione', form.descrizione)
      fd.append('featured', String(form.featured))
      fd.append('pubblicato', String(form.pubblicato))
      fd.append('stato', form.stato)
      fd.append('tipo_contratto', form.tipo_contratto)
      fd.append('indirizzo', form.indirizzo)
      fd.append('lat', form.lat)
      fd.append('lng', form.lng)
      fd.append('posizione_approssimativa', String(form.posizione_approssimativa))
      fd.append('mq', form.mq)
      fd.append('locali', form.locali)
      if (foto) fd.append('foto_copertina', foto)

      const res = await fetch(`/api/admin/immobili/${item.id}`, { method: 'PATCH', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Errore salvataggio')

      if (data.warning) {
        setWarning(data.warning)
      }

      onSaved({
        ...item,
        titolo: form.titolo,
        citta: form.citta || null,
        prezzo: form.prezzo === '' ? null : Number(form.prezzo),
        descrizione: form.descrizione || null,
        featured: form.featured,
        pubblicato: form.pubblicato,
        stato: form.stato,
        tipo_contratto: form.tipo_contratto,
        indirizzo: form.indirizzo || null,
        lat: form.lat === '' ? null : Number(form.lat),
        lng: form.lng === '' ? null : Number(form.lng),
        posizione_approssimativa: form.posizione_approssimativa,
        mq: form.mq === '' ? null : Number(form.mq),
        locali: form.locali === '' ? null : Number(form.locali),
      })
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Errore')
    } finally {
      setSaving(false)
    }
  }

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div style={{ position:'fixed',inset:0,zIndex:200,background:'rgba(12,12,10,.55)',display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem',backdropFilter:'blur(4px)' }} onClick={onClose}>
      <div style={{ background:'#fff',borderRadius:20,padding:'1.75rem',width:'100%',maxWidth:580,maxHeight:'92vh',overflowY:'auto',boxShadow:'0 32px 80px rgba(0,0,0,.22)',animation:'modalIn .22s ease' }} onClick={e => e.stopPropagation()}>
        <style>{`@keyframes modalIn{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}`}</style>

        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1.4rem' }}>
          <h2 style={{ margin:0,fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'1.05rem',color:'var(--ink)' }}>Modifica immobile</h2>
          <button onClick={onClose} style={{ background:'none',border:'none',cursor:'pointer',fontSize:'1.5rem',color:'var(--mid)',lineHeight:1 }}>×</button>
        </div>

        <div style={{ display:'flex',flexDirection:'column',gap:'.9rem' }}>
          {/* Foto copertina */}
          <div>
            <Lbl>Foto copertina</Lbl>
            {item.immaginecopertina && !foto && (
              <img src={imgUrl(item.immaginecopertina)!} alt="" style={{ width:'100%',height:140,objectFit:'cover',borderRadius:10,marginBottom:'.5rem' }} />
            )}
            {foto && <p style={{ fontSize:'.75rem',color:'var(--tc)',margin:'0 0 .4rem' }}>✓ {foto.name}</p>}
            <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={e => setFoto(e.target.files?.[0] ?? null)} />
            <button type="button" onClick={() => fileRef.current?.click()} style={btnGhostStyle}>
              {foto ? 'Cambia foto' : '+ Carica foto'}
            </button>
          </div>

          {/* Galleria multi-foto */}
          <MultiPhotoUpload
            immobileId={item.id}
            photos={photos}
            onPhotosChange={setPhotos}
          />

          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'.9rem' }}>
            <div style={{ gridColumn:'1/-1' }}><Lbl>Titolo *</Lbl><Inp value={form.titolo} onChange={v => set('titolo', v)} /></div>
            <div><Lbl>Città</Lbl><Inp value={form.citta} onChange={v => set('citta', v)} placeholder="Es. Vignale Monferrato" /></div>
            <div><Lbl>Prezzo (€)</Lbl><Inp type="number" value={form.prezzo} onChange={v => set('prezzo', v)} placeholder="Lascia vuoto = Su richiesta" /></div>
            <div><Lbl>Mq</Lbl><Inp type="number" value={form.mq} onChange={v => set('mq', v)} placeholder="Es. 120" /></div>
            <div><Lbl>Locali</Lbl><Inp type="number" value={form.locali} onChange={v => set('locali', v)} placeholder="Es. 4" /></div>
            <div style={{ gridColumn:'1/-1' }}><Lbl>Descrizione</Lbl><Txta rows={3} value={form.descrizione} onChange={v => set('descrizione', v)} /></div>
          </div>

          {/* Tipo contratto + Stato */}
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'.9rem' }}>
            <div>
              <Lbl>Tipo contratto</Lbl>
              <select value={form.tipo_contratto} onChange={e => set('tipo_contratto', e.target.value)} style={{ width:'100%',border:'1.5px solid var(--line)',borderRadius:10,padding:'.6rem .9rem',fontSize:'.88rem',color:'var(--ink)',background:'#fff',outline:'none',fontFamily:'inherit' }}>
                <option value="vendita">🟠 Vendita</option>
                <option value="affitto">🔵 Affitto</option>
              </select>
            </div>
            <div>
              <Lbl>Stato immobile</Lbl>
              <select value={form.stato} onChange={e => set('stato', e.target.value)} style={{ width:'100%',border:'1.5px solid var(--line)',borderRadius:10,padding:'.6rem .9rem',fontSize:'.88rem',color:'var(--ink)',background:'#fff',outline:'none',fontFamily:'inherit' }}>
                <option value="disponibile">🟢 Disponibile</option>
                <option value="venduto">🔴 Venduto</option>
              </select>
            </div>
          </div>

          {/* Flags */}
          <div style={{ display:'flex',gap:'1.2rem',flexWrap:'wrap' }}>
            <ChkLabel checked={form.featured} onChange={v => set('featured', v)}>★ In evidenza</ChkLabel>
            <ChkLabel checked={form.pubblicato} onChange={v => set('pubblicato', v)}>Pubblicato</ChkLabel>
          </div>

          {error && <p style={{ color:'#c0392b',fontSize:'.82rem',margin:0 }}>{error}</p>}

          {warning && <p style={{ color:'#b8860b',fontSize:'.82rem',margin:'0 0 .5rem' }}>⚠️ {warning}</p>}

          <div style={{ display:'flex',gap:'.75rem',justifyContent:'flex-end',marginTop:'.25rem' }}>
            <button onClick={onClose} style={btnGhostStyle}>Annulla</button>
            <button onClick={handleSave} disabled={saving || !form.titolo.trim()} style={btnPrimaryStyle}>
              {saving ? 'Salvataggio…' : 'Salva'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── UI helpers ── */
function Lbl({ children }: { children: React.ReactNode }) {
  return <label style={{ display:'block',fontFamily:'Syne,sans-serif',fontSize:'.65rem',fontWeight:700,letterSpacing:'.07em',textTransform:'uppercase',color:'var(--mid)',marginBottom:'.3rem' }}>{children}</label>
}
function Inp({ value, onChange, placeholder, type='text' }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ width:'100%',border:'1.5px solid var(--line)',borderRadius:10,padding:'.58rem .9rem',fontSize:'.88rem',color:'var(--ink)',background:'#fff',outline:'none',fontFamily:'inherit',boxSizing:'border-box',transition:'border-color .18s' }} onFocus={e=>(e.target.style.borderColor='var(--tc)')} onBlur={e=>(e.target.style.borderColor='var(--line)')} />
}
function Txta({ value, onChange, rows=3 }: { value: string; onChange: (v: string) => void; rows?: number }) {
  return <textarea rows={rows} value={value} onChange={e => onChange(e.target.value)} style={{ width:'100%',border:'1.5px solid var(--line)',borderRadius:10,padding:'.58rem .9rem',fontSize:'.88rem',color:'var(--ink)',background:'#fff',outline:'none',fontFamily:'inherit',boxSizing:'border-box',resize:'vertical',transition:'border-color .18s' }} onFocus={e=>(e.target.style.borderColor='var(--tc)')} onBlur={e=>(e.target.style.borderColor='var(--line)')} />
}
function ChkLabel({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: React.ReactNode }) {
  return (
    <label style={{ display:'flex',alignItems:'center',gap:'.45rem',fontFamily:'Syne,sans-serif',fontSize:'.75rem',fontWeight:700,color:'var(--ink)',cursor:'pointer' }}>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
      {children}
    </label>
  )
}
const btnGhostStyle: React.CSSProperties = { display:'inline-flex',alignItems:'center',padding:'.52rem 1.1rem',borderRadius:999,border:'1.5px solid var(--line)',background:'transparent',fontFamily:'Syne,sans-serif',fontSize:'.68rem',fontWeight:700,letterSpacing:'.06em',textTransform:'uppercase',cursor:'pointer',color:'var(--ink)' }
const btnPrimaryStyle: React.CSSProperties = { display:'inline-flex',alignItems:'center',padding:'.52rem 1.3rem',borderRadius:999,border:'none',background:'var(--tc)',fontFamily:'Syne,sans-serif',fontSize:'.68rem',fontWeight:700,letterSpacing:'.06em',textTransform:'uppercase',cursor:'pointer',color:'#fff' }
const btnDangerStyle: React.CSSProperties = { ...btnGhostStyle, color:'#c0392b', borderColor:'rgba(192,57,43,.3)' }

/* ─── Main page ─────────────────────────────────────────────── */
export default function AdminImmobiliPage() {
  const [immobili, setImmobili] = useState<Immobile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState<Immobile | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

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

  useEffect(() => { load() }, [load])

  /* ── Toggle featured ── */
  async function toggleFeatured(item: Immobile) {
    setBusyId(item.id)
    try {
      const res = await fetch(`/api/admin/immobili/${item.id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ featured: !item.featured }) })
      if (res.ok) setImmobili(prev => prev.map(x => x.id === item.id ? { ...x, featured: !x.featured } : x))
    } finally { setBusyId(null) }
  }

  /* ── Toggle pubblicato ── */
  async function togglePubblicato(item: Immobile) {
    setBusyId(item.id)
    try {
      const res = await fetch(`/api/admin/immobili/${item.id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ pubblicato: !item.pubblicato }) })
      if (res.ok) setImmobili(prev => prev.map(x => x.id === item.id ? { ...x, pubblicato: !x.pubblicato } : x))
    } finally { setBusyId(null) }
  }

  /* ── Toggle stato ── */
  async function toggleStato(item: Immobile) {
    const nuovoStato = item.stato === 'venduto' ? 'disponibile' : 'venduto'
    setBusyId(item.id)
    try {
      const res = await fetch(`/api/admin/immobili/${item.id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ stato: nuovoStato }) })
      if (res.ok) setImmobili(prev => prev.map(x => x.id === item.id ? { ...x, stato: nuovoStato } : x))
    } finally { setBusyId(null) }
  }

  /* ── Delete ── */
  async function handleDelete(item: Immobile) {
    if (!confirm(`Eliminare definitivamente "${item.titolo}"? L'azione non è reversibile.`)) return
    setDeletingId(item.id)
    try {
      const res = await fetch(`/api/admin/immobili/${item.id}`, { method:'DELETE' })
      if (res.ok) {
        setImmobili(prev => prev.filter(x => x.id !== item.id))
      } else {
        const data = await res.json()
        alert('Errore eliminazione: ' + (data.error ?? 'sconosciuto'))
      }
    } finally { setDeletingId(null) }
  }

  const disponibili = immobili.filter(i => i.stato !== 'venduto')
  const venduti     = immobili.filter(i => i.stato === 'venduto')
  const totalViews  = immobili.reduce((s, i) => s + (i.viste ?? 0), 0)

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
        .create-box { padding:1.5rem 1.6rem;border-top:1px solid var(--line);background:var(--warm); }
        .create-grid { display:grid;grid-template-columns:1fr 1fr;gap:.8rem;margin-top:.8rem; }
        .create-input,.create-area { width:100%;border:1.5px solid var(--line);border-radius:10px;padding:.58rem .9rem;font-size:.86rem;color:var(--ink);background:#fff;outline:none;font-family:inherit;box-sizing:border-box; }
        .create-area { resize:vertical;min-height:70px; }
        .create-input:focus,.create-area:focus { border-color:var(--tc); }
        @media(max-width:700px){.create-grid{grid-template-columns:1fr}.adm-table th:nth-child(3),.adm-table td:nth-child(3){display:none}}
      `}</style>

      {/* Header */}
      <div style={{ display:'flex',alignItems:'flex-end',justifyContent:'space-between',gap:'1rem',marginBottom:'2rem',flexWrap:'wrap' }}>
        <div>
          <span className="eyebrow eyebrow-accent">Area Admin</span>
          <h1 className="section-title" style={{ margin:'.4rem 0 0' }}>
            <span className="title-black">Gestione</span>{' '}
            <span className="title-orange">Immobili</span>
          </h1>
        </div>
        <Link href="/admin/statistiche" className="btn-ghost" style={{ textDecoration:'none',fontSize:'.7rem' }}>📊 Statistiche</Link>
      </div>

      {/* Stats */}
      <div className="adm-stat-row">
        {[
          { n: immobili.length,                             l:'Totale' },
          { n: immobili.filter(i=>i.pubblicato).length,    l:'Pubblicati' },
          { n: disponibili.length,                          l:'Disponibili' },
          { n: venduti.length,                              l:'Venduti' },
          { n: immobili.filter(i=>i.featured).length,      l:'In evidenza' },
          { n: totalViews,                                   l:'Visite totali' },
        ].map(s => (
          <div key={s.l} className="adm-card">
            <div className="adm-stat-n">{s.n}</div>
            <div className="adm-stat-l">{s.l}</div>
          </div>
        ))}
      </div>

      {/* Floating create button — opens unified form page */}
      <Link href="/admin/immobili/gestione/new" style={{ position: 'fixed', right: 20, bottom: 20, zIndex: 250, textDecoration: 'none' }}>
        <button className="adm-btn" style={{ background: 'var(--tc)', borderColor: 'var(--tc)', color: '#fff', padding: '.8rem 1rem', borderRadius: 999 }}>
          + Crea immobile
        </button>
      </Link>

      {/* ── Disponibili ── */}
      <p className="adm-section-title">🟢 Disponibili ({disponibili.length})</p>
      <ImmobiliTable
        items={disponibili}
        loading={loading}
        error={error}
        busyId={busyId}
        deletingId={deletingId}
        emptyMsg="Nessun immobile disponibile."
        onEdit={setEditing}
        onToggleFeatured={toggleFeatured}
        onTogglePubblicato={togglePubblicato}
        onToggleStato={toggleStato}
        onDelete={handleDelete}
      />

      {/* ── Venduti ── */}
      <p className="adm-section-title" style={{ marginTop:'2.5rem' }}>🔴 Venduti ({venduti.length})</p>
      <ImmobiliTable
        items={venduti}
        loading={loading}
        error={error}
        busyId={busyId}
        deletingId={deletingId}
        emptyMsg="Nessun immobile venduto."
        onEdit={setEditing}
        onToggleFeatured={toggleFeatured}
        onTogglePubblicato={togglePubblicato}
        onToggleStato={toggleStato}
        onDelete={handleDelete}
      />

      {editing && (
        <EditModal
          item={editing}
          onClose={() => setEditing(null)}
          onSaved={updated => {
            setImmobili(prev => prev.map(x => x.id === updated.id ? updated : x))
            setEditing(null)
          }}
        />
      )}
    </>
  )
}

/* ── Shared table component ── */
function ImmobiliTable({ items, loading, error, busyId, deletingId, emptyMsg, onEdit, onToggleFeatured, onTogglePubblicato, onToggleStato, onDelete }: {
  items: Immobile[]
  loading: boolean
  error: string
  busyId: string | null
  deletingId: string | null
  emptyMsg: string
  onEdit: (i: Immobile) => void
  onToggleFeatured: (i: Immobile) => void
  onTogglePubblicato: (i: Immobile) => void
  onToggleStato: (i: Immobile) => void
  onDelete: (i: Immobile) => void
}) {
  if (loading) return <p style={{ padding:'2rem',textAlign:'center',color:'var(--mid)',fontSize:'.88rem' }}>Caricamento…</p>
  if (error) return <p style={{ padding:'1rem',color:'#c0392b',fontSize:'.88rem' }}>{error}</p>
  if (items.length === 0) return <p style={{ padding:'1rem',color:'var(--mid)',fontSize:'.88rem' }}>{emptyMsg}</p>

  return (
    <div className="adm-card" style={{ padding:0,overflow:'hidden' }}>
      <div style={{ overflowX:'auto' }}>
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
            {items.map(item => (
              <tr key={item.id}>
                <td>
                  <span style={{ fontWeight:600 }}>{item.titolo}</span>
                  {item.featured && <span className="badge badge-orange" style={{ marginLeft:'.4rem' }}>★</span>}
                </td>
                <td style={{ color:'var(--mid)' }}>{item.citta ?? '—'}</td>
                <td style={{ fontWeight:700 }}>{fmt(item.prezzo)}</td>
                <td>
                  <div style={{ display:'flex',gap:'.3rem',flexWrap:'wrap' }}>
                    <span className={`badge ${item.pubblicato ? 'badge-green' : 'badge-gray'}`}>
                      {item.pubblicato ? 'Pub.' : 'Bozza'}
                    </span>
                    {item.tipo_contratto && (
                      <span className={`badge ${item.tipo_contratto === 'affitto' ? 'badge-orange' : 'badge-gray'}`}>
                        {item.tipo_contratto === 'affitto' ? 'Affitto' : 'Vendita'}
                      </span>
                    )}
                  </div>
                </td>
                <td style={{ fontWeight:600,color:'var(--tc)' }}>{item.viste ?? 0}</td>
                <td>
                  <div className="adm-actions">
                    <Link href={`/admin/immobili/gestione/${item.id}`} className="adm-btn adm-btn-edit">Modifica</Link>
                    <button className={`adm-btn ${item.pubblicato ? 'adm-btn-unpub' : 'adm-btn-pub'}`}
                      disabled={busyId===item.id} onClick={()=>onTogglePubblicato(item)}>
                      {item.pubblicato ? 'Nascondi' : 'Pubblica'}
                    </button>
                    <button className={`adm-btn ${item.featured ? 'adm-btn-unfeature' : 'adm-btn-feature'}`}
                      disabled={busyId===item.id} onClick={()=>onToggleFeatured(item)}>
                      {item.featured ? '★ Togli' : '★ Evidenzia'}
                    </button>
                    <button className={`adm-btn ${item.stato==='venduto' ? 'adm-btn-unsold' : 'adm-btn-sold'}`}
                      disabled={busyId===item.id} onClick={()=>onToggleStato(item)}>
                      {item.stato==='venduto' ? '→ Disponibile' : '→ Venduto'}
                    </button>
                    <button className="adm-btn adm-btn-delete"
                      disabled={deletingId===item.id} onClick={()=>onDelete(item)}>
                      {deletingId===item.id ? '…' : '🗑 Elimina'}
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

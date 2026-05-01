'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import MultiPhotoUpload from '../MultiPhotoUpload'

type Immobile = {
  id: string
  titolo: string
  titolo_en: string | null
  citta: string | null
  prezzo: number | null
  descrizione: string | null
  descrizione_en: string | null
  featured: boolean
  pubblicato: boolean
  stato: string
  tipo_contratto: string | null
  indirizzo: string | null
  posizione_approssimativa: boolean
  mq: number | null
  locali: number | null
  immaginecopertina: string | null
  slug: string
}

type Props = { item?: Immobile | null }

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
function imgUrl(p: string | null) {
  if (!p) return null
  if (p.startsWith('http') || p.startsWith('/')) return p
  return `${SUPABASE_URL}/storage/v1/object/public/immobili/${p}`
}

export default function UnifiedImmobileForm({ item }: Props) {
  const router = useRouter()
  const isNew = !item
  const fileRef = useRef<HTMLInputElement>(null)
  const multiFileRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    titolo: item?.titolo ?? '',
    titolo_en: item?.titolo_en ?? '',
    citta: item?.citta ?? '',
    prezzo: item?.prezzo !== null && item?.prezzo !== undefined ? String(item.prezzo) : '',
    descrizione: item?.descrizione ?? '',
    descrizione_en: item?.descrizione_en ?? '',
    featured: item?.featured ?? false,
    pubblicato: item?.pubblicato ?? true,
    stato: item?.stato ?? 'disponibile',
    tipo_contratto: item?.tipo_contratto ?? 'vendita',
    indirizzo: item?.indirizzo ?? '',
    posizione_approssimativa: item?.posizione_approssimativa ?? true,
    mq: item?.mq !== null && item?.mq !== undefined ? String(item.mq) : '',
    locali: item?.locali !== null && item?.locali !== undefined ? String(item.locali) : '',
  })

  // Edit mode: single cover photo
  const [coverFoto, setCoverFoto] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)

  // New mode: multiple photos upfront
  const [newFotoFiles, setNewFotoFiles] = useState<File[]>([])
  const [newFotoPreviews, setNewFotoPreviews] = useState<string[]>([])
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  // Edit mode: gallery photos
  const [photos, setPhotos] = useState<unknown[]>([])

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [warning, setWarning] = useState('')
  const [translatingTitolo, setTranslatingTitolo] = useState(false)
  const [translatingDesc, setTranslatingDesc] = useState(false)

  // Load existing photos in edit mode
  useEffect(() => {
    if (!isNew && item) {
      fetch(`/api/admin/immobili/${item.id}/photos`)
        .then(r => r.json())
        .then(d => setPhotos(d.photos ?? []))
        .catch(() => {})
    }
  }, [isNew, item])

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }))

  const handleTranslate = async (field: 'titolo' | 'descrizione') => {
    const text = field === 'titolo' ? form.titolo : form.descrizione
    if (!text.trim()) return
    field === 'titolo' ? setTranslatingTitolo(true) : setTranslatingDesc(true)
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      const data = await res.json()
      if (!res.ok) { alert(`Errore traduzione: ${data.error}`); return }
      set(field === 'titolo' ? 'titolo_en' : 'descrizione_en', data.translated)
    } catch {
      alert('Errore di rete durante la traduzione')
    } finally {
      field === 'titolo' ? setTranslatingTitolo(false) : setTranslatingDesc(false)
    }
  }

  // New mode: add photos
  const handleNewFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    setNewFotoFiles(prev => [...prev, ...files])
    setNewFotoPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))])
    e.target.value = ''
  }

  const deleteNewFoto = (idx: number) => {
    setNewFotoFiles(prev => prev.filter((_, i) => i !== idx))
    setNewFotoPreviews(prev => prev.filter((_, i) => i !== idx))
  }

  const moveNewFoto = (from: number, to: number) => {
    if (to < 0 || to >= newFotoFiles.length) return
    setNewFotoFiles(prev => { const a = [...prev]; [a[from], a[to]] = [a[to], a[from]]; return a })
    setNewFotoPreviews(prev => { const a = [...prev]; [a[from], a[to]] = [a[to], a[from]]; return a })
  }

  async function handleSave() {
    if (!form.titolo.trim()) { setError('Il titolo è obbligatorio'); return }
    if (!form.indirizzo.trim()) { setError("L'indirizzo è obbligatorio"); return }
    if (isNew && newFotoFiles.length === 0) { setError('Carica almeno una foto copertina'); return }
    setSaving(true); setError(''); setWarning('')

    try {
      const fd = new FormData()
      const fields: [string, string][] = [
        ['titolo', form.titolo], ['titolo_en', form.titolo_en],
        ['citta', form.citta], ['prezzo', form.prezzo],
        ['descrizione', form.descrizione], ['descrizione_en', form.descrizione_en],
        ['featured', String(form.featured)], ['pubblicato', String(form.pubblicato)],
        ['stato', form.stato], ['tipo_contratto', form.tipo_contratto],
        ['indirizzo', form.indirizzo],
        ['posizione_approssimativa', String(form.posizione_approssimativa)],
        ['mq', form.mq], ['locali', form.locali],
      ]
      fields.forEach(([k, v]) => fd.append(k, v))

      if (isNew) {
        // Create mode
        fd.append('foto_copertina', newFotoFiles[0])
        for (let i = 1; i < newFotoFiles.length; i++) fd.append('photos', newFotoFiles[i])

        const res = await fetch('/api/immobili/create', { method: 'POST', body: fd })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? 'Errore creazione')
        if (data.warning) setWarning(data.warning)
        setSaved(true)
        setTimeout(() => router.push(`/admin/immobili/${data.id}`), 1000)
      } else {
        // Edit mode
        if (coverFoto) fd.append('foto_copertina', coverFoto)

        const res = await fetch(`/api/admin/immobili/${item!.id}`, { method: 'PATCH', body: fd })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? 'Errore salvataggio')
        if (data.warning) setWarning(data.warning)
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Errore')
    } finally {
      setSaving(false)
    }
  }

  const inp = 'w-full border border-neutral-300 rounded-xl px-4 py-3 text-sm focus:border-neutral-900 outline-none bg-white'
  const sel = 'w-full border border-neutral-300 rounded-xl px-4 py-3 text-sm focus:border-neutral-900 outline-none bg-white'
  const lbl = 'block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1'
  const transBtn = 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-300 text-xs font-semibold text-neutral-600 hover:border-neutral-900 hover:text-neutral-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'

  const currentCoverImg = coverPreview ?? imgUrl(item?.immaginecopertina ?? null)

  return (
    <div className="space-y-6">

      {saved && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          ✓ {isNew ? 'Immobile creato! Reindirizzamento…' : 'Salvato con successo!'}
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}
      {warning && (
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-700">⚠️ {warning}</div>
      )}

      {/* ── FOTO ── */}
      {isNew ? (
        /* Nuovo: griglia multi-foto drag&drop */
        <div>
          <label className={lbl}>📸 Foto ({newFotoFiles.length}) — la prima sarà la copertina</label>
          {newFotoFiles.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '.75rem', marginBottom: '1rem' }}>
              {newFotoFiles.map((_, idx) => (
                <div
                  key={idx}
                  draggable
                  onDragStart={() => setDraggingIndex(idx)}
                  onDragOver={e => { e.preventDefault(); setDragOverIndex(idx) }}
                  onDragLeave={() => setDragOverIndex(null)}
                  onDrop={() => { if (draggingIndex !== null && draggingIndex !== idx) moveNewFoto(draggingIndex, idx); setDragOverIndex(null); setDraggingIndex(null) }}
                  style={{
                    position: 'relative', aspectRatio: '1', borderRadius: '8px', overflow: 'hidden',
                    background: '#ece7e1', cursor: 'move',
                    border: draggingIndex === idx ? '2px solid #c4622d' : dragOverIndex === idx ? '2px dashed #c4622d' : '2px solid transparent',
                    opacity: draggingIndex === idx ? .6 : 1,
                  }}
                >
                  <img src={newFotoPreviews[idx]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {idx === 0 && (
                    <div style={{ position: 'absolute', top: 4, left: 4, background: '#c4622d', color: '#fff', padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 700 }}>COPERTINA</div>
                  )}
                  <button type="button" onClick={() => deleteNewFoto(idx)}
                    style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,.7)', color: '#fff', border: 'none', borderRadius: 4, width: 24, height: 24, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>✕</button>
                </div>
              ))}
            </div>
          )}
          <input ref={multiFileRef} type="file" multiple accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleNewFoto} />
          <button type="button" onClick={() => multiFileRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-xl border border-neutral-300 px-4 py-2.5 text-sm font-semibold hover:border-neutral-900 transition-colors">
            + {newFotoFiles.length === 0 ? 'Aggiungi foto' : 'Aggiungi altre foto'}
          </button>
        </div>
      ) : (
        /* Edit: copertina singola + galleria */
        <>
          <div>
            <label className={lbl}>Foto copertina</label>
            {currentCoverImg && (
              <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-3 border border-neutral-200">
                <Image src={currentCoverImg} alt="" fill className="object-cover" sizes="100vw" />
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
              onChange={e => { const f = e.target.files?.[0] ?? null; setCoverFoto(f); if (f) setCoverPreview(URL.createObjectURL(f)) }} />
            <button type="button" onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-xl border border-neutral-300 px-4 py-2.5 text-sm font-semibold hover:border-neutral-900 transition-colors">
              {coverFoto ? `✓ ${coverFoto.name}` : '+ Cambia foto copertina'}
            </button>
          </div>
          <div>
            <label className={lbl}>Galleria foto</label>
            <MultiPhotoUpload
              immobileId={item!.id}
              photos={photos as Parameters<typeof MultiPhotoUpload>[0]['photos']}
              onPhotosChange={setPhotos}
            />
          </div>
        </>
      )}

      {/* ── DATI PRINCIPALI ── */}
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className={lbl}>Titolo (IT) *</label>
          <input className={inp} value={form.titolo} onChange={e => set('titolo', e.target.value)} placeholder="Es. Cascinale ristrutturato con vista sulle colline" />
        </div>
        <div>
          <label className={lbl}>Tipo contratto</label>
          <select className={sel} value={form.tipo_contratto} onChange={e => set('tipo_contratto', e.target.value)}>
            <option value="vendita">Vendita</option>
            <option value="affitto">Affitto</option>
          </select>
        </div>
        <div>
          <label className={lbl}>Prezzo (€)</label>
          <input className={inp} type="number" value={form.prezzo} onChange={e => set('prezzo', e.target.value)} placeholder="Lascia vuoto = Su richiesta" />
        </div>
        <div>
          <label className={lbl}>Stato</label>
          <select className={sel} value={form.stato} onChange={e => set('stato', e.target.value)}>
            <option value="disponibile">🟢 Disponibile</option>
            <option value="venduto">🔴 Venduto</option>
          </select>
        </div>
        <div>
          <label className={lbl}>Superficie (m²)</label>
          <input className={inp} type="number" value={form.mq} onChange={e => set('mq', e.target.value)} placeholder="Es. 180" />
        </div>
        <div>
          <label className={lbl}>Locali</label>
          <input className={inp} type="number" value={form.locali} onChange={e => set('locali', e.target.value)} placeholder="Es. 5" />
        </div>
        <div className="col-span-2">
          <label className={lbl}>Descrizione (IT)</label>
          <textarea className={inp} rows={6} value={form.descrizione} onChange={e => set('descrizione', e.target.value)} placeholder="Descrivi l'immobile: caratteristiche, posizione, punti di forza…" />
        </div>
      </div>

      {/* ── VERSIONE EN ── */}
      <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 space-y-4">
        <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">
          🌐 Versione inglese <span className="font-normal normal-case tracking-normal text-neutral-400 ml-1">— mostrata ai visitatori EN</span>
        </p>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className={lbl} style={{ margin: 0 }}>Titolo (EN)</label>
            <button type="button" className={transBtn} onClick={() => handleTranslate('titolo')} disabled={translatingTitolo || !form.titolo.trim()}>
              {translatingTitolo ? '⏳ Traduzione…' : '✨ Traduci automaticamente'}
            </button>
          </div>
          <input className={inp} value={form.titolo_en} onChange={e => set('titolo_en', e.target.value)} placeholder="English title" />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className={lbl} style={{ margin: 0 }}>Descrizione (EN)</label>
            <button type="button" className={transBtn} onClick={() => handleTranslate('descrizione')} disabled={translatingDesc || !form.descrizione.trim()}>
              {translatingDesc ? '⏳ Traduzione…' : '✨ Traduci automaticamente'}
            </button>
          </div>
          <textarea className={inp} rows={6} value={form.descrizione_en} onChange={e => set('descrizione_en', e.target.value)} placeholder="English description" />
        </div>
      </div>

      {/* ── OPZIONI ── */}
      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold">
          <input type="checkbox" checked={form.featured} onChange={e => set('featured', e.target.checked)} />
          ★ In evidenza
        </label>
        <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold">
          <input type="checkbox" checked={form.pubblicato} onChange={e => set('pubblicato', e.target.checked)} />
          Pubblicato
        </label>
      </div>

      {/* ── LOCALIZZAZIONE ── */}
      <div>
        <label className={lbl}>Città e indirizzo</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <input className={inp} value={form.citta} onChange={e => set('citta', e.target.value)} placeholder="Città (es. Vignale Monferrato)" />
          </div>
          <div>
            <input className={inp} value={form.indirizzo} onChange={e => set('indirizzo', e.target.value)} placeholder="Indirizzo completo *" />
          </div>
        </div>
        <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-neutral-600 mt-3">
          <input type="checkbox" checked={form.posizione_approssimativa} onChange={e => set('posizione_approssimativa', e.target.checked)} />
          Posizione approssimativa (privacy)
        </label>
      </div>

      {/* ── AZIONI ── */}
      <div className="flex items-center gap-3 pt-2 border-t border-neutral-200 flex-wrap">
        <button type="button" onClick={handleSave} disabled={saving || saved}
          className="inline-flex items-center justify-center rounded-xl bg-neutral-900 px-6 py-3 text-sm font-semibold text-white hover:bg-neutral-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
          {saving ? 'Salvataggio…' : saved ? '✓ Salvato' : isNew ? 'Crea immobile' : 'Salva modifiche'}
        </button>
        <button type="button" onClick={() => router.back()}
          className="inline-flex items-center rounded-xl border border-neutral-300 px-5 py-3 text-sm font-semibold text-neutral-700 hover:border-neutral-900 transition-colors">
          Annulla
        </button>
        {!isNew && item?.slug && (
          <a href={`/immobili/${item.slug}`} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center rounded-xl border border-neutral-300 px-5 py-3 text-sm font-semibold text-neutral-700 hover:border-neutral-900 transition-colors ml-auto">
            ↗ Vedi pagina pubblica
          </a>
        )}
      </div>
    </div>
  )
}

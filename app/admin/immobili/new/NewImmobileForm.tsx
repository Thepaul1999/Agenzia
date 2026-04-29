'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import MultiPhotoUpload from '@/app/admin/MultiPhotoUpload'

type Photo = {
  id: string
  filename: string
  ordine: number
  url?: string
}

export default function NewImmobileForm() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    titolo: '',
    titolo_en: '',
    citta: '',
    prezzo: '',
    descrizione: '',
    descrizione_en: '',
    featured: false,
    pubblicato: true,
    stato: 'disponibile',
    tipo_contratto: 'vendita',
    indirizzo: '',
    posizione_approssimativa: true,
    mq: '',
    locali: '',
  })

  const [foto, setFoto] = useState<File | null>(null)
  const [fotoPreview, setFotoPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [warning, setWarning] = useState('')

  const [translatingTitolo, setTranslatingTitolo] = useState(false)
  const [translatingDesc, setTranslatingDesc] = useState(false)

  const [createdImmobileId, setCreatedImmobileId] = useState<string | null>(null)
  const [photos, setPhotos] = useState<Photo[]>([])

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }))

  const handleFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    setFoto(file)
    if (file) setFotoPreview(URL.createObjectURL(file))
  }

  const handleTranslate = async (field: 'titolo' | 'descrizione') => {
    const text = field === 'titolo' ? form.titolo : form.descrizione
    if (!text.trim()) return
    if (field === 'titolo') setTranslatingTitolo(true)
    else setTranslatingDesc(true)
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      const data = await res.json()
      if (!res.ok) { alert(`Errore traduzione: ${data.error}`); return }
      if (field === 'titolo') set('titolo_en', data.translated)
      else set('descrizione_en', data.translated)
    } catch {
      alert('Errore di rete durante la traduzione')
    } finally {
      if (field === 'titolo') setTranslatingTitolo(false)
      else setTranslatingDesc(false)
    }
  }

  async function handleSave() {
    if (!form.titolo.trim()) { setError('Il titolo è obbligatorio'); return }
    setSaving(true)
    setError('')
    setWarning('')
    try {
      const fd = new FormData()
      const fields: [string, string][] = [
        ['titolo', form.titolo],
        ['titolo_en', form.titolo_en],
        ['citta', form.citta],
        ['prezzo', form.prezzo],
        ['descrizione', form.descrizione],
        ['descrizione_en', form.descrizione_en],
        ['featured', String(form.featured)],
        ['pubblicato', String(form.pubblicato)],
        ['stato', form.stato],
        ['tipo_contratto', form.tipo_contratto],
        ['indirizzo', form.indirizzo],
        ['posizione_approssimativa', String(form.posizione_approssimativa)],
        ['mq', form.mq],
        ['locali', form.locali],
      ]
      fields.forEach(([k, v]) => fd.append(k, v))
      if (foto) fd.append('foto_copertina', foto)

      const res = await fetch('/api/immobili/create', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Errore creazione')

      if (data.warning) setWarning(data.warning)

      // Passa a caricamento foto
      setCreatedImmobileId(data.id)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Errore')
    } finally {
      setSaving(false)
    }
  }

  const handlePhotosUploadComplete = () => {
    router.push(`/admin/immobili/${createdImmobileId}`)
  }

  const inp = 'w-full border border-neutral-300 rounded-xl px-4 py-3 text-sm focus:border-neutral-900 outline-none bg-white'
  const sel = 'w-full border border-neutral-300 rounded-xl px-4 py-3 text-sm focus:border-neutral-900 outline-none bg-white'
  const lbl = 'block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1'
  const transBtn = 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-300 text-xs font-semibold text-neutral-600 hover:border-neutral-900 hover:text-neutral-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'

  if (createdImmobileId) {
    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          ✓ Immobile creato con successo! Ora aggiungi le foto della galleria (fino a 50).
        </div>

        <MultiPhotoUpload immobileId={createdImmobileId} photos={photos} onPhotosChange={setPhotos} />

        <div className="flex items-center gap-3 pt-2 border-t border-neutral-200">
          <button
            type="button"
            onClick={handlePhotosUploadComplete}
            className="inline-flex items-center justify-center rounded-xl bg-neutral-900 px-6 py-3 text-sm font-semibold text-white hover:bg-neutral-700 transition-colors"
          >
            ✓ Continua
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin/immobili')}
            className="inline-flex items-center rounded-xl border border-neutral-300 px-5 py-3 text-sm font-semibold text-neutral-700 hover:border-neutral-900 transition-colors"
          >
            Salta caricamento foto
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}
      {warning && (
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-700">⚠️ {warning}</div>
      )}

      {/* Foto copertina */}
      <div>
        <label className={lbl}>Foto copertina</label>
        {fotoPreview && (
          <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-3 border border-neutral-200">
            <Image src={fotoPreview} alt="Anteprima" fill className="object-cover" sizes="100vw" />
          </div>
        )}
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFoto} />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-xl border border-neutral-300 px-4 py-2.5 text-sm font-semibold hover:border-neutral-900 transition-colors"
        >
          {foto ? `✓ ${foto.name}` : '+ Aggiungi foto copertina'}
        </button>
        <p className="text-xs text-neutral-400 mt-1.5">Potrai aggiungere la galleria completa dopo la creazione.</p>
      </div>

      {/* Dati principali */}
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className={lbl}>Titolo (IT) *</label>
          <input className={inp} value={form.titolo} onChange={e => set('titolo', e.target.value)} placeholder="Es. Cascinale ristrutturato con vista sulle colline" />
        </div>

        <div>
          <label className={lbl}>Città / Comune</label>
          <input className={inp} value={form.citta} onChange={e => set('citta', e.target.value)} placeholder="Es. Vignale Monferrato" />
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
          <textarea
            className={inp}
            rows={6}
            value={form.descrizione}
            onChange={e => set('descrizione', e.target.value)}
            placeholder="Descrivi l'immobile: caratteristiche, posizione, punti di forza…"
          />
        </div>
      </div>

      {/* Versione EN */}
      <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 space-y-4">
        <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">
          🌐 Versione inglese <span className="font-normal normal-case tracking-normal text-neutral-400 ml-1">— opzionale, mostrata ai visitatori EN</span>
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
          <textarea className={inp} rows={5} value={form.descrizione_en} onChange={e => set('descrizione_en', e.target.value)} placeholder="English description" />
        </div>
      </div>

      {/* Opzioni pubblicazione */}
      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold">
          <input type="checkbox" checked={form.featured} onChange={e => set('featured', e.target.checked)} />
          ★ In evidenza (mostra in home)
        </label>
        <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold">
          <input type="checkbox" checked={form.pubblicato} onChange={e => set('pubblicato', e.target.checked)} />
          Pubblica subito
        </label>
      </div>

      {/* Indirizzo */}
      <div>
        <label className={lbl}>Indirizzo</label>
        <input
          className={inp}
          value={form.indirizzo}
          onChange={e => set('indirizzo', e.target.value)}
          placeholder="Es. Via Roma 1, Vignale Monferrato"
        />
        <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-neutral-600 mt-3">
          <input type="checkbox" checked={form.posizione_approssimativa} onChange={e => set('posizione_approssimativa', e.target.checked)} />
          Posizione approssimativa (privacy)
        </label>
      </div>

      {/* Azioni */}
      <div className="flex items-center gap-3 pt-2 border-t border-neutral-200">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center justify-center rounded-xl bg-neutral-900 px-6 py-3 text-sm font-semibold text-white hover:bg-neutral-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? 'Creazione…' : 'Crea immobile'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/immobili')}
          className="inline-flex items-center rounded-xl border border-neutral-300 px-5 py-3 text-sm font-semibold text-neutral-700 hover:border-neutral-900 transition-colors"
        >
          Annulla
        </button>
        <span className="ml-auto text-xs text-neutral-400">
          Dopo la creazione potrai aggiungere fino a 50 foto
        </span>
      </div>
    </div>
  )
}

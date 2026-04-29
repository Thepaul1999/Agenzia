'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import ImmobileMapDetail from './ImmobileMapDetail'

type Immobile = {
  id: string
  titolo: string
  titolo_en: string | null
  citta: string | null
  prezzo: number | null
  descrizione: string | null
  descrizione_en: string | null
  featured: boolean
  stato: string
  indirizzo: string | null
  lat: number | null
  lng: number | null
  posizione_approssimativa: boolean
  imageUrl: string | null
  mq: number | null
  locali: number | null
}

type Props = {
  immobile: Immobile
  onClose: () => void
  onSave?: () => void
}

export default function ImmobileEditModal({ immobile, onClose, onSave }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    titolo: immobile.titolo,
    titolo_en: immobile.titolo_en ?? '',
    citta: immobile.citta ?? '',
    prezzo: immobile.prezzo !== null ? String(immobile.prezzo) : '',
    descrizione: immobile.descrizione ?? '',
    descrizione_en: immobile.descrizione_en ?? '',
    featured: immobile.featured,
    stato: immobile.stato ?? 'disponibile',
    indirizzo: immobile.indirizzo ?? '',
    lat: immobile.lat,
    lng: immobile.lng,
    posizione_approssimativa: immobile.posizione_approssimativa,
    mq: immobile.mq !== null ? String(immobile.mq) : '',
    locali: immobile.locali !== null ? String(immobile.locali) : '',
  })

  const [foto, setFoto] = useState<File | null>(null)
  const [fotoPreview, setFotoPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }))

  const handleFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    setFoto(file)
    if (file) setFotoPreview(URL.createObjectURL(file))
  }

  const handleAddressChange = (lat: number, lng: number, indirizzo: string) => {
    set('lat', lat)
    set('lng', lng)
    set('indirizzo', indirizzo)
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSuccess(false)

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
        ['stato', form.stato],
        ['indirizzo', form.indirizzo],
        ['lat', String(form.lat ?? '')],
        ['lng', String(form.lng ?? '')],
        ['posizione_approssimativa', String(form.posizione_approssimativa)],
        ['mq', form.mq],
        ['locali', form.locali],
      ]
      fields.forEach(([k, v]) => fd.append(k, v))
      if (foto) fd.append('foto_copertina', foto)

      const res = await fetch(`/api/admin/immobili/${immobile.id}`, { method: 'PATCH', body: fd })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error ?? 'Errore salvataggio')

      setSuccess(true)
      onSave?.()
      setTimeout(() => onClose(), 1500)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Errore')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="iemm-overlay" onClick={() => !saving && onClose()}>
      <style>{`
        .iemm-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          overflow-y: auto;
        }
        .iemm-modal {
          background: #fff;
          border-radius: 1.5rem;
          max-width: 900px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.3);
          animation: iemmSlideUp 0.3s ease;
        }
        @keyframes iemmSlideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .iemm-header {
          padding: 2rem;
          border-bottom: 1px solid #e9e4dd;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }
        .iemm-title {
          font-family: 'Syne', sans-serif;
          font-size: 1.5rem;
          font-weight: 800;
          color: #0c0c0a;
          margin: 0;
        }
        .iemm-close {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 1.5px solid #e9e4dd;
          background: transparent;
          color: #7c7770;
          font-size: 1.2rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          flex-shrink: 0;
        }
        .iemm-close:hover {
          background: #0c0c0a;
          color: #fff;
          border-color: #0c0c0a;
        }
        .iemm-body {
          padding: 2rem;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }
        .iemm-col {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .iemm-field {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }
        .iemm-label {
          font-family: 'Syne', sans-serif;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #7c7770;
        }
        .iemm-input,
        .iemm-select,
        .iemm-textarea {
          border: 1.5px solid #e9e4dd;
          border-radius: 0.75rem;
          padding: 0.75rem 1rem;
          font-family: inherit;
          font-size: 0.95rem;
          transition: border-color 0.2s;
        }
        .iemm-input:focus,
        .iemm-select:focus,
        .iemm-textarea:focus {
          outline: none;
          border-color: #c4622d;
        }
        .iemm-textarea {
          resize: vertical;
          min-height: 120px;
        }
        .iemm-checkbox {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          cursor: pointer;
          font-size: 0.95rem;
        }
        .iemm-checkbox input {
          cursor: pointer;
        }
        .iemm-photo-preview {
          position: relative;
          aspect-ratio: 3 / 2;
          border-radius: 0.75rem;
          overflow: hidden;
          background: #f5f3f0;
          border: 1.5px solid #e9e4dd;
        }
        .iemm-photo-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.6rem 1rem;
          border-radius: 0.75rem;
          background: #0c0c0a;
          color: #fff;
          border: none;
          font-family: 'Syne', sans-serif;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.2s;
        }
        .iemm-photo-btn:hover {
          background: #c4622d;
        }
        .iemm-alerts {
          grid-column: 1 / -1;
        }
        .iemm-alert {
          padding: 1rem;
          border-radius: 0.75rem;
          font-size: 0.9rem;
          animation: iemmFadeIn 0.3s ease;
        }
        @keyframes iemmFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .iemm-alert-error {
          background: #fee;
          color: #c00;
          border: 1.5px solid #fcc;
        }
        .iemm-alert-success {
          background: #efe;
          color: #0a0;
          border: 1.5px solid #cfc;
        }
        .iemm-map-section {
          grid-column: 1 / -1;
          padding-top: 1rem;
          border-top: 1px solid #e9e4dd;
        }
        .iemm-footer {
          grid-column: 1 / -1;
          display: flex;
          gap: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #e9e4dd;
        }
        .iemm-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.75rem 1.5rem;
          border-radius: 0.75rem;
          font-family: 'Syne', sans-serif;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          cursor: pointer;
          border: none;
          transition: all 0.2s;
        }
        .iemm-btn-primary {
          background: #0c0c0a;
          color: #fff;
          flex: 1;
        }
        .iemm-btn-primary:hover:not(:disabled) {
          background: #c4622d;
        }
        .iemm-btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .iemm-btn-secondary {
          background: transparent;
          color: #7c7770;
          border: 1.5px solid #e9e4dd;
        }
        .iemm-btn-secondary:hover {
          background: #f5f3f0;
        }
        @media (max-width: 768px) {
          .iemm-body {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
          .iemm-header {
            padding: 1.5rem;
          }
          .iemm-body {
            padding: 1.5rem;
          }
          .iemm-modal {
            border-radius: 1rem;
          }
        }
      `}</style>

      <div className="iemm-modal" onClick={e => e.stopPropagation()}>
        <div className="iemm-header">
          <h2 className="iemm-title">✏️ Modifica immobile</h2>
          <button className="iemm-close" onClick={onClose} disabled={saving}>
            ✕
          </button>
        </div>

        <div className="iemm-body">
          {error && <div className="iemm-alerts iemm-alert iemm-alert-error">❌ {error}</div>}
          {success && <div className="iemm-alerts iemm-alert iemm-alert-success">✓ Salvato con successo!</div>}

          <div className="iemm-col">
            <div className="iemm-field">
              <label className="iemm-label">Titolo (IT) *</label>
              <input className="iemm-input" value={form.titolo} onChange={e => set('titolo', e.target.value)} placeholder="Titolo dell'immobile" />
            </div>

            <div className="iemm-field">
              <label className="iemm-label">Titolo (EN)</label>
              <input className="iemm-input" value={form.titolo_en} onChange={e => set('titolo_en', e.target.value)} placeholder="English title" />
            </div>

            <div className="iemm-field">
              <label className="iemm-label">Città</label>
              <input className="iemm-input" value={form.citta} onChange={e => set('citta', e.target.value)} placeholder="Es. Vignale Monferrato" />
            </div>

            <div className="iemm-field">
              <label className="iemm-label">Prezzo (€)</label>
              <input className="iemm-input" type="number" value={form.prezzo} onChange={e => set('prezzo', e.target.value)} placeholder="Lascia vuoto per 'Su richiesta'" />
            </div>

            <div className="iemm-field">
              <label className="iemm-label">Superficie (m²)</label>
              <input className="iemm-input" type="number" value={form.mq} onChange={e => set('mq', e.target.value)} />
            </div>

            <div className="iemm-field">
              <label className="iemm-label">Locali</label>
              <input className="iemm-input" type="number" value={form.locali} onChange={e => set('locali', e.target.value)} />
            </div>

            <div className="iemm-field">
              <label className="iemm-label">Stato</label>
              <select className="iemm-select" value={form.stato} onChange={e => set('stato', e.target.value)}>
                <option value="disponibile">🟢 Disponibile</option>
                <option value="venduto">🔴 Venduto</option>
              </select>
            </div>

            <label className="iemm-checkbox">
              <input type="checkbox" checked={form.featured} onChange={e => set('featured', e.target.checked)} />
              <span>★ In evidenza (home)</span>
            </label>

            <label className="iemm-checkbox">
              <input type="checkbox" checked={form.posizione_approssimativa} onChange={e => set('posizione_approssimativa', e.target.checked)} />
              <span>Posizione approssimativa (privacy)</span>
            </label>
          </div>

          <div className="iemm-col">
            <div className="iemm-field">
              <label className="iemm-label">Descrizione (IT)</label>
              <textarea className="iemm-textarea" value={form.descrizione} onChange={e => set('descrizione', e.target.value)} placeholder="Descrivi l'immobile…" />
            </div>

            <div className="iemm-field">
              <label className="iemm-label">Descrizione (EN)</label>
              <textarea className="iemm-textarea" value={form.descrizione_en} onChange={e => set('descrizione_en', e.target.value)} placeholder="English description…" />
            </div>

            <div className="iemm-field">
              <label className="iemm-label">Foto copertina</label>
              {fotoPreview && (
                <div className="iemm-photo-preview">
                  <Image src={fotoPreview} alt="Anteprima" fill className="object-cover" sizes="100%" />
                </div>
              )}
              {!fotoPreview && immobile.imageUrl && (
                <div className="iemm-photo-preview">
                  <Image src={immobile.imageUrl} alt="Foto attuale" fill className="object-cover" sizes="100%" />
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFoto} />
              <button type="button" className="iemm-photo-btn" onClick={() => fileRef.current?.click()}>
                {foto ? `✓ ${foto.name}` : '+ Cambia foto copertina'}
              </button>
            </div>
          </div>

          <div className="iemm-map-section">
            <ImmobileMapDetail lat={form.lat} lng={form.lng} indirizzo={form.indirizzo} posizione_approssimativa={form.posizione_approssimativa} isAdmin onAddressChange={handleAddressChange} />
          </div>

          <div className="iemm-footer">
            <button className="iemm-btn iemm-btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? '💾 Salvataggio…' : '💾 Salva'}
            </button>
            <button className="iemm-btn iemm-btn-secondary" onClick={onClose} disabled={saving}>
              Annulla
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'

type HomeContent = {
  heroTitle1?: string
  heroTitle2?: string
  serviceCopy?: string
  territoryCopy?: string
  contactCopy?: string
  navProperties?: string
  navServices?: string
  navTerritory?: string
  navTestimonials?: string
  navContacts?: string
  navReservedArea?: string
  showServices?: boolean
  showTerritory?: boolean
  showTestimonials?: boolean
  showStats?: boolean
}

export default function HomeContentEditor({ initial }: { initial: HomeContent }) {
  const [form, setForm] = useState<HomeContent>(initial)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const set = <K extends keyof HomeContent>(k: K, v: HomeContent[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }))

  async function handleSave() {
    setSaving(true)
    setMessage(null)
    setError(null)
    try {
      const res = await fetch('/api/admin/home-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: form }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) throw new Error(data.error ?? 'Errore salvataggio')
      setMessage('Contenuti home salvati. Aggiorna la home cliente per vedere le modifiche.')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Errore')
    } finally {
      setSaving(false)
    }
  }

  const lbl = 'block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1'
  const inp = 'w-full border border-neutral-300 rounded-xl px-4 py-3 text-sm focus:border-neutral-900 outline-none bg-white'

  return (
    <div className="space-y-4">
      <p className="text-sm text-neutral-600">
        Modifica testi principali della home lato cliente (versione IT). Base per personalizzazione contenuti.
      </p>

      <div>
        <label className={lbl}>Hero titolo riga 1</label>
        <input className={inp} value={form.heroTitle1 ?? ''} onChange={(e) => set('heroTitle1', e.target.value)} />
      </div>
      <div>
        <label className={lbl}>Hero titolo riga 2</label>
        <input className={inp} value={form.heroTitle2 ?? ''} onChange={(e) => set('heroTitle2', e.target.value)} />
      </div>
      <div>
        <label className={lbl}>Testo servizi</label>
        <textarea className={inp} rows={4} value={form.serviceCopy ?? ''} onChange={(e) => set('serviceCopy', e.target.value)} />
      </div>
      <div>
        <label className={lbl}>Testo territorio</label>
        <textarea className={inp} rows={4} value={form.territoryCopy ?? ''} onChange={(e) => set('territoryCopy', e.target.value)} />
      </div>
      <div>
        <label className={lbl}>Testo contatti/footer</label>
        <textarea className={inp} rows={4} value={form.contactCopy ?? ''} onChange={(e) => set('contactCopy', e.target.value)} />
      </div>

      <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 space-y-4">
        <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">Menu in alto (versione IT)</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={lbl}>Immobili</label>
            <input className={inp} value={form.navProperties ?? ''} onChange={(e) => set('navProperties', e.target.value)} />
          </div>
          <div>
            <label className={lbl}>Servizi</label>
            <input className={inp} value={form.navServices ?? ''} onChange={(e) => set('navServices', e.target.value)} />
          </div>
          <div>
            <label className={lbl}>Territorio</label>
            <input className={inp} value={form.navTerritory ?? ''} onChange={(e) => set('navTerritory', e.target.value)} />
          </div>
          <div>
            <label className={lbl}>Recensioni</label>
            <input className={inp} value={form.navTestimonials ?? ''} onChange={(e) => set('navTestimonials', e.target.value)} />
          </div>
          <div>
            <label className={lbl}>Contatti</label>
            <input className={inp} value={form.navContacts ?? ''} onChange={(e) => set('navContacts', e.target.value)} />
          </div>
          <div>
            <label className={lbl}>Area riservata</label>
            <input className={inp} value={form.navReservedArea ?? ''} onChange={(e) => set('navReservedArea', e.target.value)} />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 space-y-3">
        <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">Visibilità sezioni home</p>
        <label className="flex items-center gap-2 text-sm font-medium text-neutral-700">
          <input type="checkbox" checked={form.showServices !== false} onChange={(e) => set('showServices', e.target.checked)} />
          Mostra sezione Servizi
        </label>
        <label className="flex items-center gap-2 text-sm font-medium text-neutral-700">
          <input type="checkbox" checked={form.showTerritory !== false} onChange={(e) => set('showTerritory', e.target.checked)} />
          Mostra sezione Territorio
        </label>
        <label className="flex items-center gap-2 text-sm font-medium text-neutral-700">
          <input type="checkbox" checked={form.showTestimonials !== false} onChange={(e) => set('showTestimonials', e.target.checked)} />
          Mostra sezione Recensioni
        </label>
        <label className="flex items-center gap-2 text-sm font-medium text-neutral-700">
          <input type="checkbox" checked={form.showStats !== false} onChange={(e) => set('showStats', e.target.checked)} />
          Mostra sezione Numeri
        </label>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center justify-center rounded-xl bg-neutral-900 px-6 py-3 text-sm font-semibold text-white hover:bg-neutral-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? 'Salvataggio…' : 'Carica modifiche'}
        </button>
      </div>

      {message && <p className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{message}</p>}
      {error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
    </div>
  )
}

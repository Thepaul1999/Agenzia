'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type ApiResponse = {
  success?: boolean
  message?: string
  error?: string
  warning?: string
  id?: string
  slug?: string
  imagePath?: string | null
}

export default function NewPropertyForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ApiResponse | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setResult(null)

    try {
      const form = event.currentTarget
      const formData = new FormData(form)

      const response = await fetch('/api/immobili/create', {
        method: 'POST',
        body: formData,
      })

      const data: ApiResponse = await response.json()
      setResult(data)

      if (response.ok && data.success && data.id) {
        form.reset()
        router.refresh()
      } else if (!data.error) {
        setResult({
          error: 'Salvataggio non confermato dal database.',
        })
      }
    } catch {
      setResult({
        error: 'Errore imprevisto. Riprova.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="titolo" className="mb-1 block text-sm font-medium text-neutral-800">
          Titolo
        </label>
        <input
          id="titolo"
          name="titolo"
          type="text"
          required
          className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none ring-0 placeholder:text-neutral-400 focus:border-neutral-900"
          placeholder="Es. Trilocale luminoso con terrazzo"
        />
      </div>

      <div>
        <label htmlFor="citta" className="mb-1 block text-sm font-medium text-neutral-800">
          Città
        </label>
        <input
          id="citta"
          name="citta"
          type="text"
          required
          className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none ring-0 placeholder:text-neutral-400 focus:border-neutral-900"
          placeholder="Es. Alessandria"
        />
      </div>

      <div>
        <label htmlFor="tipo_contratto" className="mb-1 block text-sm font-medium text-neutral-800">
          Tipo contratto
        </label>
        <select
          id="tipo_contratto"
          name="tipo_contratto"
          defaultValue="vendita"
          className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none ring-0 focus:border-neutral-900"
        >
          <option value="vendita">Vendita</option>
          <option value="affitto">Affitto</option>
        </select>
      </div>

      <div>
        <label htmlFor="prezzo" className="mb-1 block text-sm font-medium text-neutral-800">
          Prezzo
        </label>
        <input
          id="prezzo"
          name="prezzo"
          type="number"
          min="0"
          step="0.01"
          className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none ring-0 placeholder:text-neutral-400 focus:border-neutral-900"
          placeholder="Es. 185000"
        />
      </div>

      <div>
        <label htmlFor="descrizione" className="mb-1 block text-sm font-medium text-neutral-800">
          Descrizione
        </label>
        <textarea
          id="descrizione"
          name="descrizione"
          rows={6}
          className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none ring-0 placeholder:text-neutral-400 focus:border-neutral-900"
          placeholder="Descrizione breve dell'immobile"
        />
      </div>

      <div>
        <label
          htmlFor="foto_copertina"
          className="mb-1 block text-sm font-medium text-neutral-800"
        >
          Foto copertina
        </label>
        <input
          id="foto_copertina"
          name="foto_copertina"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/jpg"
          className="block w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-neutral-900 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-neutral-700"
        />
      </div>

      <div>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-11 items-center justify-center rounded-xl bg-neutral-900 px-5 text-sm font-medium text-white hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Salvataggio...' : 'Salva immobile'}
        </button>
      </div>

      {result?.error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {result.error}
        </p>
      ) : null}

      {result?.success ? (
        <p className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          Immobile creato con successo. {result.slug ? `Slug: ${result.slug}` : ''}
        </p>
      ) : null}

      {result?.warning ? (
        <p className="rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-700">
          ⚠️ {result.warning}
        </p>
      ) : null}
    </form>
  )
}
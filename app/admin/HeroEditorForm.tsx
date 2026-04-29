'use client'

import { useState } from 'react'

type Props = {
  initialTitle: string
  initialSubtitle: string
  initialButtonText: string
  initialButtonHref: string
  initialBackgroundImage: string
}

export default function HeroEditorForm({
  initialTitle,
  initialSubtitle,
  initialButtonText,
  initialButtonHref,
  initialBackgroundImage,
}: Props) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setMessage(null)
    setError(null)

    try {
      const formData = new FormData(event.currentTarget)

      const response = await fetch('/api/admin/home-hero', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Errore di salvataggio.')
        return
      }

      setMessage('Hero aggiornata con successo.')
    } catch {
      setError('Errore imprevisto.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="mb-1 block text-sm font-medium text-neutral-800">
          Titolo
        </label>
        <input
          id="title"
          name="title"
          type="text"
          defaultValue={initialTitle}
          required
          className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none focus:border-neutral-900"
        />
      </div>

      <div>
        <label htmlFor="subtitle" className="mb-1 block text-sm font-medium text-neutral-800">
          Sottotitolo
        </label>
        <textarea
          id="subtitle"
          name="subtitle"
          rows={4}
          defaultValue={initialSubtitle}
          required
          className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none focus:border-neutral-900"
        />
      </div>

      <div>
        <label htmlFor="buttonText" className="mb-1 block text-sm font-medium text-neutral-800">
          Testo bottone
        </label>
        <input
          id="buttonText"
          name="buttonText"
          type="text"
          defaultValue={initialButtonText}
          required
          className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none focus:border-neutral-900"
        />
      </div>

      <div>
        <label htmlFor="buttonHref" className="mb-1 block text-sm font-medium text-neutral-800">
          Link bottone
        </label>
        <input
          id="buttonHref"
          name="buttonHref"
          type="text"
          defaultValue={initialButtonHref}
          required
          className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none focus:border-neutral-900"
          placeholder="/immobili"
        />
      </div>

      <div>
        <label
          htmlFor="backgroundImage"
          className="mb-1 block text-sm font-medium text-neutral-800"
        >
          Immagine sfondo
        </label>
        <input
          id="backgroundImage"
          name="backgroundImage"
          type="text"
          defaultValue={initialBackgroundImage}
          required
          className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none focus:border-neutral-900"
          placeholder="/images/hero/sfondo-home.jpg"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="inline-flex h-11 items-center justify-center rounded-xl bg-neutral-900 px-5 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-60"
      >
        {loading ? 'Salvataggio...' : 'Salva hero'}
      </button>

      {message ? (
        <p className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {message}
        </p>
      ) : null}

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}
    </form>
  )
}
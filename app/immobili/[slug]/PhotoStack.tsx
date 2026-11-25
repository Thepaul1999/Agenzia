'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'

type Photo = { id: string; filename: string; ordine: number }

function photoUrl(filename: string, supabaseUrl: string) {
  if (!filename) return null
  if (filename.startsWith('http') || filename.startsWith('/')) return filename
  return `${supabaseUrl}/storage/v1/object/public/immobili/${filename}`
}

/**
 * Tutte le foto una sotto l'altra (si scorrono col dito verso il basso).
 * Un tocco apre la foto a schermo intero: si cambia con swipe o frecce, si chiude con ✕ o Esc.
 */
export default function PhotoStack({
  photos,
  title,
  supabaseUrl,
  lang = 'it',
}: {
  photos: Photo[]
  title: string
  supabaseUrl: string
  lang?: 'it' | 'en'
}) {
  const [open, setOpen] = useState<number | null>(null)
  const touch = useRef<{ x: number; y: number } | null>(null)
  const en = lang === 'en'

  const items = photos
    .map(p => ({ id: p.id, url: photoUrl(p.filename, supabaseUrl) }))
    .filter((p): p is { id: string; url: string } => Boolean(p.url))

  const go = useCallback(
    (d: number) => setOpen(i => (i === null ? i : (i + d + items.length) % items.length)),
    [items.length],
  )

  useEffect(() => {
    if (open === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null)
      else if (e.key === 'ArrowRight') go(1)
      else if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open, go])

  if (items.length < 2) return null

  return (
    <>
      <style>{`
        .pst-grid { display: grid; grid-template-columns: 1fr; gap: .9rem; margin-top: .9rem; }
        @media (min-width: 900px) { .pst-grid { grid-template-columns: 1fr 1fr; } }
        .pst-tile {
          position: relative; display: block; width: 100%; aspect-ratio: 4 / 3; padding: 0; border: 0;
          border-radius: 16px; overflow: hidden; cursor: zoom-in; background: #ece7e1;
        }
        .pst-tile:focus-visible { outline: 3px solid var(--tc, #c4622d); outline-offset: 2px; }
        .pst-lb {
          position: fixed; inset: 0; z-index: 100000; background: #080806;
          display: flex; align-items: center; justify-content: center; touch-action: pan-y;
        }
        .pst-lb-img { position: absolute; inset: 0; }
        .pst-btn {
          position: absolute; z-index: 2; width: 48px; height: 48px; border-radius: 999px; border: 0; cursor: pointer;
          background: rgba(255,255,255,.14); color: #fff; font-size: 1.5rem; line-height: 1;
          display: flex; align-items: center; justify-content: center;
        }
        .pst-btn:hover { background: rgba(255,255,255,.26); }
        .pst-close { top: max(.8rem, env(safe-area-inset-top)); right: .8rem; font-size: 1.2rem; }
        .pst-prev { left: .8rem; top: 50%; transform: translateY(-50%); }
        .pst-next { right: .8rem; top: 50%; transform: translateY(-50%); }
        .pst-count {
          position: absolute; z-index: 2; left: 50%; transform: translateX(-50%);
          bottom: max(1rem, env(safe-area-inset-bottom)); color: #fff; font-size: .8rem; font-weight: 700;
          letter-spacing: .06em; background: rgba(0,0,0,.55); padding: .4rem .8rem; border-radius: 999px;
        }
        @media (max-width: 640px) { .pst-prev, .pst-next { display: none; } }
      `}</style>

      <div className="pst-grid">
        {items.map((p, i) => (
          <button
            key={p.id}
            type="button"
            className="pst-tile"
            onClick={() => setOpen(i)}
            aria-label={`${en ? 'Open photo' : 'Apri foto'} ${i + 1}`}
          >
            <Image
              src={p.url}
              alt={`${title} - ${en ? 'photo' : 'foto'} ${i + 1}`}
              fill
              sizes="(max-width: 900px) 100vw, 50vw"
              loading={i < 2 ? 'eager' : 'lazy'}
              style={{ objectFit: 'cover' }}
            />
          </button>
        ))}
      </div>

      {open !== null && (
        <div
          className="pst-lb"
          role="dialog"
          aria-modal="true"
          aria-label={en ? 'Photo viewer' : 'Visualizzatore foto'}
          onClick={() => setOpen(null)}
          onTouchStart={e => {
            touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
          }}
          onTouchEnd={e => {
            const s = touch.current
            touch.current = null
            if (!s) return
            const dx = e.changedTouches[0].clientX - s.x
            const dy = e.changedTouches[0].clientY - s.y
            if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) go(dx < 0 ? 1 : -1)
          }}
        >
          <div className="pst-lb-img">
            <Image
              src={items[open].url}
              alt={`${title} - ${en ? 'photo' : 'foto'} ${open + 1}`}
              fill
              sizes="100vw"
              priority
              style={{ objectFit: 'contain' }}
            />
          </div>
          <button
            type="button"
            className="pst-btn pst-close"
            aria-label={en ? 'Close' : 'Chiudi'}
            onClick={e => {
              e.stopPropagation()
              setOpen(null)
            }}
          >
            ✕
          </button>
          <button
            type="button"
            className="pst-btn pst-prev"
            aria-label={en ? 'Previous photo' : 'Foto precedente'}
            onClick={e => {
              e.stopPropagation()
              go(-1)
            }}
          >
            ‹
          </button>
          <button
            type="button"
            className="pst-btn pst-next"
            aria-label={en ? 'Next photo' : 'Foto successiva'}
            onClick={e => {
              e.stopPropagation()
              go(1)
            }}
          >
            ›
          </button>
          <div className="pst-count" aria-live="polite">
            {open + 1} / {items.length}
          </div>
        </div>
      )}
    </>
  )
}

'use client'

import { useState, useEffect, useCallback, useRef, useLayoutEffect } from 'react'
import Image from 'next/image'

type Photo = {
  id: string
  filename: string
  ordine: number
}

type Props = {
  photos: Photo[]
  title: string
  supabaseUrl: string
  /** Auto-advance main image (ms). Set 0 to disable. Default 6000. */
  autoAdvanceMs?: number
  /** Label above thumbnail strip (i18n). */
  thumbnailsHint?: string
  /** Aria labels for thumbnail strip scroll buttons. */
  lang?: 'it' | 'en'
}

function getPhotoUrl(filename: string, supabaseUrl: string) {
  if (!filename) return null
  if (filename.startsWith('http') || filename.startsWith('/')) return filename
  return `${supabaseUrl}/storage/v1/object/public/immobili/${filename}`
}

export default function ImageGallery({
  photos,
  title,
  supabaseUrl,
  autoAdvanceMs = 6000,
  thumbnailsHint,
  lang = 'it',
}: Props) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [pauseAuto, setPauseAuto] = useState(false)
  const [stripOverflow, setStripOverflow] = useState(false)
  const thumbNavRef = useRef<HTMLDivElement>(null)

  /** ~6 miniature per scroll (108px thumb + gap 0.65rem) */
  const scrollThumbStrip = useCallback((dir: -1 | 1) => {
    const el = thumbNavRef.current
    if (!el) return
    const first = el.querySelector('.gallery-thumb') as HTMLElement | null
    const gap = 11
    const step = first ? (first.offsetWidth + gap) * 6 : 720
    el.scrollBy({ left: dir * step, behavior: 'smooth' })
  }, [])

  useLayoutEffect(() => {
    const el = thumbNavRef.current
    if (!el || photos.length < 2) {
      setStripOverflow(false)
      return
    }
    const check = () => setStripOverflow(el.scrollWidth > el.clientWidth + 2)
    check()
    const ro = new ResizeObserver(check)
    ro.observe(el)
    el.addEventListener('scroll', check, { passive: true })
    return () => {
      ro.disconnect()
      el.removeEventListener('scroll', check)
    }
  }, [photos.length])

  const go = useCallback(
    (delta: number) => {
      setActiveIndex(prev => {
        const next = (prev + delta + photos.length) % photos.length
        return next
      })
    },
    [photos.length]
  )

  useEffect(() => {
    if (!autoAdvanceMs || photos.length < 2 || pauseAuto) return
    const id = window.setInterval(() => {
      setActiveIndex(prev => (prev + 1) % photos.length)
    }, autoAdvanceMs)
    return () => window.clearInterval(id)
  }, [autoAdvanceMs, photos.length, pauseAuto])

  useEffect(() => {
    const el = thumbNavRef.current
    if (!el || photos.length < 1) return
    const thumb = el.children[activeIndex] as HTMLElement | undefined
    thumb?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }, [activeIndex, photos.length])

  if (!photos || photos.length === 0) return null

  const currentPhoto = photos[activeIndex]
  const currentUrl = getPhotoUrl(currentPhoto.filename, supabaseUrl)

  return (
    <div
      className="gallery-root"
      style={{ marginBottom: '2.5rem', padding: '0 clamp(1.2rem, 4vw, 3rem)', maxWidth: 1360, marginLeft: 'auto', marginRight: 'auto' }}
      onMouseEnter={() => setPauseAuto(true)}
      onMouseLeave={() => setPauseAuto(false)}
    >
      <style>{`
        .gallery-main {
          position: relative;
          width: 100%;
          max-height: min(72vh, 640px);
          aspect-ratio: 16 / 9;
          background: #0c0c0a;
          border-radius: 16px;
          overflow: hidden;
          margin-bottom: 1rem;
          border: 1.5px solid var(--line, #e9e4dd);
        }

        .gallery-nav {
          display: flex;
          gap: 0.65rem;
          overflow-x: auto;
          overflow-y: hidden;
          padding: 0.35rem 0 0.65rem;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: thin;
        }

        .gallery-nav::-webkit-scrollbar {
          height: 6px;
        }
        .gallery-nav::-webkit-scrollbar-thumb {
          background: rgba(12, 12, 10, 0.25);
          border-radius: 999px;
        }

        .gallery-thumb {
          position: relative;
          flex-shrink: 0;
          width: 108px;
          height: 81px;
          border-radius: 10px;
          overflow: hidden;
          cursor: pointer;
          border: 2px solid transparent;
          transition: border-color 0.2s, box-shadow 0.2s, transform 0.15s;
          background: #1a1a18;
          scroll-snap-align: start;
          padding: 0;
        }

        .gallery-thumb:hover {
          border-color: rgba(196, 98, 45, 0.55);
          transform: translateY(-2px);
        }

        .gallery-thumb.active {
          border-color: var(--tc, #c4622d);
          box-shadow: 0 0 0 1px var(--tc, #c4622d);
        }

        .gallery-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(0, 0, 0, 0.55);
          color: #fff;
          border: none;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 1.35rem;
          line-height: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
          transition: background 0.2s;
        }

        .gallery-arrow:hover {
          background: rgba(0, 0, 0, 0.78);
        }

        .gallery-arrow:focus-visible {
          outline: 2px solid var(--tc, #c4622d);
          outline-offset: 2px;
        }

        .gallery-arrow-prev {
          left: 0.85rem;
        }

        .gallery-arrow-next {
          right: 0.85rem;
        }

        .gallery-counter {
          position: absolute;
          bottom: 0.85rem;
          right: 0.85rem;
          background: rgba(0, 0, 0, 0.72);
          color: #fff;
          padding: 0.4rem 0.75rem;
          border-radius: 8px;
          font-family: 'Syne', sans-serif;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.06em;
        }

        .gallery-strip-hint {
          font-family: 'Syne', sans-serif;
          font-size: 0.62rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--mid, #7c7770);
          margin: 0 0 0.35rem;
        }

        .gallery-strip-row {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          width: 100%;
        }

        .gallery-strip-row .gallery-nav {
          flex: 1;
          min-width: 0;
        }

        .gallery-strip-scroll {
          flex-shrink: 0;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1.5px solid var(--line, #e9e4dd);
          background: var(--bg, #faf8f5);
          color: var(--ink, #0c0c0a);
          cursor: pointer;
          font-size: 1.1rem;
          line-height: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.18s, border-color 0.18s;
        }

        .gallery-strip-scroll:hover {
          background: #ece7e1;
          border-color: var(--tc, #c4622d);
        }

        .gallery-strip-scroll:focus-visible {
          outline: 2px solid var(--tc, #c4622d);
          outline-offset: 2px;
        }

        .gallery-strip-scroll:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }
      `}</style>

      <div className="gallery-main">
        {currentUrl && (
          <Image
            src={currentUrl}
            alt={`${title} - Foto ${activeIndex + 1}`}
            fill
            sizes="(max-width: 1360px) 100vw, 1360px"
            priority={activeIndex === 0}
            style={{ objectFit: 'contain' }}
          />
        )}

        {photos.length > 1 && (
          <>
            <button
              type="button"
              className="gallery-arrow gallery-arrow-prev"
              onClick={() => go(-1)}
              aria-label="Foto precedente"
            >
              ‹
            </button>
            <button
              type="button"
              className="gallery-arrow gallery-arrow-next"
              onClick={() => go(1)}
              aria-label="Foto successiva"
            >
              ›
            </button>
            <div className="gallery-counter" aria-live="polite">
              {activeIndex + 1} / {photos.length}
            </div>
          </>
        )}
      </div>

      {photos.length >= 1 && (
        <>
          {thumbnailsHint ? <p className="gallery-strip-hint">{thumbnailsHint}</p> : null}
          <div className="gallery-strip-row">
            {stripOverflow && photos.length > 1 ? (
              <button
                type="button"
                className="gallery-strip-scroll"
                aria-label={lang === 'en' ? 'Scroll thumbnails back' : 'Scorri le miniature indietro'}
                onClick={() => scrollThumbStrip(-1)}
              >
                ‹
              </button>
            ) : null}
            <div className="gallery-nav" ref={thumbNavRef}>
              {photos.map((photo, idx) => {
                const thumbUrl = getPhotoUrl(photo.filename, supabaseUrl)
                return (
                  <button
                    key={photo.id}
                    type="button"
                    className={`gallery-thumb ${idx === activeIndex ? 'active' : ''}`}
                    onClick={() => setActiveIndex(idx)}
                    aria-label={`Mostra foto ${idx + 1}`}
                    aria-current={idx === activeIndex ? 'true' : undefined}
                  >
                    {thumbUrl && (
                      <Image
                        src={thumbUrl}
                        alt=""
                        fill
                        sizes="108px"
                        style={{ objectFit: 'cover' }}
                      />
                    )}
                  </button>
                )
              })}
            </div>
            {stripOverflow && photos.length > 1 ? (
              <button
                type="button"
                className="gallery-strip-scroll"
                aria-label={lang === 'en' ? 'Scroll thumbnails forward' : 'Scorri le miniature avanti'}
                onClick={() => scrollThumbStrip(1)}
              >
                ›
              </button>
            ) : null}
          </div>
        </>
      )}
    </div>
  )
}

'use client'

import { useState } from 'react'
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
}

function getPhotoUrl(filename: string, supabaseUrl: string) {
  if (!filename) return null
  if (filename.startsWith('http') || filename.startsWith('/')) return filename
  return `${supabaseUrl}/storage/v1/object/public/immobili/${filename}`
}

export default function ImageGallery({ photos, title, supabaseUrl }: Props) {
  const [activeIndex, setActiveIndex] = useState(0)

  if (!photos || photos.length === 0) return null

  const currentPhoto = photos[activeIndex]
  const currentUrl = getPhotoUrl(currentPhoto.filename, supabaseUrl)

  return (
    <div style={{ marginBottom: '2.5rem' }}>
      <style>{`
        .gallery-main {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 9;
          background: #ece7e1;
          border-radius: 16px;
          overflow: hidden;
          margin-bottom: 1rem;
        }

        .gallery-nav {
          display: flex;
          gap: 0.75rem;
          overflow-x: auto;
          padding-bottom: 0.5rem;
        }

        .gallery-thumb {
          flex-shrink: 0;
          width: 80px;
          aspect-ratio: 1;
          border-radius: 8px;
          overflow: hidden;
          cursor: pointer;
          border: 2px solid transparent;
          transition: all 0.2s;
          background: #ece7e1;
        }

        .gallery-thumb:hover {
          border-color: var(--tc);
          transform: scale(1.05);
        }

        .gallery-thumb.active {
          border-color: var(--tc);
        }

        .gallery-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(0,0,0,0.6);
          color: #fff;
          border: none;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 1.2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
          transition: background 0.2s;
        }

        .gallery-arrow:hover {
          background: rgba(0,0,0,0.8);
        }

        .gallery-arrow-prev {
          left: 1rem;
        }

        .gallery-arrow-next {
          right: 1rem;
        }

        .gallery-counter {
          position: absolute;
          bottom: 1rem;
          right: 1rem;
          background: rgba(0,0,0,0.7);
          color: #fff;
          padding: 0.5rem 0.75rem;
          border-radius: 6px;
          font-size: 0.85rem;
          font-weight: 600;
        }
      `}</style>

      {/* Main image */}
      <div className="gallery-main">
        {currentUrl && (
          <Image
            src={currentUrl}
            alt={`${title} - Foto ${activeIndex + 1}`}
            fill
            sizes="100vw"
            priority={activeIndex === 0}
            style={{ objectFit: 'cover' }}
          />
        )}

        {photos.length > 1 && (
          <>
            <button
              className="gallery-arrow gallery-arrow-prev"
              onClick={() => setActiveIndex(prev => (prev === 0 ? photos.length - 1 : prev - 1))}
              aria-label="Foto precedente"
            >
              ‹
            </button>
            <button
              className="gallery-arrow gallery-arrow-next"
              onClick={() => setActiveIndex(prev => (prev === photos.length - 1 ? 0 : prev + 1))}
              aria-label="Foto successiva"
            >
              ›
            </button>
            <div className="gallery-counter">
              {activeIndex + 1} / {photos.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {photos.length > 1 && (
        <div className="gallery-nav">
          {photos.map((photo, idx) => {
            const thumbUrl = getPhotoUrl(photo.filename, supabaseUrl)
            return (
              <button
                key={photo.id}
                className={`gallery-thumb ${idx === activeIndex ? 'active' : ''}`}
                onClick={() => setActiveIndex(idx)}
                style={{ padding: 0, border: 'none', background: 'transparent' }}
              >
                {thumbUrl && (
                  <Image
                    src={thumbUrl}
                    alt={`Thumbnail ${idx + 1}`}
                    fill
                    sizes="80px"
                    style={{ objectFit: 'cover' }}
                  />
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

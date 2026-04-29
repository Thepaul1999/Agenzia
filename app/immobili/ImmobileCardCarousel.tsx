'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

type Photo = {
  id: string
  filename: string
  ordine: number
}

type Props = {
  coverImage: string | null
  galleryPhotos: Photo[]
  title: string
  supabaseUrl: string
}

function getPhotoUrl(filename: string, supabaseUrl: string) {
  if (!filename) return null
  if (filename.startsWith('http') || filename.startsWith('/')) return filename
  return `${supabaseUrl}/storage/v1/object/public/immobili/${filename}`
}

export default function ImmobileCardCarousel({ coverImage, galleryPhotos, title, supabaseUrl }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [autoPlay, setAutoPlay] = useState(true)

  // Combina foto copertina con galleria
  const allPhotos = coverImage
    ? [
        { id: 'cover', filename: coverImage, ordine: -1 },
        ...galleryPhotos.sort((a, b) => a.ordine - b.ordine),
      ]
    : galleryPhotos.sort((a, b) => a.ordine - b.ordine)

  if (allPhotos.length === 0) return null

  const currentUrl = getPhotoUrl(allPhotos[currentIndex].filename, supabaseUrl)

  const goToPrev = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentIndex(prev => (prev === 0 ? allPhotos.length - 1 : prev - 1))
    setAutoPlay(false)
  }

  const goToNext = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentIndex(prev => (prev === allPhotos.length - 1 ? 0 : prev + 1))
    setAutoPlay(false)
  }

  const goToIndex = (e: React.MouseEvent, idx: number) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentIndex(idx)
    setAutoPlay(false)
  }

  // Auto-play ogni 5 secondi
  useEffect(() => {
    if (!autoPlay || allPhotos.length <= 1) return
    const timer = setTimeout(() => {
      setCurrentIndex(prev => (prev === allPhotos.length - 1 ? 0 : prev + 1))
    }, 5000)
    return () => clearTimeout(timer)
  }, [currentIndex, autoPlay, allPhotos.length])

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {currentUrl ? (
        <Image
          src={currentUrl}
          alt={`${title} - Foto ${currentIndex + 1}`}
          fill
          priority={currentIndex === 0}
          style={{ objectFit: 'cover' }}
          sizes="(max-width:680px) 100vw,(max-width:1024px) 50vw,33vw"
        />
      ) : (
        <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#e9e4dd,#d5cfc7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '2rem', opacity: 0.35 }}>🏠</span>
        </div>
      )}

      {allPhotos.length > 1 && (
        <>
          {/* Navigation arrows */}
          <button
            onClick={goToPrev}
            style={{
              position: 'absolute',
              left: '0.5rem',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(0, 0, 0, 0.6)',
              color: '#fff',
              border: 'none',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: '1.2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0, 0, 0, 0.8)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0, 0, 0, 0.6)')}
            aria-label="Foto precedente"
          >
            ‹
          </button>

          <button
            onClick={goToNext}
            style={{
              position: 'absolute',
              right: '0.5rem',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(0, 0, 0, 0.6)',
              color: '#fff',
              border: 'none',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: '1.2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0, 0, 0, 0.8)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0, 0, 0, 0.6)')}
            aria-label="Foto successiva"
          >
            ›
          </button>

          {/* Indicator dots */}
          <div
            style={{
              position: 'absolute',
              bottom: '0.5rem',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: '0.3rem',
              zIndex: 10,
            }}
          >
            {allPhotos.map((_, idx) => (
              <button
                key={idx}
                onClick={e => goToIndex(e, idx)}
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  border: 'none',
                  cursor: 'pointer',
                  background: idx === currentIndex ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.4)',
                  transition: 'background 0.2s',
                }}
                aria-label={`Vai alla foto ${idx + 1}`}
              />
            ))}
          </div>

          {/* Counter */}
          <div
            style={{
              position: 'absolute',
              bottom: '0.5rem',
              right: '0.5rem',
              background: 'rgba(0, 0, 0, 0.6)',
              color: '#fff',
              padding: '0.25rem 0.5rem',
              borderRadius: '4px',
              fontSize: '0.7rem',
              fontWeight: 600,
              zIndex: 10,
            }}
          >
            {currentIndex + 1}/{allPhotos.length}
          </div>
        </>
      )}
    </div>
  )
}

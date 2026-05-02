'use client'

import { useEffect, useState } from 'react'

type Props = {
  urls: string[]
  intervalMs?: number
}

export default function PhotoHeroCarousel({ urls, intervalMs = 5000 }: Props) {
  const [i, setI] = useState(0)
  const [autoPlay, setAutoPlay] = useState(true)

  const urlsKey = urls.join('|')
  useEffect(() => {
    setI(0)
    setAutoPlay(true)
  }, [urlsKey])

  useEffect(() => {
    if (urls.length <= 1 || !autoPlay) return
    const id = window.setTimeout(() => {
      setI(p => (p + 1) % urls.length)
    }, intervalMs)
    return () => window.clearTimeout(id)
  }, [urls.length, intervalMs, autoPlay, i])

  const goPrev = () => {
    setAutoPlay(false)
    setI(p => (p === 0 ? urls.length - 1 : p - 1))
  }

  const goNext = () => {
    setAutoPlay(false)
    setI(p => (p === urls.length - 1 ? 0 : p + 1))
  }

  const goIndex = (idx: number) => {
    setAutoPlay(false)
    setI(idx)
  }

  if (urls.length === 0) return null

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '16 / 9',
        borderRadius: 16,
        overflow: 'hidden',
        background: '#ece7e1',
        marginBottom: '1.25rem',
        border: '1.5px solid #e9e4dd',
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={urls[i]}
        alt=""
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
      {urls.length > 1 && (
        <>
          <button
            type="button"
            onClick={goPrev}
            aria-label="Foto precedente"
            style={{
              position: 'absolute',
              left: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(0,0,0,.55)',
              color: '#fff',
              border: 'none',
              width: 44,
              height: 44,
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: '1.35rem',
              lineHeight: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
            }}
          >
            ‹
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Foto successiva"
            style={{
              position: 'absolute',
              right: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(0,0,0,.55)',
              color: '#fff',
              border: 'none',
              width: 44,
              height: 44,
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: '1.35rem',
              lineHeight: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
            }}
          >
            ›
          </button>
          <div
            style={{
              position: 'absolute',
              bottom: 12,
              right: 12,
              background: 'rgba(12,12,10,.75)',
              color: '#fff',
              fontFamily: 'Syne, sans-serif',
              fontSize: 12,
              fontWeight: 700,
              padding: '6px 10px',
              borderRadius: 8,
            }}
          >
            {i + 1} / {urls.length}
          </div>
          <div
            style={{
              position: 'absolute',
              bottom: 12,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: 6,
            }}
          >
            {urls.map((_, idx) => (
              <button
                key={idx}
                type="button"
                aria-label={`Vai alla foto ${idx + 1}`}
                onClick={() => goIndex(idx)}
                style={{
                  width: idx === i ? 22 : 8,
                  height: 8,
                  borderRadius: 999,
                  border: 'none',
                  background: idx === i ? '#c4622d' : 'rgba(255,255,255,.55)',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'width .2s, background .2s',
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

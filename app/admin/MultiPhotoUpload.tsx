'use client'

import { useState, useCallback, useRef } from 'react'

type Photo = {
  id: string
  filename: string
  ordine: number
  url?: string
}

type Props = {
  immobileId: string
  photos: Photo[]
  onPhotosChange: (photos: Photo[]) => void
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''

function getPhotoUrl(filename: string) {
  if (!filename) return null
  if (filename.startsWith('http') || filename.startsWith('/')) return filename
  return `${SUPABASE_URL}/storage/v1/object/public/immobili/${filename}`
}

export default function MultiPhotoUpload({ immobileId, photos, onPhotosChange }: Props) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [hoveredPhotoId, setHoveredPhotoId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Drag & drop per upload
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      await uploadPhotos(files)
    }
  }

  const uploadPhotos = async (fileList: FileList) => {
    setUploading(true)
    setError('')

    try {
      const formData = new FormData()
      for (let i = 0; i < fileList.length; i++) {
        formData.append('photos', fileList[i])
      }

      const response = await fetch(`/api/admin/immobili/${immobileId}/photos/upload`, {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Errore upload')
        return
      }

      if (data.warning) {
        setError(`⚠️ ${data.warning}`)
      }

      // Aggiungi foto appena caricate alla lista
      const updatedPhotos = [...photos, ...(data.photos || [])]
      updatedPhotos.sort((a, b) => a.ordine - b.ordine)
      onPhotosChange(updatedPhotos)

      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (err) {
      setError('Errore imprevisto: ' + String(err))
    } finally {
      setUploading(false)
    }
  }

  const deleteAllPhotos = async () => {
    if (!confirm(`Eliminare tutte le ${photos.length} foto? Questa azione è irreversibile.`)) return
    for (const photo of photos) {
      await fetch(`/api/admin/immobili/${immobileId}/photos/${photo.id}`, { method: 'DELETE' })
    }
    onPhotosChange([])
  }

  const deletePhoto = async (photoId: string) => {
    if (!confirm('Elimina questa foto?')) return

    try {
      const response = await fetch(`/api/admin/immobili/${immobileId}/photos/${photoId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Errore eliminazione')
        return
      }

      // Rimuovi dalla lista
      const updated = photos.filter(p => p.id !== photoId)
      onPhotosChange(updated)
    } catch (err) {
      setError('Errore imprevisto: ' + String(err))
    }
  }

  // Drag to reorder
  const handleDragStart = (e: React.DragEvent, photoId: string) => {
    setDraggingId(photoId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDropReorder = async (e: React.DragEvent, targetPhotoId: string) => {
    e.preventDefault()
    if (!draggingId || draggingId === targetPhotoId) return

    const draggedPhoto = photos.find(p => p.id === draggingId)
    const targetPhoto = photos.find(p => p.id === targetPhotoId)

    if (!draggedPhoto || !targetPhoto) return

    // Swap ordine
    const updated = photos.map(p => {
      if (p.id === draggingId) return { ...p, ordine: targetPhoto.ordine }
      if (p.id === targetPhotoId) return { ...p, ordine: draggedPhoto.ordine }
      return p
    })

    updated.sort((a, b) => a.ordine - b.ordine)

    // Riassegna ordini consecutivi
    const reordered = updated.map((p, idx) => ({ ...p, ordine: idx }))

    // Sync con server
    try {
      const response = await fetch(`/api/admin/immobili/${immobileId}/photos/reorder`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photos: reordered.map(p => ({ id: p.id, ordine: p.ordine })),
        }),
      })

      if (response.ok) {
        onPhotosChange(reordered)
      }
    } catch (err) {
      console.error('Reorder error:', err)
    }

    setDraggingId(null)
  }

  return (
    <div style={{ marginTop: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1rem', fontWeight: 700, margin: 0 }}>
          📸 Galleria foto ({photos.length}/50)
        </h3>
        {photos.length > 0 && (
          <button
            type="button"
            onClick={deleteAllPhotos}
            style={{
              background: 'transparent',
              color: '#c0392b',
              border: '1px solid #c0392b',
              borderRadius: '8px',
              padding: '0.3rem 0.75rem',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Elimina tutte
          </button>
        )}
      </div>

      {/* Upload area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        style={{
          border: dragActive ? '3px dashed #c4622d' : '2px dashed #d5cfc7',
          borderRadius: '12px',
          padding: '2rem',
          textAlign: 'center',
          backgroundColor: dragActive ? 'rgba(196, 98, 45, 0.05)' : '#fff',
          transition: 'all 0.2s',
          marginBottom: '1.5rem',
          cursor: 'pointer',
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={e => uploadPhotos(e.target.files!)}
          style={{ display: 'none' }}
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          style={{
            background: '#0c0c0a',
            color: '#fff',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '10px',
            fontSize: '0.9rem',
            fontWeight: 700,
            cursor: 'pointer',
            opacity: uploading ? 0.6 : 1,
          }}
        >
          {uploading ? '⏳ Caricamento...' : '+ Seleziona foto (fino a 50)'}
        </button>

        <p style={{ fontSize: '0.85rem', color: '#999', marginTop: '0.75rem', margin: '0.75rem 0 0' }}>
          oppure trascina qui le foto (max 10MB cadauna)
        </p>
      </div>

      {/* Errors/warnings */}
      {error && (
        <p
          style={{
            borderRadius: '8px',
            padding: '0.75rem',
            marginBottom: '1rem',
            fontSize: '0.85rem',
            color: '#c0392b',
            backgroundColor: '#fff0f0',
            border: '1px solid #ffcccc',
          }}
        >
          {error}
        </p>
      )}

      {/* Photo grid */}
      {photos.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
            gap: '0.75rem',
            marginTop: '1rem',
          }}
        >
          {photos.map(photo => {
            const url = getPhotoUrl(photo.filename)
            return (
              <div
                key={photo.id}
                draggable
                onDragStart={e => handleDragStart(e, photo.id)}
                onDragOver={handleDragOver}
                onDrop={e => handleDropReorder(e, photo.id)}
                onMouseEnter={() => setHoveredPhotoId(photo.id)}
                onMouseLeave={() => setHoveredPhotoId(null)}
                style={{
                  position: 'relative',
                  aspectRatio: '1',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  backgroundColor: '#ece7e1',
                  cursor: 'move',
                  opacity: draggingId === photo.id ? 0.5 : 1,
                  transition: 'opacity 0.2s',
                  border: draggingId === photo.id ? '2px solid #c4622d' : 'none',
                }}
              >
                {url && (
                  <img
                    src={url}
                    alt="preview"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                )}

                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => deletePhoto(photo.id)}
                  style={{
                    position: 'absolute',
                    top: '0.25rem',
                    right: '0.25rem',
                    background: 'rgba(0,0,0,0.7)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '0.3rem 0.5rem',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    opacity: hoveredPhotoId === photo.id ? 1 : 0,
                    transition: 'opacity 0.2s',
                  }}
                >
                  ✕
                </button>

                {/* Order indicator */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '0.25rem',
                    left: '0.25rem',
                    background: 'rgba(0,0,0,0.7)',
                    color: '#fff',
                    borderRadius: '4px',
                    padding: '0.2rem 0.4rem',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                  }}
                >
                  #{photo.ordine + 1}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {photos.length === 0 && (
        <p style={{ textAlign: 'center', color: '#999', fontSize: '0.9rem', marginTop: '1rem' }}>
          Nessuna foto ancora. Carica le prime foto per iniziare!
        </p>
      )}
    </div>
  )
}

'use client'

import { useEffect } from 'react'
import { useEditMode } from '@/app/context/EditModeContext'

export default function AdminEditBar() {
  const { isAdmin, isEditing, saving, toggleEdit, save, discard } = useEditMode()

  // Imposta CSS var per abbassare header e home-button
  useEffect(() => {
    const root = document.documentElement
    if (isAdmin) {
      root.style.setProperty('--admin-bar', '44px')
    }
    return () => {
      root.style.removeProperty('--admin-bar')
    }
  }, [isAdmin])

  if (!isAdmin) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 44,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0 1.25rem',
        background: isEditing
          ? 'linear-gradient(90deg,#1a1a2e 0%,#16213e 100%)'
          : 'rgba(12,12,20,0.96)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: isEditing
          ? '2px solid #c4622d'
          : '1px solid rgba(255,255,255,0.08)',
        fontFamily: "'Syne',sans-serif",
      }}
    >
      {/* Label */}
      <span
        style={{
          fontSize: '0.62rem',
          fontWeight: 700,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: isEditing ? '#c4622d' : 'rgba(255,255,255,0.4)',
          userSelect: 'none',
        }}
      >
        Admin
      </span>

      {!isEditing ? (
        <button
          onClick={toggleEdit}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.26rem 0.85rem',
            borderRadius: 999,
            background: '#c4622d',
            color: '#fff',
            border: 'none',
            fontSize: '0.7rem',
            fontWeight: 700,
            letterSpacing: '0.04em',
            cursor: 'pointer',
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.background = '#a0501f'
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.background = '#c4622d'
          }}
        >
          ✏️ Edita pagina
        </button>
      ) : (
        <>
          <button
            onClick={save}
            disabled={saving}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.26rem 0.85rem',
              borderRadius: 999,
              background: saving ? '#444' : '#22c55e',
              color: '#fff',
              border: 'none',
              fontSize: '0.7rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              cursor: saving ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s',
            }}
          >
            {saving ? '⏳ Salvataggio…' : '💾 Salva modifiche'}
          </button>

          <button
            onClick={discard}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.26rem 0.85rem',
              borderRadius: 999,
              background: 'transparent',
              color: 'rgba(255,255,255,0.7)',
              border: '1px solid rgba(255,255,255,0.2)',
              fontSize: '0.7rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            ✕ Annulla
          </button>

          <span
            style={{
              color: '#f59e0b',
              fontSize: '0.66rem',
              marginLeft: '0.25rem',
              userSelect: 'none',
            }}
          >
            Clicca sui campi arancioni per modificarli
          </span>
        </>
      )}
    </div>
  )
}

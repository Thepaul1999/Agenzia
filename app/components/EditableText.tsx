'use client'

import { memo, useRef, useLayoutEffect, type CSSProperties } from 'react'
import { useEditMode } from '@/app/context/EditModeContext'
import { useLang } from '@/lib/useLang'
import { translations } from '@/lib/language'
import type { TR } from '@/lib/language'

type Props = {
  i18nKey: keyof TR
  as?: keyof React.JSX.IntrinsicElements
  className?: string
  style?: CSSProperties
}

/**
 * Renderizza un testo da translations + override DB.
 * Quando l'admin è in modalità edit, diventa contenteditable.
 */
export const EditableText = memo(function EditableText({
  i18nKey,
  as,
  className,
  style,
}: Props) {
  const { isEditing, dbOverrides, setPending } = useEditMode()
  const lang = useLang()

  const fallback =
    (translations[lang] as Record<string, string>)[i18nKey as string] ?? ''
  const savedValue =
    (dbOverrides[lang as 'it' | 'en'] as Record<string, string>)[
      i18nKey as string
    ] ?? fallback

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ref = useRef<any>(null)
  const Tag = (as || 'span') as React.ElementType
  const prevEditing = useRef(false)

  // Imposta il contenuto via DOM quando si entra in edit mode,
  // evitando che React resetti il cursore durante la digitazione.
  useLayoutEffect(() => {
    if (isEditing && !prevEditing.current && ref.current) {
      ref.current.textContent = savedValue
    }
    prevEditing.current = isEditing
  })

  if (!isEditing) {
    return (
      <Tag className={className} style={style}>
        {savedValue}
      </Tag>
    )
  }

  return (
    <Tag
      ref={ref}
      className={[className, 'ei-active'].filter(Boolean).join(' ')}
      style={style}
      contentEditable
      suppressContentEditableWarning
      onInput={(e: React.FormEvent<HTMLElement>) => {
        setPending(lang, i18nKey as string, e.currentTarget.textContent ?? '')
      }}
    />
  )
})

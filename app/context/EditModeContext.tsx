'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'

type Lang = 'it' | 'en'
type LangMap = Record<string, string>
type DbOverrides = Record<Lang, LangMap>
type PendingChanges = Record<Lang, LangMap>

type EditModeCtxType = {
  isAdmin: boolean
  isEditing: boolean
  saving: boolean
  dbOverrides: DbOverrides
  pending: PendingChanges
  toggleEdit: () => void
  setPending: (lang: string, key: string, value: string) => void
  save: () => Promise<void>
  discard: () => void
}

const EditModeContext = createContext<EditModeCtxType>({
  isAdmin: false,
  isEditing: false,
  saving: false,
  dbOverrides: { it: {}, en: {} },
  pending: { it: {}, en: {} },
  toggleEdit: () => {},
  setPending: () => {},
  save: async () => {},
  discard: () => {},
})

export function EditModeProvider({
  children,
  isAdmin: serverIsAdmin = false,
}: {
  children: ReactNode
  isAdmin?: boolean
}) {
  const [isAdmin, setIsAdmin] = useState(serverIsAdmin)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [dbOverrides, setDbOverrides] = useState<DbOverrides>({ it: {}, en: {} })
  const [pending, setPendingState] = useState<PendingChanges>({ it: {}, en: {} })

  useEffect(() => {
    // Verifica lato client (double-check rispetto al server)
    const admin = document.cookie.includes('site_admin=true')
    if (admin !== isAdmin) setIsAdmin(admin)

    if (admin || serverIsAdmin) {
      // Carica override da DB per entrambe le lingue
      Promise.all([
        fetch('/api/translations?lang=it').then((r) => r.json()).catch(() => ({})),
        fetch('/api/translations?lang=en').then((r) => r.json()).catch(() => ({})),
      ]).then(([it, en]) => {
        setDbOverrides({ it: it || {}, en: en || {} })
      })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const toggleEdit = useCallback(() => {
    setIsEditing((prev) => !prev)
    setPendingState({ it: {}, en: {} })
  }, [])

  const setPending = useCallback((lang: string, key: string, value: string) => {
    setPendingState((prev) => ({
      ...prev,
      [lang]: { ...(prev[lang as Lang] || {}), [key]: value },
    }))
  }, [])

  const save = useCallback(async () => {
    const hasChanges = (Object.values(pending) as LangMap[]).some(
      (l) => Object.keys(l).length > 0
    )
    if (!hasChanges) {
      setIsEditing(false)
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/admin/translations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ changes: pending }),
      })
      if (!res.ok) throw new Error('Save failed')

      setDbOverrides((prev) => ({
        it: { ...prev.it, ...pending.it },
        en: { ...prev.en, ...pending.en },
      }))
      setPendingState({ it: {}, en: {} })
      setIsEditing(false)
    } catch {
      alert('Errore nel salvataggio delle modifiche.')
    } finally {
      setSaving(false)
    }
  }, [pending])

  const discard = useCallback(() => {
    setPendingState({ it: {}, en: {} })
    setIsEditing(false)
  }, [])

  return (
    <EditModeContext.Provider
      value={{
        isAdmin,
        isEditing,
        saving,
        dbOverrides,
        pending,
        toggleEdit,
        setPending,
        save,
        discard,
      }}
    >
      {children}
    </EditModeContext.Provider>
  )
}

export const useEditMode = () => useContext(EditModeContext)

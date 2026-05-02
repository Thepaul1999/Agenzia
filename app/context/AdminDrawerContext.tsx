'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

type Ctx = {
  open: boolean
  setOpen: (next: boolean) => void
  openDrawer: () => void
  closeDrawer: () => void
}

const AdminDrawerContext = createContext<Ctx | null>(null)

export function AdminDrawerProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const openDrawer = useCallback(() => setOpen(true), [])
  const closeDrawer = useCallback(() => setOpen(false), [])

  const value = useMemo(
    () => ({ open, setOpen, openDrawer, closeDrawer }),
    [open, closeDrawer, openDrawer]
  )

  return (
    <AdminDrawerContext.Provider value={value}>{children}</AdminDrawerContext.Provider>
  )
}

export function useAdminDrawer(): Ctx {
  const c = useContext(AdminDrawerContext)
  if (!c) throw new Error('useAdminDrawer must be inside AdminDrawerProvider')
  return c
}

/** Per header pubblico quando il provider non è montato */
export function useOptionalAdminDrawer(): Ctx | null {
  return useContext(AdminDrawerContext)
}

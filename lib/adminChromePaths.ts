/** Route dove compare la barra admin sul sito (stessa vista visitatore). */
export function isAdminBrowseMirror(pathname: string): boolean {
  if (pathname === '/admin/home') return true
  if (pathname === '/admin/immobili') return true
  if (pathname.startsWith('/admin/immobili/') && !pathname.startsWith('/admin/immobili/gestione')) {
    return true
  }
  return false
}

/** Barra pubblica tipo SiteAdminLayer (home, immobili, …) quando l’admin è loggato. */
export function isPublicAdminChromePath(pathname: string): boolean {
  if (pathname === '/home' || pathname === '/') return true
  if (pathname === '/immobili') return true
  if (
    pathname.startsWith('/immobili/') &&
    pathname !== '/immobili/create' &&
    !pathname.startsWith('/immobili/create/')
  ) {
    return true
  }
  return isAdminBrowseMirror(pathname)
}

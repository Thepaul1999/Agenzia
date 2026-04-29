'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useRef, useState, useTransition } from 'react'
import { useLang } from '@/lib/useLang'
import { translations } from '@/lib/language'

type Filter = 'tutti' | 'vendita' | 'affitto'

type Props = {
  current: Filter
  currentQ: string
  currentPrezzoMin: string
  currentPrezzoMax: string
  currentMqMin: string
  currentView: 'lista' | 'mappa'
}

export default function ImmobiliFilter({ current, currentQ, currentPrezzoMin, currentPrezzoMax, currentMqMin, currentView }: Props) {
  const lang = useLang()
  const t = translations[lang]
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()
  const [searchValue, setSearchValue] = useState(currentQ)
  const [prezzoMin, setPrezzoMin] = useState(currentPrezzoMin)
  const [prezzoMax, setPrezzoMax] = useState(currentPrezzoMax)
  const [mqMin, setMqMin] = useState(currentMqMin)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [showFilters, setShowFilters] = useState(
    !!(currentPrezzoMin || currentPrezzoMax || currentMqMin)
  )

  const buildUrl = (tipo: Filter, q: string, pMin: string, pMax: string, mMin: string, view: 'lista' | 'mappa') => {
    const params = new URLSearchParams(searchParams.toString())
    if (tipo !== 'tutti') params.set('tipo', tipo); else params.delete('tipo')
    if (q.trim()) params.set('q', q.trim()); else params.delete('q')
    if (pMin.trim()) params.set('pmin', pMin.trim()); else params.delete('pmin')
    if (pMax.trim()) params.set('pmax', pMax.trim()); else params.delete('pmax')
    if (mMin.trim()) params.set('mqmin', mMin.trim()); else params.delete('mqmin')
    if (view === 'mappa') params.set('view', 'mappa'); else params.delete('view')
    const qs = params.toString()
    return qs ? `${pathname}?${qs}` : pathname
  }

  const push = (tipo: Filter, q: string, pMin: string, pMax: string, mMin: string, view = currentView) => {
    startTransition(() => {
      router.push(buildUrl(tipo, q, pMin, pMax, mMin, view), { scroll: false })
    })
  }

  const setFilter = (tipo: Filter) => push(tipo, searchValue, prezzoMin, prezzoMax, mqMin)
  const setView = (view: 'lista' | 'mappa') => push(current, searchValue, prezzoMin, prezzoMax, mqMin, view)

  const handleSearch = (value: string) => {
    setSearchValue(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => push(current, value, prezzoMin, prezzoMax, mqMin, currentView), 350)
  }

  const handlePrezzoMin = (v: string) => {
    setPrezzoMin(v)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => push(current, searchValue, v, prezzoMax, mqMin, currentView), 600)
  }
  const handlePrezzoMax = (v: string) => {
    setPrezzoMax(v)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => push(current, searchValue, prezzoMin, v, mqMin, currentView), 600)
  }
  const handleMqMin = (v: string) => {
    setMqMin(v)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => push(current, searchValue, prezzoMin, prezzoMax, v, currentView), 600)
  }

  const resetFilters = () => {
    setPrezzoMin('')
    setPrezzoMax('')
    setMqMin('')
    push(current, searchValue, '', '', '', currentView)
  }

  const hasActiveFilters = !!(prezzoMin || prezzoMax || mqMin)

  const tabs: { key: Filter; label: string }[] = [
    { key: 'tutti', label: t.filterAll },
    { key: 'vendita', label: t.filterSale },
    { key: 'affitto', label: t.filterRent },
  ]

  return (
    <div className="imm-controls">
      {/* Vista toggle */}
      <div className="imm-view-toggle">
        <button
          type="button"
          className={`imm-view-btn${currentView === 'lista' ? ' imm-view-btn--active' : ''}`}
          onClick={() => setView('lista')}
        >
          ☰ {t.listView}
        </button>
        <button
          type="button"
          className={`imm-view-btn${currentView === 'mappa' ? ' imm-view-btn--active' : ''}`}
          onClick={() => setView('mappa')}
        >
          🗺 {t.mapView}
        </button>
      </div>

      <div className="imm-filter-tabs">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            className={`imm-filter-tab ${current === key ? 'imm-filter-tab--active' : ''}`}
            onClick={() => setFilter(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="imm-search-wrap">
        <span className="imm-search-icon">🔍</span>
        <input
          type="search"
          className="imm-search-input"
          placeholder={t.searchPlaceholder}
          value={searchValue}
          onChange={e => handleSearch(e.target.value)}
        />
      </div>

      <button
        type="button"
        className={`imm-adv-toggle${hasActiveFilters ? ' imm-adv-toggle--active' : ''}`}
        onClick={() => setShowFilters(v => !v)}
      >
        ⚙ {t.filtersLabel}{hasActiveFilters ? ' ●' : ''}
      </button>

      {showFilters && (
        <div className="imm-adv-filters">
          <div className="imm-adv-row">
            <div className="imm-adv-field">
              <label className="imm-adv-label">{t.priceMin}</label>
              <input
                type="number"
                className="imm-adv-input"
                placeholder="es. 50000"
                value={prezzoMin}
                min={0}
                onChange={e => handlePrezzoMin(e.target.value)}
              />
            </div>
            <div className="imm-adv-field">
              <label className="imm-adv-label">{t.priceMax}</label>
              <input
                type="number"
                className="imm-adv-input"
                placeholder="es. 500000"
                value={prezzoMax}
                min={0}
                onChange={e => handlePrezzoMax(e.target.value)}
              />
            </div>
            <div className="imm-adv-field">
              <label className="imm-adv-label">{t.sqmMin}</label>
              <input
                type="number"
                className="imm-adv-input"
                placeholder="es. 80"
                value={mqMin}
                min={0}
                onChange={e => handleMqMin(e.target.value)}
              />
            </div>
            {hasActiveFilters && (
              <button type="button" className="imm-adv-reset" onClick={resetFilters}>
                ✕ {t.resetFilters}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

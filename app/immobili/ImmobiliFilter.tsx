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
  currentLocali: string
  currentSort: string
  currentView: 'lista' | 'mappa'
}

const IconSearch = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
)
const IconList = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
    <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>
)
const IconMap = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/>
  </svg>
)
const IconSort = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="9" y1="18" x2="15" y2="18"/>
  </svg>
)
const IconChevron = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
)
const IconX = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

export default function ImmobiliFilter({
  current, currentQ, currentPrezzoMin, currentPrezzoMax, currentMqMin,
  currentLocali, currentSort, currentView
}: Props) {
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
  const [showAdvanced, setShowAdvanced] = useState(!!(currentPrezzoMin || currentPrezzoMax || currentMqMin))
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const buildUrl = (
    tipo: Filter, q: string, pMin: string, pMax: string,
    mMin: string, locali: string, sort: string, view: 'lista' | 'mappa'
  ) => {
    const params = new URLSearchParams(searchParams.toString())
    if (tipo !== 'tutti') params.set('tipo', tipo); else params.delete('tipo')
    if (q.trim()) params.set('q', q.trim()); else params.delete('q')
    if (pMin.trim()) params.set('pmin', pMin.trim()); else params.delete('pmin')
    if (pMax.trim()) params.set('pmax', pMax.trim()); else params.delete('pmax')
    if (mMin.trim()) params.set('mqmin', mMin.trim()); else params.delete('mqmin')
    if (locali.trim()) params.set('locali', locali.trim()); else params.delete('locali')
    if (sort && sort !== 'newest') params.set('sort', sort); else params.delete('sort')
    if (view === 'mappa') params.set('view', 'mappa'); else params.delete('view')
    const qs = params.toString()
    return qs ? `${pathname}?${qs}` : pathname
  }

  const push = (
    tipo: Filter, q: string, pMin: string, pMax: string,
    mMin: string, locali = currentLocali, sort = currentSort, view = currentView
  ) => {
    startTransition(() => {
      router.push(buildUrl(tipo, q, pMin, pMax, mMin, locali, sort, view), { scroll: false })
    })
  }

  const setFilter = (tipo: Filter) => push(tipo, searchValue, prezzoMin, prezzoMax, mqMin)
  const setView = (view: 'lista' | 'mappa') => push(current, searchValue, prezzoMin, prezzoMax, mqMin, currentLocali, currentSort, view)
  const setSort = (sort: string) => push(current, searchValue, prezzoMin, prezzoMax, mqMin, currentLocali, sort)
  const setLocali = (locali: string) => push(current, searchValue, prezzoMin, prezzoMax, mqMin, locali)

  const handleSearch = (value: string) => {
    setSearchValue(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => push(current, value, prezzoMin, prezzoMax, mqMin), 350)
  }

  const handlePrezzoMin = (v: string) => {
    setPrezzoMin(v)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => push(current, searchValue, v, prezzoMax, mqMin), 600)
  }
  const handlePrezzoMax = (v: string) => {
    setPrezzoMax(v)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => push(current, searchValue, prezzoMin, v, mqMin), 600)
  }
  const handleMqMin = (v: string) => {
    setMqMin(v)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => push(current, searchValue, prezzoMin, prezzoMax, v), 600)
  }

  const resetAll = () => {
    setSearchValue('')
    setPrezzoMin('')
    setPrezzoMax('')
    setMqMin('')
    push(current, '', '', '', '', '', 'newest')
  }

  const hasActiveFilters = !!(searchValue || prezzoMin || prezzoMax || mqMin || currentLocali)

  const tabs: { key: Filter; label: string }[] = [
    { key: 'tutti', label: t.filterAll },
    { key: 'vendita', label: t.filterSale },
    { key: 'affitto', label: t.filterRent },
  ]

  const localiOptions = [
    { value: '', label: 'Qualsiasi' },
    { value: '1', label: '1+' },
    { value: '2', label: '2+' },
    { value: '3', label: '3+' },
    { value: '4', label: '4+' },
  ]

  const sortOptions = [
    { value: 'newest', label: 'Più recenti' },
    { value: 'price_asc', label: 'Prezzo crescente' },
    { value: 'price_desc', label: 'Prezzo decrescente' },
  ]

  return (
    <div className="imm-controls">

      {/* ── Riga 1: tipo tabs + sort + view toggle ── */}
      <div className="imm-controls-top">
        <div className="imm-filter-tabs">
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              className={`imm-filter-tab${current === key ? ' imm-filter-tab--active' : ''}`}
              onClick={() => setFilter(key)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="imm-controls-right">
          {/* Ordina per */}
          <div className="imm-sort-wrap">
            <IconSort />
            <select
              className="imm-sort-select"
              value={currentSort}
              onChange={e => setSort(e.target.value)}
              aria-label="Ordina per"
            >
              {sortOptions.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <IconChevron />
          </div>

          {/* Vista Lista / Mappa */}
          <div className="imm-view-toggle">
            <button
              type="button"
              className={`imm-view-btn${currentView === 'lista' ? ' imm-view-btn--active' : ''}`}
              onClick={() => setView('lista')}
              title="Vista lista"
            >
              <IconList />
              <span>{t.listView}</span>
            </button>
            <button
              type="button"
              className={`imm-view-btn${currentView === 'mappa' ? ' imm-view-btn--active' : ''}`}
              onClick={() => setView('mappa')}
              title="Vista mappa"
            >
              <IconMap />
              <span>{t.mapView}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Riga 2: barra filtri orizzontale ── */}
      <div className="imm-filter-bar">
        {/* Ricerca */}
        <div className="imm-search-wrap">
          <span className="imm-search-icon"><IconSearch /></span>
          <input
            type="search"
            className="imm-search-input"
            placeholder={t.searchPlaceholder}
            value={searchValue}
            onChange={e => handleSearch(e.target.value)}
          />
        </div>

        {/* Locali */}
        <div className="imm-fb-group">
          <label className="imm-fb-label">Locali</label>
          <div className="imm-fb-select-wrap">
            <select
              className="imm-fb-select"
              value={currentLocali}
              onChange={e => setLocali(e.target.value)}
              aria-label="Numero locali"
            >
              {localiOptions.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <span className="imm-fb-chevron"><IconChevron /></span>
          </div>
        </div>

        {/* Prezzo range — inline compact */}
        <div className="imm-fb-group">
          <label className="imm-fb-label">Prezzo min</label>
          <input
            type="number"
            className="imm-fb-input"
            placeholder="es. 50.000"
            value={prezzoMin}
            min={0}
            onChange={e => handlePrezzoMin(e.target.value)}
          />
        </div>
        <div className="imm-fb-group">
          <label className="imm-fb-label">Prezzo max</label>
          <input
            type="number"
            className="imm-fb-input"
            placeholder="es. 500.000"
            value={prezzoMax}
            min={0}
            onChange={e => handlePrezzoMax(e.target.value)}
          />
        </div>

        {/* m² min */}
        <div className="imm-fb-group">
          <label className="imm-fb-label">m² minimi</label>
          <input
            type="number"
            className="imm-fb-input"
            placeholder="es. 80"
            value={mqMin}
            min={0}
            onChange={e => handleMqMin(e.target.value)}
          />
        </div>

        {/* Reset — solo se filtri attivi */}
        {hasActiveFilters && (
          <button type="button" className="imm-fb-reset" onClick={resetAll} title="Rimuovi tutti i filtri">
            <IconX />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  )
}

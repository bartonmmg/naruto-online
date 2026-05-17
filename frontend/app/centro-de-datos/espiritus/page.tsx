'use client'

import { useEffect, useState } from 'react'
import { Search, X, Filter } from 'lucide-react'
import api from '@/lib/api'
import { GameSpirit, SpiritListResponse, SpiritFiltersResponse } from '@/lib/types'
import Navbar from '@/components/Navbar'
import LoadingSpinner from '@/components/LoadingSpinner'
import SpiritCard from '@/components/spirits/SpiritCard'

export default function SpiritsPage() {
  const [items, setItems] = useState<GameSpirit[]>([])
  const [total, setTotal] = useState<number | null>(null)
  const [filters, setFilters] = useState<SpiritFiltersResponse | null>(null)
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [searchDebounced, setSearchDebounced] = useState('')
  const [type, setType] = useState<number | null>(null)
  const [trigger, setTrigger] = useState<string | null>(null)
  const [apply, setApply] = useState<string | null>(null)

  const [showFiltersMobile, setShowFiltersMobile] = useState(false)

  useEffect(() => {
    api.get<SpiritFiltersResponse>('/game/spirits/filters').then((r) => setFilters(r.data)).catch(console.error)
  }, [])

  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(search.trim()), 250)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    setLoading(true)
    const params: Record<string, any> = {}
    if (searchDebounced) params.search = searchDebounced
    if (type !== null) params.type = type
    if (trigger) params.trigger = trigger
    if (apply) params.apply = apply
    api
      .get<SpiritListResponse>('/game/spirits', { params })
      .then((r) => {
        setItems(r.data.items)
        if (!searchDebounced && type === null && !trigger && !apply) setTotal(r.data.total)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [searchDebounced, type, trigger, apply])

  const totalLabel = total ?? items.length
  const activeFilters = (type !== null ? 1 : 0) + (trigger ? 1 : 0) + (apply ? 1 : 0)

  const clearFilters = () => {
    setType(null)
    setTrigger(null)
    setApply(null)
    setSearch('')
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-bg-primary pt-24 pb-16">
        {/* Hero banner */}
        <div className="relative overflow-hidden border-b border-power-red/15 mb-8">
          <span
            aria-hidden
            className="absolute -right-16 -top-28 select-none pointer-events-none font-cinzel text-[26rem] leading-none text-power-red/[0.06]"
          >
            獣
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-bg-primary via-bg-primary/95 to-transparent pointer-events-none" />
          <div className="relative max-w-7xl mx-auto px-6 py-10">
            <div className="flex items-center gap-3 text-power-red text-xs uppercase tracking-[0.3em] font-bold mb-2">
              <span className="h-px w-8 bg-power-red/40" />
              Centro de Datos
            </div>
            <h1 className="font-cinzel text-5xl md:text-6xl font-bold text-text-primary leading-none mb-3">
              Espíritus Animales
            </h1>
            <p className="text-text-muted max-w-xl">
              Compañeros invocables que potencian a tu equipo en combate.
              {total !== null && ` ${total} disponibles en la región España + Latinoamérica.`}
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6">
          {/* Search + mobile filter trigger */}
          <div className="flex flex-col md:flex-row gap-3 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre, habilidad o descripción…"
                className="w-full bg-bg-card border border-border rounded-lg pl-10 pr-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-orange transition-colors"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                >
                  <X size={18} />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFiltersMobile(true)}
              className="md:hidden flex items-center gap-2 bg-bg-card border border-border rounded-lg px-4 py-3 text-text-primary"
            >
              <Filter size={18} />
              Filtros
              {activeFilters > 0 && (
                <span className="bg-accent-orange text-bg-primary rounded-full w-5 h-5 text-xs flex items-center justify-center font-bold">
                  {activeFilters}
                </span>
              )}
            </button>
          </div>

          <div className="flex gap-6">
            {/* Sidebar filtros */}
            <aside
              className={`
                ${showFiltersMobile ? 'fixed inset-0 z-40 bg-bg-primary p-6 overflow-y-auto' : 'hidden'}
                md:block md:relative md:inset-auto md:p-0 md:bg-transparent md:w-64 md:flex-shrink-0
              `}
            >
              <div className="md:sticky md:top-28">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-cinzel font-bold text-text-primary">Filtros</h3>
                  <div className="flex gap-2">
                    {activeFilters > 0 && (
                      <button onClick={clearFilters} className="text-xs text-accent-orange hover:underline">
                        Limpiar
                      </button>
                    )}
                    <button onClick={() => setShowFiltersMobile(false)} className="md:hidden text-text-muted">
                      <X size={20} />
                    </button>
                  </div>
                </div>

                {filters && (
                  <>
                    <TypeFilterGroup
                      label="Tipo"
                      facets={filters.type}
                      selected={type}
                      onSelect={setType}
                    />
                    <KeywordFilterGroup
                      label="Se desencadena con"
                      facets={filters.trigger}
                      selected={trigger}
                      onSelect={setTrigger}
                      accent="chakra"
                    />
                    <KeywordFilterGroup
                      label="Aplica"
                      facets={filters.apply}
                      selected={apply}
                      onSelect={setApply}
                      accent="orange"
                    />
                  </>
                )}
              </div>
            </aside>

            {/* Grid */}
            <div className="flex-1 min-w-0">
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <LoadingSpinner />
                </div>
              ) : items.length === 0 ? (
                <div className="text-center py-20 text-text-muted">
                  <p className="text-lg mb-2">No se encontraron espíritus</p>
                  <p className="text-sm">Probá ajustar los filtros o el término de búsqueda.</p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-text-muted mb-4">
                    {searchDebounced || activeFilters > 0
                      ? `${items.length} de ${totalLabel} espíritus`
                      : `${totalLabel} espíritus`}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                    {items.map((s) => (
                      <SpiritCard key={s.id} spirit={s} />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

function TypeFilterGroup({
  label,
  facets,
  selected,
  onSelect,
}: {
  label: string
  facets: { code: number; label: string; count: number }[]
  selected: number | null
  onSelect: (v: number | null) => void
}) {
  return (
    <div className="mb-5">
      <h4 className="text-[10px] uppercase tracking-[0.2em] text-text-muted mb-2 font-bold">{label}</h4>
      <div className="flex flex-col gap-1">
        <FilterBtn active={selected === null} onClick={() => onSelect(null)}>
          Todos
        </FilterBtn>
        {facets.map((f) => (
          <FilterBtn key={f.code} active={selected === f.code} onClick={() => onSelect(f.code)} count={f.count}>
            {f.label}
          </FilterBtn>
        ))}
      </div>
    </div>
  )
}

function KeywordFilterGroup({
  label,
  facets,
  selected,
  onSelect,
  accent,
}: {
  label: string
  facets: { label: string; count: number }[]
  selected: string | null
  onSelect: (v: string | null) => void
  accent: 'chakra' | 'orange'
}) {
  const indicator = accent === 'chakra' ? '⚡' : '◆'
  return (
    <div className="mb-5">
      <h4 className="text-[10px] uppercase tracking-[0.2em] text-text-muted mb-2 font-bold">{label}</h4>
      <div className="flex flex-col gap-1">
        <FilterBtn active={selected === null} onClick={() => onSelect(null)}>
          Todos
        </FilterBtn>
        {facets.map((f) => (
          <FilterBtn
            key={f.label}
            active={selected === f.label}
            onClick={() => onSelect(f.label)}
            count={f.count}
          >
            <span className={accent === 'chakra' ? 'text-chakra-blue' : 'text-accent-orange'}>{indicator}</span>{' '}
            {f.label}
          </FilterBtn>
        ))}
      </div>
    </div>
  )
}

function FilterBtn({
  active,
  onClick,
  count,
  children,
}: {
  active: boolean
  onClick: () => void
  count?: number
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-between gap-2 text-left text-sm px-3 py-1.5 rounded border transition-colors ${
        active
          ? 'bg-accent-orange/20 border-accent-orange text-text-primary'
          : 'bg-bg-card border-border text-text-muted hover:text-text-primary'
      }`}
    >
      <span className="truncate">{children}</span>
      {count !== undefined && <span className="text-xs opacity-60 font-mono flex-shrink-0">{count}</span>}
    </button>
  )
}

'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Search, Filter, X, ChevronRight } from 'lucide-react'
import api from '@/lib/api'
import {
  GameNinjaSummary,
  NinjaFilterFacet,
  NinjaFiltersResponse,
  NinjaListResponse,
  PROPERTY_COLORS,
  PROPERTY_KANJI,
} from '@/lib/types'
import { NINJA_TYPE_GROUPS, findGroupForType, MAPPED_TYPES } from '@/lib/ninja-type-groups'
import Navbar from '@/components/Navbar'
import NinjaCard from '@/components/ninjas/NinjaCard'
import LoadingSpinner from '@/components/LoadingSpinner'

type SortKey = 'name' | 'rareness' | 'ninjaAttack' | 'bodyAttack' | 'life'

const SORT_LABELS: Record<SortKey, string> = {
  name: 'Nombre (A-Z)',
  rareness: 'Rareza',
  ninjaAttack: 'Ataque Ninjutsu',
  bodyAttack: 'Ataque Cuerpo',
  life: 'Vida',
}

const PAGE_SIZE = 24

export default function NinjasPage() {
  const [items, setItems] = useState<GameNinjaSummary[]>([])
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [filters, setFilters] = useState<NinjaFiltersResponse | null>(null)

  const [search, setSearch] = useState('')
  const [searchDebounced, setSearchDebounced] = useState('')
  const [property, setProperty] = useState<number | null>(null)
  const [ninjaType, setNinjaType] = useState<string | null>(null)
  const [rareness, setRareness] = useState<number | null>(null)
  const [sort, setSort] = useState<SortKey>('name')

  const [showFiltersMobile, setShowFiltersMobile] = useState(false)

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(search.trim()), 300)
    return () => clearTimeout(t)
  }, [search])

  // Load facets once
  useEffect(() => {
    api.get<NinjaFiltersResponse>('/game/ninjas/filters').then((r) => setFilters(r.data)).catch(console.error)
  }, [])

  // Reload list when filters change
  useEffect(() => {
    setLoading(true)
    const params: Record<string, any> = { limit: PAGE_SIZE, offset: 0, sort }
    if (searchDebounced) params.search = searchDebounced
    if (property !== null) params.property = property
    if (ninjaType !== null) params.ninjaType = ninjaType
    if (rareness !== null) params.rareness = rareness
    api
      .get<NinjaListResponse>('/game/ninjas', { params })
      .then((r) => {
        setItems(r.data.items)
        setTotal(r.data.pagination.total)
        setHasMore(r.data.pagination.hasMore)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [searchDebounced, property, ninjaType, rareness, sort])

  const loadMore = async () => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    const params: Record<string, any> = { limit: PAGE_SIZE, offset: items.length, sort }
    if (searchDebounced) params.search = searchDebounced
    if (property !== null) params.property = property
    if (ninjaType !== null) params.ninjaType = ninjaType
    if (rareness !== null) params.rareness = rareness
    try {
      const r = await api.get<NinjaListResponse>('/game/ninjas', { params })
      setItems((prev) => [...prev, ...r.data.items])
      setHasMore(r.data.pagination.hasMore)
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingMore(false)
    }
  }

  // IntersectionObserver para infinite scroll
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    if (!sentinelRef.current) return
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore()
      },
      { rootMargin: '300px' }
    )
    obs.observe(sentinelRef.current)
    return () => obs.disconnect()
  }, [items.length, hasMore, loadingMore])

  const activeFilters = (property !== null ? 1 : 0) + (ninjaType !== null ? 1 : 0) + (rareness !== null ? 1 : 0)

  const clearFilters = () => {
    setProperty(null)
    setNinjaType(null)
    setRareness(null)
    setSearch('')
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-bg-primary pt-24 pb-16">
        {/* Hero banner con kanji decorativo */}
        <div className="relative overflow-hidden border-b border-power-red/15 mb-8">
          <span
            aria-hidden
            className="absolute -right-16 -top-24 select-none pointer-events-none font-cinzel text-[26rem] leading-none text-power-red/[0.07]"
          >
            忍
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-bg-primary via-bg-primary/95 to-transparent pointer-events-none" />
          <div className="relative max-w-7xl mx-auto px-6 py-10">
            <div className="flex items-center gap-3 text-power-red text-xs uppercase tracking-[0.3em] font-bold mb-2">
              <span className="h-px w-8 bg-power-red/40" />
              Centro de Datos
            </div>
            <h1 className="font-cinzel text-5xl md:text-6xl font-bold text-text-primary leading-none mb-3">
              Ninjas
            </h1>
            <p className="text-text-muted whitespace-nowrap">
              {filters
                ? `Catálogo completo de los ${filters.total.toLocaleString('es')} ninjas disponibles en la región España + Latinoamérica.`
                : 'Cargando catálogo…'}
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6">

          {/* Search + sort + mobile filter trigger */}
          <div className="flex flex-col md:flex-row gap-3 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre o variante…"
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
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="bg-bg-card border border-border rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-accent-orange"
            >
              {Object.entries(SORT_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  Ordenar: {v}
                </option>
              ))}
            </select>
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
              <div className="md:sticky md:top-24 md:max-h-[calc(100vh-7rem)] md:overflow-y-auto md:pr-2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-cinzel font-bold text-text-primary">Filtros</h3>
                  <div className="flex gap-2">
                    {activeFilters > 0 && (
                      <button onClick={clearFilters} className="text-xs text-accent-orange hover:underline">
                        Limpiar
                      </button>
                    )}
                    <button
                      onClick={() => setShowFiltersMobile(false)}
                      className="md:hidden text-text-muted"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>

                {filters && (
                  <>
                    <FilterGroup
                      label="Elemento"
                      facets={filters.property}
                      selected={property}
                      onSelect={setProperty}
                      withKanji
                    />
                    <TypeFilterGroup
                      label="Tipo"
                      facets={filters.ninjaTypes ?? []}
                      selected={ninjaType}
                      onSelect={setNinjaType}
                    />
                    <FilterGroup
                      label="Rareza"
                      facets={filters.rareness}
                      selected={rareness}
                      onSelect={setRareness}
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
                  <p className="text-lg mb-2">No se encontraron ninjas</p>
                  <p className="text-sm">Probá ajustar los filtros o el término de búsqueda.</p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-text-muted mb-4">
                    Mostrando {items.length} de {total.toLocaleString('es')}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                    {items.map((n) => (
                      <NinjaCard key={n.id} ninja={n} />
                    ))}
                  </div>
                  <div ref={sentinelRef} className="h-10 flex items-center justify-center mt-6">
                    {loadingMore && <LoadingSpinner />}
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
  facets: { label: string; count: number }[]
  selected: string | null
  onSelect: (v: string | null) => void
}) {
  const byLabel = useMemo(() => new Map(facets.map((f) => [f.label, f.count])), [facets])

  // Default: expandir solo el grupo que contiene el tipo seleccionado
  const initialOpen = useMemo<Record<string, boolean>>(() => {
    if (!selected) return {}
    const g = findGroupForType(selected)
    return g ? { [g.label]: true } : {}
  }, [selected])
  const [open, setOpen] = useState<Record<string, boolean>>(initialOpen)
  useEffect(() => {
    setOpen(initialOpen)
  }, [initialOpen])

  // Detectar tipos del backend que no estén mapeados a ningún grupo
  useEffect(() => {
    const orphans = facets.map((f) => f.label).filter((l) => !MAPPED_TYPES.has(l))
    if (orphans.length) {
      // eslint-disable-next-line no-console
      console.warn('[TypeFilter] Tipos sin grupo asignado:', orphans)
    }
  }, [facets])

  const chipClass = (active: boolean) =>
    `text-left text-sm px-3 py-1.5 rounded border transition-colors ${
      active
        ? 'bg-accent-orange/20 border-accent-orange text-text-primary'
        : 'bg-bg-card border-border text-text-muted hover:text-text-primary'
    }`

  const toggle = (g: string) => setOpen((p) => ({ ...p, [g]: !p[g] }))

  return (
    <div className="mb-5">
      <h4 className="text-[10px] uppercase tracking-[0.2em] text-text-muted mb-2 font-bold">{label}</h4>
      <div className="flex flex-col gap-1">
        <button onClick={() => onSelect(null)} className={chipClass(selected === null)}>
          Todos
        </button>
      </div>
      {NINJA_TYPE_GROUPS.map((group) => {
        const groupFacets = group.types
          .map((t) => ({ label: t, count: byLabel.get(t) ?? 0 }))
          .filter((f) => f.count > 0)
        if (!groupFacets.length) return null
        const groupTotal = groupFacets.reduce((s, f) => s + f.count, 0)
        const isOpen = !!open[group.label]
        const hasSelected = groupFacets.some((f) => f.label === selected)
        return (
          <div key={group.label} className="mt-2">
            <button
              onClick={() => toggle(group.label)}
              className={`w-full flex items-center justify-between gap-2 text-left text-xs uppercase tracking-wider font-bold py-1.5 px-2 rounded transition-colors ${
                hasSelected
                  ? 'text-accent-orange hover:bg-accent-orange/10'
                  : 'text-text-primary/80 hover:text-text-primary hover:bg-bg-card'
              }`}
              aria-expanded={isOpen}
            >
              <span className="flex items-center gap-2">
                <ChevronRight
                  size={12}
                  className={`transition-transform ${isOpen ? 'rotate-90' : ''}`}
                />
                {group.label}
              </span>
              <span className="text-[10px] opacity-60 font-mono">{groupTotal}</span>
            </button>
            {isOpen && (
              <div className="flex flex-col gap-1 mt-1 pl-3">
                {groupFacets.map((f) => (
                  <button
                    key={f.label}
                    onClick={() => onSelect(f.label)}
                    className={`flex items-center justify-between ${chipClass(selected === f.label)}`}
                  >
                    <span className="truncate">{f.label}</span>
                    <span className="text-xs opacity-60 font-mono flex-shrink-0">{f.count}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function FilterGroup({
  label,
  facets,
  selected,
  onSelect,
  withKanji = false,
}: {
  label: string
  facets: NinjaFilterFacet[]
  selected: number | null
  onSelect: (v: number | null) => void
  withKanji?: boolean
}) {
  return (
    <div className="mb-5">
      <h4 className="text-[10px] uppercase tracking-[0.2em] text-text-muted mb-2 font-bold">{label}</h4>
      <div className="flex flex-col gap-1">
        <button
          onClick={() => onSelect(null)}
          className={`text-left text-sm px-3 py-1.5 rounded border transition-colors ${
            selected === null
              ? 'bg-accent-orange/20 border-accent-orange text-text-primary'
              : 'bg-bg-card border-border text-text-muted hover:text-text-primary'
          }`}
        >
          Todos
        </button>
        {facets.map((f) => {
          const isSelected = selected === f.code
          const propColor = withKanji ? PROPERTY_COLORS[f.code] ?? PROPERTY_COLORS[0] : null
          const kanji = withKanji ? PROPERTY_KANJI[f.code] : null
          return (
            <button
              key={f.code}
              onClick={() => onSelect(f.code)}
              className={`flex items-center justify-between text-left text-sm px-3 py-1.5 rounded border transition-colors ${
                isSelected
                  ? 'bg-accent-orange/20 border-accent-orange text-text-primary'
                  : 'bg-bg-card border-border text-text-muted hover:text-text-primary'
              }`}
            >
              <span className="flex items-center gap-2">
                {kanji && (
                  <span className={`text-base leading-none ${propColor?.text ?? ''} font-cinzel`}>
                    {kanji}
                  </span>
                )}
                {f.label}
              </span>
              <span className="text-xs opacity-60 font-mono">{f.count}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

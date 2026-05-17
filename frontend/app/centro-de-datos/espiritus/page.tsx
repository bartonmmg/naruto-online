'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Search, X } from 'lucide-react'
import api from '@/lib/api'
import { GameSpirit, SpiritListResponse, spiritImageSrc } from '@/lib/types'
import Navbar from '@/components/Navbar'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function SpiritsPage() {
  const [items, setItems] = useState<GameSpirit[]>([])
  const [total, setTotal] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [searchDebounced, setSearchDebounced] = useState('')

  // Total nunca cambia: el primer fetch sin search nos dice cuántos hay
  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(search.trim()), 250)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    setLoading(true)
    const params = searchDebounced ? { search: searchDebounced } : {}
    api
      .get<SpiritListResponse>('/game/spirits', { params })
      .then((r) => {
        setItems(r.data.items)
        // El total sin filtro lo guardamos solo cuando search está vacío
        if (!searchDebounced) setTotal(r.data.total)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [searchDebounced])

  const totalLabel = total ?? items.length
  const filtered = items

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-bg-primary pt-24 pb-16">
        {/* Hero banner */}
        <div className="relative overflow-hidden border-b border-power-red/15 mb-10">
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
          {/* Search */}
          <div className="mb-6 max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre…"
              className="w-full bg-bg-card border border-border rounded-lg pl-10 pr-4 py-2.5 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-orange transition-colors"
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

          {loading ? (
            <div className="flex justify-center py-20">
              <LoadingSpinner />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-text-muted">
              <p>No se encontraron espíritus.</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-text-muted mb-4">
                {searchDebounced
                  ? `${filtered.length} de ${totalLabel} espíritus`
                  : `${totalLabel} espíritus`}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {filtered.map((s) => (
                  <SpiritCard key={s.id} spirit={s} />
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </>
  )
}

function SpiritCard({ spirit }: { spirit: GameSpirit }) {
  const [imgError, setImgError] = useState(false)
  return (
    <Link
      href={`/centro-de-datos/espiritus/${spirit.id}`}
      className="group relative flex flex-col rounded-lg overflow-hidden bg-bg-card border border-border hover:border-accent-orange/60 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent-orange/15 transition-all duration-300"
    >
      <div className="relative aspect-square bg-bg-elevated flex items-center justify-center overflow-hidden">
        {imgError ? (
          <span className="text-3xl font-cinzel text-text-muted">{spirit.name.charAt(0)}</span>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={spiritImageSrc(spirit.id)}
            alt={spirit.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-contain p-3 group-hover:scale-110 transition-transform duration-500"
          />
        )}
      </div>
      <div className="p-2.5 border-t border-border-light">
        <h3 className="font-cinzel font-bold text-text-primary text-sm leading-tight truncate" title={spirit.name}>
          {spirit.name}
        </h3>
      </div>
    </Link>
  )
}

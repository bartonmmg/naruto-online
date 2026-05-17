'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import api from '@/lib/api'
import { GameNinjaSummary, ninjaPortraitSrc, ninjaThumbnailSrc, NinjaListResponse } from '@/lib/types'

interface Props {
  currentId: number
  kind: 'NINJA' | 'MAIN'
}

const CACHE_KEY_PREFIX = 'ninja-order-'

/**
 * Navegación Anterior/Siguiente entre cartas del mismo `kind`, ordenadas por nombre.
 * Cachea la lista completa en sessionStorage para evitar refetch en cada navegación.
 */
export default function NinjaPrevNext({ currentId, kind }: Props) {
  const [order, setOrder] = useState<GameNinjaSummary[] | null>(null)

  useEffect(() => {
    const cacheKey = CACHE_KEY_PREFIX + kind
    if (typeof window !== 'undefined') {
      const cached = sessionStorage.getItem(cacheKey)
      if (cached) {
        try {
          setOrder(JSON.parse(cached))
          return
        } catch {}
      }
    }
    api
      .get<NinjaListResponse>('/game/ninjas', { params: { kind, sort: 'name', limit: 100 } })
      .then(async (r1) => {
        let items = r1.data.items
        // Si hay más, paginar (cap a 1000)
        while (
          r1.data.pagination.hasMore &&
          items.length < r1.data.pagination.total &&
          items.length < 1000
        ) {
          const r = await api.get<NinjaListResponse>('/game/ninjas', {
            params: { kind, sort: 'name', limit: 100, offset: items.length },
          })
          items = [...items, ...r.data.items]
          if (!r.data.pagination.hasMore) break
        }
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(cacheKey, JSON.stringify(items))
        }
        setOrder(items)
      })
      .catch(() => setOrder([]))
  }, [kind])

  if (!order || !order.length) return null

  const idx = order.findIndex((n) => n.id === currentId)
  if (idx === -1) return null
  const prev = idx > 0 ? order[idx - 1] : null
  const next = idx < order.length - 1 ? order[idx + 1] : null

  return (
    <nav className="mt-10 grid grid-cols-2 gap-3 md:gap-4">
      <NavCard ninja={prev} direction="prev" />
      <NavCard ninja={next} direction="next" />
    </nav>
  )
}

function NavCard({
  ninja,
  direction,
}: {
  ninja: GameNinjaSummary | null
  direction: 'prev' | 'next'
}) {
  if (!ninja) {
    return (
      <div className="rounded-lg border border-dashed border-border h-[88px]" aria-hidden />
    )
  }
  const isPrev = direction === 'prev'
  return (
    <Link
      href={`/centro-de-datos/ninjas/${ninja.id}`}
      className={`
        group relative flex items-center gap-3 p-3 rounded-lg border border-border
        bg-bg-card hover:border-accent-orange/50 hover:bg-bg-elevated transition-all
        ${isPrev ? '' : 'flex-row-reverse text-right'}
      `}
    >
      <NavImage artisticId={ninja.artisticId} name={ninja.name} />
      <div className={`flex-1 min-w-0 flex flex-col ${isPrev ? '' : 'items-end'}`}>
        <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-text-muted">
          {isPrev ? (
            <>
              <ArrowLeft size={12} /> Anterior
            </>
          ) : (
            <>
              Siguiente <ArrowRight size={12} />
            </>
          )}
        </span>
        <span className="font-cinzel font-bold text-text-primary truncate w-full text-sm">
          {ninja.name}
        </span>
        <span className="text-xs text-text-muted truncate w-full">
          {ninja.title || 'Estándar'}
        </span>
      </div>
    </Link>
  )
}

function NavImage({ artisticId, name }: { artisticId: number; name: string }) {
  const [src, setSrc] = useState(ninjaPortraitSrc(artisticId))
  const [error, setError] = useState(false)
  if (error) {
    return (
      <div className="w-14 h-14 rounded-md bg-bg-elevated border border-border flex items-center justify-center text-text-muted font-cinzel">
        {name.charAt(0)}
      </div>
    )
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={name}
      onError={() => {
        if (src.includes('/big/')) setSrc(ninjaThumbnailSrc(artisticId))
        else setError(true)
      }}
      className="w-14 h-14 rounded-md object-cover object-top bg-bg-elevated flex-shrink-0"
    />
  )
}

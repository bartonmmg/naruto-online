'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import api from '@/lib/api'
import {
  GameNinjaSummary,
  ninjaBigImageSrc,
  ninjaPortraitSrc,
  PROPERTY_COLORS,
  PROPERTY_GLOW,
  PROPERTY_KANJI,
} from '@/lib/types'
import Navbar from '@/components/Navbar'
import LoadingSpinner from '@/components/LoadingSpinner'

/**
 * Los 5 "Main" del juego: el avatar que elegis al crear personaje, uno por
 * elemento. Layout estilo "Cambiar clase de personaje" del juego — cada carta
 * con el kanji gigante del elemento como motif principal.
 */
export default function MainPage() {
  const [mains, setMains] = useState<GameNinjaSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get<{ items: GameNinjaSummary[] }>('/game/ninjas?kind=MAIN&sort=name&limit=10')
      .then((r) => {
        // Orden por elemento: Agua → Fuego → Viento → Rayo → Tierra
        const sorted = [...r.data.items].sort((a, b) => a.property.code - b.property.code)
        setMains(sorted)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-bg-primary pt-24 pb-16">
        {/* Hero banner con franja ninja */}
        <div className="relative overflow-hidden border-b border-power-red/15 mb-10">
          {/* Kanji shuriken decorativo */}
          <span
            aria-hidden
            className="absolute -right-20 -top-32 select-none pointer-events-none font-cinzel text-[28rem] leading-none text-power-red/[0.06]"
          >
            主
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-bg-primary via-bg-primary/95 to-transparent pointer-events-none" />
          <div className="relative max-w-7xl mx-auto px-6 py-12">
            <div className="flex items-center gap-3 text-power-red text-xs uppercase tracking-[0.3em] font-bold mb-2">
              <span className="h-px w-8 bg-power-red/40" />
              Centro de Datos
            </div>
            <h1 className="font-cinzel text-5xl md:text-6xl font-bold text-text-primary leading-none mb-3">
              Main
            </h1>
            <p className="text-text-muted whitespace-nowrap">
              Los cinco caminos del ninja. El personaje que elegís al crear tu cuenta — cada uno con su elemento, talentos exclusivos y estilo único.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6">
          {loading ? (
            <div className="flex justify-center py-20">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {mains.map((m) => (
                <MainCard key={m.id} ninja={m} />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  )
}

function MainCard({ ninja }: { ninja: GameNinjaSummary }) {
  const c = PROPERTY_COLORS[ninja.property.code] ?? PROPERTY_COLORS[0]
  const glow = PROPERTY_GLOW[ninja.property.code] ?? ''
  const kanji = PROPERTY_KANJI[ninja.property.code] ?? ''
  const cleanTitle = ninja.title.replace(/^\[|\]$/g, '')

  return (
    <Link
      href={`/centro-de-datos/ninjas/${ninja.slug || ninja.id}`}
      className={`
        group relative flex flex-col rounded-lg overflow-hidden bg-bg-card border
        ${c.border}
        hover:-translate-y-1 hover:shadow-2xl hover:${glow}
        transition-all duration-300
      `}
    >
      {/* Imagen + kanji */}
      <div className={`relative aspect-[3/4] overflow-hidden ${c.bg.replace('/40', '/10')}`}>
        {/* Kanji gigante de fondo */}
        <span
          aria-hidden
          className={`
            absolute inset-0 flex items-center justify-center font-cinzel
            text-[16rem] leading-none select-none pointer-events-none
            ${c.text} opacity-[0.10]
            group-hover:opacity-[0.22] group-hover:scale-110 transition-all duration-700
          `}
        >
          {kanji}
        </span>

        <MainImage artisticId={ninja.artisticId} name={ninja.title} />

        {/* Gradient inferior */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-bg-card via-bg-card/70 to-transparent z-20 pointer-events-none" />

        {/* Elemento chip esquina */}
        <div
          className={`absolute top-3 left-3 z-30 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest border backdrop-blur ${c.bg} ${c.text} ${c.border}`}
        >
          <span className="mr-1">{kanji}</span>
          {ninja.property.label}
        </div>
      </div>

      {/* Footer info */}
      <div className="p-3 flex flex-col gap-1 bg-bg-card border-t border-border-light">
        <span className="text-[10px] text-text-muted uppercase tracking-widest">Vía del</span>
        <h2 className="font-cinzel text-base md:text-lg font-bold text-text-primary leading-tight">
          {cleanTitle}
        </h2>
      </div>
    </Link>
  )
}

function MainImage({ artisticId, name }: { artisticId: number; name: string }) {
  const [src, setSrc] = useState(ninjaBigImageSrc(artisticId))
  const [error, setError] = useState(false)
  if (error) {
    return (
      <div className="absolute inset-0 flex items-center justify-center text-text-muted text-7xl font-cinzel z-10">
        {name.charAt(1) || '?'}
      </div>
    )
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={name}
      onError={() => {
        if (src.includes('/big/')) setSrc(ninjaPortraitSrc(artisticId))
        else setError(true)
      }}
      className="relative w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700 z-10"
    />
  )
}

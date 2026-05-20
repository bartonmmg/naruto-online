'use client'

import { useState } from 'react'
import {
  GameNinjaDetail,
  ninjaBigImageSrc,
  ninjaPortraitSrc,
  PROPERTY_COLORS,
  PROPERTY_KANJI,
  RARENESS_COLORS,
} from '@/lib/types'
import FavoriteButton from '../FavoriteButton'
import { ElementBadge, NinjaTypeBadge, RarenessBadge } from './Badges'
import RefText from './RefText'

/**
 * Hero del detalle de ninja — layout vertical compacto, optimizado para vivir
 * en la columna izquierda del layout 2-col del detalle.
 * - Imagen 3:4 arriba con kanji decorativo + estrellas y favorito overlaid
 * - Identidad abajo: nombre + título + badges + frase
 */
export default function NinjaHero({ ninja }: { ninja: GameNinjaDetail }) {
  const [bigImgError, setBigImgError] = useState(false)
  const propColor = PROPERTY_COLORS[ninja.property.code] ?? PROPERTY_COLORS[0]
  const rareColor = RARENESS_COLORS[ninja.rareness.code] ?? RARENESS_COLORS[0]
  const kanji = PROPERTY_KANJI[ninja.property.code] ?? ''

  return (
    <section
      className={`
        relative rounded-2xl overflow-hidden border-2 ${rareColor.border}
        bg-gradient-to-br ${propColor.bg} from-bg-card to-bg-card/40
        shadow-xl shadow-black/40
      `}
    >
      {/* Imagen + kanji decorativo + overlays */}
      <div className="relative aspect-[3/4] bg-bg-elevated overflow-hidden">
        {/* Kanji decorativo gigante en el fondo */}
        <span
          aria-hidden
          className={`
            absolute -right-12 -top-16 select-none pointer-events-none
            font-cinzel text-[20rem] leading-none ${propColor.text} opacity-[0.08] z-0
          `}
        >
          {kanji}
        </span>

        {/* Imagen */}
        {bigImgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={ninjaPortraitSrc(ninja.artisticId)}
            alt={ninja.name}
            onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
            className="relative z-10 w-full h-full object-cover object-top"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={ninjaBigImageSrc(ninja.artisticId)}
            alt={`${ninja.name} ${ninja.title}`}
            onError={() => setBigImgError(true)}
            className="relative z-10 w-full h-full object-cover object-top"
          />
        )}

        {/* Botón favorito esquina superior derecha */}
        <div className="absolute top-2 right-2 z-20">
          <FavoriteButton type="NINJA" targetId={String(ninja.id)} size="sm" />
        </div>

        {/* Estrellas — esquina superior izquierda */}
        {ninja.starLevel > 0 && (
          <div className="absolute top-2 left-3 z-20">
            <span className="text-sage-gold text-base tracking-[0.15em] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
              {'★'.repeat(ninja.starLevel)}
            </span>
          </div>
        )}

        {/* Gradient inferior para legibilidad de cualquier texto debajo */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-bg-card via-bg-card/60 to-transparent z-10 pointer-events-none" />
      </div>

      {/* Identidad compacta */}
      <div className="relative px-5 pb-5 pt-1 flex flex-col gap-3 bg-bg-card">
        {/* Nombre + título */}
        <div>
          <h1
            className="font-cinzel text-3xl md:text-4xl font-bold text-text-primary leading-tight"
            style={{ textShadow: '0 2px 10px rgba(0,0,0,0.4)' }}
          >
            {ninja.name}
          </h1>
          <p className="text-base text-text-muted mt-0.5">
            {ninja.title || <span className="italic opacity-70">Estándar</span>}
          </p>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5">
          <ElementBadge value={ninja.property} />
          {ninja.ninjaTypes?.map((t) => <NinjaTypeBadge key={t} value={t} />)}
          <RarenessBadge value={ninja.rareness} />
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-border-light bg-bg-elevated text-text-primary">
            {ninja.sex.label}
          </span>
        </div>

        {/* Frase del personaje */}
        {ninja.intro?.words && (
          <blockquote
            className={`
              mt-1 px-4 py-2.5 rounded-r border-l-2 italic text-text-primary/85 text-sm leading-relaxed
              bg-black/20 ${propColor.border}
            `}
          >
            <span className="text-xl leading-none text-accent-orange opacity-50 mr-1">“</span>
            <RefText text={ninja.intro.words} />
            <span className="text-xl leading-none text-accent-orange opacity-50 ml-1">”</span>
          </blockquote>
        )}
      </div>
    </section>
  )
}

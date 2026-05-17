'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  GameNinjaSummary,
  ninjaPortraitSrc,
  ninjaThumbnailSrc,
  PROPERTY_COLORS,
  PROPERTY_GLOW,
  PROPERTY_KANJI,
  RARENESS_COLORS,
} from '@/lib/types'

/**
 * Card de ninja con identidad temática:
 *  - Kanji del elemento como marca de agua decorativa en la imagen
 *  - Star level overlay en la parte inferior
 *  - Borde de rareza + glow del elemento al hover
 *  - Franja inferior con info (elemento + clase) sin badges secundarios pesados
 */
export default function NinjaCard({ ninja }: { ninja: GameNinjaSummary }) {
  const [imgSrc, setImgSrc] = useState(ninjaPortraitSrc(ninja.artisticId))
  const [imgError, setImgError] = useState(false)
  const rareColor = RARENESS_COLORS[ninja.rareness.code] ?? RARENESS_COLORS[0]
  const propColor = PROPERTY_COLORS[ninja.property.code] ?? PROPERTY_COLORS[0]
  const glow = PROPERTY_GLOW[ninja.property.code] ?? ''
  const kanji = PROPERTY_KANJI[ninja.property.code] ?? ''

  return (
    <Link
      href={`/centro-de-datos/ninjas/${ninja.id}`}
      className={`
        group relative flex flex-col rounded-lg overflow-hidden
        bg-bg-card border ${rareColor.border}
        hover:-translate-y-1 hover:shadow-xl hover:${glow}
        transition-all duration-300
      `}
    >
      {/* Imagen con kanji decorativo */}
      <div
        className={`relative aspect-square overflow-hidden ${propColor.bg.replace('/40', '/15')}`}
      >
        {/* Kanji watermark - decoración temática */}
        <span
          aria-hidden
          className={`
            absolute inset-0 flex items-center justify-center font-cinzel
            text-[140px] leading-none select-none pointer-events-none
            ${propColor.text} opacity-[0.08]
            group-hover:opacity-[0.18] transition-opacity duration-500
          `}
        >
          {kanji}
        </span>

        {imgError ? (
          <div className="absolute inset-0 flex items-center justify-center text-text-muted text-5xl font-cinzel select-none z-10">
            {ninja.name.charAt(0)}
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imgSrc}
            alt={`${ninja.name} ${ninja.title}`}
            onError={() => {
              if (imgSrc.includes('/big/')) setImgSrc(ninjaThumbnailSrc(ninja.artisticId))
              else setImgError(true)
            }}
            className="relative w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500 z-10"
          />
        )}

        {/* Gradient inferior para mejorar legibilidad del star count */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-bg-card/95 via-bg-card/50 to-transparent z-20 pointer-events-none" />

        {/* Star level overlay */}
        {ninja.starLevel > 0 && (
          <div className="absolute bottom-2 left-2 z-30 flex items-center">
            <span className="text-sage-gold text-sm tracking-widest drop-shadow-[0_0_4px_rgba(0,0,0,0.8)]">
              {'★'.repeat(ninja.starLevel)}
            </span>
          </div>
        )}
        {/* Rareness chip top-right */}
        <div
          className={`absolute top-2 right-2 z-30 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${rareColor.bg} ${rareColor.text} ${rareColor.border} backdrop-blur`}
        >
          {ninja.rareness.label}
        </div>
      </div>

      {/* Info inferior — más compacta */}
      <div className="p-3 flex flex-col gap-1 bg-bg-card">
        <h3
          className="font-cinzel font-bold text-text-primary text-sm leading-tight truncate"
          title={ninja.name}
        >
          {ninja.name}
        </h3>
        <p className="text-[11px] text-text-muted truncate" title={ninja.title || 'Estándar'}>
          {ninja.title || <span className="italic opacity-70">Estándar</span>}
        </p>
        {/* Tira de elemento + clase, alineada a la base */}
        <div className="flex items-center gap-2 mt-1 text-[10px] font-bold uppercase tracking-wider">
          <span className={`${propColor.text} flex items-center gap-1`}>
            <span className="text-base leading-none">{kanji}</span>
            {ninja.property.label}
          </span>
          <span className="text-text-dim">·</span>
          <span className="text-text-muted">{ninja.career.label}</span>
        </div>
      </div>
    </Link>
  )
}

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { GameSpirit, spiritBigImageSrc, spiritImageSrc } from '@/lib/types'

/**
 * Card del catálogo de espíritus.
 *  - Usa la imagen "big" del CDN (~6x más nítida que la del bag), con fallback
 *    al thumbnail si no existe.
 *  - Muestra trigger (qué desencadena) y apply (qué aplica) como chips.
 */
export default function SpiritCard({ spirit }: { spirit: GameSpirit }) {
  const [src, setSrc] = useState(spiritBigImageSrc(spirit.id))
  const [error, setError] = useState(false)

  return (
    <Link
      href={`/centro-de-datos/espiritus/${spirit.id}`}
      className="group relative flex flex-col rounded-lg overflow-hidden bg-bg-card border border-border hover:border-accent-orange/60 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent-orange/15 transition-all duration-300"
    >
      {/* Imagen 1:1 con object-cover object-top */}
      <div className="relative aspect-square bg-bg-elevated overflow-hidden">
        {error ? (
          <div className="absolute inset-0 flex items-center justify-center text-4xl font-cinzel text-text-muted">
            {spirit.name.charAt(0)}
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={spirit.name}
            onError={() => {
              if (src.includes('/big/')) setSrc(spiritImageSrc(spirit.id))
              else setError(true)
            }}
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
          />
        )}
        {/* Indicador de combos en esquina sup. derecha */}
        {spirit.triggerKeywords.length === 0 && spirit.applyKeywords.length === 0 ? null : null}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1.5 bg-bg-card border-t border-border-light">
        <h3
          className="font-cinzel font-bold text-text-primary text-sm leading-tight truncate"
          title={spirit.name}
        >
          {spirit.name}
        </h3>
        {/* Chips de trigger/apply */}
        {(spirit.triggerKeywords.length > 0 || spirit.applyKeywords.length > 0) && (
          <div className="flex flex-wrap gap-1">
            {spirit.triggerKeywords.slice(0, 2).map((k) => (
              <span
                key={'t-' + k}
                className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded border border-chakra-blue/40 bg-chakra-blue/10 text-chakra-blue truncate max-w-full"
                title={`Se desencadena con: ${k}`}
              >
                ⚡ {k}
              </span>
            ))}
            {spirit.applyKeywords.slice(0, 2).map((k) => (
              <span
                key={'a-' + k}
                className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded border border-accent-orange/40 bg-accent-orange/10 text-accent-orange truncate max-w-full"
                title={`Aplica: ${k}`}
              >
                ◆ {k}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}

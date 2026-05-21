'use client'

import { showPropertyLabel, showPropertyIconSrc } from '@/lib/show-property-labels'

interface Props {
  codes: number[]
  /** Tamaño del ícono en píxeles (cuadrado). Default 20. */
  size?: number
  /** Si limit > 0, muestra solo los primeros N + un chip "+M" si hay más. */
  limit?: number
  className?: string
}

/**
 * Renderiza la fila de íconos `showPropertys` de un ninja — propiedades visibles
 * como Hokage, Modo Sabio, técnicas especiales, etc. Cada ícono tiene tooltip
 * con su nombre (o "Propiedad #N" si todavía no mapeamos ese código).
 *
 * Usado en `NinjaCard` (listado) con limit reducido y en `NinjaHero` (detalle)
 * sin limit.
 */
export default function ShowPropertyIcons({ codes, size = 20, limit = 0, className = '' }: Props) {
  if (!codes || codes.length === 0) return null
  const visible = limit > 0 ? codes.slice(0, limit) : codes
  const extra = limit > 0 ? codes.length - visible.length : 0

  return (
    <div className={`flex items-center gap-1 flex-wrap ${className}`}>
      {visible.map((code) => (
        <span
          key={code}
          title={showPropertyLabel(code)}
          className="inline-flex items-center justify-center rounded bg-bg-elevated/60 border border-border/50 hover:border-accent-orange/40 transition-colors"
          style={{ width: size, height: size }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={showPropertyIconSrc(code)}
            alt={showPropertyLabel(code)}
            width={size - 4}
            height={size - 4}
            className="object-contain"
            loading="lazy"
            onError={(e) => {
              // Si el ícono no existe localmente, ocultar el span
              const span = (e.currentTarget as HTMLImageElement).parentElement
              if (span) span.style.display = 'none'
            }}
          />
        </span>
      ))}
      {extra > 0 && (
        <span
          className="inline-flex items-center justify-center rounded bg-bg-elevated/60 border border-border/50 text-text-muted text-[10px] font-mono px-1"
          style={{ height: size, minWidth: size }}
          title={`+${extra} propiedades más`}
        >
          +{extra}
        </span>
      )}
    </div>
  )
}

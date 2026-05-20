'use client'

import { StarVariant } from '@/lib/types'

interface Props {
  variants: StarVariant[]
  selected: number
  onSelect: (star: number) => void
  propColor: { text: string; border: string; bg: string }
}

/**
 * Selector de nivel de estrella (★1..★5) para una carta.
 *
 * Cada star slot puede apuntar a una variante distinta (id, title, artisticId,
 * stats). Al hacer click, se actualiza el detalle mostrado en la página.
 *
 * El usuario ve los 5 cuadros siempre — los que no cambian de visual respecto
 * al anterior se ven en gris (mismo id, sin diff). Los que sí cambian se
 * resaltan con el color del elemento.
 */
export default function StarSelector({ variants, selected, onSelect, propColor }: Props) {
  if (!variants.length) return null

  return (
    <section className="bg-bg-card border border-border rounded-xl p-4">
      <h3 className="text-[10px] uppercase tracking-[0.25em] text-text-muted mb-3 font-bold">
        Nivel de Estrella
      </h3>
      <div className="grid grid-cols-5 gap-1.5">
        {variants.map((v, i) => {
          const isSelected = selected === v.star
          // Es una "transición visual" si la variante difiere del slot anterior
          const isVisualChange = i === 0 || variants[i - 1].id !== v.id
          return (
            <button
              key={v.star}
              onClick={() => onSelect(v.star)}
              className={`
                relative flex flex-col items-center gap-0.5 rounded-lg px-1 py-2 border transition-all
                ${
                  isSelected
                    ? `${propColor.bg} ${propColor.border} ${propColor.text}`
                    : 'bg-bg-elevated border-border text-text-muted hover:text-text-primary hover:border-border-light'
                }
              `}
              title={`★${v.star}: ${v.title || 'Estándar'}`}
            >
              <span className="text-base leading-none">
                {'★'.repeat(v.star)}
              </span>
              {/* Punto naranja si introduce una transformación visual nueva */}
              {isVisualChange && i > 0 && (
                <span
                  className={`absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full ${propColor.bg.replace('/40', '')} ${propColor.border}`}
                  aria-label="Cambia de forma"
                />
              )}
            </button>
          )
        })}
      </div>
      {/* Hint si esta carta cambia de title al evolucionar */}
      {variants.some((v, i) => i > 0 && v.title !== variants[0].title) && (
        <p className="mt-2 text-[10px] text-text-muted leading-tight">
          Esta carta cambia de forma al subir estrellas.
        </p>
      )}
    </section>
  )
}

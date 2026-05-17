'use client'

import { NinjaResists, PROPERTY_COLORS, PROPERTY_KANJI } from '@/lib/types'

/**
 * Grilla visual de las 5 resistencias elementales.
 * - Cada celda: kanji 4xl + label + porcentaje
 * - Si débil (-20%): borde rojo + ícono ▼
 * - Si fuerte (>0): borde verde + ícono ▲
 * - Si neutro (0): apariencia muted
 */
const ELEMENTS: { key: keyof NinjaResists; code: number; label: string }[] = [
  { key: 'water',   code: 1, label: 'Agua' },
  { key: 'fire',    code: 2, label: 'Fuego' },
  { key: 'wind',    code: 3, label: 'Viento' },
  { key: 'thunder', code: 4, label: 'Rayo' },
  { key: 'soil',    code: 5, label: 'Tierra' },
]

export default function ResistGrid({ resists }: { resists: NinjaResists }) {
  return (
    <section className="bg-bg-card border border-border rounded-xl p-6">
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="font-cinzel font-bold text-lg text-text-primary">Resistencias</h2>
        <div className="flex items-center gap-3 text-[10px] uppercase tracking-wider text-text-muted">
          <span className="flex items-center gap-1">
            <span className="text-nature-green">▲</span> Fuerte
          </span>
          <span className="flex items-center gap-1">
            <span className="text-power-red">▼</span> Débil
          </span>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {ELEMENTS.map(({ key, code, label }) => {
          const value = resists[key] ?? 0
          const propColor = PROPERTY_COLORS[code]
          const kanji = PROPERTY_KANJI[code]
          const isWeak = value < 0
          const isStrong = value > 0

          // Borde según estado: prioriza débil>fuerte>elemento
          const border = isWeak
            ? 'border-power-red/70'
            : isStrong
            ? 'border-nature-green/60'
            : 'border-border'

          const bg = isWeak
            ? 'bg-power-red/10'
            : isStrong
            ? 'bg-nature-green/10'
            : 'bg-bg-elevated'

          return (
            <div
              key={key}
              className={`
                relative flex flex-col items-center justify-center gap-1 p-3
                rounded-lg border ${border} ${bg}
                transition-colors hover:scale-[1.03]
              `}
              title={resistTooltip(label, value)}
            >
              {/* Kanji grande */}
              <span
                className={`font-cinzel text-3xl leading-none ${propColor.text}`}
                aria-hidden
              >
                {kanji}
              </span>
              {/* Label */}
              <span className="text-[10px] uppercase tracking-wider text-text-muted">
                {label}
              </span>
              {/* Valor */}
              <span
                className={`
                  font-mono text-sm font-bold flex items-center gap-0.5
                  ${isWeak ? 'text-power-red' : isStrong ? 'text-nature-green' : 'text-text-dim'}
                `}
              >
                {isWeak && <span className="text-xs">▼</span>}
                {isStrong && <span className="text-xs">▲</span>}
                {value > 0 ? '+' : ''}
                {value}%
              </span>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function resistTooltip(label: string, value: number): string {
  if (value < 0) return `Débil contra ${label}: recibe ${Math.abs(value)}% más daño.`
  if (value > 0) return `Fuerte contra ${label}: recibe ${value}% menos daño.`
  return `Neutro frente a ${label}.`
}

'use client'

import type { LucideIcon } from 'lucide-react'

interface Props {
  label: string
  base: number
  growth?: number
  /** valor maximo en el grupo (para calcular el ancho relativo) */
  maxBase?: number
  accent?: 'orange' | 'red' | 'blue' | 'green' | 'gold'
  icon?: LucideIcon
}

const ACCENT_COLORS: Record<NonNullable<Props['accent']>, { bar: string; icon: string }> = {
  orange: { bar: 'bg-accent-orange', icon: 'text-accent-orange' },
  red: { bar: 'bg-power-red', icon: 'text-power-red' },
  blue: { bar: 'bg-chakra-blue', icon: 'text-chakra-blue' },
  green: { bar: 'bg-nature-green', icon: 'text-nature-green' },
  gold: { bar: 'bg-sage-gold', icon: 'text-sage-gold' },
}

export default function StatBar({
  label,
  base,
  growth,
  maxBase = 200,
  accent = 'orange',
  icon: Icon,
}: Props) {
  const pct = Math.min(100, Math.max(2, (base / maxBase) * 100))
  const c = ACCENT_COLORS[accent]
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-xs gap-2">
        <span className="flex items-center gap-2 text-text-muted uppercase tracking-wide">
          {Icon && <Icon size={14} className={c.icon} />}
          {label}
        </span>
        <span className="font-mono text-text-primary">
          {base}
          {growth ? <span className="text-text-muted text-[10px] ml-1">(+{growth}/lvl)</span> : null}
        </span>
      </div>
      <div className="h-1.5 bg-bg-elevated rounded overflow-hidden">
        <div className={`h-full ${c.bar} transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

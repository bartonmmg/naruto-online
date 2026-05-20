'use client'

import { Coded, PROPERTY_COLORS, RARENESS_COLORS } from '@/lib/types'

const BASE = 'inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border'

export function ElementBadge({ value }: { value: Coded }) {
  const c = PROPERTY_COLORS[value.code] ?? PROPERTY_COLORS[0]
  return <span className={`${BASE} ${c.bg} ${c.text} ${c.border}`}>{value.label}</span>
}

export function CareerBadge({ value }: { value: Coded }) {
  return (
    <span className={`${BASE} bg-bg-elevated text-text-primary border-border-light`}>
      {value.label}
    </span>
  )
}

export function NinjaTypeBadge({ value }: { value: string }) {
  return (
    <span className={`${BASE} bg-accent-orange/10 text-accent-orange border-accent-orange/30`}>
      {value}
    </span>
  )
}

export function RarenessBadge({ value }: { value: Coded }) {
  const c = RARENESS_COLORS[value.code] ?? RARENESS_COLORS[0]
  return <span className={`${BASE} ${c.bg} ${c.text} ${c.border}`}>{value.label}</span>
}

export function StarLevel({ value }: { value: number }) {
  if (!value || value < 1) return null
  return (
    <span className="inline-flex items-center text-sage-gold text-xs" title={`★${value}`}>
      {'★'.repeat(value)}
    </span>
  )
}

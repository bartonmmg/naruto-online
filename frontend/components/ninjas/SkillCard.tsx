'use client'

import { useState } from 'react'
import { GameSkill, SkillUpgrade } from '@/lib/types'
import SkillIcon from './SkillIcon'

interface Props {
  skill: GameSkill
  variant?: 'normal' | 'special' | 'passive' | 'combo'
  /** "expanded" muestra la descripcion completa (default en el detalle).
   *  "compact" trunca la descripcion con boton "Ver mas" (usado en talentos densos). */
  size?: 'expanded' | 'compact'
  /** Variantes de avance/enlace (Base/+1/+2/Y/Y+1/Y+2/L/L+1/L+2). Si vienen, se
   *  muestra un selector inline para cambiar la descripción al tier elegido. */
  upgrades?: SkillUpgrade[]
}

// Ribbon vertical lateral del color por tipo de habilidad
const VARIANT_RIBBON: Record<NonNullable<Props['variant']>, string> = {
  normal:  'before:bg-chakra-blue',
  special: 'before:bg-accent-orange',
  combo:   'before:bg-genjutsu-purple',
  passive: 'before:bg-text-muted',
}

const VARIANT_BORDER: Record<NonNullable<Props['variant']>, string> = {
  normal:  'border-chakra-blue/25 hover:border-chakra-blue/50',
  special: 'border-accent-orange/40 hover:border-accent-orange/70',
  combo:   'border-genjutsu-purple/30 hover:border-genjutsu-purple/60',
  passive: 'border-border hover:border-text-muted/40',
}

const DESC_TRUNCATE_AT = 140

export default function SkillCard({ skill, variant = 'passive', size = 'expanded', upgrades }: Props) {
  const [expanded, setExpanded] = useState(false)
  // tier 0 = Base, 1+ = índice en la lista de upgrades (con su label "+1"/"+2"/"Y"/"Y+1"/etc.)
  const [tier, setTier] = useState(0)
  // Lista combinada: base + variantes upgradeadas (cada una con su tierLabel).
  // Construimos un array uniforme [{ label, skill }] para renderizar.
  const variants = upgrades && upgrades.length
    ? [{ label: 'Base', skill }, ...upgrades.map((u) => ({ label: u.tierLabel, skill: u.skill }))]
    : null
  const active = variants ? variants[tier]?.skill ?? skill : skill
  const isExpanded = size === 'expanded' || expanded
  const desc = active.description ?? ''
  const truncated = !isExpanded && desc.length > DESC_TRUNCATE_AT
  const visibleDesc = truncated ? desc.slice(0, DESC_TRUNCATE_AT).trim() + '…' : desc

  return (
    <div
      className={`
        relative rounded-lg bg-bg-elevated border p-4 flex gap-3
        before:content-[''] before:absolute before:left-0 before:top-2 before:bottom-2
        before:w-[3px] before:rounded-r
        ${VARIANT_BORDER[variant]} ${VARIANT_RIBBON[variant]}
        transition-colors
      `}
    >
      <div className="pl-2">
        <SkillIcon skillId={skill.id} name={skill.name} size="lg" variant={mapForIcon(variant)} />
      </div>
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-1.5">
          <h4 className="font-cinzel font-bold text-text-primary text-base leading-snug">
            {active.name}
          </h4>
          <div className="flex items-center gap-2 text-xs text-text-muted flex-shrink-0 whitespace-nowrap">
            {active.chakra > 0 && <span className="text-chakra-blue">⚡ {active.chakra}</span>}
            {active.cooldown > 0 && <span className="text-accent-orange">⏳ {active.cooldown}</span>}
          </div>
        </div>

        {/* Selector de variantes (Base / +1 / +2 / Y / Y+1 / Y+2 / L / L+1 / L+2) */}
        {variants && variants.length > 1 && (
          <div className="flex gap-1 mb-2 flex-wrap">
            {variants.map((v, idx) => (
              <button
                key={idx}
                onClick={() => setTier(idx)}
                className={`text-[10px] px-2 py-0.5 rounded border font-bold tracking-wider transition-colors ${
                  tier === idx
                    ? 'bg-accent-orange/20 border-accent-orange text-accent-orange'
                    : 'bg-bg-card border-border text-text-muted hover:text-text-primary'
                }`}
                title={
                  idx === 0
                    ? 'Habilidad base (Inicial)'
                    : v.label.startsWith('Y')
                    ? `Enlace tipo Y · ${v.label}`
                    : v.label.startsWith('L')
                    ? `Enlace tipo L · ${v.label}`
                    : `Avance ${v.label}`
                }
              >
                {v.label}
              </button>
            ))}
          </div>
        )}

        {/* Descripción inline (siempre visible o truncada) */}
        {desc && (
          <>
            <div
              className="text-sm text-text-primary/85 leading-relaxed"
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{ __html: visibleDesc }}
            />
            {truncated && (
              <button
                onClick={() => setExpanded(true)}
                className="mt-1.5 text-xs text-accent-orange hover:underline"
              >
                Ver más
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}

/** SkillIcon usa solo 3 variants (normal/special/passive). Mapeamos combo → passive. */
function mapForIcon(v: NonNullable<Props['variant']>): 'normal' | 'special' | 'passive' {
  return v === 'combo' ? 'passive' : v
}

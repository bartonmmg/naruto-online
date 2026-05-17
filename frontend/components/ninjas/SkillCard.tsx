'use client'

import { useState } from 'react'
import { GameSkill } from '@/lib/types'
import SkillIcon from './SkillIcon'

interface Props {
  skill: GameSkill
  variant?: 'normal' | 'special' | 'passive' | 'combo'
  /** "expanded" muestra la descripcion completa (default en el detalle).
   *  "compact" trunca la descripcion con boton "Ver mas" (usado en talentos densos). */
  size?: 'expanded' | 'compact'
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

export default function SkillCard({ skill, variant = 'passive', size = 'expanded' }: Props) {
  const [expanded, setExpanded] = useState(false)
  const isExpanded = size === 'expanded' || expanded
  const desc = skill.description ?? ''
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
            {skill.name}
          </h4>
          <div className="flex items-center gap-2 text-xs text-text-muted flex-shrink-0 whitespace-nowrap">
            {skill.chakra > 0 && <span className="text-chakra-blue">⚡ {skill.chakra}</span>}
            {skill.cooldown > 0 && <span className="text-accent-orange">⏳ {skill.cooldown}</span>}
          </div>
        </div>

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

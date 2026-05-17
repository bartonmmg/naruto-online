'use client'

import { useState } from 'react'
import { Sparkles } from 'lucide-react'

interface Props {
  skillId: number
  name: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'normal' | 'special' | 'passive'
  used?: boolean         // marca "Usado" como el juego (en uso/equipado) — visual opcional
}

const SIZES: Record<NonNullable<Props['size']>, string> = {
  sm: 'w-10 h-10',
  md: 'w-14 h-14',
  lg: 'w-20 h-20',
}

const VARIANT_BORDER: Record<NonNullable<Props['variant']>, string> = {
  normal: 'border-chakra-blue/40',
  special: 'border-accent-orange/60',
  passive: 'border-border-light',
}

/**
 * Icono cuadrado de una habilidad, con borde por tipo y fallback a sparkles
 * cuando no existe el asset en /public/images/game/skills/<id>.webp.
 */
export default function SkillIcon({ skillId, name, size = 'md', variant = 'passive', used }: Props) {
  const [error, setError] = useState(false)
  return (
    <div
      className={`
        relative ${SIZES[size]} flex-shrink-0 rounded-md overflow-hidden
        bg-bg-elevated border ${VARIANT_BORDER[variant]}
      `}
      title={name}
    >
      {error ? (
        <div className="w-full h-full flex items-center justify-center text-text-muted">
          <Sparkles size={size === 'lg' ? 28 : size === 'md' ? 18 : 14} />
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`/images/game/skills/${skillId}.webp`}
          alt={name}
          onError={() => setError(true)}
          className="w-full h-full object-cover"
        />
      )}
      {used && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <span className="bg-accent-orange text-bg-primary text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded uppercase">
            Usado
          </span>
        </div>
      )}
    </div>
  )
}

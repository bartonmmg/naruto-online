'use client'

import { useState } from 'react'
import { Info } from 'lucide-react'
import { MainTalents, GameSkill } from '@/lib/types'
import SkillCard from './SkillCard'

interface Props {
  talents: MainTalents
}

type Category = 'esoterica' | 'ataque' | 'pasiva'

interface Node {
  level: number
  category: Category
  slot: number
  skills: GameSkill[]
}

const CATEGORY_LABEL: Record<Category, string> = {
  esoterica: 'Esotérica',
  ataque: 'Ataque Normal',
  pasiva: 'Pasiva',
}

const CATEGORY_VARIANT: Record<Category, 'special' | 'normal' | 'combo' | 'passive'> = {
  esoterica: 'special',
  ataque: 'normal',
  pasiva: 'passive',
}

const CATEGORY_DOT: Record<Category, string> = {
  esoterica: 'bg-accent-orange shadow-[0_0_12px_rgba(255,107,0,0.6)]',
  ataque: 'bg-chakra-blue shadow-[0_0_12px_rgba(0,128,255,0.5)]',
  pasiva: 'bg-text-muted',
}

/**
 * Talentos del Main como timeline vertical ordenada por nivel del jugador.
 * Las pasivas que tienen múltiples opciones se muestran con tabs internas.
 */
export default function MainTalentsTimeline({ talents }: Props) {
  // Aplanar y ordenar por nivel
  const nodes: Node[] = [
    ...talents.esoterica.map((s) => ({ ...s, category: 'esoterica' as Category })),
    ...talents.ataque.map((s) => ({ ...s, category: 'ataque' as Category })),
    ...talents.pasiva.map((s) => ({ ...s, category: 'pasiva' as Category })),
  ].sort((a, b) => a.level - b.level || categoryOrder(a.category) - categoryOrder(b.category))

  return (
    <div className="space-y-6">
      <SectionHeader title="Talentos" />

      {/* Tip informativo */}
      <div className="flex items-start gap-3 p-4 rounded-lg bg-accent-orange/5 border border-accent-orange/20">
        <Info size={16} className="text-accent-orange flex-shrink-0 mt-0.5" />
        <p className="text-sm text-text-muted">
          Los talentos del Main se desbloquean por <span className="text-text-primary font-bold">nivel del jugador</span>.
          En cada slot de pasiva podés elegir <span className="text-text-primary">una de tres opciones</span>.
        </p>
      </div>

      {/* Timeline */}
      <div className="relative pl-8">
        {/* Línea vertical */}
        <div className="absolute left-3 top-2 bottom-2 w-px bg-gradient-to-b from-accent-orange/40 via-border to-accent-orange/40" />

        <div className="space-y-5">
          {nodes.map((n, i) => (
            <TimelineRow key={`${n.category}-${n.slot}-${i}`} node={n} />
          ))}
        </div>
      </div>
    </div>
  )
}

function TimelineRow({ node }: { node: Node }) {
  return (
    <div className="relative">
      {/* Dot en la línea */}
      <div
        className={`absolute -left-[1.625rem] top-3 w-3 h-3 rounded-full ring-2 ring-bg-primary ${CATEGORY_DOT[node.category]}`}
      />

      {/* Nivel chip */}
      <div className="flex items-center gap-2 mb-2">
        <span className="font-mono text-xs px-2 py-0.5 rounded bg-bg-elevated border border-border-light text-accent-orange font-bold">
          Lv. {node.level}
        </span>
        <span className="text-[10px] uppercase tracking-widest text-text-muted">
          {CATEGORY_LABEL[node.category]} {node.category === 'pasiva' ? `· Slot ${node.slot}` : ''}
        </span>
      </div>

      {/* Skill(s) */}
      {node.skills.length === 1 ? (
        <SkillCard skill={node.skills[0]} variant={CATEGORY_VARIANT[node.category]} />
      ) : (
        <TalentOptionPicker skills={node.skills} variant={CATEGORY_VARIANT[node.category]} />
      )}
    </div>
  )
}

/** Para pasivas con 3 opciones — tabs internas + card de la opción activa */
function TalentOptionPicker({
  skills,
  variant,
}: {
  skills: GameSkill[]
  variant: 'special' | 'normal' | 'combo' | 'passive'
}) {
  const [selected, setSelected] = useState(0)
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {skills.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setSelected(i)}
            className={`
              text-xs px-3 py-1.5 rounded-md border transition-colors truncate max-w-full
              ${
                selected === i
                  ? 'bg-accent-orange/15 border-accent-orange text-text-primary'
                  : 'bg-bg-elevated border-border text-text-muted hover:text-text-primary'
              }
            `}
            title={s.name}
          >
            Opción {i + 1}: {s.name}
          </button>
        ))}
      </div>
      <SkillCard skill={skills[selected]} variant={variant} />
    </div>
  )
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-px w-8 bg-power-red/40" />
      <h2 className="font-cinzel text-2xl font-bold text-text-primary uppercase tracking-[0.15em]">
        {title}
      </h2>
      <span className="flex-1 h-px bg-border" />
    </div>
  )
}

function categoryOrder(c: Category): number {
  return c === 'esoterica' ? 0 : c === 'ataque' ? 1 : 2
}

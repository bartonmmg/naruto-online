'use client'

import { GameSkill, SkillUpgrade } from '@/lib/types'
import SkillCard from './SkillCard'

interface Props {
  specials: GameSkill[]
  normals: GameSkill[]
  passives: GameSkill[]
  /** map baseSkillId → upgrades (avance/enlace) con tier label del juego */
  skillUpgrades?: Record<string, SkillUpgrade[]>
}

/**
 * Habilidades del ninja en el orden del juego:
 * Esotérica → Ataque Básico → Combo → Pasiva 1 → Pasiva 2 → ...
 *
 * Layout:
 * - Esotérica, Ataque Básico y Combo son skills clave: cada una en su sección.
 * - Las pasivas (passives[1]+) se renderizan en grilla 2 columnas en desktop
 *   para ahorrar scroll cuando hay muchas.
 */
export default function NinjaSkillsList({ specials, normals, passives, skillUpgrades }: Props) {
  const [combo, ...rest] = passives
  const otherPassives = rest
  const upgradesFor = (id: number) => skillUpgrades?.[String(id)]

  return (
    <div className="space-y-6">
      <SectionHeader title="Habilidades" />

      {specials.length > 0 && (
        <SkillGroup title="Esotérica" subtitle="La técnica más poderosa">
          {specials.map((s) => (
            <SkillCard key={s.id} skill={s} variant="special" upgrades={upgradesFor(s.id)} />
          ))}
        </SkillGroup>
      )}

      {normals.length > 0 && (
        <SkillGroup title="Ataque Básico" subtitle="Acción por defecto">
          <SkillCard skill={normals[0]} variant="normal" upgrades={upgradesFor(normals[0].id)} />
        </SkillGroup>
      )}

      {combo && (
        <SkillGroup title="Combo" subtitle="Persecución tras un Combo aliado">
          <SkillCard skill={combo} variant="combo" upgrades={upgradesFor(combo.id)} />
        </SkillGroup>
      )}

      {otherPassives.length > 0 && (
        <SkillGroup
          title="Pasivas"
          subtitle="Habilidades automáticas durante el combate"
        >
          <div className="space-y-3">
            {otherPassives.map((s, i) => (
              <div key={s.id} className="relative">
                <span className="absolute -top-2 -left-2 z-10 w-6 h-6 rounded-full bg-accent-orange/90 text-bg-primary text-xs font-bold flex items-center justify-center shadow-md">
                  {i + 1}
                </span>
                <SkillCard skill={s} variant="passive" upgrades={upgradesFor(s.id)} />
              </div>
            ))}
          </div>
        </SkillGroup>
      )}
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

function SkillGroup({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <section>
      <div className="mb-3">
        <h3 className="font-cinzel font-bold text-text-primary text-sm uppercase tracking-widest">
          {title}
        </h3>
        {subtitle && <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>}
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  )
}

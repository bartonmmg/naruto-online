'use client'

import { Heart, Sword, Sparkles, Shield, ShieldCheck, Zap, Crosshair, Activity } from 'lucide-react'
import { NinjaStats, ninjaCombatividad } from '@/lib/types'
import StatBar from './StatBar'

interface Props {
  stats: NinjaStats
}

export default function StatPanel({ stats }: Props) {
  const maxBase = Math.max(
    stats.baseLife,
    stats.baseBodyAttack,
    stats.baseNinjaAttack,
    stats.baseBodyDefense,
    stats.baseNinjaDefense,
    1
  )
  const power = ninjaCombatividad(stats)

  return (
    <section className="bg-bg-card border border-border rounded-xl p-6 flex flex-col gap-5">
      <div className="flex items-baseline justify-between">
        <h2 className="font-cinzel font-bold text-lg text-text-primary">Estadísticas</h2>
        <span className="text-[10px] uppercase tracking-wider text-text-muted">Base</span>
      </div>

      {/* Stats principales con barras + iconos */}
      <div className="space-y-3">
        <StatBar icon={Heart} label="Vida" base={stats.baseLife} growth={stats.growthLife} maxBase={maxBase} accent="red" />
        <StatBar icon={Sword} label="Atk. Cuerpo" base={stats.baseBodyAttack} growth={stats.growthBodyAttack} maxBase={maxBase} accent="orange" />
        <StatBar icon={Sparkles} label="Atk. Ninjutsu" base={stats.baseNinjaAttack} growth={stats.growthNinjaAttack} maxBase={maxBase} accent="blue" />
        <StatBar icon={Shield} label="Def. Cuerpo" base={stats.baseBodyDefense} growth={stats.growthBodyDefense} maxBase={maxBase} accent="gold" />
        <StatBar icon={ShieldCheck} label="Def. Ninjutsu" base={stats.baseNinjaDefense} growth={stats.growthNinjaDefense} maxBase={maxBase} accent="green" />
      </div>

      {/* Stats secundarios como chips */}
      <div className="grid grid-cols-2 gap-2 pt-4 border-t border-border">
        <StatChip icon={Zap}      label="Crítico"          value={stats.baseCrit} />
        <StatChip icon={Crosshair} label="Golpe cuerpo"    value={stats.baseBodyStrike} />
        <StatChip icon={Crosshair} label="Golpe ninjutsu"  value={stats.baseNinjaStrike} />
        <StatChip icon={Activity}  label="Atq. seguido"    value={`${stats.continuousStrikeRate}%`} />
      </div>

      {/* Combatividad pinneada al pie */}
      <div
        className="mt-1 rounded-lg border border-accent-orange/30 bg-gradient-to-br from-accent-orange/10 to-transparent p-4"
        title="Estimación de poder de combate al nivel 100 basada en los stats base + growth (vida×1.2 + atks×4 + defs×3). El número real en el juego depende de equipo, breakthrough y assists."
      >
        <div className="flex items-baseline justify-between">
          <span className="text-[11px] uppercase tracking-[0.2em] text-accent-orange font-bold">
            Combatividad
          </span>
          <span className="text-[10px] text-text-muted">lvl 100</span>
        </div>
        <div className="font-cinzel text-3xl font-bold text-text-primary leading-tight mt-1">
          {power.toLocaleString('es')}
        </div>
        <p className="text-[11px] text-text-muted mt-1">
          Poder estimado base. El real depende de equipo + breakthrough.
        </p>
      </div>
    </section>
  )
}

function StatChip({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Heart
  label: string
  value: number | string
}) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-bg-elevated border border-border">
      <Icon size={14} className="text-text-muted flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-[10px] uppercase tracking-wider text-text-muted truncate">{label}</div>
        <div className="font-mono text-sm text-text-primary">{value}</div>
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ChevronRight, Home, Heart, Sword, Shield, Sparkles, ShieldCheck,
  Layers, Coins, TrendingUp,
} from 'lucide-react'
import api from '@/lib/api'
import { GameSpiritDetail, spiritBigImageSrc, spiritImageSrc } from '@/lib/types'
import Navbar from '@/components/Navbar'
import LoadingSpinner from '@/components/LoadingSpinner'
import SkillCard from '@/components/ninjas/SkillCard'

/** Detecta si un string viene mayoritariamente en CJK (sin traducir al español) */
function isUntranslated(s: string | null | undefined): boolean {
  if (!s) return false
  const cjk = (s.match(/[一-鿿]/g) || []).length
  // Si más del 30% de los chars son CJK, asumimos sin traducir
  return cjk > 0 && cjk / s.length > 0.3
}

export default function SpiritDetailPage() {
  const params = useParams<{ id: string }>()
  const [spirit, setSpirit] = useState<GameSpiritDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const id = Number(params?.id)
    if (!Number.isFinite(id)) {
      setNotFound(true)
      setLoading(false)
      return
    }
    setLoading(true)
    setNotFound(false)
    setSpirit(null)
    api
      .get<GameSpiritDetail>(`/game/spirits/${id}`)
      .then((r) => setSpirit(r.data))
      .catch((e) => {
        if (e?.response?.status === 404) setNotFound(true)
        else console.error(e)
      })
      .finally(() => setLoading(false))
  }, [params?.id])

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-bg-primary pt-28 pb-16 flex items-center justify-center">
          <LoadingSpinner />
        </main>
      </>
    )
  }

  if (notFound || !spirit) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-bg-primary pt-28 pb-16">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-text-muted text-lg mb-4">Espíritu no encontrado</p>
            <Link href="/centro-de-datos/espiritus" className="text-accent-orange hover:underline">
              ← Volver al catálogo
            </Link>
          </div>
        </main>
      </>
    )
  }

  const ROMANS: Record<number, string> = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV' }
  const hasKatha = spirit.katha.lv1.length > 0 || spirit.katha.lv2.length > 0 || spirit.katha.lv3.length > 0

  // Las skills de katha vienen duplicadas (5 frames de la misma animación);
  // mostramos solo la primera de cada nivel.
  const kathaLv1 = spirit.katha.lv1.slice(0, 1)
  const kathaLv2 = spirit.katha.lv2.slice(0, 1)
  const kathaLv3 = spirit.katha.lv3.slice(0, 1)

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-bg-primary pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-text-muted mb-6">
            <Link href="/centro-de-datos" className="flex items-center gap-1.5 hover:text-text-primary transition-colors">
              <Home size={13} /> Centro de Datos
            </Link>
            <ChevronRight size={12} className="text-text-dim" />
            <Link href="/centro-de-datos/espiritus" className="hover:text-text-primary transition-colors">
              Espíritus Animales
            </Link>
            <ChevronRight size={12} className="text-text-dim" />
            <span className="text-text-primary truncate">{spirit.name}</span>
          </nav>

          <div className="grid lg:grid-cols-[minmax(320px,400px)_1fr] gap-6 items-start">
            {/* Columna izquierda: imagen + identidad + metadata + stats */}
            <aside className="space-y-6">
              <SpiritHero spirit={spirit} typeLabel={`Tipo ${ROMANS[spirit.type] ?? spirit.type}`} />

              {/* Metadata bar */}
              <section className="bg-bg-card border border-border rounded-xl p-5">
                <h2 className="font-cinzel font-bold text-xs text-text-muted uppercase tracking-[0.2em] mb-3">
                  Requisitos
                </h2>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <MetaBox icon={TrendingUp} label="Nivel" value={spirit.openLevel || '—'} />
                  <MetaBox icon={Coins}      label="Fragmentos" value={spirit.cardCost || '—'} />
                  <MetaBox icon={Layers}     label="Tipo" value={ROMANS[spirit.type] ?? spirit.type} />
                </div>
              </section>

              {/* Stats */}
              <section className="bg-bg-card border border-border rounded-xl p-5">
                <h2 className="font-cinzel font-bold text-xs text-text-muted uppercase tracking-[0.2em] mb-1">
                  Bonificación de Stats
                </h2>
                <p className="text-[11px] text-text-muted mb-3">
                  Se suman a las stats del ninja portador.
                </p>
                <div className="space-y-2">
                  <StatRow icon={Heart}       label="Vida"          value={spirit.stats.baseLife}        accent="text-power-red" />
                  <StatRow icon={Sword}       label="Atk. Cuerpo"   value={spirit.stats.baseAttack}      accent="text-accent-orange" />
                  <StatRow icon={Shield}      label="Def. Cuerpo"   value={spirit.stats.baseDefense}     accent="text-sage-gold" />
                  <StatRow icon={Sparkles}    label="Atk. Ninjutsu" value={spirit.stats.baseNinjaAttack} accent="text-chakra-blue" />
                  <StatRow icon={ShieldCheck} label="Resistencia"   value={spirit.stats.baseResist}      accent="text-nature-green" />
                </div>
              </section>
            </aside>

            {/* Columna derecha: habilidad + keywords + combos */}
            <div className="space-y-6 min-w-0">
              {/* Habilidad principal */}
              <section className="bg-bg-card border-2 border-accent-orange/30 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={16} className="text-accent-orange" />
                  <h2 className="font-cinzel font-bold text-base text-text-primary uppercase tracking-widest">
                    Habilidad
                  </h2>
                </div>
                <h3 className="font-cinzel text-xl font-bold text-text-primary mb-3">
                  {isUntranslated(spirit.skillName) ? (
                    <span className="text-text-muted italic">Sin traducción disponible</span>
                  ) : (
                    spirit.skillName
                  )}
                </h3>
                {spirit.description ? (
                  isUntranslated(spirit.description) ? (
                    <p className="text-text-muted italic mb-4">
                      La descripción de esta habilidad aún no fue traducida al español por el juego.
                    </p>
                  ) : (
                    <div
                      className="text-text-primary/85 leading-relaxed mb-4"
                      // eslint-disable-next-line react/no-danger
                      dangerouslySetInnerHTML={{ __html: spirit.description }}
                    />
                  )
                ) : null}

                {/* Chips de keywords */}
                {(spirit.triggerKeywords.length > 0 || spirit.applyKeywords.length > 0) && (
                  <div className="space-y-2 pt-3 border-t border-border-light">
                    {spirit.triggerKeywords.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] uppercase tracking-wider text-text-muted">Se desencadena con</span>
                        {spirit.triggerKeywords.map((k) => (
                          <span
                            key={k}
                            className="text-xs px-2 py-0.5 rounded border border-chakra-blue/40 bg-chakra-blue/10 text-chakra-blue"
                          >
                            ⚡ {k}
                          </span>
                        ))}
                      </div>
                    )}
                    {spirit.applyKeywords.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] uppercase tracking-wider text-text-muted">Aplica</span>
                        {spirit.applyKeywords.map((k) => (
                          <span
                            key={k}
                            className="text-xs px-2 py-0.5 rounded border border-accent-orange/40 bg-accent-orange/10 text-accent-orange"
                          >
                            ◆ {k}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </section>

              {/* Combos (Katha) */}
              {hasKatha && (
                <section className="bg-bg-card border border-border rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="flex items-center gap-2 font-cinzel font-bold text-base text-text-primary uppercase tracking-widest">
                      <span className="text-genjutsu-purple">⌘</span>
                      Combos
                    </h2>
                    <span className="text-[10px] uppercase tracking-wider text-text-muted">
                      por nivel del espíritu
                    </span>
                  </div>
                  <div className="space-y-5">
                    {kathaLv1.length > 0 && (
                      <KathaLevel level={1} skills={kathaLv1} />
                    )}
                    {kathaLv2.length > 0 && (
                      <KathaLevel level={2} skills={kathaLv2} />
                    )}
                    {kathaLv3.length > 0 && (
                      <KathaLevel level={3} skills={kathaLv3} />
                    )}
                  </div>
                </section>
              )}
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/centro-de-datos/espiritus"
              className="inline-flex items-center text-sm text-text-muted hover:text-text-primary transition-colors"
            >
              ← Volver al catálogo de Espíritus
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}

function SpiritHero({ spirit, typeLabel }: { spirit: GameSpiritDetail; typeLabel: string }) {
  const [src, setSrc] = useState(spiritBigImageSrc(spirit.id))
  const [error, setError] = useState(false)
  return (
    <section className="relative rounded-2xl overflow-hidden border-2 border-accent-orange/30 bg-gradient-to-br from-bg-card to-bg-card/40 shadow-xl shadow-black/40">
      <span
        aria-hidden
        className="absolute -right-8 -top-12 select-none pointer-events-none font-cinzel text-[14rem] leading-none text-accent-orange/[0.07]"
      >
        獣
      </span>
      <div className="relative aspect-square bg-bg-elevated overflow-hidden">
        {error ? (
          <div className="absolute inset-0 flex items-center justify-center text-6xl font-cinzel text-text-muted">
            {spirit.name.charAt(0)}
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={spirit.name}
            onError={() => {
              if (src.includes('/big/')) setSrc(spiritImageSrc(spirit.id))
              else setError(true)
            }}
            className="w-full h-full object-cover object-top"
          />
        )}
        {/* Type badge */}
        <div className="absolute top-3 right-3 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest bg-black/70 backdrop-blur border border-accent-orange/40 text-accent-orange">
          {typeLabel}
        </div>
      </div>
      <div className="p-5 bg-bg-card border-t border-border-light">
        <h1 className="font-cinzel text-3xl font-bold text-text-primary leading-tight">
          {spirit.name}
        </h1>
        <p className="text-sm text-text-muted mt-1">Espíritu Animal</p>
      </div>
    </section>
  )
}

function KathaLevel({ level, skills }: { level: number; skills: { id: number; name: string; chakra: number; cooldown: number; description: string; iconPath: string }[] }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="font-mono text-xs px-2 py-0.5 rounded bg-bg-elevated border border-border-light text-genjutsu-purple font-bold">
          Lv. {level}
        </span>
      </div>
      <div className="space-y-2">
        {skills.map((s) => (
          <SkillCard key={s.id} skill={s} variant="combo" />
        ))}
      </div>
    </div>
  )
}

function MetaBox({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Heart
  label: string
  value: number | string
}) {
  return (
    <div className="bg-bg-elevated border border-border rounded-md px-2 py-2 flex flex-col items-center text-center">
      <Icon size={14} className="text-accent-orange mb-1" />
      <span className="text-[10px] uppercase tracking-wider text-text-muted">{label}</span>
      <span className="text-sm text-text-primary font-bold mt-0.5">{value}</span>
    </div>
  )
}

function StatRow({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof Heart
  label: string
  value: number
  accent: string
}) {
  return (
    <div className="flex items-center gap-2.5 text-sm">
      <Icon size={14} className={accent + ' flex-shrink-0'} />
      <span className="text-text-muted flex-1 uppercase tracking-wide text-xs">{label}</span>
      <span className="font-mono text-text-primary font-bold">+{value}</span>
    </div>
  )
}

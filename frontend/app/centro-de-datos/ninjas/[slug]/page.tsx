'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Quote } from 'lucide-react'
import api from '@/lib/api'
import { GameNinjaDetail, PROPERTY_COLORS } from '@/lib/types'
import Navbar from '@/components/Navbar'
import LoadingSpinner from '@/components/LoadingSpinner'
import NinjaBreadcrumb from '@/components/ninjas/NinjaBreadcrumb'
import NinjaHero from '@/components/ninjas/NinjaHero'
import NinjaSkillsList from '@/components/ninjas/NinjaSkillsList'
import MainTalentsTimeline from '@/components/ninjas/MainTalentsTimeline'
import StatPanel from '@/components/ninjas/StatPanel'
import ResistGrid from '@/components/ninjas/ResistGrid'
import NinjaPrevNext from '@/components/ninjas/NinjaPrevNext'
import RefText from '@/components/ninjas/RefText'
import StarSelector from '@/components/ninjas/StarSelector'

export default function NinjaDetailPage() {
  const params = useParams<{ slug: string }>()
  const [ninja, setNinja] = useState<GameNinjaDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  // Estrella seleccionada (1..5). Default ★1 — la "forma inicial" cuando recién
  // se obtiene la carta. El usuario puede subir estrellas con el selector.
  const [selectedStar, setSelectedStar] = useState(1)

  useEffect(() => {
    const idOrSlug = params?.slug
    if (!idOrSlug) {
      setNotFound(true)
      setLoading(false)
      return
    }
    setLoading(true)
    setNotFound(false)
    setNinja(null)
    api
      .get<GameNinjaDetail>(`/game/ninjas/${idOrSlug}`)
      .then((r) => {
        setNinja(r.data)
        // Reset estrella seleccionada al cambiar de ninja → siempre arrancamos en ★1
        setSelectedStar(1)
      })
      .catch((e) => {
        if (e?.response?.status === 404) setNotFound(true)
        else console.error(e)
      })
      .finally(() => setLoading(false))
  }, [params?.slug])

  // Computamos el ninja "efectivo" según la estrella seleccionada — pisamos
  // título/imagen/stats/resists, skills y upgrades con los de esa variante.
  // Las stars overlay del hero usan `starLevel` = selectedStar.
  const effectiveNinja = useMemo(() => {
    if (!ninja || !ninja.starVariants?.length) return ninja
    const variant = ninja.starVariants.find((v) => v.star === selectedStar)
    if (!variant) return ninja
    return {
      ...ninja,
      title: variant.title,
      artisticId: variant.artisticId,
      stats: variant.stats,
      resists: variant.resists,
      starLevel: variant.star,
      skills: variant.skills ?? ninja.skills,
      skillUpgrades: variant.skillUpgrades ?? ninja.skillUpgrades,
    }
  }, [ninja, selectedStar])

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

  if (notFound || !ninja || !effectiveNinja) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-bg-primary pt-28 pb-16">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-text-muted text-lg mb-4">Ninja no encontrado</p>
            <Link href="/centro-de-datos/ninjas" className="text-accent-orange hover:underline">
              ← Volver al catálogo
            </Link>
          </div>
        </main>
      </>
    )
  }

  const propColor = PROPERTY_COLORS[ninja.property.code] ?? PROPERTY_COLORS[0]
  const backHref = ninja.kind === 'MAIN' ? '/centro-de-datos/main' : '/centro-de-datos/ninjas'
  const backLabel = ninja.kind === 'MAIN' ? 'Main' : 'Ninjas'
  const showStarSelector = ninja.kind === 'NINJA' && (ninja.starVariants?.length ?? 0) > 1

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-bg-primary pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <NinjaBreadcrumb name={ninja.name} title={effectiveNinja.title} kind={ninja.kind} />

          {/* Layout principal: columna izquierda con identidad + stats + resists,
              columna derecha con las habilidades (que son altas). */}
          <div className="grid lg:grid-cols-[minmax(340px,420px)_1fr] gap-6 items-start">
            {/* Columna izquierda: identidad + stats + resists */}
            <aside className="space-y-6">
              <NinjaHero ninja={effectiveNinja} />
              {showStarSelector && (
                <StarSelector
                  variants={ninja.starVariants!}
                  selected={selectedStar}
                  onSelect={setSelectedStar}
                  propColor={propColor}
                />
              )}
              <StatPanel stats={effectiveNinja.stats} />
              <ResistGrid resists={effectiveNinja.resists} />
            </aside>

            {/* Columna derecha: intro + habilidades / talentos */}
            <div className="min-w-0 space-y-6">
              {/* Intro narrativa con bullets ◆ del color del elemento */}
              {ninja.intro && ninja.intro.desc.length > 0 && (
                <section className="bg-bg-card border border-border rounded-xl p-5">
                  <h2 className="flex items-center gap-2 font-cinzel font-bold text-base text-text-primary mb-3 uppercase tracking-widest">
                    <Quote size={14} className="text-accent-orange" />
                    Sobre este ninja
                  </h2>
                  <ul className="space-y-2 text-sm text-text-primary/85">
                    {ninja.intro.desc.map((line, i) => (
                      <li key={i} className="leading-relaxed flex gap-2.5">
                        <span className={`${propColor.text} text-[10px] leading-relaxed mt-1.5`} aria-hidden>
                          ◆
                        </span>
                        <span className="flex-1">
                          <RefText text={line} />
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {ninja.kind === 'MAIN' && ninja.mainTalents ? (
                <MainTalentsTimeline talents={ninja.mainTalents} />
              ) : (
                <NinjaSkillsList
                  key={`star-${selectedStar}`}
                  specials={effectiveNinja.skills.specials}
                  normals={effectiveNinja.skills.normals}
                  passives={effectiveNinja.skills.passives}
                  skillUpgrades={effectiveNinja.skillUpgrades}
                />
              )}
            </div>
          </div>

          {/* Navegación entre cartas del mismo tipo — full width */}
          <NinjaPrevNext currentId={ninja.id} kind={ninja.kind} />

          {/* Link de retorno al listado (refuerzo del breadcrumb) */}
          <div className="mt-8 text-center">
            <Link
              href={backHref}
              className="inline-flex items-center text-sm text-text-muted hover:text-text-primary transition-colors"
            >
              ← Volver al catálogo de {backLabel}
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}

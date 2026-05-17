'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, Home, Heart, Sword, Shield, Sparkles, ShieldCheck } from 'lucide-react'
import api from '@/lib/api'
import { GameSpirit, spiritImageSrc } from '@/lib/types'
import Navbar from '@/components/Navbar'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function SpiritDetailPage() {
  const params = useParams<{ id: string }>()
  const [spirit, setSpirit] = useState<GameSpirit | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [imgError, setImgError] = useState(false)

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
    setImgError(false)
    api
      .get<GameSpirit>(`/game/spirits/${id}`)
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

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-bg-primary pt-24 pb-16">
        <div className="max-w-5xl mx-auto px-6">
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

          <div className="grid md:grid-cols-[320px_1fr] gap-6 items-start">
            {/* Imagen + identidad */}
            <aside className="space-y-4">
              <section className="relative rounded-2xl overflow-hidden border-2 border-accent-orange/30 bg-gradient-to-br from-bg-card to-bg-card/40 shadow-xl shadow-black/40">
                <span
                  aria-hidden
                  className="absolute -right-8 -top-12 select-none pointer-events-none font-cinzel text-[14rem] leading-none text-accent-orange/[0.07]"
                >
                  獣
                </span>
                <div className="relative aspect-square bg-bg-elevated flex items-center justify-center p-6">
                  {imgError ? (
                    <span className="text-6xl font-cinzel text-text-muted">{spirit.name.charAt(0)}</span>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={spiritImageSrc(spirit.id)}
                      alt={spirit.name}
                      onError={() => setImgError(true)}
                      className="max-w-full max-h-full object-contain"
                    />
                  )}
                </div>
                <div className="p-5 bg-bg-card border-t border-border-light">
                  <h1 className="font-cinzel text-3xl font-bold text-text-primary leading-tight">
                    {spirit.name}
                  </h1>
                  <p className="text-sm text-text-muted mt-1">Espíritu Animal</p>
                </div>
              </section>
            </aside>

            {/* Stats + Skill */}
            <div className="space-y-6 min-w-0">
              {/* Habilidad */}
              <section className="bg-bg-card border-2 border-accent-orange/30 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={16} className="text-accent-orange" />
                  <h2 className="font-cinzel font-bold text-base text-text-primary uppercase tracking-widest">
                    Habilidad
                  </h2>
                </div>
                <h3 className="font-cinzel text-xl font-bold text-text-primary mb-2">
                  {spirit.skillName}
                </h3>
                <p className="text-text-primary/85 leading-relaxed">{spirit.description}</p>
              </section>

              {/* Stats */}
              <section className="bg-bg-card border border-border rounded-xl p-6">
                <h2 className="font-cinzel font-bold text-base text-text-primary uppercase tracking-widest mb-4">
                  Bonificación de Stats
                </h2>
                <p className="text-xs text-text-muted mb-4">
                  Estos valores se suman a las stats del ninja portador.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <StatRow icon={Heart}       label="Vida"          value={spirit.stats.baseLife}        accent="text-power-red" />
                  <StatRow icon={Sword}       label="Atk. Cuerpo"   value={spirit.stats.baseAttack}      accent="text-accent-orange" />
                  <StatRow icon={Shield}      label="Def. Cuerpo"   value={spirit.stats.baseDefense}     accent="text-sage-gold" />
                  <StatRow icon={Sparkles}    label="Atk. Ninjutsu" value={spirit.stats.baseNinjaAttack} accent="text-chakra-blue" />
                  <StatRow icon={ShieldCheck} label="Resistencia"   value={spirit.stats.baseResist}      accent="text-nature-green" />
                </div>
              </section>
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
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-md bg-bg-elevated border border-border">
      <Icon size={16} className={accent + ' flex-shrink-0'} />
      <div className="flex-1 min-w-0">
        <div className="text-[10px] uppercase tracking-wider text-text-muted">{label}</div>
        <div className="font-mono text-base text-text-primary font-bold">+{value}</div>
      </div>
    </div>
  )
}

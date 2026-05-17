'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Users, Shirt, Cat, User as UserIcon, ArrowRight } from 'lucide-react'
import api from '@/lib/api'
import Navbar from '@/components/Navbar'
import { NinjaFiltersResponse } from '@/lib/types'

interface Section {
  href: string | null  // null = "próximamente"
  icon: React.ComponentType<{ size?: number; className?: string }>
  title: string
  description: string
  count?: number | null  // null = no aplica todavía
}

export default function CentroDeDatosPage() {
  const [ninjaCount, setNinjaCount] = useState<number | null>(null)

  useEffect(() => {
    api
      .get<NinjaFiltersResponse>('/game/ninjas/filters')
      .then((r) => setNinjaCount(r.data.total))
      .catch(() => setNinjaCount(null))
  }, [])

  const sections: Section[] = [
    {
      href: '/centro-de-datos/ninjas',
      icon: Users,
      title: 'Ninjas',
      description: 'Catálogo completo de cartas: stats, habilidades, combos y resistencias.',
      count: ninjaCount,
    },
    {
      href: null,
      icon: Shirt,
      title: 'Modas',
      description: 'Skins y tabards disponibles en el juego.',
      count: null,
    },
    {
      href: '/centro-de-datos/espiritus',
      icon: Cat,
      title: 'Espíritus Animales',
      description: 'Compañeros invocables que potencian a tu equipo.',
      count: 49,
    },
    {
      href: '/centro-de-datos/main',
      icon: UserIcon,
      title: 'Main',
      description: 'Avatar del jugador — uno por elemento.',
      count: 5,
    },
  ]

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-bg-primary pt-24 pb-16">
        {/* Hero banner */}
        <div className="relative overflow-hidden border-b border-power-red/15 mb-10">
          <span
            aria-hidden
            className="absolute -right-16 -top-28 select-none pointer-events-none font-cinzel text-[26rem] leading-none text-power-red/[0.06]"
          >
            巻
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-bg-primary via-bg-primary/95 to-transparent pointer-events-none" />
          <div className="relative max-w-6xl mx-auto px-6 py-12">
            <div className="flex items-center gap-3 text-power-red text-xs uppercase tracking-[0.3em] font-bold mb-2">
              <span className="h-px w-8 bg-power-red/40" />
              Pergamino
            </div>
            <h1 className="font-cinzel text-5xl md:text-6xl font-bold text-text-primary leading-none mb-3">
              Centro de Datos
            </h1>
            <p className="text-text-muted max-w-2xl">
              Información sincronizada directamente desde los servidores del juego
              (España + Latinoamérica). Stats, habilidades, descripciones y combos al día.
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {sections.map((s) => {
              const isAvailable = !!s.href
              const card = (
                <div
                  className={`
                    group relative h-full p-6 rounded-xl border transition-all duration-300
                    ${
                      isAvailable
                        ? 'bg-bg-card border-border hover:border-accent-orange/60 hover:shadow-lg hover:shadow-accent-orange/10 cursor-pointer'
                        : 'bg-bg-card/40 border-border/40 cursor-not-allowed'
                    }
                  `}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div
                      className={`
                        w-12 h-12 rounded-lg flex items-center justify-center
                        ${
                          isAvailable
                            ? 'bg-accent-orange/20 text-accent-orange'
                            : 'bg-bg-elevated text-text-muted'
                        }
                      `}
                    >
                      <s.icon size={24} />
                    </div>
                    {s.count !== null && s.count !== undefined && (
                      <span className="text-2xl font-cinzel font-bold text-text-primary">
                        {s.count.toLocaleString('es')}
                      </span>
                    )}
                    {!isAvailable && (
                      <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded border border-border text-text-muted">
                        Próximamente
                      </span>
                    )}
                  </div>
                  <h2
                    className={`font-cinzel text-2xl font-bold mb-1 ${
                      isAvailable ? 'text-text-primary' : 'text-text-muted'
                    }`}
                  >
                    {s.title}
                  </h2>
                  <p className={`text-sm ${isAvailable ? 'text-text-muted' : 'text-text-dim'}`}>
                    {s.description}
                  </p>
                  {isAvailable && (
                    <div className="mt-4 flex items-center gap-1 text-sm text-accent-orange opacity-0 group-hover:opacity-100 transition-opacity">
                      Explorar <ArrowRight size={14} />
                    </div>
                  )}
                </div>
              )
              return isAvailable ? (
                <Link key={s.title} href={s.href!}>
                  {card}
                </Link>
              ) : (
                <div key={s.title}>{card}</div>
              )
            })}
          </div>
        </div>
      </main>
    </>
  )
}

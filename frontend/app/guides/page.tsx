'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, Compass, Zap, Users, BookOpen, Shield, Flame, Trophy, Scroll, Swords } from 'lucide-react'
import Navbar from '@/components/Navbar'

interface Guide {
  id: string
  title: string
  description: string
  category: string
  icon: React.ElementType
  color: string
  difficulty: 'Básico' | 'Intermedio' | 'Avanzado'
  readTime: string
}

const GUIDES: Guide[] = [
  {
    id: 'builds-genin',
    title: 'Builds Óptimos para Genin',
    description: 'Aprende a configurar tu personaje desde el principio con builds probados que maximizan tu daño y supervivencia.',
    category: 'Builds',
    icon: Compass,
    color: 'text-chakra-blue',
    difficulty: 'Básico',
    readTime: '8 min',
  },
  {
    id: 'misiones-rapidas',
    title: 'Sistema de Misiones Rápidas',
    description: 'Completa misiones eficientemente y gana XP rápido. Descubre las mejores estrategias por tipo de misión.',
    category: 'Misiones',
    icon: Zap,
    color: 'text-accent-orange',
    difficulty: 'Básico',
    readTime: '6 min',
  },
  {
    id: 'pvp-principiante',
    title: 'PvP para Principiantes',
    description: 'Entra en arena con confianza. Aprende mecánicas básicas, timing de skills y cómo escapar de emboscadas.',
    category: 'PvP',
    icon: Swords,
    color: 'text-power-red',
    difficulty: 'Básico',
    readTime: '10 min',
  },
  {
    id: 'builds-avanzados',
    title: 'Builds Competitivos Avanzados',
    description: 'Domina sinergias de jutsu, cooldown management y rotaciones óptimas para dominar el ranking.',
    category: 'Builds',
    icon: Shield,
    color: 'text-chakra-blue',
    difficulty: 'Avanzado',
    readTime: '15 min',
  },
  {
    id: 'clanes-estrategia',
    title: 'Guía de Clanes y Estrategia de Grupo',
    description: 'Forma un clan, establece formaciones y domina las batallas grupales con tácticas coordinadas.',
    category: 'Clanes',
    icon: Users,
    color: 'text-sage-gold',
    difficulty: 'Intermedio',
    readTime: '12 min',
  },
  {
    id: 'eventos-especiales',
    title: 'Maximizar Eventos Especiales',
    description: 'Aprovecha al máximo los eventos limitados, colecciona recompensas exclusivas y obtén cupones estratégicamente.',
    category: 'Eventos',
    icon: Flame,
    color: 'text-accent-orange',
    difficulty: 'Intermedio',
    readTime: '9 min',
  },
]

const CATEGORIES = ['Todos', 'Builds', 'Misiones', 'PvP', 'Clanes', 'Eventos']

export default function GuidesPage() {
  const [selectedCategory, setSelectedCategory] = useState('Todos')

  const filteredGuides = selectedCategory === 'Todos'
    ? GUIDES
    : GUIDES.filter(g => g.category === selectedCategory)

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Básico': return 'bg-nature-green/20 text-nature-green border-nature-green/30'
      case 'Intermedio': return 'bg-sage-gold/20 text-sage-gold border-sage-gold/30'
      case 'Avanzado': return 'bg-power-red/20 text-power-red border-power-red/30'
      default: return 'bg-white/10 text-white/70 border-white/20'
    }
  }

  return (
    <main className="min-h-screen bg-bg-primary overflow-x-hidden" style={{
      backgroundImage: 'url(/images/bg/guias.png), linear-gradient(rgba(0, 128, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 128, 255, 0.03) 1px, transparent 1px)',
      backgroundPosition: 'center, 0, 0',
      backgroundSize: 'cover, 40px 40px, 40px 40px',
      backgroundAttachment: 'fixed, scroll, scroll',
    }}>
      {/* Guías background overlay — Low opacity */}
      <div className="fixed inset-0 bg-bg-primary/70 pointer-events-none z-0" />

      {/* Ambient */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-1">
        <div className="absolute top-0 left-1/3 w-96 h-96 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, rgba(0,128,255,0.15) 0%, transparent 70%)' }} />
      </div>

      <Navbar />

      {/* Hero Section */}
      <section className="relative py-20 px-6 border-b border-border/50">
        <div className="max-w-6xl mx-auto relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white/90 transition-colors mb-8">
            <ChevronLeft className="w-4 h-4" />
            Volver al inicio
          </Link>

          <div className="mb-12">
            <p className="text-xs font-cinzel text-chakra-blue tracking-[0.2em] uppercase font-bold mb-4">
              Conocimiento Ninja
            </p>
            <h1 className="text-5xl md:text-6xl font-cinzel font-black text-text-primary leading-tight mb-6">
              Guías Estratégicas
            </h1>
            <p className="text-white/70 max-w-2xl text-base leading-relaxed">
              Aprende de los mejores ninjas de la comunidad. Guías detalladas, estrategias probadas
              y tips exclusivos para dominar cada aspecto del juego.
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-3">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg font-montserrat font-semibold text-sm transition-all duration-200 ${
                  selectedCategory === cat
                    ? 'bg-chakra-blue text-white shadow-lg shadow-chakra-blue/30'
                    : 'bg-bg-card border border-border hover:border-chakra-blue/50 text-white/70 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Guides Grid */}
      <section className="py-20 px-6 relative">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGuides.map(guide => {
              const Icon = guide.icon
              return (
                <div
                  key={guide.id}
                  className="group game-card p-6 rounded-xl hover:border-chakra-blue/50 transition-all duration-300 hover:shadow-lg hover:shadow-chakra-blue/20 cursor-pointer"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-lg bg-bg-elevated flex items-center justify-center group-hover:scale-110 transition-transform border border-border`}>
                      <img
                        src="/images/tools/shuriken.png"
                        alt={guide.title}
                        className="w-7 h-7 object-contain"
                      />
                    </div>
                    <span className={`text-xs font-cinzel px-3 py-1 rounded-full border ${getDifficultyColor(guide.difficulty)}`}>
                      {guide.difficulty}
                    </span>
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-montserrat font-bold text-text-primary mb-2 group-hover:text-chakra-blue transition-colors">
                    {guide.title}
                  </h3>
                  <p className="text-sm text-white/70 leading-relaxed mb-6">
                    {guide.description}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-border/50">
                    <div className="flex items-center gap-4 text-xs text-white/50">
                      <span>{guide.readTime} lectura</span>
                      <span className="inline-flex items-center gap-1">
                        <Scroll className="w-3 h-3" />
                        {guide.category}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {filteredGuides.length === 0 && (
            <div className="text-center py-20">
              <BookOpen className="w-16 h-16 text-white/30 mx-auto mb-4" />
              <p className="text-white/70 font-montserrat">No hay guías en esta categoría todavía.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 border-t border-border/50 relative">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-cinzel font-black text-text-primary mb-6">
            ¿No encuentras lo que buscas?
          </h2>
          <p className="text-white/70 mb-8">
            Únete a nuestra comunidad en Discord para pedir nuevas guías y compartir tus propias estrategias.
          </p>
          <Link
            href="/"
            className="group inline-flex items-center gap-2 px-8 py-3.5 text-base font-montserrat font-bold text-white bg-gradient-to-r from-chakra-blue to-cyan-500 rounded-lg hover:shadow-lg hover:shadow-chakra-blue/30 transition-all duration-300 hover:scale-105 active:scale-95 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative z-10">Explorar más</span>
          </Link>
        </div>
      </section>
    </main>
  )
}

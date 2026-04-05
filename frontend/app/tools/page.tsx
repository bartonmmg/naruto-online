'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, Ticket, Swords, Map, BookOpen, Wrench, Lock, ChevronRight } from 'lucide-react'
import Navbar from '@/components/Navbar'

interface Tool {
  id: string
  name: string
  description: string
  href: string | null
  available: boolean
  color: string
  badge?: string
}

const TOOLS: Tool[] = [
  {
    id: 'coupons',
    name: 'Calculadora de Cupones',
    description: 'Calcula cuántos cupones puedes coleccionar en un período de tiempo según tus eventos activos.',
    href: '/tools/coupons',
    available: true,
    color: 'text-accent-orange',
    badge: 'Disponible',
  },
  {
    id: 'power',
    name: 'Calculadora de Poder',
    description: 'Simula tu poder de combate según tus ninjas, equipamiento y mejoras.',
    href: null,
    available: false,
    color: 'text-chakra-blue',
  },
  {
    id: 'guide',
    name: 'Guía de Progresión',
    description: 'Rutas optimizadas para crecer rápido según tu etapa en el juego.',
    href: null,
    available: false,
    color: 'text-sage-gold',
  },
  {
    id: 'wiki',
    name: 'Wiki de Eventos',
    description: 'Base de datos con todos los eventos del juego, recompensas y estrategias.',
    href: null,
    available: false,
    color: 'text-nature-green',
  },
]

export default function ToolsPage() {
  return (
    <main className="min-h-screen bg-bg-primary overflow-x-hidden" style={{
      backgroundImage: 'url(/images/bg/herramientas.png), linear-gradient(rgba(196, 30, 58, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(196, 30, 58, 0.03) 1px, transparent 1px)',
      backgroundPosition: 'center, 0, 0',
      backgroundSize: 'cover, 40px 40px, 40px 40px',
      backgroundAttachment: 'fixed, scroll, scroll',
    }}>
      {/* Herramientas background overlay — Low opacity */}
      <div className="fixed inset-0 bg-bg-primary/70 pointer-events-none z-0" />

      {/* Ambient */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-1">
        <div className="absolute top-0 right-1/3 w-96 h-96 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, rgba(196,30,58,0.15) 0%, transparent 70%)' }} />
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
            <p className="text-xs font-cinzel text-accent-orange tracking-[0.2em] uppercase font-bold mb-4">
              Herramientas
            </p>
            <h1 className="text-5xl md:text-6xl font-cinzel font-black text-text-primary leading-tight mb-6">
              Herramientas Ninja
            </h1>
            <p className="text-white/70 max-w-2xl text-base leading-relaxed">
              Calculadoras, guías y utilidades diseñadas para optimizar tu progreso en Naruto Online.
              Domina el juego con herramientas exclusivas de la comunidad.
            </p>
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="py-20 px-6 relative">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {TOOLS.map((tool) => (
              <div
                key={tool.id}
                className={`group game-card p-8 rounded-xl transition-all duration-300 ${
                  tool.available
                    ? 'game-card-orange hover:border-accent-orange/50 hover:shadow-lg hover:shadow-accent-orange/20 cursor-pointer'
                    : 'opacity-60 cursor-not-allowed'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform ${
                    tool.available ? 'bg-accent-orange/10 border border-accent-orange/20' : 'bg-bg-elevated border border-border'
                  }`}>
                    <img
                      src="/images/tools/shuriken.png"
                      alt={tool.name}
                      className="w-8 h-8 object-contain"
                    />
                  </div>
                  {tool.available ? (
                    <span className="text-xs font-cinzel px-3 py-1 rounded-full bg-accent-orange/20 text-accent-orange border border-accent-orange/30">
                      {tool.badge}
                    </span>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs font-cinzel text-white/50">
                      <Lock className="w-3 h-3" />
                      Próximamente
                    </div>
                  )}
                </div>

                {/* Content */}
                <h3 className="text-lg font-montserrat font-bold text-text-primary mb-3 group-hover:text-accent-orange transition-colors">
                  {tool.name}
                </h3>
                <p className="text-sm text-white/70 leading-relaxed mb-6">
                  {tool.description}
                </p>

                {/* Footer */}
                {tool.available && (
                  <div className="flex items-center justify-between pt-4 border-t border-border/50">
                    <span className="text-xs text-accent-orange font-cinzel">Abrir herramienta</span>
                    <ChevronRight className="w-4 h-4 text-accent-orange group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="mt-20 text-center">
            <h2 className="text-3xl md:text-4xl font-cinzel font-black text-text-primary mb-6">
              ¿Necesitas más herramientas?
            </h2>
            <p className="text-white/70 mb-8">
              Únete a nuestra comunidad y sugiere nuevas herramientas. Tu idea podría ser la próxima.
            </p>
            <Link
              href="/"
              className="group inline-flex items-center gap-2 px-8 py-3.5 text-base font-montserrat font-bold text-white bg-gradient-to-r from-orange-600 to-orange-500 rounded-lg hover:shadow-lg hover:shadow-orange-500/30 transition-all duration-300 hover:scale-105 active:scale-95 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-700 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative z-10">Explorar más</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}

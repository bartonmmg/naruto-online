'use client'

import Link from 'next/link'
import {
  Zap,
  Compass,
  Users,
  Flame,
  ChevronRight,
  Shield,
  Trophy,
  Swords,
  Star,
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import FloatingParticles from '@/components/animations/FloatingParticles'

const FEATURES = [
  {
    icon: Zap,
    color: 'text-accent-orange',
    bgColor: 'bg-accent-orange/10',
    borderHover: 'game-card-orange',
    title: 'Sistema de XP',
    description:
      'Gana experiencia completando misiones, participando en la comunidad y usando herramientas. Tu progreso se refleja en tiempo real.',
  },
  {
    icon: Compass,
    color: 'text-chakra-blue',
    bgColor: 'bg-chakra-blue/10',
    borderHover: 'game-card-blue',
    title: 'Herramientas',
    description:
      'Guías estratégicas, calculadoras y simuladores diseñados para dominar cada aspecto del juego. Todo en un solo lugar.',
  },
  {
    icon: Users,
    color: 'text-power-red',
    bgColor: 'bg-power-red/10',
    borderHover: 'game-card-red',
    title: 'Comunidad',
    description:
      'Conecta con ninjas de todo el mundo. Comparte estrategias, compite en rankings y forma clanes legendarios.',
  },
]

const RANKS = [
  { name: 'Genin', xp: '0 – 999 XP', cls: 'rank-genin' },
  { name: 'Chunin', xp: '1K – 4.9K XP', cls: 'rank-chunin' },
  { name: 'Jonin', xp: '5K – 19.9K XP', cls: 'rank-jonin' },
  { name: 'Kage', xp: '20K+ XP', cls: 'rank-kage' },
  { name: 'Akatsuki', xp: 'Clan especial', cls: 'rank-akatsuki' },
]

export default function Home() {
  return (
    <main className="min-h-screen bg-bg-primary overflow-x-hidden">
      <Navbar />
      <FloatingParticles />

      {/* ── Kanji background decoration (full page) ────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <span
          className="absolute top-16 left-10 text-power-red/6 text-8xl font-cinzel select-none animate-float"
          style={{ animationDelay: '0s' }}
        >
          忍
        </span>
        <span
          className="absolute top-1/3 right-8 text-power-red/5 text-7xl font-cinzel select-none animate-float"
          style={{ animationDelay: '2s' }}
        >
          暁
        </span>
        <span
          className="absolute bottom-1/3 left-6 text-power-red/5 text-9xl font-cinzel select-none animate-float"
          style={{ animationDelay: '4s' }}
        >
          滅
        </span>
        <span
          className="absolute bottom-20 right-12 text-power-red/4 text-6xl font-cinzel select-none animate-bounce-slow"
          style={{ animationDelay: '1s' }}
        >
          力
        </span>
      </div>

      {/* ── HERO ─────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center px-6 grid-bg overflow-hidden" style={{ backgroundImage: 'url(/images/bg/village.png)', backgroundPosition: 'center bottom', backgroundSize: 'cover', backgroundAttachment: 'fixed' }}>
        {/* Village background overlay — Low opacity */}
        <div className="absolute inset-0 bg-bg-primary/60 pointer-events-none z-5" />

        {/* Ambient orbs — Akatsuki red + dark blue */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] orb-red opacity-25 pointer-events-none z-5" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] orb-blue opacity-15 pointer-events-none z-5" />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* Status badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-power-red/30 bg-power-red/5 text-power-red text-xs font-cinzel tracking-widest mb-8 animate-fade-up">
            <span className="w-1.5 h-1.5 rounded-full bg-power-red animate-pulse" />
            BETA ABIERTA
          </div>

          {/* Main heading */}
          <h1
            className="text-5xl md:text-7xl font-cinzel font-black text-text-primary leading-tight tracking-tight mb-6 animate-fade-up"
            style={{ animationDelay: '0.1s' }}
          >
            <span
              className="text-power-red"
              style={{ textShadow: '0 0 30px rgba(196,30,58,0.5), 0 0 60px rgba(196,30,58,0.2)' }}
            >
              HDRV
            </span>
            <br />
            <span className="text-3xl md:text-4xl text-white/80 font-semibold tracking-widest">
              Comunidad Naruto Online
            </span>
          </h1>

          {/* Subtitle */}
          <p
            className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-up"
            style={{ animationDelay: '0.2s' }}
          >
            Gana experiencia, sube de rango y construye tu leyenda. La comunidad más activa del
            juego, con herramientas y misiones diarias.
          </p>

          {/* CTAs */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-5 animate-fade-up"
            style={{ animationDelay: '0.3s' }}
          >
            <Link href="/auth/register" className="group px-8 py-3.5 text-lg font-montserrat font-bold text-white bg-gradient-to-r from-orange-600 to-orange-500 rounded-lg hover:shadow-lg hover:shadow-orange-500/30 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2.5 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-700 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Flame className="w-5 h-5 relative z-10" />
              <span className="relative z-10">Comenzar tu camino ninja</span>
            </Link>
            <Link
              href="/auth/login"
              className="group px-8 py-3.5 text-lg font-montserrat font-bold text-white/90 border border-white/20 rounded-lg hover:border-white/40 hover:bg-white/5 transition-all duration-300 relative overflow-hidden flex items-center gap-2.5"
            >
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative z-10">Ya eres ninja</span>
              <ChevronRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────── */}
      <section id="features" className="py-32 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-xs font-cinzel text-power-red tracking-[0.2em] uppercase font-bold mb-4">
              Características
            </p>
            <h2 className="text-4xl md:text-5xl font-cinzel font-black text-text-primary leading-tight mb-6">
              Todo lo que necesitas
            </h2>
            <p className="text-white/70 mt-4 max-w-2xl mx-auto text-base leading-relaxed">
              Herramientas poderosas diseñadas por y para la comunidad de Naruto Online. Domina el
              juego con nuestras calculadoras, guías y rankings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, color, bgColor, borderHover, title, description }) => (
              <div
                key={title}
                className={`game-card ${borderHover} p-8 rounded-xl group cursor-pointer`}
              >
                <div
                  className={`w-12 h-12 ${bgColor} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>
                <h3 className="text-lg font-montserrat font-bold text-text-primary mb-3 group-hover:text-accent-orange transition-colors">
                  {title}
                </h3>
                <p className="text-sm text-white/70 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>

          {/* Secondary features row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {[
              {
                icon: Flame,
                color: 'text-accent-orange',
                title: 'Misiones Diarias',
                desc: 'Retos con recompensas de XP',
              },
              {
                icon: Trophy,
                color: 'text-sage-gold',
                title: 'Ranking Global',
                desc: 'Compite con otros ninjas',
              },
              {
                icon: Shield,
                color: 'text-chakra-blue',
                title: 'Logros & Badges',
                desc: 'Desbloquea insignias épicas',
              },
            ].map(({ icon: Icon, color, title, desc }) => (
              <div
                key={title}
                className="game-card game-card-orange p-6 flex items-center gap-4 group"
              >
                <div
                  className={`w-10 h-10 bg-bg-elevated rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}
                >
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div>
                  <div className="font-montserrat font-bold text-sm text-text-primary">{title}</div>
                  <div className="text-xs text-white/70 mt-0.5">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RANK SYSTEM ──────────────────────────────── */}
      <section
        id="community"
        className="py-32 px-6 bg-gradient-to-b from-bg-secondary/20 to-bg-primary border-y border-border"
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <p className="text-xs font-cinzel text-power-red tracking-[0.2em] uppercase font-bold mb-4">
                Sistema de Rangos
              </p>
              <h2 className="text-4xl md:text-5xl font-cinzel font-black text-text-primary mb-6 leading-tight">
                Demuestra tu{' '}
                <span
                  className="text-power-red drop-shadow-lg"
                  style={{ textShadow: '0 0 20px rgba(196,30,58,0.5)' }}
                >
                  poder
                </span>{' '}
                ninja
              </h2>
              <p className="text-white/70 leading-relaxed mb-8 text-base">
                Sube de rango ganando XP. Cada acción en la plataforma — desde completar misiones
                hasta participar en la comunidad — te acerca al rango más alto.
              </p>
              <Link href="/auth/register" className="group inline-flex items-center gap-2 px-6 py-2.5 text-base font-montserrat font-bold text-white bg-gradient-to-r from-orange-600 to-orange-500 rounded-lg hover:shadow-lg hover:shadow-orange-500/30 transition-all duration-300 hover:scale-105 active:scale-95 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-700 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Swords className="w-4 h-4 relative z-10" />
                <span className="relative z-10">Comenzar como Genin</span>
              </Link>
            </div>

            <div className="space-y-3">
              {RANKS.map(({ name, xp, cls }, i) => (
                <div
                  key={name}
                  className="game-card p-4 flex items-center justify-between animate-fade-up"
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  <div className="flex items-center gap-3">
                    <Star className="w-4 h-4 text-text-dim" />
                    <span className="font-montserrat font-bold text-sm text-text-primary">{name}</span>
                  </div>
                  <span className={`text-xs font-cinzel px-3 py-1 rounded-full ${cls}`}>{xp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────── */}
      <section className="py-32 px-6 relative overflow-hidden grid-bg">
        <div className="absolute inset-0 orb-orange opacity-20 pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-cinzel font-black text-text-primary mb-6 leading-tight">
            ¿Listo para tu
            <br />
            <span className="text-power-red" style={{ textShadow: '0 0 30px rgba(196,30,58,0.5)' }}>
              primera misión?
            </span>
          </h2>
          <p className="text-white/70 mb-10">Únete a la comunidad. Es gratis. Siempre lo será.</p>
          <Link href="/auth/register" className="group inline-flex items-center gap-2.5 px-8 py-3.5 text-lg font-montserrat font-bold text-white bg-gradient-to-r from-orange-600 to-orange-500 rounded-lg hover:shadow-lg hover:shadow-orange-500/30 transition-all duration-300 hover:scale-105 active:scale-95 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-700 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <Flame className="w-5 h-5 relative z-10" />
            <span className="relative z-10">Registrarse ahora — gratis</span>
          </Link>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────── */}
      <footer className="border-t border-border py-10 px-6 bg-bg-secondary/20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-power-red/70 font-cinzel text-lg">忍</span>
            <span className="font-cinzel font-black text-sm text-text-muted tracking-[0.2em]">
              HD<span className="text-power-red">RV</span>
            </span>
          </div>
          <p className="text-text-dim text-xs text-center">Comunidad de Naruto Online</p>
          <div className="flex items-center gap-6">
            <Link
              href="/rankings"
              className="text-xs text-text-dim hover:text-power-red transition-colors font-cinzel"
            >
              Rankings
            </Link>
            <Link
              href="/tools"
              className="text-xs text-text-dim hover:text-power-red transition-colors font-cinzel"
            >
              Herramientas
            </Link>
            <Link
              href="/auth/login"
              className="text-xs text-text-dim hover:text-power-red transition-colors font-cinzel"
            >
              Entrar
            </Link>
          </div>
        </div>
      </footer>
    </main>
  )
}

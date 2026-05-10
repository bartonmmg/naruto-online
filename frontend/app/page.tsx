'use client'

import { useEffect, useRef, useState } from 'react'
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
  Bell,
  Settings,
  LayoutDashboard,
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import FloatingParticles from '@/components/animations/FloatingParticles'
import LatestNewsSection from '@/components/LatestNewsSection'
import WeeklySummary from '@/components/WeeklySummary'
import AvatarFrame from '@/components/profile/AvatarFrame'
import { useAuth } from '@/lib/hooks/useAuth'
import api from '@/lib/api'

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
  { name: 'Genin',    desc: 'El comienzo del camino ninja',              cls: 'rank-genin',    img: '/images/rangos/genin.png' },
  { name: 'Chūnin',  desc: 'Ninja con experiencia probada',              cls: 'rank-chunin',   img: '/images/rangos/chunin.png' },
  { name: 'Jōnin',   desc: 'Maestro con guías de alto impacto',         cls: 'rank-jonin',    img: '/images/rangos/jonin.png' },
  { name: 'Kage',    desc: 'Leyenda de la comunidad',                   cls: 'rank-kage',     img: '/images/rangos/kage.png' },
  { name: 'Akatsuki', desc: 'Rango prestige — los más temidos del mundo', cls: 'rank-akatsuki', img: '/images/rangos/akatsuki.png' },
]

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const { user, isLoggedIn, isLoading: authLoading } = useAuth()

  useEffect(() => {
    const video = videoRef.current
    if (video) {
      video.playbackRate = 0.5
    }
  }, [])

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
      <section className="relative min-h-screen flex items-center justify-center px-6 grid-bg overflow-hidden bg-bg-primary">
        {/* Video background with native loop */}
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            controlsList="nodownload nofullscreen noremoteplayback"
          >
            <source src="/videos/village.mp4" type="video/mp4" />
          </video>
        </div>

        {/* Video overlay — Low opacity */}
        <div className="absolute inset-0 bg-bg-primary/60 pointer-events-none z-5" />

        {/* Ambient orbs — Akatsuki red + dark blue */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] orb-red opacity-25 pointer-events-none z-5" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] orb-blue opacity-15 pointer-events-none z-5" />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {!authLoading && isLoggedIn && user ? (
            <LoggedInHero user={user} />
          ) : (
            <>
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
            </>
          )}
        </div>
      </section>

      {/* ── LOGGED-IN ROW: notifications + ranking position ─── */}
      {!authLoading && isLoggedIn && user && <LoggedInRow user={user} />}

      {/* ── WEEKLY SUMMARY POPUP ─────────────────────── */}
      <WeeklySummary />

      {/* ── LATEST NEWS ──────────────────────────────── */}
      <LatestNewsSection />

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
              {RANKS.map(({ name, desc, cls, img }, i) => (
                <div
                  key={name}
                  className="game-card p-4 flex items-center gap-4 animate-fade-up"
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  <img src={img} alt={name} className="w-10 h-10 object-contain flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="font-cinzel font-bold text-sm text-text-primary">{name}</span>
                    <p className="text-xs text-text-dim mt-0.5 truncate">{desc}</p>
                  </div>
                  <span className={`text-xs font-cinzel px-2 py-1 rounded-full flex-shrink-0 ${cls}`}>{name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Novedades ─────────────────────────────────── */}
      <LatestNews />

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

const TYPE_META: Record<string, { label: string; color: string; bg: string; border: string; icon: string }> = {
  CHINA:     { label: 'China',     color: 'text-red-400',     bg: 'bg-red-400/10',     border: 'border-red-400/20',     icon: '🔴' },
  EVENT:     { label: 'Evento',    color: 'text-chakra-blue', bg: 'bg-chakra-blue/10', border: 'border-chakra-blue/20', icon: '📅' },
  TENTATIVE: { label: 'Tentativa', color: 'text-sage-gold',   bg: 'bg-sage-gold/10',   border: 'border-sage-gold/20',   icon: '⚡' },
  GENERAL:   { label: 'General',   color: 'text-white/50',    bg: 'bg-white/5',         border: 'border-white/10',       icon: '📢' },
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const d = Math.floor(diff / 86400000)
  if (d === 0) return 'hoy'
  if (d === 1) return 'ayer'
  if (d < 7) return `hace ${d}d`
  return `hace ${Math.floor(d / 7)}sem`
}

const LEVEL_THRESHOLDS = [0, 100, 250, 500, 900, 1400, 2000, 3000, 4500, 6500, 9500]

function getRankLabel(level: number) {
  if (level >= 11) return { name: 'Akatsuki', img: '/images/rangos/akatsuki.png', cls: 'text-power-red' }
  if (level >= 10) return { name: 'Kage',     img: '/images/rangos/kage.png',     cls: 'text-sage-gold' }
  if (level >= 7)  return { name: 'Jōnin',   img: '/images/rangos/jonin.png',    cls: 'text-accent-orange' }
  if (level >= 4)  return { name: 'Chūnin',  img: '/images/rangos/chunin.png',   cls: 'text-chakra-blue' }
  return                  { name: 'Genin',    img: '/images/rangos/genin.png',    cls: 'text-nature-green' }
}

function LoggedInHero({ user }: { user: any }) {
  const level = user.level ?? 1
  const xp = user.xp ?? 0
  const rank = getRankLabel(level)
  const curThreshold = LEVEL_THRESHOLDS[Math.min(level - 1, LEVEL_THRESHOLDS.length - 1)] ?? 0
  const nextThreshold = LEVEL_THRESHOLDS[Math.min(level, LEVEL_THRESHOLDS.length - 1)] ?? curThreshold
  const xpInLevel = Math.max(0, xp - curThreshold)
  const xpNeeded = Math.max(1, nextThreshold - curThreshold)
  const xpToNext = Math.max(0, nextThreshold - xp)
  const pct = Math.min(100, Math.round((xpInLevel / xpNeeded) * 100))
  const isMaxed = level >= LEVEL_THRESHOLDS.length

  return (
    <div className="animate-fade-up">
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-accent-orange/30 bg-accent-orange/5 text-accent-orange text-xs font-cinzel tracking-widest mb-6">
        <span className="w-1.5 h-1.5 rounded-full bg-accent-orange animate-pulse" />
        BIENVENIDO DE NUEVO
      </div>

      <div className="flex flex-col items-center gap-5 mb-6">
        <AvatarFrame avatarSlug={user.avatarSlug} frameSlug={user.frameSlug} size={128} />
        <div>
          <h1
            className="text-4xl md:text-5xl font-cinzel font-black leading-tight tracking-tight"
            style={user.nameColor ? { color: user.nameColor } : undefined}
          >
            {user.username}
          </h1>
          <div className="flex items-center justify-center gap-3 mt-2">
            <img src={rank.img} alt={rank.name} className="w-7 h-7 object-contain" />
            <span className={`font-cinzel text-sm tracking-widest ${rank.cls}`}>{rank.name.toUpperCase()}</span>
            <span className="text-white/40 text-sm">·</span>
            <span className="font-montserrat font-bold text-sm text-white/80">Nivel {level}</span>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto mb-8">
        <div className="flex items-center justify-between text-xs font-montserrat text-white/60 mb-2">
          <span>{xp} XP</span>
          <span>
            {isMaxed ? 'Máximo nivel' : `${xpToNext} XP para subir`}
          </span>
        </div>
        <div className="h-2 rounded-full bg-bg-elevated border border-border/40 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orange-600 to-orange-400 transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link href="/dashboard" className="group px-7 py-3 text-base font-montserrat font-bold text-white bg-gradient-to-r from-orange-600 to-orange-500 rounded-lg hover:shadow-lg hover:shadow-orange-500/30 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2">
          <LayoutDashboard className="w-5 h-5" />
          <span>Ir al dashboard</span>
        </Link>
        <Link href="/profile/edit" className="px-7 py-3 text-base font-montserrat font-bold text-white/90 border border-white/20 rounded-lg hover:border-white/40 hover:bg-white/5 transition-all duration-300 flex items-center gap-2">
          <Settings className="w-4 h-4" />
          <span>Editar perfil</span>
        </Link>
      </div>
    </div>
  )
}

function LoggedInRow({ user }: { user: any }) {
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    api.get('/notifications')
      .then(r => {
        const items: any[] = r.data?.notifications ?? r.data?.items ?? r.data ?? []
        const list = Array.isArray(items) ? items : []
        setNotifications(list.filter(n => !n.read).slice(0, 3))
        setUnreadCount(list.filter(n => !n.read).length)
      })
      .catch(() => {})
  }, [])

  return (
    <section className="px-6 py-12 border-t border-border/30 bg-bg-secondary/10">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Notifications */}
        <div className="game-card p-5 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-accent-orange" />
              <h3 className="font-cinzel font-bold text-sm tracking-wider text-text-primary">
                Notificaciones
              </h3>
              {unreadCount > 0 && (
                <span className="text-[10px] font-montserrat font-bold px-2 py-0.5 rounded-full bg-accent-orange/20 text-accent-orange">
                  {unreadCount} sin leer
                </span>
              )}
            </div>
            <Link href="/notifications" className="text-[10px] text-accent-orange hover:underline font-montserrat">
              Ver todo →
            </Link>
          </div>

          {notifications.length === 0 ? (
            <p className="text-xs text-white/40 font-montserrat py-3">No tienes notificaciones nuevas.</p>
          ) : (
            <ul className="space-y-2">
              {notifications.map(n => (
                <li key={n.id} className="text-xs text-white/70 font-montserrat py-2 px-3 rounded-lg bg-bg-elevated/40 border border-border/30">
                  <p className="line-clamp-2">{n.message}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Quick links */}
        <div className="game-card p-5 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-sage-gold" />
              <h3 className="font-cinzel font-bold text-sm tracking-wider text-text-primary">
                Tu actividad
              </h3>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Link href="/guides" className="text-center p-3 rounded-lg bg-bg-elevated/40 border border-border/30 hover:border-accent-orange/40 transition-colors">
              <div className="text-lg font-cinzel font-bold text-text-primary">{user.level ?? 1}</div>
              <div className="text-[10px] text-white/50 font-montserrat mt-1">Nivel</div>
            </Link>
            <Link href="/rankings" className="text-center p-3 rounded-lg bg-bg-elevated/40 border border-border/30 hover:border-accent-orange/40 transition-colors">
              <div className="text-lg font-cinzel font-bold text-text-primary">{user.xp ?? 0}</div>
              <div className="text-[10px] text-white/50 font-montserrat mt-1">XP total</div>
            </Link>
            <Link href={`/users/${user.username}`} className="text-center p-3 rounded-lg bg-bg-elevated/40 border border-border/30 hover:border-accent-orange/40 transition-colors">
              <div className="text-lg font-cinzel font-bold text-text-primary">→</div>
              <div className="text-[10px] text-white/50 font-montserrat mt-1">Mi perfil</div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

function LatestNews() {
  const [posts, setPosts] = useState<any[]>([])

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/news?limit=3`)
      .then(r => r.json())
      .then(d => setPosts(d.items ?? []))
      .catch(() => {})
  }, [])

  if (!posts.length) return null

  return (
    <section className="py-24 px-6 relative border-t border-border/20">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="font-cinzel font-black text-3xl text-text-primary">Últimas Novedades</h2>
            <p className="text-white/40 font-montserrat text-sm mt-1">Lo más reciente del servidor</p>
          </div>
          <Link href="/novedades" className="text-xs font-montserrat font-semibold text-accent-orange hover:text-accent-orange/80 transition-colors flex items-center gap-1">
            Ver todas →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {posts.map((post: any) => {
            const meta = TYPE_META[post.type] ?? TYPE_META.GENERAL
            return (
              <Link key={post.id} href={`/novedades/${post.id}`}
                className="bg-bg-card border border-border/50 rounded-2xl p-5 hover:border-border/80 hover:bg-bg-elevated/30 transition-all group">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-[10px] font-montserrat font-bold px-2 py-0.5 rounded-full border ${meta.bg} ${meta.color} ${meta.border}`}>
                    {meta.icon} {meta.label}
                  </span>
                  <span className="ml-auto text-[10px] text-white/30 font-montserrat">{timeAgo(post.publishedAt)}</span>
                </div>
                <p className="font-cinzel font-bold text-sm text-text-primary line-clamp-2 group-hover:text-accent-orange transition-colors mb-2">
                  {post.title}
                </p>
                <p className="text-xs text-white/40 font-montserrat line-clamp-2 leading-relaxed">
                  {post.content.replace(/\n/g, ' ').trim()}
                </p>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

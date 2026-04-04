'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogOut, Zap, Shield, Trophy, Flame, Compass, Users } from 'lucide-react'
import Button from '@/components/ui/Button'

interface User {
  id: string
  username: string
  email: string
  level: number
  xp: number
}

function getRank(level: number) {
  if (level >= 80) return { name: 'Kage',     cls: 'rank-kage',     icon: '🔥' }
  if (level >= 40) return { name: 'Jonin',    cls: 'rank-jonin',    icon: '⚡' }
  if (level >= 15) return { name: 'Chunin',   cls: 'rank-chunin',   icon: '💧' }
  return               { name: 'Genin',    cls: 'rank-genin',    icon: '🌿' }
}

const COMING_SOON = [
  { icon: Zap,     label: 'Misiones Diarias', desc: 'Completa retos y gana XP',        color: 'text-accent-orange' },
  { icon: Compass, label: 'Herramientas',     desc: 'Guías y calculadoras del juego',  color: 'text-chakra-blue' },
  { icon: Users,   label: 'Comunidad',        desc: 'Foros y ranking global',          color: 'text-power-red' },
  { icon: Trophy,  label: 'Logros',           desc: 'Insignias y recompensas',         color: 'text-sage-gold' },
]

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (!storedUser) { router.push('/auth/login'); return }
    setUser(JSON.parse(storedUser))
    setLoading(false)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="flex items-center gap-3 text-text-muted">
          <span className="w-5 h-5 border-2 border-accent-orange/30 border-t-accent-orange rounded-full animate-spin" />
          <span className="font-cinzel text-sm tracking-widest">CARGANDO...</span>
        </div>
      </div>
    )
  }

  if (!user) return null

  const xpForNextLevel = Math.pow(user.level, 2) * 100
  const xpProgress = Math.min((user.xp / xpForNextLevel) * 100, 100)
  const rank = getRank(user.level)

  return (
    <main className="min-h-screen bg-bg-primary grid-bg">

      {/* Top bar */}
      <header className="border-b border-border bg-bg-primary/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="text-power-red/70 text-lg font-cinzel group-hover:text-power-red transition-colors leading-none">忍</span>
            <span className="font-cinzel font-black text-sm tracking-[0.2em] text-text-muted group-hover:text-power-red transition-colors">
              HD<span className="text-power-red">RV</span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs text-text-dim font-cinzel">{user.username}</span>
              <span className={`text-xs font-cinzel px-2 py-0.5 rounded-full ${rank.cls}`}>
                {rank.name}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs text-text-dim hover:text-power-red transition-colors font-cinzel"
            >
              <LogOut className="w-3.5 h-3.5" />
              Salir
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* Welcome + rank */}
        <div className="mb-10 animate-fade-up">
          <p className="text-xs font-cinzel text-text-dim tracking-widest mb-1">PANEL DE NINJA</p>
          <h1 className="text-3xl font-cinzel font-black text-text-primary">
            Hola, <span className="text-accent-orange">{user.username}</span>
          </h1>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

          {/* XP Card - spans 2 cols on lg */}
          <div className="lg:col-span-2 game-card game-card-orange p-6 rounded-xl animate-fade-up" style={{ animationDelay: '0.05s' }}>
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-xs font-cinzel text-text-dim tracking-widest mb-1">EXPERIENCIA</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-cinzel font-black text-accent-orange">{user.xp.toLocaleString()}</span>
                  <span className="text-text-dim text-sm">/ {xpForNextLevel.toLocaleString()} XP</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-accent-orange" />
                <span className={`text-sm font-cinzel px-3 py-1 rounded-full ${rank.cls}`}>
                  {rank.icon} {rank.name}
                </span>
              </div>
            </div>

            {/* XP bar */}
            <div className="space-y-2">
              <div className="w-full bg-bg-elevated rounded-full h-2 overflow-hidden">
                <div
                  className="xp-bar-fill h-full rounded-full transition-all duration-700"
                  style={{ width: `${xpProgress}%` }}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-dim">{Math.round(xpProgress)}% hacia el siguiente nivel</span>
                <span className="text-xs text-text-dim">{xpForNextLevel - user.xp} XP restantes</span>
              </div>
            </div>
          </div>

          {/* Level card */}
          <div className="game-card game-card-orange p-6 rounded-xl flex flex-col items-center justify-center animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <p className="text-xs font-cinzel text-text-dim tracking-widest mb-3">NIVEL</p>
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-2 border-accent-orange/30 flex items-center justify-center bg-accent-orange/5">
                <span className="text-4xl font-cinzel font-black text-accent-orange">{user.level}</span>
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-accent-orange rounded-full flex items-center justify-center">
                <Shield className="w-3 h-3 text-black" />
              </div>
            </div>
            <p className="text-xs text-text-muted mt-3 font-cinzel">{rank.name}</p>
          </div>
        </div>

        {/* Daily mission teaser */}
        <div className="game-card p-5 rounded-xl border-dashed border border-accent-orange/20 bg-accent-orange/3 flex items-center justify-between mb-8 animate-fade-up" style={{ animationDelay: '0.15s' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent-orange/10 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-accent-orange" />
            </div>
            <div>
              <p className="text-sm font-cinzel font-bold text-text-primary">Misión diaria disponible</p>
              <p className="text-xs text-text-dim mt-0.5">Inicia sesión cada día para ganar +10 XP</p>
            </div>
          </div>
          <Button variant="ninja" size="sm" disabled>
            Próximamente
          </Button>
        </div>

        {/* Coming soon modules */}
        <div>
          <p className="text-xs font-cinzel text-text-dim tracking-widest mb-4">PRÓXIMAS FUNCIONES</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {COMING_SOON.map(({ icon: Icon, label, desc, color }, i) => (
              <div
                key={label}
                className="game-card p-5 rounded-xl group cursor-not-allowed opacity-60 animate-fade-up"
                style={{ animationDelay: `${0.2 + i * 0.05}s` }}
              >
                <div className="flex items-center justify-between mb-3">
                  <Icon className={`w-5 h-5 ${color}`} />
                  <span className="text-xs text-text-dim font-cinzel">Pronto</span>
                </div>
                <p className="font-cinzel font-bold text-sm text-text-primary mb-1">{label}</p>
                <p className="text-xs text-text-dim leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick links */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link href="/rankings" className="text-xs font-cinzel text-text-dim hover:text-power-red transition-colors tracking-widest">
            → Rankings
          </Link>
          <Link href="/tools" className="text-xs font-cinzel text-text-dim hover:text-power-red transition-colors tracking-widest">
            → Herramientas
          </Link>
          <Link href="/tools/coupons" className="text-xs font-cinzel text-text-dim hover:text-power-red transition-colors tracking-widest">
            → Calculadora de Cupones
          </Link>
        </div>

        {/* Footer note */}
        <div className="mt-6 text-center">
          <p className="text-xs text-text-dim font-cinzel tracking-wider">
            HDRV v1.0 — Naruto Online Community
          </p>
        </div>
      </div>
    </main>
  )
}

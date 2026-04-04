'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogOut, Hexagon, Wrench, Ticket, ChevronRight, ChevronLeft, Lock, Swords, Map, BookOpen } from 'lucide-react'

interface User {
  id: string
  username: string
  email: string
  level: number
  xp: number
}

function getRank(level: number) {
  if (level >= 80) return { name: 'Kage',  cls: 'rank-kage'  }
  if (level >= 40) return { name: 'Jonin', cls: 'rank-jonin' }
  if (level >= 15) return { name: 'Chunin',cls: 'rank-chunin'}
  return               { name: 'Genin', cls: 'rank-genin' }
}

interface Tool {
  id: string
  name: string
  description: string
  href: string | null
  available: boolean
  icon: React.ElementType
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
    icon: Ticket,
    color: 'text-power-red',
    badge: 'Disponible',
  },
  {
    id: 'power',
    name: 'Calculadora de Poder',
    description: 'Simula tu poder de combate según tus ninjas, equipamiento y mejoras.',
    href: null,
    available: false,
    icon: Swords,
    color: 'text-chakra-blue',
  },
  {
    id: 'guide',
    name: 'Guía de Progresión',
    description: 'Rutas optimizadas para crecer rápido según tu etapa en el juego.',
    href: null,
    available: false,
    icon: Map,
    color: 'text-sage-gold',
  },
  {
    id: 'wiki',
    name: 'Wiki de Eventos',
    description: 'Base de datos con todos los eventos del juego, recompensas y estrategias.',
    href: null,
    available: false,
    icon: BookOpen,
    color: 'text-nature-green',
  },
]

export default function ToolsPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
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
          <span className="w-5 h-5 border-2 border-power-red/30 border-t-power-red rounded-full animate-spin" />
          <span className="font-cinzel text-sm tracking-widest">CARGANDO...</span>
        </div>
      </div>
    )
  }

  const rank = user ? getRank(user.level) : null

  return (
    <main className="min-h-screen bg-bg-primary" style={{
      backgroundImage: 'linear-gradient(rgba(196, 30, 58, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(196, 30, 58, 0.03) 1px, transparent 1px)',
      backgroundSize: '40px 40px',
    }}>

      {/* Ambient */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 right-1/3 w-96 h-96 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, rgba(196,30,58,0.15) 0%, transparent 70%)' }} />
      </div>

      {/* Header */}
      <header className="border-b border-border bg-bg-primary/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <Hexagon className="w-6 h-6 text-power-red fill-power-red/15 group-hover:fill-power-red/30 transition-all" />
            <span className="font-cinzel font-black text-sm tracking-[0.2em] text-text-muted group-hover:text-power-red transition-colors">
              HDRV <span className="text-power-red">HUB</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/dashboard" className="text-xs font-cinzel text-text-dim hover:text-text-primary transition-colors">Dashboard</Link>
            <Link href="/rankings" className="text-xs font-cinzel text-text-dim hover:text-text-primary transition-colors">Rankings</Link>
            <Link href="/tools" className="text-xs font-cinzel text-power-red border-b border-power-red/40 pb-px">Herramientas</Link>
          </nav>

          <div className="flex items-center gap-4">
            {user && rank ? (
              <>
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
              </>
            ) : (
              <Link
                href="/auth/login"
                className="text-xs font-cinzel text-text-dim hover:text-power-red transition-colors"
              >
                Iniciar sesión
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-10">

        {/* Back */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-text-dim hover:text-power-red transition-colors font-cinzel mb-6"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Volver al dashboard
        </Link>

        {/* Hero */}
        <div className="mb-10 animate-fade-up">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-power-red/10 rounded-xl flex items-center justify-center border border-power-red/20">
              <Wrench className="w-5 h-5 text-power-red" />
            </div>
            <div>
              <p className="text-xs font-cinzel text-text-dim tracking-widest">NARUTO ONLINE</p>
              <h1 className="text-2xl font-cinzel font-black text-text-primary">
                Herramientas <span className="text-power-red" style={{ textShadow: '0 0 20px rgba(196,30,58,0.5)' }}>Ninja</span>
              </h1>
            </div>
          </div>
          <p className="text-sm text-text-muted ml-[52px]">
            Calculadoras, guías y utilidades para optimizar tu progreso en el juego.
          </p>
        </div>

        {/* Tools grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-5">
          {TOOLS.map((tool, i) => {
            const Icon = tool.icon
            const Card = (
              <div
                className={`
                  game-card p-6 rounded-xl flex flex-col gap-4 animate-fade-up
                  ${tool.available
                    ? 'game-card-red cursor-pointer hover:border-power-red/40 group'
                    : 'opacity-50 cursor-not-allowed'
                  }
                `}
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                <div className="flex items-start justify-between">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${
                    tool.available ? 'bg-power-red/10 border-power-red/20' : 'bg-bg-elevated border-border'
                  }`}>
                    <Icon className={`w-5 h-5 ${tool.available ? 'text-power-red' : tool.color}`} />
                  </div>
                  {tool.available ? (
                    <span className="text-xs font-cinzel px-2.5 py-1 rounded-full bg-power-red/15 text-power-red border border-power-red/25">
                      {tool.badge}
                    </span>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs font-cinzel text-text-dim">
                      <Lock className="w-3 h-3" />
                      Próximamente
                    </div>
                  )}
                </div>

                <div>
                  <h3 className={`font-cinzel font-bold text-base mb-1.5 ${
                    tool.available ? 'text-text-primary group-hover:text-power-red transition-colors' : 'text-text-muted'
                  }`}>
                    {tool.name}
                  </h3>
                  <p className="text-xs text-text-dim leading-relaxed">{tool.description}</p>
                </div>

                {tool.available && (
                  <div className="flex items-center gap-1 text-xs font-cinzel text-power-red group-hover:gap-2 transition-all mt-auto">
                    Abrir herramienta
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            )

            return tool.available && tool.href ? (
              <Link key={tool.id} href={tool.href}>
                {Card}
              </Link>
            ) : (
              <div key={tool.id}>
                {Card}
              </div>
            )
          })}
        </div>

        <div className="mt-10 text-center">
          <p className="text-xs text-text-dim font-cinzel tracking-wider">
            Más herramientas en desarrollo · Comunidad HDRV
          </p>
        </div>
      </div>
    </main>
  )
}

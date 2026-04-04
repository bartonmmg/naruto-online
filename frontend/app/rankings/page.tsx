'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  LogOut,
  Trophy,
  Search,
  Swords,
  Crown,
  Shield,
  ChevronLeft,
  LayoutGrid,
  List,
  X,
} from 'lucide-react'
import rankingData from '@/lib/rankings/power-ranking/power-ranking-4-2026.json'

interface User {
  id: string
  username: string
  email: string
  level: number
  xp: number
}

interface Player {
  rank: number
  name: string
  power: number
  level: number
  server: string
}

const PLAYERS_DATA: Player[] = [...rankingData.players]
  .sort((a, b) => b.power - a.power)
  .map((p, idx) => ({
    rank: idx + 1,
    name: p.name,
    power: p.power,
    level: p.level,
    server: p.server,
  }))

const SERVERS = ['Todos', ...Array.from(new Set(rankingData.players.map((p) => p.server))).sort()]

const MEDAL: Record<
  number,
  { emoji: string; image?: string; color: string; bg: string; border: string }
> = {
  1: {
    emoji: '🥇',
    image: '/images/power-ranking/top1.png',
    color: 'text-sage-gold',
    bg: 'bg-sage-gold/10',
    border: 'border-sage-gold/30',
  },
  2: {
    emoji: '🥈',
    image: '/images/power-ranking/top2.png',
    color: 'text-[#C0C0C0]',
    bg: 'bg-[#C0C0C0]/10',
    border: 'border-[#C0C0C0]/30',
  },
  3: {
    emoji: '🥉',
    image: '/images/power-ranking/top3.png',
    color: 'text-[#CD7F32]',
    bg: 'bg-[#CD7F32]/10',
    border: 'border-[#CD7F32]/30',
  },
}

const TITLE_IMAGES: Record<number, string> = {
  1: '/images/power-ranking/top1-titulo.png',
  2: '/images/power-ranking/top2-titulo.png',
}

function getRank(level: number) {
  if (level >= 80) return { name: 'Kage', cls: 'rank-kage' }
  if (level >= 40) return { name: 'Jonin', cls: 'rank-jonin' }
  if (level >= 15) return { name: 'Chunin', cls: 'rank-chunin' }
  return { name: 'Genin', cls: 'rank-genin' }
}

function getRankingTitle(playerRank: number) {
  if (playerRank === 1) return 'Forzudo de espacio tiempo'
  if (playerRank === 2 || playerRank === 3) return 'Tirano de espacio tiempo'
  if (playerRank >= 4 && playerRank <= 10) return 'Dios Viviente'
  if (playerRank >= 11 && playerRank <= 50) return 'Ninja Legendario'
  if (playerRank >= 51 && playerRank <= 100) return 'Maestro Supremo'
  return 'Ninja de Elite'
}

export default function RankingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [server, setServer] = useState('Todos')
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')
  const [tooltip, setTooltip] = useState<number | null>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (!storedUser) {
      router.push('/auth/login')
      return
    }
    setUser(JSON.parse(storedUser))
    setLoading(false)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/')
  }

  const filtered = useMemo(() => {
    return PLAYERS_DATA.filter((p) => {
      const matchServer = server === 'Todos' || p.server === server
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
      return matchServer && matchSearch
    })
  }, [search, server])

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

  if (!user) return null

  const userRank = getRank(user.level)

  return (
    <main className="min-h-screen bg-[#080810] relative overflow-x-hidden">
      {/* ═══════════════════════════════════════════════════
          BACKGROUND SCENERY — Naruto Shippuden Battlefield
          ═══════════════════════════════════════════════════ */}

      {/* Dark sky gradient */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, #05050f 0%, #0a0a1a 30%, #0f0f20 60%, #1a0a0a 100%)',
        }}
      />

      {/* Subtle moon glow top-center */}
      <div
        className="fixed top-[-5%] left-1/2 -translate-x-1/2 w-[600px] h-[400px] pointer-events-none rounded-full opacity-20"
        style={{
          background:
            'radial-gradient(ellipse, rgba(200,210,240,0.3) 0%, rgba(200,210,240,0.05) 40%, transparent 70%)',
        }}
      />

      {/* Ground mist at the bottom */}
      <div
        className="fixed bottom-0 left-0 w-full h-40 pointer-events-none"
        style={{
          background:
            'linear-gradient(0deg, rgba(15,10,20,0.95) 0%, rgba(15,10,20,0.4) 50%, transparent 100%)',
          zIndex: 3,
        }}
      />

      {/* ── Hashirama — Left Background ──────────────────── */}
      <div
        className="hidden lg:block fixed bottom-0 left-0 w-[1000px] h-full pointer-events-none"
        style={{
          zIndex: 1,
          backgroundImage: 'url(/images/power-ranking/hashiizq.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'left bottom',
          opacity: 0.75,
          maskImage:
            'linear-gradient(to top, transparent 2%, black 15%, black 85%, transparent 100%), linear-gradient(to right, black 0%, black 50%, transparent 100%)',
          WebkitMaskImage:
            'linear-gradient(to top, transparent 2%, black 15%, black 85%, transparent 100%), linear-gradient(to right, black 0%, black 50%, transparent 100%)',
          maskComposite: 'intersect',
          WebkitMaskComposite: 'source-in',
        }}
      />

      {/* ── Madara — Right Background ───────────────────── */}
      <div
        className="hidden lg:block fixed bottom-0 right-0 w-[1000px] h-full pointer-events-none"
        style={{
          zIndex: 1,
          backgroundImage: 'url(/images/power-ranking/madaraderecha.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right bottom',
          opacity: 0.75,
          maskImage:
            'linear-gradient(to top, transparent 2%, black 15%, black 85%, transparent 100%), linear-gradient(to left, black 0%, black 50%, transparent 100%)',
          WebkitMaskImage:
            'linear-gradient(to top, transparent 2%, black 15%, black 85%, transparent 100%), linear-gradient(to left, black 0%, black 50%, transparent 100%)',
          maskComposite: 'intersect',
          WebkitMaskComposite: 'source-in',
        }}
      />

      {/* ── Elegant Chakra Effects ──────────────────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 2 }}>
        {/* Green Chakra Drifts — Hashirama side */}
        {[
          { left: '8%', bottom: '15%', size: 6, dur: 8, delay: 0, driftX: '40px' },
          { left: '12%', bottom: '25%', size: 5, dur: 7, delay: 0.8, driftX: '-30px' },
          { left: '5%', bottom: '35%', size: 7, dur: 9, delay: 1.5, driftX: '20px' },
          { left: '15%', bottom: '10%', size: 4, dur: 6.5, delay: 2.2, driftX: '-50px' },
          { left: '3%', bottom: '55%', size: 5.5, dur: 8.5, delay: 0.3, driftX: '35px' },
        ].map((p, i) => (
          <div
            key={`green-${i}`}
            className="absolute rounded-full"
            style={{
              left: p.left,
              bottom: p.bottom,
              width: p.size,
              height: p.size,
              backgroundColor: 'rgba(0,220,110,0.6)',
              boxShadow: '0 0 20px rgba(0,220,110,0.7), 0 0 40px rgba(0,200,90,0.3)',
              animation: `chakra-drift ${p.dur}s cubic-bezier(0.4, 0.0, 0.6, 1) infinite`,
              animationDelay: `${p.delay}s`,
              filter: 'blur(0.5px)',
              '--drift-x': p.driftX,
            } as React.CSSProperties & { [key: string]: any }}
          />
        ))}

        {/* Red/Orange Chakra Drifts — Madara side */}
        {[
          { right: '8%', bottom: '20%', size: 6, dur: 8.5, delay: 0.2, driftX: '-40px' },
          { right: '12%', bottom: '32%', size: 5, dur: 7.5, delay: 1, driftX: '30px' },
          { right: '5%', bottom: '42%', size: 7, dur: 9.5, delay: 1.8, driftX: '-20px' },
          { right: '15%', bottom: '12%', size: 4, dur: 6.8, delay: 2.5, driftX: '50px' },
          { right: '4%', bottom: '60%', size: 5.5, dur: 8.2, delay: 0.5, driftX: '-35px' },
        ].map((p, i) => (
          <div
            key={`red-${i}`}
            className="absolute rounded-full"
            style={{
              right: p.right,
              bottom: p.bottom,
              width: p.size,
              height: p.size,
              backgroundColor: 'rgba(240,70,40,0.6)',
              boxShadow: '0 0 20px rgba(240,70,40,0.7), 0 0 40px rgba(220,40,20,0.3)',
              animation: `chakra-drift ${p.dur}s cubic-bezier(0.4, 0.0, 0.6, 1) infinite`,
              animationDelay: `${p.delay}s`,
              filter: 'blur(0.5px)',
              '--drift-x': p.driftX,
            } as React.CSSProperties & { [key: string]: any }}
          />
        ))}

        {/* Accent Orbs with Glow (occasional sparkles) */}
        {[
          { left: '10%', bottom: '28%', size: 2.5, dur: 4, delay: 0 },
          { left: '7%', bottom: '45%', size: 2, dur: 3.5, delay: 1.2 },
          { right: '10%', bottom: '35%', size: 2.5, dur: 4.2, delay: 0.5 },
          { right: '8%', bottom: '50%', size: 2, dur: 3.8, delay: 1.8 },
        ].map((p, i) => (
          <div
            key={`accent-${i}`}
            className="absolute rounded-full"
            style={{
              [p.left ? 'left' : 'right']: p.left || p.right,
              bottom: p.bottom,
              width: p.size,
              height: p.size,
              backgroundColor: p.left ? 'rgba(100,255,150,0.8)' : 'rgba(255,120,60,0.8)',
              boxShadow: p.left
                ? '0 0 15px rgba(100,255,150,0.9), 0 0 30px rgba(0,220,110,0.4)'
                : '0 0 15px rgba(255,120,60,0.9), 0 0 30px rgba(240,70,40,0.4)',
              animation: `orb-pulse ${p.dur}s ease-in-out infinite`,
              animationDelay: `${p.delay}s`,
              filter: 'blur(0.3px)',
            }}
          />
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════
          HEADER
          ═══════════════════════════════════════════════════ */}
      <header
        className="relative border-b border-white/5 bg-[#080810]/80 backdrop-blur-xl sticky top-0"
        style={{ zIndex: 50 }}
      >
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <span className="text-power-red/80 text-lg font-cinzel select-none group-hover:text-power-red transition-all duration-300 leading-none">
              忍
            </span>
            <div className="flex items-baseline gap-0.5">
              <span className="font-cinzel font-black text-xs tracking-[0.1em] text-text-primary group-hover:text-power-red transition-all duration-300">
                H
              </span>
              <span className="font-cinzel font-black text-xs tracking-[0.1em] text-text-primary group-hover:text-power-red transition-all duration-300">
                D
              </span>
              <span
                className="font-cinzel font-black text-xs tracking-[0.1em] text-power-red transition-all duration-300"
                style={{ textShadow: '0 0 8px rgba(196,30,58,0.4)' }}
              >
                R
              </span>
              <span
                className="font-cinzel font-black text-xs tracking-[0.1em] text-power-red transition-all duration-300"
                style={{ textShadow: '0 0 8px rgba(196,30,58,0.4)' }}
              >
                V
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/dashboard"
              className="text-xs font-cinzel text-[#888] hover:text-white transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/rankings"
              className="text-xs font-cinzel text-power-red border-b border-power-red/40 pb-px"
            >
              Rankings
            </Link>
            <Link
              href="/tools"
              className="text-xs font-cinzel text-[#888] hover:text-white transition-colors"
            >
              Herramientas
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs text-[#999] font-cinzel">{user.username}</span>
              <span className={`text-xs font-cinzel px-2 py-0.5 rounded-full ${userRank.cls}`}>
                {userRank.name}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs text-[#666] hover:text-power-red transition-colors font-cinzel"
            >
              <LogOut className="w-3.5 h-3.5" />
              Salir
            </button>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════
          MAIN CONTENT — Centered Ranking
          ═══════════════════════════════════════════════════ */}
      <div className="relative max-w-4xl mx-auto px-6 py-8" style={{ zIndex: 10 }}>
        {/* Back link */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-[#888] hover:text-power-red transition-colors font-cinzel mb-8"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Volver al dashboard
        </Link>

        {/* ── Title Block ──────────────────────────────── */}
        <div className="text-center mb-10 animate-fade-up">
          <p className="text-xs font-cinzel font-bold text-power-red/70 tracking-[0.3em] uppercase mb-2">
            {rankingData.meta.region} · Cluster {rankingData.meta.cluster} · Poder de Combate
          </p>
          <h1 className="text-4xl md:text-5xl font-cinzel font-black text-white leading-tight mb-3">
            Ranking de{' '}
            <span
              className="text-transparent bg-clip-text"
              style={{
                backgroundImage: 'linear-gradient(135deg, #CC0000 0%, #FF4444 50%, #CC0000 100%)',
                backgroundSize: '200% 200%',
                animation: 'gradient-x 3s ease infinite',
                filter: 'drop-shadow(0 0 20px rgba(196,30,58,0.4))',
              }}
            >
              Poder
            </span>
          </h1>
          {/* Decorative line */}
          <div
            className="mx-auto w-48 h-px mb-4"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(196,30,58,0.6), transparent)',
            }}
          />
          <p className="text-sm text-white/80 max-w-md mx-auto leading-relaxed">
            Los ninjas más poderosos de {rankingData.meta.region} (Cluster{' '}
            {rankingData.meta.cluster}) .
          </p>
          <div className="flex justify-center mt-4">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10 text-xs font-cinzel text-white/80">
              <Crown className="w-3.5 h-3.5 text-power-red/60" />
              <span>{rankingData.players.length} Jugadores</span>
            </div>
          </div>
        </div>

        {/* ── Filters ──────────────────────────────────── */}
        <div
          className="bg-[#0e0e1a]/80 backdrop-blur-md border border-white/8 rounded-xl p-4 mb-6 animate-fade-up"
          style={{ animationDelay: '0.05s' }}
        >
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            {/* Search */}
            <div className="flex-1 w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555] pointer-events-none" />
                <input
                  type="text"
                  placeholder="Buscar ninja..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white/5 border border-white/8 rounded-lg pl-9 pr-8 py-2.5 text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-power-red/50 transition-all"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555] hover:text-power-red transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            {/* Server filter */}
            <div className="sm:w-44">
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555] pointer-events-none" />
                <select
                  value={server}
                  onChange={(e) => setServer(e.target.value)}
                  className="w-full bg-white/5 border border-white/8 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-power-red/50 transition-all appearance-none cursor-pointer"
                >
                  {SERVERS.map((s) => (
                    <option key={s} value={s} className="bg-[#0e0e1a]">
                      {s === 'Todos' ? 'Todos los servidores' : `Servidor ${s}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {/* View toggle */}
            <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1 border border-white/8">
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded transition-all ${viewMode === 'table' ? 'bg-power-red/20 text-power-red' : 'text-[#555] hover:text-white'}`}
                title="Vista tabla"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-2 rounded transition-all ${viewMode === 'cards' ? 'bg-power-red/20 text-power-red' : 'text-[#555] hover:text-white'}`}
                title="Vista cards"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
          {(search || server !== 'Todos') && (
            <div className="mt-3 flex items-center gap-2">
              <span
                className={`text-xs font-cinzel ${filtered.length > 0 ? 'text-power-red' : 'text-[#555]'}`}
              >
                {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
              </span>
              <button
                onClick={() => {
                  setSearch('')
                  setServer('Todos')
                }}
                className="text-xs text-power-red/60 hover:text-power-red font-cinzel transition-colors flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Limpiar
              </button>
            </div>
          )}
        </div>

        {/* ── Rankings ─────────────────────────────────── */}
        <div className="animate-fade-up" style={{ animationDelay: '0.1s' }}>
          {viewMode === 'table' ? (
            /* ──── TABLE VIEW ──── */
            <div className="bg-[#0e0e1a]/80 backdrop-blur-md border border-white/8 rounded-2xl overflow-hidden">
              {/* Header */}
              <div className="grid grid-cols-12 gap-2 px-6 py-3 border-b border-white/8 bg-white/[0.02]">
                <div className="col-span-1 text-[10px] font-cinzel text-white/60 tracking-[0.15em] uppercase font-bold">
                  #
                </div>
                <div className="col-span-5 text-[10px] font-cinzel text-white/60 tracking-[0.15em] uppercase font-bold">
                  Ninja
                </div>
                <div className="col-span-1 text-[10px] font-cinzel text-white/60 tracking-[0.15em] uppercase font-bold hidden sm:block">
                  Nivel
                </div>
                <div className="col-span-4 text-[10px] font-cinzel text-white/60 tracking-[0.15em] uppercase font-bold hidden sm:flex items-center justify-end gap-1.5">
                  <Swords className="w-3 h-3 text-power-red/40" />
                  Poder
                </div>
                <div className="col-span-1 text-[10px] font-cinzel text-white/60 tracking-[0.15em] uppercase font-bold text-right">
                  Server
                </div>
              </div>

              {/* Rows */}
              {filtered.length === 0 ? (
                <div className="py-20 text-center">
                  <Swords className="w-10 h-10 text-[#333] mx-auto mb-4" />
                  <p className="text-sm font-cinzel text-[#555] font-semibold">
                    No se encontraron ninjas
                  </p>
                  <p className="text-xs text-[#444] mt-2">Prueba con otros filtros</p>
                </div>
              ) : (
                filtered.map((player, index) => {
                  const medal = MEDAL[player.rank]
                  const isTop3 = player.rank <= 3
                  const pRank = getRank(player.level)

                  return (
                    <div
                      key={player.rank}
                      className={`
                        relative grid grid-cols-12 gap-2 px-6 py-3.5 items-center border-b border-white/[0.04] last:border-b-0
                        transition-all duration-200 group
                        ${isTop3 ? 'bg-white/[0.03]' : 'hover:bg-white/[0.03]'}
                      `}
                      style={{
                        ...(isTop3
                          ? {
                              borderLeft: `3px solid ${player.rank === 1 ? '#FFD700' : player.rank === 2 ? '#C0C0C0' : '#CD7F32'}`,
                            }
                          : {}),
                      }}
                      onMouseEnter={() => setTooltip(player.rank)}
                      onMouseLeave={() => setTooltip(null)}
                    >
                      {/* Tooltip */}
                      {tooltip === player.rank && (
                        <div
                          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[#12121e] border border-white/10 rounded-lg p-3 shadow-2xl whitespace-nowrap text-xs font-cinzel"
                          style={{ zIndex: 60 }}
                        >
                          <div className="flex flex-col gap-1 text-[#999]">
                            <div>
                              <span className="text-power-red">Rango:</span> {pRank.name}
                            </div>
                            <div>
                              <span className="text-power-red">Poder:</span>{' '}
                              {player.power.toLocaleString()}
                            </div>
                            <div>
                              <span className="text-power-red">Posicion:</span> #{player.rank}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Rank # */}
                      <div className="col-span-1 flex items-center justify-center">
                        {isTop3 && medal ? (
                          medal.image ? (
                            <div className="relative w-8 h-7">
                              <Image
                                src={medal.image}
                                alt={`Top ${player.rank}`}
                                fill
                                className="object-contain"
                              />
                            </div>
                          ) : (
                            <span className="text-xl">{medal.emoji}</span>
                          )
                        ) : (
                          <span className="text-xs font-cinzel font-bold text-[#555] w-7 inline-block text-center group-hover:text-[#888] transition-colors">
                            {String(player.rank).padStart(2, '0')}
                          </span>
                        )}
                      </div>

                      {/* Name */}
                      <div className="col-span-5 flex items-center gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-cinzel font-black flex-shrink-0 transition-all group-hover:scale-110 ${
                            isTop3 && medal
                              ? `${medal.bg} ${medal.color} border ${medal.border}`
                              : 'bg-white/5 text-white border border-white/10 group-hover:border-power-red/30'
                          }`}
                        >
                          {player.name[0]}
                        </div>
                        <span
                          className={`text-sm font-cinzel font-bold truncate transition-colors ${
                            isTop3 && medal
                              ? medal.color
                              : 'text-white/90 group-hover:text-power-red'
                          }`}
                        >
                          {player.name}
                        </span>
                      </div>

                      {/* Level */}
                      <div className="col-span-1 hidden sm:block">
                        <span className="text-xs font-cinzel font-bold text-white/60 group-hover:text-power-red/80 transition-colors">
                          {player.level}
                        </span>
                      </div>

                      {/* Power */}
                      <div className="col-span-4 hidden sm:flex items-center justify-end gap-2">
                        <Swords
                          className={`w-3.5 h-3.5 flex-shrink-0 transition-colors ${
                            isTop3 && medal
                              ? medal.color
                              : 'text-power-red/50 group-hover:text-power-red'
                          }`}
                        />
                        <span
                          className={`text-sm font-cinzel font-bold tabular-nums transition-colors text-right ${
                            isTop3 && medal
                              ? medal.color
                              : 'text-white/80 group-hover:text-power-red'
                          }`}
                        >
                          {(player.power / 1000000).toFixed(2)}M
                        </span>
                      </div>

                      {/* Server */}
                      <div className="col-span-1 text-right">
                        <span
                          className={`text-[10px] font-cinzel px-2 py-0.5 rounded border inline-block ${
                            player.server === 'S??'
                              ? 'text-white/40 bg-white/[0.02] border-white/5'
                              : 'text-white bg-white/[0.03] border-white/8 group-hover:border-power-red/20'
                          }`}
                        >
                          {player.server}
                        </span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          ) : (
            /* ──── CARDS VIEW ──── */
            <div>
              {filtered.length === 0 ? (
                <div className="py-20 text-center bg-[#0e0e1a]/80 backdrop-blur-md border border-white/8 rounded-2xl">
                  <Swords className="w-10 h-10 text-[#333] mx-auto mb-4" />
                  <p className="text-sm font-cinzel text-[#555] font-semibold">
                    No se encontraron ninjas
                  </p>
                  <p className="text-xs text-[#444] mt-2">Prueba con otros filtros</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {filtered.map((player) => {
                    const medal = MEDAL[player.rank]
                    const isTop3 = player.rank <= 3
                    const playerRank = getRank(player.level)
                    const titleImg = TITLE_IMAGES[player.rank]

                    return (
                      <div
                        key={player.rank}
                        className={`
                          bg-[#0e0e1a]/80 backdrop-blur-md rounded-xl p-4 flex flex-col items-center
                          transition-all duration-200 hover:scale-[1.03] cursor-default
                          ${
                            isTop3 && medal
                              ? `border-2 ${medal.border} ${medal.bg}`
                              : 'border border-white/8 hover:border-power-red/20'
                          }
                        `}
                      >
                        {/* Title image for top 1 & 2 */}
                        {/*   {titleImg && (
                          <div className="relative w-full h-10 mb-2">
                            <Image src={titleImg} alt={`Top ${player.rank} titulo`} fill className="object-contain" />
                          </div>
                        )} */}

                        {/* Medal for top 3 / Rank number for others */}
                        {isTop3 && medal ? (
                          medal.image ? (
                            <div className="relative w-16 h-12 mb-2">
                              <Image
                                src={medal.image}
                                alt={`Top ${player.rank}`}
                                fill
                                className="object-contain"
                              />
                            </div>
                          ) : (
                            <span className="text-3xl mb-2">{medal.emoji}</span>
                          )
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-2">
                            <span className="text-[10px] font-cinzel font-bold text-[#777]">
                              #{player.rank}
                            </span>
                          </div>
                        )}

                        {/* Name */}
                        <p
                          className={`font-cinzel font-black text-sm text-center mb-1 line-clamp-2 ${
                            isTop3 && medal ? medal.color : 'text-white/90'
                          }`}
                        >
                          {player.name}
                        </p>

                        {/* Ranking Title Badge — Personalized by rank */}
                        {(() => {
                          const title = getRankingTitle(player.rank)
                          let badgeColor =
                            'text-nature-green bg-nature-green/10 border-nature-green/20'
                          if (player.rank === 1)
                            badgeColor = 'text-sage-gold bg-sage-gold/10 border-sage-gold/20'
                          else if (player.rank === 2)
                            badgeColor = 'text-[#C0C0C0] bg-[#C0C0C0]/10 border-[#C0C0C0]/20'
                          else if (player.rank === 3)
                            badgeColor = 'text-[#CD7F32] bg-[#CD7F32]/10 border-[#CD7F32]/20'
                          else if (player.rank <= 10)
                            badgeColor =
                              'text-accent-orange bg-accent-orange/10 border-accent-orange/20'
                          else if (player.rank <= 50)
                            badgeColor = 'text-chakra-blue bg-chakra-blue/10 border-chakra-blue/20'
                          return (
                            <span
                              className={`px-2 py-1 rounded text-[9px] font-cinzel font-bold ${badgeColor} border mb-2 text-center line-clamp-2 w-full`}
                            >
                              {title}
                            </span>
                          )
                        })()}

                        {/* Power */}
                        <div className="flex items-center gap-1 font-cinzel font-black text-sm text-white">
                          <Swords className="w-3 h-3 text-power-red" />
                          {(player.power / 1000000).toFixed(2)}M
                        </div>

                        {/* Server + Level */}
                        <div className="flex items-center gap-2 mt-2 text-[10px] text-white/70 font-cinzel">
                          <span>Lv{player.level}</span>
                          <span className="text-white/30">·</span>
                          <span>{player.server}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Footer ───────────────────────────────────── */}
        <div className="mt-12 text-center border-t border-white/5 pt-8">
          <p className="text-xs text-[#555] font-cinzel tracking-wider mb-1">
            Ranking de Poder {rankingData.meta.region} · {rankingData.players.length} jugadores
          </p>
          <p className="text-xs text-[#444] font-cinzel">
            Actualizado{' '}
            {new Date(rankingData.meta.date).toLocaleDateString('es-MX', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>
    </main>
  )
}

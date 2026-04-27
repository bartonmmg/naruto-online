'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import Link from 'next/link'
import {
  Search,
  Swords,
  Shield,
  Crown,
  LayoutGrid,
  List,
  X,
  BarChart2,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
} from 'lucide-react'
import { fetchRankingAPI } from '@/lib/api'
import Navbar from '@/components/Navbar'
import MedalImage from '@/components/MedalImage'
import LoadingSpinner from '@/components/LoadingSpinner'

interface Player {
  rank: number
  name: string
  power: number
  level: number
  server: string | null
  firstAttack?: number | null
  criticalHit?: number | null
  criticalDamage?: number | null
}

interface Region {
  id: string
  name: string
}

interface Cluster {
  id: number
  name: string
}


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
  if (playerRank === 1) return { name: 'Forzudo de espacio tiempo', cls: 'bg-sage-gold/20 text-sage-gold', icon: '🥇' }
  if (playerRank === 2 || playerRank === 3) return { name: 'Tirano de espacio tiempo', cls: 'bg-[#C0C0C0]/20 text-[#C0C0C0]', icon: '🥈' }
  if (playerRank >= 4 && playerRank <= 10) return { name: 'Dios Viviente', cls: 'bg-power-red/20 text-power-red', icon: '🔥' }
  if (playerRank >= 11 && playerRank <= 50) return { name: 'Ninja Legendario', cls: 'bg-chakra-blue/20 text-chakra-blue', icon: '⭐' }
  if (playerRank >= 51 && playerRank <= 100) return { name: 'Maestro Supremo', cls: 'bg-text-dim/20 text-text-dim', icon: '👑' }
  return { name: 'Ninja de Elite', cls: 'bg-accent-orange/20 text-accent-orange', icon: '🌟' }
}

export default function RankingsPage() {
  const [regions, setRegions] = useState<Region[]>([])
  const [clusters, setClusters] = useState<Cluster[]>([])
  const [dates, setDates] = useState<string[]>([])
  const [servers, setServers] = useState<string[]>(['Todos'])
  const [serverSearch, setServerSearch] = useState('')
  const [showServerDropdown, setShowServerDropdown] = useState(false)

  const [region, setRegion] = useState('GLOBAL')
  const [cluster, setCluster] = useState(1)
  const [date, setDate] = useState('2026-04')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [server, setServer] = useState('Todos')
  const [displayMode, setDisplayMode] = useState<'table' | 'cards'>('table')
  const [sortBy, setSortBy] = useState<'rank' | 'power' | 'firstAttack' | 'criticalHit' | 'criticalDamage'>('rank')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  const [players, setPlayers] = useState<Player[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const prevRegionRef = useRef<string>('')
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const serverDropdownRef = useRef<HTMLDivElement>(null)

  // Cargar regiones al montar el componente
  useEffect(() => {
    const loadRegions = async () => {
      try {
        const data = await fetchRankingAPI('/api/rankings/regions')
        setRegions(data)
        // Asegurar que region tiene un valor válido
        if (data.length > 0 && !region) {
          const defaultRegion = data.find((r: Region) => r.id === 'ES') || data[0]
          setRegion(defaultRegion.id)
        }
      } catch (err) {
        setError(`Error fetching regions: ${err}`)
      }
    }
    loadRegions()
  }, [])

  // Cargar clusters cuando cambie la región
  useEffect(() => {
    if (!region || region === 'GLOBAL') {
      setClusters([])
      return
    }

    const loadClusters = async () => {
      try {
        const data = await fetchRankingAPI(`/api/rankings/clusters/${region}`)
        setClusters(data)
        if (data.length > 0 && data[0].id !== cluster) {
          setCluster(data[0].id)
        }
        setError('')
      } catch (err) {
        setError(`Error fetching clusters: ${err}`)
      }
    }
    loadClusters()
  }, [region])

  // Cargar fechas disponibles cuando cambie región/cluster
  useEffect(() => {
    if (!region || !cluster) {
      setDates([])
      return
    }

    const loadDates = async () => {
      try {
        const data = await fetchRankingAPI(`/api/rankings/dates/${region}/${cluster}`)
        setDates(data)
        if (data.length > 0 && data[0] !== date) {
          setDate(data[0])
        }
      } catch (err) {
        setError(`Error fetching dates: ${err}`)
      }
    }
    loadDates()
  }, [region, cluster, date])

  // Cargar ranking cuando cambie región/cluster/fecha
  useEffect(() => {
    const loadRanking = async () => {
      setLoading(true)
      setError('')
      try {
        let endpoint: string

        if (region === 'GLOBAL') {
          // Global - consolidar todas las regiones
          endpoint = `/api/rankings/consolidated-global?date=${date}`
        } else {
          // Regional - filtro específico
          if (!region || !cluster || !date) return
          endpoint = `/api/rankings/top100?region=${region}&cluster=${cluster}&date=${date}`
        }

        const data = await fetchRankingAPI(endpoint)
        setPlayers(data.players || [])

        // Extraer servidores únicos y ordenar por número
        const uniqueServers = new Set<string>()
        data.players?.forEach((p: Player) => {
          if (p.server) uniqueServers.add(p.server)
        })
        const sortedServers = Array.from(uniqueServers).sort((a, b) => {
          const numA = parseInt(a.replace(/\D/g, '')) || 0
          const numB = parseInt(b.replace(/\D/g, '')) || 0
          return numA - numB
        })
        setServers(['Todos', ...sortedServers])
        setServer('Todos')
        setServerSearch('')
      } catch (err) {
        setError(`Error fetching ranking: ${err}`)
        setPlayers([])
      } finally {
        setLoading(false)
      }
    }

    if (region === 'GLOBAL' && date) {
      loadRanking()
    } else if (region !== 'GLOBAL' && region && cluster && date) {
      loadRanking()
    }
  }, [region, cluster, date])

  // Debounce búsqueda para mejor rendimiento
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 200)

    return () => clearTimeout(timer)
  }, [search])

  // Cerrar dropdown de servidores al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (serverDropdownRef.current && !serverDropdownRef.current.contains(event.target as Node)) {
        setShowServerDropdown(false)
      }
    }

    if (showServerDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showServerDropdown])

  // Memoizar handlers para evitar re-renders
  const handleRegionChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRegion = e.target.value
    setRegion(newRegion)
    setCluster(1) // Reset cluster cuando cambia región
    setClusters([]) // Limpiar clusters previos
    setDates([]) // Limpiar dates previos
  }, [])

  const handleClusterChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setCluster(parseInt(e.target.value))
  }, [])

  const handleDateChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setDate(e.target.value)
  }, [])

  const handleServerChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setServer(e.target.value)
  }, [])

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
  }, [])

  const handleSearchClear = useCallback(() => {
    setSearch('')
  }, [])

  const handleFiltersClear = useCallback(() => {
    setSearch('')
    setServer('Todos')
  }, [])

  const handleDisplayModeChange = useCallback((mode: 'table' | 'cards') => {
    setDisplayMode(mode)
  }, [])

  const filteredServers = useMemo(() => {
    if (!serverSearch) return servers
    return servers.filter((s) => {
      if (s === 'Todos') return true
      return s.toLowerCase().includes(serverSearch.toLowerCase())
    })
  }, [serverSearch, servers])

  const filtered = useMemo(() => {
    const filteredPlayers = players.filter((p) => {
      const matchServer = server === 'Todos' || p.server === server
      const matchSearch = p.name.toLowerCase().includes(debouncedSearch.toLowerCase())
      return matchServer && matchSearch
    })

    // Si está ordenando por rank, mantener el orden original (ya viene ordenado por poder)
    if (sortBy === 'rank') {
      return sortOrder === 'asc'
        ? filteredPlayers
        : [...filteredPlayers].reverse()
    }

    // Para otras columnas: jugadores con valor primero (ordenados por la columna),
    // luego los null al final (ordenados por poder desc)
    return [...filteredPlayers].sort((a, b) => {
      const aVal = a[sortBy] as number | null | undefined
      const bVal = b[sortBy] as number | null | undefined
      const aNull = aVal == null
      const bNull = bVal == null

      // Null siempre al final, ordenados por poder desc
      if (aNull && bNull) return b.power - a.power
      if (aNull) return 1
      if (bNull) return -1

      // Ambos tienen valor: ordenar según sortOrder
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal
    })
  }, [debouncedSearch, server, players, sortBy, sortOrder])

  const handleSort = useCallback((column: typeof sortBy) => {
    if (sortBy === column) {
      // Si ya está ordenando por esta columna, cambiar dirección
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      // Nueva columna: empezar en desc (mayor a menor para stats)
      setSortBy(column)
      setSortOrder(column === 'rank' ? 'asc' : 'desc')
    }
  }, [sortBy])

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
        data-character="left"
        className="character-breathe hidden lg:block fixed bottom-0 left-0 w-[1000px] h-full pointer-events-none"
        style={{
          zIndex: 1,
          backgroundImage: 'url(/images/power-ranking/hashiizq.webp)',
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
      {/* Left Aura Glow — Pulsing opacity, follows character contour */}
      <div
        className="aura-left hidden lg:block fixed bottom-0 left-0 w-[1000px] h-full pointer-events-none"
        style={{
          zIndex: 0,
          background: 'radial-gradient(ellipse at left center, rgba(0,220,110,0.8) 0%, transparent 60%)',
          boxShadow: '-40px 0 100px rgba(0,220,110,0.5), inset -30px 0 80px rgba(0,220,110,0.3)',
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
        data-character="right"
        className="character-breathe hidden lg:block fixed bottom-0 right-0 w-[1000px] h-full pointer-events-none"
        style={{
          zIndex: 1,
          backgroundImage: 'url(/images/power-ranking/madaraderecha.webp)',
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
      {/* Right Aura Glow — Pulsing opacity, follows character contour */}
      <div
        className="aura-right hidden lg:block fixed bottom-0 right-0 w-[1000px] h-full pointer-events-none"
        style={{
          zIndex: 0,
          background: 'radial-gradient(ellipse at right center, rgba(240,70,40,0.8) 0%, transparent 60%)',
          boxShadow: '40px 0 100px rgba(240,70,40,0.5), inset 30px 0 80px rgba(240,70,40,0.3)',
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
          { left: '18%', bottom: '40%', size: 5, dur: 7.5, delay: 1.2, driftX: '25px' },
          { left: '2%', bottom: '20%', size: 6.5, dur: 8.8, delay: 2.5, driftX: '-40px' },
          { left: '10%', bottom: '50%', size: 4.5, dur: 7.2, delay: 0.5, driftX: '30px' },
        ].map((p, i) => (
          <div
            key={`green-${i}`}
            className="absolute rounded-full"
            style={
              {
                left: p.left,
                bottom: p.bottom,
                width: p.size,
                height: p.size,
                backgroundColor: 'rgba(0,220,110,0.8)',
                boxShadow: '0 0 60px rgba(0,220,110,0.7)',
                animation: `chakra-drift ${p.dur}s cubic-bezier(0.4, 0.0, 0.6, 1) infinite`,
                animationDelay: `${p.delay}s`,
                '--drift-x': p.driftX,
              } as React.CSSProperties & { [key: string]: any }
            }
          />
        ))}

        {/* Red/Orange Chakra Drifts — Madara side */}
        {[
          { right: '8%', bottom: '20%', size: 6, dur: 8.5, delay: 0.2, driftX: '-40px' },
          { right: '12%', bottom: '32%', size: 5, dur: 7.5, delay: 1, driftX: '30px' },
          { right: '5%', bottom: '42%', size: 7, dur: 9.5, delay: 1.8, driftX: '-20px' },
          { right: '15%', bottom: '12%', size: 4, dur: 6.8, delay: 2.5, driftX: '50px' },
          { right: '4%', bottom: '60%', size: 5.5, dur: 8.2, delay: 0.5, driftX: '-35px' },
          { right: '18%', bottom: '45%', size: 5, dur: 8, delay: 1.3, driftX: '-25px' },
          { right: '2%', bottom: '28%', size: 6.5, dur: 9, delay: 2.8, driftX: '40px' },
          { right: '10%', bottom: '55%', size: 4.5, dur: 7.8, delay: 0.8, driftX: '-30px' },
        ].map((p, i) => (
          <div
            key={`red-${i}`}
            className="absolute rounded-full"
            style={
              {
                right: p.right,
                bottom: p.bottom,
                width: p.size,
                height: p.size,
                backgroundColor: 'rgba(240,70,40,0.8)',
                boxShadow: '0 0 60px rgba(240,70,40,0.7)',
                animation: `chakra-drift ${p.dur}s cubic-bezier(0.4, 0.0, 0.6, 1) infinite`,
                animationDelay: `${p.delay}s`,
                '--drift-x': p.driftX,
              } as React.CSSProperties & { [key: string]: any }
            }
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
                ? '0 0 30px rgba(0,220,110,0.6)'
                : '0 0 30px rgba(240,70,40,0.6)',
              animation: `orb-pulse ${p.dur}s ease-in-out infinite`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Navbar */}
      <Navbar />

      {/* ═══════════════════════════════════════════════════
          MAIN CONTENT — Centered Ranking
          ═══════════════════════════════════════════════════ */}
      <div className="relative max-w-4xl mx-auto px-6 py-8 pt-28" style={{ zIndex: 10, overflow: 'visible' }}>
        {/* ── Title Block ──────────────────────────────── */}
        <div className="text-center mb-10">
          <p className="text-sm font-cinzel font-black text-power-red/70 tracking-[0.3em] uppercase mb-2">
            {region === 'GLOBAL' ? 'TOP GLOBAL' : `TOP REGIONAL - ${region}`} · {date}
          </p>
          <h1 className="text-4xl md:text-5xl font-cinzel font-black text-white leading-tight mb-3">
            Ranking de{' '}
            <span
              className="text-transparent bg-clip-text"
              style={{
                backgroundImage: 'linear-gradient(135deg, #CC0000 0%, #FF4444 50%, #CC0000 100%)',
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
            {region === 'GLOBAL'
              ? 'Los 100 ninjas más poderosos de España y Latinoamérica'
              : `Los ninjas más poderosos de ${region} (Cluster ${cluster})`
            }
          </p>
          <div className="flex justify-center mt-4 gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10 text-xs font-cinzel text-white/80">
              <Crown className="w-3.5 h-3.5 text-power-red/60" />
              <span>{players.length} Jugadores</span>
            </div>
            <Link
              href="/rankings/stats"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-power-red/10 rounded-lg border border-power-red/25 text-xs font-cinzel text-power-red/80 hover:bg-power-red/20 hover:border-power-red/50 hover:text-power-red transition-all duration-200"
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Estadísticas</span>
            </Link>
          </div>
        </div>

        {/* ── Filters ──────────────────────────────────── */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm mb-6">
            {error}
          </div>
        )}
        <>
          {/* Main Filters */}
            <div
              className="relative bg-[#0e0e1a]/80 backdrop-blur-md border border-white/8 rounded-xl p-5 mb-6"
              style={{ overflow: 'visible', zIndex: 50 }}
            >
              {/* Row 1: Regional Filters */}
              <div className="mb-5">
                <p className="text-xs font-cinzel text-white/60 uppercase tracking-widest mb-3">Filtros</p>
                <div className="flex flex-col gap-3 mb-5 pb-4 border-b border-white/5">
                  {/* Region, Cluster, Date in one row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Region */}
                    <select
                      value={region}
                      onChange={handleRegionChange}
                      className="bg-white/5 border border-white/8 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-power-red/50 appearance-none cursor-pointer"
                    >
                      <option value="GLOBAL" className="bg-[#0e0e1a]">Global</option>
                      {regions.map((r) => (
                        <option key={r.id} value={r.id} className="bg-[#0e0e1a]">
                          {r.name}
                        </option>
                      ))}
                    </select>

                    {/* Cluster - Only show when not Global */}
                    {region !== 'GLOBAL' && (
                      <select
                        value={cluster}
                        onChange={handleClusterChange}
                        className="bg-white/5 border border-white/8 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-power-red/50 appearance-none cursor-pointer"
                      >
                        {clusters.map((c) => (
                          <option key={c.id} value={c.id} className="bg-[#0e0e1a]">
                            {c.name}
                          </option>
                        ))}
                      </select>
                    )}

                    {/* Date - Only show when not Global */}
                    {region !== 'GLOBAL' && (
                      <select
                        value={date}
                        onChange={handleDateChange}
                        className="bg-white/5 border border-white/8 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-power-red/50 appearance-none cursor-pointer"
                      >
                        {dates.map((d) => (
                          <option key={d} value={d} className="bg-[#0e0e1a]">
                            {d}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Server filter - Always show with search (full width) */}
                  <div ref={serverDropdownRef} className="relative">
                    <button
                      onClick={() => setShowServerDropdown(!showServerDropdown)}
                      className="w-full bg-white/5 border border-white/8 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-power-red/50 cursor-pointer text-left flex items-center justify-between"
                    >
                      <span>
                        {server === 'Todos' ? 'Todos los servidores' : `Servidor ${server}`}
                      </span>
                      <svg className={`w-4 h-4 transition-transform flex-shrink-0 ${showServerDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </button>
                    {showServerDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-[#0e0e1a] border border-white/8 rounded-lg shadow-lg z-[100] flex flex-col">
                        {/* Search input */}
                        <div className="p-2 border-b border-white/5 sticky top-0 bg-[#0e0e1a]">
                          <input
                            type="text"
                            placeholder="Buscar servidor..."
                            value={serverSearch}
                            onChange={(e) => setServerSearch(e.target.value)}
                            className="w-full bg-white/5 border border-white/8 rounded px-2 py-1.5 text-xs text-white placeholder:text-[#555] focus:outline-none focus:border-power-red/50"
                            autoFocus
                          />
                        </div>
                        {/* Server options */}
                        <div className="overflow-y-auto max-h-64">
                          {filteredServers.length === 0 ? (
                            <div className="px-3 py-2 text-xs text-white/40 text-center">
                              No hay servidores que coincidan
                            </div>
                          ) : (
                            filteredServers.map((s) => (
                              <button
                                key={s}
                                onClick={() => {
                                  setServer(s)
                                  setShowServerDropdown(false)
                                  setServerSearch('')
                                }}
                                className={`w-full text-left px-3 py-2 text-sm transition-colors whitespace-nowrap ${
                                  server === s
                                    ? 'bg-power-red/20 text-power-red border-l-2 border-power-red'
                                    : 'text-white hover:bg-white/5'
                                }`}
                              >
                                {s === 'Todos' ? 'Todos los servidores' : `Servidor ${s}`}
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Row 2: Search & Display Options */}
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555] pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Buscar ninja..."
                    value={search}
                    onChange={handleSearchChange}
                    className="w-full bg-white/5 border border-white/8 rounded-lg pl-9 pr-8 py-2.5 text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-power-red/50 transition-all"
                  />
                  {search && (
                    <button
                      onClick={handleSearchClear}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555] hover:text-power-red transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Display Mode toggle */}
                <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1 border border-white/8 shrink-0">
                  <button
                    onClick={() => handleDisplayModeChange('table')}
                    className={`p-2 rounded transition-all ${displayMode === 'table' ? 'bg-power-red/20 text-power-red' : 'text-[#555] hover:text-white'}`}
                    title="Vista tabla"
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDisplayModeChange('cards')}
                    className={`p-2 rounded transition-all ${displayMode === 'cards' ? 'bg-power-red/20 text-power-red' : 'text-[#555] hover:text-white'}`}
                    title="Vista cards"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {(search || server !== 'Todos') && (
                <div className="mt-3 flex items-center gap-2 text-sm">
                  <span
                    className={`text-xs font-cinzel ${filtered.length > 0 ? 'text-power-red' : 'text-[#555]'}`}
                  >
                    {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
                  </span>
                  <button
                    onClick={handleFiltersClear}
                    className="text-xs text-power-red/60 hover:text-power-red font-cinzel transition-colors flex items-center gap-1"
                  >
                    <X className="w-3 h-3" /> Limpiar
                  </button>
                </div>
              )}
            </div>
        </>

        {/* ── Rankings ─────────────────────────────────── */}
        <div className="relative" style={{ zIndex: 1 }}>
          {loading ? (
            <LoadingSpinner message="Cargando listado de ninjas" size="md" />
          ) : displayMode === 'table' ? (
            /* ──── TABLE VIEW ──── */
            <div className="bg-[#0e0e1a]/80 backdrop-blur-md border border-white/8 rounded-2xl overflow-hidden">
              {/* Header - Desktop only */}
              <div className="hidden sm:grid grid-cols-[40px_1.5fr_50px_90px_110px_110px_110px_60px] gap-2 px-6 py-3 border-b border-white/8 bg-white/[0.02]">
                <button
                  onClick={() => handleSort('rank')}
                  className="text-xs font-montserrat text-white/60 tracking-[0.15em] uppercase font-bold flex items-center justify-center gap-1 hover:text-white transition-colors"
                >
                  #
                  {sortBy === 'rank' ? (
                    sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                  ) : (
                    <ArrowUpDown className="w-3 h-3 opacity-30" />
                  )}
                </button>
                <div className="text-xs font-montserrat text-white/60 tracking-[0.15em] uppercase font-bold flex items-center">
                  Ninja
                </div>
                <div className="text-xs font-montserrat text-white/60 tracking-[0.15em] uppercase font-bold flex items-center justify-center">
                  Nivel
                </div>
                <button
                  onClick={() => handleSort('power')}
                  className="text-xs font-montserrat text-white/60 tracking-[0.15em] uppercase font-bold flex items-center justify-center gap-1 hover:text-white transition-colors"
                >
                  Poder
                  {sortBy === 'power' ? (
                    sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                  ) : (
                    <ArrowUpDown className="w-3 h-3 opacity-30" />
                  )}
                </button>
                <button
                  onClick={() => handleSort('firstAttack')}
                  className="text-xs font-montserrat text-white/60 tracking-[0.15em] uppercase font-bold flex items-center justify-center gap-1 hover:text-white transition-colors text-center leading-tight"
                >
                  <span>Primer Ataque</span>
                  {sortBy === 'firstAttack' ? (
                    sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 flex-shrink-0" /> : <ArrowDown className="w-3 h-3 flex-shrink-0" />
                  ) : (
                    <ArrowUpDown className="w-3 h-3 opacity-30 flex-shrink-0" />
                  )}
                </button>
                <button
                  onClick={() => handleSort('criticalHit')}
                  className="text-xs font-montserrat text-white/60 tracking-[0.15em] uppercase font-bold flex items-center justify-center gap-1 hover:text-white transition-colors text-center leading-tight"
                >
                  <span>Golpe Crítico</span>
                  {sortBy === 'criticalHit' ? (
                    sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 flex-shrink-0" /> : <ArrowDown className="w-3 h-3 flex-shrink-0" />
                  ) : (
                    <ArrowUpDown className="w-3 h-3 opacity-30 flex-shrink-0" />
                  )}
                </button>
                <button
                  onClick={() => handleSort('criticalDamage')}
                  className="text-xs font-montserrat text-white/60 tracking-[0.15em] uppercase font-bold flex items-center justify-center gap-1 hover:text-white transition-colors text-center leading-tight"
                >
                  <span>Daño Crítico</span>
                  {sortBy === 'criticalDamage' ? (
                    sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 flex-shrink-0" /> : <ArrowDown className="w-3 h-3 flex-shrink-0" />
                  ) : (
                    <ArrowUpDown className="w-3 h-3 opacity-30 flex-shrink-0" />
                  )}
                </button>
                <div className="text-xs font-montserrat text-white/60 tracking-[0.15em] uppercase font-bold flex items-center justify-center">
                  Server
                </div>
              </div>

              {/* Mobile Sort Bar */}
              <div className="sm:hidden flex items-center gap-2 px-4 py-3 border-b border-white/8 bg-white/[0.02] overflow-x-auto">
                <span className="text-[10px] font-montserrat text-white/50 uppercase tracking-wider whitespace-nowrap flex-shrink-0">Ordenar:</span>
                {([
                  { key: 'rank', label: '#' },
                  { key: 'power', label: 'Poder' },
                  { key: 'firstAttack', label: '1° Ataque' },
                  { key: 'criticalHit', label: 'Golpe Crít.' },
                  { key: 'criticalDamage', label: 'Daño Crít.' },
                ] as const).map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => handleSort(opt.key)}
                    className={`text-[11px] font-montserrat font-semibold px-2.5 py-1 rounded border whitespace-nowrap flex items-center gap-1 transition-colors ${
                      sortBy === opt.key
                        ? 'bg-power-red/20 border-power-red/40 text-power-red'
                        : 'bg-white/5 border-white/10 text-white/70'
                    }`}
                  >
                    {opt.label}
                    {sortBy === opt.key && (
                      sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                    )}
                  </button>
                ))}
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
                  const dynamicRank = index + 1
                  const medal = MEDAL[dynamicRank]
                  const isTop3 = dynamicRank <= 3

                  return (
                    <div
                      key={`${player.name}-${index}`}
                      className={`
                        relative border-b border-white/[0.04] last:border-b-0
                        group overflow-hidden
                        ${isTop3 ? 'bg-white/[0.05]' : 'hover:bg-white/[0.03]'}
                      `}
                      style={{
                        ...(isTop3
                          ? {
                              borderLeft: `3px solid ${dynamicRank === 1 ? '#FFD700' : dynamicRank === 2 ? '#C0C0C0' : '#CD7F32'}`,
                            }
                          : {}),
                      }}
                    >
                      {/* Background ninja tools detail */}
                      <img
                        src="/images/tools/assets-ninja-tools.png"
                        alt="ninja tools"
                        className="absolute -right-6 -bottom-2 w-48 h-48 opacity-[0.10] group-hover:opacity-[0.16] transition-opacity pointer-events-none"
                      />

                      {/* ─── DESKTOP LAYOUT (sm+) ─── */}
                      <div className="hidden sm:grid grid-cols-[40px_1.5fr_50px_90px_110px_110px_110px_60px] gap-2 px-6 py-4 items-center">
                        {/* Rank # */}
                        <div className="flex items-center justify-center relative z-10">
                          {isTop3 && medal ? (
                            <div className="w-8 h-7 flex items-center justify-center">
                              {medal.image ? (
                                <MedalImage
                                  src={medal.image}
                                  emoji={medal.emoji}
                                  alt={`Top ${dynamicRank}`}
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <span className="text-xl">{medal.emoji}</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs font-montserrat font-bold text-[#555] w-7 inline-block text-center group-hover:text-[#888] transition-colors">
                              {String(dynamicRank).padStart(2, '0')}
                            </span>
                          )}
                        </div>

                        {/* Name */}
                        <div className="flex items-center gap-2.5 relative z-10 min-w-0">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-montserrat font-black flex-shrink-0 transition-all group-hover:scale-110 ${
                              isTop3 && medal
                                ? `${medal.bg} ${medal.color} border ${medal.border}`
                                : 'bg-white/5 text-white border border-white/10 group-hover:border-white/30'
                            }`}
                          >
                            {player.name[0]}
                          </div>
                          <span
                            className={`text-sm font-montserrat font-bold truncate transition-colors ${
                              isTop3 && medal
                                ? medal.color
                                : 'text-white/90 group-hover:text-white'
                            }`}
                          >
                            {player.name}
                          </span>
                        </div>

                        {/* Level */}
                        <div className="flex items-center justify-center relative z-10">
                          <span className="text-sm font-montserrat font-bold text-white group-hover:text-white/100 transition-colors">
                            {player.level}
                          </span>
                        </div>

                        {/* Power */}
                        <div className="flex items-center justify-center relative z-10">
                          <span className={`text-sm font-montserrat font-bold tabular-nums transition-colors text-center ${
                            isTop3 && medal
                              ? medal.color
                              : 'text-white/90 group-hover:text-white'
                          }`}>
                            {(player.power / 1000000).toFixed(1)}M
                          </span>
                        </div>

                        {/* Primer Ataque */}
                        <div className="flex items-center justify-center relative z-10">
                          <span className="text-sm font-montserrat font-semibold tabular-nums text-white/80 group-hover:text-white transition-colors">
                            {player.firstAttack != null ? player.firstAttack.toLocaleString() : '-'}
                          </span>
                        </div>

                        {/* Golpe Crítico */}
                        <div className="flex items-center justify-center relative z-10">
                          <span className="text-sm font-montserrat font-semibold tabular-nums text-white/80 group-hover:text-white transition-colors">
                            {player.criticalHit != null ? player.criticalHit.toLocaleString() : '-'}
                          </span>
                        </div>

                        {/* Daño Crítico */}
                        <div className="flex items-center justify-center relative z-10">
                          <span className="text-sm font-montserrat font-semibold tabular-nums text-white/80 group-hover:text-white transition-colors">
                            {player.criticalDamage != null ? player.criticalDamage.toLocaleString() : '-'}
                          </span>
                        </div>

                        {/* Server */}
                        <div className="flex items-center justify-center relative z-10">
                          <span
                            className={`text-[10px] font-montserrat font-semibold px-2 py-0.5 rounded border inline-block ${
                              !player.server
                                ? 'text-white/40 bg-white/[0.02] border-white/5'
                                : 'text-white bg-white/[0.05] border-white/10 group-hover:border-white/20'
                            }`}
                          >
                            {player.server || 'S??'}
                          </span>
                        </div>
                      </div>

                      {/* ─── MOBILE LAYOUT ─── */}
                      <div className="sm:hidden px-4 py-3 relative z-10">
                        {/* Top row: Rank + Name + Server */}
                        <div className="flex items-center gap-3 mb-3">
                          {/* Rank */}
                          <div className="flex items-center justify-center flex-shrink-0">
                            {isTop3 && medal ? (
                              <div className="w-9 h-8 flex items-center justify-center">
                                {medal.image ? (
                                  <MedalImage
                                    src={medal.image}
                                    emoji={medal.emoji}
                                    alt={`Top ${dynamicRank}`}
                                    className="w-full h-full object-contain"
                                  />
                                ) : (
                                  <span className="text-2xl">{medal.emoji}</span>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs font-montserrat font-bold text-white/50 w-9 text-center">
                                #{dynamicRank}
                              </span>
                            )}
                          </div>

                          {/* Avatar + Name */}
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-montserrat font-black flex-shrink-0 ${
                                isTop3 && medal
                                  ? `${medal.bg} ${medal.color} border ${medal.border}`
                                  : 'bg-white/5 text-white border border-white/10'
                              }`}
                            >
                              {player.name[0]}
                            </div>
                            <span
                              className={`text-sm font-montserrat font-bold truncate ${
                                isTop3 && medal ? medal.color : 'text-white/90'
                              }`}
                            >
                              {player.name}
                            </span>
                          </div>

                          {/* Server */}
                          <span
                            className={`text-[10px] font-montserrat font-semibold px-2 py-0.5 rounded border flex-shrink-0 ${
                              !player.server
                                ? 'text-white/40 bg-white/[0.02] border-white/5'
                                : 'text-white bg-white/[0.05] border-white/10'
                            }`}
                          >
                            {player.server || 'S??'}
                          </span>
                        </div>

                        {/* Stats grid */}
                        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 pl-12">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-montserrat text-white/50 uppercase tracking-wider">Nivel</span>
                            <span className="text-xs font-montserrat font-bold text-white tabular-nums">{player.level}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-montserrat text-white/50 uppercase tracking-wider">Poder</span>
                            <span className={`text-xs font-montserrat font-bold tabular-nums ${
                              isTop3 && medal ? medal.color : 'text-white'
                            }`}>
                              {(player.power / 1000000).toFixed(1)}M
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-montserrat text-white/50 uppercase tracking-wider">1° Ataq.</span>
                            <span className="text-xs font-montserrat font-semibold text-white/80 tabular-nums">
                              {player.firstAttack != null ? player.firstAttack.toLocaleString() : '-'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-montserrat text-white/50 uppercase tracking-wider">G. Crít.</span>
                            <span className="text-xs font-montserrat font-semibold text-white/80 tabular-nums">
                              {player.criticalHit != null ? player.criticalHit.toLocaleString() : '-'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between col-span-2">
                            <span className="text-[10px] font-montserrat text-white/50 uppercase tracking-wider">Daño Crít.</span>
                            <span className="text-xs font-montserrat font-semibold text-white/80 tabular-nums">
                              {player.criticalDamage != null ? player.criticalDamage.toLocaleString() : '-'}
                            </span>
                          </div>
                        </div>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filtered.map((player, index) => {
                    const dynamicRank = index + 1
                    const medal = MEDAL[dynamicRank]
                    const isTop3 = dynamicRank <= 3
                    const rankIn4to10 = dynamicRank >= 4 && dynamicRank <= 10

                    return (
                      <div
                        key={`${player.name}-${index}`}
                        className={`
                          relative group overflow-hidden rounded-2xl
                          ${
                            isTop3 && medal
                              ? 'bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1a] border-2 border-white/15 shadow-xl shadow-white/5'
                              : 'bg-gradient-to-br from-[#151520] to-[#0a0a12] border border-white/10 hover:border-white/20 hover:shadow-xl hover:shadow-white/5'
                          }
                        `}
                      >
                        {/* Background assets - higher opacity */}
                        <img
                          src="/images/tools/assets-ninja-tools.png"
                          alt="ninja tools"
                          className="absolute -bottom-6 -right-6 w-48 h-48 opacity-[0.12] group-hover:opacity-[0.18] transition-opacity pointer-events-none"
                        />

                        {/* Shuriken corner for top 3 */}
                        {isTop3 && (
                          <img
                            src="/images/tools/shuriken.png"
                            alt="shuriken"
                            className="absolute -top-6 -right-6 w-24 h-24 opacity-[0.15] group-hover:opacity-[0.22] transition-opacity pointer-events-none rotate-45"
                          />
                        )}

                        <div className="relative px-6 py-6 flex flex-col h-full z-10">
                          {/* Top Section: Medal/Rank + Server */}
                          <div className="flex items-start justify-between gap-3 mb-5">
                            {/* Medal/Rank Badge */}
                            <div className="flex items-center gap-3">
                              {isTop3 && medal ? (
                                <div className="w-14 h-14 flex items-center justify-center flex-shrink-0">
                                  {medal.image ? (
                                    <MedalImage
                                      src={medal.image}
                                      emoji={medal.emoji}
                                      alt={`Top ${dynamicRank}`}
                                      className="w-full h-full object-contain"
                                    />
                                  ) : (
                                    <span className="text-3xl">{medal.emoji}</span>
                                  )}
                                </div>
                              ) : (
                                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-white/20 bg-white/8">
                                  {rankIn4to10 ? (
                                    <img src="/images/tools/headset.png" alt="headset" className="w-6 h-6 object-contain" />
                                  ) : (
                                    <img src="/images/tools/kunai.png" alt="kunai" className="w-6 h-6 object-contain" />
                                  )}
                                </div>
                              )}
                              <div>
                                <p className="text-[10px] font-montserrat font-semibold text-white/50 uppercase tracking-widest">Rank</p>
                                <p className={`font-montserrat font-black text-lg ${isTop3 && medal ? medal.color : 'text-white'}`}>
                                  #{dynamicRank}
                                </p>
                              </div>
                            </div>

                            {/* Server Badge */}
                            <div className={`text-[10px] font-montserrat font-bold px-2.5 py-1.5 rounded border flex-shrink-0 ${
                              !player.server
                                ? 'text-white/40 bg-white/5 border-white/10'
                                : 'text-white/80 bg-white/10 border-white/15'
                            }`}>
                              {player.server || 'S??'}
                            </div>
                          </div>

                          {/* Ninja Name */}
                          <h3 className={`font-montserrat font-black text-xl leading-tight break-words mb-5 ${
                            isTop3 && medal ? medal.color : 'text-white'
                          }`}>
                            {player.name}
                          </h3>

                          {/* Animated Divider */}
                          <div className="mb-5 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:via-white/30 transition-all duration-300" />

                          {/* Stats Section - Informative */}
                          <div className="flex-grow space-y-5">
                            {/* Power */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <p className="text-xs font-montserrat font-semibold text-white/60 uppercase tracking-widest">Poder</p>
                                <p className="font-montserrat font-black text-xl text-white">
                                  {(player.power / 1000000).toFixed(1)}M
                                </p>
                              </div>
                              <div className="h-1.5 bg-gradient-to-r from-white/15 via-white/25 to-white/15 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-white/30 via-white/50 to-white/30 animate-pulse"
                                  style={{ width: `${Math.min((player.power / 15000000) * 100, 100)}%` }}
                                />
                              </div>
                            </div>

                            {/* Level */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <p className="text-xs font-montserrat font-semibold text-white/60 uppercase tracking-widest">Nivel</p>
                                <p className="font-montserrat font-black text-xl text-white">
                                  {player.level}
                                </p>
                              </div>
                              <div className="h-1.5 bg-gradient-to-r from-white/15 via-white/25 to-white/15 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-white/30 via-white/50 to-white/30 animate-pulse"
                                  style={{ width: `${(player.level / 115) * 100}%` }}
                                />
                              </div>
                            </div>

                            {/* Combat Stats */}
                            <div className="pt-3 border-t border-white/10 space-y-2.5">
                              <div className="flex items-center justify-between">
                                <p className="text-xs font-montserrat font-semibold text-white/60 uppercase tracking-wider">Primer Ataque</p>
                                <p className="font-montserrat font-bold text-sm text-white/90 tabular-nums">
                                  {player.firstAttack != null ? player.firstAttack.toLocaleString() : '-'}
                                </p>
                              </div>
                              <div className="flex items-center justify-between">
                                <p className="text-xs font-montserrat font-semibold text-white/60 uppercase tracking-wider">Golpe Crítico</p>
                                <p className="font-montserrat font-bold text-sm text-white/90 tabular-nums">
                                  {player.criticalHit != null ? player.criticalHit.toLocaleString() : '-'}
                                </p>
                              </div>
                              <div className="flex items-center justify-between">
                                <p className="text-xs font-montserrat font-semibold text-white/60 uppercase tracking-wider">Daño Crítico</p>
                                <p className="font-montserrat font-bold text-sm text-white/90 tabular-nums">
                                  {player.criticalDamage != null ? player.criticalDamage.toLocaleString() : '-'}
                                </p>
                              </div>
                            </div>
                          </div>
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
            Ranking de Poder {region} · {players.length} jugadores
          </p>
          <p className="text-xs text-[#444] font-cinzel">
            Actualizado {date}
          </p>
        </div>

      </div>
    </main>
  )
}

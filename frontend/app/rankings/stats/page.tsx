'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { API_URL } from '@/lib/config'
import Navbar from '@/components/Navbar'
import RegionComparator from '@/components/rankings/stats/RegionComparator'
import StatsSkeleton from '@/components/rankings/stats/StatsSkeleton'

interface GlobalPlayer {
  rank: number
  name: string
  power: number
  level: number
  server: string | null
  region: string
  cluster: number
}

interface ConsolidatedGlobalData {
  date: string
  updatedAt: string
  totalPlayers: number
  players: GlobalPlayer[]
}

interface RegionStats {
  region: string
  label: string
  players: GlobalPlayer[]
  totalInTop100: number
  avgPower: number
  maxPower: number
  minPower: number
  top5: GlobalPlayer[]
  dominancePct: number
}

interface PowerTierBucket {
  label: string
  ES: number
  LATAM: number
}

export default function StatsPage() {
  const [availableDates, setAvailableDates] = useState<string[]>([])
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [data, setData] = useState<ConsolidatedGlobalData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Fetch available dates on mount
  useEffect(() => {
    const fetchDates = async () => {
      try {
        const [esDates, latamDates] = await Promise.all([
          fetch(`${API_URL}/api/rankings/dates/ES/1`, { cache: 'no-store' }).then(
            (r) => r.json()
          ),
          fetch(`${API_URL}/api/rankings/dates/LATAM/1`, { cache: 'no-store' }).then(
            (r) => r.json()
          ),
        ])

        const allDates = Array.from(
          new Set([...(esDates || []), ...(latamDates || [])])
        )
          .sort()
          .reverse()

        setAvailableDates(allDates)
        if (allDates.length > 0) {
          setSelectedDate(allDates[0])
        }
      } catch (e) {
        setError('Error cargando fechas disponibles')
        console.error(e)
      }
    }

    fetchDates()
  }, [])

  // Fetch consolidated global data when date changes
  useEffect(() => {
    if (!selectedDate) return

    const fetchData = async () => {
      setLoading(true)
      setError('')

      try {
        const res = await fetch(
          `${API_URL}/api/rankings/consolidated-global?date=${selectedDate}&limit=100`,
          { cache: 'no-store' }
        )
        if (!res.ok) throw new Error(`HTTP ${res.status}`)

        const json: ConsolidatedGlobalData = await res.json()
        setData(json)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error cargando datos')
        console.error(e)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [selectedDate])

  // Compute stats from data
  const regionStats = useMemo(() => {
    if (!data) return null

    const byRegion = (regionId: string, top10Only: boolean = false): RegionStats => {
      let players = data.players.filter((p) => p.region === regionId)
      if (top10Only) {
        players = players.sort((a, b) => a.rank - b.rank).slice(0, 10)
      }
      const powers = players.map((p) => p.power)

      return {
        region: regionId,
        label: regionId === 'ES' ? 'España' : 'Latinoamérica',
        players,
        totalInTop100: players.length,
        avgPower:
          powers.length > 0
            ? powers.reduce((a, b) => a + b, 0) / powers.length
            : 0,
        maxPower: powers.length > 0 ? Math.max(...powers) : 0,
        minPower: powers.length > 0 ? Math.min(...powers) : 0,
        top5: [...players]
          .sort((a, b) => a.rank - b.rank)
          .slice(0, 5),
        dominancePct:
          data.players.length > 0
            ? (players.length / data.players.length) * 100
            : 0,
      }
    }

    const esStats = byRegion('ES')
    const latamStats = byRegion('LATAM')
    const esTop10Stats = byRegion('ES', true)
    const latamTop10Stats = byRegion('LATAM', true)

    // Dynamic tier buckets based on actual power range
    const allPowers = data.players.map((p) => p.power)
    const maxP = Math.max(...allPowers)
    const minP = Math.min(...allPowers)
    const step = (maxP - minP) / 5

    const fmt = (v: number) => `${(v / 1_000_000).toFixed(1)}M`

    const tierData: PowerTierBucket[] = [...Array(5)].map((_, i) => {
      const lo = minP + step * (4 - i)
      const hi = i === 0 ? Infinity : minP + step * (5 - i)
      const label = i === 0 ? `${fmt(lo)}+` : `${fmt(lo)}–${fmt(hi)}`

      return {
        label,
        ES: data.players.filter(
          (p) => p.region === 'ES' && p.power >= lo && p.power < hi
        ).length,
        LATAM: data.players.filter(
          (p) => p.region === 'LATAM' && p.power >= lo && p.power < hi
        ).length,
      }
    })

    return { es: esStats, latam: latamStats, esTop10: esTop10Stats, latamTop10: latamTop10Stats, tierData }
  }, [data])

  return (
    <main
      className="min-h-screen relative bg-[#080810]"
      style={{
        background: `linear-gradient(180deg, #05050f 0%, #0a0a1a 30%, #0f0f20 60%, #1a0a0a 100%)`,
      }}
    >
      {/* Ambient orbs */}
      <div
        className="fixed top-1/3 left-[-10%] w-[500px] h-[500px] pointer-events-none rounded-full opacity-[0.08]"
        style={{
          background:
            'radial-gradient(circle, rgba(204,0,0,0.6) 0%, transparent 70%)',
        }}
      />
      <div
        className="fixed top-1/3 right-[-10%] w-[500px] h-[500px] pointer-events-none rounded-full opacity-[0.08]"
        style={{
          background:
            'radial-gradient(circle, rgba(139,26,26,0.6) 0%, transparent 70%)',
        }}
      />

      <Navbar />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-8 pt-28">
        {/* Back Button & Header */}
        <div className="mb-8">
          <Link
            href="/rankings"
            className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a Rankings
          </Link>

          <h1 className="font-cinzel text-4xl text-white mb-2">
            Estadísticas de Ranking
          </h1>
          <p className="text-sm text-white/60 font-cinzel tracking-widest">
            COMPARADOR DE REGIONES · {selectedDate}
          </p>
        </div>

        {/* Date Selector */}
        {availableDates.length > 0 && (
          <div className="bg-[#0e0e1a]/80 border border-white/8 rounded-xl p-5 mb-8">
            <label className="block text-xs font-cinzel text-white/60 uppercase tracking-widest mb-2">
              Período de análisis
            </label>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-[#0e0e1a] border border-white/20 rounded-lg px-3 py-2 text-white font-cinzel text-sm focus:outline-none focus:border-power-red/50"
            >
              {availableDates.map((date) => (
                <option key={date} value={date} className="bg-[#0e0e1a]">
                  {date}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Content or Skeleton */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/20 rounded-xl p-6 mb-8">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {loading ? (
          <StatsSkeleton />
        ) : regionStats ? (
          <RegionComparator
            esStats={regionStats.es}
            latamStats={regionStats.latam}
            esTop10Stats={regionStats.esTop10}
            latamTop10Stats={regionStats.latamTop10}
            tierData={regionStats.tierData}
          />
        ) : null}
      </div>
    </main>
  )
}

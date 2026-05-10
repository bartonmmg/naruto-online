'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { ArrowLeft, Search, X, Swords, Trophy } from 'lucide-react'
import Navbar from '@/components/Navbar'
import LoadingSpinner from '@/components/LoadingSpinner'
import { fetchRankingAPI } from '@/lib/api'

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

const SLOTS = 3

export default function CompareRankingsPage() {
  const [allPlayers, setAllPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<(Player | null)[]>(Array(SLOTS).fill(null))

  useEffect(() => {
    const load = async () => {
      try {
        // 1. Obtener regiones disponibles
        const regions: { id: string }[] = await fetchRankingAPI('/api/rankings/regions')
        if (!Array.isArray(regions) || regions.length === 0) throw new Error('no regions')

        // 2. Para alguna región, obtener clusters
        const region = regions.find(r => r.id === 'ES')?.id ?? regions[0].id
        const clusters: { id: number | null }[] = await fetchRankingAPI(`/api/rankings/clusters/${region}`)
        const clusterId = clusters.find(c => c.id != null)?.id
        if (clusterId == null) throw new Error('no clusters')

        // 3. Obtener fechas disponibles, tomar la más reciente
        const dates: string[] = await fetchRankingAPI(`/api/rankings/dates/${region}/${clusterId}`)
        if (!Array.isArray(dates) || dates.length === 0) throw new Error('no dates')
        const latestDate = dates[0]

        // 4. Pedir el ranking global consolidado con esa fecha
        const data: any = await fetchRankingAPI(`/api/rankings/consolidated-global?date=${latestDate}&limit=200`)
        const items: Player[] = data?.players ?? data?.items ?? []
        setAllPlayers(Array.isArray(items) ? items : [])
      } catch {
        setAllPlayers([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const setSlot = (idx: number, player: Player | null) => {
    setSelected(prev => prev.map((p, i) => i === idx ? player : p))
  }

  const active = selected.filter((p): p is Player => !!p)
  const reference = active[0] ?? null

  return (
    <main className="min-h-screen bg-bg-primary">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 pt-28 pb-16">
        <Link href="/rankings" className="inline-flex items-center gap-2 text-xs text-white/50 hover:text-white/80 font-montserrat mb-6">
          <ArrowLeft className="w-4 h-4" />
          Volver a Rankings
        </Link>

        <div className="flex items-center gap-3 mb-3">
          <Swords className="w-6 h-6 text-power-red" />
          <h1 className="font-cinzel font-black text-3xl text-text-primary">Comparar jugadores</h1>
        </div>
        <p className="text-white/50 font-montserrat text-sm mb-8">
          Elegí hasta {SLOTS} jugadores del ranking global y compará sus stats lado a lado.
        </p>

        {loading ? (
          <div className="py-20 flex justify-center"><LoadingSpinner /></div>
        ) : allPlayers.length === 0 ? (
          <div className="py-20 text-center text-white/40 font-montserrat text-sm">
            No hay datos de ranking disponibles.
          </div>
        ) : (
          <>
            {/* Selectors */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {selected.map((player, idx) => (
                <PlayerSlot
                  key={idx}
                  index={idx}
                  player={player}
                  allPlayers={allPlayers}
                  takenNames={new Set(active.map(p => p.name))}
                  onSelect={p => setSlot(idx, p)}
                  onClear={() => setSlot(idx, null)}
                />
              ))}
            </div>

            {/* Comparison table */}
            {active.length >= 2 ? (
              <ComparisonTable players={active} reference={reference!} />
            ) : (
              <div className="py-16 text-center border border-dashed border-border/40 rounded-xl">
                <Trophy className="w-12 h-12 text-white/15 mx-auto mb-3" />
                <p className="font-montserrat text-white/50">
                  Elegí al menos 2 jugadores para empezar a comparar.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}

function PlayerSlot({
  index, player, allPlayers, takenNames, onSelect, onClear,
}: {
  index: number
  player: Player | null
  allPlayers: Player[]
  takenNames: Set<string>
  onSelect: (p: Player) => void
  onClear: () => void
}) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)

  const matches = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return allPlayers
      .filter(p => p.name.toLowerCase().includes(q) && !takenNames.has(p.name))
      .slice(0, 8)
  }, [query, allPlayers, takenNames])

  if (player) {
    return (
      <div className="bg-bg-card border border-border/60 rounded-xl p-4">
        <div className="flex items-start justify-between mb-2">
          <span className="text-[10px] text-white/40 font-montserrat tracking-widest uppercase">
            Jugador {index + 1}
          </span>
          <button onClick={onClear} className="text-white/30 hover:text-white" title="Quitar">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="font-cinzel font-bold text-base text-text-primary mb-1 truncate">
          {player.name}
        </div>
        <div className="text-xs text-white/50 font-montserrat">
          #{player.rank} · {player.server ?? 'Sin server'}
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="bg-bg-card border border-dashed border-border/40 rounded-xl p-4">
        <span className="text-[10px] text-white/40 font-montserrat tracking-widest uppercase block mb-2">
          Jugador {index + 1}
        </span>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setOpen(true) }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            placeholder="Buscar nombre..."
            className="w-full pl-9 pr-3 py-2 bg-bg-elevated border border-border/40 rounded-lg text-sm text-text-primary placeholder-white/30 focus:outline-none focus:border-accent-orange/60 font-montserrat"
          />
        </div>
      </div>

      {open && matches.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-bg-elevated border border-border/60 rounded-xl shadow-2xl z-20 overflow-hidden max-h-64 overflow-y-auto">
          {matches.map(p => (
            <button
              key={p.name + p.rank}
              onClick={() => { onSelect(p); setQuery(''); setOpen(false) }}
              className="w-full text-left px-4 py-2.5 hover:bg-accent-orange/10 transition-colors border-b border-border/20 last:border-0"
            >
              <div className="text-sm font-montserrat text-text-primary truncate">{p.name}</div>
              <div className="text-xs text-white/40 font-montserrat">
                #{p.rank} · Nivel {p.level} · {p.power.toLocaleString()} de poder
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function ComparisonTable({ players, reference }: { players: Player[]; reference: Player }) {
  const fmtNum = (v: any) => (typeof v === 'number' ? v.toLocaleString() : '—')
  const fmtPct = (v: any) => (typeof v === 'number' ? `${v}%` : '—')

  const rows: { label: string; key: keyof Player; format?: (v: any) => string; higherBetter: boolean }[] = [
    { label: 'Posición global',  key: 'rank',           higherBetter: false, format: v => `#${v}` },
    { label: 'Nivel',            key: 'level',          higherBetter: true,  format: v => String(v) },
    { label: 'Poder',            key: 'power',          higherBetter: true,  format: fmtNum },
    { label: 'Primer ataque',    key: 'firstAttack',    higherBetter: true,  format: fmtNum },
    { label: 'Golpe crítico',    key: 'criticalHit',    higherBetter: true,  format: fmtPct },
    { label: 'Daño crítico',     key: 'criticalDamage', higherBetter: true,  format: fmtPct },
    { label: 'Server',           key: 'server',         higherBetter: true,  format: v => v ?? '—' },
  ]

  return (
    <div className="bg-bg-card border border-border/40 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/40">
              <th className="text-left p-4 text-xs font-cinzel tracking-widest text-white/50 uppercase">Stat</th>
              {players.map((p, i) => (
                <th key={i} className="text-left p-4 text-xs font-cinzel tracking-widest text-white/80 uppercase">
                  {p.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.label} className="border-b border-border/20 last:border-0 hover:bg-bg-elevated/30 transition-colors">
                <td className="p-4 text-sm font-montserrat text-white/70">{row.label}</td>
                {players.map((p, i) => {
                  const val = p[row.key] as any
                  const refVal = reference[row.key] as any
                  const isRef = i === 0
                  let delta: number | null = null
                  if (typeof val === 'number' && typeof refVal === 'number' && !isRef) {
                    delta = val - refVal
                  }
                  const formatted = row.format ? row.format(val) : String(val)
                  return (
                    <td key={i} className="p-4">
                      <div className="text-sm font-montserrat font-semibold text-text-primary">{formatted}</div>
                      {delta !== null && delta !== 0 && (
                        <div className={`text-xs font-montserrat mt-1 ${
                          (row.higherBetter ? delta > 0 : delta < 0) ? 'text-nature-green' : 'text-power-red'
                        }`}>
                          {delta > 0 ? '+' : ''}{delta.toLocaleString()} vs {reference.name}
                        </div>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

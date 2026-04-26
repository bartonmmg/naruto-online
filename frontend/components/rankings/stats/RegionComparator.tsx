'use client'

import RegionStatCard from './RegionStatCard'
import RegionLeaderboard from './RegionLeaderboard'
import PowerTierChart from './PowerTierChart'
import PowerDistributionChart from './PowerDistributionChart'

interface GlobalPlayer {
  rank: number
  name: string
  power: number
  level: number
  server: string | null
  region: string
  cluster: number
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

interface RegionComparatorProps {
  esStats: RegionStats
  latamStats: RegionStats
  esTop10Stats: RegionStats
  latamTop10Stats: RegionStats
  tierData: PowerTierBucket[]
}

export default function RegionComparator({
  esStats,
  latamStats,
  esTop10Stats,
  latamTop10Stats,
  tierData,
}: RegionComparatorProps) {
  return (
    <section className="space-y-6">
      {/* Section Title */}
      <div className="mb-6">
        <h2 className="font-cinzel text-2xl text-white mb-1">
          Comparador de Regiones
        </h2>
        <p className="text-sm text-white/60">
          España vs Latinoamérica · Top 100 Global
        </p>
      </div>

      {/* Dominance Banner */}
      <div className="bg-[#0e0e1a]/80 border border-white/8 rounded-2xl p-5">
        <p className="text-xs font-cinzel text-white/60 uppercase tracking-widest mb-3">
          Dominancia Global · Top 100
        </p>

        <div className="flex items-center gap-3">
          <span className="text-sm font-cinzel text-power-red w-20 text-right">
            ES {esStats.dominancePct.toFixed(0)}%
          </span>

          <div className="flex-1 h-5 bg-white/5 rounded-full overflow-hidden flex">
            <div
              className="h-full bg-gradient-to-r from-power-red to-[#ff4444]"
              style={{ width: `${esStats.dominancePct}%` }}
            />
            <div
              className="h-full bg-gradient-to-r from-[#0066cc] to-chakra-blue"
              style={{ width: `${latamStats.dominancePct}%` }}
            />
          </div>

          <span className="text-sm font-cinzel text-chakra-blue w-20">
            {latamStats.dominancePct.toFixed(0)}% LATAM
          </span>
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <RegionStatCard stats={esStats} accentColor="#CC0000" />
        <RegionStatCard stats={latamStats} accentColor="#0080FF" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PowerTierChart data={tierData} />
        <PowerDistributionChart
          esPlayers={esStats.players}
          latamPlayers={latamStats.players}
        />
      </div>

      {/* Leaderboard - Top 5 Global */}
      <RegionLeaderboard esTop5={esStats.top5} latamTop5={latamStats.top5} />

      {/* Divider */}
      <div className="my-8 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Top 10 Comparison Section */}
      <div className="space-y-6">
        <div className="mb-6">
          <h2 className="font-cinzel text-2xl text-white mb-1">
            Análisis Top 10 por Región
          </h2>
          <p className="text-sm text-white/60">
            Poder de los 10 mejores ninjas de cada región
          </p>
        </div>

        {/* Top 10 Stat Cards Grid - Only key stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-[#0e0e1a]/80 border border-white/8 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-3 h-3 rounded-full bg-power-red" />
              <h3 className="font-cinzel text-lg text-white">España</h3>
              <span className="ml-auto text-xs font-cinzel px-2 py-1 bg-white/10 rounded text-white/60">
                ES
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-white/60 uppercase tracking-widest mb-1">Poder Máximo</p>
                <p className="text-xl font-cinzel text-white">
                  {(esTop10Stats.maxPower / 1_000_000).toFixed(1)}M
                </p>
              </div>
              <div>
                <p className="text-xs text-white/60 uppercase tracking-widest mb-1">Poder Promedio</p>
                <p className="text-xl font-cinzel text-white">
                  {(esTop10Stats.avgPower / 1_000_000).toFixed(1)}M
                </p>
              </div>
              <div>
                <p className="text-xs text-white/60 uppercase tracking-widest mb-1">Poder Mínimo</p>
                <p className="text-xl font-cinzel text-white">
                  {(esTop10Stats.minPower / 1_000_000).toFixed(1)}M
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#0e0e1a]/80 border border-white/8 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-3 h-3 rounded-full bg-chakra-blue" />
              <h3 className="font-cinzel text-lg text-white">Latinoamérica</h3>
              <span className="ml-auto text-xs font-cinzel px-2 py-1 bg-white/10 rounded text-white/60">
                LATAM
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-white/60 uppercase tracking-widest mb-1">Poder Máximo</p>
                <p className="text-xl font-cinzel text-white">
                  {(latamTop10Stats.maxPower / 1_000_000).toFixed(1)}M
                </p>
              </div>
              <div>
                <p className="text-xs text-white/60 uppercase tracking-widest mb-1">Poder Promedio</p>
                <p className="text-xl font-cinzel text-white">
                  {(latamTop10Stats.avgPower / 1_000_000).toFixed(1)}M
                </p>
              </div>
              <div>
                <p className="text-xs text-white/60 uppercase tracking-widest mb-1">Poder Mínimo</p>
                <p className="text-xl font-cinzel text-white">
                  {(latamTop10Stats.minPower / 1_000_000).toFixed(1)}M
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}

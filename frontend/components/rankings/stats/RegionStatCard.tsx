import { Users, Swords, Crown, Shield, TrendingUp, Activity } from 'lucide-react'

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

interface RegionStatCardProps {
  stats: RegionStats
  accentColor: string
}

function formatPower(power: number): string {
  return `${(power / 1_000_000).toFixed(1)}M`
}

export default function RegionStatCard({ stats, accentColor }: RegionStatCardProps) {
  // Calculate total accumulated power
  const totalPower = stats.players.reduce((sum, p) => sum + p.power, 0)
  const medianPower = stats.players.length > 0
    ? stats.players.sort((a, b) => a.power - b.power)[
        Math.floor(stats.players.length / 2)
      ].power
    : 0

  // Calculate top 5 total
  const top5Total = stats.players
    .sort((a, b) => a.rank - b.rank)
    .slice(0, 5)
    .reduce((sum, p) => sum + p.power, 0)

  const statItems = [
    {
      label: 'En Top 100',
      value: stats.totalInTop100,
      icon: Users,
    },
    {
      label: 'Poder Total Acumulado',
      value: formatPower(totalPower),
      icon: TrendingUp,
    },
    {
      label: 'Poder Promedio',
      value: formatPower(stats.avgPower),
      icon: Swords,
    },
    {
      label: 'Poder Máximo',
      value: formatPower(stats.maxPower),
      icon: Crown,
    },
    {
      label: 'Poder Mínimo',
      value: formatPower(stats.minPower),
      icon: Shield,
    },
    {
      label: 'Top 5 Poder Total',
      value: formatPower(top5Total),
      icon: Activity,
    },
    {
      label: 'Poder Mediano',
      value: formatPower(medianPower),
      icon: Swords,
    },
    {
      label: 'Dominancia',
      value: `${stats.dominancePct.toFixed(1)}%`,
      icon: Shield,
    },
  ]

  return (
    <div className="bg-[#0e0e1a]/80 border border-white/8 rounded-2xl p-6">
      {/* Region header */}
      <div className="flex items-center gap-2 mb-6">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: accentColor }}
        />
        <h3 className="font-cinzel text-lg text-white">{stats.label}</h3>
        <span className="ml-auto text-xs font-cinzel px-2 py-1 bg-white/10 rounded text-white/60">
          {stats.region}
        </span>
      </div>

      {/* Stats grid 2x4 */}
      <div className="grid grid-cols-2 gap-4">
        {statItems.map((item) => {
          const Icon = item.icon
          return (
            <div key={item.label} className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Icon
                  className="w-4 h-4"
                  style={{ color: accentColor }}
                />
                <p className="text-xs text-white/60 uppercase tracking-widest">
                  {item.label}
                </p>
              </div>
              <p className="text-xl font-cinzel text-white">
                {item.value}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

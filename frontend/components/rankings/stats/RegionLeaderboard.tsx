import { Crown } from 'lucide-react'

interface GlobalPlayer {
  rank: number
  name: string
  power: number
  level: number
  server: string | null
  region: string
  cluster: number
}

interface RegionLeaderboardProps {
  esTop5: GlobalPlayer[]
  latamTop5: GlobalPlayer[]
}

function formatPower(power: number): string {
  return `${(power / 1_000_000).toFixed(1)}M`
}

export default function RegionLeaderboard({
  esTop5,
  latamTop5,
}: RegionLeaderboardProps) {
  const LeaderboardColumn = ({
    region,
    label,
    players,
    accentColor,
  }: {
    region: string
    label: string
    players: GlobalPlayer[]
    accentColor: string
  }) => (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: accentColor }}
        />
        <h4 className="font-cinzel text-white" style={{ color: accentColor }}>
          {label}
        </h4>
      </div>

      <div className="space-y-1">
        {players.map((player, idx) => (
          <div
            key={`${player.name}-${idx}`}
            className="flex items-center justify-between py-2.5 px-2 border-b border-white/5 hover:bg-white/3 rounded transition-colors"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {idx === 0 ? (
                <Crown className="w-4 h-4 flex-shrink-0" style={{ color: accentColor }} />
              ) : (
                <span className="text-xs font-cinzel text-white/60 w-4 text-center flex-shrink-0">
                  {idx + 1}
                </span>
              )}
              <span className="font-cinzel text-white truncate">
                {player.name}
              </span>
            </div>
            <span className="text-sm font-cinzel ml-2 flex-shrink-0" style={{ color: accentColor }}>
              {formatPower(player.power)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="bg-[#0e0e1a]/80 border border-white/8 rounded-2xl p-6">
      <h3 className="font-cinzel text-white text-lg mb-6">Top 5 por Región</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <LeaderboardColumn
          region="ES"
          label="España"
          players={esTop5}
          accentColor="#CC0000"
        />
        <LeaderboardColumn
          region="LATAM"
          label="Latinoamérica"
          players={latamTop5}
          accentColor="#0080FF"
        />
      </div>
    </div>
  )
}

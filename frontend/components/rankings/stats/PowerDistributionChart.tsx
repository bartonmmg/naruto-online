'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { useMemo } from 'react'

interface GlobalPlayer {
  rank: number
  name: string
  power: number
  level: number
  server: string | null
  region: string
  cluster: number
}

interface PowerDistributionChartProps {
  esPlayers: GlobalPlayer[]
  latamPlayers: GlobalPlayer[]
}

export default function PowerDistributionChart({
  esPlayers,
  latamPlayers,
}: PowerDistributionChartProps) {
  const distributionData = useMemo(() => {
    const brackets = [
      { range: '1–5', minRank: 1, maxRank: 5 },
      { range: '6–10', minRank: 6, maxRank: 10 },
      { range: '11–20', minRank: 11, maxRank: 20 },
      { range: '21–30', minRank: 21, maxRank: 30 },
      { range: '31–50', minRank: 31, maxRank: 50 },
      { range: '51–75', minRank: 51, maxRank: 75 },
      { range: '76–100', minRank: 76, maxRank: 100 },
    ]

    return brackets.map((bracket) => {
      const esInBracket = esPlayers.filter(
        (p) => p.rank >= bracket.minRank && p.rank <= bracket.maxRank
      )
      const latamInBracket = latamPlayers.filter(
        (p) => p.rank >= bracket.minRank && p.rank <= bracket.maxRank
      )

      const esAvg =
        esInBracket.length > 0
          ? esInBracket.reduce((sum, p) => sum + p.power, 0) / esInBracket.length
          : 0

      const latamAvg =
        latamInBracket.length > 0
          ? latamInBracket.reduce((sum, p) => sum + p.power, 0) /
            latamInBracket.length
          : 0

      return {
        range: bracket.range,
        ES: Math.round(esAvg / 1_000_000 * 10) / 10,
        LATAM: Math.round(latamAvg / 1_000_000 * 10) / 10,
      }
    })
  }, [esPlayers, latamPlayers])

  const tooltipStyle = {
    contentStyle: {
      background: '#0e0e1a',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '8px',
      color: '#fff',
      fontSize: '12px',
    },
    itemStyle: { color: '#fff' },
    labelStyle: { fontFamily: 'Bebas Neue', color: '#ccc', marginBottom: '4px' },
    cursor: { fill: 'rgba(255,255,255,0.03)' },
  }

  const formatTooltipValue = (value: any) => {
    return `${value}M`
  }

  return (
    <div className="bg-[#0e0e1a]/80 border border-white/8 rounded-2xl p-6">
      <h3 className="font-cinzel text-white text-lg mb-4">
        Curva de Poder por Rango
      </h3>

      <ResponsiveContainer width="100%" height={280}>
        <AreaChart
          data={distributionData}
          margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
        >
          <defs>
            <linearGradient id="esGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#CC0000" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#CC0000" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="latamGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0080FF" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#0080FF" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.06)"
          />
          <XAxis
            dataKey="range"
            stroke="#555"
            tick={{ fill: '#888', fontSize: 11, fontFamily: 'Bebas Neue' }}
          />
          <YAxis
            stroke="#555"
            tick={{ fill: '#888', fontSize: 11 }}
            label={{ value: 'Poder (M)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            {...tooltipStyle}
            formatter={formatTooltipValue}
          />
          <Legend
            wrapperStyle={{ fontFamily: 'Bebas Neue', fontSize: 12 }}
          />

          <Area
            type="monotone"
            dataKey="ES"
            stroke="#CC0000"
            fill="url(#esGrad)"
            strokeWidth={2}
            name="España"
          />
          <Area
            type="monotone"
            dataKey="LATAM"
            stroke="#0080FF"
            fill="url(#latamGrad)"
            strokeWidth={2}
            name="Latinoamérica"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

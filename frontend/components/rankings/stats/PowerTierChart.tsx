'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface PowerTierBucket {
  label: string
  ES: number
  LATAM: number
}

interface PowerTierChartProps {
  data: PowerTierBucket[]
}

export default function PowerTierChart({ data }: PowerTierChartProps) {
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

  return (
    <div className="bg-[#0e0e1a]/80 border border-white/8 rounded-2xl p-6">
      <h3 className="font-cinzel text-white text-lg mb-4">
        Distribución por Nivel de Poder
      </h3>

      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={data}
          margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.06)"
          />
          <XAxis
            dataKey="label"
            stroke="#555"
            tick={{ fill: '#888', fontSize: 11, fontFamily: 'Bebas Neue' }}
          />
          <YAxis
            stroke="#555"
            tick={{ fill: '#888', fontSize: 11 }}
            allowDecimals={false}
          />
          <Tooltip {...tooltipStyle} />
          <Legend
            wrapperStyle={{ fontFamily: 'Bebas Neue', fontSize: 12 }}
          />
          <Bar dataKey="ES" name="España" fill="#CC0000" radius={[4, 4, 0, 0]} />
          <Bar
            dataKey="LATAM"
            name="Latinoamérica"
            fill="#0080FF"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

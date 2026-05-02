'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface Achievement {
  id: string
  earnedAt: string
  achievement: {
    key: string
    title: string
    description: string
    imageFile: string
    xpReward: number
  }
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'hoy'
  if (days === 1) return 'ayer'
  if (days < 30) return `hace ${days} días`
  const months = Math.floor(days / 30)
  if (months < 12) return `hace ${months} ${months === 1 ? 'mes' : 'meses'}`
  return `hace ${Math.floor(months / 12)} año${Math.floor(months / 12) > 1 ? 's' : ''}`
}

interface Props {
  achievements: Achievement[]
}

export default function UserAchievements({ achievements }: Props) {
  const [expanded, setExpanded] = useState(false)

  if (achievements.length === 0) return null

  const shown = expanded ? achievements : achievements.slice(0, 4)

  return (
    <div className="mt-8 pt-8 border-t border-border/50">
      <h3 className="font-cinzel font-bold text-lg text-text-primary mb-5 flex items-center gap-2">
        Logros Desbloqueados
        <span className="text-sm font-montserrat font-normal text-white/40 ml-1">({achievements.length})</span>
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {shown.map(ua => (
          <div
            key={ua.id}
            className="group relative flex flex-col items-center gap-2 p-4 bg-bg-card border border-border/50 rounded-xl hover:border-sage-gold/40 hover:shadow-md hover:shadow-sage-gold/5 transition-all cursor-default"
            title={ua.achievement.description}
          >
            <img
              src={`/images/guides/logros/${ua.achievement.imageFile}`}
              alt={ua.achievement.title}
              className="w-16 h-16 object-contain group-hover:scale-105 transition-transform"
            />
            <div className="text-center">
              <p className="font-montserrat font-bold text-xs text-text-primary leading-tight">{ua.achievement.title}</p>
              <p className="text-[10px] text-white/40 mt-0.5">{timeAgo(ua.earnedAt)}</p>
            </div>
            {ua.achievement.xpReward > 0 && (
              <span className="absolute top-2 right-2 text-[9px] font-bold text-sage-gold bg-sage-gold/10 border border-sage-gold/20 rounded px-1">
                +{ua.achievement.xpReward}XP
              </span>
            )}

            {/* Tooltip on hover */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-44 bg-bg-elevated border border-border/60 rounded-lg p-2.5 text-xs text-white/70 font-montserrat leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl">
              {ua.achievement.description}
            </div>
          </div>
        ))}
      </div>

      {achievements.length > 4 && (
        <button
          onClick={() => setExpanded(e => !e)}
          className="mt-4 flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors font-montserrat"
        >
          {expanded ? <><ChevronUp className="w-3.5 h-3.5" />Mostrar menos</> : <><ChevronDown className="w-3.5 h-3.5" />Ver {achievements.length - 4} más</>}
        </button>
      )}
    </div>
  )
}

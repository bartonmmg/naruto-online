'use client'

import { Check, Pin } from 'lucide-react'

interface UserAchievement {
  id: string
  achievementId: string
  achievement?: {
    title?: string
    imageFile?: string
    description?: string
  }
}

interface Props {
  userAchievements: UserAchievement[]
  pinned: string[]
  onChange: (pinned: string[]) => void
}

export default function PinnedAchievements({ userAchievements, pinned, onChange }: Props) {
  const toggle = (achievementId: string) => {
    if (pinned.includes(achievementId)) {
      onChange(pinned.filter(id => id !== achievementId))
    } else if (pinned.length < 3) {
      onChange([...pinned, achievementId])
    } else {
      // replace oldest
      onChange([...pinned.slice(1), achievementId])
    }
  }

  if (userAchievements.length === 0) {
    return (
      <p className="text-xs text-white/40 font-montserrat italic">
        Aún no tenés logros desbloqueados. Cuando tengas, vas a poder elegir 3 para destacar.
      </p>
    )
  }

  return (
    <div>
      <p className="text-[10px] text-white/40 font-montserrat mb-2">
        Elegí hasta 3 ({pinned.length}/3)
      </p>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {userAchievements.map(ua => {
          const isPinned = pinned.includes(ua.achievementId)
          const img = ua.achievement?.imageFile ? `/images/guides/logros/${ua.achievement.imageFile}` : null
          return (
            <button
              key={ua.id}
              onClick={() => toggle(ua.achievementId)}
              className={`relative aspect-square rounded-xl border-2 p-2 transition-all hover:scale-105 ${
                isPinned ? 'border-accent-orange bg-accent-orange/10' : 'border-border/50 bg-bg-elevated/40 hover:border-border'
              }`}
              title={ua.achievement?.title ?? 'Logro'}
            >
              {img ? (
                <img src={img} alt={ua.achievement?.title ?? ''} className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px] text-white/40 font-montserrat text-center">
                  {ua.achievement?.title ?? 'Logro'}
                </div>
              )}
              {isPinned && (
                <div className="absolute top-1 right-1 bg-accent-orange rounded-full p-1">
                  <Pin className="w-2.5 h-2.5 text-bg-primary" />
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import api from '@/lib/api'

interface Reaction {
  emoji: string
  label: string
  count: number
  userReacted: boolean
}

interface GuideReactionsProps {
  guideId: string
}

const AVAILABLE_REACTIONS = [
  { emoji: '❤️', label: 'Me encanta' },
  { emoji: '🔥', label: 'Épico' },
  { emoji: '👏', label: 'Útil' },
  { emoji: '😂', label: 'Divertido' },
  { emoji: '🤔', label: 'Reflexionar' },
]

export default function GuideReactions({ guideId }: GuideReactionsProps) {
  const { user } = useAuth()
  const [reactions, setReactions] = useState<Record<string, Reaction>>({})
  const [loading, setLoading] = useState(true)

  // Load reactions on mount
  useEffect(() => {
    const fetchReactions = async () => {
      try {
        const response = await api.get(`/guides/${guideId}/reactions`)
        setReactions(response.data)
      } catch (error) {
        console.error('Error fetching reactions:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchReactions()
  }, [guideId])

  const handleReaction = async (emoji: string) => {
    if (!user) {
      alert('Debes estar logueado para reaccionar')
      return
    }

    try {
      // Toggle reaction
      const currentReaction = reactions[emoji]
      if (currentReaction?.userReacted) {
        // Remove reaction
        await api.delete(`/guides/${guideId}/reactions/${emoji}`)
        setReactions(prev => ({
          ...prev,
          [emoji]: {
            ...prev[emoji],
            count: Math.max(0, prev[emoji].count - 1),
            userReacted: false,
          },
        }))
      } else {
        // Add reaction
        await api.post(`/guides/${guideId}/reactions`, { emoji })
        setReactions(prev => ({
          ...prev,
          [emoji]: {
            ...prev[emoji],
            count: (prev[emoji]?.count || 0) + 1,
            userReacted: true,
          },
        }))
      }
    } catch (error: any) {
      console.error('Error toggling reaction:', error)
      alert(error.response?.data?.error || 'Error al procesar reacción')
    }
  }

  if (loading) {
    return <div className="text-white/40 text-sm">Cargando reacciones...</div>
  }

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {AVAILABLE_REACTIONS.map(({ emoji, label }) => {
        const reaction = reactions[emoji]
        const count = reaction?.count || 0
        const userReacted = reaction?.userReacted || false

        return (
          <button
            key={emoji}
            onClick={() => handleReaction(emoji)}
            title={label}
            className={`px-3 py-1.5 rounded-full text-sm font-montserrat transition-all border ${
              userReacted
                ? 'bg-chakra-blue/30 border-chakra-blue/50 text-chakra-blue hover:bg-chakra-blue/40'
                : 'bg-bg-elevated border-border hover:border-white/30 text-white/60 hover:text-white'
            }`}
          >
            <span className="text-lg mr-1">{emoji}</span>
            {count > 0 && <span className="text-xs font-semibold">{count}</span>}
          </button>
        )
      })}
    </div>
  )
}

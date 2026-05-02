'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ThumbsUp, ThumbsDown, Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'
import { GuideRating } from '@/lib/types'
import Button from '@/components/ui/Button'
import api from '@/lib/api'

interface GuideVotingProps {
  guideId: string
}

export default function GuideVoting({ guideId }: GuideVotingProps) {
  const { user, isLoading } = useAuth()
  const [ratings, setRatings] = useState<GuideRating>({ upvotes: 0, downvotes: 0, userVote: null })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const response = await api.get(`/guides/${guideId}/ratings`)
        setRatings(response.data)
      } catch (error) {
        console.error('Error fetching ratings:', error)
      }
    }

    fetchRatings()
  }, [guideId])

  const handleVote = async (value: 1 | -1) => {
    if (!user) return

    setLoading(true)
    try {
      // Si ya tienen ese voto, eliminarlo (toggle off)
      if (ratings.userVote === value) {
        await api.delete(`/guides/${guideId}/ratings`)
      } else {
        await api.post(`/guides/${guideId}/ratings`, { value })
      }

      // Refetch ratings
      const response = await api.get(`/guides/${guideId}/ratings`)
      setRatings(response.data)
    } catch (error) {
      console.error('Error voting:', error)
    } finally {
      setLoading(false)
    }
  }

  if (isLoading) {
    return null
  }

  if (!user) {
    return (
      <div className="p-6 bg-bg-card border border-border/50 rounded-lg text-center">
        <p className="text-white/70 mb-4">Debes estar logueado para votar</p>
        <Link href="/auth/login">
          <Button size="sm">Entrar</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="p-6 bg-bg-card border border-border/50 rounded-lg">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-montserrat font-semibold text-text-primary mb-4 w-full">
          ¿Te fue útil esta guía?
        </h3>
      </div>

      <div className="flex gap-4 items-center">
        <button
          onClick={() => handleVote(1)}
          disabled={loading}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all font-montserrat font-semibold disabled:opacity-50 ${
            ratings.userVote === 1
              ? 'bg-nature-green/20 text-nature-green border border-nature-green/30'
              : 'bg-bg-elevated border border-border hover:border-nature-green/50 text-white/70 hover:text-nature-green'
          }`}
        >
          {loading && ratings.userVote === 1 ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ThumbsUp className="w-4 h-4" />
          )}
          Útil <span className="text-xs text-white/50">({ratings.upvotes})</span>
        </button>

        <button
          onClick={() => handleVote(-1)}
          disabled={loading}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all font-montserrat font-semibold disabled:opacity-50 ${
            ratings.userVote === -1
              ? 'bg-power-red/20 text-power-red border border-power-red/30'
              : 'bg-bg-elevated border border-border hover:border-power-red/50 text-white/70 hover:text-power-red'
          }`}
        >
          {loading && ratings.userVote === -1 ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ThumbsDown className="w-4 h-4" />
          )}
          No útil <span className="text-xs text-white/50">({ratings.downvotes})</span>
        </button>
      </div>
    </div>
  )
}

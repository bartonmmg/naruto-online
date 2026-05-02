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
  const [votingFor, setVotingFor] = useState<1 | -1 | null>(null)

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
    if (!user || loading) return
    setLoading(true)
    setVotingFor(value)
    try {
      if (ratings.userVote === value) {
        await api.delete(`/guides/${guideId}/ratings`)
      } else {
        await api.post(`/guides/${guideId}/ratings`, { value })
      }
      const response = await api.get(`/guides/${guideId}/ratings`)
      setRatings(response.data)
    } catch (error) {
      console.error('Error voting:', error)
    } finally {
      setLoading(false)
      setVotingFor(null)
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
      <h3 className="text-base font-montserrat font-semibold text-text-primary mb-4">
        ¿Te fue útil esta guía?
      </h3>

      <div className="flex gap-4 items-center">
        <button
          onClick={() => handleVote(1)}
          disabled={loading}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all font-montserrat font-semibold text-sm disabled:opacity-60 ${
            ratings.userVote === 1
              ? 'bg-nature-green/20 text-nature-green border border-nature-green/50 shadow-sm shadow-nature-green/20'
              : 'bg-bg-elevated border border-border hover:border-nature-green/50 text-white/70 hover:text-nature-green'
          }`}
        >
          {votingFor === 1 ? <Loader2 className="w-4 h-4 animate-spin" /> : <ThumbsUp className="w-4 h-4" />}
          Útil
          <span className={`text-xs font-normal ${ratings.userVote === 1 ? 'text-nature-green/70' : 'text-white/40'}`}>
            {ratings.upvotes}
          </span>
        </button>

        <button
          onClick={() => handleVote(-1)}
          disabled={loading}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all font-montserrat font-semibold text-sm disabled:opacity-60 ${
            ratings.userVote === -1
              ? 'bg-power-red/20 text-power-red border border-power-red/50 shadow-sm shadow-power-red/20'
              : 'bg-bg-elevated border border-border hover:border-power-red/50 text-white/70 hover:text-power-red'
          }`}
        >
          {votingFor === -1 ? <Loader2 className="w-4 h-4 animate-spin" /> : <ThumbsDown className="w-4 h-4" />}
          No útil
          <span className={`text-xs font-normal ${ratings.userVote === -1 ? 'text-power-red/70' : 'text-white/40'}`}>
            {ratings.downvotes}
          </span>
        </button>
      </div>
    </div>
  )
}

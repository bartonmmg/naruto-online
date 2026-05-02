'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ChevronLeft, Eye, MessageSquare, ThumbsUp, Heart, BookOpen, Star, Calendar, TrendingUp, Loader2 } from 'lucide-react'
import { CATEGORY_LABELS, DIFFICULTY_LABELS } from '@/lib/types'
import GuideBadges from '@/components/guides/GuideBadges'
import Navbar from '@/components/Navbar'
import api from '@/lib/api'

interface UserProfile {
  id: string
  username: string
  level: number
  xp: number
  role: string
  createdAt: string
  guides: {
    id: string
    title: string
    category: string
    difficulty: string
    viewCount: number
    badges: string[]
    createdAt: string
    _count: { ratings: number; comments: number; reactions: number }
  }[]
  stats: {
    totalViews: number
    totalComments: number
    totalReactions: number
    upvotes: number
    guideCount: number
  }
}

const getRankLabel = (level: number) => {
  if (level >= 60) return { label: 'Kage', color: 'text-sage-gold' }
  if (level >= 40) return { label: 'Jōnin', color: 'text-accent-orange' }
  if (level >= 20) return { label: 'Chūnin', color: 'text-chakra-blue' }
  return { label: 'Genin', color: 'text-nature-green' }
}

const getDiffColor = (d: string) => {
  if (d === 'BASICO') return 'text-nature-green border-nature-green/30 bg-nature-green/10'
  if (d === 'INTERMEDIO') return 'text-sage-gold border-sage-gold/30 bg-sage-gold/10'
  return 'text-power-red border-power-red/30 bg-power-red/10'
}

const getRoleLabel = (role: string) => {
  if (role === 'ADMIN') return { label: 'Admin', color: 'text-power-red bg-power-red/10 border-power-red/30' }
  if (role === 'MODERATOR') return { label: 'Moderador', color: 'text-accent-orange bg-accent-orange/10 border-accent-orange/30' }
  return null
}

export default function UserProfilePage() {
  const params = useParams()
  const username = params?.username as string
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!username) return
    api.get(`/leaderboard/users/${username}`)
      .then(r => setProfile(r.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [username])

  if (loading) {
    return (
      <main className="min-h-screen bg-bg-primary flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent-orange" />
      </main>
    )
  }

  if (notFound || !profile) {
    return (
      <main className="min-h-screen bg-bg-primary overflow-x-hidden">
        <Navbar />
        <section className="py-20 px-6">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-6xl mb-6">🥷</p>
            <h1 className="text-3xl font-cinzel font-black text-text-primary mb-4">Usuario no encontrado</h1>
            <p className="text-white/60 mb-8">@{username} no existe o no tiene guías publicadas.</p>
            <Link href="/guides" className="text-chakra-blue hover:text-chakra-blue/80 transition-colors font-montserrat">
              ← Volver a Guías
            </Link>
          </div>
        </section>
      </main>
    )
  }

  const { label: rankLabel, color: rankColor } = getRankLabel(profile.level)
  const roleInfo = getRoleLabel(profile.role)
  const joinedYear = new Date(profile.createdAt).getFullYear()

  return (
    <main className="min-h-screen bg-bg-primary overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none z-0" style={{
        background: 'radial-gradient(ellipse at 50% 0%, rgba(0,128,255,0.05) 0%, transparent 60%)',
      }} />
      <Navbar />

      {/* Header */}
      <section className="relative py-12 px-6 border-b border-border/50">
        <div className="max-w-4xl mx-auto relative z-10">
          <Link href="/guides/leaderboard" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white/90 transition-colors mb-8">
            <ChevronLeft className="w-4 h-4" />
            Leaderboard
          </Link>

          <div className="flex items-start gap-6 flex-wrap">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-2xl bg-bg-elevated border-2 border-border flex items-center justify-center text-3xl font-black text-chakra-blue font-cinzel flex-shrink-0">
              {profile.username[0].toUpperCase()}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap mb-2">
                <h1 className="text-3xl font-cinzel font-black text-text-primary">@{profile.username}</h1>
                {roleInfo && (
                  <span className={`text-xs px-2 py-1 rounded border font-montserrat font-semibold ${roleInfo.color}`}>
                    {roleInfo.label}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-white/50 flex-wrap">
                <span className={`font-cinzel font-bold ${rankColor}`}>{rankLabel}</span>
                <span>Nivel {profile.level}</span>
                <span>{profile.xp.toLocaleString()} XP</span>
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Desde {joinedYear}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="px-6 py-6 border-b border-border/30">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { icon: <BookOpen className="w-4 h-4" />, value: profile.stats.guideCount, label: 'Guías', color: 'text-chakra-blue' },
              { icon: <Eye className="w-4 h-4" />, value: profile.stats.totalViews.toLocaleString(), label: 'Vistas', color: 'text-white' },
              { icon: <ThumbsUp className="w-4 h-4" />, value: profile.stats.upvotes, label: 'Votos útil', color: 'text-nature-green' },
              { icon: <MessageSquare className="w-4 h-4" />, value: profile.stats.totalComments, label: 'Comentarios', color: 'text-accent-orange' },
              { icon: <Heart className="w-4 h-4" />, value: profile.stats.totalReactions, label: 'Reacciones', color: 'text-power-red' },
            ].map(stat => (
              <div key={stat.label} className="bg-bg-card border border-border/50 rounded-xl p-4 text-center">
                <div className={`flex items-center justify-center gap-1 ${stat.color} mb-1`}>
                  {stat.icon}
                </div>
                <div className="font-cinzel font-black text-xl text-text-primary">{stat.value}</div>
                <div className="text-xs text-white/40 font-montserrat">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Guides list */}
      <section className="py-10 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-chakra-blue" />
            <h2 className="font-cinzel font-bold text-lg text-text-primary">Guías Publicadas</h2>
            <span className="text-xs text-white/40 ml-1">ordenadas por vistas</span>
          </div>

          {profile.guides.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <p className="text-white/40 font-montserrat">Este ninja aún no publicó guías.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {profile.guides.map((guide, i) => (
                <Link
                  key={guide.id}
                  href={`/guides/${guide.id}`}
                  className="flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-bg-card/50 hover:bg-bg-card hover:border-chakra-blue/40 transition-all duration-200 group"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-bg-elevated border border-border flex items-center justify-center text-xs font-semibold text-white/40">
                    {i + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-montserrat font-bold text-sm text-text-primary group-hover:text-chakra-blue transition-colors truncate">
                        {guide.title}
                      </h3>
                      {guide.badges?.length > 0 && <GuideBadges badges={guide.badges} size="sm" />}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-white/40 flex-wrap">
                      <span className={`px-2 py-0.5 rounded border text-xs font-cinzel ${getDiffColor(guide.difficulty)}`}>
                        {DIFFICULTY_LABELS[guide.difficulty]}
                      </span>
                      <span>{CATEGORY_LABELS[guide.category] || guide.category}</span>
                      <span>{new Date(guide.createdAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>

                  <div className="flex-shrink-0 flex items-center gap-4 text-xs text-white/40">
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{guide.viewCount}</span>
                    <span className="flex items-center gap-1 hidden sm:flex"><ThumbsUp className="w-3 h-3 text-nature-green" />{guide._count.ratings}</span>
                    <span className="flex items-center gap-1 hidden md:flex"><MessageSquare className="w-3 h-3" />{guide._count.comments}</span>
                    <span className="flex items-center gap-1 hidden lg:flex"><Heart className="w-3 h-3 text-power-red" />{guide._count.reactions}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

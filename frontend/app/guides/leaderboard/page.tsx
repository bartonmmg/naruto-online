'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Trophy, Eye, MessageSquare, ThumbsUp, TrendingUp, Star, Crown, Flame, Users } from 'lucide-react'
import { CATEGORY_LABELS, DIFFICULTY_LABELS } from '@/lib/types'
import GuideBadges from '@/components/guides/GuideBadges'
import Navbar from '@/components/Navbar'
import LoadingSpinner from '@/components/LoadingSpinner'
import api from '@/lib/api'

type Tab = 'score' | 'views' | 'rated' | 'commented' | 'trending'

interface LeaderboardGuide {
  id: string
  title: string
  category: string
  difficulty: string
  badges: string[]
  author: { id: string; username: string }
  viewCount: number
  recentViews: number
  upvotes: number
  commentCount: number
  reactionCount: number
  score: number
  createdAt: string
}

interface AuthorStat {
  id: string
  username: string
  level: number
  xp: number
  guideCount: number
  totalViews: number
  totalComments: number
  totalReactions: number
  upvotes: number
  badgeCount: number
  score: number
}

interface LeaderboardData {
  topViews: LeaderboardGuide[]
  topRated: LeaderboardGuide[]
  topCommented: LeaderboardGuide[]
  trending: LeaderboardGuide[]
  topScore: LeaderboardGuide[]
}

const TABS: { id: Tab; label: string; icon: React.ReactNode; color: string }[] = [
  { id: 'score',     label: 'Top General',   icon: <Trophy className="w-4 h-4" />,      color: 'text-sage-gold border-sage-gold/40 bg-sage-gold/10' },
  { id: 'views',     label: 'Más Vistas',    icon: <Eye className="w-4 h-4" />,          color: 'text-chakra-blue border-chakra-blue/40 bg-chakra-blue/10' },
  { id: 'trending',  label: 'Trending',      icon: <TrendingUp className="w-4 h-4" />,   color: 'text-accent-orange border-accent-orange/40 bg-accent-orange/10' },
  { id: 'rated',     label: 'Mejor Valoradas', icon: <ThumbsUp className="w-4 h-4" />,  color: 'text-nature-green border-nature-green/40 bg-nature-green/10' },
  { id: 'commented', label: 'Más Comentadas', icon: <MessageSquare className="w-4 h-4" />, color: 'text-power-red border-power-red/40 bg-power-red/10' },
]

const getDifficultyColor = (d: string) => {
  if (d === 'BASICO') return 'text-nature-green'
  if (d === 'INTERMEDIO') return 'text-sage-gold'
  return 'text-power-red'
}

const getRankStyle = (i: number) => {
  if (i === 0) return { badge: 'bg-sage-gold text-black font-black text-sm w-8 h-8', glow: 'border-sage-gold/30 shadow-sage-gold/10' }
  if (i === 1) return { badge: 'bg-white/80 text-black font-black text-sm w-8 h-8', glow: 'border-white/20 shadow-white/5' }
  if (i === 2) return { badge: 'bg-accent-orange/80 text-black font-black text-sm w-8 h-8', glow: 'border-accent-orange/30 shadow-accent-orange/10' }
  return { badge: 'bg-bg-elevated text-white/60 font-semibold text-xs w-8 h-8', glow: 'border-border/50' }
}

function GuideRow({ guide, rank }: { guide: LeaderboardGuide; rank: number }) {
  const router = useRouter()
  const { badge, glow } = getRankStyle(rank)
  return (
    <div
      onClick={() => router.push(`/guides/${guide.id}`)}
      className={`flex items-center gap-4 p-4 rounded-xl border bg-bg-card/50 hover:bg-bg-card transition-all duration-200 hover:border-chakra-blue/40 shadow-sm hover:shadow-md cursor-pointer ${glow}`}
    >
      <div className={`flex-shrink-0 rounded-full flex items-center justify-center ${badge}`}>
        {rank < 3 ? ['🥇','🥈','🥉'][rank] : rank + 1}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <h3 className="font-montserrat font-bold text-text-primary truncate text-sm">{guide.title}</h3>
          {guide.badges?.length > 0 && <GuideBadges badges={guide.badges} size="sm" />}
        </div>
        <div className="flex items-center gap-3 text-xs text-white/50 flex-wrap">
          <a
            href={`/users/${guide.author.username}`}
            onClick={e => e.stopPropagation()}
            className="hover:text-chakra-blue transition-colors"
          >
            @{guide.author.username}
          </a>
          <span className={getDifficultyColor(guide.difficulty)}>{DIFFICULTY_LABELS[guide.difficulty]}</span>
          <span>{CATEGORY_LABELS[guide.category] || guide.category}</span>
        </div>
      </div>

      <div className="flex-shrink-0 flex items-center gap-4 text-xs text-white/50">
        <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{guide.viewCount.toLocaleString()}</span>
        <span className="flex items-center gap-1 hidden sm:flex"><ThumbsUp className="w-3 h-3 text-nature-green" />{guide.upvotes}</span>
        <span className="flex items-center gap-1 hidden md:flex"><MessageSquare className="w-3 h-3" />{guide.commentCount}</span>
        {guide.recentViews > 0 && (
          <span className="flex items-center gap-1 text-accent-orange hidden lg:flex"><TrendingUp className="w-3 h-3" />+{guide.recentViews}</span>
        )}
      </div>
    </div>
  )
}

function AuthorRow({ author, rank }: { author: AuthorStat; rank: number }) {
  const { badge, glow } = getRankStyle(rank)
  return (
    <Link
      href={`/users/${author.username}`}
      className={`flex items-center gap-4 p-4 rounded-xl border bg-bg-card/50 hover:bg-bg-card transition-all duration-200 hover:border-chakra-blue/40 shadow-sm hover:shadow-md ${glow}`}
    >
      <div className={`flex-shrink-0 rounded-full flex items-center justify-center ${badge}`}>
        {rank < 3 ? ['🥇','🥈','🥉'][rank] : rank + 1}
      </div>

      <div className="w-10 h-10 flex-shrink-0 rounded-full bg-bg-elevated border border-border flex items-center justify-center text-lg font-bold text-chakra-blue">
        {author.username[0].toUpperCase()}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-montserrat font-bold text-text-primary text-sm">@{author.username}</span>
          <span className="text-xs text-white/40 font-cinzel">Nv.{author.level}</span>
          {author.badgeCount > 0 && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-sage-gold/20 text-sage-gold border border-sage-gold/30 flex items-center gap-1">
              <Star className="w-3 h-3" />{author.badgeCount}
            </span>
          )}
        </div>
        <div className="text-xs text-white/40">{author.guideCount} guía{author.guideCount !== 1 ? 's' : ''} publicada{author.guideCount !== 1 ? 's' : ''}</div>
      </div>

      <div className="flex-shrink-0 flex items-center gap-4 text-xs text-white/50">
        <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{author.totalViews.toLocaleString()}</span>
        <span className="flex items-center gap-1 hidden sm:flex"><ThumbsUp className="w-3 h-3 text-nature-green" />{author.upvotes}</span>
        <span className="flex items-center gap-1 hidden md:flex"><MessageSquare className="w-3 h-3" />{author.totalComments}</span>
      </div>
    </Link>
  )
}

export default function LeaderboardPage() {
  const [tab, setTab] = useState<Tab>('score')
  const [showAuthors, setShowAuthors] = useState(false)
  const [data, setData] = useState<LeaderboardData | null>(null)
  const [authors, setAuthors] = useState<AuthorStat[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/leaderboard/guides'),
      api.get('/leaderboard/authors'),
    ]).then(([guides, auths]) => {
      setData(guides.data)
      setAuthors(auths.data)
    }).catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const currentList = useMemo(() => {
    if (!data) return []
    return { score: data.topScore, views: data.topViews, rated: data.topRated, commented: data.topCommented, trending: data.trending }[tab]
  }, [data, tab])

  const activeTab = TABS.find(t => t.id === tab)!

  return (
    <main className="min-h-screen bg-bg-primary overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none z-0" style={{
        background: 'radial-gradient(ellipse at 20% 30%, rgba(255,107,0,0.04) 0%, transparent 60%), radial-gradient(ellipse at 80% 70%, rgba(0,128,255,0.04) 0%, transparent 60%)',
      }} />

      <Navbar />

      {/* Header */}
      <section className="relative py-16 px-6 border-b border-border/50">
        <div className="max-w-4xl mx-auto relative z-10">
          <Link href="/guides" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white/90 transition-colors mb-6">
            <ChevronLeft className="w-4 h-4" />
            Volver a Guías
          </Link>
          <p className="text-xs font-cinzel text-accent-orange tracking-[0.2em] uppercase font-bold mb-3">Hall de la Fama</p>
          <h1 className="text-4xl md:text-5xl font-cinzel font-black text-text-primary mb-4">
            Leaderboard de Guías
          </h1>
          <p className="text-white/60 max-w-xl">Las guías y autores más destacados de la comunidad ninja.</p>
        </div>
      </section>

      <section className="py-10 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Toggle Guides / Authors */}
          <div className="flex gap-3 mb-8">
            <button
              onClick={() => setShowAuthors(false)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-montserrat font-semibold text-sm transition-all border ${
                !showAuthors ? 'bg-chakra-blue/20 border-chakra-blue/50 text-chakra-blue' : 'bg-bg-card border-border text-white/60 hover:border-white/30'
              }`}
            >
              <Trophy className="w-4 h-4" />
              Guías
            </button>
            <button
              onClick={() => setShowAuthors(true)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-montserrat font-semibold text-sm transition-all border ${
                showAuthors ? 'bg-chakra-blue/20 border-chakra-blue/50 text-chakra-blue' : 'bg-bg-card border-border text-white/60 hover:border-white/30'
              }`}
            >
              <Users className="w-4 h-4" />
              Autores
            </button>
          </div>

          {loading ? (
            <LoadingSpinner message="Cargando leaderboard" size="md" />
          ) : showAuthors ? (
            /* Authors leaderboard */
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-6">
                <Crown className="w-5 h-5 text-sage-gold" />
                <h2 className="font-cinzel font-bold text-lg text-text-primary">Top Autores</h2>
                <span className="text-xs text-white/40 ml-1">por impacto en la comunidad</span>
              </div>
              {authors.length === 0 ? (
                <p className="text-white/40 text-center py-12 font-montserrat">No hay autores con guías publicadas todavía.</p>
              ) : (
                authors.map((author, i) => <AuthorRow key={author.id} author={author} rank={i} />)
              )}
            </div>
          ) : (
            /* Guides leaderboard */
            <div>
              {/* Tab selector */}
              <div className="flex gap-2 flex-wrap mb-6">
                {TABS.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-montserrat font-semibold text-xs transition-all border ${
                      tab === t.id ? t.color : 'bg-bg-card border-border text-white/50 hover:border-white/30 hover:text-white/80'
                    }`}
                  >
                    {t.icon}
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Tab description */}
              <div className="mb-4 text-xs text-white/40 font-montserrat flex items-center gap-2">
                {tab === 'score' && <><Trophy className="w-3 h-3" /> Calculado por vistas, votos y comentarios</>}
                {tab === 'views' && <><Eye className="w-3 h-3" /> Total de lectores únicos</>}
                {tab === 'trending' && <><Flame className="w-3 h-3" /> Vistas en los últimos 7 días</>}
                {tab === 'rated' && <><ThumbsUp className="w-3 h-3" /> Más votos "útil" recibidos</>}
                {tab === 'commented' && <><MessageSquare className="w-3 h-3" /> Mayor debate generado</>}
              </div>

              <div className="space-y-3">
                {currentList.length === 0 ? (
                  <p className="text-white/40 text-center py-12 font-montserrat">No hay guías publicadas todavía.</p>
                ) : (
                  currentList.map((guide, i) => <GuideRow key={guide.id} guide={guide} rank={i} />)
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

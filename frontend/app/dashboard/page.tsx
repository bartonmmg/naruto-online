'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  LogOut, Zap, Shield, Trophy, Flame, Eye, MessageSquare,
  ThumbsUp, Heart, BookOpen, Settings, TrendingUp, Clock,
  ChevronDown, ChevronUp, Star,
} from 'lucide-react'
import { CATEGORY_LABELS, DIFFICULTY_LABELS } from '@/lib/types'
import GuideBadges from '@/components/guides/GuideBadges'
import api from '@/lib/api'

interface Achievement {
  id: string
  earnedAt: string
  achievement: { key: string; title: string; description: string; imageFile: string; xpReward: number }
}

interface Guide {
  id: string
  title: string
  category: string
  difficulty: string
  viewCount: number
  badges: string[]
  coverImage?: string | null
  createdAt: string
  _count: { ratings: number; comments: number; reactions: number }
}

interface Profile {
  id: string
  username: string
  email: string
  xp: number
  level: number
  role: string
  createdAt: string
  guides: Guide[]
  stats: {
    totalViews: number
    totalComments: number
    totalReactions: number
    upvotes: number
    guideCount: number
  }
  achievements: Achievement[]
}

function getRankLabel(level: number) {
  if (level >= 10) return { name: 'Akatsuki', color: 'text-power-red',     icon: '☁️', img: '/images/rangos/akatsuki.png' }
  if (level >= 8)  return { name: 'Kage',     color: 'text-sage-gold',     icon: '🔥', img: '/images/rangos/kage.png' }
  if (level >= 5)  return { name: 'Jōnin',   color: 'text-accent-orange',  icon: '⚡', img: '/images/rangos/jonin.png' }
  if (level >= 3)  return { name: 'Chūnin',  color: 'text-chakra-blue',    icon: '💧', img: '/images/rangos/chunin.png' }
  return                   { name: 'Genin',   color: 'text-nature-green',   icon: '🌿', img: '/images/rangos/genin.png' }
}

function getDiffColor(d: string) {
  if (d === 'BASICO') return 'text-nature-green border-nature-green/30 bg-nature-green/10'
  if (d === 'INTERMEDIO') return 'text-sage-gold border-sage-gold/30 bg-sage-gold/10'
  return 'text-power-red border-power-red/30 bg-power-red/10'
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'hoy'
  if (days === 1) return 'ayer'
  if (days < 30) return `hace ${days}d`
  return `hace ${Math.floor(days / 30)}m`
}

export default function DashboardPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAllAchievements, setShowAllAchievements] = useState(false)
  const [dailyToast, setDailyToast] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/auth/login'); return }

    // Show daily login toast if just awarded
    if (typeof window !== 'undefined' && sessionStorage.getItem('dailyLoginAwarded')) {
      sessionStorage.removeItem('dailyLoginAwarded')
      setDailyToast(true)
      setTimeout(() => setDailyToast(false), 4000)
    }

    api.get('/leaderboard/me')
      .then(r => setProfile(r.data))
      .catch(() => {
        // Fallback to localStorage if API fails
        const stored = localStorage.getItem('user')
        if (stored) setProfile({ ...JSON.parse(stored), guides: [], stats: { totalViews: 0, totalComments: 0, totalReactions: 0, upvotes: 0, guideCount: 0 }, achievements: [] })
        else router.push('/auth/login')
      })
      .finally(() => setLoading(false))
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="flex items-center gap-3 text-white/50">
          <span className="w-5 h-5 border-2 border-accent-orange/30 border-t-accent-orange rounded-full animate-spin" />
          <span className="font-cinzel text-sm tracking-widest">CARGANDO...</span>
        </div>
      </div>
    )
  }

  if (!profile) return null

  const rank = getRankLabel(profile.level)
  // XP progress to next level (pulled from LevelConfig logic in backend; approximate here)
  const xpForNext = Math.pow(profile.level, 2) * 100
  const xpProgress = Math.min((profile.xp / xpForNext) * 100, 100)

  const shownAchievements = showAllAchievements
    ? profile.achievements
    : profile.achievements.slice(0, 6)

  return (
    <main className="min-h-screen bg-bg-primary">
      <div className="fixed inset-0 pointer-events-none z-0" style={{
        background: 'radial-gradient(ellipse at 50% 0%, rgba(255,107,0,0.04) 0%, transparent 60%)',
      }} />

      {/* Top bar */}
      <header className="border-b border-border bg-bg-primary/90 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-power-red/70 text-lg font-cinzel group-hover:text-power-red transition-colors">忍</span>
            <span className="font-cinzel font-black text-sm tracking-[0.2em] text-white/70 group-hover:text-power-red transition-colors">
              HD<span className="text-power-red">RV</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            {profile.role === 'ADMIN' && (
              <Link href="/admin" className="flex items-center gap-1.5 text-xs text-accent-orange/70 hover:text-accent-orange transition-colors font-cinzel tracking-wider">
                <Settings className="w-3.5 h-3.5" />
                Back Office
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs text-white/40 hover:text-power-red transition-colors font-cinzel"
            >
              <LogOut className="w-3.5 h-3.5" />
              Salir
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10 relative z-10">

        {/* ── Hero: Avatar + nombre + rango ── */}
        <div className="flex items-center gap-6 mb-10">
          {/* Rank image as avatar background */}
          <div className="relative flex-shrink-0">
            <img src={rank.img} alt={rank.name} className="w-20 h-20 object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap mb-1">
              <h1 className="text-3xl font-cinzel font-black text-text-primary">{profile.username}</h1>
              {profile.role !== 'USER' && (
                <span className={`text-xs px-2 py-1 rounded border font-montserrat font-semibold ${
                  profile.role === 'ADMIN' ? 'text-power-red bg-power-red/10 border-power-red/30' : 'text-accent-orange bg-accent-orange/10 border-accent-orange/30'
                }`}>
                  {profile.role === 'ADMIN' ? 'Admin' : 'Moderador'}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-sm text-white/50 flex-wrap">
              <span className={`font-cinzel font-bold ${rank.color}`}>{rank.name}</span>
              <span>Nivel {profile.level}</span>
              <span>{profile.xp.toLocaleString()} XP</span>
            </div>
          </div>
        </div>

        {/* ── XP bar + nivel ── */}
        <div className="bg-bg-card border border-border/50 rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-accent-orange" />
              <span className="text-sm font-montserrat font-semibold text-text-primary">Experiencia</span>
            </div>
            <span className="text-sm font-cinzel font-bold text-accent-orange">{profile.xp.toLocaleString()} / {xpForNext.toLocaleString()} XP</span>
          </div>
          <div className="w-full bg-bg-elevated rounded-full h-2 overflow-hidden mb-2">
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent-orange to-orange-400 transition-all duration-700"
              style={{ width: `${xpProgress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-white/40 font-montserrat">
            <span>Nivel {profile.level} — {rank.name}</span>
            <span>{xpForNext - profile.xp} XP para nivel {profile.level + 1}</span>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
          {[
            { icon: <BookOpen className="w-4 h-4" />, value: profile.stats.guideCount, label: 'Guías', color: 'text-chakra-blue' },
            { icon: <Eye className="w-4 h-4" />, value: profile.stats.totalViews.toLocaleString(), label: 'Vistas', color: 'text-white' },
            { icon: <ThumbsUp className="w-4 h-4" />, value: profile.stats.upvotes, label: 'Votos útil', color: 'text-nature-green' },
            { icon: <MessageSquare className="w-4 h-4" />, value: profile.stats.totalComments, label: 'Comentarios', color: 'text-accent-orange' },
            { icon: <Heart className="w-4 h-4" />, value: profile.stats.totalReactions, label: 'Reacciones', color: 'text-power-red' },
          ].map(s => (
            <div key={s.label} className="bg-bg-card border border-border/50 rounded-xl p-4 text-center">
              <div className={`flex justify-center mb-1 ${s.color}`}>{s.icon}</div>
              <div className="font-cinzel font-black text-xl text-text-primary">{s.value}</div>
              <div className="text-xs text-white/40 font-montserrat">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Mis Guías ── */}
        {profile.guides.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-chakra-blue" />
                <h2 className="font-cinzel font-bold text-lg text-text-primary">Mis Guías</h2>
              </div>
              <Link href={`/users/${profile.username}`} className="text-xs text-white/40 hover:text-chakra-blue transition-colors font-montserrat">
                Ver perfil público →
              </Link>
            </div>
            <div className="space-y-2">
              {profile.guides.slice(0, 5).map(guide => (
                <Link
                  key={guide.id}
                  href={`/guides/${guide.id}`}
                  className="flex items-center gap-4 p-3.5 rounded-xl border border-border/50 bg-bg-card/50 hover:bg-bg-card hover:border-chakra-blue/40 transition-all group"
                >
                  {guide.coverImage && (
                    <img src={guide.coverImage} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0 border border-border" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <p className="font-montserrat font-bold text-sm text-text-primary group-hover:text-chakra-blue transition-colors truncate">
                        {guide.title}
                      </p>
                      {guide.badges?.length > 0 && <GuideBadges badges={guide.badges} size="sm" />}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-white/40 flex-wrap">
                      <span className={`px-1.5 py-0.5 rounded border text-[10px] font-cinzel ${getDiffColor(guide.difficulty)}`}>
                        {DIFFICULTY_LABELS[guide.difficulty]}
                      </span>
                      <span>{CATEGORY_LABELS[guide.category] || guide.category}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{timeAgo(guide.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-white/40 flex-shrink-0">
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{guide.viewCount}</span>
                    <span className="flex items-center gap-1 hidden sm:flex"><ThumbsUp className="w-3 h-3" />{guide._count.ratings}</span>
                    <span className="flex items-center gap-1 hidden md:flex"><MessageSquare className="w-3 h-3" />{guide._count.comments}</span>
                  </div>
                </Link>
              ))}
              {profile.guides.length > 5 && (
                <Link href={`/users/${profile.username}`} className="block text-center text-xs text-white/40 hover:text-chakra-blue transition-colors font-montserrat py-2">
                  Ver las {profile.guides.length - 5} guías restantes →
                </Link>
              )}
            </div>
          </div>
        )}

        {/* ── Logros ── */}
        {profile.achievements.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-sage-gold" />
              <h2 className="font-cinzel font-bold text-lg text-text-primary">Logros Desbloqueados</h2>
              <span className="text-sm font-montserrat text-white/40 ml-1">({profile.achievements.length})</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {shownAchievements.map(ua => (
                <div
                  key={ua.id}
                  className="group relative flex flex-col items-center gap-2 p-4 bg-bg-card border border-border/50 rounded-xl hover:border-sage-gold/40 transition-all cursor-default"
                  title={ua.achievement.description}
                >
                  <img
                    src={`/images/guides/logros/${ua.achievement.imageFile}`}
                    alt={ua.achievement.title}
                    className="w-14 h-14 object-contain group-hover:scale-110 transition-transform"
                  />
                  <p className="font-montserrat font-bold text-xs text-text-primary text-center leading-tight">{ua.achievement.title}</p>
                  <p className="text-[10px] text-white/30">{timeAgo(ua.earnedAt)}</p>
                  {ua.achievement.xpReward > 0 && (
                    <span className="absolute top-2 right-2 text-[9px] font-bold text-sage-gold">+{ua.achievement.xpReward}XP</span>
                  )}
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-40 bg-bg-elevated border border-border/60 rounded-lg p-2 text-xs text-white/60 font-montserrat opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl">
                    {ua.achievement.description}
                  </div>
                </div>
              ))}
            </div>
            {profile.achievements.length > 6 && (
              <button
                onClick={() => setShowAllAchievements(s => !s)}
                className="mt-3 flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors font-montserrat"
              >
                {showAllAchievements
                  ? <><ChevronUp className="w-3.5 h-3.5" />Mostrar menos</>
                  : <><ChevronDown className="w-3.5 h-3.5" />Ver {profile.achievements.length - 6} más</>}
              </button>
            )}
          </div>
        )}

        {/* Empty state si no tiene guías ni logros */}
        {profile.guides.length === 0 && profile.achievements.length === 0 && (
          <div className="text-center py-16 border border-dashed border-border/50 rounded-2xl">
            <Star className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <p className="font-cinzel font-bold text-text-primary mb-2">Tu camino ninja comienza aquí</p>
            <p className="text-sm text-white/40 font-montserrat mb-6">Publicá tu primera guía para ganar XP y logros</p>
            <Link href="/guides" className="inline-flex items-center gap-2 px-6 py-2.5 bg-chakra-blue/20 border border-chakra-blue/40 text-chakra-blue rounded-lg text-sm font-montserrat font-semibold hover:bg-chakra-blue/30 transition-colors">
              <BookOpen className="w-4 h-4" />
              Ir a Guías
            </Link>
          </div>
        )}

        {/* Links rápidos */}
        <div className="mt-8 pt-6 border-t border-border/30 flex flex-wrap items-center justify-center gap-6 text-xs font-cinzel text-white/30 tracking-widest">
          <Link href="/guides" className="hover:text-power-red transition-colors">→ Guías</Link>
          <Link href="/rankings" className="hover:text-power-red transition-colors">→ Rankings</Link>
          <Link href="/tools" className="hover:text-power-red transition-colors">→ Herramientas</Link>
          <Link href="/guides/leaderboard" className="hover:text-power-red transition-colors">→ Leaderboard</Link>
        </div>
      </div>

      {/* Daily login toast */}
      {dailyToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 bg-bg-elevated border border-nature-green/40 rounded-xl shadow-2xl shadow-black/40 animate-fade-up">
          <span className="text-xl">⚡</span>
          <div>
            <p className="font-cinzel font-bold text-sm text-nature-green">¡Login diario!</p>
            <p className="text-xs text-white/60 font-montserrat">Ganaste XP por iniciar sesión hoy</p>
          </div>
        </div>
      )}
    </main>
  )
}

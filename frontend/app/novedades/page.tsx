'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, Search, Pin } from 'lucide-react'
import Navbar from '@/components/Navbar'
import { useAuth } from '@/lib/hooks/useAuth'
import api from '@/lib/api'

interface NewsPost {
  id: string
  title: string
  content: string
  type: string
  category: string
  imageUrls: string[]
  author: { username: string; role: string } | null
  discordAuthor: string | null
  pinned: boolean
  publishedAt: string
}

function authorLabel(post: NewsPost): string {
  if (post.author) return `@${post.author.username}`
  if (!post.discordAuthor) return 'Discord'
  const name = post.discordAuthor.replace(/#\d{4}$/, '').trim()
  const isBot = name === 'BOT' || /bot/i.test(name)
  return isBot ? `🤖 ${name}` : `@${name}`
}

function cleanTitle(s: string): string {
  return s
    .replace(/^#{1,6}\s+/g, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/_(.+?)_/g, '$1')
    .replace(/~~(.+?)~~/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .trim()
}

const TYPE_META: Record<string, { label: string; color: string; bg: string; border: string; icon: string }> = {
  CHINA:     { label: 'China',     color: 'text-red-400',      bg: 'bg-red-400/10',      border: 'border-red-400/20',      icon: '🔴' },
  EVENT:     { label: 'Evento',    color: 'text-chakra-blue',  bg: 'bg-chakra-blue/10',  border: 'border-chakra-blue/20',  icon: '📅' },
  TENTATIVE: { label: 'Tentativa', color: 'text-sage-gold',    bg: 'bg-sage-gold/10',    border: 'border-sage-gold/20',    icon: '⚡' },
  GENERAL:   { label: 'General',   color: 'text-white/50',     bg: 'bg-white/5',          border: 'border-white/10',        icon: '📢' },
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 60) return `hace ${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `hace ${h}h`
  const d = Math.floor(h / 24)
  if (d < 7) return `hace ${d}d`
  return `hace ${Math.floor(d / 7)}sem`
}

function excerpt(content: string, max = 160) {
  // strip markdown for cleaner preview
  const clean = content
    .replace(/^#{1,6}\s+/gm, '')          // headings
    .replace(/\*\*(.+?)\*\*/g, '$1')      // bold
    .replace(/\*(.+?)\*/g, '$1')          // italic
    .replace(/__(.+?)__/g, '$1')          // bold alt
    .replace(/_(.+?)_/g, '$1')            // italic alt
    .replace(/~~(.+?)~~/g, '$1')          // strikethrough
    .replace(/`(.+?)`/g, '$1')            // inline code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links
    .replace(/^>\s+/gm, '')               // blockquotes
    .replace(/^[-*+]\s+/gm, '')           // list bullets
    .replace(/\n+/g, ' ')                 // newlines → spaces
    .trim()
  return clean.length > max ? clean.slice(0, max) + '…' : clean
}

export default function NovedadesPage() {
  const router = useRouter()
  const { hasRole } = useAuth()
  const [posts, setPosts]       = useState<NewsPost[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading]   = useState(true)
  const [activeTab, setActiveTab] = useState('Todas')
  const [typeFilter, setTypeFilter] = useState('Todos')
  const [search, setSearch]     = useState('')

  useEffect(() => {
    Promise.all([
      api.get('/news?limit=100'),
      api.get('/news/categories'),
    ]).then(([news, cats]) => {
      setPosts(news.data.items)
      setCategories(cats.data)
    }).catch(console.error)
    .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => posts.filter(p => {
    if (activeTab !== 'Todas' && p.category !== activeTab) return false
    if (typeFilter !== 'Todos' && p.type !== typeFilter) return false
    if (search && !p.title.toLowerCase().includes(search.toLowerCase()) &&
        !p.content.toLowerCase().includes(search.toLowerCase())) return false
    return true
  }), [posts, activeTab, typeFilter, search])

  const tabs = ['Todas', ...categories]

  return (
    <div className="min-h-screen bg-bg-primary">
      <Navbar />

      {/* Hero */}
      <div className="pt-28 pb-10 px-6 text-center border-b border-border/30">
        <h1 className="font-cinzel font-bold text-4xl text-text-primary mb-2">Novedades</h1>
        <p className="text-white/50 font-montserrat text-sm">Actualizaciones del servidor de China y próximos cambios</p>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">

        {/* Tabs por categoría */}
        <div className="flex gap-2 flex-wrap">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 h-8 rounded-full text-xs font-montserrat font-semibold transition-all border ${
                activeTab === tab
                  ? 'bg-accent-orange/15 text-accent-orange border-accent-orange/30'
                  : 'text-white/40 border-border hover:text-white/70 hover:border-border/80'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Filtros secundarios */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Tipo */}
          <div className="flex gap-1.5">
            {['Todos', 'CHINA', 'EVENT', 'TENTATIVE', 'GENERAL'].map(t => {
              const meta = t !== 'Todos' ? TYPE_META[t] : null
              return (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`px-3 h-7 rounded-lg text-xs font-montserrat font-semibold transition-all border ${
                    typeFilter === t
                      ? meta ? `${meta.bg} ${meta.color} ${meta.border}` : 'bg-white/10 text-white border-white/20'
                      : 'text-white/30 border-border hover:text-white/60'
                  }`}
                >
                  {meta ? `${meta.icon} ${meta.label}` : 'Todos'}
                </button>
              )
            })}
          </div>

          {/* Búsqueda */}
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar novedades..."
              className="w-full h-8 pl-9 pr-3 text-xs bg-bg-card border border-border rounded-lg text-white placeholder-white/25 focus:outline-none focus:border-accent-orange font-montserrat"
            />
          </div>

          {/* Acciones MOD/ADMIN */}
          {hasRole(['ADMIN', 'MODERATOR']) && (
            <Link
              href="/novedades/create"
              className="flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-montserrat font-semibold bg-accent-orange/15 text-accent-orange border border-accent-orange/30 hover:bg-accent-orange/25 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Nueva
            </Link>
          )}
        </div>

        {/* Feed */}
        {loading ? (
          <div className="space-y-4">
            <div className="h-64 bg-bg-card border border-border/50 rounded-2xl animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-48 bg-bg-card border border-border/50 rounded-2xl animate-pulse" />
              ))}
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-white/30 font-montserrat text-sm">
            No hay novedades en esta categoría todavía
          </div>
        ) : (
          <>
            {/* Featured / Hero — el primer post (pinned o más reciente) */}
            {(() => {
              const hero = filtered[0]
              const rest = filtered.slice(1)
              const heroMeta = TYPE_META[hero.type] ?? TYPE_META.GENERAL
              return (
                <>
                  <div
                    onClick={() => router.push(`/novedades/${hero.id}`)}
                    className="relative bg-bg-card border border-accent-orange/30 rounded-2xl overflow-hidden hover:border-accent-orange/60 transition-all cursor-pointer group"
                  >
                    {hero.imageUrls[0] && (
                      <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity">
                        <img src={hero.imageUrls[0]} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-bg-card via-bg-card/95 to-transparent" />
                      </div>
                    )}
                    <div className="relative p-7 md:p-10">
                      <div className="flex items-center gap-2 mb-4 flex-wrap">
                        {hero.pinned && (
                          <span className="text-[10px] font-montserrat font-bold px-2 py-0.5 rounded-full border bg-accent-orange/15 text-accent-orange border-accent-orange/30 flex items-center gap-1">
                            <Pin className="w-2.5 h-2.5" /> DESTACADA
                          </span>
                        )}
                        <span className={`text-[10px] font-montserrat font-bold px-2 py-0.5 rounded-full border ${heroMeta.bg} ${heroMeta.color} ${heroMeta.border}`}>
                          {heroMeta.icon} {heroMeta.label}
                        </span>
                        <span className="text-[10px] text-white/40 font-montserrat">{hero.category}</span>
                        <span className="ml-auto text-[10px] text-white/40 font-montserrat">{timeAgo(hero.publishedAt)}</span>
                      </div>
                      <h2 className="font-cinzel font-bold text-xl md:text-2xl text-text-primary mb-3 line-clamp-2 group-hover:text-accent-orange transition-colors">
                        {cleanTitle(hero.title)}
                      </h2>
                      <p className="text-sm text-white/60 font-montserrat leading-relaxed line-clamp-3 mb-4">
                        {excerpt(hero.content, 240)}
                      </p>
                      <div className="flex items-center justify-between pt-3 border-t border-border/30">
                        <span className="text-xs text-white/40 font-montserrat truncate max-w-[200px]">
                          {authorLabel(hero)}
                        </span>
                        <span className="text-sm text-accent-orange font-montserrat font-semibold">
                          Leer más →
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Resto del feed */}
                  {rest.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {rest.map(post => {
                        const meta = TYPE_META[post.type] ?? TYPE_META.GENERAL
                        return (
                          <div
                            key={post.id}
                            onClick={() => router.push(`/novedades/${post.id}`)}
                            className={`bg-bg-card border rounded-2xl overflow-hidden transition-all cursor-pointer group ${
                              post.pinned
                                ? 'border-accent-orange/30 hover:border-accent-orange/60'
                                : 'border-border/50 hover:border-border/80 hover:bg-bg-elevated/30'
                            }`}
                          >
                            {post.imageUrls[0] && (
                              <img src={post.imageUrls[0]} alt={post.title} className="w-full h-40 object-cover" />
                            )}
                            <div className="p-5">
                              <div className="flex items-center gap-2 mb-3 flex-wrap">
                                {post.pinned && (
                                  <Pin className="w-3 h-3 text-accent-orange" />
                                )}
                                <span className={`text-[10px] font-montserrat font-bold px-2 py-0.5 rounded-full border ${meta.bg} ${meta.color} ${meta.border}`}>
                                  {meta.icon} {meta.label}
                                </span>
                                <span className="text-[10px] text-white/30 font-montserrat">{post.category}</span>
                                <span className="ml-auto text-[10px] text-white/30 font-montserrat">{timeAgo(post.publishedAt)}</span>
                              </div>
                              <p className="font-cinzel font-bold text-sm text-text-primary mb-2 line-clamp-2 group-hover:text-accent-orange transition-colors">
                                {cleanTitle(post.title)}
                              </p>
                              <p className="text-xs text-white/50 font-montserrat leading-relaxed line-clamp-3">
                                {excerpt(post.content)}
                              </p>
                              <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/20">
                                <span className="text-[10px] text-white/30 font-montserrat truncate max-w-[150px]">
                                  {authorLabel(post)}
                                </span>
                                <span className="text-xs text-accent-orange font-montserrat font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                                  Ver más →
                                </span>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </>
              )
            })()}
          </>
        )}
      </div>
    </div>
  )
}

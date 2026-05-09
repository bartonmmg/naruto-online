'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, Search, Pin, Sparkles, Lightbulb, Eye, MessageCircle, Heart, LayoutGrid, CalendarDays } from 'lucide-react'
import Navbar from '@/components/Navbar'
import { useAuth } from '@/lib/hooks/useAuth'
import { useReadNews } from '@/lib/hooks/useReadNews'
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
  views?: number
  reactions?: Record<string, number>
  _count?: { comments: number }
}

// Static tabs in user-preferred order
const TABS = [
  { key: 'Todas',                value: null },
  { key: 'Ninjas',               value: 'Ninjas' },
  { key: 'Animales',             value: 'Espíritus Animales' },
  { key: 'Modas',                value: 'Modas' },
  { key: 'Eventos',              value: 'Eventos Semanales' },
] as const

type SortKey = 'recent' | 'popular' | 'commented'

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
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')   // markdown images → remove
    .replace(/^#{1,6}\s+/gm, '')            // headings
    .replace(/\*\*(.+?)\*\*/g, '$1')        // bold
    .replace(/\*(.+?)\*/g, '$1')            // italic
    .replace(/__(.+?)__/g, '$1')            // bold alt
    .replace(/_(.+?)_/g, '$1')              // italic alt
    .replace(/~~(.+?)~~/g, '$1')            // strikethrough
    .replace(/`(.+?)`/g, '$1')              // inline code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links
    .replace(/^>\s+/gm, '')                 // blockquotes
    .replace(/^[-*+]\s+/gm, '')             // list bullets
    .replace(/\s+/g, ' ')                   // collapse whitespace
    .trim()
  return clean.length > max ? clean.slice(0, max) + '…' : clean
}

// Get hero image:
// - EVENT type uses a static banner (forum images are too noisy for cards)
// - Otherwise prefer post.imageUrls[0]
// - Fallback: first markdown image embedded in content
function heroImage(post: NewsPost): string | null {
  if (post.type === 'EVENT' || post.category === 'Eventos Semanales') {
    return '/images/novedades/eventos.png'
  }
  if (post.imageUrls?.[0]) return post.imageUrls[0]
  const m = post.content.match(/!\[[^\]]*\]\(([^)]+)\)/)
  return m ? m[1] : null
}

export default function NovedadesPage() {
  const router = useRouter()
  const { hasRole } = useAuth()
  const { isNew } = useReadNews()
  const [posts, setPosts]       = useState<NewsPost[]>([])
  const [loading, setLoading]   = useState(true)
  const [activeTab, setActiveTab] = useState<string>('Todas')
  const [sortBy, setSortBy]       = useState<SortKey>('recent')
  const [view, setView]           = useState<'grid' | 'timeline'>('grid')
  const [search, setSearch]       = useState('')

  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    api.get('/news?limit=100')
      .then(r => setPosts(r.data.items))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  // Keyboard shortcuts: 1-5 → tabs, / → focus search, Esc → clear search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      const inField = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)

      if (e.key === '/' && !inField) {
        e.preventDefault()
        searchRef.current?.focus()
        return
      }
      if (e.key === 'Escape' && target === searchRef.current) {
        setSearch('')
        searchRef.current?.blur()
        return
      }
      if (!inField && /^[1-5]$/.test(e.key)) {
        const idx = Number(e.key) - 1
        if (TABS[idx]) setActiveTab(TABS[idx].key)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const reactionTotal = (p: NewsPost) =>
    p.reactions ? Object.values(p.reactions).reduce((a, b) => a + b, 0) : 0

  const popularityScore = (p: NewsPost) =>
    (p.views ?? 0) + reactionTotal(p) * 5 + (p._count?.comments ?? 0) * 10

  const filtered = useMemo(() => {
    const activeTabValue = TABS.find(t => t.key === activeTab)?.value ?? null
    let result = posts.filter(p => {
      if (activeTabValue && p.category !== activeTabValue) return false
      if (search && !p.title.toLowerCase().includes(search.toLowerCase()) &&
          !p.content.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })

    // Sort: pinned always first, then by selected criterion
    result = [...result].sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
      if (sortBy === 'popular')   return popularityScore(b) - popularityScore(a)
      if (sortBy === 'commented') return (b._count?.comments ?? 0) - (a._count?.comments ?? 0)
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    })

    return result
  }, [posts, activeTab, sortBy, search])

  return (
    <div className="min-h-screen bg-bg-primary">
      <Navbar />

      {/* Hero */}
      <div className="pt-28 pb-10 px-6 text-center border-b border-border/30">
        <h1 className="font-cinzel font-bold text-4xl text-text-primary mb-2">Novedades</h1>
        <p className="text-white/50 font-montserrat text-sm">Actualizaciones del servidor de China y próximos cambios</p>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-5">

        {/* Tabs principales — categorías */}
        <div className="flex gap-2 flex-wrap">
          {TABS.map(tab => {
            const tabPosts = tab.value
              ? posts.filter(p => p.category === tab.value)
              : posts
            const newInTab = tabPosts.filter(p => isNew(p.id, p.publishedAt)).length
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 h-8 rounded-full text-xs font-montserrat font-semibold transition-all border flex items-center gap-1.5 ${
                  activeTab === tab.key
                    ? 'bg-accent-orange/15 text-accent-orange border-accent-orange/30'
                    : 'text-white/40 border-border hover:text-white/70 hover:border-border/80'
                }`}
              >
                {tab.key}
                {newInTab > 0 && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-accent-orange text-bg-primary leading-none">
                    {newInTab}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Ordenamiento + búsqueda */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Sort */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase tracking-wider text-white/40 font-montserrat font-bold mr-1">Ordenar:</span>
            {[
              { v: 'recent',    label: 'Más recientes' },
              { v: 'popular',   label: 'Más populares' },
              { v: 'commented', label: 'Más comentadas' },
            ].map(s => (
              <button
                key={s.v}
                onClick={() => setSortBy(s.v as SortKey)}
                className={`px-3 h-7 rounded-lg text-xs font-montserrat font-semibold transition-all border ${
                  sortBy === s.v
                    ? 'bg-white/10 text-white border-white/20'
                    : 'text-white/30 border-border hover:text-white/60'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* View toggle — solo en Eventos */}
          {activeTab === 'Eventos' && (
            <div className="flex items-center gap-1 bg-bg-card border border-border rounded-lg p-0.5">
              <button
                onClick={() => setView('grid')}
                title="Vista en grilla"
                className={`flex items-center gap-1 px-2 h-6 rounded text-[10px] font-montserrat font-semibold transition-all ${
                  view === 'grid' ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white/60'
                }`}
              >
                <LayoutGrid className="w-3 h-3" /> Grilla
              </button>
              <button
                onClick={() => setView('timeline')}
                title="Vista cronológica"
                className={`flex items-center gap-1 px-2 h-6 rounded text-[10px] font-montserrat font-semibold transition-all ${
                  view === 'timeline' ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white/60'
                }`}
              >
                <CalendarDays className="w-3 h-3" /> Cronología
              </button>
            </div>
          )}

          {/* Búsqueda */}
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
            <input
              ref={searchRef}
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar... (presiona /)"
              className="w-full h-8 pl-9 pr-3 text-xs bg-bg-card border border-border rounded-lg text-white placeholder-white/25 focus:outline-none focus:border-accent-orange font-montserrat"
            />
          </div>

          {/* Sugerir — para todos los users logueados */}
          <Link
            href="/novedades/sugerir"
            className="flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-montserrat font-semibold bg-white/5 text-white/60 border border-border hover:text-white hover:bg-white/10 transition-all"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            Sugerir
          </Link>

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
          <div key={activeTab + sortBy + view} className="animate-in fade-in duration-300">
            {activeTab === 'Eventos' && view === 'timeline' ? (
              (() => {
                // Group by year-month
                const groups = new Map<string, NewsPost[]>()
                for (const p of filtered) {
                  const d = new Date(p.publishedAt)
                  const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
                  if (!groups.has(key)) groups.set(key, [])
                  groups.get(key)!.push(p)
                }
                const sortedKeys = [...groups.keys()].sort().reverse()
                const monthNames = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
                return (
                  <div className="space-y-8">
                    {sortedKeys.map(key => {
                      const [y, m] = key.split('-').map(Number)
                      const monthLabel = `${monthNames[m - 1]} ${y}`
                      return (
                        <div key={key}>
                          <div className="flex items-center gap-3 mb-4">
                            <CalendarDays className="w-4 h-4 text-accent-orange" />
                            <h2 className="font-cinzel font-bold text-base text-text-primary">{monthLabel}</h2>
                            <span className="text-xs text-white/30 font-montserrat">
                              {groups.get(key)!.length} {groups.get(key)!.length === 1 ? 'evento' : 'eventos'}
                            </span>
                            <div className="flex-1 h-px bg-border/30" />
                          </div>
                          <div className="space-y-2 pl-7 border-l-2 border-border/30 ml-1.5">
                            {groups.get(key)!.map(post => {
                              const tMeta = TYPE_META[post.type] ?? TYPE_META.GENERAL
                              const d = new Date(post.publishedAt)
                              return (
                                <div
                                  key={post.id}
                                  onClick={() => router.push(`/novedades/${post.id}`)}
                                  className="relative -ml-7 pl-7 cursor-pointer group"
                                >
                                  <span className="absolute left-0 top-3 w-3 h-3 rounded-full bg-accent-orange border-2 border-bg-primary group-hover:scale-125 transition-transform" />
                                  <div className="bg-bg-card border border-border/50 rounded-xl p-4 hover:border-accent-orange/40 hover:bg-bg-elevated/30 transition-all">
                                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                      <span className="text-[10px] font-montserrat font-bold text-white/40">
                                        {String(d.getDate()).padStart(2, '0')} {monthNames[d.getMonth()].slice(0, 3).toLowerCase()}
                                      </span>
                                      {post.pinned && <Pin className="w-3 h-3 text-accent-orange" />}
                                      {isNew(post.id, post.publishedAt) && (
                                        <span className="text-[9px] font-montserrat font-bold px-1.5 py-0.5 rounded-full bg-accent-orange text-bg-primary">
                                          NUEVO
                                        </span>
                                      )}
                                    </div>
                                    <p className="font-cinzel font-bold text-sm text-text-primary line-clamp-1 group-hover:text-accent-orange transition-colors">
                                      {cleanTitle(post.title)}
                                    </p>
                                    <p className="text-xs text-white/50 font-montserrat line-clamp-1 mt-1">
                                      {excerpt(post.content, 120)}
                                    </p>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              })()
            ) : (<>
            {/* Featured / Hero — el primer post (pinned o más reciente) */}
            {(() => {
              const hero = filtered[0]
              const rest = filtered.slice(1)
              const heroMeta = TYPE_META[hero.type] ?? TYPE_META.GENERAL
              return (
                <>
                  <div
                    onClick={() => router.push(`/novedades/${hero.id}`)}
                    className="relative bg-bg-card border-2 border-accent-orange/30 rounded-2xl overflow-hidden hover:border-accent-orange/60 transition-all cursor-pointer group shadow-lg shadow-accent-orange/5 hover:shadow-accent-orange/15 hover:-translate-y-0.5"
                  >
                    {(() => {
                      const hImg = heroImage(hero)
                      return hImg ? (
                        <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity">
                          <img src={hImg} alt="" loading="lazy" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-bg-card via-bg-card/95 to-transparent" />
                        </div>
                      ) : null
                    })()}
                    <div className="relative p-7 md:p-10">
                      <div className="flex items-center gap-2 mb-4 flex-wrap">
                        {hero.pinned && (
                          <span className="text-[10px] font-montserrat font-bold px-2 py-0.5 rounded-full border bg-accent-orange/15 text-accent-orange border-accent-orange/30 flex items-center gap-1">
                            <Pin className="w-2.5 h-2.5" /> DESTACADA
                          </span>
                        )}
                        {isNew(hero.id, hero.publishedAt) && (
                          <span className="text-[10px] font-montserrat font-bold px-2 py-0.5 rounded-full bg-accent-orange text-bg-primary flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" /> NUEVO
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
                            className={`bg-bg-card border rounded-2xl overflow-hidden transition-all cursor-pointer group hover:-translate-y-0.5 ${
                              post.pinned
                                ? 'border-accent-orange/30 hover:border-accent-orange/60'
                                : 'border-border/50 hover:border-border/80 hover:bg-bg-elevated/30'
                            }`}
                          >
                            {(() => {
                              const img = heroImage(post)
                              return img ? (
                                <div className="overflow-hidden">
                                  <img src={img} alt={post.title} loading="lazy" className="w-full h-40 object-cover transition-transform duration-500 group-hover:scale-105" />
                                </div>
                              ) : null
                            })()}
                            <div className="p-5">
                              <div className="flex items-center gap-2 mb-3 flex-wrap">
                                {post.pinned && <Pin className="w-3 h-3 text-accent-orange" />}
                                {isNew(post.id, post.publishedAt) && (
                                  <span className="text-[10px] font-montserrat font-bold px-2 py-0.5 rounded-full bg-accent-orange text-bg-primary flex items-center gap-1">
                                    <Sparkles className="w-2.5 h-2.5" /> NUEVO
                                  </span>
                                )}
                                <span className={`text-[10px] font-montserrat font-bold px-2 py-0.5 rounded-full border ${meta.bg} ${meta.color} ${meta.border}`}>
                                  {meta.icon} {meta.label}
                                </span>
                                <span className="ml-auto text-[10px] text-white/30 font-montserrat">{timeAgo(post.publishedAt)}</span>
                              </div>
                              <p className="font-cinzel font-bold text-sm text-text-primary mb-2 line-clamp-2 group-hover:text-accent-orange transition-colors">
                                {cleanTitle(post.title)}
                              </p>
                              <p className="text-xs text-white/50 font-montserrat leading-relaxed line-clamp-3">
                                {excerpt(post.content)}
                              </p>
                              <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/20 gap-2">
                                <span className="text-[10px] text-white/30 font-montserrat truncate max-w-[120px]">
                                  {authorLabel(post)}
                                </span>
                                <div className="flex items-center gap-2 text-[10px] text-white/30 font-montserrat">
                                  {(post.views ?? 0) > 0 && (
                                    <span className="flex items-center gap-0.5" title={`${post.views} ${post.views === 1 ? 'vista' : 'vistas'}`}>
                                      <Eye className="w-2.5 h-2.5" /> {post.views}
                                    </span>
                                  )}
                                  {reactionTotal(post) > 0 && (
                                    <span className="flex items-center gap-0.5" title={`${reactionTotal(post)} ${reactionTotal(post) === 1 ? 'persona reaccionó' : 'personas reaccionaron'}`}>
                                      <Heart className="w-2.5 h-2.5" /> {reactionTotal(post)}
                                    </span>
                                  )}
                                  {(post._count?.comments ?? 0) > 0 && (
                                    <span className="flex items-center gap-0.5" title={`${post._count?.comments} ${post._count?.comments === 1 ? 'comentario' : 'comentarios'}`}>
                                      <MessageCircle className="w-2.5 h-2.5" /> {post._count?.comments}
                                    </span>
                                  )}
                                </div>
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
            </>)}
          </div>
        )}
      </div>
    </div>
  )
}

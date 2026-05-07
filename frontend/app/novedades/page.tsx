'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, Search, RefreshCw, Loader2 } from 'lucide-react'
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
  publishedAt: string
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
  const clean = content.replace(/\n/g, ' ').trim()
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
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-accent-orange" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-white/30 font-montserrat text-sm">
            No hay novedades en esta categoría todavía
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map(post => {
              const meta = TYPE_META[post.type] ?? TYPE_META.GENERAL
              return (
                <div
                  key={post.id}
                  onClick={() => router.push(`/novedades/${post.id}`)}
                  className="bg-bg-card border border-border/50 rounded-2xl overflow-hidden hover:border-border/80 hover:bg-bg-elevated/30 transition-all cursor-pointer group"
                >
                  {/* Imagen si tiene */}
                  {post.imageUrls[0] && (
                    <img
                      src={post.imageUrls[0]}
                      alt={post.title}
                      className="w-full h-40 object-cover"
                    />
                  )}

                  <div className="p-5">
                    {/* Badges */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`text-[10px] font-montserrat font-bold px-2 py-0.5 rounded-full border ${meta.bg} ${meta.color} ${meta.border}`}>
                        {meta.icon} {meta.label}
                      </span>
                      <span className="text-[10px] text-white/30 font-montserrat">{post.category}</span>
                      <span className="ml-auto text-[10px] text-white/30 font-montserrat">{timeAgo(post.publishedAt)}</span>
                    </div>

                    {/* Título */}
                    <p className="font-cinzel font-bold text-sm text-text-primary mb-2 line-clamp-2 group-hover:text-accent-orange transition-colors">
                      {post.title}
                    </p>

                    {/* Excerpt */}
                    <p className="text-xs text-white/50 font-montserrat leading-relaxed line-clamp-3">
                      {excerpt(post.content)}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/20">
                      <span className="text-[10px] text-white/30 font-montserrat">
                        {post.author ? `@${post.author.username}` : 'Discord'}
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
      </div>
    </div>
  )
}

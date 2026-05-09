'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { ArrowRight, Pin, Sparkles, Bell, X } from 'lucide-react'
import { useReadNews } from '@/lib/hooks/useReadNews'
import api from '@/lib/api'

interface NewsPost {
  id: string
  title: string
  content: string
  type: string
  category: string
  imageUrls: string[]
  pinned: boolean
  publishedAt: string
}

const TYPE_META: Record<string, { label: string; color: string; bg: string; border: string; icon: string }> = {
  CHINA:     { label: 'China',     color: 'text-red-400',     bg: 'bg-red-400/10',     border: 'border-red-400/20',     icon: '🔴' },
  EVENT:     { label: 'Evento',    color: 'text-chakra-blue', bg: 'bg-chakra-blue/10', border: 'border-chakra-blue/20', icon: '📅' },
  TENTATIVE: { label: 'Tentativa', color: 'text-sage-gold',   bg: 'bg-sage-gold/10',   border: 'border-sage-gold/20',   icon: '⚡' },
  GENERAL:   { label: 'General',   color: 'text-white/50',    bg: 'bg-white/5',        border: 'border-white/10',       icon: '📢' },
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

function cleanTitle(s: string): string {
  return s
    .replace(/^#{1,6}\s+/g, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/_(.+?)_/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .trim()
}

function heroImage(post: NewsPost): string | null {
  if (post.type === 'EVENT' || post.category === 'Eventos Semanales') {
    return '/images/novedades/eventos.png'
  }
  if (post.imageUrls?.[0]) return post.imageUrls[0]
  const m = post.content.match(/!\[[^\]]*\]\(([^)]+)\)/)
  return m ? m[1] : null
}

export default function LatestNewsSection() {
  const [posts, setPosts] = useState<NewsPost[]>([])
  const [loading, setLoading] = useState(true)
  const [toastDismissed, setToastDismissed] = useState(false)
  const { isNew } = useReadNews()

  useEffect(() => {
    api.get('/news?limit=3')
      .then(r => setPosts(r.data.items ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
    // Toast auto-dismissed once per session
    if (typeof window !== 'undefined') {
      setToastDismissed(sessionStorage.getItem('home-news-toast-dismissed') === '1')
    }
  }, [])

  const newCount = useMemo(
    () => posts.filter(p => isNew(p.id, p.publishedAt)).length,
    [posts, isNew],
  )

  const dismissToast = () => {
    setToastDismissed(true)
    try { sessionStorage.setItem('home-news-toast-dismissed', '1') } catch {}
  }

  if (!loading && posts.length === 0) return null

  return (
    <>
      {/* Floating toast — bottom-right */}
      {newCount > 0 && !toastDismissed && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm bg-bg-card border border-accent-orange/40 rounded-2xl shadow-2xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-3">
          <div className="w-10 h-10 rounded-xl bg-accent-orange/15 flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5 text-accent-orange" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-cinzel font-bold text-sm text-text-primary mb-0.5">
              {newCount === 1 ? '¡Hay una novedad nueva!' : `¡Hay ${newCount} novedades nuevas!`}
            </p>
            <Link
              href="/novedades"
              onClick={dismissToast}
              className="text-xs text-accent-orange font-montserrat font-semibold hover:underline"
            >
              Ver ahora →
            </Link>
          </div>
          <button
            onClick={dismissToast}
            className="text-white/30 hover:text-white/70"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

    <section className="relative py-16 px-6 md:px-12 z-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-cinzel font-bold text-2xl md:text-3xl text-text-primary">Últimas novedades</h2>
            <p className="text-white/40 font-montserrat text-sm mt-1">Lo más reciente del servidor de China y eventos</p>
          </div>
          <Link
            href="/novedades"
            className="hidden md:flex items-center gap-1.5 text-sm text-accent-orange font-montserrat font-semibold hover:gap-2.5 transition-all"
          >
            Ver todas <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-64 bg-bg-card border border-border/50 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {posts.map(post => {
              const meta = TYPE_META[post.type] ?? TYPE_META.GENERAL
              const img = heroImage(post)
              return (
                <Link
                  key={post.id}
                  href={`/novedades/${post.id}`}
                  className="bg-bg-card border border-border/50 rounded-2xl overflow-hidden hover:border-border/80 hover:bg-bg-elevated/30 transition-all group"
                >
                  {img && <img src={img} alt="" loading="lazy" className="w-full h-40 object-cover" />}
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
                    <p className="font-cinzel font-bold text-sm text-text-primary line-clamp-2 group-hover:text-accent-orange transition-colors">
                      {cleanTitle(post.title)}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        <div className="md:hidden mt-6 text-center">
          <Link
            href="/novedades"
            className="inline-flex items-center gap-1.5 text-sm text-accent-orange font-montserrat font-semibold"
          >
            Ver todas las novedades <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
    </>
  )
}

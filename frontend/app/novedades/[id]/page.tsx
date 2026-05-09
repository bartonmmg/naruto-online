'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ChevronLeft, Pencil, Trash2, Loader2, Calendar, User, Pin, PinOff, X } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Navbar from '@/components/Navbar'
import ShareButtons from '@/components/ShareButtons'
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
  reactions?: Record<string, number>
  publishedAt: string
}

const REACTION_EMOJIS = ['👍', '❤️', '🔥'] as const

// Convert Discord-specific syntax to markdown:
//   <@123>  → @user
//   <#456>  → #channel
//   <:name:id> → :name:
//   <a:name:id> → :name: (animated)
//   bare URLs → markdown links
function normalizeDiscordContent(content: string): string {
  return content
    .replace(/<@!?(\d+)>/g, '@usuario')
    .replace(/<#(\d+)>/g, '#canal')
    .replace(/<a?:(\w+):\d+>/g, ':$1:')
    .replace(/(?<![\(\[])(https?:\/\/[^\s<>\)]+)/g, '[$1]($1)')
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

function slugify(s: string): string {
  return s.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

interface TocItem { level: number; text: string; id: string }

function extractToc(content: string): TocItem[] {
  const items: TocItem[] = []
  const re = /^(#{1,3})\s+(.+)$/gm
  let m
  while ((m = re.exec(content)) !== null) {
    const text = cleanTitle(m[2])
    if (!text) continue
    items.push({ level: m[1].length, text, id: slugify(text) })
  }
  return items
}

const TYPE_META: Record<string, { label: string; color: string; bg: string; border: string; icon: string }> = {
  CHINA:     { label: 'China',     color: 'text-red-400',     bg: 'bg-red-400/10',     border: 'border-red-400/20',     icon: '🔴' },
  EVENT:     { label: 'Evento',    color: 'text-chakra-blue', bg: 'bg-chakra-blue/10', border: 'border-chakra-blue/20', icon: '📅' },
  TENTATIVE: { label: 'Tentativa', color: 'text-sage-gold',   bg: 'bg-sage-gold/10',   border: 'border-sage-gold/20',   icon: '⚡' },
  GENERAL:   { label: 'General',   color: 'text-white/50',    bg: 'bg-white/5',         border: 'border-white/10',       icon: '📢' },
}

export default function NovedadDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router  = useRouter()
  const { hasRole } = useAuth()
  const { markRead } = useReadNews()
  const [post, setPost]       = useState<NewsPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [pinning, setPinning] = useState(false)
  const [lightbox, setLightbox] = useState<string | null>(null)
  const [related, setRelated]   = useState<NewsPost[]>([])
  const [myReactions, setMyReactions] = useState<Set<string>>(new Set())

  // Load my saved reactions from localStorage on mount
  useEffect(() => {
    if (!id) return
    try {
      const raw = localStorage.getItem(`news-reactions:${id}`)
      if (raw) setMyReactions(new Set(JSON.parse(raw)))
    } catch {}
  }, [id])

  const handleReact = async (emoji: string) => {
    if (!post) return
    const already = myReactions.has(emoji)
    const delta = already ? -1 : 1
    try {
      const r = await api.post(`/news/${post.id}/react`, { emoji, delta })
      setPost({ ...post, reactions: r.data.reactions })
      const next = new Set(myReactions)
      if (already) next.delete(emoji)
      else next.add(emoji)
      setMyReactions(next)
      try { localStorage.setItem(`news-reactions:${post.id}`, JSON.stringify(Array.from(next))) } catch {}
    } catch {}
  }

  // Close lightbox with ESC
  useEffect(() => {
    if (!lightbox) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setLightbox(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox])

  useEffect(() => {
    api.get(`/news/${id}`)
      .then(r => { setPost(r.data); markRead(id) })
      .catch(() => router.replace('/novedades'))
      .finally(() => setLoading(false))
    api.get(`/news/${id}/related`)
      .then(r => setRelated(r.data.items ?? []))
      .catch(() => {})
  }, [id])

  const handleDelete = async () => {
    if (!confirm('¿Eliminar esta novedad?')) return
    setDeleting(true)
    try {
      await api.delete(`/news/${id}`)
      router.replace('/novedades')
    } catch { setDeleting(false) }
  }

  const handleTogglePin = async () => {
    if (!post) return
    setPinning(true)
    try {
      const r = await api.put(`/news/${id}/pin`, { pinned: !post.pinned })
      setPost(r.data)
    } catch { /* ignore */ } finally {
      setPinning(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-accent-orange" />
    </div>
  )

  if (!post) return null

  const meta = TYPE_META[post.type] ?? TYPE_META.GENERAL
  const toc  = extractToc(post.content)
  const showToc = toc.length >= 3

  return (
    <div className="min-h-screen bg-bg-primary">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 pt-28 pb-16">

        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 font-montserrat mb-8 transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Volver a Novedades
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className={`text-xs font-montserrat font-bold px-3 py-1 rounded-full border ${meta.bg} ${meta.color} ${meta.border}`}>
              {meta.icon} {meta.label}
            </span>
            <span className="text-xs text-white/40 font-montserrat bg-white/5 border border-border px-3 py-1 rounded-full">
              {post.category}
            </span>
            <div className="ml-auto flex items-center gap-3">
              <span className="flex items-center gap-1 text-xs text-white/30 font-montserrat">
                <Calendar className="w-3 h-3" />
                {new Date(post.publishedAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}
              </span>
              <span className="flex items-center gap-1 text-xs text-white/30 font-montserrat">
                <User className="w-3 h-3" />
                {authorLabel(post)}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 mb-4">
            <h1 className="font-cinzel font-bold text-2xl text-text-primary flex-1">{cleanTitle(post.title)}</h1>
            {post.pinned && (
              <span className="text-[10px] font-montserrat font-bold px-2 py-0.5 rounded-full border bg-accent-orange/15 text-accent-orange border-accent-orange/30 flex items-center gap-1 mt-2 shrink-0">
                <Pin className="w-2.5 h-2.5" /> DESTACADA
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <ShareButtons title={cleanTitle(post.title)} url={typeof window !== 'undefined' ? window.location.href : ''} />

            {hasRole(['ADMIN', 'MODERATOR']) && (
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={handleTogglePin}
                  disabled={pinning}
                  className={`flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-montserrat font-semibold border transition-all disabled:opacity-40 ${
                    post.pinned
                      ? 'bg-accent-orange/15 text-accent-orange border-accent-orange/30 hover:bg-accent-orange/25'
                      : 'bg-white/5 text-white/50 border-border hover:text-white/80'
                  }`}
                >
                  {pinning ? <Loader2 className="w-3 h-3 animate-spin" /> : post.pinned ? <PinOff className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
                  {post.pinned ? 'Quitar destacada' : 'Destacar'}
                </button>
                <button
                  onClick={() => router.push(`/novedades/${id}/edit`)}
                  className="flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-montserrat font-semibold bg-white/5 text-white/50 border border-border hover:text-white/80 transition-all"
                >
                  <Pencil className="w-3 h-3" /> Editar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-montserrat font-semibold bg-red-400/10 text-red-400 border border-red-400/20 hover:bg-red-400/20 transition-all disabled:opacity-40"
                >
                  {deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                  Eliminar
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Images grid — only when content doesn't already embed them via markdown */}
        {post.imageUrls.length > 0 && !/!\[[^\]]*\]\([^)]+\)/.test(post.content) && (
          <div className={`grid gap-3 mb-6 ${post.imageUrls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {post.imageUrls.map((url, i) => (
              <img
                key={i}
                src={url}
                alt={`imagen ${i + 1}`}
                loading="lazy"
                onClick={() => setLightbox(url)}
                className="w-full rounded-xl object-cover max-h-80 cursor-zoom-in transition-opacity hover:opacity-90"
              />
            ))}
          </div>
        )}

        {/* TOC mobile */}
        {showToc && (
          <details className="lg:hidden mb-4 bg-bg-card border border-border/50 rounded-xl">
            <summary className="px-4 py-3 cursor-pointer text-sm font-montserrat font-semibold text-white/70 hover:text-white">
              📑 Tabla de contenido ({toc.length})
            </summary>
            <nav className="px-4 pb-4">
              <ul className="space-y-1.5 text-xs">
                {toc.map((it, i) => (
                  <li key={i} style={{ paddingLeft: (it.level - 1) * 12 }}>
                    <a href={`#${it.id}`} className="text-white/60 hover:text-accent-orange font-montserrat">{it.text}</a>
                  </li>
                ))}
              </ul>
            </nav>
          </details>
        )}

        <div className={showToc ? 'lg:grid lg:grid-cols-[1fr_220px] lg:gap-8' : ''}>
          {/* Content */}
          <div className="bg-bg-card border border-border/50 rounded-2xl p-6 min-w-0">
            <div className="news-markdown text-white/80 font-montserrat text-sm leading-relaxed">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  img: ({ src, alt }) => src ? (
                    <img
                      src={src}
                      alt={alt ?? ''}
                      loading="lazy"
                      onClick={() => setLightbox(src)}
                      className="cursor-zoom-in transition-opacity hover:opacity-90"
                    />
                  ) : null,
                  h1: ({ children }) => <h1 id={slugify(String(children))}>{children}</h1>,
                  h2: ({ children }) => <h2 id={slugify(String(children))}>{children}</h2>,
                  h3: ({ children }) => <h3 id={slugify(String(children))}>{children}</h3>,
                }}
              >
                {normalizeDiscordContent(post.content)}
              </ReactMarkdown>
            </div>
          </div>

          {/* TOC desktop */}
          {showToc && (
            <aside className="hidden lg:block">
              <div className="sticky top-24 bg-bg-card border border-border/50 rounded-xl p-4">
                <p className="text-[10px] uppercase tracking-wider text-white/40 font-montserrat font-bold mb-3">
                  En esta novedad
                </p>
                <nav>
                  <ul className="space-y-1.5 text-xs">
                    {toc.map((it, i) => (
                      <li key={i} style={{ paddingLeft: (it.level - 1) * 10 }}>
                        <a href={`#${it.id}`} className="text-white/60 hover:text-accent-orange font-montserrat block py-0.5 transition-colors">
                          {it.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            </aside>
          )}
        </div>

        {/* Reactions */}
        <div className="mt-6 flex items-center gap-2">
          <span className="text-xs text-white/40 font-montserrat mr-1">¿Te gustó?</span>
          {REACTION_EMOJIS.map(emoji => {
            const count = post.reactions?.[emoji] ?? 0
            const active = myReactions.has(emoji)
            return (
              <button
                key={emoji}
                onClick={() => handleReact(emoji)}
                className={`flex items-center gap-1.5 px-3 h-9 rounded-full text-sm font-montserrat font-semibold border transition-all ${
                  active
                    ? 'bg-accent-orange/15 border-accent-orange/40 text-accent-orange scale-105'
                    : 'bg-white/5 border-border text-white/70 hover:bg-white/10 hover:scale-105'
                }`}
              >
                <span className="text-base leading-none">{emoji}</span>
                {count > 0 && <span className="text-xs">{count}</span>}
              </button>
            )
          })}
        </div>

        {/* Related posts */}
        {related.length > 0 && (
          <div className="mt-10">
            <h3 className="font-cinzel font-bold text-base text-text-primary mb-4">
              Más en {post.category}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {related.map(rp => {
                const m = TYPE_META[rp.type] ?? TYPE_META.GENERAL
                return (
                  <button
                    key={rp.id}
                    onClick={() => router.push(`/novedades/${rp.id}`)}
                    className="text-left bg-bg-card border border-border/50 rounded-xl p-4 hover:border-border/80 hover:bg-bg-elevated/30 transition-all group"
                  >
                    <span className={`text-[10px] font-montserrat font-bold px-2 py-0.5 rounded-full border ${m.bg} ${m.color} ${m.border} inline-block mb-2`}>
                      {m.icon} {m.label}
                    </span>
                    <p className="font-montserrat font-semibold text-xs text-text-primary line-clamp-2 group-hover:text-accent-orange transition-colors">
                      {cleanTitle(rp.title)}
                    </p>
                    <p className="text-[10px] text-white/30 font-montserrat mt-2">
                      {new Date(rp.publishedAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
                    </p>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox modal */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
        >
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-all"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={lightbox}
            alt=""
            onClick={(e) => e.stopPropagation()}
            className="max-w-full max-h-full object-contain rounded-lg"
          />
        </div>
      )}
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ChevronLeft, Pencil, Trash2, Loader2, Calendar, User } from 'lucide-react'
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
  CHINA:     { label: 'China',     color: 'text-red-400',     bg: 'bg-red-400/10',     border: 'border-red-400/20',     icon: '🔴' },
  EVENT:     { label: 'Evento',    color: 'text-chakra-blue', bg: 'bg-chakra-blue/10', border: 'border-chakra-blue/20', icon: '📅' },
  TENTATIVE: { label: 'Tentativa', color: 'text-sage-gold',   bg: 'bg-sage-gold/10',   border: 'border-sage-gold/20',   icon: '⚡' },
  GENERAL:   { label: 'General',   color: 'text-white/50',    bg: 'bg-white/5',         border: 'border-white/10',       icon: '📢' },
}

export default function NovedadDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router  = useRouter()
  const { hasRole } = useAuth()
  const [post, setPost]       = useState<NewsPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    api.get(`/news/${id}`)
      .then(r => setPost(r.data))
      .catch(() => router.replace('/novedades'))
      .finally(() => setLoading(false))
  }, [id])

  const handleDelete = async () => {
    if (!confirm('¿Eliminar esta novedad?')) return
    setDeleting(true)
    try {
      await api.delete(`/news/${id}`)
      router.replace('/novedades')
    } catch { setDeleting(false) }
  }

  if (loading) return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-accent-orange" />
    </div>
  )

  if (!post) return null

  const meta = TYPE_META[post.type] ?? TYPE_META.GENERAL

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
                {post.author ? `@${post.author.username}` : 'Discord'}
              </span>
            </div>
          </div>

          <h1 className="font-cinzel font-bold text-2xl text-text-primary mb-4">{post.title}</h1>

          {/* Admin actions */}
          {hasRole(['ADMIN', 'MODERATOR']) && (
            <div className="flex gap-2">
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

        {/* Images */}
        {post.imageUrls.length > 0 && (
          <div className={`grid gap-3 mb-6 ${post.imageUrls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {post.imageUrls.map((url, i) => (
              <img key={i} src={url} alt={`imagen ${i + 1}`} className="w-full rounded-xl object-cover max-h-80" />
            ))}
          </div>
        )}

        {/* Content */}
        <div className="bg-bg-card border border-border/50 rounded-2xl p-6">
          <p className="text-white/80 font-montserrat text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
        </div>
      </div>
    </div>
  )
}

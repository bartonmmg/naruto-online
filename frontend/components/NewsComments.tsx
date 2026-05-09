'use client'

import { useEffect, useState } from 'react'
import { Loader2, MessageCircle, Trash2, Send } from 'lucide-react'
import api from '@/lib/api'
import { useAuth } from '@/lib/hooks/useAuth'

interface Comment {
  id: string
  content: string
  createdAt: string
  authorId: string
  author: { username: string; role: string }
}

interface Props {
  newsPostId: string
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'recién'
  if (m < 60) return `hace ${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `hace ${h}h`
  const d = Math.floor(h / 24)
  return `hace ${d}d`
}

function roleBadge(role: string): { label: string; cls: string } | null {
  if (role === 'ADMIN')      return { label: 'ADMIN',    cls: 'bg-power-red/15 text-power-red border-power-red/30' }
  if (role === 'MODERATOR')  return { label: 'MOD',      cls: 'bg-chakra-blue/15 text-chakra-blue border-chakra-blue/30' }
  return null
}

export default function NewsComments({ newsPostId }: Props) {
  const { user, hasRole } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading]   = useState(true)
  const [text, setText]         = useState('')
  const [posting, setPosting]   = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    api.get(`/news/${newsPostId}/comments`)
      .then(r => setComments(r.data.items ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [newsPostId])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const content = text.trim()
    if (!content) return
    setPosting(true)
    try {
      const r = await api.post(`/news/${newsPostId}/comments`, { content })
      setComments(prev => [...prev, r.data])
      setText('')
    } catch (e: any) {
      alert(e.response?.data?.error || 'Error al comentar')
    } finally {
      setPosting(false)
    }
  }

  const remove = async (commentId: string) => {
    if (!confirm('¿Eliminar este comentario?')) return
    setDeleting(commentId)
    try {
      await api.delete(`/news/${newsPostId}/comments/${commentId}`)
      setComments(prev => prev.filter(c => c.id !== commentId))
    } catch (e: any) {
      alert(e.response?.data?.error || 'Error al eliminar')
    } finally {
      setDeleting(null)
    }
  }

  const canDelete = (c: Comment) =>
    !!user && (c.authorId === user.id || hasRole(['ADMIN', 'MODERATOR']))

  return (
    <div className="mt-10">
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle className="w-4 h-4 text-accent-orange" />
        <h3 className="font-cinzel font-bold text-base text-text-primary">
          Comentarios {!loading && `(${comments.length})`}
        </h3>
      </div>

      {/* Form */}
      {user ? (
        <form onSubmit={submit} className="bg-bg-card border border-border/50 rounded-xl p-3 mb-4 flex gap-2">
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Escribí tu comentario..."
            maxLength={2000}
            className="flex-1 bg-transparent text-sm text-white/90 placeholder-white/30 font-montserrat focus:outline-none"
          />
          <button
            type="submit"
            disabled={!text.trim() || posting}
            className="flex items-center gap-1.5 px-3 h-9 rounded-lg text-xs font-montserrat font-semibold bg-accent-orange/15 text-accent-orange border border-accent-orange/30 hover:bg-accent-orange/25 transition-all disabled:opacity-40"
          >
            {posting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
            Enviar
          </button>
        </form>
      ) : (
        <div className="bg-bg-card border border-border/50 rounded-xl p-4 mb-4 text-center text-xs text-white/40 font-montserrat">
          Iniciá sesión para comentar
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-accent-orange" /></div>
      ) : comments.length === 0 ? (
        <p className="text-center py-6 text-white/30 font-montserrat text-sm">Sé el primero en comentar</p>
      ) : (
        <div className="space-y-3">
          {comments.map(c => {
            const badge = roleBadge(c.author?.role)
            return (
              <div key={c.id} className="bg-bg-card border border-border/40 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-montserrat font-semibold text-sm text-text-primary">
                    @{c.author?.username ?? 'usuario'}
                  </span>
                  {badge && (
                    <span className={`text-[9px] font-montserrat font-bold px-1.5 py-0.5 rounded border ${badge.cls}`}>
                      {badge.label}
                    </span>
                  )}
                  <span className="text-[10px] text-white/30 font-montserrat">{timeAgo(c.createdAt)}</span>
                  {canDelete(c) && (
                    <button
                      onClick={() => remove(c.id)}
                      disabled={deleting === c.id}
                      className="ml-auto w-6 h-6 flex items-center justify-center rounded text-white/20 hover:text-red-400 hover:bg-red-400/10 transition-all"
                      aria-label="Eliminar"
                    >
                      {deleting === c.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                    </button>
                  )}
                </div>
                <p className="text-sm text-white/80 font-montserrat whitespace-pre-wrap break-words">{c.content}</p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

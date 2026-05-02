'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Send, Loader2, Trash2 } from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'
import { GuideComment } from '@/lib/types'
import Button from '@/components/ui/Button'
import api from '@/lib/api'

interface GuideCommentsProps {
  guideId: string
}

export default function GuideComments({ guideId }: GuideCommentsProps) {
  const { user, isLoading: authLoading, hasRole } = useAuth()
  const [comments, setComments] = useState<GuideComment[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [content, setContent] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true)
      try {
        const response = await api.get(`/guides/${guideId}/comments`)
        setComments(response.data || [])
      } catch (error) {
        console.error('Error fetching comments:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchComments()
  }, [guideId])

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || !user) return

    setSubmitting(true)
    try {
      const response = await api.post(`/guides/${guideId}/comments`, { content })
      setComments([response.data, ...comments])
      setContent('')
    } catch (error: any) {
      console.error('Error submitting comment:', error)
      alert(error.response?.data?.error || 'Error al enviar comentario')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este comentario?')) return

    setDeleting(commentId)
    try {
      await api.delete(`/guides/${guideId}/comments/${commentId}`)
      setComments(comments.filter(c => c.id !== commentId))
    } catch (error: any) {
      console.error('Error deleting comment:', error)
      alert(error.response?.data?.error || 'Error al eliminar comentario')
    } finally {
      setDeleting(null)
    }
  }

  if (authLoading) {
    return null
  }

  return (
    <div className="p-6 bg-bg-card border border-border/50 rounded-lg">
      <h3 className="text-lg font-montserrat font-semibold text-text-primary mb-6">
        Comentarios ({comments.length})
      </h3>

      {!user ? (
        <div className="text-center py-8">
          <p className="text-white/70 mb-4">Debes estar logueado para comentar</p>
          <Link href="/auth/login">
            <Button size="sm">Entrar</Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmitComment} className="mb-8">
          <div className="mb-3">
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Escribe tu comentario..."
              maxLength={1000}
              rows={3}
              className="w-full px-4 py-3 bg-bg-primary border border-border rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-chakra-blue resize-none"
            />
            <div className="text-xs text-white/40 text-right mt-1">
              {content.length}/1000
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={submitting || !content.trim()}
              className="gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Comentar
                </>
              )}
            </Button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-8">
          <p className="text-white/50">Cargando comentarios...</p>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-white/50">Sin comentarios todavía. ¡Sé el primero!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map(comment => (
            <div key={comment.id} className="pb-4 border-b border-border/30 last:border-b-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <p className="font-montserrat font-semibold text-white">
                    {comment.author.username}
                  </p>
                  <p className="text-xs text-white/40">
                    {new Date(comment.createdAt).toLocaleDateString('es-ES')} a las{' '}
                    {new Date(comment.createdAt).toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>

                {hasRole(['ADMIN', 'MODERATOR']) && (
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    disabled={deleting === comment.id}
                    className="p-1.5 hover:bg-power-red/20 rounded transition-colors disabled:opacity-50"
                    title="Eliminar comentario (solo moderadores)"
                  >
                    {deleting === comment.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-power-red" />
                    ) : (
                      <Trash2 className="w-4 h-4 text-power-red/70 hover:text-power-red" />
                    )}
                  </button>
                )}
              </div>

              <p className="text-sm text-white/80 leading-relaxed">{comment.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

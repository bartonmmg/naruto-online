'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ChevronLeft, Loader2, AlertCircle, Image as ImageIcon, Play, Edit2, Clock, Trash2 } from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'
import { Guide, CATEGORY_LABELS, DIFFICULTY_LABELS } from '@/lib/types'
import { MarkdownRenderer } from '@/components/guides/MarkdownRenderer'
import Navbar from '@/components/Navbar'
import Button from '@/components/ui/Button'
import api from '@/lib/api'

interface EditHistory {
  id: string
  editedAt: string
  editedBy: string
}

export default function GuideDetailPage() {
  const params = useParams()
  const id = params?.id as string
  const { user, hasRole } = useAuth()

  const [guide, setGuide] = useState<Guide | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [editHistory, setEditHistory] = useState<EditHistory[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (!id) return

    const fetchGuide = async () => {
      try {
        const response = await api.get(`/guides/${id}`)
        setGuide(response.data)

        // Fetch edit history
        try {
          const historyResponse = await api.get(`/guides/${id}/history`)
          setEditHistory(historyResponse.data || [])
        } catch {
          // Si no existe el historial, simplemente continúa
          setEditHistory([])
        }
      } catch (err: any) {
        setError('Guía no encontrada o sin permiso para verla')
      } finally {
        setLoading(false)
      }
    }

    fetchGuide()
  }, [id])

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'BASICO':
        return 'bg-nature-green/20 text-nature-green border-nature-green/30'
      case 'INTERMEDIO':
        return 'bg-sage-gold/20 text-sage-gold border-sage-gold/30'
      case 'AVANZADO':
        return 'bg-power-red/20 text-power-red border-power-red/30'
      default:
        return 'bg-white/10 text-white/70 border-white/20'
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta guía?')) return

    setIsDeleting(true)
    try {
      await api.delete(`/guides/${id}`)
      // Redirigir a /guides después de eliminar
      window.location.href = '/guides'
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al eliminar la guía')
      setIsDeleting(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-bg-primary flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent-orange" />
      </main>
    )
  }

  if (error || !guide) {
    return (
      <main className="min-h-screen bg-bg-primary overflow-x-hidden">
        <Navbar />
        <section className="relative py-20 px-6">
          <div className="max-w-4xl mx-auto relative z-10">
            <Link href="/guides" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white/90 transition-colors mb-8">
              <ChevronLeft className="w-4 h-4" />
              Volver a Guías
            </Link>
            <div className="p-6 bg-power-red/20 border border-power-red/30 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-power-red mt-0.5 flex-shrink-0" />
              <p className="text-power-red">{error}</p>
            </div>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-bg-primary overflow-x-hidden">
      <Navbar />

      <section className="relative py-10 px-6 border-b border-border/50">
        <div className="max-w-4xl mx-auto relative z-10">
          <Link href="/guides" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white/90 transition-colors mb-6">
            <ChevronLeft className="w-4 h-4" />
            Volver a Guías
          </Link>

          <div className="mb-6">
            <h1 className="text-4xl md:text-5xl font-cinzel font-black text-text-primary mb-4">
              {guide.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-white/70">
              <span className="text-sm">Por <span className="text-white font-semibold">{guide.author.username}</span></span>
              <span className="text-white/40">•</span>
              <span className="text-sm">{CATEGORY_LABELS[guide.category] || guide.category}</span>
              <span className="text-white/40">•</span>
              <span className={`text-xs font-cinzel px-3 py-1 rounded-full border ${getDifficultyColor(guide.difficulty)}`}>
                {DIFFICULTY_LABELS[guide.difficulty] || guide.difficulty}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-12 px-6">
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="mb-12">
            <MarkdownRenderer content={guide.content} />
          </div>

          {guide.imageUrls && guide.imageUrls.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-cinzel font-bold text-text-primary mb-6 flex items-center gap-2">
                <ImageIcon className="w-6 h-6" />
                Imágenes
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {guide.imageUrls.map((url, idx) => (
                  <div key={idx} className="relative group rounded-lg overflow-hidden border border-border/50 hover:border-chakra-blue/50 transition-all">
                    <img
                      src={url}
                      alt={`Imagen ${idx + 1}`}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={e => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23333" width="100" height="100"/%3E%3Ctext x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23999" font-size="12"%3EImagen no disponible%3C/text%3E%3C/svg%3E'
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {guide.videoUrls && guide.videoUrls.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-cinzel font-bold text-text-primary mb-6 flex items-center gap-2">
                <Play className="w-6 h-6" />
                Videos
              </h2>
              <div className="space-y-4">
                {guide.videoUrls.map((url, idx) => {
                  const videoId = url.includes('youtube.com')
                    ? url.split('v=')[1]?.split('&')[0]
                    : url.includes('youtu.be')
                    ? url.split('/').pop()
                    : null

                  if (!videoId) return <div key={idx} className="text-white/50 text-sm">URL inválida: {url}</div>

                  return (
                    <div key={idx} className="aspect-video rounded-lg overflow-hidden border border-border/50 hover:border-chakra-blue/50 transition-colors">
                      <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${videoId}`}
                        title={`Video ${idx + 1}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div className="pt-8 border-t border-border/50">
            <div className="flex items-center justify-between">
              <div className="text-white/60 text-sm">
                <p>Última actualización: {new Date(guide.updatedAt).toLocaleDateString('es-ES')} a las {new Date(guide.updatedAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              <div className="flex gap-3">
                {(hasRole(['ADMIN', 'MODERATOR']) || user?.id === guide.authorId) && (
                  <>
                    <Button
                      onClick={() => setShowHistory(!showHistory)}
                      variant="ghost"
                      className="gap-2"
                    >
                      <Clock className="w-4 h-4" />
                      Historial
                    </Button>
                    <Link href={`/guides/${id}/edit`}>
                      <Button className="gap-2">
                        <Edit2 className="w-4 h-4" />
                        Editar
                      </Button>
                    </Link>
                  </>
                )}
                {hasRole(['ADMIN']) && (
                  <Button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="gap-2 bg-power-red/20 text-power-red hover:bg-power-red/30 disabled:opacity-50"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Eliminando...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        Eliminar
                      </>
                    )}
                  </Button>
                )}
                <Link href="/guides">
                  <Button variant="ghost">Volver a Guías</Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Edit History */}
          {showHistory && editHistory.length > 0 && (
            <div className="mt-8 p-6 bg-bg-card border border-border/50 rounded-lg">
              <h3 className="text-lg font-cinzel font-bold text-text-primary mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Historial de Ediciones
              </h3>
              <div className="space-y-3">
                {editHistory.map((edit, idx) => (
                  <div key={edit.id} className="flex items-center gap-4 pb-3 border-b border-border/30 last:border-b-0">
                    <div className="w-8 h-8 rounded-full bg-chakra-blue/20 flex items-center justify-center text-xs font-bold text-chakra-blue">
                      {editHistory.length - idx}
                    </div>
                    <div className="flex-1">
                      <p className="text-white/70 text-sm">{edit.editedBy}</p>
                      <p className="text-white/40 text-xs">{new Date(edit.editedAt).toLocaleDateString('es-ES')} a las {new Date(edit.editedAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {showHistory && editHistory.length === 0 && (
            <div className="mt-8 p-6 bg-bg-card border border-border/50 rounded-lg text-center">
              <p className="text-white/60 text-sm">Sin historial de ediciones</p>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

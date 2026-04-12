'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Loader2, AlertCircle } from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'
import { Guide, CATEGORY_LABELS, DIFFICULTY_LABELS } from '@/lib/types'
import { MarkdownEditor } from '@/components/guides/MarkdownEditor'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Navbar from '@/components/Navbar'
import api from '@/lib/api'

export default function EditGuidePage() {
  const router = useRouter()
  const params = useParams()
  const guideId = params?.id as string
  const { user, hasRole, isLoading } = useAuth()

  const [guide, setGuide] = useState<Guide | null>(null)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('BUILDS')
  const [difficulty, setDifficulty] = useState('BASICO')
  const [content, setContent] = useState('')
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [imageInput, setImageInput] = useState('')
  const [videoUrls, setVideoUrls] = useState<string[]>([])
  const [videoInput, setVideoInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [pageLoading, setPageLoading] = useState(true)

  // Auth guard y fetch guide
  useEffect(() => {
    if (isLoading) return

    const fetchGuide = async () => {
      try {
        const response = await api.get(`/guides/${guideId}`)
        const g: Guide = response.data

        // Check authorization: only author, admin, or moderator can edit
        const isAdmin = user?.role === 'ADMIN'
        const isModerator = user?.role === 'MODERATOR'
        const isAuthor = g.authorId === user?.id

        if (!isAdmin && !isModerator && !isAuthor) {
          router.replace('/guides')
          return
        }

        setGuide(g)
        setTitle(g.title)
        setCategory(g.category)
        setDifficulty(g.difficulty)
        setContent(g.content)
        setImageUrls(g.imageUrls || [])
        setVideoUrls(g.videoUrls || [])
        setPageLoading(false)
      } catch {
        router.replace('/guides')
      }
    }

    fetchGuide()
  }, [isLoading, guideId, user?.id, user?.role, router])

  const addImageUrl = () => {
    if (imageInput.trim() && !imageUrls.includes(imageInput.trim())) {
      setImageUrls([...imageUrls, imageInput.trim()])
      setImageInput('')
    }
  }

  const removeImageUrl = (url: string) => {
    setImageUrls(imageUrls.filter(u => u !== url))
  }

  const addVideoUrl = () => {
    if (videoInput.trim() && !videoUrls.includes(videoInput.trim())) {
      setVideoUrls([...videoUrls, videoInput.trim()])
      setVideoInput('')
    }
  }

  const removeVideoUrl = (url: string) => {
    setVideoUrls(videoUrls.filter(u => u !== url))
  }

  const handleSubmit = async () => {
    setError('')
    setFieldErrors({})

    // Validación local
    const errors: Record<string, string> = {}

    if (!title.trim()) {
      errors.title = 'El título es requerido'
    } else if (title.length < 5) {
      errors.title = 'El título debe tener al menos 5 caracteres'
    } else if (title.length > 100) {
      errors.title = 'El título no puede exceder 100 caracteres'
    }

    if (!category || category === '') {
      errors.category = 'Debes seleccionar una categoría'
    }

    if (!difficulty || difficulty === '') {
      errors.difficulty = 'Debes seleccionar una dificultad'
    }

    if (!content.trim()) {
      errors.content = 'El contenido es requerido'
    } else if (content.length < 20) {
      errors.content = 'El contenido debe tener al menos 20 caracteres'
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setIsSubmitting(true)

    try {
      await api.put(`/guides/${guideId}`, {
        title,
        category,
        difficulty,
        content,
        imageUrls,
        videoUrls,
      })

      router.push(`/guides/${guideId}`)
    } catch (err: any) {
      if (err.response?.data?.details) {
        const details = err.response.data.details
        const newErrors: Record<string, string> = {}
        details.forEach((detail: any) => {
          newErrors[detail.path?.[0] || 'general'] = detail.message
        })
        setFieldErrors(newErrors)
      }
      setError(err.response?.data?.error || 'Error al actualizar la guía. Verifica los campos.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading || pageLoading) {
    return <div className="min-h-screen bg-bg-primary flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-accent-orange" />
    </div>
  }

  if (!guide) {
    return null
  }

  return (
    <main className="min-h-screen bg-bg-primary overflow-x-hidden" style={{
      backgroundImage: 'url(/images/bg/guias.png), linear-gradient(rgba(0, 128, 255, 0.03) 1px, transparent 1px)',
      backgroundPosition: 'center, 0',
      backgroundSize: 'cover, 40px 40px',
    }}>
      <div className="fixed inset-0 bg-bg-primary/70 pointer-events-none z-0" />

      <Navbar />

      <section className="relative py-10 px-6 border-b border-border/50">
        <div className="max-w-6xl mx-auto relative z-10">
          <Link href={`/guides/${guideId}`} className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white/90 transition-colors mb-6">
            <ChevronLeft className="w-4 h-4" />
            Volver a la Guía
          </Link>

          <div>
            <p className="text-xs font-cinzel text-chakra-blue tracking-[0.2em] uppercase font-bold mb-2">
              Sistema de Contenido
            </p>
            <h1 className="text-4xl md:text-5xl font-cinzel font-black text-text-primary">
              Editar Guía
            </h1>
          </div>
        </div>
      </section>

      <section className="relative py-10 px-6">
        <div className="max-w-6xl mx-auto relative z-10">
          {error && (
            <div className="mb-6 p-4 bg-power-red/20 border border-power-red/30 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-power-red mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-power-red font-semibold">Error al crear la guía</p>
                <p className="text-power-red text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Metadata — Izquierda */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-montserrat font-semibold text-text-primary mb-2">
                  Título <span className="text-power-red">*</span>
                </label>
                <Input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Ej: Builds Óptimos para Genin"
                  maxLength={100}
                  className={fieldErrors.title ? 'border-power-red/50 focus:border-power-red' : ''}
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-white/40">{title.length}/100</p>
                  {fieldErrors.title && <p className="text-xs text-power-red">{fieldErrors.title}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-montserrat font-semibold text-text-primary mb-2">
                  Categoría <span className="text-power-red">*</span>
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className={`w-full px-4 py-2.5 bg-bg-card border rounded-lg text-text-primary focus:outline-none focus:border-chakra-blue transition-colors font-montserrat ${fieldErrors.category ? 'border-power-red/50 focus:border-power-red' : 'border-border'}`}
                >
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
                {fieldErrors.category && <p className="text-xs text-power-red mt-2">{fieldErrors.category}</p>}
              </div>

              <div>
                <label className="block text-sm font-montserrat font-semibold text-text-primary mb-2">
                  Dificultad <span className="text-power-red">*</span>
                </label>
                <select
                  value={difficulty}
                  onChange={e => setDifficulty(e.target.value)}
                  className={`w-full px-4 py-2.5 bg-bg-card border rounded-lg text-text-primary focus:outline-none focus:border-chakra-blue transition-colors font-montserrat ${fieldErrors.difficulty ? 'border-power-red/50 focus:border-power-red' : 'border-border'}`}
                >
                  {Object.entries(DIFFICULTY_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
                {fieldErrors.difficulty && <p className="text-xs text-power-red mt-2">{fieldErrors.difficulty}</p>}
              </div>

              <div className="border-t border-border pt-6">
                <label className="block text-sm font-montserrat font-semibold text-text-primary mb-3">
                  Imágenes <span className="text-white/50 font-normal">(opcional)</span>
                </label>
                <p className="text-xs text-white/50 mb-3">Agrega URLs de imágenes para complementar tu guía</p>
                <div className="flex gap-2 mb-3">
                  <Input
                    value={imageInput}
                    onChange={e => setImageInput(e.target.value)}
                    placeholder="https://ejemplo.com/imagen.jpg"
                    className="flex-1"
                  />
                  <Button onClick={addImageUrl} variant="outline" size="sm" className="flex-shrink-0">
                    Agregar
                  </Button>
                </div>
                {imageUrls.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {imageUrls.map(url => (
                      <div
                        key={url}
                        className="relative group rounded-lg overflow-hidden border border-border/50 hover:border-accent-orange/50 transition-colors bg-bg-card"
                      >
                        <img
                          src={url}
                          alt="preview"
                          className="w-full h-24 object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                          onError={e => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23333" width="100" height="100"/%3E%3Ctext x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23999" font-size="12"%3EImagen no disponible%3C/text%3E%3C/svg%3E'
                          }}
                        />
                        <button
                          onClick={() => removeImageUrl(url)}
                          className="absolute top-1 right-1 p-1 bg-power-red/80 hover:bg-power-red rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ✕
                        </button>
                        <p className="absolute bottom-0 left-0 right-0 bg-bg-primary/90 text-white/60 text-xs p-1 truncate">
                          {url.split('/').pop()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
                {imageUrls.length === 0 && (
                  <p className="text-xs text-white/40 italic">No hay imágenes agregadas</p>
                )}
              </div>

              <div className="border-t border-border pt-6">
                <label className="block text-sm font-montserrat font-semibold text-text-primary mb-3">
                  Videos YouTube <span className="text-white/50 font-normal">(opcional)</span>
                </label>
                <p className="text-xs text-white/50 mb-3">Inserta videos para enriquecer tu contenido</p>
                <div className="flex gap-2 mb-3">
                  <Input
                    value={videoInput}
                    onChange={e => setVideoInput(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="flex-1"
                  />
                  <Button onClick={addVideoUrl} variant="outline" size="sm" className="flex-shrink-0">
                    Agregar
                  </Button>
                </div>
                {videoUrls.length > 0 && (
                  <div className="space-y-2">
                    {videoUrls.map(url => (
                      <div
                        key={url}
                        className="flex items-center justify-between bg-bg-card p-2 rounded border border-border/50 hover:border-accent-orange/50 transition-colors group"
                      >
                        <span className="text-white/60 truncate flex-1 text-xs">{url}</span>
                        <button
                          onClick={() => removeVideoUrl(url)}
                          className="text-power-red hover:text-power-red/80 ml-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {videoUrls.length === 0 && (
                  <p className="text-xs text-white/40 italic">No hay videos agregados</p>
                )}
              </div>
            </div>

            {/* Editor — Derecha */}
            <div className="lg:col-span-2 flex flex-col h-screen">
              <label className="block text-sm font-montserrat font-semibold text-text-primary mb-2">
                Contenido <span className="text-power-red">*</span>
              </label>
              <div className="flex-1 min-h-0 overflow-hidden">
                <MarkdownEditor value={content} onChange={setContent} />
              </div>
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-white/40">Usa Markdown para dar formato al contenido</p>
                {fieldErrors.content && <p className="text-xs text-power-red">{fieldErrors.content}</p>}
                {!fieldErrors.content && <p className="text-xs text-white/40">{content.length} caracteres</p>}
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="mt-8 flex gap-3 justify-end">
            <Link href={`/guides/${guideId}`}>
              <Button variant="ghost">Cancelar</Button>
            </Link>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="disabled:opacity-50 disabled:cursor-not-allowed gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar Cambios'
              )}
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}

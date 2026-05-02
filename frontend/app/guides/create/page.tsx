'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Loader2, AlertCircle, Sparkles } from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'
import { CATEGORY_LABELS, DIFFICULTY_LABELS } from '@/lib/types'
import { GUIDE_TEMPLATES } from '@/lib/guideTemplates'
import { MarkdownEditor } from '@/components/guides/MarkdownEditor'
import { MarkdownPreview } from '@/components/guides/MarkdownPreview'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Navbar from '@/components/Navbar'
import api from '@/lib/api'

export default function CreateGuidePage() {
  const router = useRouter()
  const { user, hasRole, isLoading } = useAuth()

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('BUILDS')
  const [difficulty, setDifficulty] = useState('BASICO')
  const [content, setContent] = useState('')
  const [status, setStatus] = useState('DRAFT')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  // Auth guard
  useEffect(() => {
    if (!isLoading && !hasRole(['ADMIN', 'MODERATOR'])) {
      router.replace('/guides')
    }
  }, [isLoading, hasRole, router])


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
      await api.post('/guides', {
        title,
        category,
        difficulty,
        content,
        status,
      })

      router.push('/guides')
    } catch (err: any) {
      if (err.response?.data?.details) {
        const details = err.response.data.details
        const newErrors: Record<string, string> = {}
        details.forEach((detail: any) => {
          newErrors[detail.path?.[0] || 'general'] = detail.message
        })
        setFieldErrors(newErrors)
      }
      setError(err.response?.data?.error || 'Error al crear la guía. Verifica los campos.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <div className="min-h-screen bg-bg-primary flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-accent-orange" />
    </div>
  }

  if (!hasRole(['ADMIN', 'MODERATOR'])) {
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
          <Link href="/guides" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white/90 transition-colors mb-6">
            <ChevronLeft className="w-4 h-4" />
            Volver a Guías
          </Link>

          <div>
            <p className="text-xs font-cinzel text-chakra-blue tracking-[0.2em] uppercase font-bold mb-2">
              Sistema de Contenido
            </p>
            <h1 className="text-4xl md:text-5xl font-cinzel font-black text-text-primary">
              Nueva Guía
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

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Metadata — Izquierda */}
            <div className="space-y-6 lg:col-span-1">
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

              <div>
                <label className="block text-sm font-montserrat font-semibold text-text-primary mb-2">
                  Estado <span className="text-power-red">*</span>
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setStatus('DRAFT')}
                    className={`flex-1 px-4 py-2.5 rounded-lg font-montserrat transition-all ${
                      status === 'DRAFT'
                        ? 'bg-accent-orange text-white'
                        : 'bg-bg-card border border-border text-white/70 hover:border-accent-orange/50'
                    }`}
                  >
                    Borrador
                  </button>
                  <button
                    onClick={() => setStatus('PUBLISHED')}
                    className={`flex-1 px-4 py-2.5 rounded-lg font-montserrat transition-all ${
                      status === 'PUBLISHED'
                        ? 'bg-chakra-blue text-white'
                        : 'bg-bg-card border border-border text-white/70 hover:border-chakra-blue/50'
                    }`}
                  >
                    Publicada
                  </button>
                </div>
              </div>

              <div className="border-t border-border pt-6 space-y-6">
                <div>
                  <label className="block text-sm font-montserrat font-semibold text-text-primary mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Plantillas
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {GUIDE_TEMPLATES.map(template => (
                      <button
                        key={template.id}
                        onClick={() => {
                          setTitle(template.name)
                          setCategory(template.category)
                          setDifficulty(template.difficulty)
                          setContent(template.content)
                        }}
                        className="px-3 py-2.5 text-xs text-left font-montserrat rounded-lg bg-bg-elevated border border-border hover:border-chakra-blue/50 text-white/70 hover:text-white transition-all"
                      >
                        {template.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-montserrat font-semibold text-text-primary mb-3">
                    💡 Tip de Edición
                  </label>
                  <p className="text-xs text-white/70 leading-relaxed">
                    Usa los botones <strong>Imagen</strong> (🖼️) y <strong>Video YouTube</strong> (▶️) en la toolbar del editor para insertar contenido multimedia directamente en tu guía.
                  </p>
                </div>
              </div>
            </div>

            {/* Editor + Preview — Derecha (Side-by-side on desktop) */}
            <div className="lg:col-span-3 flex flex-col lg:flex-row lg:gap-6">
              {/* Editor */}
              <div className="flex flex-col flex-1 h-96 lg:h-[600px]">
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

              {/* Preview Split (Desktop only, side-by-side) */}
              <div className="hidden lg:flex flex-col flex-1 h-[600px]">
                <label className="block text-sm font-montserrat font-semibold text-text-primary mb-2">
                  Vista Previa
                </label>
                <div className="flex-1 min-h-0 overflow-hidden">
                  <MarkdownPreview content={content} />
                </div>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="mt-8 flex gap-3 justify-end">
            <Link href="/guides">
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
                  Publicando...
                </>
              ) : (
                'Publicar Guía'
              )}
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}

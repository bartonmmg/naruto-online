'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Loader2, AlertCircle, Sparkles } from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'
import { CATEGORY_LABELS, DIFFICULTY_LABELS } from '@/lib/types'
import { GUIDE_TEMPLATES } from '@/lib/guideTemplates'
import { MarkdownEditor } from '@/components/guides/MarkdownEditor'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Navbar from '@/components/Navbar'
import api from '@/lib/api'

export default function CreateGuidePage() {
  const router = useRouter()
  const { hasRole, isLoading } = useAuth()
  const templatesRef = useRef<HTMLDivElement>(null)

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('BUILDS')
  const [difficulty, setDifficulty] = useState('BASICO')
  const [content, setContent] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [showTemplates, setShowTemplates] = useState(false)

  useEffect(() => {
    if (!isLoading && !hasRole(['ADMIN', 'MODERATOR'])) {
      router.replace('/guides')
    }
  }, [isLoading, hasRole, router])

  // Close template dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (templatesRef.current && !templatesRef.current.contains(e.target as Node)) {
        setShowTemplates(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSubmit = async () => {
    setError('')
    setFieldErrors({})

    const errors: Record<string, string> = {}
    if (!title.trim()) errors.title = 'El título es requerido'
    else if (title.length < 5) errors.title = 'Al menos 5 caracteres'
    else if (title.length > 100) errors.title = 'Máximo 100 caracteres'
    if (!content.trim() || content.length < 20) errors.content = 'El contenido debe tener al menos 20 caracteres'

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setIsSubmitting(true)
    try {
      await api.post('/guides', { title, category, difficulty, content, status: 'PUBLISHED', coverImage: coverImage || null })
      router.push('/guides')
    } catch (err: any) {
      if (err.response?.data?.details) {
        const newErrors: Record<string, string> = {}
        err.response.data.details.forEach((d: any) => {
          newErrors[d.path?.[0] || 'general'] = d.message
        })
        setFieldErrors(newErrors)
      }
      setError(err.response?.data?.error || 'Error al crear la guía.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent-orange" />
      </div>
    )
  }
  if (!hasRole(['ADMIN', 'MODERATOR'])) return null

  return (
    // vh-screen layout: navbar + topbar + editor fill exactly the viewport, no scroll needed
    <div className="h-screen flex flex-col bg-bg-primary overflow-hidden" style={{
      backgroundImage: 'url(/images/bg/guias.png)',
      backgroundPosition: 'center',
      backgroundSize: 'cover',
    }}>
      <div className="fixed inset-0 bg-bg-primary/80 pointer-events-none z-0" />

      {/* ── Navbar (fixed, needs a spacer) ── */}
      <div className="flex-shrink-0 relative z-10">
        <Navbar />
      </div>

      {/* ── Top bar: back link + metadata fields ── */}
      <div className="flex-shrink-0 relative z-30 border-b border-border/50 bg-bg-primary/60 backdrop-blur-sm px-6 py-3 mt-20">
        <div className="max-w-7xl mx-auto">

          {/* Row 1: back + title */}
          <div className="flex items-center gap-4 mb-3">
            <Link
              href="/guides"
              className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white/90 transition-colors flex-shrink-0"
            >
              <ChevronLeft className="w-4 h-4" />
              Volver
            </Link>
            <div className="flex-1">
              <Input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Título de la guía"
                maxLength={100}
                className={`h-9 text-sm ${fieldErrors.title ? 'border-power-red/50' : ''}`}
              />
              {fieldErrors.title && <p className="text-xs text-power-red mt-0.5">{fieldErrors.title}</p>}
            </div>
          </div>

          {/* Row 2: category + difficulty + templates + publish */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-xs text-white/50 font-montserrat flex-shrink-0">Categoría</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="h-8 px-3 text-xs bg-bg-card border border-border rounded-lg text-text-primary focus:outline-none focus:border-chakra-blue font-montserrat"
              >
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs text-white/50 font-montserrat flex-shrink-0">Dificultad</label>
              <select
                value={difficulty}
                onChange={e => setDifficulty(e.target.value)}
                className="h-8 px-3 text-xs bg-bg-card border border-border rounded-lg text-text-primary focus:outline-none focus:border-chakra-blue font-montserrat"
              >
                {Object.entries(DIFFICULTY_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            {/* Cover image */}
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <label className="text-xs text-white/50 font-montserrat flex-shrink-0">Portada</label>
              <input
                type="url"
                value={coverImage}
                onChange={e => setCoverImage(e.target.value)}
                placeholder="URL de imagen de portada (opcional)"
                className="h-8 flex-1 px-3 text-xs bg-bg-card border border-border rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-chakra-blue font-montserrat"
              />
              {coverImage && (
                <img src={coverImage} alt="portada" className="w-8 h-8 rounded object-cover flex-shrink-0 border border-border" onError={e => (e.currentTarget.style.display = 'none')} />
              )}
            </div>

            {/* Templates dropdown — opens UPWARD to avoid covering editor */}
            <div ref={templatesRef} className="relative">
              <button
                onClick={() => setShowTemplates(s => !s)}
                className="h-8 px-3 flex items-center gap-1.5 rounded-lg font-montserrat text-xs bg-bg-card border border-border text-white/60 hover:border-chakra-blue/50 hover:text-white transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Plantilla
              </button>
              {showTemplates && (
                <div className="absolute top-full left-0 mt-1 w-52 bg-bg-elevated border border-border/60 rounded-xl shadow-2xl z-50 overflow-hidden">
                  {GUIDE_TEMPLATES.map(template => (
                    <button
                      key={template.id}
                      onClick={() => {
                        setTitle(template.name)
                        setCategory(template.category)
                        setDifficulty(template.difficulty)
                        setContent(template.content)
                        setShowTemplates(false)
                      }}
                      className="w-full px-4 py-2.5 text-xs text-left font-montserrat hover:bg-bg-card text-white/70 hover:text-white transition-colors border-b border-border/30 last:border-0"
                    >
                      {template.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="ml-auto flex items-center gap-3">
              {error && (
                <div className="flex items-center gap-2 text-power-red text-xs">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  {error}
                </div>
              )}
              {fieldErrors.content && (
                <p className="text-xs text-power-red">{fieldErrors.content}</p>
              )}
              <Link href="/guides">
                <Button variant="ghost" className="h-8 text-sm px-4">Cancelar</Button>
              </Link>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="h-8 text-sm px-5 disabled:opacity-50 gap-2"
              >
                {isSubmitting
                  ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Publicando...</>
                  : 'Publicar Guía'
                }
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Editor — fills ALL remaining height ── */}
      <div className="flex-1 relative z-0 min-h-0 flex flex-col px-6 py-3">
        <div className="max-w-7xl mx-auto w-full flex-1 min-h-0 flex flex-col">
          <MarkdownEditor value={content} onChange={setContent} />
        </div>
      </div>
    </div>
  )
}

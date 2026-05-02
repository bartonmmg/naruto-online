'use client'

import { useState, useEffect } from 'react'
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
  const { user, hasRole, isLoading } = useAuth()

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('BUILDS')
  const [difficulty, setDifficulty] = useState('BASICO')
  const [content, setContent] = useState('')
  const [status, setStatus] = useState('DRAFT')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [showTemplates, setShowTemplates] = useState(false)

  useEffect(() => {
    if (!isLoading && !hasRole(['ADMIN', 'MODERATOR'])) {
      router.replace('/guides')
    }
  }, [isLoading, hasRole, router])

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
      await api.post('/guides', { title, category, difficulty, content, status })
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
    return <div className="min-h-screen bg-bg-primary flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-accent-orange" />
    </div>
  }
  if (!hasRole(['ADMIN', 'MODERATOR'])) return null

  return (
    <main className="min-h-screen bg-bg-primary flex flex-col overflow-x-hidden" style={{
      backgroundImage: 'url(/images/bg/guias.png)',
      backgroundPosition: 'center',
      backgroundSize: 'cover',
    }}>
      <div className="fixed inset-0 bg-bg-primary/75 pointer-events-none z-0" />

      <Navbar />

      {/* ── Header ── */}
      <section className="relative py-6 px-6 border-b border-border/50 flex-shrink-0">
        <div className="max-w-7xl mx-auto relative z-10">
          <Link href="/guides" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white/90 transition-colors mb-3">
            <ChevronLeft className="w-4 h-4" />
            Volver a Guías
          </Link>
          <h1 className="text-3xl font-cinzel font-black text-text-primary">Nueva Guía</h1>
        </div>
      </section>

      {/* ── Metadata bar — horizontal ── */}
      <section className="relative px-6 py-4 border-b border-border/40 bg-bg-card/30 flex-shrink-0">
        <div className="max-w-7xl mx-auto relative z-10 flex flex-wrap gap-4 items-end">

          {/* Título */}
          <div className="flex-1 min-w-[220px]">
            <label className="block text-xs font-montserrat font-semibold text-white/60 mb-1.5">
              Título <span className="text-power-red">*</span>
            </label>
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ej: Builds Óptimos para Genin"
              maxLength={100}
              className={`h-9 text-sm ${fieldErrors.title ? 'border-power-red/50' : ''}`}
            />
            {fieldErrors.title && <p className="text-xs text-power-red mt-1">{fieldErrors.title}</p>}
          </div>

          {/* Categoría */}
          <div className="w-36">
            <label className="block text-xs font-montserrat font-semibold text-white/60 mb-1.5">Categoría</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full h-9 px-3 text-sm bg-bg-card border border-border rounded-lg text-text-primary focus:outline-none focus:border-chakra-blue font-montserrat"
            >
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          {/* Dificultad */}
          <div className="w-36">
            <label className="block text-xs font-montserrat font-semibold text-white/60 mb-1.5">Dificultad</label>
            <select
              value={difficulty}
              onChange={e => setDifficulty(e.target.value)}
              className="w-full h-9 px-3 text-sm bg-bg-card border border-border rounded-lg text-text-primary focus:outline-none focus:border-chakra-blue font-montserrat"
            >
              {Object.entries(DIFFICULTY_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          {/* Estado */}
          <div>
            <label className="block text-xs font-montserrat font-semibold text-white/60 mb-1.5">Estado</label>
            <div className="flex gap-2">
              <button
                onClick={() => setStatus('DRAFT')}
                className={`h-9 px-4 rounded-lg font-montserrat text-sm transition-all ${
                  status === 'DRAFT' ? 'bg-accent-orange text-white' : 'bg-bg-card border border-border text-white/70 hover:border-accent-orange/50'
                }`}
              >
                Borrador
              </button>
              <button
                onClick={() => setStatus('PUBLISHED')}
                className={`h-9 px-4 rounded-lg font-montserrat text-sm transition-all ${
                  status === 'PUBLISHED' ? 'bg-chakra-blue text-white' : 'bg-bg-card border border-border text-white/70 hover:border-chakra-blue/50'
                }`}
              >
                Publicada
              </button>
            </div>
          </div>

          {/* Plantillas */}
          <div className="relative">
            <label className="block text-xs font-montserrat font-semibold text-white/60 mb-1.5">Plantillas</label>
            <button
              onClick={() => setShowTemplates(s => !s)}
              className="h-9 px-4 flex items-center gap-2 rounded-lg font-montserrat text-sm bg-bg-card border border-border text-white/70 hover:border-chakra-blue/50 hover:text-white transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Usar plantilla
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
                    className="w-full px-4 py-3 text-xs text-left font-montserrat hover:bg-bg-card text-white/70 hover:text-white transition-colors border-b border-border/30 last:border-0"
                  >
                    {template.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Editor — full remaining height ── */}
      <section className="relative flex-1 flex flex-col px-6 py-4 min-h-0">
        <div className="max-w-7xl mx-auto w-full relative z-10 flex flex-col flex-1 min-h-0">

          {error && (
            <div className="mb-3 p-3 bg-power-red/20 border border-power-red/30 rounded-lg flex items-center gap-3 flex-shrink-0">
              <AlertCircle className="w-4 h-4 text-power-red flex-shrink-0" />
              <p className="text-power-red text-sm">{error}</p>
            </div>
          )}

          <div className="flex items-center justify-between mb-2 flex-shrink-0">
            <label className="text-sm font-montserrat font-semibold text-text-primary">
              Contenido <span className="text-power-red">*</span>
              {fieldErrors.content && <span className="ml-3 text-xs text-power-red font-normal">{fieldErrors.content}</span>}
            </label>
            <span className="text-xs text-white/40">{content.length} caracteres</span>
          </div>

          {/* Editor fills remaining space */}
          <div className="flex-1 min-h-0" style={{ minHeight: '420px' }}>
            <MarkdownEditor value={content} onChange={setContent} />
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 flex-shrink-0">
            <Link href="/guides">
              <Button variant="ghost">Cancelar</Button>
            </Link>
            <Button onClick={handleSubmit} disabled={isSubmitting} className="disabled:opacity-50 gap-2">
              {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" />Publicando...</> : 'Publicar Guía'}
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}

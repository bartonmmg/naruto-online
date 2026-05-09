'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Loader2, Send, CheckCircle } from 'lucide-react'
import Navbar from '@/components/Navbar'
import { useAuth } from '@/lib/hooks/useAuth'
import api from '@/lib/api'

const TYPE_OPTIONS = [
  { value: 'GENERAL',   label: '📢 General' },
  { value: 'CHINA',     label: '🔴 China' },
  { value: 'EVENT',     label: '📅 Evento' },
  { value: 'TENTATIVE', label: '⚡ Tentativa' },
]

export default function SugerirNovedadPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [title, setTitle]       = useState('')
  const [content, setContent]   = useState('')
  const [category, setCategory] = useState('')
  const [type, setType]         = useState('GENERAL')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess]   = useState(false)

  useEffect(() => {
    if (user === null) {
      // wait for user to load — useAuth initial state is null
    }
  }, [user])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      router.push('/auth/login')
      return
    }
    setSubmitting(true)
    try {
      await api.post('/news/suggestions', { title, content, category, type })
      setSuccess(true)
      setTitle(''); setContent(''); setCategory(''); setType('GENERAL')
    } catch (e: any) {
      alert(e.response?.data?.error || 'Error al enviar la sugerencia')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-bg-primary">
        <Navbar />
        <div className="max-w-xl mx-auto pt-32 px-6 text-center">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h1 className="font-cinzel font-bold text-2xl text-text-primary mb-3">¡Sugerencia enviada!</h1>
          <p className="text-white/60 font-montserrat text-sm mb-6">
            Un MOD/ADMIN va a revisarla pronto. Si la aprueba, aparecerá publicada en /novedades.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setSuccess(false)}
              className="px-4 h-9 rounded-lg text-sm font-montserrat font-semibold bg-white/5 text-white/70 border border-border hover:text-white"
            >
              Enviar otra
            </button>
            <Link
              href="/novedades"
              className="px-4 h-9 rounded-lg text-sm font-montserrat font-semibold bg-accent-orange/15 text-accent-orange border border-accent-orange/30 hover:bg-accent-orange/25 flex items-center"
            >
              Ver novedades
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <Navbar />
      <div className="max-w-2xl mx-auto pt-28 pb-16 px-6">
        <Link
          href="/novedades"
          className="inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 font-montserrat mb-6 transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Volver a Novedades
        </Link>

        <h1 className="font-cinzel font-bold text-2xl text-text-primary mb-2">Sugerir una novedad</h1>
        <p className="text-white/50 font-montserrat text-sm mb-8">
          ¿Tenés información que falta? Mandá tu sugerencia. Un MOD/ADMIN va a revisarla antes de publicarla.
        </p>

        {!user && (
          <div className="bg-power-red/10 border border-power-red/30 rounded-xl p-4 mb-6 text-sm text-power-red font-montserrat">
            Necesitás iniciar sesión para enviar sugerencias.
            <Link href="/auth/login" className="ml-2 underline">Ingresar</Link>
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-xs font-montserrat font-semibold text-white/60 uppercase tracking-wider mb-1.5 block">Título</label>
            <input
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              maxLength={200}
              placeholder="Ej: Nuevo evento Festival de Verano"
              className="w-full h-10 px-3 bg-bg-card border border-border/50 rounded-lg text-sm text-white font-montserrat focus:outline-none focus:border-accent-orange"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-montserrat font-semibold text-white/60 uppercase tracking-wider mb-1.5 block">Tipo</label>
              <select
                value={type}
                onChange={e => setType(e.target.value)}
                className="w-full h-10 px-3 bg-bg-card border border-border/50 rounded-lg text-sm text-white font-montserrat focus:outline-none focus:border-accent-orange"
              >
                {TYPE_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-montserrat font-semibold text-white/60 uppercase tracking-wider mb-1.5 block">Categoría</label>
              <input
                required
                value={category}
                onChange={e => setCategory(e.target.value)}
                maxLength={100}
                placeholder="Ej: Ninjas / Eventos / Tentativas"
                className="w-full h-10 px-3 bg-bg-card border border-border/50 rounded-lg text-sm text-white font-montserrat focus:outline-none focus:border-accent-orange"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-montserrat font-semibold text-white/60 uppercase tracking-wider mb-1.5 block">Contenido</label>
            <textarea
              required
              value={content}
              onChange={e => setContent(e.target.value)}
              maxLength={5000}
              rows={10}
              placeholder="Escribí los detalles de la novedad (podés usar markdown: ## títulos, **negrita**, listas, etc)"
              className="w-full px-3 py-2 bg-bg-card border border-border/50 rounded-lg text-sm text-white font-montserrat focus:outline-none focus:border-accent-orange resize-y"
            />
            <p className="text-[10px] text-white/30 font-montserrat mt-1">{content.length} / 5000</p>
          </div>

          <button
            type="submit"
            disabled={!user || submitting || !title || !content || !category}
            className="flex items-center gap-1.5 px-4 h-10 rounded-lg text-sm font-montserrat font-semibold bg-accent-orange/15 text-accent-orange border border-accent-orange/30 hover:bg-accent-orange/25 transition-all disabled:opacity-40"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Enviar sugerencia
          </button>
        </form>
      </div>
    </div>
  )
}

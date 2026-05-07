'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Plus, Trash2, Loader2 } from 'lucide-react'
import Navbar from '@/components/Navbar'
import { useAuth } from '@/lib/hooks/useAuth'
import api from '@/lib/api'

const PRESET_CATEGORIES = ['Ninjas', 'Espíritus Animales', 'Eventos Semanales', 'Modas', 'Tentativas', 'General']
const TYPE_OPTIONS = [
  { value: 'CHINA',     label: '🔴 China (oficial)',   },
  { value: 'EVENT',     label: '📅 Evento',             },
  { value: 'TENTATIVE', label: '⚡ Tentativa (rumor)',  },
  { value: 'GENERAL',   label: '📢 General',            },
]

export default function CreateNovedadPage() {
  const router = useRouter()
  const { hasRole, isLoading } = useAuth()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: '', content: '', type: 'CHINA', category: 'Ninjas', customCategory: '',
  })
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [newUrl, setNewUrl] = useState('')

  useEffect(() => {
    if (!isLoading && !hasRole(['ADMIN', 'MODERATOR'])) router.replace('/novedades')
  }, [isLoading, hasRole])

  const addUrl = () => {
    if (newUrl.trim()) { setImageUrls(u => [...u, newUrl.trim()]); setNewUrl('') }
  }

  const submit = async () => {
    if (!form.title.trim() || !form.content.trim()) return alert('Título y contenido son obligatorios')
    const category = form.category === '__custom__' ? form.customCategory.trim() : form.category
    if (!category) return alert('Ingresá una categoría')
    setSaving(true)
    try {
      await api.post('/news', { title: form.title, content: form.content, type: form.type, category, imageUrls })
      router.push('/novedades')
    } catch (e: any) {
      alert(e.response?.data?.error || 'Error al publicar')
      setSaving(false)
    }
  }

  if (isLoading) return null

  return (
    <div className="min-h-screen bg-bg-primary">
      <Navbar />
      <div className="max-w-2xl mx-auto px-6 pt-28 pb-16">

        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 font-montserrat mb-8 transition-colors">
          <ChevronLeft className="w-3.5 h-3.5" /> Volver
        </button>

        <h1 className="font-cinzel font-bold text-2xl text-text-primary mb-8">Nueva Novedad</h1>

        <div className="space-y-5">
          {/* Título */}
          <div>
            <label className="text-xs text-white/40 font-montserrat uppercase tracking-wider mb-1.5 block">Título</label>
            <input
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Título de la novedad..."
              className="w-full h-10 px-4 text-sm bg-bg-card border border-border rounded-xl text-white placeholder-white/25 focus:outline-none focus:border-accent-orange font-montserrat"
            />
          </div>

          {/* Tipo + Categoría */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-white/40 font-montserrat uppercase tracking-wider mb-1.5 block">Tipo</label>
              <select
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                className="w-full h-10 px-4 text-sm bg-bg-card border border-border rounded-xl text-white focus:outline-none focus:border-accent-orange font-montserrat"
              >
                {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-white/40 font-montserrat uppercase tracking-wider mb-1.5 block">Categoría</label>
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full h-10 px-4 text-sm bg-bg-card border border-border rounded-xl text-white focus:outline-none focus:border-accent-orange font-montserrat"
              >
                {PRESET_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                <option value="__custom__">Otra (escribir)</option>
              </select>
            </div>
          </div>

          {form.category === '__custom__' && (
            <input
              value={form.customCategory}
              onChange={e => setForm(f => ({ ...f, customCategory: e.target.value }))}
              placeholder="Nombre de la categoría..."
              className="w-full h-10 px-4 text-sm bg-bg-card border border-border rounded-xl text-white placeholder-white/25 focus:outline-none focus:border-accent-orange font-montserrat"
            />
          )}

          {/* Contenido */}
          <div>
            <label className="text-xs text-white/40 font-montserrat uppercase tracking-wider mb-1.5 block">Contenido</label>
            <textarea
              value={form.content}
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              rows={8}
              placeholder="Descripción completa de la novedad..."
              className="w-full px-4 py-3 text-sm bg-bg-card border border-border rounded-xl text-white placeholder-white/25 focus:outline-none focus:border-accent-orange font-montserrat resize-none leading-relaxed"
            />
          </div>

          {/* Imágenes */}
          <div>
            <label className="text-xs text-white/40 font-montserrat uppercase tracking-wider mb-1.5 block">Imágenes (URLs)</label>
            <div className="flex gap-2 mb-2">
              <input
                value={newUrl}
                onChange={e => setNewUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addUrl()}
                placeholder="https://..."
                className="flex-1 h-9 px-3 text-xs bg-bg-card border border-border rounded-lg text-white placeholder-white/25 focus:outline-none focus:border-accent-orange font-montserrat"
              />
              <button onClick={addUrl} className="flex items-center gap-1 px-3 h-9 rounded-lg text-xs font-montserrat bg-white/5 text-white/50 border border-border hover:text-white/80 transition-all">
                <Plus className="w-3.5 h-3.5" /> Agregar
              </button>
            </div>
            {imageUrls.map((url, i) => (
              <div key={i} className="flex items-center gap-2 mb-1.5">
                <span className="flex-1 text-xs text-white/40 font-montserrat truncate">{url}</span>
                <button onClick={() => setImageUrls(u => u.filter((_, j) => j !== i))}>
                  <Trash2 className="w-3.5 h-3.5 text-red-400/50 hover:text-red-400 transition-colors" />
                </button>
              </div>
            ))}
          </div>

          {/* Submit */}
          <button
            onClick={submit}
            disabled={saving}
            className="w-full h-11 rounded-xl font-montserrat font-bold text-sm bg-accent-orange text-white hover:bg-accent-orange/90 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {saving ? 'Publicando...' : 'Publicar Novedad'}
          </button>
        </div>
      </div>
    </div>
  )
}

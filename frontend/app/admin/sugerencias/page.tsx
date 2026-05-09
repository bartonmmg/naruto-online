'use client'

import { useEffect, useState } from 'react'
import { Loader2, Check, X, Inbox } from 'lucide-react'
import api from '@/lib/api'

interface Suggestion {
  id: string
  title: string
  content: string
  category: string
  type: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  suggestedBy: { username: string; role: string }
  reviewerNote: string | null
  createdAt: string
  reviewedAt: string | null
}

const TYPE_LABEL: Record<string, string> = {
  CHINA: '🔴 China', EVENT: '📅 Evento', TENTATIVE: '⚡ Tentativa', GENERAL: '📢 General',
}

export default function AdminSuggestionsPage() {
  const [items, setItems]   = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState<'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL'>('PENDING')
  const [acting, setActing]   = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    const url = filter === 'ALL' ? '/news/suggestions' : `/news/suggestions?status=${filter}`
    api.get(url)
      .then(r => setItems(r.data.items ?? []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [filter])

  const approve = async (id: string) => {
    if (!confirm('¿Aprobar esta sugerencia? Se publicará en /novedades.')) return
    setActing(id)
    try {
      await api.post(`/news/suggestions/${id}/approve`, {})
      load()
    } catch (e: any) {
      alert(e.response?.data?.error || 'Error')
    } finally { setActing(null) }
  }

  const reject = async (id: string) => {
    const note = prompt('Motivo del rechazo (opcional):') ?? undefined
    setActing(id)
    try {
      await api.post(`/news/suggestions/${id}/reject`, { note })
      load()
    } catch (e: any) {
      alert(e.response?.data?.error || 'Error')
    } finally { setActing(null) }
  }

  const counts = items.reduce<Record<string, number>>((a, s) => {
    a[s.status] = (a[s.status] ?? 0) + 1
    return a
  }, {})

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="font-cinzel font-bold text-xl text-text-primary">Sugerencias de novedades</h1>
        <p className="text-xs text-white/40 font-montserrat mt-0.5">Revisar y aprobar/rechazar lo que envían los usuarios</p>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2">
        {(['PENDING', 'APPROVED', 'REJECTED', 'ALL'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 h-8 rounded-full text-xs font-montserrat font-semibold transition-all border ${
              filter === f
                ? 'bg-accent-orange/15 text-accent-orange border-accent-orange/30'
                : 'text-white/40 border-border hover:text-white/70'
            }`}
          >
            {f === 'PENDING' ? 'Pendientes' : f === 'APPROVED' ? 'Aprobadas' : f === 'REJECTED' ? 'Rechazadas' : 'Todas'}
            {filter === f && counts[f] !== undefined && ` (${counts[f]})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-accent-orange" /></div>
      ) : items.length === 0 ? (
        <div className="bg-bg-card border border-border/50 rounded-2xl py-12 text-center">
          <Inbox className="w-8 h-8 text-white/20 mx-auto mb-2" />
          <p className="text-white/40 font-montserrat text-sm">No hay sugerencias en esta lista</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(s => (
            <div key={s.id} className="bg-bg-card border border-border/50 rounded-xl p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="text-[10px] font-montserrat font-bold px-2 py-0.5 rounded-full border border-white/15 text-white/60">
                      {TYPE_LABEL[s.type] ?? s.type}
                    </span>
                    <span className="text-[10px] text-white/40 font-montserrat">{s.category}</span>
                    <span className={`text-[10px] font-montserrat font-bold px-2 py-0.5 rounded-full border ${
                      s.status === 'PENDING'  ? 'bg-sage-gold/10 text-sage-gold border-sage-gold/30' :
                      s.status === 'APPROVED' ? 'bg-green-500/10 text-green-400 border-green-500/30' :
                                                'bg-red-400/10 text-red-400 border-red-400/30'
                    }`}>
                      {s.status}
                    </span>
                  </div>
                  <h3 className="font-cinzel font-bold text-base text-text-primary">{s.title}</h3>
                  <p className="text-[11px] text-white/40 font-montserrat mt-0.5">
                    @{s.suggestedBy?.username ?? '?'} · {new Date(s.createdAt).toLocaleString('es-AR')}
                  </p>
                </div>
                {s.status === 'PENDING' && (
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => approve(s.id)}
                      disabled={acting === s.id}
                      className="flex items-center gap-1 px-3 h-8 rounded-lg text-xs font-montserrat font-semibold bg-green-500/10 text-green-400 border border-green-500/30 hover:bg-green-500/20 transition-all disabled:opacity-40"
                    >
                      {acting === s.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                      Aprobar
                    </button>
                    <button
                      onClick={() => reject(s.id)}
                      disabled={acting === s.id}
                      className="flex items-center gap-1 px-3 h-8 rounded-lg text-xs font-montserrat font-semibold bg-red-400/10 text-red-400 border border-red-400/30 hover:bg-red-400/20 transition-all disabled:opacity-40"
                    >
                      <X className="w-3 h-3" /> Rechazar
                    </button>
                  </div>
                )}
              </div>
              <pre className="text-xs text-white/70 font-montserrat whitespace-pre-wrap break-words bg-bg-elevated/40 rounded-lg p-3 max-h-60 overflow-y-auto">
                {s.content}
              </pre>
              {s.reviewerNote && (
                <p className="text-[11px] text-white/40 font-montserrat mt-2 italic">
                  Nota del revisor: {s.reviewerNote}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

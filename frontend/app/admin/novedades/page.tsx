'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Trash2, Loader2, RefreshCw } from 'lucide-react'
import api from '@/lib/api'

interface NewsPost {
  id: string
  title: string
  type: string
  category: string
  author: { username: string } | null
  publishedAt: string
  discordMessageId: string | null
}

const TYPE_META: Record<string, { label: string; color: string; bg: string; border: string; icon: string }> = {
  CHINA:     { label: 'China',     color: 'text-red-400',     bg: 'bg-red-400/10',     border: 'border-red-400/20',     icon: '🔴' },
  EVENT:     { label: 'Evento',    color: 'text-chakra-blue', bg: 'bg-chakra-blue/10', border: 'border-chakra-blue/20', icon: '📅' },
  TENTATIVE: { label: 'Tentativa', color: 'text-sage-gold',   bg: 'bg-sage-gold/10',   border: 'border-sage-gold/20',   icon: '⚡' },
  GENERAL:   { label: 'General',   color: 'text-white/50',    bg: 'bg-white/5',         border: 'border-white/10',       icon: '📢' },
}

export default function AdminNovedadesPage() {
  const router = useRouter()
  const [posts, setPosts]     = useState<NewsPost[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    api.get('/news?limit=100')
      .then(r => setPosts(r.data.items))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const forceSync = async () => {
    setSyncing(true)
    try {
      const r = await api.post('/news/sync')
      const { totalSaved, results } = r.data
      const detail = results.map((x: any) =>
        x.error
          ? `❌ ${x.category}: ${x.error}`
          : `✅ ${x.category}: ${x.fetched} mensajes, ${x.saved} guardados`
      ).join('\n')
      alert(`Sync completado — ${totalSaved} nuevos posts\n\n${detail}`)
      load()
    } catch (e: any) {
      alert(e.response?.data?.error || 'Error al sincronizar')
    } finally {
      setSyncing(false)
    }
  }

  const deletePost = async (id: string) => {
    if (!confirm('¿Eliminar esta novedad?')) return
    setDeleting(id)
    try {
      await api.delete(`/news/${id}`)
      setPosts(p => p.filter(x => x.id !== id))
    } catch (e: any) {
      alert(e.response?.data?.error || 'Error al eliminar')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-cinzel font-bold text-xl text-text-primary">Novedades</h1>
          <p className="text-xs text-white/40 font-montserrat mt-0.5">{posts.length} novedades en total</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={forceSync}
            disabled={syncing}
            className="flex items-center gap-1.5 px-3 h-9 rounded-lg text-xs font-montserrat font-semibold bg-chakra-blue/10 text-chakra-blue border border-chakra-blue/30 hover:bg-chakra-blue/20 transition-all disabled:opacity-40"
          >
            {syncing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            Sincronizar Discord
          </button>
          <button
            onClick={() => router.push('/novedades/create')}
            className="flex items-center gap-1.5 px-3 h-9 rounded-lg text-xs font-montserrat font-semibold bg-accent-orange/15 text-accent-orange border border-accent-orange/30 hover:bg-accent-orange/25 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Nueva Novedad
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-bg-card border border-border/50 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-[1fr_100px_130px_120px_80px] text-xs font-montserrat font-semibold text-white/40 uppercase tracking-wider px-5 py-3 border-b border-border/40">
          <span>Título</span>
          <span>Tipo</span>
          <span>Categoría</span>
          <span>Fuente</span>
          <span></span>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-accent-orange" /></div>
        ) : posts.length === 0 ? (
          <div className="py-12 text-center text-white/30 font-montserrat text-sm">No hay novedades todavía</div>
        ) : (
          posts.map(post => {
            const meta = TYPE_META[post.type] ?? TYPE_META.GENERAL
            return (
              <div key={post.id} className="grid grid-cols-[1fr_100px_130px_120px_80px] items-center px-5 py-3 border-b border-border/15 last:border-0 hover:bg-bg-elevated/30 transition-colors">
                <div className="min-w-0">
                  <p className="font-montserrat font-semibold text-sm text-text-primary truncate">{post.title}</p>
                  <p className="text-[10px] text-white/30 font-montserrat mt-0.5">
                    {new Date(post.publishedAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <span className={`text-[10px] font-montserrat font-bold px-2 py-0.5 rounded-full border w-fit ${meta.bg} ${meta.color} ${meta.border}`}>
                  {meta.icon} {meta.label}
                </span>
                <span className="text-xs text-white/50 font-montserrat truncate pr-2">{post.category}</span>
                <span className="text-xs font-montserrat text-white/40">
                  {post.discordMessageId ? '🤖 Discord' : `@${post.author?.username ?? '?'}`}
                </span>
                <div className="flex items-center gap-1 justify-end">
                  <button
                    onClick={() => router.push(`/novedades/${post.id}/edit`)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-white/30 hover:text-white/70 hover:bg-white/5 transition-all"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deletePost(post.id)}
                    disabled={deleting === post.id}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-white/20 hover:text-red-400 hover:bg-red-400/10 transition-all disabled:opacity-40"
                  >
                    {deleting === post.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

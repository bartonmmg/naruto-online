'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Bookmark, BookOpen, Newspaper, Trophy, ArrowLeft } from 'lucide-react'
import Navbar from '@/components/Navbar'
import api from '@/lib/api'

type Tab = 'GUIDE' | 'NEWS' | 'PLAYER'

const TABS: { key: Tab; label: string; icon: any }[] = [
  { key: 'GUIDE',  label: 'Guías',     icon: BookOpen },
  { key: 'NEWS',   label: 'Novedades', icon: Newspaper },
  { key: 'PLAYER', label: 'Jugadores', icon: Trophy },
]

export default function FavoritesPage() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('GUIDE')
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('token')) {
      router.push('/auth/login')
      return
    }
    setLoading(true)
    api.get('/favorites', { params: { type: tab } })
      .then(r => setItems(r.data?.items ?? []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [tab, router])

  return (
    <main className="min-h-screen bg-bg-primary">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 pt-28 pb-16">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-xs text-white/50 hover:text-white/80 font-montserrat mb-6">
          <ArrowLeft className="w-4 h-4" />
          Volver al dashboard
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <Bookmark className="w-6 h-6 text-accent-orange" />
          <h1 className="font-cinzel font-black text-3xl text-text-primary">Mis favoritos</h1>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-border/30">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-montserrat font-semibold transition-colors border-b-2 -mb-px ${
                tab === key
                  ? 'text-accent-orange border-accent-orange'
                  : 'text-white/50 hover:text-white/80 border-transparent'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-16 text-center text-white/40 font-montserrat text-sm">Cargando...</div>
        ) : items.length === 0 ? (
          <div className="py-20 text-center">
            <Bookmark className="w-12 h-12 text-white/20 mx-auto mb-3" />
            <p className="font-montserrat text-white/50">No tienes favoritos en esta categoría</p>
            <p className="font-montserrat text-white/30 text-sm mt-1">
              Marcá el ícono <Bookmark className="inline w-3.5 h-3.5" /> en cualquier {tab === 'GUIDE' ? 'guía' : tab === 'NEWS' ? 'novedad' : 'jugador'} para guardarlo aquí.
            </p>
          </div>
        ) : tab === 'GUIDE' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.filter(i => i.target).map(i => (
              <Link
                key={i.id}
                href={`/guides/${i.target.id}`}
                className="game-card p-5 rounded-xl group"
              >
                <h3 className="font-cinzel font-bold text-base text-text-primary group-hover:text-accent-orange transition-colors mb-2 line-clamp-2">
                  {i.target.title}
                </h3>
                <div className="flex items-center gap-3 text-xs text-white/50 font-montserrat">
                  <span>@{i.target.author?.username ?? 'desconocido'}</span>
                  <span>·</span>
                  <span>{i.target.viewCount} vistas</span>
                </div>
              </Link>
            ))}
          </div>
        ) : tab === 'NEWS' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.filter(i => i.target).map(i => (
              <Link
                key={i.id}
                href={`/novedades/${i.target.id}`}
                className="game-card p-5 rounded-xl group"
              >
                <span className="text-[10px] text-accent-orange font-montserrat font-bold uppercase tracking-wider">
                  {i.target.category}
                </span>
                <h3 className="font-cinzel font-bold text-base text-text-primary group-hover:text-accent-orange transition-colors mt-1 mb-2 line-clamp-2">
                  {i.target.title}
                </h3>
                <p className="text-xs text-white/50 font-montserrat line-clamp-2">
                  {(i.target.content ?? '').replace(/[#*_>`]/g, '').replace(/\n/g, ' ').trim()}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map(i => (
              <div key={i.id} className="game-card p-5 rounded-xl flex items-center gap-3">
                <Trophy className="w-5 h-5 text-sage-gold" />
                <span className="font-montserrat font-semibold text-text-primary">
                  Jugador #{i.targetId}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

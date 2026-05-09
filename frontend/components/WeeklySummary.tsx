'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { X, Sparkles, ArrowRight } from 'lucide-react'
import api from '@/lib/api'

const STORAGE_KEY = 'weekly-summary-shown'

interface NewsPost {
  id: string
  title: string
  type: string
  category: string
  publishedAt: string
}

const TYPE_META: Record<string, { color: string; bg: string; icon: string }> = {
  CHINA:     { color: 'text-red-400',      bg: 'bg-red-400/10',     icon: '🔴' },
  EVENT:     { color: 'text-chakra-blue',  bg: 'bg-chakra-blue/10', icon: '📅' },
  TENTATIVE: { color: 'text-sage-gold',    bg: 'bg-sage-gold/10',   icon: '⚡' },
  GENERAL:   { color: 'text-white/50',     bg: 'bg-white/5',        icon: '📢' },
}

// ISO week number (year + week) — same week even if user enters Sun vs Mon
function isoWeekKey(d: Date): string {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const dayNum = t.getUTCDay() || 7
  t.setUTCDate(t.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1))
  const weekNum = Math.ceil((((t.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
  return `${t.getUTCFullYear()}-W${String(weekNum).padStart(2, '0')}`
}

function cleanTitle(s: string): string {
  return s
    .replace(/^#{1,6}\s+/g, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .trim()
}

export default function WeeklySummary() {
  const [open, setOpen]   = useState(false)
  const [posts, setPosts] = useState<NewsPost[]>([])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const currentWeek = isoWeekKey(new Date())
    const lastShown = localStorage.getItem(STORAGE_KEY)
    if (lastShown === currentWeek) return // already shown this week

    api.get('/news?limit=20').then(r => {
      const all = (r.data.items ?? []) as NewsPost[]
      const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
      const recent = all.filter(p => new Date(p.publishedAt).getTime() >= weekAgo)
      if (recent.length === 0) return
      setPosts(recent)
      // Tiny delay so it doesn't fire before page paints
      setTimeout(() => setOpen(true), 800)
    }).catch(() => {})
  }, [])

  const dismiss = () => {
    setOpen(false)
    try { localStorage.setItem(STORAGE_KEY, isoWeekKey(new Date())) } catch {}
  }

  if (!open) return null

  return (
    <div
      onClick={dismiss}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="bg-bg-card border border-accent-orange/30 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
      >
        <div className="p-6 border-b border-border/30 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-orange/15 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-accent-orange" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-cinzel font-bold text-lg text-text-primary">Resumen de la semana</h2>
            <p className="text-xs text-white/50 font-montserrat mt-0.5">
              {posts.length} {posts.length === 1 ? 'novedad nueva' : 'novedades nuevas'} en los últimos 7 días
            </p>
          </div>
          <button
            onClick={dismiss}
            className="text-white/40 hover:text-white"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto divide-y divide-border/20">
          {posts.slice(0, 6).map(p => {
            const m = TYPE_META[p.type] ?? TYPE_META.GENERAL
            const d = new Date(p.publishedAt)
            return (
              <Link
                key={p.id}
                href={`/novedades/${p.id}`}
                onClick={dismiss}
                className="flex items-start gap-3 p-4 hover:bg-bg-elevated/40 transition-colors group"
              >
                <span className={`text-base leading-none mt-0.5 ${m.color}`}>{m.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-montserrat font-semibold text-text-primary line-clamp-1 group-hover:text-accent-orange transition-colors">
                    {cleanTitle(p.title)}
                  </p>
                  <p className="text-[10px] text-white/40 font-montserrat mt-0.5">
                    {p.category} · {d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>

        <div className="p-4 border-t border-border/30 flex items-center justify-between gap-2">
          <button
            onClick={dismiss}
            className="text-xs text-white/50 font-montserrat font-semibold hover:text-white"
          >
            Ya las vi
          </button>
          <Link
            href="/novedades"
            onClick={dismiss}
            className="flex items-center gap-1.5 px-4 h-8 rounded-lg text-xs font-montserrat font-semibold bg-accent-orange/15 text-accent-orange border border-accent-orange/30 hover:bg-accent-orange/25 transition-all"
          >
            Ver todas <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  )
}

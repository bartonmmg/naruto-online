'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Calendar, ChevronLeft, ChevronRight, Clock, X } from 'lucide-react'
import Navbar from '@/components/Navbar'
import { fetchAPI } from '@/lib/api'

interface NewsPost {
  id: string
  title: string
  content: string
  type: string
  category: string
  publishedAt: string
  eventStartAt?: string | null
  eventEndAt?: string | null
}

type Filter = 'active' | 'upcoming' | 'past' | 'all'

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

function startOfDay(d: Date) { const x = new Date(d); x.setHours(0, 0, 0, 0); return x }
function sameDay(a: Date, b: Date) { return startOfDay(a).getTime() === startOfDay(b).getTime() }
function eventDate(p: NewsPost) {
  return new Date(p.eventStartAt || p.publishedAt)
}
function eventEndDate(p: NewsPost) {
  return p.eventEndAt ? new Date(p.eventEndAt) : eventDate(p)
}
function isActive(p: NewsPost, now = new Date()) {
  const start = eventDate(p)
  const end = eventEndDate(p)
  return start <= now && now <= end
}
function isUpcoming(p: NewsPost, now = new Date()) {
  return eventDate(p) > now
}

function Countdown({ to }: { to: Date }) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000)
    return () => clearInterval(id)
  }, [])
  const ms = to.getTime() - now
  if (ms <= 0) return <span className="text-nature-green">En curso</span>
  const days = Math.floor(ms / 86400000)
  const hours = Math.floor((ms % 86400000) / 3600000)
  const mins = Math.floor((ms % 3600000) / 60000)
  if (days > 0) return <span>{days}d {hours}h</span>
  if (hours > 0) return <span>{hours}h {mins}m</span>
  return <span>{mins}m</span>
}

export default function EventsPage() {
  const [posts, setPosts] = useState<NewsPost[]>([])
  const [loading, setLoading] = useState(true)
  const [cursor, setCursor] = useState(() => { const d = new Date(); d.setDate(1); return d })
  const [filter, setFilter] = useState<Filter>('active')
  const [openDay, setOpenDay] = useState<Date | null>(null)

  useEffect(() => {
    fetchAPI('/news?type=EVENT&limit=200')
      .then((data: any) => setPosts(data?.items ?? []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const now = new Date()
    if (filter === 'all') return posts
    if (filter === 'active')   return posts.filter(p => isActive(p, now))
    if (filter === 'upcoming') return posts.filter(p => isUpcoming(p, now))
    return posts.filter(p => eventEndDate(p) < now)
  }, [posts, filter])

  // Build calendar grid for current cursor month
  const grid = useMemo(() => {
    const firstOfMonth = new Date(cursor.getFullYear(), cursor.getMonth(), 1)
    const startOffset = (firstOfMonth.getDay() + 6) % 7 // Monday-first
    const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate()
    const cells: (Date | null)[] = []
    for (let i = 0; i < startOffset; i++) cells.push(null)
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(cursor.getFullYear(), cursor.getMonth(), d))
    while (cells.length % 7 !== 0) cells.push(null)
    return cells
  }, [cursor])

  // Map of date string -> events
  const byDay = useMemo(() => {
    const map = new Map<string, NewsPost[]>()
    for (const p of posts) {
      const start = eventDate(p)
      const end = eventEndDate(p)
      const cur = startOfDay(start)
      const last = startOfDay(end)
      while (cur <= last) {
        const key = cur.toDateString()
        const arr = map.get(key) ?? []
        arr.push(p)
        map.set(key, arr)
        cur.setDate(cur.getDate() + 1)
      }
    }
    return map
  }, [posts])

  const today = startOfDay(new Date())

  return (
    <main className="min-h-screen bg-bg-primary">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center gap-3 mb-3">
          <Calendar className="w-6 h-6 text-accent-orange" />
          <h1 className="font-cinzel font-black text-3xl text-text-primary">Calendario de eventos</h1>
        </div>
        <p className="text-white/50 font-montserrat text-sm mb-8">
          Eventos semanales y especiales del servidor.
        </p>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(['active', 'upcoming', 'past', 'all'] as Filter[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-xs font-montserrat font-semibold rounded-lg border transition-colors ${
                filter === f
                  ? 'bg-accent-orange/15 text-accent-orange border-accent-orange/40'
                  : 'bg-bg-card border-border/40 text-white/60 hover:text-white'
              }`}
            >
              {f === 'active' ? 'Activos' : f === 'upcoming' ? 'Próximos' : f === 'past' ? 'Pasados' : 'Todos'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-20 text-center text-white/40 font-montserrat text-sm">Cargando eventos...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar */}
            <div className="lg:col-span-2 bg-bg-card border border-border/40 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setCursor(c => new Date(c.getFullYear(), c.getMonth() - 1, 1))}
                  className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <h2 className="font-cinzel font-bold text-lg text-text-primary">
                  {MONTHS[cursor.getMonth()]} {cursor.getFullYear()}
                </h2>
                <button
                  onClick={() => setCursor(c => new Date(c.getFullYear(), c.getMonth() + 1, 1))}
                  className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-2">
                {WEEKDAYS.map(d => (
                  <div key={d} className="text-center text-[10px] font-cinzel text-white/40 tracking-widest uppercase py-1">
                    {d}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {grid.map((cell, i) => {
                  if (!cell) return <div key={i} />
                  const isToday = sameDay(cell, today)
                  const events = byDay.get(cell.toDateString()) ?? []
                  return (
                    <button
                      key={i}
                      onClick={() => events.length > 0 && setOpenDay(cell)}
                      disabled={events.length === 0}
                      className={`aspect-square p-1.5 rounded-lg border text-left transition-colors ${
                        isToday
                          ? 'border-accent-orange/60 bg-accent-orange/10'
                          : events.length > 0
                            ? 'border-border/40 bg-bg-elevated/50 hover:border-accent-orange/40 hover:bg-accent-orange/5'
                            : 'border-border/20 opacity-50'
                      }`}
                    >
                      <div className="text-xs font-montserrat font-semibold text-text-primary">
                        {cell.getDate()}
                      </div>
                      {events.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-0.5">
                          {events.slice(0, 3).map((_, j) => (
                            <span key={j} className="w-1.5 h-1.5 rounded-full bg-accent-orange" />
                          ))}
                          {events.length > 3 && (
                            <span className="text-[8px] text-white/50 font-montserrat">+{events.length - 3}</span>
                          )}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Filtered events list */}
            <div className="space-y-3">
              <h3 className="font-cinzel font-bold text-sm text-white/60 tracking-widest uppercase">
                {filter === 'active' ? 'Eventos activos' : filter === 'upcoming' ? 'Próximos' : filter === 'past' ? 'Pasados' : 'Todos'}
              </h3>
              {filtered.length === 0 ? (
                <p className="text-xs text-white/40 font-montserrat py-6 text-center">
                  No hay eventos en esta categoría.
                </p>
              ) : (
                filtered.slice(0, 12).map(p => (
                  <Link
                    key={p.id}
                    href={`/novedades/${p.id}`}
                    className="block bg-bg-card border border-border/40 rounded-xl p-4 hover:border-accent-orange/40 transition-colors"
                  >
                    <h4 className="font-cinzel font-bold text-sm text-text-primary line-clamp-2 mb-2">
                      {p.title}
                    </h4>
                    <div className="flex items-center gap-2 text-[10px] font-montserrat text-white/50">
                      <Clock className="w-3 h-3" />
                      {filter === 'active' && p.eventEndAt ? (
                        <>Termina en <Countdown to={new Date(p.eventEndAt)} /></>
                      ) : isUpcoming(p) ? (
                        <>Empieza en <Countdown to={eventDate(p)} /></>
                      ) : (
                        <>{eventDate(p).toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })}</>
                      )}
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Day modal */}
      {openDay && (
        <div onClick={() => setOpenDay(null)} className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div onClick={e => e.stopPropagation()} className="bg-bg-card border border-border/60 rounded-2xl max-w-md w-full overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border/40">
              <h3 className="font-cinzel font-bold text-base text-text-primary">
                {openDay.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </h3>
              <button onClick={() => setOpenDay(null)} className="text-white/40 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
              {(byDay.get(openDay.toDateString()) ?? []).map(p => (
                <Link
                  key={p.id}
                  href={`/novedades/${p.id}`}
                  className="block p-3 rounded-lg bg-bg-elevated/50 border border-border/30 hover:border-accent-orange/40 transition-colors"
                >
                  <div className="font-cinzel font-bold text-sm text-text-primary line-clamp-2">{p.title}</div>
                  <div className="text-[10px] text-white/50 mt-1 font-montserrat">{p.category}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

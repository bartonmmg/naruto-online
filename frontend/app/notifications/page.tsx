'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Bell, Check, CheckCheck, MessageSquare, Star, Eye, Trophy, ArrowLeft } from 'lucide-react'
import Navbar from '@/components/Navbar'
import api from '@/lib/api'

interface Notification {
  id: string
  type: string
  message: string
  guideId?: string | null
  guideTitle?: string | null
  read: boolean
  createdAt: string
}

const TYPE_ICON: Record<string, React.ReactNode> = {
  COMMENT:     <MessageSquare className="w-4 h-4 text-chakra-blue" />,
  REACTION:    <Star className="w-4 h-4 text-accent-orange" />,
  BADGE:       <Trophy className="w-4 h-4 text-sage-gold" />,
  MILESTONE:   <Eye className="w-4 h-4 text-nature-green" />,
  ACHIEVEMENT: <Trophy className="w-4 h-4 text-accent-orange" />,
}

function dayLabel(dateStr: string) {
  const d = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const start = new Date(d)
  start.setHours(0, 0, 0, 0)
  const diffDays = Math.round((today.getTime() - start.getTime()) / 86400000)
  if (diffDays === 0) return 'Hoy'
  if (diffDays === 1) return 'Ayer'
  if (diffDays < 7) return `Hace ${diffDays} días`
  return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function timeOf(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
}

export default function NotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(() => {
    api.get('/notifications')
      .then(r => setNotifications(r.data?.notifications ?? []))
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('token')) {
      router.push('/auth/login')
      return
    }
    fetchAll()
  }, [router, fetchAll])

  const markOneRead = (id: string) => {
    setNotifications(list => list.map(n => n.id === id ? { ...n, read: true } : n))
    api.patch(`/notifications/${id}/read`).catch(() => {})
  }

  const markAllRead = () => {
    setNotifications(list => list.map(n => ({ ...n, read: true })))
    api.patch('/notifications/all/read').catch(() => {})
  }

  const unreadCount = notifications.filter(n => !n.read).length

  // Group by day
  const groups: { label: string; items: Notification[] }[] = []
  for (const n of notifications) {
    const label = dayLabel(n.createdAt)
    const last = groups[groups.length - 1]
    if (last && last.label === label) last.items.push(n)
    else groups.push({ label, items: [n] })
  }

  return (
    <main className="min-h-screen bg-bg-primary">
      <Navbar />

      <div className="max-w-3xl mx-auto px-6 pt-28 pb-16">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-xs text-white/50 hover:text-white/80 font-montserrat mb-6">
          <ArrowLeft className="w-4 h-4" />
          Volver al dashboard
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6 text-accent-orange" />
            <h1 className="font-cinzel font-black text-3xl text-text-primary">Notificaciones</h1>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-power-red text-white text-xs font-black leading-none">
                {unreadCount}
              </span>
            )}
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-2 text-xs font-montserrat text-white/60 hover:text-white px-3 py-2 rounded-lg border border-border/40 hover:border-border transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Marcar todo como leído
            </button>
          )}
        </div>

        {loading ? (
          <div className="py-16 text-center text-white/40 font-montserrat text-sm">Cargando...</div>
        ) : notifications.length === 0 ? (
          <div className="py-20 text-center">
            <Bell className="w-12 h-12 text-white/20 mx-auto mb-3" />
            <p className="font-montserrat text-white/50">No tienes notificaciones</p>
            <p className="font-montserrat text-white/30 text-sm mt-1">Te avisaremos cuando algo pase</p>
          </div>
        ) : (
          <div className="space-y-8">
            {groups.map(group => (
              <section key={group.label}>
                <h2 className="text-xs font-cinzel tracking-widest text-white/40 uppercase mb-3">
                  {group.label}
                </h2>
                <ul className="space-y-2">
                  {group.items.map(notif => (
                    <li
                      key={notif.id}
                      className={`flex items-start gap-3 p-4 rounded-xl border transition-colors ${
                        !notif.read
                          ? 'bg-chakra-blue/5 border-chakra-blue/20 hover:bg-chakra-blue/10'
                          : 'bg-bg-card/40 border-border/30 hover:bg-bg-card/70'
                      }`}
                    >
                      {!notif.read && (
                        <div className="flex-shrink-0 w-2 h-2 rounded-full bg-chakra-blue mt-2" />
                      )}
                      {notif.read && <div className="flex-shrink-0 w-2" />}

                      <div className="flex-shrink-0 mt-0.5 w-9 h-9 rounded-full bg-bg-elevated border border-border/40 flex items-center justify-center">
                        {TYPE_ICON[notif.type] || <Bell className="w-4 h-4 text-white/40" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-text-primary font-montserrat leading-relaxed">
                          {notif.message}
                        </p>
                        {notif.guideId && (
                          <Link
                            href={`/guides/${notif.guideId}`}
                            onClick={() => markOneRead(notif.id)}
                            className="text-xs text-chakra-blue hover:text-chakra-blue/80 transition-colors block mt-1 truncate"
                          >
                            {notif.guideTitle || 'Ver guía'} →
                          </Link>
                        )}
                        <span className="text-[10px] text-white/30 mt-1.5 block font-montserrat">
                          {timeOf(notif.createdAt)}
                        </span>
                      </div>

                      {!notif.read && (
                        <button
                          onClick={() => markOneRead(notif.id)}
                          className="flex-shrink-0 p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/40 hover:text-white"
                          title="Marcar como leída"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { Bell, Check, CheckCheck, MessageSquare, Star, Eye, Trophy } from 'lucide-react'
import api from '@/lib/api'

interface Notification {
  id: string
  type: string
  message: string
  guideId?: string
  guideTitle?: string
  read: boolean
  createdAt: string
}

const TYPE_ICON: Record<string, React.ReactNode> = {
  COMMENT:   <MessageSquare className="w-3.5 h-3.5 text-chakra-blue" />,
  REACTION:  <Star className="w-3.5 h-3.5 text-accent-orange" />,
  BADGE:     <Trophy className="w-3.5 h-3.5 text-sage-gold" />,
  MILESTONE: <Eye className="w-3.5 h-3.5 text-nature-green" />,
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'ahora'
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  return `${Math.floor(h / 24)}d`
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unread, setUnread] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  const fetchNotifications = useCallback(() => {
    api.get('/notifications')
      .then(r => {
        setNotifications(r.data.notifications ?? [])
        setUnread(r.data.unreadCount ?? 0)
      })
      .catch(() => {})
  }, [])

  // Initial fetch + poll every 30s
  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  // Refresh immediately when opening the dropdown
  const handleOpen = () => {
    const willOpen = !open
    setOpen(willOpen)
    if (willOpen) fetchNotifications()
  }

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const markAllRead = async () => {
    // Optimistic update
    setNotifications(n => n.map(x => ({ ...x, read: true })))
    setUnread(0)
    // Persist and then sync from server to confirm
    await api.patch('/notifications/all/read').catch(() => {})
    fetchNotifications()
  }

  const markOneRead = async (id: string) => {
    const wasUnread = notifications.find(n => n.id === id)?.read === false
    // Optimistic update
    setNotifications(n => n.map(x => x.id === id ? { ...x, read: true } : x))
    if (wasUnread) setUnread(u => Math.max(0, u - 1))
    // Persist
    await api.patch(`/notifications/${id}/read`).catch(() => {})
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white"
        title="Notificaciones"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-power-red text-white text-[10px] font-black rounded-full flex items-center justify-center leading-none">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 bg-bg-elevated border border-border/60 rounded-xl shadow-2xl shadow-black/40 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
            <span className="font-montserrat font-bold text-sm text-text-primary flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notificaciones
              {unread > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-power-red text-white text-[10px] font-black leading-none">
                  {unread}
                </span>
              )}
            </span>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-xs text-white/50 hover:text-white/80 transition-colors font-montserrat"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Todo leído
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-10 text-center">
                <Bell className="w-8 h-8 text-white/20 mx-auto mb-2" />
                <p className="text-xs text-white/40 font-montserrat">Sin notificaciones</p>
                <p className="text-xs text-white/25 font-montserrat mt-1">Te avisaremos cuando algo pase</p>
              </div>
            ) : (
              notifications.map(notif => (
                <div
                  key={notif.id}
                  className={`flex items-start gap-3 px-4 py-3 border-b border-border/20 last:border-0 transition-colors ${
                    !notif.read ? 'bg-chakra-blue/5 hover:bg-chakra-blue/10' : 'hover:bg-bg-card/50'
                  }`}
                >
                  {/* Unread dot */}
                  {!notif.read && (
                    <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-chakra-blue mt-2" />
                  )}
                  {notif.read && <div className="flex-shrink-0 w-1.5" />}

                  <div className="flex-shrink-0 mt-0.5 w-7 h-7 rounded-full bg-bg-card border border-border/50 flex items-center justify-center">
                    {TYPE_ICON[notif.type] || <Bell className="w-3.5 h-3.5 text-white/40" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-text-primary font-montserrat leading-relaxed">{notif.message}</p>
                    {notif.guideId && (
                      <a
                        href={`/guides/${notif.guideId}`}
                        onClick={() => { markOneRead(notif.id); setOpen(false) }}
                        className="text-xs text-chakra-blue hover:text-chakra-blue/80 transition-colors truncate block mt-0.5"
                      >
                        {notif.guideTitle}
                      </a>
                    )}
                    <span className="text-[10px] text-white/30 mt-1 block">{timeAgo(notif.createdAt)}</span>
                  </div>

                  {!notif.read && (
                    <button
                      onClick={() => markOneRead(notif.id)}
                      className="flex-shrink-0 mt-1 p-1 rounded hover:bg-white/10 transition-colors text-white/30 hover:text-white/60"
                      title="Marcar como leída"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

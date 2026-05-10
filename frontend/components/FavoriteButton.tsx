'use client'

import { useEffect, useState } from 'react'
import { Bookmark } from 'lucide-react'
import api from '@/lib/api'

type FavoriteType = 'GUIDE' | 'NEWS' | 'PLAYER'

interface Props {
  type: FavoriteType
  targetId: string
  size?: 'sm' | 'md'
  className?: string
  /** Optional initial state to skip the lookup ping */
  initialFavorited?: boolean
}

export default function FavoriteButton({ type, targetId, size = 'md', className = '', initialFavorited }: Props) {
  const [favorited, setFavorited] = useState<boolean>(!!initialFavorited)
  const [loading, setLoading] = useState(false)
  const [authed, setAuthed] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const hasToken = !!localStorage.getItem('token')
    setAuthed(hasToken)
    if (!hasToken || initialFavorited !== undefined) return

    api.get('/favorites/check', { params: { type, ids: targetId } })
      .then(r => setFavorited(!!r.data?.map?.[targetId]))
      .catch(() => {})
  }, [type, targetId, initialFavorited])

  if (!authed) return null

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (loading) return
    setLoading(true)
    const next = !favorited
    setFavorited(next) // optimistic
    try {
      const r = await api.post('/favorites/toggle', { type, targetId })
      setFavorited(!!r.data?.favorited)
    } catch {
      setFavorited(!next) // revert
    } finally {
      setLoading(false)
    }
  }

  const dim = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'
  const pad = size === 'sm' ? 'p-1.5' : 'p-2'

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={favorited ? 'Quitar de favoritos' : 'Guardar en favoritos'}
      className={`${pad} rounded-lg transition-colors ${
        favorited
          ? 'text-accent-orange bg-accent-orange/10 hover:bg-accent-orange/20'
          : 'text-white/40 hover:text-accent-orange hover:bg-accent-orange/10'
      } ${className}`}
    >
      <Bookmark className={`${dim} ${favorited ? 'fill-current' : ''}`} />
    </button>
  )
}

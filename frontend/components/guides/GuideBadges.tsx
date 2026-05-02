'use client'

import { useState } from 'react'
import { Loader2, Plus } from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'
import api from '@/lib/api'

interface GuideBadgesProps {
  badges: string[]
  guideId?: string
  editable?: boolean
  size?: 'sm' | 'md'
  onBadgesChange?: (badges: string[]) => void
}

const BADGE_CONFIG: Record<string, { label: string; color: string; borderColor: string; image: string }> = {
  OFFICIAL: {
    label: 'Oficial',
    color: 'bg-chakra-blue/10 text-chakra-blue',
    borderColor: 'border-chakra-blue/40',
    image: '/images/guides/badges/badge-oficial.png',
  },
  TRENDING: {
    label: 'Tendencia',
    color: 'bg-accent-orange/10 text-accent-orange',
    borderColor: 'border-accent-orange/40',
    image: '/images/guides/badges/badge-tendencia.png',
  },
  VERIFIED: {
    label: 'Verificada',
    color: 'bg-chakra-blue/10 text-white/80',
    borderColor: 'border-white/20',
    image: '/images/guides/badges/badge-verificada.png',
  },
  COMPLETE: {
    label: 'Completa',
    color: 'bg-purple-500/10 text-purple-300',
    borderColor: 'border-purple-500/30',
    image: '/images/guides/badges/badge-completa.png',
  },
}

const AVAILABLE_BADGES = ['OFFICIAL', 'TRENDING', 'VERIFIED', 'COMPLETE']

export default function GuideBadges({ badges, guideId, editable = false, size = 'md', onBadgesChange }: GuideBadgesProps) {
  const { hasRole } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [localBadges, setLocalBadges] = useState(badges)

  const isEditMode = editable && hasRole(['ADMIN', 'MODERATOR'])

  const imgSize = size === 'sm' ? 'w-5 h-5' : 'w-7 h-7'
  const textSize = size === 'sm' ? 'text-[11px]' : 'text-xs'
  const padding = size === 'sm' ? 'px-2 py-1 gap-1.5' : 'px-3 py-1.5 gap-2'

  const handleToggle = (id: string) => {
    setLocalBadges(prev => prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id])
  }

  const handleSave = async () => {
    if (!guideId) return
    setSaving(true)
    try {
      await api.put(`/guides/${guideId}/badges`, { badges: localBadges })
      onBadgesChange?.(localBadges)
      setIsEditing(false)
    } catch (e: any) {
      alert(e.response?.data?.error || 'Error al guardar')
      setLocalBadges(badges)
    } finally {
      setSaving(false)
    }
  }

  if (isEditing && isEditMode) {
    return (
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_BADGES.map(id => {
            const cfg = BADGE_CONFIG[id]
            const selected = localBadges.includes(id)
            return (
              <button
                key={id}
                onClick={() => handleToggle(id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border font-montserrat font-semibold text-xs transition-all ${
                  selected ? `${cfg.color} ${cfg.borderColor} shadow-sm` : 'bg-bg-elevated border-border text-white/50 hover:border-white/30'
                }`}
              >
                <img src={cfg.image} alt={cfg.label} className="w-6 h-6 object-contain" />
                {cfg.label}
              </button>
            )
          })}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-1.5 bg-chakra-blue text-white rounded-lg font-montserrat font-semibold text-xs hover:bg-chakra-blue/80 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {saving && <Loader2 className="w-3 h-3 animate-spin" />}
            Guardar
          </button>
          <button
            onClick={() => { setIsEditing(false); setLocalBadges(badges) }}
            disabled={saving}
            className="px-4 py-1.5 bg-bg-card border border-border text-white rounded-lg font-montserrat font-semibold text-xs hover:border-white/30 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {badges.map(id => {
        const cfg = BADGE_CONFIG[id]
        if (!cfg) return null
        return (
          <span
            key={id}
            className={`flex items-center font-montserrat font-semibold rounded-xl border ${cfg.color} ${cfg.borderColor} ${padding}`}
            title={cfg.label}
          >
            <img src={cfg.image} alt={cfg.label} className={`${imgSize} object-contain`} />
            <span className={textSize}>{cfg.label}</span>
          </span>
        )
      })}

      {isEditMode && !isEditing && (
        <button
          onClick={() => setIsEditing(true)}
          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/40 hover:text-white"
          title="Editar badges"
        >
          <Plus className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

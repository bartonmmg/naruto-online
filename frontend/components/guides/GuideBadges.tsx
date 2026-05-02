'use client'

import { useState } from 'react'
import { X, Plus, Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'
import api from '@/lib/api'

interface GuideBadgesProps {
  badges: string[]
  guideId?: string
  editable?: boolean
  size?: 'sm' | 'md'
  onBadgesChange?: (badges: string[]) => void
}

const BADGE_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  OFFICIAL: { label: 'Oficial', color: 'bg-chakra-blue/20 text-chakra-blue border-chakra-blue/30', icon: '⭐' },
  TRENDING: { label: 'Tendencia', color: 'bg-accent-orange/20 text-accent-orange border-accent-orange/30', icon: '🔥' },
  VERIFIED: { label: 'Verificada', color: 'bg-nature-green/20 text-nature-green border-nature-green/30', icon: '✅' },
  COMPLETE: { label: 'Completa', color: 'bg-sage-gold/20 text-sage-gold border-sage-gold/30', icon: '🎯' },
}

const AVAILABLE_BADGES = ['OFFICIAL', 'TRENDING', 'VERIFIED', 'COMPLETE']

export default function GuideBadges({
  badges,
  guideId,
  editable = false,
  size = 'md',
  onBadgesChange,
}: GuideBadgesProps) {
  const { hasRole } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [localBadges, setLocalBadges] = useState(badges)

  const isEditMode = editable && hasRole(['ADMIN', 'MODERATOR'])

  const handleToggleBadge = (badgeId: string) => {
    if (localBadges.includes(badgeId)) {
      setLocalBadges(localBadges.filter(b => b !== badgeId))
    } else {
      setLocalBadges([...localBadges, badgeId])
    }
  }

  const handleSave = async () => {
    if (!guideId) return

    setSaving(true)
    try {
      await api.put(`/guides/${guideId}/badges`, { badges: localBadges })
      onBadgesChange?.(localBadges)
      setIsEditing(false)
    } catch (error: any) {
      console.error('Error saving badges:', error)
      alert(error.response?.data?.error || 'Error al guardar badges')
      setLocalBadges(badges)
    } finally {
      setSaving(false)
    }
  }

  if (isEditing && isEditMode) {
    return (
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_BADGES.map(badgeId => {
            const config = BADGE_CONFIG[badgeId]
            const isSelected = localBadges.includes(badgeId)

            return (
              <button
                key={badgeId}
                onClick={() => handleToggleBadge(badgeId)}
                className={`px-3 py-2 rounded-full border font-montserrat font-semibold text-xs transition-all ${
                  isSelected
                    ? config.color
                    : 'bg-bg-elevated border-border text-white/70 hover:border-white/30'
                }`}
              >
                {config.icon} {config.label}
              </button>
            )
          })}
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-chakra-blue text-white rounded-lg font-montserrat font-semibold text-sm hover:bg-chakra-blue/80 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Guardar
          </button>
          <button
            onClick={() => {
              setIsEditing(false)
              setLocalBadges(badges)
            }}
            disabled={saving}
            className="px-4 py-2 bg-bg-card border border-border text-white rounded-lg font-montserrat font-semibold text-sm hover:border-white/30 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {badges.map(badgeId => {
        const config = BADGE_CONFIG[badgeId]
        if (!config) return null

        const sizeClass = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-xs'

        return (
          <span
            key={badgeId}
            className={`font-montserrat font-semibold rounded-full border ${config.color} ${sizeClass}`}
          >
            {config.icon} {config.label}
          </span>
        )
      })}

      {isEditMode && !isEditing && (
        <button
          onClick={() => setIsEditing(true)}
          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white"
          title="Editar badges"
        >
          <Plus className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

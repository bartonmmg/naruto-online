'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, Clock } from 'lucide-react'
import { Guide, CATEGORY_LABELS, DIFFICULTY_LABELS } from '@/lib/types'
import GuideBadges from './GuideBadges'
import api from '@/lib/api'

function readingTime(html: string) {
  const text = html.replace(/<[^>]*>/g, ' ')
  const words = text.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}

function getDiffColor(d: string) {
  if (d === 'BASICO') return 'text-nature-green'
  if (d === 'INTERMEDIO') return 'text-sage-gold'
  return 'text-power-red'
}

interface Props {
  currentGuideId: string
  category: string
  difficulty: string
}

export default function RelatedGuides({ currentGuideId, category, difficulty }: Props) {
  const router = useRouter()
  const [related, setRelated] = useState<Guide[]>([])

  useEffect(() => {
    api.get('/guides').then(r => {
      const all: Guide[] = Array.isArray(r.data) ? r.data : []
      // Same category, not current guide, published only
      const sameCategory = all
        .filter(g => g.id !== currentGuideId && g.status === 'PUBLISHED' && g.category === category)
        .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
        .slice(0, 3)

      // If fewer than 3, fill with same difficulty from other categories
      if (sameCategory.length < 3) {
        const others = all
          .filter(g => g.id !== currentGuideId && g.status === 'PUBLISHED' && g.category !== category && g.difficulty === difficulty)
          .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
          .slice(0, 3 - sameCategory.length)
        setRelated([...sameCategory, ...others])
      } else {
        setRelated(sameCategory)
      }
    }).catch(() => {})
  }, [currentGuideId, category, difficulty])

  if (related.length === 0) return null

  return (
    <div className="mt-12 pt-8 border-t border-border/50">
      <h3 className="text-lg font-cinzel font-bold text-text-primary mb-5">Guías Relacionadas</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {related.map(guide => (
          <div
            key={guide.id}
            onClick={() => router.push(`/guides/${guide.id}`)}
            className="group bg-bg-card border border-border/50 rounded-xl p-4 hover:border-chakra-blue/40 hover:shadow-md hover:shadow-chakra-blue/10 transition-all cursor-pointer"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className={`text-xs font-cinzel font-bold ${getDiffColor(guide.difficulty)}`}>
                {DIFFICULTY_LABELS[guide.difficulty]}
              </span>
              {guide.badges && guide.badges.length > 0 && (
                <GuideBadges badges={guide.badges} size="sm" />
              )}
            </div>

            <h4 className="font-montserrat font-bold text-sm text-text-primary group-hover:text-chakra-blue transition-colors line-clamp-2 mb-3">
              {guide.title}
            </h4>

            <div className="flex items-center gap-3 text-xs text-white/40">
              <span>{CATEGORY_LABELS[guide.category] || guide.category}</span>
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {guide.viewCount || 0}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {readingTime(guide.content)}min
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

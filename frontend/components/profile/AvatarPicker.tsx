'use client'

import { X } from 'lucide-react'
import { avatarSrc } from '@/lib/types'
import { AVAILABLE_AVATARS } from '@/lib/profile-assets'

interface Props {
  current?: string | null
  onSelect: (slug: string) => void
  onClose: () => void
}

export default function AvatarPicker({ current, onSelect, onClose }: Props) {
  return (
    <div onClick={onClose} className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div onClick={e => e.stopPropagation()} className="bg-bg-card border border-border/60 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border/40">
          <h3 className="font-cinzel font-bold text-base text-text-primary">Elegí tu avatar</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="overflow-y-auto p-4 grid grid-cols-5 sm:grid-cols-6 gap-3">
          {AVAILABLE_AVATARS.map(slug => (
            <button
              key={slug}
              onClick={() => { onSelect(slug); onClose() }}
              className={`relative aspect-square rounded-full overflow-hidden border-2 transition-all hover:scale-105 ${
                current === slug ? 'border-accent-orange ring-2 ring-accent-orange/40' : 'border-border/50 hover:border-border'
              }`}
              title={slug}
            >
              <img
                src={avatarSrc(slug)}
                alt={slug}
                className="w-full h-full object-cover"
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/avatars/default.png' }}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

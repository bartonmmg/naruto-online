'use client'

import { X, Check } from 'lucide-react'
import { bannerSrc } from '@/lib/types'

const BANNERS = [
  'akatsuki-clouds', 'konoha-wall', 'chakra-blue', 'chakra-red', 'chakra-orange',
  'battle-arena', 'sand-village', 'mist-village', 'rain-village', 'rock-village',
]

interface Props {
  current?: string | null
  onSelect: (slug: string | null) => void
  onClose: () => void
}

export default function BannerPicker({ current, onSelect, onClose }: Props) {
  return (
    <div onClick={onClose} className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div onClick={e => e.stopPropagation()} className="bg-bg-card border border-border/60 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border/40">
          <h3 className="font-cinzel font-bold text-base text-text-primary">Elegí tu banner</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="overflow-y-auto p-4 space-y-3">
          {/* "None" option */}
          <button
            onClick={() => { onSelect(null); onClose() }}
            className={`relative w-full h-20 rounded-xl border-2 bg-bg-elevated text-white/40 text-xs font-montserrat font-semibold transition-all hover:scale-[1.01] ${
              !current ? 'border-accent-orange ring-2 ring-accent-orange/40' : 'border-border/50'
            }`}
          >
            Sin banner
            {!current && <Check className="absolute top-2 right-2 w-4 h-4 text-accent-orange" />}
          </button>
          {BANNERS.map(slug => (
            <button
              key={slug}
              onClick={() => { onSelect(slug); onClose() }}
              className={`relative w-full h-20 rounded-xl overflow-hidden border-2 transition-all hover:scale-[1.01] ${
                current === slug ? 'border-accent-orange ring-2 ring-accent-orange/40' : 'border-border/50'
              }`}
              title={slug}
            >
              <img
                src={bannerSrc(slug) ?? ''}
                alt={slug}
                className="w-full h-full object-cover"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <span className="absolute bottom-2 left-3 text-xs font-montserrat font-semibold text-white capitalize">
                {slug.replace(/-/g, ' ')}
              </span>
              {current === slug && <Check className="absolute top-2 right-2 w-4 h-4 text-accent-orange" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

'use client'

import { Lock, Check, X } from 'lucide-react'
import { frameSrc } from '@/lib/types'
import { FRAMES } from '@/lib/profile-assets'

interface Props {
  current?: string | null
  userLevel: number
  onSelect: (slug: string | null) => void
  onClose: () => void
}

export default function FramePicker({ current, userLevel, onSelect, onClose }: Props) {
  return (
    <div onClick={onClose} className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div onClick={e => e.stopPropagation()} className="bg-bg-card border border-border/60 rounded-2xl max-w-md w-full overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border/40">
          <h3 className="font-cinzel font-bold text-base text-text-primary">Elegí tu marco</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-4 grid grid-cols-3 gap-3">
          <button
            onClick={() => { onSelect(null); onClose() }}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all ${
              !current ? 'border-accent-orange' : 'border-border/40 hover:border-border'
            }`}
          >
            <div className="w-16 h-16 rounded-full bg-bg-elevated border border-dashed border-white/20" />
            <span className="text-[10px] text-white/50 font-montserrat">Sin marco</span>
          </button>
          {FRAMES.map(f => {
            const unlocked = userLevel >= f.minLevel
            const selected = current === f.slug
            return (
              <button
                key={f.slug}
                onClick={() => { if (unlocked) { onSelect(f.slug); onClose() } }}
                disabled={!unlocked}
                className={`relative flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all ${
                  selected ? 'border-accent-orange' : 'border-border/40 hover:border-border'
                } ${!unlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={unlocked ? f.label : `Nivel ${f.minLevel} requerido`}
              >
                <div className="relative w-16 h-16">
                  <div className="absolute inset-2 rounded-full bg-bg-elevated" />
                  <img
                    src={frameSrc(f.slug) ?? ''}
                    alt={f.label}
                    className="absolute inset-0 w-full h-full"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                  />
                </div>
                <span className="text-[10px] text-white/70 font-montserrat font-semibold">{f.label}</span>
                {!unlocked && (
                  <span className="absolute top-1 right-1 bg-bg-elevated rounded-full p-1">
                    <Lock className="w-2.5 h-2.5 text-white/40" />
                  </span>
                )}
                {selected && (
                  <span className="absolute top-1 right-1 bg-accent-orange rounded-full p-1">
                    <Check className="w-2.5 h-2.5 text-bg-primary" />
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

'use client'

import { NAME_COLORS as COLORS } from '@/lib/profile-assets'

interface Props {
  current?: string | null
  onSelect: (color: string | null) => void
}

export default function ColorPicker({ current, onSelect }: Props) {
  return (
    <div className="flex flex-wrap gap-2 items-center">
      <button
        onClick={() => onSelect(null)}
        className={`w-8 h-8 rounded-full border-2 bg-bg-elevated flex items-center justify-center text-[10px] font-bold ${
          !current ? 'border-white' : 'border-border'
        }`}
        title="Default"
      >
        ✕
      </button>
      {COLORS.map(c => (
        <button
          key={c}
          onClick={() => onSelect(c)}
          className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
            current === c ? 'border-white ring-2 ring-white/30' : 'border-border'
          }`}
          style={{ backgroundColor: c }}
          title={c}
        />
      ))}
    </div>
  )
}

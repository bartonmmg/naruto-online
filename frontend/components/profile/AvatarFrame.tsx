'use client'

import { avatarSrc, frameSrc } from '@/lib/types'

interface Props {
  avatarSlug?: string | null
  frameSlug?: string | null
  size?: number  // px
  className?: string
}

// Tuning knobs for how the frame sits around the avatar.
// Calibrated against the genin.png frame:
//   - PNG is 256×256, inner transparent hole is ~154px diameter
//     → FRAME_SCALE = 256/154 ≈ 1.66 to make hole match avatar size
//   - Hole is centered horizontally but shifted ~7px UP in the PNG
//     → FRAME_Y_OFFSET ≈ 0.045 (positive = move frame down so hole aligns with avatar)
const FRAME_SCALE = 1.66
const FRAME_Y_OFFSET = 0.045
const FRAME_X_OFFSET = 0

export default function AvatarFrame({ avatarSlug, frameSlug, size = 96, className = '' }: Props) {
  const frame = frameSrc(frameSlug)
  const frameSize = Math.round(size * FRAME_SCALE)
  const baseOffset = Math.round((frameSize - size) / 2)
  const top  = -baseOffset + Math.round(size * FRAME_Y_OFFSET)
  const left = -baseOffset + Math.round(size * FRAME_X_OFFSET)
  return (
    <div className={`relative shrink-0 ${className}`} style={{ width: size, height: size }}>
      {/* Avatar — full container, perfectly circular */}
      <img
        src={avatarSrc(avatarSlug)}
        alt="avatar"
        className="absolute inset-0 w-full h-full rounded-full object-cover"
        onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/avatars/default.png' }}
      />
      {/* Frame — overflowing the avatar so its decorative ring sits around it */}
      {frame && (
        <img
          src={frame}
          alt=""
          aria-hidden
          className="absolute pointer-events-none max-w-none"
          style={{ width: frameSize, height: frameSize, top, left }}
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
        />
      )}
    </div>
  )
}

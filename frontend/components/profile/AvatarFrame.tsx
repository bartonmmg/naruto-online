'use client'

import { avatarSrc, frameSrc } from '@/lib/types'

interface Props {
  avatarSlug?: string | null
  frameSlug?: string | null
  size?: number  // px
  className?: string
}

// Frame images are larger than the avatar by this factor — their inner hole
// matches the avatar's diameter exactly. If you change the source frames,
// adjust this so the frame's inner ring lines up with the avatar circle.
const FRAME_SCALE = 1.35

export default function AvatarFrame({ avatarSlug, frameSlug, size = 96, className = '' }: Props) {
  const frame = frameSrc(frameSlug)
  const frameSize = Math.round(size * FRAME_SCALE)
  const offset = Math.round((frameSize - size) / 2)
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
          style={{ width: frameSize, height: frameSize, top: -offset, left: -offset }}
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
        />
      )}
    </div>
  )
}

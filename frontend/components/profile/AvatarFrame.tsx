'use client'

import { avatarSrc, frameSrc } from '@/lib/types'

interface Props {
  avatarSlug?: string | null
  frameSlug?: string | null
  size?: number  // px
  className?: string
}

export default function AvatarFrame({ avatarSlug, frameSlug, size = 96, className = '' }: Props) {
  const frame = frameSrc(frameSlug)
  // Avatar is slightly smaller and centered so the frame's outer ring sits around it.
  const avatarPad = Math.round(size * 0.10) // 10% padding on each side
  const innerSize = size - avatarPad * 2
  return (
    <div className={`relative shrink-0 ${className}`} style={{ width: size, height: size }}>
      <img
        src={avatarSrc(avatarSlug)}
        alt="avatar"
        className="absolute rounded-full object-cover"
        style={{ top: avatarPad, left: avatarPad, width: innerSize, height: innerSize }}
        onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/avatars/default.png' }}
      />
      {frame && (
        <img
          src={frame}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full pointer-events-none"
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
        />
      )}
    </div>
  )
}

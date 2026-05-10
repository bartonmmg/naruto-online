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
  return (
    <div className={`relative shrink-0 ${className}`} style={{ width: size, height: size }}>
      <img
        src={avatarSrc(avatarSlug)}
        alt="avatar"
        className="absolute inset-0 w-full h-full rounded-full object-cover"
        onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/avatars/default.png' }}
      />
      {frame && (
        <img
          src={frame}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ width: size * 1.15, height: size * 1.15, top: -size * 0.075, left: -size * 0.075 }}
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
        />
      )}
    </div>
  )
}

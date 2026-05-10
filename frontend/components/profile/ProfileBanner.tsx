'use client'

import { bannerSrc } from '@/lib/types'
import AvatarFrame from './AvatarFrame'

interface Props {
  bannerSlug?: string | null
  avatarSlug?: string | null
  frameSlug?: string | null
  height?: number
}

export default function ProfileBanner({
  bannerSlug,
  avatarSlug,
  frameSlug,
  height = 220,
}: Props) {
  const banner = bannerSrc(bannerSlug)
  return (
    <div className="relative w-full" style={{ height }}>
      {banner ? (
        <img
          src={banner}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-bg-card via-bg-elevated to-bg-card" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/40 to-transparent" />
      {/* Avatar floating bottom-left */}
      <div className="absolute bottom-0 left-6 md:left-12 translate-y-1/2">
        <div className="ring-4 ring-bg-primary rounded-full">
          <AvatarFrame avatarSlug={avatarSlug} frameSlug={frameSlug} size={140} />
        </div>
      </div>
    </div>
  )
}

'use client'

import { Twitch, Youtube, MessageCircle, Gamepad2 } from 'lucide-react'
import type { SocialLinks as SocialLinksType } from '@/lib/types'

export default function SocialLinks({ links }: { links: SocialLinksType }) {
  const items = [
    links.twitch ? {
      key: 'twitch', label: links.twitch, href: `https://twitch.tv/${links.twitch.replace(/^@/, '')}`,
      Icon: Twitch, color: 'text-[#9146FF]',
    } : null,
    links.youtube ? {
      key: 'youtube', label: links.youtube, href: `https://youtube.com/@${links.youtube.replace(/^@/, '')}`,
      Icon: Youtube, color: 'text-red-500',
    } : null,
    links.discord ? {
      key: 'discord', label: links.discord, href: '#', Icon: MessageCircle, color: 'text-[#5865F2]',
    } : null,
    links.ingameName ? {
      key: 'ingame', label: `In-game: ${links.ingameName}`, href: '#', Icon: Gamepad2, color: 'text-accent-orange',
    } : null,
  ].filter(Boolean) as { key: string; label: string; href: string; Icon: any; color: string }[]

  if (items.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      {items.map(it => {
        const isClickable = it.href !== '#'
        const Wrapper = isClickable ? 'a' : 'span'
        const props = isClickable ? { href: it.href, target: '_blank', rel: 'noopener noreferrer' } : {}
        return (
          <Wrapper
            key={it.key}
            {...props}
            className={`flex items-center gap-1.5 px-2.5 h-7 rounded-full text-xs font-montserrat bg-bg-elevated border border-border ${isClickable ? 'hover:border-white/30 cursor-pointer' : ''}`}
            title={it.label}
          >
            <it.Icon className={`w-3 h-3 ${it.color}`} />
            <span className="text-white/70 truncate max-w-[140px]">{it.label}</span>
          </Wrapper>
        )
      })}
    </div>
  )
}

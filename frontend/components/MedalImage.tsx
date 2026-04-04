'use client'

import { useState } from 'react'

interface MedalImageProps {
  src: string
  emoji: string
  alt: string
  className?: string
}

export default function MedalImage({ src, emoji, alt, className = '' }: MedalImageProps) {
  const [imgFailed, setImgFailed] = useState(false)

  if (imgFailed) {
    return <span className="text-3xl">{emoji}</span>
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setImgFailed(true)}
    />
  )
}

import React from 'react'

interface ChakraGlowProps {
  children: React.ReactNode
  color?: 'blue' | 'red' | 'gold' | 'purple'
}

export default function ChakraGlow({ children, color = 'blue' }: ChakraGlowProps) {
  const colorClasses = {
    blue: 'chakra-glow-hover shadow-chakra-glow',
    red: 'power-glow-hover shadow-power-glow',
    gold: 'sage-glow-hover shadow-sage-glow',
    purple: 'genjutsu-glow-hover shadow-genjutsu-glow',
  }

  return (
    <div className={`${colorClasses[color]} animate-glow-pulse rounded-lg p-4`}>
      {children}
    </div>
  )
}

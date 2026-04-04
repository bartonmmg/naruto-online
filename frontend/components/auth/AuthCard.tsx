'use client'

import React from 'react'
import Link from 'next/link'

interface AuthCardProps {
  title: string
  subtitle?: string
  children: React.ReactNode
}

export default function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4 grid-bg relative overflow-hidden">

      {/* Ambient orbs */}
      <div className="fixed top-0 left-1/4 w-96 h-96 orb-orange opacity-40 pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-80 h-80 orb-blue opacity-30 pointer-events-none" />

      {/* Floating symbols - background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <span className="absolute top-16 left-12 text-accent-orange/8 text-7xl font-cinzel select-none animate-float" style={{ animationDelay: '0s' }}>火</span>
        <span className="absolute bottom-24 left-8 text-chakra-blue/8 text-6xl font-cinzel select-none animate-float" style={{ animationDelay: '1.5s' }}>水</span>
        <span className="absolute top-1/3 right-12 text-sage-gold/8 text-7xl font-cinzel select-none animate-float" style={{ animationDelay: '3s' }}>風</span>
        <span className="absolute bottom-1/3 right-16 text-power-red/8 text-5xl font-cinzel select-none animate-float" style={{ animationDelay: '4.5s' }}>忍</span>
        <span className="absolute top-1/2 left-1/3 text-accent-orange/5 text-9xl font-cinzel select-none animate-bounce-slow" style={{ animationDelay: '2s' }}>☯</span>
      </div>

      <div className="relative w-full max-w-[420px] z-10 animate-fade-up">

        {/* Brand header */}
        <Link href="/" className="flex items-center gap-3 justify-center mb-8 group">
          <span className="text-power-red/70 text-2xl font-cinzel select-none group-hover:text-power-red transition-colors leading-none">忍</span>
          <span className="font-cinzel font-black text-xl text-text-primary tracking-[0.25em] group-hover:text-power-red transition-colors">
            HD<span className="text-power-red">RV</span>
          </span>
        </Link>

        {/* Card */}
        <div className="bg-bg-card border border-border rounded-2xl p-8 shadow-card glow-border-orange">

          {/* Title block */}
          <div className="mb-8">
            <h1 className="text-2xl font-cinzel font-black text-text-primary tracking-wide leading-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-text-muted mt-1.5">{subtitle}</p>
            )}
            <div className="divider-orange mt-4" />
          </div>

          {children}
        </div>

        {/* Bottom decoration */}
        <p className="text-center text-text-dim text-xs mt-6 font-cinzel tracking-widest">
          HDRV • Naruto Online Community
        </p>
      </div>
    </div>
  )
}

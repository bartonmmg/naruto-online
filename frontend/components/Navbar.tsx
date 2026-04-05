'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import Button from './ui/Button'

const navLinks = [
  { href: '#features',  label: 'Características' },
  { href: '#community', label: 'Comunidad' },
  { href: '/rankings',  label: 'Rankings' },
  { href: '/tools',     label: 'Herramientas' },
  { href: '/guides',    label: 'Guías' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      scrolled
        ? 'bg-bg-primary/95 backdrop-blur-2xl border-b border-power-red/20 shadow-lg shadow-power-red/10'
        : 'bg-transparent border-b border-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

        {/* Logo — HDRV + kanji */}
        <Link href="/" className="flex items-center gap-3 group">
          <span className="text-power-red/80 text-2xl font-cinzel select-none group-hover:text-power-red transition-all duration-300 transform group-hover:scale-125 leading-none">忍</span>
          <div className="flex items-baseline gap-0">
            <span className="font-cinzel font-black text-lg tracking-[0.05em] text-text-primary group-hover:text-power-red transition-all duration-300" style={{ textShadow: 'group-hover' }}>H</span>
            <span className="font-cinzel font-black text-lg tracking-[0.05em] text-text-primary group-hover:text-power-red transition-all duration-300">D</span>
            <span className="font-cinzel font-black text-lg tracking-[0.05em] text-power-red group-hover:drop-shadow-[0_0_12px_rgba(196,30,58,0.8)] transition-all duration-300" style={{ textShadow: '0 0 10px rgba(196,30,58,0.6)' }}>R</span>
            <span className="font-cinzel font-black text-lg tracking-[0.05em] text-power-red group-hover:drop-shadow-[0_0_12px_rgba(196,30,58,0.8)] transition-all duration-300" style={{ textShadow: '0 0 10px rgba(196,30,58,0.6)' }}>V</span>
          </div>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-10">
          {navLinks.map(({ href, label }) => (
            href.startsWith('#') ? (
              <a
                key={href}
                href={href}
                className="text-sm font-montserrat font-semibold text-white/70 hover:text-power-red transition-colors duration-200 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-power-red after:transition-all after:duration-300 hover:after:w-full"
              >
                {label}
              </a>
            ) : (
              <Link
                key={href}
                href={href}
                className="text-sm font-montserrat font-semibold text-white/70 hover:text-power-red transition-colors duration-200 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-power-red after:transition-all after:duration-300 hover:after:w-full"
              >
                {label}
              </Link>
            )
          ))}
        </div>

        {/* Desktop auth */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/auth/login" className="group px-6 py-2.5 text-sm font-montserrat font-semibold text-white/70 hover:text-white/90 transition-all duration-200 border border-white/15 rounded-lg hover:border-white/30 hover:bg-white/5">
            Entrar
          </Link>
          <Link href="/auth/register" className="group px-7 py-2.5 text-sm font-montserrat font-semibold text-white bg-gradient-to-r from-orange-600 to-orange-500 rounded-lg hover:shadow-md hover:shadow-orange-500/30 transition-all duration-200 hover:scale-105 active:scale-95 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-700 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative z-10">Registrarse</span>
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 text-white/70 hover:text-power-red transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-bg-primary/98 backdrop-blur-xl border-b border-power-red/20 px-6 py-6 flex flex-col gap-4 animate-fade-up">
          {navLinks.map(({ href, label }) => (
            href.startsWith('#') ? (
              <a
                key={href}
                href={href}
                className="font-montserrat text-sm font-semibold text-white/70 hover:text-power-red transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </a>
            ) : (
              <Link
                key={href}
                href={href}
                className="font-montserrat text-sm font-semibold text-white/70 hover:text-power-red transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </Link>
            )
          ))}
          <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-2" />
          <div className="flex flex-col gap-3 pt-2">
            <Link href="/auth/login" className="group px-4 py-2 text-sm font-montserrat font-semibold text-white/70 hover:text-white/90 transition-all border border-white/15 rounded-lg text-center hover:border-white/30 hover:bg-white/5" onClick={() => setMenuOpen(false)}>
              Entrar
            </Link>
            <Link href="/auth/register" className="group px-4 py-2 text-sm font-montserrat font-semibold text-white bg-gradient-to-r from-orange-600 to-orange-500 rounded-lg text-center hover:shadow-md hover:shadow-orange-500/30 relative overflow-hidden" onClick={() => setMenuOpen(false)}>
              <div className="absolute inset-0 bg-gradient-to-r from-orange-700 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative z-10">Registrarse</span>
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}

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
        ? 'bg-bg-primary/92 backdrop-blur-xl border-b border-border shadow-[0_1px_0_rgba(196,30,58,0.2)]'
        : 'bg-transparent border-b border-transparent'
    }`}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo — HDRV + kanji */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="text-power-red/80 text-lg font-cinzel select-none group-hover:text-power-red transition-all duration-300 transform group-hover:scale-110 leading-none">忍</span>
          <div className="flex items-baseline gap-0.5">
            <span className="font-cinzel font-black text-sm tracking-[0.1em] text-text-primary group-hover:text-power-red transition-all duration-300" style={{ textShadow: 'group-hover' }}>H</span>
            <span className="font-cinzel font-black text-sm tracking-[0.1em] text-text-primary group-hover:text-power-red transition-all duration-300">D</span>
            <span className="font-cinzel font-black text-sm tracking-[0.1em] text-power-red group-hover:drop-shadow-[0_0_10px_rgba(196,30,58,0.6)] transition-all duration-300" style={{ textShadow: '0 0 8px rgba(196,30,58,0.4)' }}>R</span>
            <span className="font-cinzel font-black text-sm tracking-[0.1em] text-power-red group-hover:drop-shadow-[0_0_10px_rgba(196,30,58,0.6)] transition-all duration-300" style={{ textShadow: '0 0 8px rgba(196,30,58,0.4)' }}>V</span>
          </div>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map(({ href, label }) => (
            href.startsWith('#') ? (
              <a
                key={href}
                href={href}
                className="text-xs font-cinzel text-[#B0B0B0] hover:text-text-primary tracking-widest transition-colors duration-200"
              >
                {label}
              </a>
            ) : (
              <Link
                key={href}
                href={href}
                className="text-xs font-cinzel text-[#B0B0B0] hover:text-text-primary tracking-widest transition-colors duration-200"
              >
                {label}
              </Link>
            )
          ))}
        </div>

        {/* Desktop auth */}
        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/auth/login" className="font-cinzel tracking-widest text-xs">Entrar</Link>
          </Button>
          <Button variant="power" size="sm" asChild>
            <Link href="/auth/register" className="font-cinzel tracking-widest text-xs">Registrarse</Link>
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 text-[#B0B0B0] hover:text-power-red transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-bg-primary/95 backdrop-blur-xl border-b border-border px-6 py-6 flex flex-col gap-4 animate-fade-up">
          {navLinks.map(({ href, label }) => (
            href.startsWith('#') ? (
              <a
                key={href}
                href={href}
                className="font-cinzel text-xs text-[#B0B0B0] hover:text-text-primary transition-colors tracking-widest"
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </a>
            ) : (
              <Link
                key={href}
                href={href}
                className="font-cinzel text-xs text-[#B0B0B0] hover:text-text-primary transition-colors tracking-widest"
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </Link>
            )
          ))}
          <div className="divider-red" />
          <div className="flex flex-col gap-3 pt-1">
            <Link href="/auth/login" className="font-cinzel text-xs text-text-primary hover:text-power-red transition-colors tracking-widest" onClick={() => setMenuOpen(false)}>
              Entrar
            </Link>
            <Link href="/auth/register" className="font-cinzel text-xs text-power-red font-bold hover:text-power-dark transition-colors tracking-widest" onClick={() => setMenuOpen(false)}>
              Registrarse →
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}

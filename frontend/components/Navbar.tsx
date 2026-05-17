'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Menu, X, LogOut, Trophy, Bookmark, ChevronDown } from 'lucide-react'
import Button from './ui/Button'
import { useAuth } from '@/lib/hooks/useAuth'
import NotificationBell from './NotificationBell'

type NavLink = {
  href: string
  label: string
  children?: { href: string; label: string; disabled?: boolean }[]
}

const navLinks: NavLink[] = [
  { href: '/novedades', label: 'Novedades' },
  { href: '/rankings',  label: 'Rankings' },
  {
    href: '/centro-de-datos',
    label: 'Centro de Datos',
    children: [
      { href: '/centro-de-datos/ninjas', label: 'Ninjas' },
      { href: '/centro-de-datos/modas',     label: 'Modas',              disabled: true },
      { href: '/centro-de-datos/espiritus', label: 'Espíritus Animales', disabled: true },
      { href: '/centro-de-datos/main',      label: 'Main' },
    ],
  },
  { href: '/tools',     label: 'Herramientas' },
  { href: '/events',    label: 'Eventos' },
  { href: '/guides',    label: 'Guías' },
  { href: '/faq',       label: 'FAQ' },
]

export default function Navbar() {
  const router = useRouter()
  const { isLoggedIn, user, logout } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleLogout = () => {
    logout()
    router.push('/')
    setMenuOpen(false)
  }

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
          {navLinks.map((link) => (
            <DesktopNavItem key={link.href} link={link} />
          ))}
        </div>

        {/* Desktop auth */}
        <div className="hidden md:flex items-center gap-3">
          {isLoggedIn && user ? (
            <>
              <Link
                href="/guides/leaderboard"
                className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white"
                title="Leaderboard"
              >
                <Trophy className="w-5 h-5" />
              </Link>
              <Link
                href="/favorites"
                className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white"
                title="Mis favoritos"
              >
                <Bookmark className="w-5 h-5" />
              </Link>
              <NotificationBell />
              <Link href="/dashboard" className="text-sm font-montserrat font-semibold text-white/70 hover:text-power-red transition-colors px-2">
                {user.username}
              </Link>
              <button
                onClick={handleLogout}
                className="group px-5 py-2 text-sm font-montserrat font-semibold text-white/70 hover:text-power-red transition-all duration-200 border border-white/15 rounded-lg hover:border-white/30 hover:bg-white/5 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Salir
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="group px-6 py-2.5 text-sm font-montserrat font-semibold text-white/70 hover:text-white/90 transition-all duration-200 border border-white/15 rounded-lg hover:border-white/30 hover:bg-white/5">
                Entrar
              </Link>
              <Link href="/auth/register" className="group px-7 py-2.5 text-sm font-montserrat font-semibold text-white bg-gradient-to-r from-orange-600 to-orange-500 rounded-lg hover:shadow-md hover:shadow-orange-500/30 transition-all duration-200 hover:scale-105 active:scale-95 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-700 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative z-10">Registrarse</span>
              </Link>
            </>
          )}
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
          {navLinks.map((link) => (
            <div key={link.href} className="flex flex-col gap-2">
              <Link
                href={link.href}
                className="font-montserrat text-sm font-semibold text-white/70 hover:text-power-red transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
              {link.children && (
                <div className="flex flex-col gap-1.5 pl-4 border-l border-white/10">
                  {link.children.map((c) =>
                    c.disabled ? (
                      <span key={c.href} className="font-montserrat text-xs text-white/30 cursor-not-allowed">
                        {c.label} <span className="opacity-60">(Próximamente)</span>
                      </span>
                    ) : (
                      <Link
                        key={c.href}
                        href={c.href}
                        className="font-montserrat text-xs font-medium text-white/60 hover:text-power-red transition-colors"
                        onClick={() => setMenuOpen(false)}
                      >
                        {c.label}
                      </Link>
                    )
                  )}
                </div>
              )}
            </div>
          ))}
          <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-2" />
          <div className="flex flex-col gap-3 pt-2">
            {isLoggedIn && user ? (
              <>
                <Link href="/dashboard" className="text-sm font-montserrat font-semibold text-white/70 hover:text-power-red transition-colors py-2 px-4" onClick={() => setMenuOpen(false)}>
                  {user.username}
                </Link>
                <button
                  onClick={handleLogout}
                  className="group px-4 py-2 text-sm font-montserrat font-semibold text-white/70 hover:text-power-red transition-all border border-white/15 rounded-lg text-center hover:border-white/30 hover:bg-white/5 flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Salir
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="group px-4 py-2 text-sm font-montserrat font-semibold text-white/70 hover:text-white/90 transition-all border border-white/15 rounded-lg text-center hover:border-white/30 hover:bg-white/5" onClick={() => setMenuOpen(false)}>
                  Entrar
                </Link>
                <Link href="/auth/register" className="group px-4 py-2 text-sm font-montserrat font-semibold text-white bg-gradient-to-r from-orange-600 to-orange-500 rounded-lg text-center hover:shadow-md hover:shadow-orange-500/30 relative overflow-hidden" onClick={() => setMenuOpen(false)}>
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-700 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative z-10">Registrarse</span>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

/** Item del navbar desktop. Si tiene `children`, abre dropdown on hover. */
function DesktopNavItem({ link }: { link: NavLink }) {
  const [open, setOpen] = useState(false)

  const linkClasses =
    'text-sm font-montserrat font-semibold text-white/70 hover:text-power-red transition-colors duration-200 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-power-red after:transition-all after:duration-300 hover:after:w-full'

  if (!link.children) {
    return (
      <Link href={link.href} className={linkClasses}>
        {link.label}
      </Link>
    )
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Link href={link.href} className={`${linkClasses} flex items-center gap-1`}>
        {link.label}
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </Link>
      {open && (
        <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 w-56 z-50">
          <div className="bg-bg-primary/98 backdrop-blur-xl border border-white/10 rounded-lg shadow-xl shadow-black/40 overflow-hidden">
            {link.children.map((c) =>
              c.disabled ? (
                <div
                  key={c.href}
                  className="px-4 py-2.5 text-xs font-montserrat text-white/30 cursor-not-allowed flex items-center justify-between"
                >
                  <span>{c.label}</span>
                  <span className="text-[9px] uppercase tracking-wider opacity-60">Próx.</span>
                </div>
              ) : (
                <Link
                  key={c.href}
                  href={c.href}
                  className="block px-4 py-2.5 text-xs font-montserrat font-semibold text-white/70 hover:text-power-red hover:bg-white/5 transition-colors"
                >
                  {c.label}
                </Link>
              )
            )}
          </div>
        </div>
      )}
    </div>
  )
}

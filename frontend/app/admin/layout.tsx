'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { Settings, Zap, ChevronLeft, Loader2, Users } from 'lucide-react'

const TABS = [
  { href: '/admin/xp',    label: 'XP & Niveles', icon: <Zap className="w-4 h-4" /> },
  { href: '/admin/roles', label: 'Roles',         icon: <Users className="w-4 h-4" /> },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { hasRole, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoading && !hasRole(['ADMIN'])) {
      router.replace('/dashboard')
    }
  }, [isLoading, hasRole, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent-orange" />
      </div>
    )
  }

  if (!hasRole(['ADMIN'])) return null

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      {/* Top bar */}
      <header className="fixed top-0 left-0 right-0 z-40 h-14 border-b border-border bg-bg-primary/95 backdrop-blur-xl flex items-center px-6 gap-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white/90 transition-colors font-montserrat flex-shrink-0"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Dashboard
        </Link>

        <div className="w-px h-5 bg-border/60" />

        <div className="flex items-center gap-2 text-white/80">
          <Settings className="w-4 h-4 text-accent-orange" />
          <span className="font-cinzel font-bold text-sm tracking-wide">Back Office</span>
          <span className="text-xs text-white/30 font-montserrat">— Solo Administradores</span>
        </div>
      </header>

      {/* Side nav + content */}
      <div className="flex flex-1 pt-14">
        {/* Sidebar */}
        <aside className="w-52 flex-shrink-0 border-r border-border/50 bg-bg-card/30 flex flex-col pt-6 px-3">
          <p className="text-[10px] font-montserrat font-semibold text-white/30 uppercase tracking-widest px-3 mb-3">
            Secciones
          </p>
          <nav className="space-y-1">
            {TABS.map(tab => {
              const active = pathname === tab.href
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-montserrat font-semibold transition-all ${
                    active
                      ? 'bg-accent-orange/15 text-accent-orange border border-accent-orange/30'
                      : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

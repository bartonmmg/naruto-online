'use client'

import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

interface Props {
  name: string
  title?: string
  kind?: 'NINJA' | 'MAIN'
}

export default function NinjaBreadcrumb({ name, title, kind = 'NINJA' }: Props) {
  const sectionHref = kind === 'MAIN' ? '/centro-de-datos/main' : '/centro-de-datos/ninjas'
  const sectionLabel = kind === 'MAIN' ? 'Main' : 'Ninjas'
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-1.5 text-xs text-text-muted mb-6 overflow-hidden"
    >
      <Link
        href="/centro-de-datos"
        className="flex items-center gap-1.5 hover:text-text-primary transition-colors"
      >
        <Home size={13} />
        <span>Centro de Datos</span>
      </Link>
      <ChevronRight size={12} className="text-text-dim flex-shrink-0" />
      <Link href={sectionHref} className="hover:text-text-primary transition-colors">
        {sectionLabel}
      </Link>
      <ChevronRight size={12} className="text-text-dim flex-shrink-0" />
      <span className="text-text-primary truncate">
        {name}
        {title && <span className="text-text-muted ml-1">{title}</span>}
      </span>
    </nav>
  )
}

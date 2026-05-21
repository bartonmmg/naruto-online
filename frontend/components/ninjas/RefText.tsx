'use client'

import { Fragment } from 'react'
import Link from 'next/link'
import { findNinja, useNinjaIndex } from '@/lib/hooks/useNinjaIndex'

interface Props {
  text: string
  /** Color del link. Si no se pasa, usa accent-orange. */
  linkClassName?: string
}

/**
 * Renderiza un texto plano reemplazando referencias `{Nombre}` o
 * `{Nombre (Variante)}` por links al detalle del ninja correspondiente.
 *
 * Si el índice todavía no cargó, o el ninja referenciado no existe en el
 * catálogo, se muestra el nombre sin las llaves (sin link).
 *
 * Futuro: extender para reconocer otros tipos de referencias (skills, espíritus
 * animales, modas) cuando esos catálogos también estén modelados.
 */
export default function RefText({ text, linkClassName }: Props) {
  const index = useNinjaIndex()
  if (!text) return null

  // Partir el texto en segmentos: { ref } vs texto plano
  const segments: Array<{ type: 'text' | 'ref'; value: string }> = []
  let lastIdx = 0
  const re = /\{([^}]+)\}/g
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) {
    if (m.index > lastIdx) segments.push({ type: 'text', value: text.slice(lastIdx, m.index) })
    segments.push({ type: 'ref', value: m[1] })
    lastIdx = m.index + m[0].length
  }
  if (lastIdx < text.length) segments.push({ type: 'text', value: text.slice(lastIdx) })

  // Si no hay refs, devolver el texto plano
  if (!segments.some((s) => s.type === 'ref')) {
    return <>{text}</>
  }

  const linkCls = linkClassName ?? 'text-accent-orange hover:underline font-medium'

  return (
    <>
      {segments.map((seg, i) => {
        if (seg.type === 'text') return <Fragment key={i}>{seg.value}</Fragment>

        const ninja = index ? findNinja(index, seg.value) : null
        if (ninja) {
          return (
            <Link
              key={i}
              href={`/centro-de-datos/ninjas/${ninja.slug || ninja.id}`}
              className={linkCls}
              title={`Ver ${ninja.name}${ninja.title ? ' ' + ninja.title : ''}`}
            >
              {seg.value}
            </Link>
          )
        }
        // Index no cargado o ref no encontrada: mostrar sin llaves
        return (
          <span key={i} className="text-text-primary font-medium">
            {seg.value}
          </span>
        )
      })}
    </>
  )
}

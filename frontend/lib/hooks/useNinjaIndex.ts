'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { NinjaListResponse } from '@/lib/types'

/**
 * Índice ligero de todas las cartas del catálogo (NINJA + MAIN) para hacer
 * lookup por `name` + `title` rápido — usado para resolver referencias `{X}`
 * en intros y otras descripciones a links al detalle.
 *
 * Cache compartido (memoria + sessionStorage) para que no se pague el costo de
 * cargar 400+ entries en cada vista que necesite resolver refs.
 */
export interface IndexEntry {
  id: number
  name: string
  title: string
  kind: 'NINJA' | 'MAIN'
}

const CACHE_KEY = 'ninja-index-v1'
let memCache: IndexEntry[] | null = null
let inFlight: Promise<IndexEntry[]> | null = null

async function fetchKind(kind: 'NINJA' | 'MAIN'): Promise<IndexEntry[]> {
  const out: IndexEntry[] = []
  let offset = 0
  while (out.length < 2000) {
    const r = await api.get<NinjaListResponse>('/game/ninjas', {
      params: { kind, sort: 'name', limit: 100, offset },
    })
    for (const n of r.data.items) {
      out.push({ id: n.id, name: n.name, title: n.title, kind: n.kind })
    }
    if (!r.data.pagination.hasMore) break
    offset = out.length
  }
  return out
}

export async function getNinjaIndex(): Promise<IndexEntry[]> {
  if (memCache) return memCache
  if (inFlight) return inFlight

  if (typeof window !== 'undefined') {
    const cached = sessionStorage.getItem(CACHE_KEY)
    if (cached) {
      try {
        memCache = JSON.parse(cached) as IndexEntry[]
        return memCache
      } catch {}
    }
  }

  inFlight = (async () => {
    try {
      const [ninjas, mains] = await Promise.all([fetchKind('NINJA'), fetchKind('MAIN')])
      const items = [...ninjas, ...mains]
      memCache = items
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify(items))
        } catch {} // sessionStorage puede estar lleno o deshabilitado
      }
      return items
    } finally {
      inFlight = null
    }
  })()
  return inFlight
}

/** Hook React que devuelve el índice (null mientras carga) */
export function useNinjaIndex(): IndexEntry[] | null {
  const [index, setIndex] = useState<IndexEntry[] | null>(memCache)
  useEffect(() => {
    if (memCache) return
    let alive = true
    getNinjaIndex()
      .then((i) => {
        if (alive) setIndex(i)
      })
      .catch(() => {
        if (alive) setIndex([])
      })
    return () => {
      alive = false
    }
  }, [])
  return index
}

/**
 * Parsea una referencia de la forma `Nombre` o `Nombre (Variante)`.
 *
 * Ejemplos:
 *   "Darui"                       → { name: "Darui" }
 *   "Asuma (Filo de viento)"      → { name: "Asuma", title: "Filo de viento" }
 *   "Madara Uchiha (Reunión Gokage)" → { name: "Madara Uchiha", title: "Reunión Gokage" }
 */
export function parseRef(ref: string): { name: string; title?: string } {
  // Match last balanced parens to evitar perder nombres con paréntesis adentro
  const m = ref.match(/^(.+?)\s*\(([^()]+)\)\s*$/)
  if (m) return { name: m[1].trim(), title: m[2].trim() }
  return { name: ref.trim() }
}

/**
 * Busca un ninja en el índice por nombre (y opcionalmente título).
 * Sin título: prefiere la carta "base" (title vacío) o cae a la primera.
 */
export function findNinja(index: IndexEntry[], ref: string): IndexEntry | null {
  const { name, title } = parseRef(ref)
  const matches = index.filter((n) => n.name === name)
  if (!matches.length) return null
  if (title) {
    const wrapped = `[${title}]`
    return matches.find((n) => n.title === wrapped) ?? matches.find((n) => n.title === title) ?? null
  }
  return matches.find((n) => n.title === '') ?? matches[0]
}

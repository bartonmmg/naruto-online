/**
 * Servicio del catálogo de Espíritus Animales (Summon Beasts).
 * Como hay solo 49 entries, list devuelve todos sin paginación.
 */
import { prisma } from '../lib/prisma.js'
import { matchesSearch, normalizeForSearch } from '../lib/search.js'

const REGION = 'ES_LATAM'

interface KathaSkillsRaw {
  lv1?: number[]
  lv2?: number[]
  lv3?: number[]
}

function jsonArr<T>(s: string | null | undefined, fallback: T[]): T[] {
  if (!s) return fallback
  try {
    const v = JSON.parse(s)
    return Array.isArray(v) ? v : fallback
  } catch {
    return fallback
  }
}

function jsonObj<T extends object>(s: string | null | undefined, fallback: T): T {
  if (!s) return fallback
  try {
    return { ...fallback, ...JSON.parse(s) }
  } catch {
    return fallback
  }
}

function decorate(s: any) {
  const katha = jsonObj<KathaSkillsRaw>(s.kathaSkillIds, { lv1: [], lv2: [], lv3: [] })
  return {
    id: s.id,
    slug: s.slug,
    region: s.region,
    artisticId: s.artisticId,
    cardId: s.cardId,
    name: s.name,
    type: s.type,
    stats: {
      baseLife: s.baseLife,
      baseAttack: s.baseAttack,
      baseDefense: s.baseDefense,
      baseNinjaAttack: s.baseNinjaAttack,
      baseResist: s.baseResist,
    },
    skillName: s.skillName,
    description: s.description,
    majorSkillIds: jsonArr<number>(s.majorSkillIds, []),
    openLevel: s.openLevel ?? 0,
    cardCost: s.cardCost ?? 0,
    triggerKeywords: jsonArr<string>(s.triggerKeywords, []),
    applyKeywords: jsonArr<string>(s.applyKeywords, []),
    kathaSkillRefs: {
      lv1: katha.lv1 ?? [],
      lv2: katha.lv2 ?? [],
      lv3: katha.lv3 ?? [],
    },
  }
}

export interface ListSpiritsFilters {
  search?: string
  type?: number
  trigger?: string
  apply?: string
}

export const gameSpiritsService = {
  async list(filters: ListSpiritsFilters = {}) {
    const where: any = { region: REGION }
    if (filters.type !== undefined) where.type = filters.type
    const rowsRaw = await prisma.gameSpirit.findMany({ where, orderBy: { id: 'asc' } })
    let items = rowsRaw.map(decorate)

    // Filtros por keyword (caso-insensitive)
    if (filters.trigger) {
      const t = normalizeForSearch(filters.trigger)
      items = items.filter((s) => s.triggerKeywords.some((k) => normalizeForSearch(k) === t))
    }
    if (filters.apply) {
      const t = normalizeForSearch(filters.apply)
      items = items.filter((s) => s.applyKeywords.some((k) => normalizeForSearch(k) === t))
    }

    const q = filters.search?.trim()
    if (q) {
      const numQ = /^\d+$/.test(q) ? Number(q) : null
      items = items.filter((s) => {
        if (numQ !== null && (s.id === numQ || s.artisticId === numQ || s.cardId === numQ)) return true
        return matchesSearch([s.name, s.skillName, s.description], q)
      })
    }

    return { items, total: items.length }
  },

  /** Facets para los chips del listado. Counts sobre TODOS los espíritus
   *  (sin filtros aplicados) — los chips no deberían cambiar cuando filtrás. */
  async getFilterFacets() {
    const rowsRaw = await prisma.gameSpirit.findMany({
      where: { region: REGION },
      orderBy: { id: 'asc' },
    })
    const items = rowsRaw.map(decorate)
    // Dedup case-insensitive (el juego tiene "Flote alto" + "Flote Alto").
    // Para cada bucket normalizado guardamos el label "canónico" (el más usado).
    const tallyByLabel = (extractor: (s: ReturnType<typeof decorate>) => string[]) => {
      const buckets = new Map<string, { count: number; labels: Map<string, number> }>()
      for (const s of items) {
        for (const raw of extractor(s)) {
          const key = normalizeForSearch(raw)
          if (!key) continue
          const b = buckets.get(key) ?? { count: 0, labels: new Map() }
          b.count++
          b.labels.set(raw, (b.labels.get(raw) || 0) + 1)
          buckets.set(key, b)
        }
      }
      return [...buckets.values()]
        .map((b) => {
          const canonicalLabel = [...b.labels.entries()].sort((a, b) => b[1] - a[1])[0][0]
          return { label: canonicalLabel, count: b.count }
        })
        .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
    }
    const tallyByType = () => {
      const m = new Map<number, number>()
      for (const s of items) m.set(s.type, (m.get(s.type) || 0) + 1)
      const romans: Record<number, string> = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV' }
      return [...m.entries()]
        .sort((a, b) => a[0] - b[0])
        .map(([code, count]) => ({ code, label: `Tipo ${romans[code] ?? code}`, count }))
    }

    return {
      type: tallyByType(),
      trigger: tallyByLabel((s) => s.triggerKeywords),
      apply: tallyByLabel((s) => s.applyKeywords),
      total: items.length,
    }
  },

  /** Acepta id numérico (back-compat) o slug (ej. "tonton"). */
  async getById(idOrSlug: number | string) {
    const row =
      typeof idOrSlug === 'number'
        ? await prisma.gameSpirit.findUnique({ where: { id: idOrSlug } })
        : await prisma.gameSpirit.findFirst({ where: { region: REGION, slug: idOrSlug } })
    if (!row) return null
    const dec = decorate(row)
    // Resolver skills referenciadas (major + katha) en un solo query
    const allIds = [
      ...dec.majorSkillIds,
      ...dec.kathaSkillRefs.lv1,
      ...dec.kathaSkillRefs.lv2,
      ...dec.kathaSkillRefs.lv3,
    ]
    const uniq = [...new Set(allIds)]
    const skills = uniq.length
      ? await prisma.gameSkill.findMany({ where: { id: { in: uniq } } })
      : []
    const byId = new Map(skills.map((s) => [s.id, s]))
    const resolve = (ids: number[]) => ids.map((id) => byId.get(id)).filter(Boolean)
    return {
      ...dec,
      katha: {
        lv1: resolve(dec.kathaSkillRefs.lv1),
        lv2: resolve(dec.kathaSkillRefs.lv2),
        lv3: resolve(dec.kathaSkillRefs.lv3),
      },
    }
  },
}

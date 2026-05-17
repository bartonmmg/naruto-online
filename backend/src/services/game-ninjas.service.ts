/**
 * Servicio del catalogo de ninjas (datos del juego — region ES_LATAM).
 *
 * Lee de las tablas GameNinja + GameSkill. Resuelve los skills referenciados
 * por id en un solo query con `IN`. JSON fields (stats/resists/intro/assets)
 * se parsean antes de devolver al cliente.
 */
import { prisma } from '../lib/prisma.js'
import { matchesSearch } from '../lib/search.js'

const REGION = 'ES_LATAM'
const DEFAULT_LIMIT = 24
const MAX_LIMIT = 100

export type SortKey = 'name' | 'rareness' | 'ninjaAttack' | 'bodyAttack' | 'life'

export interface ListNinjasFilters {
  search?: string
  kind?: 'NINJA' | 'MAIN'  // default NINJA (filtra los mains del listado principal)
  property?: number       // propertyCode (1..5)
  career?: number         // careerCode
  rareness?: number       // rarenessCode
  sort?: SortKey
  limit?: number
  offset?: number
}

/** Parsea de forma defensiva: si falla devuelve fallback */
function jsonParse<T>(s: string | null, fallback: T): T {
  if (!s) return fallback
  try { return JSON.parse(s) as T } catch { return fallback }
}

/** Estructura cruda de talentos de Main (tal cual la guarda el importer) */
interface TalentSlotRaw { slot: number; level: number; skillIds: number[] }
interface MainTalentsRaw {
  esoterica: TalentSlotRaw[]
  ataque: TalentSlotRaw[]
  pasiva: TalentSlotRaw[]
}

/** Decora una row de DB con sus JSON fields parseados */
function decorate(n: any) {
  const stats = jsonParse(n.stats, {} as Record<string, number>)
  return {
    id: n.id,
    artisticId: n.artisticId,
    region: n.region,
    kind: n.kind,
    name: n.name,
    title: n.title,
    property: { code: n.propertyCode, label: n.propertyLabel },
    career: { code: n.careerCode, label: n.careerLabel },
    rareness: { code: n.rarenessCode, label: n.rarenessLabel },
    sex: { code: n.sexCode, label: n.sexLabel },
    starLevel: n.starLevel,
    awakenSkillNum: n.awakenSkillNum,
    equipNum: n.equipNum,
    stats,
    resists: jsonParse(n.resists, {} as Record<string, number>),
    intro: jsonParse<{ desc: string[]; words: string } | null>(n.intro, null),
    mainTalentsRaw: jsonParse<MainTalentsRaw | null>(n.mainTalents, null),
    skillRefs: {
      normalIds: jsonParse<number[]>(n.normalSkillIds, []),
      specialIds: jsonParse<number[]>(n.specialSkillIds, []),
      skillIds: jsonParse<number[]>(n.skillIds, []),
    },
    assets: jsonParse(n.assets, { bigImage: '', halfImage: '', portrait: '' } as Record<string, string>),
  }
}

/** Version compacta para el listado: sin skill descriptions ni intro completa */
function summarize(n: any) {
  const dec = decorate(n)
  return {
    id: dec.id,
    artisticId: dec.artisticId,
    kind: dec.kind,
    name: dec.name,
    title: dec.title,
    property: dec.property,
    career: dec.career,
    rareness: dec.rareness,
    starLevel: dec.starLevel,
    stats: {
      baseLife: dec.stats.baseLife ?? 0,
      baseBodyAttack: dec.stats.baseBodyAttack ?? 0,
      baseNinjaAttack: dec.stats.baseNinjaAttack ?? 0,
    },
    assets: { portrait: dec.assets.portrait ?? '' },
  }
}

function orderByFor(sort?: SortKey) {
  // No podemos ordenar por campos dentro de JSON con SQLite — para name/rareness
  // usamos columnas planas. Los sort por stat (ninjaAttack/etc.) los hacemos en
  // memoria post-query (limitamos antes con offset/limit conservadores).
  switch (sort) {
    case 'rareness':
      return [{ rarenessCode: 'desc' as const }, { name: 'asc' as const }]
    case 'name':
    default:
      return [{ name: 'asc' as const }, { title: 'asc' as const }]
  }
}

export const gameNinjasService = {
  async list(filters: ListNinjasFilters = {}) {
    const limit = Math.min(filters.limit ?? DEFAULT_LIMIT, MAX_LIMIT)
    const offset = Math.max(filters.offset ?? 0, 0)
    const sortKey = filters.sort ?? 'name'

    // Filtros que van directo al WHERE de la DB (rápidos con index)
    const where: any = { region: REGION, kind: filters.kind ?? 'NINJA' }
    if (filters.property !== undefined) where.propertyCode = filters.property
    if (filters.career !== undefined) where.careerCode = filters.career
    if (filters.rareness !== undefined) where.rarenessCode = filters.rareness

    const searchQuery = filters.search?.trim() ?? ''
    const wantsStatSort = ['ninjaAttack', 'bodyAttack', 'life'].includes(sortKey)

    // Con search activo: traemos TODOS los rows del WHERE (sin paginar) y
    // filtramos en JS para soportar case/accent-insensitive y matching por id.
    // Como hay ~408 ninjas total, esto es trivial en memoria.
    // Idem cuando ordenamos por stat (necesita ver todos los stats para ranking).
    const needsInMemoryPipeline = !!searchQuery || wantsStatSort

    if (needsInMemoryPipeline) {
      const rowsRaw = await prisma.gameNinja.findMany({
        where,
        orderBy: orderByFor(sortKey),
      })
      let rows = rowsRaw.map(summarize)

      // Aplicar search en memoria
      if (searchQuery) {
        // Si es 100% numérico, también matchear por id / artisticId
        const numQ = /^\d+$/.test(searchQuery) ? Number(searchQuery) : null
        rows = rows.filter((n) => {
          if (numQ !== null && (n.id === numQ || n.artisticId === numQ)) return true
          return matchesSearch([n.name, n.title], searchQuery)
        })
      }

      // Aplicar sort por stat
      if (wantsStatSort) {
        const key: 'baseNinjaAttack' | 'baseBodyAttack' | 'baseLife' =
          sortKey === 'ninjaAttack'
            ? 'baseNinjaAttack'
            : sortKey === 'bodyAttack'
            ? 'baseBodyAttack'
            : 'baseLife'
        rows.sort((a, b) => (b.stats[key] || 0) - (a.stats[key] || 0))
      }

      const total = rows.length
      const items = rows.slice(offset, offset + limit)
      return {
        items,
        pagination: { total, offset, limit, hasMore: offset + items.length < total },
      }
    }

    // Sin search ni sort-por-stat: pipeline rápido de DB
    const [rowsRaw, total] = await Promise.all([
      prisma.gameNinja.findMany({
        where,
        orderBy: orderByFor(sortKey),
        take: limit,
        skip: offset,
      }),
      prisma.gameNinja.count({ where }),
    ])
    const items = rowsRaw.map(summarize)
    return {
      items,
      pagination: { total, offset, limit, hasMore: offset + items.length < total },
    }
  },

  async getById(id: number) {
    const row = await prisma.gameNinja.findUnique({ where: { id } })
    if (!row) return null
    const dec = decorate(row)
    // Recolectar TODOS los skill IDs necesarios (skillset + mainTalents)
    const allIds = [
      ...dec.skillRefs.normalIds,
      ...dec.skillRefs.specialIds,
      ...dec.skillRefs.skillIds,
    ]
    if (dec.mainTalentsRaw) {
      for (const cat of [
        dec.mainTalentsRaw.esoterica,
        dec.mainTalentsRaw.ataque,
        dec.mainTalentsRaw.pasiva,
      ]) {
        for (const slot of cat) allIds.push(...slot.skillIds)
      }
    }
    const uniq = [...new Set(allIds)]
    const skills = uniq.length
      ? await prisma.gameSkill.findMany({ where: { id: { in: uniq } } })
      : []
    const byId = new Map(skills.map((s) => [s.id, s]))
    const resolve = (ids: number[]) =>
      ids.map((sid) => byId.get(sid)).filter(Boolean)
    // Talentos del Main con skills resueltos
    const mainTalents = dec.mainTalentsRaw
      ? {
          esoterica: dec.mainTalentsRaw.esoterica.map((s) => ({ slot: s.slot, level: s.level, skills: resolve(s.skillIds) })),
          ataque:    dec.mainTalentsRaw.ataque.map((s) =>    ({ slot: s.slot, level: s.level, skills: resolve(s.skillIds) })),
          pasiva:    dec.mainTalentsRaw.pasiva.map((s) =>    ({ slot: s.slot, level: s.level, skills: resolve(s.skillIds) })),
        }
      : null
    // Limpiar campo crudo del payload
    const { mainTalentsRaw, ...rest } = dec
    return {
      ...rest,
      skills: {
        normals: resolve(dec.skillRefs.normalIds),
        specials: resolve(dec.skillRefs.specialIds),
        passives: resolve(dec.skillRefs.skillIds),
      },
      mainTalents,
    }
  },

  /** Devuelve counts por property/career/rareness para los chips de filtro */
  async getFilterFacets() {
    const base = await prisma.gameNinja.findMany({
      where: { region: REGION, kind: 'NINJA' },
      select: {
        propertyCode: true,
        propertyLabel: true,
        careerCode: true,
        careerLabel: true,
        rarenessCode: true,
        rarenessLabel: true,
      },
    })

    const tally = <K extends string>(rows: any[], codeKey: K, labelKey: K) => {
      const m = new Map<number, { code: number; label: string; count: number }>()
      for (const r of rows) {
        const code = r[codeKey]
        const label = r[labelKey]
        const cur = m.get(code)
        if (cur) cur.count++
        else m.set(code, { code, label, count: 1 })
      }
      return [...m.values()].sort((a, b) => a.code - b.code)
    }

    return {
      property: tally(base, 'propertyCode' as any, 'propertyLabel' as any),
      career: tally(base, 'careerCode' as any, 'careerLabel' as any),
      rareness: tally(base, 'rarenessCode' as any, 'rarenessLabel' as any),
      total: base.length,
    }
  },
}

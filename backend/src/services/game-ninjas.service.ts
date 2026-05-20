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
  career?: number         // careerCode (legacy, data drift en algunas cartas)
  ninjaType?: string      // tag del intro ("Ataque grupal", "Control", etc.)
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

interface StarVariant {
  star: number
  id: number
  title: string
  artisticId: number
  stats: Record<string, number>
  resists: Record<string, number>
  normalSkillIds: number[]
  specialSkillIds: number[]
  skillIds: number[]
  skillUpgrades: Record<string, RawSkillUpgrade[]>
}

/** Lo que llega serializado en `GameNinja.skillUpgrades` (un upgrade sin la skill resuelta). */
interface RawSkillUpgrade {
  id: number
  tierCode: number
  tierLabel: string
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
    intro: jsonParse<{ desc: string[]; words: string; types?: string[] } | null>(n.intro, null),
    ninjaTypes: jsonParse<string[]>(n.ninjaTypes, []),
    starVariants: jsonParse<StarVariant[]>(n.starVariants, []),
    skillUpgrades: jsonParse<Record<string, RawSkillUpgrade[]>>(n.skillUpgrades, {}),
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
  // En cartas que transforman al subir estrellas (Gai [Puerta]→[Conmoción], Itachi
  // [Joven]→[Orejas de Gato]), el listado muestra la forma inicial (★1) — coincide
  // con la apariencia de la carta cuando recién se la obtiene en el juego.
  const firstVariant = dec.starVariants?.[0]
  const cardArtisticId = firstVariant?.artisticId ?? dec.artisticId
  const cardTitle = firstVariant?.title ?? dec.title
  return {
    id: dec.id,
    slug: n.slug,
    artisticId: cardArtisticId,
    kind: dec.kind,
    name: dec.name,
    title: cardTitle,
    property: dec.property,
    career: dec.career,
    ninjaTypes: dec.ninjaTypes,
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
    const ninjaType = filters.ninjaType?.trim() ?? ''
    const wantsStatSort = ['ninjaAttack', 'bodyAttack', 'life'].includes(sortKey)

    // Con search/ninjaType activo: traemos TODOS los rows del WHERE (sin paginar) y
    // filtramos en JS. ninjaType es un array en JSON, no se puede WHERE en SQLite.
    // Como hay ~408 ninjas total, esto es trivial en memoria.
    const needsInMemoryPipeline = !!searchQuery || !!ninjaType || wantsStatSort

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

      // Filtro por tag de tipo (case-insensitive)
      if (ninjaType) {
        const q = ninjaType.toLowerCase()
        rows = rows.filter((n) => n.ninjaTypes.some((t) => t.toLowerCase() === q))
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

  /**
   * Acepta id numérico (back-compat) o slug (ej. "sasuke-susanoo").
   */
  async getById(idOrSlug: number | string) {
    const row =
      typeof idOrSlug === 'number'
        ? await prisma.gameNinja.findUnique({ where: { id: idOrSlug } })
        : await prisma.gameNinja.findFirst({ where: { region: REGION, slug: idOrSlug } })
    if (!row) return null
    const dec = decorate(row)
    // Recolectar TODOS los skill IDs necesarios (skillset + mainTalents + upgrades)
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
    // Avance/breakthrough/enlace skill upgrades (winner)
    for (const ups of Object.values(dec.skillUpgrades)) {
      for (const u of ups) allIds.push(u.id)
    }
    // Skills + upgrades de CADA variante por estrella
    for (const v of dec.starVariants) {
      for (const id of v.normalSkillIds ?? []) allIds.push(id)
      for (const id of v.specialSkillIds ?? []) allIds.push(id)
      for (const id of v.skillIds ?? []) allIds.push(id)
      for (const ups of Object.values(v.skillUpgrades ?? {})) {
        for (const u of ups) allIds.push(u.id)
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
    // Helper: resuelve upgrades de un skillUpgrades crudo (con .id) → con .skill resuelta
    const resolveUpgrades = (ups: Record<string, RawSkillUpgrade[]>) => {
      const out: Record<string, Array<{ tierCode: number; tierLabel: string; skill: any }>> = {}
      for (const [baseId, list] of Object.entries(ups)) {
        out[baseId] = list
          .map((u) => ({ tierCode: u.tierCode, tierLabel: u.tierLabel, skill: byId.get(u.id) }))
          .filter((u) => u.skill)
      }
      return out
    }
    const skillUpgradesResolved = resolveUpgrades(dec.skillUpgrades)

    // Para cada variante por estrella, adjuntamos sus skills resueltas + upgrades.
    // Esto permite al frontend swappear skills al cambiar de estrella sin otro fetch.
    const starVariantsResolved = dec.starVariants.map((v) => ({
      star: v.star,
      id: v.id,
      title: v.title,
      artisticId: v.artisticId,
      stats: v.stats,
      resists: v.resists,
      skills: {
        normals: resolve(v.normalSkillIds ?? []),
        specials: resolve(v.specialSkillIds ?? []),
        passives: resolve(v.skillIds ?? []),
      },
      skillUpgrades: resolveUpgrades(v.skillUpgrades ?? {}),
    }))

    // Limpiar campos crudos del payload
    const { mainTalentsRaw, skillUpgrades, starVariants, ...rest } = dec
    return {
      ...rest,
      starVariants: starVariantsResolved,
      skills: {
        normals: resolve(dec.skillRefs.normalIds),
        specials: resolve(dec.skillRefs.specialIds),
        passives: resolve(dec.skillRefs.skillIds),
      },
      skillUpgrades: skillUpgradesResolved,
      mainTalents,
    }
  },

  /** Devuelve counts por property/career/rareness/ninjaType para los chips de filtro */
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
        ninjaTypes: true,
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

    // ninjaTypes: tally desde el JSON (cada ninja puede tener varios tags)
    const typeCounts = new Map<string, number>()
    for (const r of base) {
      const tags = jsonParse<string[]>(r.ninjaTypes, [])
      for (const t of tags) typeCounts.set(t, (typeCounts.get(t) ?? 0) + 1)
    }
    const ninjaTypes = [...typeCounts.entries()]
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)

    return {
      property: tally(base, 'propertyCode' as any, 'propertyLabel' as any),
      career: tally(base, 'careerCode' as any, 'careerLabel' as any),
      rareness: tally(base, 'rarenessCode' as any, 'rarenessLabel' as any),
      ninjaTypes,
      total: base.length,
    }
  },
}

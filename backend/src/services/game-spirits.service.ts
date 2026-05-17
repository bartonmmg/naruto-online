/**
 * Servicio del catálogo de Espíritus Animales (Summon Beasts).
 * Como hay solo 49 entries, list devuelve todos sin paginación.
 */
import { prisma } from '../lib/prisma.js'
import { matchesSearch } from '../lib/search.js'

const REGION = 'ES_LATAM'

function decorate(s: any) {
  let majorSkillIds: number[] = []
  try {
    majorSkillIds = JSON.parse(s.majorSkillIds ?? '[]')
  } catch {}
  return {
    id: s.id,
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
    majorSkillIds,
  }
}

export const gameSpiritsService = {
  async list(filters: { search?: string } = {}) {
    // Trae los 49 sin paginar — siempre suficiente cargar todo
    const rowsRaw = await prisma.gameSpirit.findMany({
      where: { region: REGION },
      orderBy: { id: 'asc' },
    })
    let items = rowsRaw.map(decorate)

    const q = filters.search?.trim()
    if (q) {
      // Si es 100% numérico, matchear también por id / artisticId / cardId
      const numQ = /^\d+$/.test(q) ? Number(q) : null
      items = items.filter((s) => {
        if (numQ !== null && (s.id === numQ || s.artisticId === numQ || s.cardId === numQ)) return true
        return matchesSearch([s.name, s.skillName, s.description], q)
      })
    }

    return { items, total: items.length }
  },

  async getById(id: number) {
    const row = await prisma.gameSpirit.findUnique({ where: { id } })
    if (!row) return null
    return decorate(row)
  },
}

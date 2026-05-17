/**
 * Servicio del catálogo de Espíritus Animales (Summon Beasts).
 * Como hay solo 49 entries, list devuelve todos sin paginación.
 */
import { prisma } from '../lib/prisma.js'

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
    const where: any = { region: REGION }
    if (filters.search?.trim()) {
      where.name = { contains: filters.search.trim() }
    }
    const rows = await prisma.gameSpirit.findMany({
      where,
      orderBy: { id: 'asc' },
    })
    return { items: rows.map(decorate), total: rows.length }
  },

  async getById(id: number) {
    const row = await prisma.gameSpirit.findUnique({ where: { id } })
    if (!row) return null
    return decorate(row)
  },
}

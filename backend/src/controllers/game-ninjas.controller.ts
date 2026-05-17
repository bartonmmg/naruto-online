import { Request, Response } from 'express'
import { z } from 'zod'
import { gameNinjasService } from '../services/game-ninjas.service.js'

const listQuery = z.object({
  search: z.string().optional(),
  kind: z.enum(['NINJA', 'MAIN']).optional(),
  property: z.coerce.number().int().optional(),
  career: z.coerce.number().int().optional(),
  rareness: z.coerce.number().int().optional(),
  sort: z.enum(['name', 'rareness', 'ninjaAttack', 'bodyAttack', 'life']).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
})

export const gameNinjasController = {
  async list(req: Request, res: Response) {
    try {
      const parsed = listQuery.safeParse(req.query)
      if (!parsed.success) {
        return res.status(400).json({ error: 'Parámetros inválidos', details: parsed.error.flatten() })
      }
      const data = await gameNinjasService.list(parsed.data as any)
      res.json(data)
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Error al listar ninjas' })
    }
  },

  async filters(_req: Request, res: Response) {
    try {
      const data = await gameNinjasService.getFilterFacets()
      res.json(data)
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Error al obtener filtros' })
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id)
      if (!Number.isFinite(id)) {
        return res.status(400).json({ error: 'id inválido' })
      }
      const ninja = await gameNinjasService.getById(id)
      if (!ninja) return res.status(404).json({ error: 'Ninja no encontrado' })
      res.json(ninja)
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Error al obtener ninja' })
    }
  },
}

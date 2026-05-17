import { Request, Response } from 'express'
import { z } from 'zod'
import { gameSpiritsService } from '../services/game-spirits.service.js'

const listQuery = z.object({
  search: z.string().optional(),
  type: z.coerce.number().int().optional(),
  trigger: z.string().optional(),
  apply: z.string().optional(),
})

export const gameSpiritsController = {
  async list(req: Request, res: Response) {
    try {
      const parsed = listQuery.safeParse(req.query)
      if (!parsed.success) {
        return res.status(400).json({ error: 'Parámetros inválidos', details: parsed.error.flatten() })
      }
      const data = await gameSpiritsService.list(parsed.data)
      res.json(data)
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Error al listar espíritus' })
    }
  },

  async filters(_req: Request, res: Response) {
    try {
      const data = await gameSpiritsService.getFilterFacets()
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
      const spirit = await gameSpiritsService.getById(id)
      if (!spirit) return res.status(404).json({ error: 'Espíritu no encontrado' })
      res.json(spirit)
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Error al obtener espíritu' })
    }
  },
}

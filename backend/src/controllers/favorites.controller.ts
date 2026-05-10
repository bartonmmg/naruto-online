import { Response } from 'express'
import { AuthRequest } from '../middleware/auth.middleware.js'
import { favoritesService, FavoriteType } from '../services/favorites.service.js'

export const favoritesController = {
  async toggle(req: AuthRequest, res: Response) {
    try {
      const { type, targetId } = req.body ?? {}
      if (!favoritesService.isValidType(type)) {
        return res.status(400).json({ error: 'type debe ser GUIDE, NEWS o PLAYER' })
      }
      if (typeof targetId !== 'string' || !targetId) {
        return res.status(400).json({ error: 'targetId requerido' })
      }
      const result = await favoritesService.toggle(req.userId!, type, targetId)
      res.json(result)
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al guardar favorito' })
    }
  },

  async list(req: AuthRequest, res: Response) {
    try {
      const type = req.query.type as string | undefined
      if (type && !favoritesService.isValidType(type)) {
        return res.status(400).json({ error: 'type inválido' })
      }
      const items = type
        ? await favoritesService.listEnriched(req.userId!, type as FavoriteType)
        : await favoritesService.list(req.userId!)
      res.json({ items })
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al listar favoritos' })
    }
  },

  async check(req: AuthRequest, res: Response) {
    try {
      const type = req.query.type as string | undefined
      const idsRaw = req.query.ids as string | undefined
      if (!favoritesService.isValidType(type ?? '')) {
        return res.status(400).json({ error: 'type inválido' })
      }
      const ids = (idsRaw ?? '').split(',').map(s => s.trim()).filter(Boolean)
      const map = await favoritesService.checkMany(req.userId!, type as FavoriteType, ids)
      res.json({ map })
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al verificar favoritos' })
    }
  },
}

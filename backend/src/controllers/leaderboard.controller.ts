import { Response } from 'express'
import { AuthRequest } from '../middleware/auth.middleware.js'
import { guidesService } from '../services/guides.service.js'

export const leaderboardController = {
  async getGuideLeaderboard(req: AuthRequest, res: Response) {
    try {
      const data = await guidesService.getLeaderboard()
      res.json(data)
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al obtener leaderboard' })
    }
  },

  async getAuthorLeaderboard(req: AuthRequest, res: Response) {
    try {
      const data = await guidesService.getAuthorLeaderboard()
      res.json(data)
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al obtener leaderboard de autores' })
    }
  },

  async getUserProfile(req: AuthRequest, res: Response) {
    try {
      const { username } = req.params
      const data = await guidesService.getUserProfile(username)
      if (!data) return res.status(404).json({ error: 'Usuario no encontrado' })
      res.json(data)
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al obtener perfil' })
    }
  },
}

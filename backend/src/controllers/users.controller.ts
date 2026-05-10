import { Response } from 'express'
import { AuthRequest } from '../middleware/auth.middleware.js'
import { usersService, updateProfileSchema } from '../services/users.service.js'

export const usersController = {
  async getMyProfile(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) return res.status(401).json({ error: 'No autenticado' })
      const profile = await usersService.getProfile(req.userId)
      if (!profile) return res.status(404).json({ error: 'No encontrado' })
      res.json(profile)
    } catch (e: any) {
      res.status(500).json({ error: e.message })
    }
  },

  async updateMyProfile(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) return res.status(401).json({ error: 'No autenticado' })
      const data = updateProfileSchema.parse(req.body)
      const profile = await usersService.updateProfile(req.userId, data)
      res.json(profile)
    } catch (e: any) {
      res.status(400).json({ error: e.message })
    }
  },
}

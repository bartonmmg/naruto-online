import { Response } from 'express'
import { AuthRequest } from '../middleware/auth.middleware.js'
import { guidesService } from '../services/guides.service.js'
import { xpService } from '../services/xp.service.js'

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
      const achievements = await xpService.getUserAchievements(data.id)
      res.json({ ...data, achievements })
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al obtener perfil' })
    }
  },

  // Own profile — requires auth, returns full profile + fresh XP from DB
  async getMyProfile(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) return res.status(401).json({ error: 'No autenticado' })

      const { prisma } = await import('../lib/prisma.js')
      const user = await prisma.user.findUnique({
        where: { id: req.userId },
        select: {
          id: true, username: true, email: true, xp: true, level: true, role: true, createdAt: true,
          avatarSlug: true, bannerSlug: true, frameSlug: true, bio: true, customTitle: true,
          nameColor: true, pinnedAchievements: true, gameServer: true, socialLinks: true,
        },
      })
      if (!user) return res.status(404).json({ error: 'Usuario no encontrado' })

      const data = await guidesService.getUserProfile(user.username)
      const achievements = await xpService.getUserAchievements(user.id)
      res.json({ ...data, ...user, achievements })
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al obtener perfil' })
    }
  },
}

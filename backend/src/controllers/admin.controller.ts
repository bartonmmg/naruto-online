import { Response } from 'express'
import { z } from 'zod'
import { AuthRequest } from '../middleware/auth.middleware.js'
import { xpService } from '../services/xp.service.js'

const updateXpSchema = z.object({
  action: z.string(),
  xpAmount: z.number().int().min(0).max(10000),
})

const updateLevelSchema = z.object({
  level: z.number().int().min(1),
  xpRequired: z.number().int().min(0),
  label: z.string().min(1).max(50),
})

export const adminController = {
  async getXpConfig(req: AuthRequest, res: Response) {
    try {
      const [xpConfig, levelConfig, achievements] = await Promise.all([
        xpService.getXpConfig(),
        xpService.getLevelConfig(),
        xpService.getAllAchievements(),
      ])
      res.json({ xpConfig, levelConfig, achievements })
    } catch (e: any) {
      res.status(500).json({ error: e.message })
    }
  },

  async updateXpConfig(req: AuthRequest, res: Response) {
    try {
      const { action, xpAmount } = updateXpSchema.parse(req.body)
      const updated = await xpService.updateXpConfig(action, xpAmount)
      res.json(updated)
    } catch (e: any) {
      res.status(400).json({ error: e.message })
    }
  },

  async updateLevelConfig(req: AuthRequest, res: Response) {
    try {
      const { level, xpRequired, label } = updateLevelSchema.parse(req.body)
      const updated = await xpService.updateLevelConfig(level, xpRequired, label)
      res.json(updated)
    } catch (e: any) {
      res.status(400).json({ error: e.message })
    }
  },
}

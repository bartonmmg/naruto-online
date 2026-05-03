import { Response } from 'express'
import { z } from 'zod'
import { AuthRequest } from '../middleware/auth.middleware.js'
import { xpService } from '../services/xp.service.js'
import { prisma } from '../lib/prisma.js'

const updateXpSchema = z.object({
  action: z.string(),
  xpAmount: z.number().int().min(0).max(10000),
})

const createLevelSchema = z.object({
  level: z.number().int().min(1),
  xpRequired: z.number().int().min(0),
  label: z.string().min(1).max(50),
})

const updateRoleSchema = z.object({
  role: z.enum(['USER', 'MODERATOR', 'ADMIN']),
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

  async createLevelConfig(req: AuthRequest, res: Response) {
    try {
      const { level, xpRequired, label } = createLevelSchema.parse(req.body)
      const existing = await xpService.getLevelByNumber(level)
      if (existing) return res.status(409).json({ error: `El nivel ${level} ya existe` })
      const created = await xpService.createLevelConfig(level, xpRequired, label)
      res.status(201).json(created)
    } catch (e: any) {
      res.status(400).json({ error: e.message })
    }
  },

  async deleteLevelConfig(req: AuthRequest, res: Response) {
    try {
      const level = parseInt(req.params.level)
      if (isNaN(level)) return res.status(400).json({ error: 'Nivel inválido' })
      await xpService.deleteLevelConfig(level)
      res.json({ ok: true })
    } catch (e: any) {
      res.status(400).json({ error: e.message })
    }
  },

  async reseedConfig(req: AuthRequest, res: Response) {
    try {
      await xpService.reseedDefaults()
      res.json({ ok: true, message: 'Configuración restablecida con valores por defecto' })
    } catch (e: any) {
      res.status(500).json({ error: e.message })
    }
  },

  async listUsers(req: AuthRequest, res: Response) {
    try {
      const users = await prisma.user.findMany({
        select: { id: true, username: true, email: true, role: true, level: true, xp: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      })
      res.json(users)
    } catch (e: any) {
      res.status(500).json({ error: e.message })
    }
  },

  async updateUserRole(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params
      const { role } = updateRoleSchema.parse(req.body)
      if (id === req.userId) return res.status(400).json({ error: 'No podés cambiar tu propio rol' })
      const updated = await prisma.user.update({
        where: { id },
        data: { role },
        select: { id: true, username: true, role: true },
      })
      res.json(updated)
    } catch (e: any) {
      res.status(400).json({ error: e.message })
    }
  },
}

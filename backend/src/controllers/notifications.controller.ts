import { Response } from 'express'
import { AuthRequest } from '../middleware/auth.middleware.js'
import { notificationsService } from '../services/notifications.service.js'

export const notificationsController = {
  async getNotifications(req: AuthRequest, res: Response) {
    try {
      const notifications = await notificationsService.getForUser(req.userId!)
      const unreadCount = await notificationsService.getUnreadCount(req.userId!)
      res.json({ notifications, unreadCount })
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al obtener notificaciones' })
    }
  },

  async markRead(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params
      await notificationsService.markRead(req.userId!, id === 'all' ? undefined : id)
      res.json({ success: true })
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al marcar notificación' })
    }
  },

  async getUnreadCount(req: AuthRequest, res: Response) {
    try {
      const count = await notificationsService.getUnreadCount(req.userId!)
      res.json({ count })
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error' })
    }
  },
}

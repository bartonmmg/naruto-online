import { prisma } from '../lib/prisma.js'

export const notificationsService = {
  async create(userId: string, type: string, message: string, guideId?: string, guideTitle?: string) {
    return await prisma.notification.create({
      data: { userId, type, message, guideId, guideTitle },
    })
  },

  async getForUser(userId: string) {
    return await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
  },

  async markRead(userId: string, notificationId?: string) {
    if (notificationId) {
      return await prisma.notification.updateMany({
        where: { id: notificationId, userId },
        data: { read: true },
      })
    }
    return await prisma.notification.updateMany({
      where: { userId },
      data: { read: true },
    })
  },

  async getUnreadCount(userId: string) {
    return await prisma.notification.count({
      where: { userId, read: false },
    })
  },

  async deleteOld(userId: string) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    return await prisma.notification.deleteMany({
      where: { userId, createdAt: { lt: thirtyDaysAgo } },
    })
  },
}

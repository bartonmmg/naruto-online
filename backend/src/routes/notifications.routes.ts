import { Router } from 'express'
import { notificationsController } from '../controllers/notifications.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'

const router = Router()

router.get('/', authMiddleware, notificationsController.getNotifications)
router.get('/unread', authMiddleware, notificationsController.getUnreadCount)
router.patch('/:id/read', authMiddleware, notificationsController.markRead)

export default router

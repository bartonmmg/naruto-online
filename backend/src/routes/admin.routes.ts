import { Router } from 'express'
import { adminController } from '../controllers/admin.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { authorize } from '../middleware/authorize.middleware.js'

const router = Router()

// All admin routes require ADMIN role
router.use(authMiddleware, authorize(['ADMIN']))

router.get('/xp-config', adminController.getXpConfig)
router.patch('/xp-config', adminController.updateXpConfig)
router.patch('/level-config', adminController.updateLevelConfig)

export default router

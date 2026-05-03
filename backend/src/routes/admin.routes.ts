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
router.post('/level-config', adminController.createLevelConfig)
router.delete('/level-config/:level', adminController.deleteLevelConfig)
router.post('/reseed', adminController.reseedConfig)
router.get('/users', adminController.listUsers)
router.patch('/users/:id/role', adminController.updateUserRole)

export default router

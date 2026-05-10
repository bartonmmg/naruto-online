import { Router } from 'express'
import { usersController } from '../controllers/users.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'

const router = Router()

router.get('/me/profile',   authMiddleware, usersController.getMyProfile)
router.patch('/me/profile', authMiddleware, usersController.updateMyProfile)

export default router

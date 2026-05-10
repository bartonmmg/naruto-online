import { Router } from 'express'
import { favoritesController } from '../controllers/favorites.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'

const router = Router()

router.post('/toggle', authMiddleware, favoritesController.toggle)
router.get('/check',   authMiddleware, favoritesController.check)
router.get('/',        authMiddleware, favoritesController.list)

export default router

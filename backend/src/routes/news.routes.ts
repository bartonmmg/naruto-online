import { Router } from 'express'
import { newsController } from '../controllers/news.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { authorize } from '../middleware/authorize.middleware.js'

const router = Router()

// Public
router.get('/',           newsController.getAll)
router.get('/categories', newsController.getCategories)
router.get('/:id',        newsController.getById)

// MOD/ADMIN — create, edit, delete via site
router.post('/',      authMiddleware, authorize(['ADMIN', 'MODERATOR']), newsController.create)
router.put('/:id',    authMiddleware, authorize(['ADMIN', 'MODERATOR']), newsController.update)
router.delete('/:id', authMiddleware, authorize(['ADMIN', 'MODERATOR']), newsController.delete)

// ADMIN — force Discord sync
router.post('/sync',  authMiddleware, authorize(['ADMIN']), newsController.triggerSync)

export default router

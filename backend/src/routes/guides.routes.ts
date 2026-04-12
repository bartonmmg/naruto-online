import { Router } from 'express'
import { guidesController } from '../controllers/guides.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { authorize } from '../middleware/authorize.middleware.js'
import { validateRequest } from '../middleware/validate.middleware.js'
import { createGuideSchema, updateGuideSchema } from '../services/guides.service.js'

const router = Router()

// GET /guides — público
router.get('/', guidesController.getAll)

// GET /guides/:id — público
router.get('/:id', guidesController.getById)

// GET /guides/:id/history — público
router.get('/:id/history', guidesController.getEditHistory)

// POST /guides — protegido, solo ADMIN y MODERATOR
router.post(
  '/',
  authMiddleware,
  authorize(['ADMIN', 'MODERATOR']),
  validateRequest(createGuideSchema),
  guidesController.create
)

// PUT /guides/:id — protegido
router.put(
  '/:id',
  authMiddleware,
  validateRequest(updateGuideSchema),
  guidesController.update
)

// DELETE /guides/:id — protegido, solo ADMIN y MODERATOR
router.delete(
  '/:id',
  authMiddleware,
  authorize(['ADMIN', 'MODERATOR']),
  guidesController.delete
)

export default router

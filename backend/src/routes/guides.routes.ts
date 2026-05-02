import { Router } from 'express'
import { guidesController } from '../controllers/guides.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { authorize } from '../middleware/authorize.middleware.js'
import { validateRequest } from '../middleware/validate.middleware.js'
import { createGuideSchema, updateGuideSchema, rateGuideSchema, createCommentSchema, manageBadgesSchema } from '../services/guides.service.js'

const router = Router()

// GET /guides — público
router.get('/', guidesController.getAll)

// GET /guides/:id — público
router.get('/:id', guidesController.getById)

// GET /guides/:id/history — público
router.get('/:id/history', guidesController.getEditHistory)

// GET /guides/:id/ratings — público
router.get('/:id/ratings', guidesController.getRatings)

// GET /guides/:id/comments — público
router.get('/:id/comments', guidesController.getComments)

// GET /guides/:id/reactions — público
router.get('/:id/reactions', guidesController.getReactions)

// POST /guides/:id/views — optional auth, userId sent only if authenticated
router.post('/:id/views', guidesController.recordView)

// POST /guides — protegido, solo ADMIN y MODERATOR
router.post(
  '/',
  authMiddleware,
  authorize(['ADMIN', 'MODERATOR']),
  validateRequest(createGuideSchema),
  guidesController.create
)

// POST /guides/:id/ratings — protegido
router.post(
  '/:id/ratings',
  authMiddleware,
  validateRequest(rateGuideSchema),
  guidesController.rateGuide
)

// POST /guides/:id/comments — protegido
router.post(
  '/:id/comments',
  authMiddleware,
  validateRequest(createCommentSchema),
  guidesController.addComment
)

// PUT /guides/:id — protegido
router.put(
  '/:id',
  authMiddleware,
  validateRequest(updateGuideSchema),
  guidesController.update
)

// PUT /guides/:id/badges — protegido, solo ADMIN y MODERATOR
router.put(
  '/:id/badges',
  authMiddleware,
  authorize(['ADMIN', 'MODERATOR']),
  validateRequest(manageBadgesSchema),
  guidesController.updateBadges
)

// DELETE /guides/:id — protegido, solo ADMIN y MODERATOR
router.delete(
  '/:id',
  authMiddleware,
  authorize(['ADMIN', 'MODERATOR']),
  guidesController.delete
)

// DELETE /guides/:id/ratings — protegido
router.delete(
  '/:id/ratings',
  authMiddleware,
  guidesController.removeRating
)

// DELETE /guides/:id/comments/:commentId — protegido
router.delete(
  '/:id/comments/:commentId',
  authMiddleware,
  guidesController.deleteComment
)

// POST /guides/:id/reactions — protegido
router.post(
  '/:id/reactions',
  authMiddleware,
  guidesController.toggleReaction
)

// DELETE /guides/:id/reactions/:emoji — protegido
router.delete(
  '/:id/reactions/:emoji',
  authMiddleware,
  guidesController.removeReaction
)

export default router

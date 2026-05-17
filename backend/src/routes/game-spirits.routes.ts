import { Router } from 'express'
import { gameSpiritsController } from '../controllers/game-spirits.controller.js'

const router = Router()

// Literal antes de /:id para no chocar
router.get('/filters', gameSpiritsController.filters)
router.get('/:id', gameSpiritsController.getById)
router.get('/', gameSpiritsController.list)

export default router

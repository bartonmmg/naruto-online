import { Router } from 'express'
import { gameSpiritsController } from '../controllers/game-spirits.controller.js'

const router = Router()

router.get('/:id', gameSpiritsController.getById)
router.get('/', gameSpiritsController.list)

export default router

import { Router } from 'express'
import { gameNinjasController } from '../controllers/game-ninjas.controller.js'

const router = Router()

// Todas las rutas son publicas — sin authMiddleware.
// Rutas literales antes de /:id para no chocar con el matcher numerico.
router.get('/filters', gameNinjasController.filters)
router.get('/:id',     gameNinjasController.getById)
router.get('/',        gameNinjasController.list)

export default router

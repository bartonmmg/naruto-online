import { Router } from 'express'
import { leaderboardController } from '../controllers/leaderboard.controller.js'

const router = Router()

router.get('/guides', leaderboardController.getGuideLeaderboard)
router.get('/authors', leaderboardController.getAuthorLeaderboard)
router.get('/users/:username', leaderboardController.getUserProfile)

export default router

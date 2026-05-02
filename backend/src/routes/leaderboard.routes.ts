import { Router } from 'express'
import { leaderboardController } from '../controllers/leaderboard.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'

const router = Router()

router.get('/guides', leaderboardController.getGuideLeaderboard)
router.get('/authors', leaderboardController.getAuthorLeaderboard)
router.get('/me', authMiddleware, leaderboardController.getMyProfile)
router.get('/users/:username', leaderboardController.getUserProfile)

export default router

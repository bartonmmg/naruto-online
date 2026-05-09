import { Router } from 'express'
import { newsController } from '../controllers/news.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { authorize } from '../middleware/authorize.middleware.js'

const router = Router()

// Public
router.get('/',              newsController.getAll)
router.get('/rss',           newsController.getRss)
router.get('/categories',    newsController.getCategories)
router.get('/:id',           newsController.getById)
router.get('/:id/related',   newsController.getRelated)
router.post('/:id/react',    newsController.react)

// MOD/ADMIN — create, edit, delete via site
router.post('/',                 authMiddleware, authorize(['ADMIN', 'MODERATOR']), newsController.create)
router.put('/:id',               authMiddleware, authorize(['ADMIN', 'MODERATOR']), newsController.update)
router.delete('/:id',            authMiddleware, authorize(['ADMIN', 'MODERATOR']), newsController.delete)
router.post('/bulk-delete',      authMiddleware, authorize(['ADMIN', 'MODERATOR']), newsController.bulkDelete)
router.put('/:id/pin',           authMiddleware, authorize(['ADMIN', 'MODERATOR']), newsController.togglePinned)

// ADMIN — get current sync state (last sync per channel)
router.post('/sync',       authMiddleware, authorize(['ADMIN']), newsController.triggerSync)
router.get('/sync/state',  authMiddleware, authorize(['ADMIN']), newsController.getSyncState)

// Server-to-server — called by GitHub Actions cron (auth via x-api-key)
router.post('/ingest',       newsController.ingest)
router.post('/ingest-forum', newsController.ingestForum)

export default router

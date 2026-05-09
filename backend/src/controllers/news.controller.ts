import { Request, Response } from 'express'
import { newsService, createNewsSchema, updateNewsSchema } from '../services/news.service.js'
import { AuthRequest } from '../middleware/auth.middleware.js'

function parseImageUrls(raw: string): string[] {
  try { return JSON.parse(raw) } catch { return [] }
}

function formatPost(post: any) {
  return { ...post, imageUrls: parseImageUrls(post.imageUrls) }
}

export const newsController = {
  async getAll(req: Request, res: Response) {
    try {
      // Fire-and-forget Discord sync (non-blocking)
      newsService.syncIfNeeded().catch(e => console.error('[sync]', e))

      const type     = req.query.type     as string | undefined
      const category = req.query.category as string | undefined
      const limit    = Math.min(parseInt(req.query.limit  as string) || 20, 100)
      const offset   = parseInt(req.query.offset as string) || 0

      const [items, total] = await Promise.all([
        newsService.listNews({ type, category, limit, offset }),
        newsService.countNews({ type, category }),
      ])

      res.json({ items: items.map(formatPost), total, limit, offset })
    } catch (e: any) {
      res.status(500).json({ error: e.message })
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const post = await newsService.getNewsById(req.params.id)
      if (!post) return res.status(404).json({ error: 'Novedad no encontrada' })
      res.json(formatPost(post))
    } catch (e: any) {
      res.status(500).json({ error: e.message })
    }
  },

  async create(req: AuthRequest, res: Response) {
    try {
      const data = createNewsSchema.parse(req.body)
      const post = await newsService.createNews(data, req.userId)
      res.status(201).json(formatPost(post))
    } catch (e: any) {
      res.status(400).json({ error: e.message })
    }
  },

  async update(req: AuthRequest, res: Response) {
    try {
      const existing = await newsService.getNewsById(req.params.id)
      if (!existing) return res.status(404).json({ error: 'Novedad no encontrada' })
      const data = updateNewsSchema.parse(req.body)
      const post = await newsService.updateNews(req.params.id, data)
      res.json(formatPost(post))
    } catch (e: any) {
      res.status(400).json({ error: e.message })
    }
  },

  async delete(req: AuthRequest, res: Response) {
    try {
      const existing = await newsService.getNewsById(req.params.id)
      if (!existing) return res.status(404).json({ error: 'Novedad no encontrada' })
      await newsService.deleteNews(req.params.id)
      res.json({ ok: true })
    } catch (e: any) {
      res.status(500).json({ error: e.message })
    }
  },

  async bulkDelete(req: AuthRequest, res: Response) {
    try {
      const ids = req.body?.ids
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: 'Body requires { ids: [...] }' })
      }
      const result = await newsService.bulkDelete(ids)
      res.json({ ok: true, ...result })
    } catch (e: any) {
      res.status(500).json({ error: e.message })
    }
  },

  async togglePinned(req: AuthRequest, res: Response) {
    try {
      const post = await newsService.togglePinned(req.params.id, !!req.body?.pinned)
      res.json(formatPost(post))
    } catch (e: any) {
      res.status(400).json({ error: e.message })
    }
  },

  async getCategories(req: Request, res: Response) {
    try {
      const categories = await newsService.getCategories()
      res.json(categories)
    } catch (e: any) {
      res.status(500).json({ error: e.message })
    }
  },

  async triggerSync(req: AuthRequest, res: Response) {
    try {
      const state = await newsService.getSyncState()
      res.json({
        ok: true,
        message: 'La sincronización con Discord se ejecuta automáticamente cada 30 minutos vía GitHub Actions.',
        state,
      })
    } catch (e: any) {
      res.status(500).json({ error: e.message })
    }
  },

  // Called by GitHub Actions — auth via x-api-key header (server-to-server)
  async ingest(req: Request, res: Response) {
    try {
      const apiKey = req.headers['x-api-key']
      if (!apiKey || apiKey !== process.env.API_KEY) {
        return res.status(401).json({ error: 'Invalid API key' })
      }

      const { channelId, messages } = req.body as {
        channelId?: string
        messages?: any[]
      }

      if (!channelId || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'Body requires { channelId, messages: [...] }' })
      }

      const result = await newsService.ingestMessages(channelId, messages)
      res.json({ ok: true, ...result })
    } catch (e: any) {
      res.status(500).json({ error: e.message })
    }
  },

  async getSyncState(req: AuthRequest, res: Response) {
    try {
      const state = await newsService.getSyncState()
      res.json({ state })
    } catch (e: any) {
      res.status(500).json({ error: e.message })
    }
  },
}

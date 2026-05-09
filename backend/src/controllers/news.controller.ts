import { Request, Response } from 'express'
import { newsService, createNewsSchema, updateNewsSchema } from '../services/news.service.js'
import { AuthRequest } from '../middleware/auth.middleware.js'

function parseJSON<T>(raw: string, fallback: T): T {
  try { return JSON.parse(raw) } catch { return fallback }
}

function formatPost(post: any) {
  return {
    ...post,
    imageUrls: parseJSON<string[]>(post.imageUrls, []),
    reactions: parseJSON<Record<string, number>>(post.reactions ?? '{}', {}),
  }
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

  async getRelated(req: Request, res: Response) {
    try {
      const items = await newsService.getRelated(req.params.id, 3)
      res.json({ items: items.map(formatPost) })
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

  async react(req: Request, res: Response) {
    try {
      const emoji = String(req.body?.emoji || '')
      const delta = req.body?.delta === -1 ? -1 : 1
      // Whitelist allowed emojis to prevent abuse
      const allowed = ['👍', '❤️', '🔥']
      if (!allowed.includes(emoji)) {
        return res.status(400).json({ error: 'Emoji no permitido' })
      }
      const counts = await newsService.addReaction(req.params.id, emoji, delta)
      res.json({ reactions: counts })
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

  async getRss(req: Request, res: Response) {
    try {
      const items = await newsService.listNews({ limit: 30, offset: 0 })
      const siteUrl = process.env.FRONTEND_URL || 'https://naruto-online.netlify.app'
      const escape = (s: string) => s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')

      const itemsXml = items.map((p: any) => {
        const title = escape(String(p.title).replace(/\*\*|__|\*|_|`|#{1,6}\s/g, ''))
        const url   = `${siteUrl}/novedades/${p.id}`
        const desc  = escape((p.content || '').replace(/!\[[^\]]*\]\([^)]+\)/g, '').replace(/<[^>]+>/g, '').slice(0, 500))
        const pub   = new Date(p.publishedAt).toUTCString()
        return `<item>
  <title>${title}</title>
  <link>${url}</link>
  <guid isPermaLink="true">${url}</guid>
  <pubDate>${pub}</pubDate>
  <category>${escape(p.category)}</category>
  <description>${desc}</description>
</item>`
      }).join('\n')

      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>HDRV — Novedades Naruto Online</title>
  <link>${siteUrl}/novedades</link>
  <description>Actualizaciones del servidor de China, eventos y novedades del juego</description>
  <language>es-AR</language>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${itemsXml}
</channel>
</rss>`

      res.set('Content-Type', 'application/rss+xml; charset=utf-8')
      res.send(xml)
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

  async ingestForum(req: Request, res: Response) {
    try {
      const apiKey = req.headers['x-api-key']
      if (!apiKey || apiKey !== process.env.API_KEY) {
        return res.status(401).json({ error: 'Invalid API key' })
      }

      const { category, type, sourceLabel, items } = req.body as {
        category?: string
        type?: string
        sourceLabel?: string
        items?: any[]
      }

      if (!category || !type || !Array.isArray(items)) {
        return res.status(400).json({ error: 'Body requires { category, type, sourceLabel?, items: [...] }' })
      }

      const result = await newsService.ingestForumPosts(
        items,
        category,
        type,
        sourceLabel || '🌐 Foro Oficial',
      )
      res.json({ ok: true, ...result })
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

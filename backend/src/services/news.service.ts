import { prisma } from '../lib/prisma.js'
import { z } from 'zod'

export const DISCORD_CHANNELS = [
  { envKey: 'DISCORD_CH_NINJAS',      category: 'Ninjas',             type: 'CHINA',  acceptBots: false },
  { envKey: 'DISCORD_CH_ESPIRITUS',   category: 'Espíritus Animales', type: 'CHINA',  acceptBots: false },
  { envKey: 'DISCORD_LATAM_EVENTOS',  category: 'Eventos Semanales',  type: 'EVENT',  acceptBots: true  },
  { envKey: 'DISCORD_CH_MODAS',       category: 'Modas',              type: 'CHINA',  acceptBots: false },
]

export const createNewsSchema = z.object({
  title:     z.string().min(1).max(200),
  content:   z.string().min(1),
  type:      z.enum(['CHINA', 'TENTATIVE', 'EVENT', 'GENERAL']),
  category:  z.string().min(1).max(100),
  imageUrls: z.array(z.string()).optional().default([]),
})

export const updateNewsSchema = createNewsSchema.partial()

export const newsService = {
  async listNews(filters: { type?: string; category?: string; limit?: number; offset?: number }) {
    const { type, category, limit = 20, offset = 0 } = filters
    return prisma.newsPost.findMany({
      where: {
        ...(type     ? { type }     : {}),
        ...(category ? { category } : {}),
      },
      include: { author: { select: { username: true, role: true } } },
      orderBy: { publishedAt: 'desc' },
      take: limit,
      skip: offset,
    })
  },

  async countNews(filters: { type?: string; category?: string }) {
    return prisma.newsPost.count({
      where: {
        ...(filters.type     ? { type: filters.type }         : {}),
        ...(filters.category ? { category: filters.category } : {}),
      },
    })
  },

  async getNewsById(id: string) {
    return prisma.newsPost.findUnique({
      where: { id },
      include: { author: { select: { username: true, role: true } } },
    })
  },

  async createNews(data: z.infer<typeof createNewsSchema>, authorId?: string) {
    return prisma.newsPost.create({
      data: {
        title:     data.title,
        content:   data.content,
        type:      data.type,
        category:  data.category,
        imageUrls: JSON.stringify(data.imageUrls ?? []),
        ...(authorId ? { authorId } : {}),
      },
      include: { author: { select: { username: true, role: true } } },
    })
  },

  async updateNews(id: string, data: z.infer<typeof updateNewsSchema>) {
    return prisma.newsPost.update({
      where: { id },
      data: {
        ...(data.title     !== undefined ? { title: data.title }                          : {}),
        ...(data.content   !== undefined ? { content: data.content }                      : {}),
        ...(data.type      !== undefined ? { type: data.type }                            : {}),
        ...(data.category  !== undefined ? { category: data.category }                    : {}),
        ...(data.imageUrls !== undefined ? { imageUrls: JSON.stringify(data.imageUrls) }  : {}),
      },
      include: { author: { select: { username: true, role: true } } },
    })
  },

  async deleteNews(id: string) {
    return prisma.newsPost.delete({ where: { id } })
  },

  async getCategories() {
    const rows = await prisma.newsPost.findMany({
      select:   { category: true },
      distinct: ['category'],
      orderBy:  { category: 'asc' },
    })
    return rows.map(r => r.category)
  },

  // Discord sync se hace via GitHub Actions (ver .github/workflows/discord-sync.yml)
  // que llama a POST /news/ingest. Esto evita el bloqueo de Cloudflare a las IPs de Render.

  async syncIfNeeded() {
    return
  },

  async forceSync() {
    return [{ message: 'Sync se ejecuta automáticamente via GitHub Actions cada 30 min' }]
  },

  // Called by GitHub Actions cron — receives messages already fetched from Discord
  async ingestMessages(channelId: string, messages: Array<{
    id: string
    content: string
    timestamp: string
    author?: { bot?: boolean; username?: string }
    attachments?: Array<{ url: string; content_type?: string }>
  }>) {
    const ch = DISCORD_CHANNELS.find(c => process.env[c.envKey] === channelId)
    if (!ch) {
      throw new Error(`channelId ${channelId} no está configurado en DISCORD_CHANNELS`)
    }

    let saved = 0
    let duplicates = 0
    let lastMessageId: string | undefined

    // Discord returns newest first — process oldest first to keep chronological order
    const ordered = [...messages].reverse()

    for (const msg of ordered) {
      if (msg.author?.bot && !ch.acceptBots) continue
      if (!msg.content && !(msg.attachments?.length)) continue

      const content = msg.content || ''
      const lines = content.split('\n').filter(Boolean)
      const title = lines[0]?.slice(0, 120) || 'Sin título'
      const images = (msg.attachments ?? [])
        .filter(a => (a.content_type ?? '').startsWith('image/'))
        .map(a => a.url)

      try {
        await prisma.newsPost.create({
          data: {
            title,
            content,
            type: ch.type,
            category: ch.category,
            imageUrls: JSON.stringify(images),
            discordMessageId: msg.id,
            publishedAt: new Date(msg.timestamp),
          },
        })
        saved++
      } catch {
        duplicates++
      }
      lastMessageId = msg.id
    }

    if (lastMessageId || messages.length > 0) {
      await prisma.syncLog.upsert({
        where: { channelId },
        update: { lastSyncAt: new Date(), ...(lastMessageId ? { lastMessageId } : {}) },
        create: { channelId, lastSyncAt: new Date(), lastMessageId: lastMessageId ?? null },
      })
    }

    return { saved, duplicates, total: messages.length, category: ch.category }
  },

  async getSyncState() {
    const logs = await prisma.syncLog.findMany()
    return DISCORD_CHANNELS.map(ch => {
      const channelId = process.env[ch.envKey]
      const log = logs.find(l => l.channelId === channelId)
      return {
        category: ch.category,
        channelId: channelId ?? null,
        lastSyncAt: log?.lastSyncAt ?? null,
        lastMessageId: log?.lastMessageId ?? null,
      }
    })
  },
}

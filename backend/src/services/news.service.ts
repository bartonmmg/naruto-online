import { prisma } from '../lib/prisma.js'
import { z } from 'zod'

export const DISCORD_CHANNELS = [
  { envKey: 'DISCORD_CH_NINJAS',      category: 'Ninjas',             type: 'CHINA'     },
  { envKey: 'DISCORD_CH_ESPIRITUS',   category: 'Espíritus Animales', type: 'CHINA'     },
  { envKey: 'DISCORD_LATAM_EVENTOS',  category: 'Eventos Semanales',  type: 'EVENT'     },
  { envKey: 'DISCORD_CH_MODAS',       category: 'Modas',              type: 'CHINA'     },
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

  // ── Discord sync ──────────────────────────────────────────────────────────
  // Persistent bot in lib/discord-bot.ts handles real-time message capture via
  // Gateway events. These methods are kept for compatibility but are no-ops.

  async syncIfNeeded() {
    // Bot persistente captura mensajes en tiempo real — no need to poll
    return
  },

  async forceSync() {
    const { forceCatchUp } = await import('../lib/discord-bot.js')
    return forceCatchUp()
  },

}

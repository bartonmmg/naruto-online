import { prisma } from '../lib/prisma.js'
import { z } from 'zod'
import { REST } from '@discordjs/rest'
import { Routes } from 'discord-api-types/v10'

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

  // Fire-and-forget: call without await from controller
  async syncIfNeeded() {
    const token = process.env.DISCORD_BOT_TOKEN
    if (!token) return

    const today = new Date().toDateString()

    for (const ch of DISCORD_CHANNELS) {
      const channelId = process.env[ch.envKey]
      if (!channelId) continue

      try {
        const log = await prisma.syncLog.findUnique({ where: { channelId } })
        if (log?.lastSyncAt && new Date(log.lastSyncAt).toDateString() === today) continue

        await newsService.syncChannel(channelId, ch.category, ch.type, log?.lastMessageId ?? undefined, token)
      } catch (e) {
        console.error(`[news sync] channel ${channelId} failed:`, e)
      }
    }
  },

  async syncChannel(channelId: string, category: string, type: string, lastMessageId: string | undefined, token: string) {
    console.log(`[news sync] starting sync for ${category} (channelId=${channelId})`)
    const messages = await newsService.fetchDiscordMessages(channelId, lastMessageId, token)
    console.log(`[news sync] fetched ${messages.length} messages for ${category}`)
    if (!messages.length) {
      console.log(`[news sync] no new messages for ${category}, updating lastSyncAt`)
      // Still update lastSyncAt so we don't retry today
      await prisma.syncLog.upsert({
        where:  { channelId },
        update: { lastSyncAt: new Date() },
        create: { channelId, lastSyncAt: new Date() },
      })
      return
    }

    // Discord returns newest first — process oldest first to keep order
    const ordered = [...messages].reverse()

    for (const msg of ordered) {
      if (!msg.content && !msg.attachments?.length) continue
      // Skip bot messages
      if (msg.author?.bot) continue

      const content = msg.content || ''
      const lines   = content.split('\n').filter(Boolean)
      const title   = lines[0]?.slice(0, 120) || 'Sin título'

      // Collect image URLs from attachments
      const images: string[] = (msg.attachments ?? [])
        .filter((a: any) => a.content_type?.startsWith('image/'))
        .map((a: any) => a.url)

      try {
        await prisma.newsPost.create({
          data: {
            title,
            content,
            type,
            category,
            imageUrls:        JSON.stringify(images),
            discordMessageId: msg.id,
            publishedAt:      new Date(msg.timestamp),
          },
        })
      } catch {
        // @@unique on discordMessageId — already exists, skip
      }
    }

    const newestId = ordered[ordered.length - 1]?.id ?? lastMessageId
    await prisma.syncLog.upsert({
      where:  { channelId },
      update: { lastSyncAt: new Date(), lastMessageId: newestId },
      create: { channelId, lastSyncAt: new Date(), lastMessageId: newestId },
    })

    console.log(`[news sync] ${category}: ${messages.length} messages fetched`)
  },

  async fetchDiscordMessages(channelId: string, afterId: string | undefined, token: string): Promise<any[]> {
    if (!token) throw new Error('DISCORD_BOT_TOKEN no configurado')

    const rest = new REST({ version: '10' }).setToken(token)
    const query = new URLSearchParams({ limit: '100' })
    if (afterId) query.set('after', afterId)

    console.log(`[discord] REST fetch channel=${channelId} query=${query.toString()}`)
    const messages = await rest.get(Routes.channelMessages(channelId), { query }) as any[]
    console.log(`[discord] got ${messages.length} messages`)

    return messages.map((m: any) => ({
      id: m.id,
      content: m.content,
      timestamp: m.timestamp,
      author: { bot: m.author?.bot ?? false, username: m.author?.username ?? '' },
      attachments: (m.attachments ?? []).map((a: any) => ({
        url: a.url,
        content_type: a.content_type ?? '',
      })),
    }))
  },

  // Force sync — resets lastMessageId to fetch ALL messages from the beginning
  async forceSync(): Promise<{ channel: string; category: string; fetched: number; saved: number; error?: string }[]> {
    const token = process.env.DISCORD_BOT_TOKEN
    if (!token) throw new Error('DISCORD_BOT_TOKEN no configurado')

    const results = []
    for (const ch of DISCORD_CHANNELS) {
      const channelId = process.env[ch.envKey]
      if (!channelId) {
        results.push({ channel: ch.envKey, category: ch.category, fetched: 0, saved: 0, error: 'env var no configurada' })
        continue
      }

      try {
        // Always fetch from scratch on force sync (no afterId)
        const messages = await newsService.fetchDiscordMessages(channelId, undefined, token)
        let saved = 0

        const ordered = [...messages].reverse()
        for (const msg of ordered) {
          if (!msg.content && !msg.attachments?.length) continue
          if (msg.author?.bot) continue
          const content = msg.content || ''
          const lines   = content.split('\n').filter(Boolean)
          const title   = lines[0]?.slice(0, 120) || 'Sin título'
          const images: string[] = (msg.attachments ?? [])
            .filter((a: any) => a.content_type?.startsWith('image/'))
            .map((a: any) => a.url)
          try {
            await prisma.newsPost.create({
              data: { title, content, type: ch.type, category: ch.category, imageUrls: JSON.stringify(images), discordMessageId: msg.id, publishedAt: new Date(msg.timestamp) },
            })
            saved++
          } catch { /* duplicate */ }
        }

        const newestId = ordered[ordered.length - 1]?.id
        await prisma.syncLog.upsert({
          where:  { channelId },
          update: { lastSyncAt: new Date(), lastMessageId: newestId ?? null },
          create: { channelId, lastSyncAt: new Date(), lastMessageId: newestId ?? null },
        })

        results.push({ channel: channelId, category: ch.category, fetched: messages.length, saved })
        console.log(`[news forceSync] ${ch.category}: fetched=${messages.length} saved=${saved}`)
      } catch (e: any) {
        const errorMsg = e.message || String(e)
        results.push({ channel: channelId, category: ch.category, fetched: 0, saved: 0, error: errorMsg })
        console.error(`[news forceSync] ${ch.category} failed:`, errorMsg, e.stack)
      }
    }
    return results
  },
}

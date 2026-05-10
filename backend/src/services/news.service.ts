import { prisma } from '../lib/prisma.js'
import { z } from 'zod'

export const DISCORD_CHANNELS = [
  { envKey: 'DISCORD_CH_NINJAS',      category: 'Ninjas',             type: 'CHINA',  acceptBots: false },
  { envKey: 'DISCORD_CH_ESPIRITUS',   category: 'Espíritus Animales', type: 'CHINA',  acceptBots: false },
  { envKey: 'DISCORD_CH_MODAS',       category: 'Modas',              type: 'CHINA',  acceptBots: false },
  // Eventos Semanales viene del foro oficial — ver sync-forum.mjs
]

export const createNewsSchema = z.object({
  title:     z.string().min(1).max(200),
  content:   z.string().min(1),
  type:      z.enum(['CHINA', 'TENTATIVE', 'EVENT', 'GENERAL']),
  category:  z.string().min(1).max(100),
  imageUrls: z.array(z.string()).optional().default([]),
  eventStartAt: z.string().datetime().nullable().optional(),
  eventEndAt:   z.string().datetime().nullable().optional(),
})

export const updateNewsSchema = createNewsSchema.partial()

// Strip markdown so the title renders as plain text in cards/lists
function stripMarkdown(s: string): string {
  return s
    .replace(/^#{1,6}\s+/g, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/_(.+?)_/g, '$1')
    .replace(/~~(.+?)~~/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/<a?:(\w+):\d+>/g, ':$1:')
    .replace(/<@!?\d+>/g, '@usuario')
    .replace(/<#\d+>/g, '#canal')
    .trim()
}

const DISCORD_CDN_RE = /^https?:\/\/(cdn|media)\.discordapp\.(com|net)\//

function safeParseArray(raw: string): string[] {
  try {
    const v = JSON.parse(raw)
    return Array.isArray(v) ? v.filter(x => typeof x === 'string') : []
  } catch {
    return []
  }
}

export const newsService = {
  async listDiscordImageUrls(): Promise<string[]> {
    const posts = await prisma.newsPost.findMany({
      where: { imageUrls: { not: '[]' } },
      select: { imageUrls: true },
    })
    const set = new Set<string>()
    for (const p of posts) {
      for (const u of safeParseArray(p.imageUrls)) {
        if (DISCORD_CDN_RE.test(u)) set.add(u)
      }
    }
    return Array.from(set)
  },

  async applyRefreshedImageUrls(map: Record<string, string>): Promise<{ updated: number }> {
    const originals = Object.keys(map)
    if (!originals.length) return { updated: 0 }
    // Only fetch posts that contain at least one of the original URLs
    const posts = await prisma.newsPost.findMany({
      where: { OR: originals.map(u => ({ imageUrls: { contains: u } })) },
      select: { id: true, imageUrls: true },
    })
    let updated = 0
    for (const p of posts) {
      const arr = safeParseArray(p.imageUrls)
      let changed = false
      const next = arr.map(u => {
        const r = map[u]
        if (r && r !== u) { changed = true; return r }
        return u
      })
      if (changed) {
        await prisma.newsPost.update({
          where: { id: p.id },
          data: { imageUrls: JSON.stringify(next) },
        })
        updated++
      }
    }
    return { updated }
  },

  async listNews(filters: { type?: string; category?: string; limit?: number; offset?: number }) {
    const { type, category, limit = 20, offset = 0 } = filters
    return prisma.newsPost.findMany({
      where: {
        ...(type     ? { type }     : {}),
        ...(category ? { category } : {}),
      },
      include: {
        author: { select: { username: true, role: true } },
        _count: { select: { comments: true } },
      },
      orderBy: [{ pinned: 'desc' }, { publishedAt: 'desc' }],
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

  async incrementViews(id: string) {
    try {
      await prisma.newsPost.update({ where: { id }, data: { views: { increment: 1 } } })
    } catch {}
  },

  // ── Comments ──────────────────────────────────────────────────────────────
  async listComments(newsPostId: string) {
    return prisma.newsComment.findMany({
      where: { newsPostId },
      include: { author: { select: { username: true, role: true } } },
      orderBy: { createdAt: 'asc' },
    })
  },

  async createComment(newsPostId: string, authorId: string, content: string) {
    return prisma.newsComment.create({
      data: { newsPostId, authorId, content: content.slice(0, 2000) },
      include: { author: { select: { username: true, role: true } } },
    })
  },

  async deleteComment(commentId: string) {
    return prisma.newsComment.delete({ where: { id: commentId } })
  },

  async getCommentById(commentId: string) {
    return prisma.newsComment.findUnique({ where: { id: commentId } })
  },

  // ── Suggestions ───────────────────────────────────────────────────────────
  async createSuggestion(data: {
    title: string
    content: string
    category: string
    type: string
    suggestedById: string
  }) {
    return prisma.newsSuggestion.create({
      data,
      include: { suggestedBy: { select: { username: true, role: true } } },
    })
  },

  async listSuggestions(status?: string) {
    return prisma.newsSuggestion.findMany({
      where: status ? { status } : {},
      include: { suggestedBy: { select: { username: true, role: true } } },
      orderBy: { createdAt: 'desc' },
    })
  },

  async approveSuggestion(suggestionId: string, reviewerNote?: string) {
    const s = await prisma.newsSuggestion.findUnique({ where: { id: suggestionId } })
    if (!s) throw new Error('Sugerencia no encontrada')
    if (s.status !== 'PENDING') throw new Error('Sugerencia ya revisada')

    // Create the actual NewsPost from the suggestion
    const post = await prisma.newsPost.create({
      data: {
        title: s.title,
        content: s.content,
        type: s.type,
        category: s.category,
        imageUrls: '[]',
        authorId: s.suggestedById,
      },
      include: { author: { select: { username: true, role: true } } },
    })

    await prisma.newsSuggestion.update({
      where: { id: suggestionId },
      data: { status: 'APPROVED', reviewedAt: new Date(), reviewerNote: reviewerNote ?? null },
    })

    return post
  },

  async rejectSuggestion(suggestionId: string, reviewerNote?: string) {
    return prisma.newsSuggestion.update({
      where: { id: suggestionId },
      data: { status: 'REJECTED', reviewedAt: new Date(), reviewerNote: reviewerNote ?? null },
      include: { suggestedBy: { select: { username: true, role: true } } },
    })
  },

  async getRelated(id: string, limit = 3) {
    const post = await prisma.newsPost.findUnique({
      where: { id },
      select: { category: true, type: true },
    })
    if (!post) return []
    return prisma.newsPost.findMany({
      where: { id: { not: id }, category: post.category },
      include: { author: { select: { username: true, role: true } } },
      orderBy: [{ pinned: 'desc' }, { publishedAt: 'desc' }],
      take: limit,
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
        ...(data.eventStartAt ? { eventStartAt: new Date(data.eventStartAt) } : {}),
        ...(data.eventEndAt   ? { eventEndAt:   new Date(data.eventEndAt)   } : {}),
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
        ...(data.eventStartAt !== undefined ? { eventStartAt: data.eventStartAt ? new Date(data.eventStartAt) : null } : {}),
        ...(data.eventEndAt   !== undefined ? { eventEndAt:   data.eventEndAt   ? new Date(data.eventEndAt)   : null } : {}),
      },
      include: { author: { select: { username: true, role: true } } },
    })
  },

  async deleteNews(id: string) {
    return prisma.newsPost.delete({ where: { id } })
  },

  async bulkDelete(ids: string[]) {
    const result = await prisma.newsPost.deleteMany({ where: { id: { in: ids } } })
    return { deleted: result.count }
  },

  async togglePinned(id: string, pinned: boolean) {
    return prisma.newsPost.update({
      where: { id },
      data: { pinned },
      include: { author: { select: { username: true, role: true } } },
    })
  },

  async addReaction(id: string, emoji: string, delta: 1 | -1 = 1) {
    const post = await prisma.newsPost.findUnique({ where: { id }, select: { reactions: true } })
    if (!post) throw new Error('Novedad no encontrada')

    let counts: Record<string, number> = {}
    try { counts = JSON.parse(post.reactions || '{}') } catch {}
    counts[emoji] = Math.max(0, (counts[emoji] || 0) + delta)
    if (counts[emoji] === 0) delete counts[emoji]

    await prisma.newsPost.update({
      where: { id },
      data: { reactions: JSON.stringify(counts) },
    })
    return counts
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
      const rawTitle = lines[0] || 'Sin título'
      const title = (stripMarkdown(rawTitle) || 'Sin título').slice(0, 120)
      const images = (msg.attachments ?? [])
        .filter(a => (a.content_type ?? '').startsWith('image/'))
        .map(a => a.url)

      const discordAuthor = msg.author?.bot
        ? (msg.author?.username || 'BOT')
        : (msg.author?.username || null)

      try {
        await prisma.newsPost.create({
          data: {
            title,
            content,
            type: ch.type,
            category: ch.category,
            imageUrls: JSON.stringify(images),
            discordMessageId: msg.id,
            discordAuthor,
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

  // Generic ingest for forum scraping (or any external source).
  // Each item must include a stable externalId for dedup.
  async ingestForumPosts(items: Array<{
    externalId: string
    title: string
    content: string
    publishedAt?: string
    imageUrls?: string[]
  }>, category: string, type: string, sourceLabel: string) {
    let saved = 0
    let duplicates = 0

    for (const it of items) {
      try {
        await prisma.newsPost.create({
          data: {
            title: it.title.slice(0, 200),
            content: it.content,
            type,
            category,
            imageUrls: JSON.stringify(it.imageUrls ?? []),
            discordMessageId: `forum:${it.externalId}`, // reuse @unique for dedup
            discordAuthor: sourceLabel,                  // e.g. "🌐 Foro Oficial"
            publishedAt: it.publishedAt ? new Date(it.publishedAt) : new Date(),
          },
        })
        saved++
      } catch {
        duplicates++
      }
    }

    return { saved, duplicates, total: items.length, category }
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

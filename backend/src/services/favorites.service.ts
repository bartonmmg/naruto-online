import { prisma } from '../lib/prisma.js'

export type FavoriteType = 'GUIDE' | 'NEWS' | 'PLAYER'

const VALID_TYPES: FavoriteType[] = ['GUIDE', 'NEWS', 'PLAYER']

export const favoritesService = {
  isValidType(type: string): type is FavoriteType {
    return VALID_TYPES.includes(type as FavoriteType)
  },

  async toggle(userId: string, type: FavoriteType, targetId: string) {
    const existing = await prisma.favorite.findUnique({
      where: { userId_type_targetId: { userId, type, targetId } },
    })
    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } })
      return { favorited: false }
    }
    await prisma.favorite.create({ data: { userId, type, targetId } })
    return { favorited: true }
  },

  async list(userId: string, type?: FavoriteType) {
    return prisma.favorite.findMany({
      where: { userId, ...(type ? { type } : {}) },
      orderBy: { createdAt: 'desc' },
    })
  },

  async listEnriched(userId: string, type: FavoriteType) {
    const favs = await prisma.favorite.findMany({
      where: { userId, type },
      orderBy: { createdAt: 'desc' },
    })
    if (!favs.length) return []
    const ids = favs.map(f => f.targetId)

    if (type === 'GUIDE') {
      const guides = await prisma.guide.findMany({
        where: { id: { in: ids } },
        select: {
          id: true, title: true, category: true, difficulty: true, viewCount: true,
          coverImage: true, badges: true, status: true, createdAt: true,
          author: { select: { username: true, level: true, avatarSlug: true, frameSlug: true } },
        },
      })
      return favs.map(f => ({ ...f, target: guides.find(g => g.id === f.targetId) ?? null }))
    }

    if (type === 'NEWS') {
      const news = await prisma.newsPost.findMany({
        where: { id: { in: ids } },
        select: {
          id: true, title: true, content: true, type: true, category: true,
          imageUrls: true, publishedAt: true, views: true, pinned: true,
        },
      })
      return favs.map(f => ({ ...f, target: news.find(n => n.id === f.targetId) ?? null }))
    }

    // PLAYER — targetId is a free-form player identifier; just return as-is
    return favs.map(f => ({ ...f, target: { id: f.targetId } }))
  },

  async checkMany(userId: string, type: FavoriteType, targetIds: string[]) {
    if (!targetIds.length) return {} as Record<string, boolean>
    const found = await prisma.favorite.findMany({
      where: { userId, type, targetId: { in: targetIds } },
      select: { targetId: true },
    })
    const set = new Set(found.map(f => f.targetId))
    return targetIds.reduce<Record<string, boolean>>((acc, id) => {
      acc[id] = set.has(id)
      return acc
    }, {})
  },
}

import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { xpService } from './xp.service.js'

export const createGuideSchema = z.object({
  title: z.string().min(5, 'El título debe tener al menos 5 caracteres').max(100, 'El título no puede exceder 100 caracteres'),
  category: z.string().min(1, 'Debes seleccionar una categoría'),
  difficulty: z.string().min(1, 'Debes seleccionar una dificultad'),
  content: z.string().min(20, 'El contenido debe tener al menos 20 caracteres'),
  imageUrls: z.array(z.string()).optional().default([]),
  videoUrls: z.array(z.string()).optional().default([]),
  coverImage: z.string().url().optional().nullable(),
  status: z.enum(['DRAFT', 'PUBLISHED']).optional().default('DRAFT'),
})

export const updateGuideSchema = z.object({
  title: z.string().min(5, 'El título debe tener al menos 5 caracteres').max(100, 'El título no puede exceder 100 caracteres').optional(),
  category: z.string().min(1, 'Debes seleccionar una categoría').optional(),
  difficulty: z.string().min(1, 'Debes seleccionar una dificultad').optional(),
  content: z.string().min(20, 'El contenido debe tener al menos 20 caracteres').optional(),
  imageUrls: z.array(z.string()).optional(),
  videoUrls: z.array(z.string()).optional(),
  coverImage: z.string().url().optional().nullable(),
  status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
})

export const rateGuideSchema = z.object({
  value: z.union([z.literal(1), z.literal(-1)]),
})

export const createCommentSchema = z.object({
  content: z.string().min(1, 'El comentario no puede estar vacío').max(1000, 'El comentario no puede exceder 1000 caracteres'),
})

export const manageBadgesSchema = z.object({
  badges: z.array(z.enum(['OFFICIAL', 'TRENDING', 'VERIFIED', 'COMPLETE'])),
})

type CreateGuideInput = z.infer<typeof createGuideSchema>
type UpdateGuideInput = z.infer<typeof updateGuideSchema>
type RateGuideInput = z.infer<typeof rateGuideSchema>
type CreateCommentInput = z.infer<typeof createCommentSchema>
type ManageBadgesInput = z.infer<typeof manageBadgesSchema>

export const guidesService = {
  async getAllGuides(filters?: { category?: string; difficulty?: string }) {
    const where: any = {}

    if (filters?.category) {
      where.category = filters.category
    }

    if (filters?.difficulty) {
      where.difficulty = filters.difficulty
    }

    return await prisma.guide.findMany({
      where,
      include: {
        author: {
          select: { username: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  },

  async getPublishedGuides(filters?: { category?: string; difficulty?: string }) {
    const where: any = { status: 'PUBLISHED' }

    if (filters?.category) {
      where.category = filters.category
    }

    if (filters?.difficulty) {
      where.difficulty = filters.difficulty
    }

    return await prisma.guide.findMany({
      where,
      include: {
        author: {
          select: { username: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  },

  async getGuideById(id: string) {
    return await prisma.guide.findUnique({
      where: { id },
      include: {
        author: {
          select: { username: true },
        },
      },
    })
  },

  async createGuide(data: CreateGuideInput, authorId: string) {
    const guide = await prisma.guide.create({
      data: {
        title: data.title,
        category: data.category,
        difficulty: data.difficulty,
        content: data.content,
        imageUrls: JSON.stringify(data.imageUrls || []),
        videoUrls: JSON.stringify(data.videoUrls || []),
        coverImage: data.coverImage ?? null,
        status: data.status || 'DRAFT',
        authorId,
      },
      include: { author: { select: { username: true } } },
    })

    // XP + achievements fire-and-forget (only when published)
    if (guide.status === 'PUBLISHED') {
      xpService.awardXp(authorId, 'GUIDE_PUBLISHED').catch(() => {})
      xpService.checkAchievements(authorId).catch(() => {})
    }

    return guide
  },

  async updateGuide(id: string, data: UpdateGuideInput, requesterId: string, requesterRole: string) {
    const guide = await prisma.guide.findUnique({
      where: { id },
    })

    if (!guide) {
      throw new Error('Guía no encontrada')
    }

    // Solo el autor o un admin/moderador pueden editar
    if (guide.authorId !== requesterId && !['ADMIN', 'MODERATOR'].includes(requesterRole)) {
      throw new Error('Sin permiso para editar esta guía')
    }

    // Obtener el username del que edita
    const requester = await prisma.user.findUnique({
      where: { id: requesterId },
      select: { username: true },
    })

    const updateData: any = {}

    if (data.title !== undefined) updateData.title = data.title
    if (data.category !== undefined) updateData.category = data.category
    if (data.difficulty !== undefined) updateData.difficulty = data.difficulty
    if (data.content !== undefined) updateData.content = data.content
    if (data.status !== undefined) updateData.status = data.status
    if (data.imageUrls !== undefined) updateData.imageUrls = JSON.stringify(data.imageUrls)
    if (data.videoUrls !== undefined) updateData.videoUrls = JSON.stringify(data.videoUrls)

    // Actualizar la guía
    const updatedGuide = await prisma.guide.update({
      where: { id },
      data: updateData,
      include: {
        author: {
          select: { username: true },
        },
      },
    })

    // Registrar la edición en el historial
    if (requester) {
      await prisma.guideEditHistory.create({
        data: {
          guideId: id,
          editedBy: requester.username,
        },
      })
    }

    return updatedGuide
  },

  async getEditHistory(guideId: string) {
    return await prisma.guideEditHistory.findMany({
      where: { guideId },
      orderBy: { editedAt: 'desc' },
    })
  },

  async deleteGuide(id: string, requesterId: string, requesterRole: string) {
    const guide = await prisma.guide.findUnique({
      where: { id },
    })

    if (!guide) {
      throw new Error('Guía no encontrada')
    }

    // Solo el autor o un admin/moderador pueden eliminar
    if (guide.authorId !== requesterId && !['ADMIN', 'MODERATOR'].includes(requesterRole)) {
      throw new Error('Sin permiso para eliminar esta guía')
    }

    return await prisma.guide.delete({
      where: { id },
    })
  },

  async recordView(guideId: string, userId?: string, ipAddress?: string) {
    const guide = await prisma.guide.findUnique({ where: { id: guideId } })
    if (!guide) {
      throw new Error('Guía no encontrada')
    }

    if (userId) {
      // Authenticated: deduplicate by userId
      await prisma.guideView.upsert({
        where: { guideId_userId: { guideId, userId } },
        create: { guideId, userId, ipAddress },
        update: { viewedAt: new Date() },
      })
    } else if (ipAddress) {
      // Anonymous: deduplicate by IP address
      try {
        await prisma.guideView.upsert({
          where: { guideId_ipAddress: { guideId, ipAddress } },
          create: { guideId, ipAddress },
          update: { viewedAt: new Date() },
        })
      } catch {
        // If IP constraint fails for any reason, skip silently
      }
    }
    // If no userId and no IP (shouldn't happen in practice), skip

    // Count all unique view records
    const totalViews = await prisma.guideView.count({ where: { guideId } })

    await prisma.guide.update({
      where: { id: guideId },
      data: { viewCount: totalViews },
    })

    // Milestone notifications (100, 500, 1000 views)
    const milestones = [100, 500, 1000]
    if (milestones.includes(totalViews)) {
      const g = await prisma.guide.findUnique({ where: { id: guideId }, select: { authorId: true, title: true } })
      if (g) {
        await prisma.notification.create({
          data: {
            userId: g.authorId,
            type: 'MILESTONE',
            message: `Tu guía "${g.title}" alcanzó ${totalViews} vistas`,
            guideId,
            guideTitle: g.title,
          },
        })
      }
    }

    return { viewCount: totalViews }
  },

  async rateGuide(guideId: string, userId: string, value: number) {
    const guide = await prisma.guide.findUnique({ where: { id: guideId } })
    if (!guide) throw new Error('Guía no encontrada')

    // Check if this is a new vote (not updating existing)
    const existing = await prisma.guideRating.findUnique({
      where: { guideId_userId: { guideId, userId } },
    })

    const result = await prisma.guideRating.upsert({
      where: { guideId_userId: { guideId, userId } },
      create: { guideId, userId, value },
      update: { value },
    })

    // Award XP to voter only on first vote (not on toggle/change)
    if (!existing) {
      xpService.awardXp(userId, 'VOTE_CAST').catch(() => {})
    }

    // Award XP to guide author when receiving an upvote
    if (value === 1 && guide.authorId !== userId) {
      xpService.awardXp(guide.authorId, 'VOTE_RECEIVED').catch(() => {})
      xpService.checkAchievements(guide.authorId).catch(() => {})
    }

    return result
  },

  async removeRating(guideId: string, userId: string) {
    return await prisma.guideRating.deleteMany({
      where: { guideId, userId },
    })
  },

  async getGuideRatings(guideId: string, userId?: string) {
    const ratings = await prisma.guideRating.findMany({
      where: { guideId },
    })

    const upvotes = ratings.filter(r => r.value === 1).length
    const downvotes = ratings.filter(r => r.value === -1).length
    const userVote = userId ? ratings.find(r => r.userId === userId)?.value ?? null : null

    return { upvotes, downvotes, userVote }
  },

  async addComment(guideId: string, authorId: string, content: string) {
    const guide = await prisma.guide.findUnique({ where: { id: guideId } })
    if (!guide) {
      throw new Error('Guía no encontrada')
    }

    const comment = await prisma.guideComment.create({
      data: { guideId, authorId, content },
      include: { author: { select: { username: true } } },
    })

    // Notify guide author (if not commenting on own guide)
    // Only create if no existing unread comment notification for this guide — avoids spam
    const guideAuthor = await prisma.guide.findUnique({ where: { id: guideId }, select: { authorId: true, title: true } })
    if (guideAuthor && guideAuthor.authorId !== authorId) {
      const existingUnread = await prisma.notification.findFirst({
        where: { userId: guideAuthor.authorId, type: 'COMMENT', guideId, read: false },
      })
      if (!existingUnread) {
        const commenter = await prisma.user.findUnique({ where: { id: authorId }, select: { username: true } })
        await prisma.notification.create({
          data: {
            userId: guideAuthor.authorId,
            type: 'COMMENT',
            message: `${commenter?.username} comentó tu guía`,
            guideId,
            guideTitle: guideAuthor.title,
          },
        })
      }
    }

    // XP for commenter + check achievements
    xpService.awardXp(authorId, 'COMMENT_POSTED').catch(() => {})
    xpService.checkAchievements(authorId).catch(() => {})

    return comment
  },

  async deleteComment(commentId: string, requesterId: string, requesterRole: string) {
    const comment = await prisma.guideComment.findUnique({
      where: { id: commentId },
    })

    if (!comment) {
      throw new Error('Comentario no encontrado')
    }

    if (comment.authorId !== requesterId && !['ADMIN', 'MODERATOR'].includes(requesterRole)) {
      throw new Error('Sin permiso para eliminar este comentario')
    }

    return await prisma.guideComment.delete({
      where: { id: commentId },
    })
  },

  async getComments(guideId: string) {
    return await prisma.guideComment.findMany({
      where: { guideId },
      include: { author: { select: { username: true, id: true } } },
      orderBy: { createdAt: 'desc' },
    })
  },

  async updateBadges(guideId: string, badges: string[], requesterId: string, requesterRole: string) {
    if (!['ADMIN', 'MODERATOR'].includes(requesterRole)) {
      throw new Error('Sin permiso para asignar badges')
    }

    const guide = await prisma.guide.findUnique({ where: { id: guideId } })
    if (!guide) {
      throw new Error('Guía no encontrada')
    }

    const updated = await prisma.guide.update({
      where: { id: guideId },
      data: { badges: JSON.stringify(badges) },
      include: {
        author: { select: { username: true } },
      },
    })

    const author = await prisma.guide.findUnique({ where: { id: guideId }, select: { authorId: true, title: true } })
    if (author && badges.length > 0) {
      // Only notify if there is no recent unread badge notification for this guide
      // Prevents spam when admin saves badges multiple times
      const existingUnread = await prisma.notification.findFirst({
        where: { userId: author.authorId, type: 'BADGE', guideId, read: false },
      })
      if (!existingUnread) {
        await prisma.notification.create({
          data: {
            userId: author.authorId,
            type: 'BADGE',
            message: `Tu guía "${author.title}" recibió un badge`,
            guideId,
            guideTitle: author.title,
          },
        })
      }

      // XP for receiving a badge + check achievements (fire-and-forget)
      xpService.awardXp(author.authorId, 'BADGE_RECEIVED').catch(() => {})
      xpService.checkAchievements(author.authorId).catch(() => {})
    }

    return updated
  },

  async toggleReaction(guideId: string, userId: string, emoji: string) {
    const guide = await prisma.guide.findUnique({ where: { id: guideId } })
    if (!guide) {
      throw new Error('Guía no encontrada')
    }

    const existing = await prisma.guideReaction.findUnique({
      where: { guideId_userId_emoji: { guideId, userId, emoji } },
    })

    if (existing) {
      await prisma.guideReaction.delete({ where: { id: existing.id } })
    } else {
      await prisma.guideReaction.create({ data: { guideId, userId, emoji } })
      // Award XP to reactor on first reaction of this emoji on this guide
      xpService.awardXp(userId, 'REACTION_CAST').catch(() => {})
    }

    return await this.getReactions(guideId, userId)
  },

  async removeReaction(guideId: string, userId: string, emoji: string) {
    await prisma.guideReaction.deleteMany({
      where: { guideId, userId, emoji },
    })

    return await this.getReactions(guideId, userId)
  },

  async getReactions(guideId: string, userId?: string) {
    const reactions = await prisma.guideReaction.findMany({
      where: { guideId },
    })

    const EMOJIS = ['❤️', '🔥', '👏', '😂', '🤔']
    const result: Record<string, any> = {}

    for (const emoji of EMOJIS) {
      const emojiReactions = reactions.filter(r => r.emoji === emoji)
      result[emoji] = {
        emoji,
        count: emojiReactions.length,
        userReacted: userId ? emojiReactions.some(r => r.userId === userId) : false,
      }
    }

    return result
  },

  async getLeaderboard() {
    // Top guides by views, ratings, comments, trending (last 7 days)
    const allGuides = await prisma.guide.findMany({
      where: { status: 'PUBLISHED' },
      include: {
        author: { select: { username: true, id: true } },
        _count: { select: { ratings: true, comments: true, reactions: true, views: true } },
      },
    })

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    // Recent views count per guide
    const recentViews = await prisma.guideView.groupBy({
      by: ['guideId'],
      where: { viewedAt: { gte: sevenDaysAgo } },
      _count: { guideId: true },
    })
    const recentViewMap: Record<string, number> = {}
    recentViews.forEach(r => { recentViewMap[r.guideId] = r._count.guideId })

    // Upvotes per guide
    const upvotes = await prisma.guideRating.groupBy({
      by: ['guideId'],
      where: { value: 1 },
      _count: { guideId: true },
    })
    const upvoteMap: Record<string, number> = {}
    upvotes.forEach(r => { upvoteMap[r.guideId] = r._count.guideId })

    const formatted = allGuides.map(g => ({
      id: g.id,
      title: g.title,
      category: g.category,
      difficulty: g.difficulty,
      badges: g.badges ? JSON.parse(g.badges) : [],
      author: g.author,
      viewCount: g.viewCount || 0,
      recentViews: recentViewMap[g.id] || 0,
      upvotes: upvoteMap[g.id] || 0,
      commentCount: g._count.comments,
      reactionCount: g._count.reactions,
      score: (g.viewCount || 0) * 0.3 + (g._count.comments) * 0.4 + (upvoteMap[g.id] || 0) * 0.3,
      createdAt: g.createdAt,
    }))

    return {
      topViews: [...formatted].sort((a, b) => b.viewCount - a.viewCount).slice(0, 10),
      topRated: [...formatted].sort((a, b) => b.upvotes - a.upvotes).slice(0, 10),
      topCommented: [...formatted].sort((a, b) => b.commentCount - a.commentCount).slice(0, 10),
      trending: [...formatted].sort((a, b) => b.recentViews - a.recentViews).slice(0, 10),
      topScore: [...formatted].sort((a, b) => b.score - a.score).slice(0, 10),
    }
  },

  async getAuthorLeaderboard() {
    const authors = await prisma.user.findMany({
      where: { guides: { some: { status: 'PUBLISHED' } } },
      select: {
        id: true,
        username: true,
        level: true,
        xp: true,
        guides: {
          where: { status: 'PUBLISHED' },
          select: {
            id: true,
            title: true,
            viewCount: true,
            badges: true,
            _count: { select: { ratings: true, comments: true, reactions: true } },
          },
        },
      },
    })

    // Upvotes per author
    const upvotes = await prisma.guideRating.findMany({
      where: { value: 1, guide: { status: 'PUBLISHED' } },
      select: { guide: { select: { authorId: true } } },
    })
    const upvoteByAuthor: Record<string, number> = {}
    upvotes.forEach(u => {
      const aid = u.guide.authorId
      upvoteByAuthor[aid] = (upvoteByAuthor[aid] || 0) + 1
    })

    const formatted = authors.map(u => {
      const totalViews = u.guides.reduce((sum, g) => sum + (g.viewCount || 0), 0)
      const totalComments = u.guides.reduce((sum, g) => sum + g._count.comments, 0)
      const totalReactions = u.guides.reduce((sum, g) => sum + g._count.reactions, 0)
      const upvotesCount = upvoteByAuthor[u.id] || 0
      const badgeCount = u.guides.reduce((sum, g) => {
        try { return sum + (JSON.parse(g.badges || '[]') as string[]).length } catch { return sum }
      }, 0)
      return {
        id: u.id,
        username: u.username,
        level: u.level,
        xp: u.xp,
        guideCount: u.guides.length,
        totalViews,
        totalComments,
        totalReactions,
        upvotes: upvotesCount,
        badgeCount,
        score: totalViews * 0.3 + totalComments * 0.3 + upvotesCount * 0.4,
      }
    })

    return formatted.sort((a, b) => b.score - a.score)
  },

  async getUserProfile(username: string) {
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        level: true,
        xp: true,
        role: true,
        createdAt: true,
        avatarSlug: true,
        bannerSlug: true,
        frameSlug: true,
        bio: true,
        customTitle: true,
        nameColor: true,
        pinnedAchievements: true,
        gameServer: true,
        socialLinks: true,
        guides: {
          where: { status: 'PUBLISHED' },
          select: {
            id: true,
            title: true,
            category: true,
            difficulty: true,
            viewCount: true,
            badges: true,
            createdAt: true,
            _count: { select: { ratings: true, comments: true, reactions: true } },
          },
          orderBy: { viewCount: 'desc' },
        },
      },
    })

    if (!user) return null

    const upvotes = await prisma.guideRating.count({
      where: { value: 1, guide: { authorId: user.id, status: 'PUBLISHED' } },
    })

    const totalViews = user.guides.reduce((sum, g) => sum + (g.viewCount || 0), 0)
    const totalComments = user.guides.reduce((sum, g) => sum + g._count.comments, 0)
    const totalReactions = user.guides.reduce((sum, g) => sum + g._count.reactions, 0)

    return {
      ...user,
      guides: user.guides.map(g => ({
        ...g,
        badges: g.badges ? JSON.parse(g.badges) : [],
      })),
      stats: { totalViews, totalComments, totalReactions, upvotes, guideCount: user.guides.length },
    }
  },
}

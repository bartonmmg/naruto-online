import { z } from 'zod'
import { prisma } from '../lib/prisma.js'

export const createGuideSchema = z.object({
  title: z.string().min(5, 'El título debe tener al menos 5 caracteres').max(100, 'El título no puede exceder 100 caracteres'),
  category: z.string().min(1, 'Debes seleccionar una categoría'),
  difficulty: z.string().min(1, 'Debes seleccionar una dificultad'),
  content: z.string().min(20, 'El contenido debe tener al menos 20 caracteres'),
  imageUrls: z.array(z.string()).optional().default([]),
  videoUrls: z.array(z.string()).optional().default([]),
  status: z.enum(['DRAFT', 'PUBLISHED']).optional().default('DRAFT'),
})

export const updateGuideSchema = z.object({
  title: z.string().min(5, 'El título debe tener al menos 5 caracteres').max(100, 'El título no puede exceder 100 caracteres').optional(),
  category: z.string().min(1, 'Debes seleccionar una categoría').optional(),
  difficulty: z.string().min(1, 'Debes seleccionar una dificultad').optional(),
  content: z.string().min(20, 'El contenido debe tener al menos 20 caracteres').optional(),
  imageUrls: z.array(z.string()).optional(),
  videoUrls: z.array(z.string()).optional(),
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
    return await prisma.guide.create({
      data: {
        title: data.title,
        category: data.category,
        difficulty: data.difficulty,
        content: data.content,
        imageUrls: JSON.stringify(data.imageUrls || []),
        videoUrls: JSON.stringify(data.videoUrls || []),
        status: data.status || 'DRAFT',
        authorId,
      },
      include: {
        author: {
          select: { username: true },
        },
      },
    })
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

  async recordView(guideId: string, userId?: string) {
    // Check if this user/anonymous already viewed this guide today
    // For logged in users, only count once per guide per user
    // For anonymous (userId=null), count once per session but we'll count all

    console.log(`[recordView] guideId=${guideId}, userId=${userId}`)

    const guide = await prisma.guide.findUnique({ where: { id: guideId } })
    if (!guide) {
      throw new Error('Guía no encontrada')
    }

    if (userId) {
      console.log(`[recordView] Upserting view for authenticated user ${userId}`)
      // For logged-in users, upsert (update if exists, create if not)
      // This ensures one view per user per guide
      await prisma.guideView.upsert({
        where: { guideId_userId: { guideId, userId } },
        create: { guideId, userId },
        update: { viewedAt: new Date() },
      })
    } else {
      console.log(`[recordView] Creating view for anonymous user`)
      // For anonymous users, just create a new view record
      // This will count each session as a view
      await prisma.guideView.create({
        data: { guideId },
      })
    }

    // Calculate total unique views (unique user IDs, plus count of null userId)
    const views = await prisma.guideView.findMany({
      where: { guideId },
      select: { userId: true },
    })

    const uniqueUserViews = new Set(views.filter(v => v.userId).map(v => v.userId)).size
    const totalViews = uniqueUserViews + views.filter(v => !v.userId).length

    // Update the viewCount in the guide
    await prisma.guide.update({
      where: { id: guideId },
      data: { viewCount: totalViews },
    })

    return { viewCount: totalViews }
  },

  async rateGuide(guideId: string, userId: string, value: number) {
    const guide = await prisma.guide.findUnique({ where: { id: guideId } })
    if (!guide) {
      throw new Error('Guía no encontrada')
    }

    return await prisma.guideRating.upsert({
      where: { guideId_userId: { guideId, userId } },
      create: { guideId, userId, value },
      update: { value },
    })
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

    return await prisma.guideComment.create({
      data: { guideId, authorId, content },
      include: { author: { select: { username: true } } },
    })
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

    return await prisma.guide.update({
      where: { id: guideId },
      data: { badges: JSON.stringify(badges) },
      include: {
        author: { select: { username: true } },
      },
    })
  },
}

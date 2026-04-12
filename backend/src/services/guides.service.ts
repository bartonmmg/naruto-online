import { z } from 'zod'
import { prisma } from '../lib/prisma.js'

export const createGuideSchema = z.object({
  title: z.string().min(5, 'El título debe tener al menos 5 caracteres').max(100, 'El título no puede exceder 100 caracteres'),
  category: z.string().min(1, 'Debes seleccionar una categoría'),
  difficulty: z.string().min(1, 'Debes seleccionar una dificultad'),
  content: z.string().min(20, 'El contenido debe tener al menos 20 caracteres'),
  imageUrls: z.array(z.string()).optional().default([]),
  videoUrls: z.array(z.string()).optional().default([]),
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

type CreateGuideInput = z.infer<typeof createGuideSchema>
type UpdateGuideInput = z.infer<typeof updateGuideSchema>

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
        status: 'PUBLISHED',
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
}

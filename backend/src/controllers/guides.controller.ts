import { Response } from 'express'
import { AuthRequest } from '../middleware/auth.middleware.js'
import { guidesService, createGuideSchema, updateGuideSchema, rateGuideSchema, createCommentSchema, manageBadgesSchema } from '../services/guides.service.js'

export const guidesController = {
  async getAll(req: AuthRequest, res: Response) {
    try {
      const { category, difficulty } = req.query

      const guides = await guidesService.getAllGuides({
        category: category as string | undefined,
        difficulty: difficulty as string | undefined,
      })

      // Parse JSON strings back to arrays
      const formattedGuides = guides.map(guide => ({
        ...guide,
        imageUrls: guide.imageUrls ? JSON.parse(guide.imageUrls) : [],
        videoUrls: guide.videoUrls ? JSON.parse(guide.videoUrls) : [],
        badges: guide.badges ? JSON.parse(guide.badges) : [],
      }))

      res.json(formattedGuides)
    } catch (error) {
      console.error('Error fetching guides:', error)
      res.status(500).json({ error: 'Error al obtener guías' })
    }
  },

  async getById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params

      const guide = await guidesService.getGuideById(id)

      if (!guide) {
        return res.status(404).json({ error: 'Guía no encontrada' })
      }

      // Parse JSON strings back to arrays
      const formattedGuide = {
        ...guide,
        imageUrls: guide.imageUrls ? JSON.parse(guide.imageUrls) : [],
        videoUrls: guide.videoUrls ? JSON.parse(guide.videoUrls) : [],
        badges: guide.badges ? JSON.parse(guide.badges) : [],
      }

      res.json(formattedGuide)
    } catch (error) {
      console.error('Error fetching guide:', error)
      res.status(500).json({ error: 'Error al obtener la guía' })
    }
  },

  async recordView(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params

      // Extract userId from token if available (this endpoint doesn't require auth)
      let userId: string | undefined = undefined
      const authHeader = req.headers.authorization
      if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
          const jwt = require('jsonwebtoken')
          const token = authHeader.substring(7) // Remove 'Bearer '
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret') as any
          userId = decoded.userId
        } catch {
          // Token invalid or expired, continue as anonymous
        }
      }

      // Record the view (userId optional for anonymous users)
      const result = await guidesService.recordView(id, userId)

      res.json(result)
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al registrar vista' })
    }
  },

  async create(req: AuthRequest, res: Response) {
    try {
      const validated = await createGuideSchema.parseAsync(req.body)

      const guide = await guidesService.createGuide(validated, req.userId!)

      // Parse JSON strings back to arrays
      const formattedGuide = {
        ...guide,
        imageUrls: guide.imageUrls ? JSON.parse(guide.imageUrls) : [],
        videoUrls: guide.videoUrls ? JSON.parse(guide.videoUrls) : [],
        badges: guide.badges ? JSON.parse(guide.badges) : [],
      }

      res.status(201).json(formattedGuide)
    } catch (error: any) {
      if (error.errors) {
        return res.status(400).json({ error: 'Validación fallida', details: error.errors })
      }
      console.error('Error creating guide:', error)
      res.status(500).json({ error: error.message || 'Error al crear la guía' })
    }
  },

  async update(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params
      const validated = await updateGuideSchema.parseAsync(req.body)

      const guide = await guidesService.updateGuide(id, validated, req.userId!, req.role!)

      // Parse JSON strings back to arrays
      const formattedGuide = {
        ...guide,
        imageUrls: guide.imageUrls ? JSON.parse(guide.imageUrls) : [],
        videoUrls: guide.videoUrls ? JSON.parse(guide.videoUrls) : [],
        badges: guide.badges ? JSON.parse(guide.badges) : [],
      }

      res.json(formattedGuide)
    } catch (error: any) {
      if (error.errors) {
        return res.status(400).json({ error: 'Validación fallida', details: error.errors })
      }

      if (error.message.includes('Sin permiso')) {
        return res.status(403).json({ error: error.message })
      }

      if (error.message.includes('no encontrada')) {
        return res.status(404).json({ error: error.message })
      }

      console.error('Error updating guide:', error)
      res.status(500).json({ error: error.message || 'Error al actualizar la guía' })
    }
  },

  async getEditHistory(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params

      const history = await guidesService.getEditHistory(id)

      res.json(history)
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al obtener el historial' })
    }
  },

  async delete(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params

      await guidesService.deleteGuide(id, req.userId!, req.role!)

      res.json({ message: 'Guía eliminada correctamente' })
    } catch (error: any) {
      if (error.message.includes('Sin permiso')) {
        return res.status(403).json({ error: error.message })
      }

      if (error.message.includes('no encontrada')) {
        return res.status(404).json({ error: error.message })
      }

      res.status(500).json({ error: error.message || 'Error al eliminar la guía' })
    }
  },

  async rateGuide(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params
      const validated = await rateGuideSchema.parseAsync(req.body)

      await guidesService.rateGuide(id, req.userId!, validated.value)
      const ratings = await guidesService.getGuideRatings(id, req.userId!)

      res.json(ratings)
    } catch (error: any) {
      if (error.errors) {
        return res.status(400).json({ error: 'Validación fallida', details: error.errors })
      }
      res.status(500).json({ error: error.message || 'Error al calificar la guía' })
    }
  },

  async removeRating(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params

      await guidesService.removeRating(id, req.userId!)
      const ratings = await guidesService.getGuideRatings(id, req.userId!)

      res.json(ratings)
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al remover calificación' })
    }
  },

  async getRatings(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params

      const ratings = await guidesService.getGuideRatings(id, req.userId)

      res.json(ratings)
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al obtener calificaciones' })
    }
  },

  async addComment(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params
      const validated = await createCommentSchema.parseAsync(req.body)

      const comment = await guidesService.addComment(id, req.userId!, validated.content)

      res.status(201).json(comment)
    } catch (error: any) {
      if (error.errors) {
        return res.status(400).json({ error: 'Validación fallida', details: error.errors })
      }
      res.status(500).json({ error: error.message || 'Error al agregar comentario' })
    }
  },

  async deleteComment(req: AuthRequest, res: Response) {
    try {
      const { id: guideId, commentId } = req.params

      await guidesService.deleteComment(commentId, req.userId!, req.role!)

      res.json({ message: 'Comentario eliminado correctamente' })
    } catch (error: any) {
      if (error.message.includes('Sin permiso')) {
        return res.status(403).json({ error: error.message })
      }

      if (error.message.includes('no encontrado')) {
        return res.status(404).json({ error: error.message })
      }

      res.status(500).json({ error: error.message || 'Error al eliminar comentario' })
    }
  },

  async getComments(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params

      const comments = await guidesService.getComments(id)

      res.json(comments)
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al obtener comentarios' })
    }
  },

  async updateBadges(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params
      const validated = await manageBadgesSchema.parseAsync(req.body)

      const guide = await guidesService.updateBadges(id, validated.badges, req.userId!, req.role!)

      // Parse badges back to array
      const formattedGuide = {
        ...guide,
        imageUrls: guide.imageUrls ? JSON.parse(guide.imageUrls) : [],
        videoUrls: guide.videoUrls ? JSON.parse(guide.videoUrls) : [],
        badges: guide.badges ? JSON.parse(guide.badges) : [],
      }

      res.json(formattedGuide)
    } catch (error: any) {
      if (error.errors) {
        return res.status(400).json({ error: 'Validación fallida', details: error.errors })
      }

      if (error.message.includes('Sin permiso')) {
        return res.status(403).json({ error: error.message })
      }

      res.status(500).json({ error: error.message || 'Error al actualizar badges' })
    }
  },
}

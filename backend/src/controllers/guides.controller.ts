import { Response } from 'express'
import { AuthRequest } from '../middleware/auth.middleware.js'
import { guidesService, createGuideSchema, updateGuideSchema } from '../services/guides.service.js'

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
        imageUrls: JSON.parse(guide.imageUrls),
        videoUrls: JSON.parse(guide.videoUrls),
      }))

      res.json(formattedGuides)
    } catch (error) {
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
        imageUrls: JSON.parse(guide.imageUrls),
        videoUrls: JSON.parse(guide.videoUrls),
      }

      res.json(formattedGuide)
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener la guía' })
    }
  },

  async create(req: AuthRequest, res: Response) {
    try {
      const validated = await createGuideSchema.parseAsync(req.body)

      const guide = await guidesService.createGuide(validated, req.userId!)

      // Parse JSON strings back to arrays
      const formattedGuide = {
        ...guide,
        imageUrls: JSON.parse(guide.imageUrls),
        videoUrls: JSON.parse(guide.videoUrls),
      }

      res.status(201).json(formattedGuide)
    } catch (error: any) {
      if (error.errors) {
        return res.status(400).json({ error: 'Validación fallida', details: error.errors })
      }
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
        imageUrls: JSON.parse(guide.imageUrls),
        videoUrls: JSON.parse(guide.videoUrls),
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
}

import { Request, Response, NextFunction } from 'express'
import { ZodSchema } from 'zod'

export const validateRequest = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = await schema.parseAsync(req.body)
      req.body = validated
      next()
    } catch (error: any) {
      res.status(400).json({
        error: 'Validación fallida',
        details: error.errors || error.message,
      })
    }
  }
}

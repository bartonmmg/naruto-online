import { Request, Response } from 'express'
import { authService, registerSchema, loginSchema } from '../services/auth.service'

export const authController = {
  async register(req: Request, res: Response) {
    try {
      const data = await registerSchema.parseAsync(req.body)
      const result = await authService.register(data)
      res.status(201).json(result)
    } catch (error: any) {
      res.status(400).json({ error: error.message })
    }
  },

  async login(req: Request, res: Response) {
    try {
      const data = await loginSchema.parseAsync(req.body)
      const result = await authService.login(data)
      res.json(result)
    } catch (error: any) {
      res.status(401).json({ error: error.message })
    }
  },
}

import { Request, Response } from 'express'
import { authService, registerSchema, loginSchema } from '../services/auth.service.js'

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
      console.log('Login attempt for:', data.email)
      const result = await authService.login(data)
      console.log('Login successful for:', data.email)
      res.json(result)
    } catch (error: any) {
      console.error('Login error:', error.message)
      res.status(401).json({ error: error.message })
    }
  },
}

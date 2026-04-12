import { Response, NextFunction } from 'express'
import { AuthRequest } from './auth.middleware.js'

export const authorize = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.role || !allowedRoles.includes(req.role)) {
      return res.status(403).json({ error: 'Sin permiso para esta acción' })
    }
    next()
  }
}

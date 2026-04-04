import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthRequest extends Request {
  userId?: string
  username?: string
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as { userId: string; username: string }
    req.userId = decoded.userId
    req.username = decoded.username
    next()
  } catch (error) {
    res.status(401).json({ error: 'Token inválido o expirado' })
  }
}

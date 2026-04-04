import bcrypt from 'bcrypt'
import jwt, { type SignOptions } from 'jsonwebtoken'
import { prisma } from '../lib/prisma'
import { z } from 'zod'

export const registerSchema = z.object({
  username: z.string().min(3).max(20),
  email: z.string().email(),
  password: z.string().min(8),
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

type RegisterInput = z.infer<typeof registerSchema>
type LoginInput = z.infer<typeof loginSchema>

const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '7d'

export const authService = {
  async register(data: RegisterInput) {
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email: data.email }, { username: data.username }] },
    })

    if (existingUser) {
      throw new Error(existingUser.email === data.email ? 'Email ya registrado' : 'Username ya existe')
    }

    const passwordHash = await bcrypt.hash(data.password, 12)
    const user = await prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        passwordHash,
      },
    })

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET as string,
      { expiresIn: JWT_EXPIRATION } as SignOptions
    )

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        level: user.level,
        xp: user.xp,
      },
    }
  },

  async login(data: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (!user) {
      throw new Error('Email o contraseña incorrectos')
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash)
    if (!isPasswordValid) {
      throw new Error('Email o contraseña incorrectos')
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET as string,
      { expiresIn: JWT_EXPIRATION } as SignOptions
    )

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        level: user.level,
        xp: user.xp,
      },
    }
  },
}

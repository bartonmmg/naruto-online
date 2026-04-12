export type Role = 'USER' | 'MODERATOR' | 'ADMIN'

export interface AuthUser {
  id: string
  username: string
  email: string
  level: number
  xp: number
  role: Role
}

export interface Guide {
  id: string
  title: string
  category: string
  difficulty: string
  content: string
  imageUrls: string[]
  videoUrls: string[]
  status: 'DRAFT' | 'PUBLISHED'
  authorId: string
  author: {
    username: string
  }
  createdAt: string
  updatedAt: string
}

export const CATEGORY_LABELS: Record<string, string> = {
  BUILDS: 'Builds',
  MISIONES: 'Misiones',
  PVP: 'PvP',
  CLANES: 'Clanes',
  EVENTOS: 'Eventos',
  GENERAL: 'General',
}

export const DIFFICULTY_LABELS: Record<string, string> = {
  BASICO: 'Básico',
  INTERMEDIO: 'Intermedio',
  AVANZADO: 'Avanzado',
}

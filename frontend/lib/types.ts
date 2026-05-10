export type Role = 'USER' | 'MODERATOR' | 'ADMIN'

export interface SocialLinks {
  twitch?: string
  youtube?: string
  discord?: string
  ingameName?: string
}

export interface AuthUser {
  id: string
  username: string
  email: string
  level: number
  xp: number
  role: Role
  // Optional profile fields (may be null/undefined)
  avatarSlug?: string | null
  bannerSlug?: string | null
  frameSlug?: string | null
  bio?: string | null
  customTitle?: string | null
  nameColor?: string | null
  pinnedAchievements?: string | null  // JSON string
  gameServer?: string | null
  socialLinks?: string | null         // JSON string
}

export interface UserProfile extends AuthUser {
  createdAt: string
}

// Helpers — defensive parses
export function parseSocialLinks(raw?: string | null): SocialLinks {
  if (!raw) return {}
  try { return JSON.parse(raw) } catch { return {} }
}

export function parsePinnedAchievements(raw?: string | null): string[] {
  if (!raw) return []
  try {
    const v = JSON.parse(raw)
    return Array.isArray(v) ? v : []
  } catch { return [] }
}

// Asset path helpers
export function avatarSrc(slug?: string | null): string {
  return slug ? `/images/avatars/${slug}.png` : '/images/avatars/default.png'
}
export function bannerSrc(slug?: string | null): string | null {
  return slug ? `/images/profile/banners/${slug}.png` : null
}
export function frameSrc(slug?: string | null): string | null {
  return slug ? `/images/profile/frames/${slug}.png` : null
}

export interface Guide {
  id: string
  title: string
  category: string
  difficulty: string
  content: string
  imageUrls: string[]
  videoUrls: string[]
  coverImage?: string | null
  status: 'DRAFT' | 'PUBLISHED'
  authorId: string
  author: {
    username: string
  }
  viewCount?: number
  badges?: string[]
  _count?: {
    ratings?: number
    comments?: number
  }
  createdAt: string
  updatedAt: string
}

export interface GuideRating {
  upvotes: number
  downvotes: number
  userVote: 1 | -1 | null
}

export interface GuideComment {
  id: string
  content: string
  authorId: string
  author: {
    username: string
    id: string
  }
  createdAt: string
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

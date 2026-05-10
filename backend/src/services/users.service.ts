import { prisma } from '../lib/prisma.js'
import { z } from 'zod'
import {
  isValidAvatar,
  isValidBanner,
  isValidColor,
  isFrameUnlocked,
} from '../lib/profile-catalog.js'

export const updateProfileSchema = z.object({
  avatarSlug:         z.string().min(1).max(40).nullable().optional(),
  bannerSlug:         z.string().min(1).max(40).nullable().optional(),
  frameSlug:          z.string().min(1).max(40).nullable().optional(),
  bio:                z.string().max(160).nullable().optional(),
  customTitle:        z.string().max(50).nullable().optional(),
  nameColor:          z.string().regex(/^#[0-9A-Fa-f]{6}$/).nullable().optional(),
  pinnedAchievements: z.array(z.string()).max(3).optional(),
  gameServer:         z.string().max(50).nullable().optional(),
  socialLinks: z.object({
    twitch:     z.string().max(100).optional(),
    youtube:    z.string().max(100).optional(),
    discord:    z.string().max(40).optional(),
    ingameName: z.string().max(50).optional(),
  }).nullable().optional(),
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>

const SELECT_PROFILE = {
  id: true, username: true, email: true, level: true, xp: true, role: true,
  avatarUrl: true, avatarSlug: true, bannerSlug: true, frameSlug: true,
  bio: true, customTitle: true, nameColor: true, pinnedAchievements: true,
  gameServer: true, socialLinks: true, createdAt: true,
} as const

export const usersService = {
  async getProfile(userId: string) {
    return prisma.user.findUnique({ where: { id: userId }, select: SELECT_PROFILE })
  },

  async updateProfile(userId: string, data: UpdateProfileInput) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, level: true } })
    if (!user) throw new Error('Usuario no encontrado')

    const update: Record<string, any> = {}

    if (data.avatarSlug !== undefined) {
      if (data.avatarSlug !== null && !isValidAvatar(data.avatarSlug)) throw new Error('Avatar inválido')
      update.avatarSlug = data.avatarSlug
    }
    if (data.bannerSlug !== undefined) {
      if (data.bannerSlug !== null && !isValidBanner(data.bannerSlug)) throw new Error('Banner inválido')
      update.bannerSlug = data.bannerSlug
    }
    if (data.frameSlug !== undefined) {
      if (data.frameSlug !== null && !isFrameUnlocked(data.frameSlug, user.level)) {
        throw new Error('Aún no desbloqueaste este marco')
      }
      update.frameSlug = data.frameSlug
    }
    if (data.nameColor !== undefined) {
      if (data.nameColor !== null && !isValidColor(data.nameColor)) throw new Error('Color no permitido')
      update.nameColor = data.nameColor
    }
    if (data.bio !== undefined)         update.bio = data.bio
    if (data.customTitle !== undefined) update.customTitle = data.customTitle
    if (data.gameServer !== undefined)  update.gameServer = data.gameServer

    if (data.pinnedAchievements !== undefined) {
      // Validate all IDs belong to this user
      const userAchievements = await prisma.userAchievement.findMany({
        where: { userId, achievementId: { in: data.pinnedAchievements } },
        select: { achievementId: true },
      })
      const owned = new Set(userAchievements.map(a => a.achievementId))
      const valid = data.pinnedAchievements.filter(id => owned.has(id))
      update.pinnedAchievements = JSON.stringify(valid.slice(0, 3))
    }

    if (data.socialLinks !== undefined) {
      update.socialLinks = data.socialLinks === null ? null : JSON.stringify(data.socialLinks)
    }

    return prisma.user.update({ where: { id: userId }, data: update, select: SELECT_PROFILE })
  },
}

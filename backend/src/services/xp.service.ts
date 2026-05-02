import { prisma } from '../lib/prisma.js'

// Default XP config — seeded on first run
export const DEFAULT_XP_CONFIG = [
  { action: 'GUIDE_PUBLISHED', label: 'Publicar una guía',  xpAmount: 50 },
  { action: 'COMMENT_POSTED',  label: 'Comentar una guía', xpAmount: 5 },
  { action: 'VOTE_RECEIVED',   label: 'Recibir voto útil', xpAmount: 10 },
  { action: 'BADGE_RECEIVED',  label: 'Recibir un badge',  xpAmount: 25 },
  { action: 'DAILY_LOGIN',     label: 'Login diario',       xpAmount: 10 },
]

export const DEFAULT_LEVELS = [
  { level: 1,  xpRequired: 0,    label: 'Genin' },
  { level: 2,  xpRequired: 100,  label: 'Genin' },
  { level: 3,  xpRequired: 250,  label: 'Genin' },
  { level: 4,  xpRequired: 500,  label: 'Chūnin' },
  { level: 5,  xpRequired: 900,  label: 'Chūnin' },
  { level: 6,  xpRequired: 1400, label: 'Chūnin' },
  { level: 7,  xpRequired: 2000, label: 'Jōnin' },
  { level: 8,  xpRequired: 3000, label: 'Jōnin' },
  { level: 9,  xpRequired: 4500, label: 'Jōnin' },
  { level: 10, xpRequired: 6500, label: 'Kage' },
]

// Achievement definitions — seeded on first run
export const ACHIEVEMENT_DEFS = [
  {
    key: 'FIRST_GUIDE',
    title: 'Primera Misión',
    description: 'Publicá tu primera guía en la comunidad',
    imageFile: 'logro-primera-guia.png',
    xpReward: 30,
  },
  {
    key: 'FIVE_GUIDES',
    title: 'Sensei',
    description: 'Publicá 5 guías en la comunidad',
    imageFile: 'logro-5-guias.png',
    xpReward: 75,
  },
  {
    key: 'TEN_GUIDES',
    title: 'Crónicas Ninja',
    description: 'Publicá 10 guías en la comunidad',
    imageFile: 'logro-10-guias.png',
    xpReward: 150,
  },
  {
    key: 'VIEWS_100',
    title: '100 Vistas',
    description: 'Una de tus guías alcanzó las 100 vistas',
    imageFile: 'logro-100-vistas.png',
    xpReward: 50,
  },
  {
    key: 'VIEWS_1000',
    title: '1000 Vistas',
    description: 'Una de tus guías alcanzó las 1000 vistas',
    imageFile: 'logro-1000-vistas.png',
    xpReward: 150,
  },
  {
    key: 'VOTES_100',
    title: 'Maestro del Conocimiento',
    description: 'Una de tus guías recibió 100 votos útil',
    imageFile: 'logro-votos.png',
    xpReward: 100,
  },
  {
    key: 'BADGE_OFFICIAL',
    title: 'Sello del Hokage',
    description: 'Una de tus guías recibió el badge Oficial',
    imageFile: 'logro-badge-oficial.png',
    xpReward: 60,
  },
  {
    key: 'LEGEND',
    title: 'Leyenda',
    description: 'Estás en el top 3 del leaderboard de autores',
    imageFile: 'logro-leyenda.png',
    xpReward: 0, // XP is awarded dynamically while in top 3, revoked when leaving
  },
]

export const xpService = {
  // Seed defaults if tables are empty
  async seedDefaults() {
    const xpCount = await prisma.xpConfig.count()
    if (xpCount === 0) {
      await prisma.xpConfig.createMany({ data: DEFAULT_XP_CONFIG })
    }
    const levelCount = await prisma.levelConfig.count()
    if (levelCount === 0) {
      await prisma.levelConfig.createMany({ data: DEFAULT_LEVELS })
    }
    const achCount = await prisma.achievement.count()
    if (achCount === 0) {
      await prisma.achievement.createMany({ data: ACHIEVEMENT_DEFS })
    }
  },

  async getXpConfig() {
    return prisma.xpConfig.findMany({ orderBy: { action: 'asc' } })
  },

  async getLevelConfig() {
    return prisma.levelConfig.findMany({ orderBy: { level: 'asc' } })
  },

  async updateXpConfig(action: string, xpAmount: number) {
    return prisma.xpConfig.update({ where: { action }, data: { xpAmount } })
  },

  async updateLevelConfig(level: number, xpRequired: number, label: string) {
    return prisma.levelConfig.update({ where: { level }, data: { xpRequired, label } })
  },

  // Award XP to user and recalculate level
  async awardXp(userId: string, action: string) {
    const config = await prisma.xpConfig.findUnique({ where: { action } })
    if (!config) return

    const user = await prisma.user.update({
      where: { id: userId },
      data: { xp: { increment: config.xpAmount } },
      select: { xp: true },
    })

    // Find new level based on total XP
    const levels = await prisma.levelConfig.findMany({ orderBy: { xpRequired: 'desc' } })
    const newLevel = levels.find(l => user.xp >= l.xpRequired)
    if (newLevel) {
      await prisma.user.update({ where: { id: userId }, data: { level: newLevel.level } })
    }

    await prisma.xpLog.create({ data: { userId, action, amount: config.xpAmount } })
  },

  // Check and award achievements to a user
  // Anti-abuse: guide counts use all guides (no DRAFT state anymore, all publish directly)
  // VOTES/VIEWS use all guides. BADGE_OFFICIAL requires the OFFICIAL badge assigned by admin.
  // LEGEND requires top 3 in leaderboard — cannot be self-gamed.
  async checkAchievements(userId: string) {
    const achievements = await prisma.achievement.findMany()
    const earned = await prisma.userAchievement.findMany({
      where: { userId },
      select: { achievementId: true },
    })
    const earnedIds = new Set(earned.map(e => e.achievementId))

    // All guides by this user
    const allGuides = await prisma.guide.findMany({
      where: { authorId: userId },
      select: { id: true, viewCount: true, badges: true },
    })

    // VIEWS: per single guide (not total) — must have one guide with X views
    const maxViewsOnOneGuide = allGuides.reduce((max, g) => Math.max(max, g.viewCount || 0), 0)

    // VOTES: per single guide — must have one guide with 100 upvotes
    const upvotesByGuide = await prisma.guideRating.groupBy({
      by: ['guideId'],
      where: { value: 1, guide: { authorId: userId } },
      _count: { guideId: true },
    })
    const maxVotesOnOneGuide = upvotesByGuide.reduce((max, r) => Math.max(max, r._count.guideId), 0)

    // BADGE_OFFICIAL: only admin/mod can assign — cannot be self-gamed
    const hasOfficialBadge = allGuides.some(g => {
      try { return (JSON.parse(g.badges || '[]') as string[]).includes('OFFICIAL') }
      catch { return false }
    })

    // LEGEND: top 3 of leaderboard by total views — dynamic badge (gained and lost)
    const allAuthors = await prisma.user.findMany({
      where: { guides: { some: {} } },
      select: { id: true, guides: { select: { viewCount: true } } },
    })
    const scoredAuthors = allAuthors
      .map(a => ({ id: a.id, totalViews: a.guides.reduce((s, g) => s + (g.viewCount || 0), 0) }))
      .sort((a, b) => b.totalViews - a.totalViews)
    const isTop3 = scoredAuthors.slice(0, 3).some(a => a.id === userId)

    const conditions: Record<string, boolean> = {
      FIRST_GUIDE:    allGuides.length >= 1,
      FIVE_GUIDES:    allGuides.length >= 5,
      TEN_GUIDES:     allGuides.length >= 10,
      VIEWS_100:      maxViewsOnOneGuide >= 100,
      VIEWS_1000:     maxViewsOnOneGuide >= 1000,
      VOTES_100:      maxVotesOnOneGuide >= 100,
      BADGE_OFFICIAL: hasOfficialBadge,
      LEGEND:         isTop3,
    }

    // --- LEGEND dynamic logic ---
    // If user IS top 3: grant achievement + XP bonus per check
    // If user is NOT top 3: revoke achievement + remove bonus XP
    const legendAchievement = achievements.find(a => a.key === 'LEGEND')
    if (legendAchievement) {
      const hasLegend = earnedIds.has(legendAchievement.id)
      const LEGEND_XP_BONUS = 50 // XP bonus awarded per check while in top 3

      if (isTop3 && !hasLegend) {
        // Newly entered top 3 — grant achievement
        try {
          await prisma.userAchievement.create({ data: { userId, achievementId: legendAchievement.id } })
          await prisma.user.update({ where: { id: userId }, data: { xp: { increment: LEGEND_XP_BONUS } } })
          await prisma.xpLog.create({ data: { userId, action: 'ACHIEVEMENT_LEGEND_GAINED', amount: LEGEND_XP_BONUS } })
          const existingNotif = await prisma.notification.findFirst({
            where: { userId, type: 'ACHIEVEMENT', message: '¡Sos Leyenda! Estás en el top 3 de autores', read: false },
          })
          if (!existingNotif) {
            await prisma.notification.create({
              data: { userId, type: 'ACHIEVEMENT', message: '¡Sos Leyenda! Estás en el top 3 de autores' },
            })
          }
        } catch { /* already exists */ }
      } else if (!isTop3 && hasLegend) {
        // Left top 3 — revoke achievement and remove XP
        await prisma.userAchievement.deleteMany({ where: { userId, achievementId: legendAchievement.id } })
        const user = await prisma.user.findUnique({ where: { id: userId }, select: { xp: true } })
        if (user) {
          const newXp = Math.max(0, user.xp - LEGEND_XP_BONUS)
          await prisma.user.update({ where: { id: userId }, data: { xp: newXp } })
          await prisma.xpLog.create({ data: { userId, action: 'ACHIEVEMENT_LEGEND_LOST', amount: -LEGEND_XP_BONUS } })
        }
        await prisma.notification.create({
          data: { userId, type: 'ACHIEVEMENT', message: 'Ya no estás en el top 3 — perdiste el logro Leyenda' },
        })
      }
      // Remove LEGEND from the regular loop below
      earnedIds.add(legendAchievement.id)
    }

    const newlyEarned: string[] = []
    for (const achievement of achievements) {
      if (earnedIds.has(achievement.id)) continue
      if (!conditions[achievement.key]) continue

      // Use upsert to handle race conditions — if already exists, skip silently
      try {
        await prisma.userAchievement.create({
          data: { userId, achievementId: achievement.id },
        })
      } catch {
        // @@unique constraint failed — already earned in a parallel call, skip everything
        continue
      }

      if (achievement.xpReward > 0) {
        await prisma.user.update({
          where: { id: userId },
          data: { xp: { increment: achievement.xpReward } },
        })
        await prisma.xpLog.create({
          data: { userId, action: `ACHIEVEMENT_${achievement.key}`, amount: achievement.xpReward },
        })
      }

      // Only notify if no existing unread ACHIEVEMENT notification with same message
      const existingNotif = await prisma.notification.findFirst({
        where: {
          userId,
          type: 'ACHIEVEMENT',
          message: `¡Nuevo logro desbloqueado: ${achievement.title}!`,
          read: false,
        },
      })
      if (!existingNotif) {
        await prisma.notification.create({
          data: {
            userId,
            type: 'ACHIEVEMENT',
            message: `¡Nuevo logro desbloqueado: ${achievement.title}!`,
          },
        })
      }

      newlyEarned.push(achievement.key)
    }

    return newlyEarned
  },

  async getUserAchievements(userId: string) {
    return prisma.userAchievement.findMany({
      where: { userId },
      include: { achievement: true },
      orderBy: { earnedAt: 'desc' },
    })
  },

  async getAllAchievements() {
    return prisma.achievement.findMany({ orderBy: { key: 'asc' } })
  },
}

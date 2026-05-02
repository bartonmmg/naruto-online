import { prisma } from '../lib/prisma.js'

// Default XP config — seeded on first run
export const DEFAULT_XP_CONFIG = [
  { action: 'GUIDE_PUBLISHED', label: 'Publicar una guía', xpAmount: 50 },
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
    description: 'Publicá tu primera guía aprobada por un admin',
    imageFile: 'logro-primera-guia.png',
    xpReward: 30,
  },
  {
    key: 'FIVE_GUIDES',
    title: 'Sensei',
    description: 'Publicá 5 guías aprobadas',
    imageFile: 'logro-5-guias.png',
    xpReward: 75,
  },
  {
    key: 'TEN_GUIDES',
    title: 'Crónicas Ninja',
    description: 'Publicá 10 guías aprobadas',
    imageFile: 'logro-10-guias.png',
    xpReward: 150,
  },
  {
    key: 'VIEWS_100',
    title: '100 Vistas',
    description: 'Tus guías superaron las 100 vistas en total',
    imageFile: 'logro-100-vistas.png',
    xpReward: 50,
  },
  {
    key: 'VIEWS_1000',
    title: '1000 Vistas',
    description: 'Tus guías superaron las 1000 vistas en total',
    imageFile: 'logro-1000-vistas.png',
    xpReward: 150,
  },
  {
    key: 'VOTES_100',
    title: 'Maestro del Conocimiento',
    description: 'Recibí 100 votos útil en tus guías',
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
    description: 'Alcanzá el top 3 del leaderboard de autores',
    imageFile: 'logro-leyenda.png',
    xpReward: 200,
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

  // Check and award achievements to a user — anti-abuse: only PUBLISHED guides count
  async checkAchievements(userId: string) {
    const achievements = await prisma.achievement.findMany()
    const earned = await prisma.userAchievement.findMany({
      where: { userId },
      select: { achievementId: true },
    })
    const earnedIds = new Set(earned.map(e => e.achievementId))

    // Pre-fetch data once
    const publishedGuides = await prisma.guide.findMany({
      where: { authorId: userId, status: 'PUBLISHED' },
      select: { id: true, viewCount: true, badges: true },
    })

    const totalViews = publishedGuides.reduce((sum, g) => sum + (g.viewCount || 0), 0)

    const upvotes = await prisma.guideRating.count({
      where: { value: 1, guide: { authorId: userId, status: 'PUBLISHED' } },
    })

    const hasOfficialBadge = publishedGuides.some(g => {
      try { return (JSON.parse(g.badges || '[]') as string[]).includes('OFFICIAL') }
      catch { return false }
    })

    // Check leaderboard top 3
    const allAuthors = await prisma.user.findMany({
      where: { guides: { some: { status: 'PUBLISHED' } } },
      select: { id: true, guides: { where: { status: 'PUBLISHED' }, select: { viewCount: true } } },
    })
    const scoredAuthors = allAuthors
      .map(a => ({ id: a.id, totalViews: a.guides.reduce((s, g) => s + (g.viewCount || 0), 0) }))
      .sort((a, b) => b.totalViews - a.totalViews)
    const isTop3 = scoredAuthors.slice(0, 3).some(a => a.id === userId)

    const conditions: Record<string, boolean> = {
      FIRST_GUIDE:   publishedGuides.length >= 1,
      FIVE_GUIDES:   publishedGuides.length >= 5,
      TEN_GUIDES:    publishedGuides.length >= 10,
      VIEWS_100:     totalViews >= 100,
      VIEWS_1000:    totalViews >= 1000,
      VOTES_100:     upvotes >= 100,
      BADGE_OFFICIAL: hasOfficialBadge,
      LEGEND:        isTop3,
    }

    const newlyEarned: string[] = []
    for (const achievement of achievements) {
      if (earnedIds.has(achievement.id)) continue
      if (!conditions[achievement.key]) continue

      await prisma.userAchievement.create({
        data: { userId, achievementId: achievement.id },
      })

      // Award XP for achievement
      if (achievement.xpReward > 0) {
        await prisma.user.update({
          where: { id: userId },
          data: { xp: { increment: achievement.xpReward } },
        })
        await prisma.xpLog.create({
          data: { userId, action: `ACHIEVEMENT_${achievement.key}`, amount: achievement.xpReward },
        })
      }

      // Send notification
      await prisma.notification.create({
        data: {
          userId,
          type: 'ACHIEVEMENT',
          message: `¡Nuevo logro desbloqueado: ${achievement.title}!`,
        },
      })

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

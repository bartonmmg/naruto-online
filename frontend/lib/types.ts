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
  return slug ? `/images/profile/banners/${slug}.jpg` : null
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

// ─────────────────────────────────────────────────────────────────────────────
// Game data: catálogo de ninjas (backend devuelve los JSON ya parseados)
// ─────────────────────────────────────────────────────────────────────────────

export interface Coded {
  code: number
  label: string
}

export interface NinjaStats {
  baseLife: number
  growthLife: number
  baseBodyAttack: number
  growthBodyAttack: number
  baseBodyDefense: number
  growthBodyDefense: number
  baseNinjaAttack: number
  growthNinjaAttack: number
  baseNinjaDefense: number
  growthNinjaDefense: number
  baseSpeed: number
  baseCrit: number
  baseBodyStrike: number
  baseNinjaStrike: number
  continuousStrikeRate: number
}

export interface NinjaResists {
  fire: number
  wind: number
  thunder: number
  soil: number
  water: number
}

export interface NinjaIntro {
  desc: string[]
  words: string
  types?: string[]
}

export interface GameSkill {
  id: number
  name: string
  chakra: number
  cooldown: number
  description: string
  iconPath: string
}

export interface GameNinjaSummary {
  id: number
  slug: string
  artisticId: number
  kind: 'NINJA' | 'MAIN'
  name: string
  title: string
  property: Coded
  career: Coded
  ninjaTypes: string[]
  rareness: Coded
  starLevel: number
  stats: { baseLife: number; baseBodyAttack: number; baseNinjaAttack: number }
  assets: { portrait: string }
}

export interface MainTalentSlot {
  slot: number
  level: number
  skills: GameSkill[]
}
export interface MainTalents {
  esoterica: MainTalentSlot[]
  ataque: MainTalentSlot[]
  pasiva: MainTalentSlot[]
}

export interface StarVariant {
  star: number
  id: number
  title: string
  artisticId: number
  stats: NinjaStats
  resists: NinjaResists
  // Skills + upgrades específicas de esta estrella (cambian al subir ★ en algunas cartas)
  skills?: { normals: GameSkill[]; specials: GameSkill[]; passives: GameSkill[] }
  skillUpgrades?: Record<string, SkillUpgrade[]>
}

export interface SkillUpgrade {
  tierCode: number      // 1=+1, 2=+2, 3=Y, 4=Y+1, 5=Y+2, 6=L, 7=L+1, 8=L+2
  tierLabel: string     // etiqueta visible del juego
  skill: GameSkill
}

export interface GameNinjaDetail {
  id: number
  artisticId: number
  region: string
  kind: 'NINJA' | 'MAIN'
  mainTalents?: MainTalents | null
  name: string
  title: string
  property: Coded
  career: Coded
  ninjaTypes: string[]
  rareness: Coded
  sex: Coded
  starLevel: number
  awakenSkillNum: number
  equipNum: number
  stats: NinjaStats
  resists: NinjaResists
  intro: NinjaIntro | null
  starVariants?: StarVariant[]
  /** baseSkillId → variantes upgradeadas (avance/enlace). Cada una con su label in-game (+1, +2, Y, Y+1, Y+2, L, L+1, L+2). */
  skillUpgrades?: Record<string, SkillUpgrade[]>
  skillRefs: { normalIds: number[]; specialIds: number[]; skillIds: number[] }
  assets: { bigImage: string; halfImage: string; portrait: string }
  skills: { normals: GameSkill[]; specials: GameSkill[]; passives: GameSkill[] }
}

export interface NinjaListResponse {
  items: GameNinjaSummary[]
  pagination: { total: number; offset: number; limit: number; hasMore: boolean }
}

export interface NinjaFilterFacet {
  code: number
  label: string
  count: number
}

export interface NinjaFiltersResponse {
  property: NinjaFilterFacet[]
  career: NinjaFilterFacet[]
  rareness: NinjaFilterFacet[]
  ninjaTypes: { label: string; count: number }[]
  total: number
}

/**
 * Resuelve URLs de imagen para un ninja (descargadas a /public por
 * `scripts/download-ninja-images.mjs`).
 *
 * `ninjaPortraitSrc`: usado en el listado. Apunta a la imagen GRANDE para que
 * no se vea pixelada (las H120 son 120×120 y al escalar quedan feas).
 * El componente debe tener fallback al thumbnail H120 y luego al placeholder.
 *
 * `ninjaBigImageSrc`: usado en el hero del detalle.
 *
 * `ninjaThumbnailSrc`: H120 (120×120) como ultimo fallback antes del placeholder.
 */
export function ninjaPortraitSrc(artisticId: number): string {
  return `/images/game/ninjas/big/${artisticId}.webp`
}
export function ninjaBigImageSrc(artisticId: number): string {
  return `/images/game/ninjas/big/${artisticId}.webp`
}
export function ninjaThumbnailSrc(artisticId: number): string {
  return `/images/game/ninjas/${artisticId}.webp`
}

// ─── Espíritus Animales (Summon Beasts) ─────────────────────────────────────

export interface GameSpiritStats {
  baseLife: number
  baseAttack: number
  baseDefense: number
  baseNinjaAttack: number
  baseResist: number
}

export interface GameSpirit {
  id: number
  slug: string
  artisticId: number
  cardId: number
  name: string
  type: number
  stats: GameSpiritStats
  skillName: string
  description: string
  majorSkillIds: number[]
  openLevel: number
  cardCost: number
  triggerKeywords: string[]
  applyKeywords: string[]
}

export interface GameSpiritDetail extends GameSpirit {
  kathaSkillRefs: { lv1: number[]; lv2: number[]; lv3: number[] }
  katha: { lv1: GameSkill[]; lv2: GameSkill[]; lv3: GameSkill[] }
}

export interface SpiritListResponse {
  items: GameSpirit[]
  total: number
}

export interface SpiritFiltersResponse {
  type: { code: number; label: string; count: number }[]
  trigger: { label: string; count: number }[]
  apply: { label: string; count: number }[]
  total: number
}

/** Thumbnail (bag/item) — cargada primero, fallback rápido */
export function spiritImageSrc(spiritId: number): string {
  return `/images/game/spirits/${spiritId}.webp`
}
/** Imagen grande del CDN throughTheBeast/developview */
export function spiritBigImageSrc(spiritId: number): string {
  return `/images/game/spirits/big/${spiritId}.webp`
}

/**
 * Combatividad estimada al nivel 100 (formula simplificada).
 * El poder real en el juego depende de equipo + breakthrough + assists, pero
 * esto da un valor base comparable entre cartas.
 */
export function ninjaCombatividad(s: NinjaStats): number {
  const lvl = 100
  const total = (b: number, g: number) => b + (g * lvl) / 1000
  return Math.round(
    total(s.baseLife, s.growthLife) * 1.2 +
    total(s.baseBodyAttack, s.growthBodyAttack) * 4 +
    total(s.baseNinjaAttack, s.growthNinjaAttack) * 4 +
    total(s.baseBodyDefense, s.growthBodyDefense) * 3 +
    total(s.baseNinjaDefense, s.growthNinjaDefense) * 3
  )
}

/** Kanji del elemento — usado como motif decorativo en cards y heroes */
export const PROPERTY_KANJI: Record<number, string> = {
  0: '無', // ninguno
  1: '水', // agua (Suiton)
  2: '火', // fuego (Katon)
  3: '風', // viento (Fuuton)
  4: '雷', // rayo (Raiton)
  5: '土', // tierra (Doton)
}

/** Glow del elemento — usado para hover/destacar */
export const PROPERTY_GLOW: Record<number, string> = {
  0: 'shadow-zinc-500/30',
  1: 'shadow-sky-500/40',     // Agua
  2: 'shadow-red-500/40',     // Fuego
  3: 'shadow-green-500/40',   // Viento
  4: 'shadow-yellow-500/40',  // Rayo
  5: 'shadow-amber-700/40',   // Tierra
}

/** Tailwind helpers para badges de elemento */
export const PROPERTY_COLORS: Record<number, { bg: string; text: string; border: string }> = {
  0: { bg: 'bg-zinc-800',      text: 'text-zinc-300',   border: 'border-zinc-600' },
  1: { bg: 'bg-sky-900/40',    text: 'text-sky-300',    border: 'border-sky-600' },    // Agua
  2: { bg: 'bg-red-900/40',    text: 'text-red-300',    border: 'border-red-600' },    // Fuego
  3: { bg: 'bg-green-900/40',  text: 'text-green-300',  border: 'border-green-600' },  // Viento
  4: { bg: 'bg-yellow-900/40', text: 'text-yellow-200', border: 'border-yellow-500' }, // Rayo
  5: { bg: 'bg-amber-900/40',  text: 'text-amber-300',  border: 'border-amber-700' },  // Tierra
}

export const RARENESS_COLORS: Record<number, { bg: string; text: string; border: string; label: string }> = {
  0: { bg: 'bg-zinc-800',   text: 'text-zinc-300',  border: 'border-zinc-600', label: 'Común' },
  1: { bg: 'bg-emerald-900/40', text: 'text-emerald-300', border: 'border-emerald-600', label: 'Inusual' },
  2: { bg: 'bg-blue-900/40',    text: 'text-blue-300',    border: 'border-blue-600',    label: 'Raro' },
  3: { bg: 'bg-purple-900/40',  text: 'text-purple-300',  border: 'border-purple-600',  label: 'Épico' },
  4: { bg: 'bg-amber-900/40',   text: 'text-amber-300',   border: 'border-amber-600',   label: 'Legendario' },
  5: { bg: 'bg-rose-900/40',    text: 'text-rose-300',    border: 'border-rose-600',    label: 'Mítico' },
}


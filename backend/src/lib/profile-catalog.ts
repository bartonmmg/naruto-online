// Static catalog of valid profile customization options.
// Adding a new asset = drop the file in /public/images/... AND add the slug here.

export const AVATARS = [
  // Suggested set — extend as you add files to /public/images/avatars/
  'naruto', 'sasuke', 'sakura', 'kakashi', 'itachi',
  'madara', 'hashirama', 'tobirama', 'minato', 'jiraiya',
  'tsunade', 'orochimaru', 'pain', 'konan', 'obito',
  'gaara', 'rock-lee', 'neji', 'hinata', 'shikamaru',
  'choji', 'ino', 'kiba', 'shino', 'tenten',
  'kurenai', 'asuma', 'guy', 'kushina', 'default',
] as const

export const BANNERS = [
  'akatsuki-clouds',
  'konoha-wall',
  'chakra-blue',
  'chakra-red',
  'chakra-orange',
  'battle-arena',
  'sand-village',
  'mist-village',
  'rain-village',
  'rock-village',
] as const

export type FrameSlug = 'genin' | 'chunin' | 'jonin' | 'kage' | 'akatsuki'

export const FRAMES: { slug: FrameSlug; minLevel: number; label: string }[] = [
  { slug: 'genin',    minLevel: 1,  label: 'Genin' },
  { slug: 'chunin',   minLevel: 4,  label: 'Chūnin' },
  { slug: 'jonin',    minLevel: 7,  label: 'Jōnin' },
  { slug: 'kage',     minLevel: 10, label: 'Kage' },
  { slug: 'akatsuki', minLevel: 11, label: 'Akatsuki' },
]

export const NAME_COLORS = [
  '#FFFFFF', // default white
  '#FF6B00', // accent orange
  '#3B82F6', // chakra blue
  '#10B981', // emerald
  '#EF4444', // red
  '#A855F7', // violet
  '#F59E0B', // gold
  '#EC4899', // pink
] as const

export function isValidAvatar(slug: string)  { return (AVATARS as readonly string[]).includes(slug) }
export function isValidBanner(slug: string)  { return (BANNERS as readonly string[]).includes(slug) }
export function isValidColor(hex: string)    { return (NAME_COLORS as readonly string[]).includes(hex) }
export function isFrameUnlocked(slug: string, userLevel: number) {
  const f = FRAMES.find(x => x.slug === slug)
  return !!f && userLevel >= f.minLevel
}

// Source of truth for which profile assets are actually available on disk.
// When you add a new avatar/banner image to /public/images/, ALSO add its slug here.
// Backend has its own catalog in `backend/src/lib/profile-catalog.ts` for validation.

export const AVAILABLE_AVATARS = [
  'naruto',
  'sasuke',
  'sakura',
  'kakashi',
  'hinata',
  'ino',
  'default',
] as const

export const AVAILABLE_BANNERS = [
  'akatsuki-clouds',
  'konoha-wall',
  'mist-village',
  'rain-village',
  'sand-village',
] as const

export const FRAMES = [
  { slug: 'genin',    minLevel: 1,  label: 'Genin' },
  { slug: 'chunin',   minLevel: 4,  label: 'Chūnin' },
  { slug: 'jonin',    minLevel: 7,  label: 'Jōnin' },
  { slug: 'kage',     minLevel: 10, label: 'Kage' },
  { slug: 'akatsuki', minLevel: 11, label: 'Akatsuki' },
] as const

export const NAME_COLORS = [
  '#FFFFFF', '#FF6B00', '#3B82F6', '#10B981',
  '#EF4444', '#A855F7', '#F59E0B', '#EC4899',
] as const

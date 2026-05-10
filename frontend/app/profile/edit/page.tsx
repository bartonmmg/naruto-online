'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Loader2, Save, Image as ImageIcon, Layout, Frame as FrameIcon, Check } from 'lucide-react'
import Navbar from '@/components/Navbar'
import AvatarFrame from '@/components/profile/AvatarFrame'
import AvatarPicker from '@/components/profile/AvatarPicker'
import BannerPicker from '@/components/profile/BannerPicker'
import FramePicker from '@/components/profile/FramePicker'
import ColorPicker from '@/components/profile/ColorPicker'
import PinnedAchievements from '@/components/profile/PinnedAchievements'
import ProfileBanner from '@/components/profile/ProfileBanner'
import { useAuth } from '@/lib/hooks/useAuth'
import { parsePinnedAchievements, parseSocialLinks } from '@/lib/types'
import api from '@/lib/api'

interface ProfileData {
  id: string
  username: string
  level: number
  avatarSlug?: string | null
  bannerSlug?: string | null
  frameSlug?: string | null
  bio?: string | null
  customTitle?: string | null
  nameColor?: string | null
  pinnedAchievements?: string | null
  gameServer?: string | null
  socialLinks?: string | null
  achievements?: any[]
}

export default function EditProfilePage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [savedFlag, setSavedFlag] = useState(false)

  const [avatarSlug, setAvatarSlug] = useState<string | null>(null)
  const [bannerSlug, setBannerSlug] = useState<string | null>(null)
  const [frameSlug,  setFrameSlug]  = useState<string | null>(null)
  const [bio, setBio] = useState('')
  const [customTitle, setCustomTitle] = useState('')
  const [nameColor, setNameColor] = useState<string | null>(null)
  const [pinned, setPinned] = useState<string[]>([])
  const [gameServer, setGameServer] = useState('')
  const [twitch, setTwitch] = useState('')
  const [youtube, setYoutube] = useState('')
  const [discord, setDiscord] = useState('')
  const [ingameName, setIngameName] = useState('')

  const [showAvatar, setShowAvatar] = useState(false)
  const [showBanner, setShowBanner] = useState(false)
  const [showFrame,  setShowFrame]  = useState(false)

  useEffect(() => {
    if (isLoading) return
    if (!user) { router.replace('/auth/login'); return }
    api.get('/leaderboard/me')
      .then(r => {
        const p = r.data
        setProfile(p)
        setAvatarSlug(p.avatarSlug ?? null)
        setBannerSlug(p.bannerSlug ?? null)
        setFrameSlug(p.frameSlug ?? null)
        setBio(p.bio ?? '')
        setCustomTitle(p.customTitle ?? '')
        setNameColor(p.nameColor ?? null)
        setPinned(parsePinnedAchievements(p.pinnedAchievements))
        setGameServer(p.gameServer ?? '')
        const links = parseSocialLinks(p.socialLinks)
        setTwitch(links.twitch ?? '')
        setYoutube(links.youtube ?? '')
        setDiscord(links.discord ?? '')
        setIngameName(links.ingameName ?? '')
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [user, isLoading])

  const save = async () => {
    setSaving(true)
    try {
      const socialLinks: Record<string, string> = {}
      if (twitch.trim())     socialLinks.twitch = twitch.trim()
      if (youtube.trim())    socialLinks.youtube = youtube.trim()
      if (discord.trim())    socialLinks.discord = discord.trim()
      if (ingameName.trim()) socialLinks.ingameName = ingameName.trim()

      const r = await api.patch('/users/me/profile', {
        avatarSlug,
        bannerSlug,
        frameSlug,
        bio: bio.trim() || null,
        customTitle: customTitle.trim() || null,
        nameColor,
        pinnedAchievements: pinned,
        gameServer: gameServer.trim() || null,
        socialLinks: Object.keys(socialLinks).length > 0 ? socialLinks : null,
      })
      setProfile(p => p ? { ...p, ...r.data } : p)
      // Actualizar el cache de localStorage para que navbar/home reflejen los cambios sin re-login
      try {
        const stored = localStorage.getItem('user')
        if (stored) {
          const merged = { ...JSON.parse(stored), ...r.data }
          localStorage.setItem('user', JSON.stringify(merged))
        }
      } catch {}
      setSavedFlag(true)
      setTimeout(() => setSavedFlag(false), 2000)
    } catch (e: any) {
      alert(e.response?.data?.error || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent-orange" />
      </div>
    )
  }

  const userLevel = profile.level

  return (
    <div className="min-h-screen bg-bg-primary">
      <Navbar />

      <div className="max-w-3xl mx-auto pt-28 pb-16 px-6 space-y-6">
        <div className="flex items-center justify-between">
          <Link href={`/users/${profile.username}`} className="inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 font-montserrat">
            <ChevronLeft className="w-3.5 h-3.5" />
            Volver al perfil
          </Link>
          <button
            onClick={save}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 h-9 rounded-lg text-sm font-montserrat font-semibold bg-accent-orange/15 text-accent-orange border border-accent-orange/30 hover:bg-accent-orange/25 transition-all disabled:opacity-40"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : savedFlag ? <Check className="w-4 h-4 text-green-400" /> : <Save className="w-4 h-4" />}
            {savedFlag ? '¡Guardado!' : 'Guardar'}
          </button>
        </div>

        <h1 className="font-cinzel font-bold text-2xl text-text-primary">Editar perfil</h1>

        {/* Live preview */}
        <div className="rounded-2xl overflow-hidden border border-border/40">
          <ProfileBanner bannerSlug={bannerSlug} avatarSlug={avatarSlug} frameSlug={frameSlug} height={180} />
          <div className="bg-bg-card pt-20 px-6 pb-4">
            <p className="font-cinzel font-bold text-xl" style={{ color: nameColor ?? undefined }}>
              {profile.username}
            </p>
            {customTitle && <p className="text-xs text-accent-orange font-montserrat font-semibold mt-1">{customTitle}</p>}
            {bio && <p className="text-xs text-white/60 font-montserrat mt-2">{bio}</p>}
          </div>
        </div>

        {/* Avatar / Banner / Frame */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button onClick={() => setShowAvatar(true)} className="bg-bg-card border border-border/50 rounded-xl p-4 hover:border-accent-orange/40 transition-all flex flex-col items-center gap-2">
            <AvatarFrame avatarSlug={avatarSlug} frameSlug={null} size={64} />
            <span className="text-xs font-montserrat font-semibold text-white/70 flex items-center gap-1">
              <ImageIcon className="w-3 h-3" /> Avatar
            </span>
          </button>
          <button onClick={() => setShowBanner(true)} className="bg-bg-card border border-border/50 rounded-xl p-4 hover:border-accent-orange/40 transition-all flex flex-col items-center gap-2">
            <div className="w-full h-12 rounded-lg overflow-hidden bg-bg-elevated border border-border/40">
              {bannerSlug && <img src={`/images/profile/banners/${bannerSlug}.jpg`} alt="" className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = 'none')} />}
            </div>
            <span className="text-xs font-montserrat font-semibold text-white/70 flex items-center gap-1">
              <Layout className="w-3 h-3" /> Banner
            </span>
          </button>
          <button onClick={() => setShowFrame(true)} className="bg-bg-card border border-border/50 rounded-xl p-4 hover:border-accent-orange/40 transition-all flex flex-col items-center gap-2">
            <AvatarFrame avatarSlug={avatarSlug} frameSlug={frameSlug} size={64} />
            <span className="text-xs font-montserrat font-semibold text-white/70 flex items-center gap-1">
              <FrameIcon className="w-3 h-3" /> Marco
            </span>
          </button>
        </div>

        {/* Bio */}
        <div className="bg-bg-card border border-border/50 rounded-xl p-4">
          <label className="text-xs font-montserrat font-semibold text-white/60 uppercase tracking-wider block mb-2">Bio</label>
          <textarea
            value={bio}
            onChange={e => setBio(e.target.value)}
            maxLength={160}
            rows={2}
            placeholder="Una frase para describirte..."
            className="w-full px-3 py-2 bg-bg-elevated border border-border rounded-lg text-sm text-white font-montserrat focus:outline-none focus:border-accent-orange resize-none"
          />
          <p className="text-[10px] text-white/30 font-montserrat mt-1">{bio.length} / 160</p>
        </div>

        {/* Custom title */}
        <div className="bg-bg-card border border-border/50 rounded-xl p-4">
          <label className="text-xs font-montserrat font-semibold text-white/60 uppercase tracking-wider block mb-2">Título</label>
          <input
            value={customTitle}
            onChange={e => setCustomTitle(e.target.value)}
            maxLength={50}
            placeholder='Ej: "Sannin de Konoha"'
            className="w-full h-10 px-3 bg-bg-elevated border border-border rounded-lg text-sm text-white font-montserrat focus:outline-none focus:border-accent-orange"
          />
          <p className="text-[10px] text-white/30 font-montserrat mt-1">{customTitle.length} / 50</p>
        </div>

        {/* Name color */}
        <div className="bg-bg-card border border-border/50 rounded-xl p-4">
          <label className="text-xs font-montserrat font-semibold text-white/60 uppercase tracking-wider block mb-3">Color del nombre</label>
          <ColorPicker current={nameColor} onSelect={setNameColor} />
        </div>

        {/* Game server */}
        <div className="bg-bg-card border border-border/50 rounded-xl p-4">
          <label className="text-xs font-montserrat font-semibold text-white/60 uppercase tracking-wider block mb-2">Server / Cluster</label>
          <input
            value={gameServer}
            onChange={e => setGameServer(e.target.value)}
            maxLength={50}
            placeholder='Ej: "S102 - Konoha"'
            className="w-full h-10 px-3 bg-bg-elevated border border-border rounded-lg text-sm text-white font-montserrat focus:outline-none focus:border-accent-orange"
          />
        </div>

        {/* Social links */}
        <div className="bg-bg-card border border-border/50 rounded-xl p-4 space-y-3">
          <label className="text-xs font-montserrat font-semibold text-white/60 uppercase tracking-wider block">Redes sociales</label>
          <div className="grid grid-cols-2 gap-3">
            <input value={twitch}     onChange={e => setTwitch(e.target.value)}     maxLength={100} placeholder="Twitch (usuario)"   className="h-9 px-3 bg-bg-elevated border border-border rounded-lg text-xs text-white font-montserrat focus:outline-none focus:border-accent-orange" />
            <input value={youtube}    onChange={e => setYoutube(e.target.value)}    maxLength={100} placeholder="YouTube (canal)"    className="h-9 px-3 bg-bg-elevated border border-border rounded-lg text-xs text-white font-montserrat focus:outline-none focus:border-accent-orange" />
            <input value={discord}    onChange={e => setDiscord(e.target.value)}    maxLength={40}  placeholder="Discord (tag)"      className="h-9 px-3 bg-bg-elevated border border-border rounded-lg text-xs text-white font-montserrat focus:outline-none focus:border-accent-orange" />
            <input value={ingameName} onChange={e => setIngameName(e.target.value)} maxLength={50}  placeholder="Nombre in-game"     className="h-9 px-3 bg-bg-elevated border border-border rounded-lg text-xs text-white font-montserrat focus:outline-none focus:border-accent-orange" />
          </div>
        </div>

        {/* Pinned achievements */}
        <div className="bg-bg-card border border-border/50 rounded-xl p-4">
          <label className="text-xs font-montserrat font-semibold text-white/60 uppercase tracking-wider block mb-2">Logros destacados</label>
          <PinnedAchievements
            userAchievements={profile.achievements ?? []}
            pinned={pinned}
            onChange={setPinned}
          />
        </div>
      </div>

      {showAvatar && <AvatarPicker current={avatarSlug} onSelect={setAvatarSlug} onClose={() => setShowAvatar(false)} />}
      {showBanner && <BannerPicker current={bannerSlug} onSelect={setBannerSlug} onClose={() => setShowBanner(false)} />}
      {showFrame  && <FramePicker  current={frameSlug}  userLevel={userLevel} onSelect={setFrameSlug} onClose={() => setShowFrame(false)} />}
    </div>
  )
}

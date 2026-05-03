'use client'

import { useState, useEffect } from 'react'
import { Loader2, Save, Zap, Trophy, Award } from 'lucide-react'
import api from '@/lib/api'

interface XpConfig  { action: string; label: string; xpAmount: number }
interface LevelConfig { level: number; xpRequired: number; label: string }
interface Achievement { key: string; title: string; description: string; imageFile: string; xpReward: number }

const RANK_IMAGES: Record<string, string> = {
  'Genin':    '/images/rangos/genin.png',
  'Chūnin':  '/images/rangos/chunin.png',
  'Jōnin':   '/images/rangos/jonin.png',
  'Kage':    '/images/rangos/kage.png',
  'Akatsuki': '/images/rangos/akatsuki.png',
}

export default function AdminXpPage() {
  const [xpConfig, setXpConfig]       = useState<XpConfig[]>([])
  const [levelConfig, setLevelConfig] = useState<LevelConfig[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState<string | null>(null)
  const [saved, setSaved]     = useState<string | null>(null)

  useEffect(() => {
    api.get('/admin/xp-config')
      .then(r => {
        setXpConfig(r.data.xpConfig)
        setLevelConfig(r.data.levelConfig)
        setAchievements(r.data.achievements)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const flash = (key: string) => {
    setSaved(key)
    setTimeout(() => setSaved(null), 2000)
  }

  const saveXp = async (action: string, xpAmount: number) => {
    setSaving(action)
    try {
      await api.patch('/admin/xp-config', { action, xpAmount })
      setXpConfig(c => c.map(x => x.action === action ? { ...x, xpAmount } : x))
      flash(action)
    } catch (e: any) { alert(e.response?.data?.error || 'Error') }
    finally { setSaving(null) }
  }

  const saveLevel = async (level: number, xpRequired: number, label: string) => {
    const key = `level-${level}`
    setSaving(key)
    try {
      await api.patch('/admin/level-config', { level, xpRequired, label })
      setLevelConfig(c => c.map(l => l.level === level ? { ...l, xpRequired, label } : l))
      flash(key)
    } catch (e: any) { alert(e.response?.data?.error || 'Error') }
    finally { setSaving(null) }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-accent-orange" />
      </div>
    )
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-12">

      {/* ── XP por acción ── */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-accent-orange/15 flex items-center justify-center">
            <Zap className="w-5 h-5 text-accent-orange" />
          </div>
          <div>
            <h2 className="font-cinzel font-bold text-lg text-text-primary">XP por Acción</h2>
            <p className="text-xs text-white/40 font-montserrat">Cuánto XP recibe el usuario al realizar cada acción</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {xpConfig.map(cfg => (
            <XpRow
              key={cfg.action}
              label={cfg.label}
              value={cfg.xpAmount}
              saving={saving === cfg.action}
              saved={saved === cfg.action}
              onSave={val => saveXp(cfg.action, val)}
            />
          ))}
        </div>
      </section>

      {/* ── Niveles y Rangos ── */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-sage-gold/15 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-sage-gold" />
          </div>
          <div>
            <h2 className="font-cinzel font-bold text-lg text-text-primary">Niveles y Rangos</h2>
            <p className="text-xs text-white/40 font-montserrat">XP requerida y nombre de cada nivel</p>
          </div>
        </div>

        <div className="bg-bg-card border border-border/50 rounded-2xl overflow-hidden">
          <div className="grid grid-cols-[48px_1fr_160px_160px_100px] text-xs font-montserrat font-semibold text-white/40 uppercase tracking-wider px-5 py-3 border-b border-border/40">
            <span></span>
            <span>Rango</span>
            <span>Nombre</span>
            <span>XP requerida</span>
            <span></span>
          </div>
          {levelConfig.map(lv => (
            <LevelRow
              key={lv.level}
              level={lv.level}
              xpRequired={lv.xpRequired}
              label={lv.label}
              rankImg={RANK_IMAGES[lv.label]}
              saving={saving === `level-${lv.level}`}
              saved={saved === `level-${lv.level}`}
              onSave={(xp, label) => saveLevel(lv.level, xp, label)}
            />
          ))}
        </div>
      </section>

      {/* ── Logros (lectura) ── */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-chakra-blue/15 flex items-center justify-center">
            <Award className="w-5 h-5 text-chakra-blue" />
          </div>
          <div>
            <h2 className="font-cinzel font-bold text-lg text-text-primary">Logros</h2>
            <p className="text-xs text-white/40 font-montserrat">Se otorgan automáticamente al cumplirse las condiciones</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {achievements.map(ach => (
            <div key={ach.key} className="flex items-center gap-4 p-4 bg-bg-card border border-border/50 rounded-xl">
              <img
                src={`/images/guides/logros/${ach.imageFile}`}
                alt={ach.title}
                className="w-12 h-12 object-contain flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="font-montserrat font-bold text-sm text-text-primary">{ach.title}</p>
                <p className="text-xs text-white/50 leading-relaxed mt-0.5">{ach.description}</p>
              </div>
              <span className="text-xs font-bold text-sage-gold flex-shrink-0">+{ach.xpReward} XP</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

/* ── Sub-components ── */

function XpRow({ label, value, saving, saved, onSave }: {
  label: string; value: number; saving: boolean; saved: boolean
  onSave: (v: number) => void
}) {
  const [local, setLocal] = useState(value)
  const changed = local !== value

  return (
    <div className="flex items-center gap-3 p-4 bg-bg-card border border-border/50 rounded-xl">
      <span className="flex-1 font-montserrat text-sm text-text-primary">{label}</span>
      <input
        type="number"
        min={0}
        max={10000}
        value={local}
        onChange={e => setLocal(Number(e.target.value))}
        className="w-20 h-8 px-2 text-sm bg-bg-elevated border border-border rounded-lg text-white text-center focus:outline-none focus:border-accent-orange font-montserrat"
      />
      <span className="text-xs text-white/30 font-montserrat w-5">XP</span>
      <SaveBtn saving={saving} saved={saved} changed={changed} onSave={() => onSave(local)} />
    </div>
  )
}

function LevelRow({ level, xpRequired, label, rankImg, saving, saved, onSave }: {
  level: number; xpRequired: number; label: string; rankImg?: string
  saving: boolean; saved: boolean; onSave: (xp: number, label: string) => void
}) {
  const [localXp, setLocalXp]       = useState(xpRequired)
  const [localLabel, setLocalLabel] = useState(label)
  const changed = localXp !== xpRequired || localLabel !== label

  return (
    <div className="grid grid-cols-[48px_1fr_160px_160px_100px] items-center px-5 py-3 border-b border-border/20 last:border-0 hover:bg-bg-elevated/30 transition-colors">
      {/* Level badge */}
      <div className="w-8 h-8 rounded-full bg-bg-elevated border border-border flex items-center justify-center text-xs font-cinzel font-bold text-white/60">
        {level}
      </div>

      {/* Rank image + current label */}
      <div className="flex items-center gap-2">
        {rankImg
          ? <img src={rankImg} alt={label} className="w-8 h-8 object-contain" />
          : <div className="w-8 h-8 rounded-full bg-bg-elevated border border-border/50" />
        }
        <span className="text-xs text-white/40 font-montserrat">{label}</span>
      </div>

      {/* Label editor */}
      <input
        value={localLabel}
        onChange={e => setLocalLabel(e.target.value)}
        className="h-8 px-3 text-xs bg-bg-elevated border border-border rounded-lg text-white focus:outline-none focus:border-accent-orange font-montserrat mr-2"
      />

      {/* XP editor */}
      <input
        type="number"
        min={0}
        value={localXp}
        onChange={e => setLocalXp(Number(e.target.value))}
        className="h-8 px-3 text-xs bg-bg-elevated border border-border rounded-lg text-white focus:outline-none focus:border-accent-orange font-montserrat text-center mr-2"
      />

      <SaveBtn saving={saving} saved={saved} changed={changed} onSave={() => onSave(localXp, localLabel)} />
    </div>
  )
}

function SaveBtn({ saving, saved, changed, onSave }: {
  saving: boolean; saved: boolean; changed: boolean; onSave: () => void
}) {
  return (
    <button
      onClick={onSave}
      disabled={saving || !changed}
      className={`flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-montserrat font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
        saved
          ? 'bg-nature-green/20 text-nature-green border border-nature-green/40'
          : 'bg-accent-orange/15 text-accent-orange border border-accent-orange/30 hover:bg-accent-orange/25'
      }`}
    >
      {saving
        ? <Loader2 className="w-3 h-3 animate-spin" />
        : <Save className="w-3 h-3" />
      }
      {saved ? 'Guardado' : 'Guardar'}
    </button>
  )
}

function Save({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  )
}

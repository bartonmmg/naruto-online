'use client'

import { useState, useEffect } from 'react'
import { Loader2, Save, Zap, Trophy, Award, Plus, Trash2, RefreshCw, AlertTriangle } from 'lucide-react'
import api from '@/lib/api'

interface XpConfig    { action: string; label: string; xpAmount: number }
interface LevelConfig { level: number; xpRequired: number; label: string }
interface Achievement { key: string; title: string; description: string; imageFile: string; xpReward: number }

// Rank image by level number — independent of the editable label
const RANK_BY_LEVEL: Record<number, { img: string; rank: string }> = {
  1:  { img: '/images/rangos/genin.png',    rank: 'Genin'    },
  2:  { img: '/images/rangos/genin.png',    rank: 'Genin'    },
  3:  { img: '/images/rangos/genin.png',    rank: 'Genin'    },
  4:  { img: '/images/rangos/chunin.png',   rank: 'Chūnin'   },
  5:  { img: '/images/rangos/chunin.png',   rank: 'Chūnin'   },
  6:  { img: '/images/rangos/chunin.png',   rank: 'Chūnin'   },
  7:  { img: '/images/rangos/jonin.png',    rank: 'Jōnin'    },
  8:  { img: '/images/rangos/jonin.png',    rank: 'Jōnin'    },
  9:  { img: '/images/rangos/jonin.png',    rank: 'Jōnin'    },
  10: { img: '/images/rangos/kage.png',     rank: 'Kage'     },
}
function getRankInfo(level: number) {
  if (RANK_BY_LEVEL[level]) return RANK_BY_LEVEL[level]
  if (level <= 0) return { img: '/images/rangos/genin.png', rank: 'Genin' }
  return { img: '/images/rangos/akatsuki.png', rank: 'Akatsuki' }
}

export default function AdminXpPage() {
  const [xpConfig, setXpConfig]       = useState<XpConfig[]>([])
  const [levelConfig, setLevelConfig] = useState<LevelConfig[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading]   = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [saving, setSaving]     = useState<string | null>(null)
  const [saved, setSaved]       = useState<string | null>(null)
  const [showAddLevel, setShowAddLevel] = useState(false)
  const [newLevel, setNewLevel] = useState({ level: '', xpRequired: '', label: '' })
  const [addingLevel, setAddingLevel] = useState(false)
  const [reseeding, setReseeding] = useState(false)

  const loadConfig = () => {
    setLoading(true)
    setLoadError(null)
    api.get('/admin/xp-config')
      .then(r => {
        setXpConfig(r.data.xpConfig)
        setLevelConfig(r.data.levelConfig)
        setAchievements(r.data.achievements)
      })
      .catch(e => setLoadError(e.response?.data?.error || e.message || 'Error al cargar configuración'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadConfig() }, [])

  const reseed = async () => {
    if (!confirm('¿Restablecer toda la configuración de XP, niveles y logros a los valores por defecto? Esto no afecta el XP de los usuarios.')) return
    setReseeding(true)
    try {
      await api.post('/admin/reseed')
      loadConfig()
    } catch (e: any) {
      alert(e.response?.data?.error || 'Error al restablecer')
    } finally {
      setReseeding(false)
    }
  }

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

  const deleteLevel = async (level: number) => {
    if (!confirm(`¿Eliminar el nivel ${level}?`)) return
    try {
      await api.delete(`/admin/level-config/${level}`)
      setLevelConfig(c => c.filter(l => l.level !== level))
    } catch (e: any) { alert(e.response?.data?.error || 'Error') }
  }

  const addLevel = async () => {
    const lvl = parseInt(newLevel.level)
    const xp  = parseInt(newLevel.xpRequired)
    if (!lvl || isNaN(xp) || !newLevel.label.trim()) {
      alert('Completa todos los campos')
      return
    }
    if (levelConfig.some(l => l.level === lvl)) {
      alert(`El nivel ${lvl} ya existe`)
      return
    }
    setAddingLevel(true)
    try {
      await api.post('/admin/level-config', { level: lvl, xpRequired: xp, label: newLevel.label.trim() })
      setLevelConfig(c => [...c, { level: lvl, xpRequired: xp, label: newLevel.label.trim() }].sort((a, b) => a.level - b.level))
      setNewLevel({ level: '', xpRequired: '', label: '' })
      setShowAddLevel(false)
    } catch (e: any) { alert(e.response?.data?.error || 'Error') }
    finally { setAddingLevel(false) }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-accent-orange" />
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <div className="flex flex-col items-center gap-4 p-8 bg-bg-card border border-red-500/30 rounded-2xl text-center">
          <AlertTriangle className="w-10 h-10 text-red-400" />
          <div>
            <p className="font-cinzel font-bold text-text-primary mb-1">Error al cargar configuración</p>
            <p className="text-xs text-white/50 font-montserrat leading-relaxed">{loadError}</p>
          </div>
          <p className="text-xs text-white/40 font-montserrat">
            Probablemente hay datos corruptos en la base de datos. Podés restablecer los valores por defecto sin afectar el XP de los usuarios.
          </p>
          <div className="flex gap-3">
            <button
              onClick={loadConfig}
              className="flex items-center gap-2 px-4 h-9 rounded-lg text-sm font-montserrat font-semibold bg-white/5 text-white/60 border border-border hover:bg-white/10 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Reintentar
            </button>
            <button
              onClick={reseed}
              disabled={reseeding}
              className="flex items-center gap-2 px-4 h-9 rounded-lg text-sm font-montserrat font-semibold bg-accent-orange/15 text-accent-orange border border-accent-orange/30 hover:bg-accent-orange/25 transition-all disabled:opacity-40"
            >
              {reseeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Restablecer configuración
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-12">

      {/* ── Header con botón de reseed ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-cinzel font-bold text-xl text-text-primary">XP &amp; Niveles</h1>
          <p className="text-xs text-white/40 font-montserrat mt-0.5">Configuración del sistema de progresión</p>
        </div>
        <button
          onClick={reseed}
          disabled={reseeding}
          className="flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-montserrat text-white/30 border border-border/40 hover:text-white/60 hover:border-border/70 transition-all disabled:opacity-40"
          title="Restablecer todos los valores a los defaults originales"
        >
          {reseeding ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
          Restablecer defaults
        </button>
      </div>

      {/* ── XP por acción ── */}
      <section>
        <SectionHeader
          icon={<Zap className="w-5 h-5 text-accent-orange" />}
          iconBg="bg-accent-orange/15"
          title="XP por Acción"
          subtitle="Cuánto XP recibe el usuario al realizar cada acción"
        />
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
        <div className="flex items-start justify-between mb-6">
          <SectionHeader
            icon={<Trophy className="w-5 h-5 text-sage-gold" />}
            iconBg="bg-sage-gold/15"
            title="Niveles y Rangos"
            subtitle="XP requerida y nombre de cada nivel"
          />
          <button
            onClick={() => setShowAddLevel(v => !v)}
            className="flex items-center gap-1.5 px-3 h-9 rounded-lg text-xs font-montserrat font-semibold bg-accent-orange/15 text-accent-orange border border-accent-orange/30 hover:bg-accent-orange/25 transition-all flex-shrink-0 mt-1"
          >
            <Plus className="w-3.5 h-3.5" />
            Nuevo Nivel
          </button>
        </div>

        {/* Add level form */}
        {showAddLevel && (
          <div className="mb-4 p-4 bg-bg-card border border-accent-orange/30 rounded-2xl">
            <p className="text-xs font-montserrat font-semibold text-white/50 uppercase tracking-wider mb-3">Nuevo Nivel</p>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-white/30 font-montserrat uppercase">Número</label>
                <input
                  type="number"
                  min={1}
                  placeholder="11"
                  value={newLevel.level}
                  onChange={e => setNewLevel(v => ({ ...v, level: e.target.value }))}
                  className="w-20 h-8 px-3 text-xs bg-bg-elevated border border-border rounded-lg text-white focus:outline-none focus:border-accent-orange font-montserrat text-center"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-white/30 font-montserrat uppercase">Nombre del Rango</label>
                <input
                  placeholder="Akatsuki"
                  value={newLevel.label}
                  onChange={e => setNewLevel(v => ({ ...v, label: e.target.value }))}
                  className="w-36 h-8 px-3 text-xs bg-bg-elevated border border-border rounded-lg text-white focus:outline-none focus:border-accent-orange font-montserrat"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-white/30 font-montserrat uppercase">XP requerida</label>
                <input
                  type="number"
                  min={0}
                  placeholder="9000"
                  value={newLevel.xpRequired}
                  onChange={e => setNewLevel(v => ({ ...v, xpRequired: e.target.value }))}
                  className="w-28 h-8 px-3 text-xs bg-bg-elevated border border-border rounded-lg text-white focus:outline-none focus:border-accent-orange font-montserrat text-center"
                />
              </div>
              {/* Preview */}
              {newLevel.level && (
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-white/30 font-montserrat uppercase">Imagen</label>
                  <img
                    src={getRankInfo(parseInt(newLevel.level) || 0).img}
                    alt="rank preview"
                    className="w-8 h-8 object-contain"
                  />
                </div>
              )}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={addLevel}
                  disabled={addingLevel}
                  className="flex items-center gap-1.5 px-4 h-8 rounded-lg text-xs font-montserrat font-semibold bg-nature-green/15 text-nature-green border border-nature-green/30 hover:bg-nature-green/25 transition-all disabled:opacity-40"
                >
                  {addingLevel ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                  Agregar
                </button>
                <button
                  onClick={() => setShowAddLevel(false)}
                  className="px-4 h-8 rounded-lg text-xs font-montserrat text-white/40 hover:text-white/70 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-bg-card border border-border/50 rounded-2xl overflow-hidden">
          <div className="grid grid-cols-[52px_80px_1fr_160px_160px_110px] text-xs font-montserrat font-semibold text-white/40 uppercase tracking-wider px-5 py-3 border-b border-border/40">
            <span>Nv.</span>
            <span>Imagen</span>
            <span>Rango actual</span>
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
              saving={saving === `level-${lv.level}`}
              saved={saved === `level-${lv.level}`}
              onSave={(xp, label) => saveLevel(lv.level, xp, label)}
              onDelete={() => deleteLevel(lv.level)}
            />
          ))}
        </div>
      </section>

      {/* ── Logros ── */}
      <section>
        <SectionHeader
          icon={<Award className="w-5 h-5 text-chakra-blue" />}
          iconBg="bg-chakra-blue/15"
          title="Logros"
          subtitle="Se otorgan automáticamente al cumplirse las condiciones"
        />
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
              {ach.xpReward > 0
                ? <span className="text-xs font-bold text-sage-gold flex-shrink-0">+{ach.xpReward} XP</span>
                : <span className="text-xs text-white/30 flex-shrink-0 font-montserrat">Dinámico</span>
              }
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

/* ── Sub-components ── */

function SectionHeader({ icon, iconBg, title, subtitle }: {
  icon: React.ReactNode; iconBg: string; title: string; subtitle: string
}) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
        {icon}
      </div>
      <div>
        <h2 className="font-cinzel font-bold text-lg text-text-primary">{title}</h2>
        <p className="text-xs text-white/40 font-montserrat">{subtitle}</p>
      </div>
    </div>
  )
}

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

function LevelRow({ level, xpRequired, label, saving, saved, onSave, onDelete }: {
  level: number; xpRequired: number; label: string
  saving: boolean; saved: boolean
  onSave: (xp: number, label: string) => void
  onDelete: () => void
}) {
  const [localXp, setLocalXp]       = useState(xpRequired)
  const [localLabel, setLocalLabel] = useState(label)
  const changed = localXp !== xpRequired || localLabel !== label
  const rankInfo = getRankInfo(level)

  return (
    <div className="grid grid-cols-[52px_80px_1fr_160px_160px_110px] items-center px-5 py-3 border-b border-border/20 last:border-0 hover:bg-bg-elevated/30 transition-colors">
      {/* Level number */}
      <div className="w-8 h-8 rounded-full bg-bg-elevated border border-border flex items-center justify-center text-xs font-cinzel font-bold text-white/60">
        {level}
      </div>

      {/* Rank image — based on level number, not label */}
      <div className="flex items-center gap-2">
        <img src={rankInfo.img} alt={rankInfo.rank} className="w-8 h-8 object-contain" title={rankInfo.rank} />
      </div>

      {/* Current label (read-only display) */}
      <span className="text-xs text-white/40 font-montserrat truncate pr-2">{label}</span>

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

      {/* Actions */}
      <div className="flex items-center gap-1">
        <SaveBtn saving={saving} saved={saved} changed={changed} onSave={() => onSave(localXp, localLabel)} />
        <button
          onClick={onDelete}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-white/20 hover:text-red-400 hover:bg-red-400/10 transition-all flex-shrink-0"
          title="Eliminar nivel"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
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

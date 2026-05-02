'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Save, Settings, Zap, Trophy, ChevronLeft } from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import api from '@/lib/api'

interface XpConfig { action: string; label: string; xpAmount: number }
interface LevelConfig { level: number; xpRequired: number; label: string }
interface Achievement { key: string; title: string; description: string; imageFile: string; xpReward: number }

export default function AdminXpPage() {
  const { hasRole, isLoading } = useAuth()
  const router = useRouter()

  const [xpConfig, setXpConfig] = useState<XpConfig[]>([])
  const [levelConfig, setLevelConfig] = useState<LevelConfig[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && !hasRole(['ADMIN'])) router.replace('/dashboard')
  }, [isLoading, hasRole, router])

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

  const saveXp = async (action: string, xpAmount: number) => {
    setSaving(action)
    try {
      await api.patch('/admin/xp-config', { action, xpAmount })
      setSaved(action)
      setTimeout(() => setSaved(null), 2000)
    } catch (e: any) {
      alert(e.response?.data?.error || 'Error al guardar')
    } finally {
      setSaving(null)
    }
  }

  const saveLevel = async (level: number, xpRequired: number, label: string) => {
    const key = `level-${level}`
    setSaving(key)
    try {
      await api.patch('/admin/level-config', { level, xpRequired, label })
      setSaved(key)
      setTimeout(() => setSaved(null), 2000)
    } catch (e: any) {
      alert(e.response?.data?.error || 'Error al guardar')
    } finally {
      setSaving(null)
    }
  }

  if (isLoading || loading) {
    return <div className="min-h-screen bg-bg-primary flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-accent-orange" />
    </div>
  }

  return (
    <main className="min-h-screen bg-bg-primary">
      <Navbar />

      <section className="pt-20 pb-10 px-6 border-b border-border/50">
        <div className="max-w-4xl mx-auto">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white/90 transition-colors mb-6">
            <ChevronLeft className="w-4 h-4" />
            Dashboard
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <Settings className="w-6 h-6 text-accent-orange" />
            <h1 className="text-3xl font-cinzel font-black text-text-primary">Back Office — Sistema XP</h1>
          </div>
          <p className="text-white/50 text-sm font-montserrat">Configurá cuánto XP otorga cada acción y los requisitos por nivel.</p>
        </div>
      </section>

      <section className="py-10 px-6">
        <div className="max-w-4xl mx-auto space-y-10">

          {/* XP por acción */}
          <div>
            <div className="flex items-center gap-2 mb-5">
              <Zap className="w-5 h-5 text-sage-gold" />
              <h2 className="text-xl font-cinzel font-bold text-text-primary">XP por Acción</h2>
            </div>
            <div className="space-y-3">
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
          </div>

          {/* Configuración de niveles */}
          <div>
            <div className="flex items-center gap-2 mb-5">
              <Trophy className="w-5 h-5 text-accent-orange" />
              <h2 className="text-xl font-cinzel font-bold text-text-primary">Configuración de Niveles</h2>
            </div>
            <div className="overflow-hidden rounded-xl border border-border/50">
              <table className="w-full text-sm font-montserrat">
                <thead>
                  <tr className="border-b border-border/50 bg-bg-elevated">
                    <th className="text-left px-4 py-3 text-white/50 font-semibold w-16">Nivel</th>
                    <th className="text-left px-4 py-3 text-white/50 font-semibold">Rango</th>
                    <th className="text-left px-4 py-3 text-white/50 font-semibold w-36">XP requerida</th>
                    <th className="w-24 px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {levelConfig.map(lv => (
                    <LevelRow
                      key={lv.level}
                      level={lv.level}
                      xpRequired={lv.xpRequired}
                      label={lv.label}
                      saving={saving === `level-${lv.level}`}
                      saved={saved === `level-${lv.level}`}
                      onSave={(xp, label) => saveLevel(lv.level, xp, label)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Logros (solo lectura — definidos en código) */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-chakra-blue" />
              <h2 className="text-xl font-cinzel font-bold text-text-primary">Logros Definidos</h2>
            </div>
            <p className="text-xs text-white/40 font-montserrat mb-5">Los logros se otorgan automáticamente al cumplir las condiciones. Solo las guías publicadas y aprobadas cuentan.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {achievements.map(ach => (
                <div key={ach.key} className="flex items-center gap-3 p-3 bg-bg-card border border-border/50 rounded-xl">
                  <img
                    src={`/images/guides/logros/${ach.imageFile}`}
                    alt={ach.title}
                    className="w-12 h-12 object-contain flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-montserrat font-bold text-sm text-text-primary">{ach.title}</p>
                    <p className="text-xs text-white/50 leading-relaxed">{ach.description}</p>
                    <p className="text-xs text-sage-gold mt-1">+{ach.xpReward} XP</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>
    </main>
  )
}

function XpRow({ label, value, saving, saved, onSave }: {
  label: string; value: number; saving: boolean; saved: boolean; onSave: (v: number) => void
}) {
  const [local, setLocal] = useState(value)
  return (
    <div className="flex items-center gap-4 p-4 bg-bg-card border border-border/50 rounded-xl">
      <span className="flex-1 font-montserrat text-sm text-text-primary">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={0}
          max={10000}
          value={local}
          onChange={e => setLocal(Number(e.target.value))}
          className="w-24 h-8 px-3 text-sm bg-bg-elevated border border-border rounded-lg text-white text-center focus:outline-none focus:border-chakra-blue font-montserrat"
        />
        <span className="text-xs text-white/40 font-montserrat w-6">XP</span>
        <button
          onClick={() => onSave(local)}
          disabled={saving || local === value}
          className={`flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-montserrat font-semibold transition-all disabled:opacity-40 ${
            saved ? 'bg-nature-green/20 text-nature-green border border-nature-green/40' : 'bg-chakra-blue/20 text-chakra-blue border border-chakra-blue/40 hover:bg-chakra-blue/30'
          }`}
        >
          {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
          {saved ? 'Guardado' : 'Guardar'}
        </button>
      </div>
    </div>
  )
}

function LevelRow({ level, xpRequired, label, saving, saved, onSave }: {
  level: number; xpRequired: number; label: string; saving: boolean; saved: boolean
  onSave: (xp: number, label: string) => void
}) {
  const [localXp, setLocalXp] = useState(xpRequired)
  const [localLabel, setLocalLabel] = useState(label)
  const changed = localXp !== xpRequired || localLabel !== label
  return (
    <tr className="border-b border-border/30 last:border-0 hover:bg-bg-elevated/50 transition-colors">
      <td className="px-4 py-3">
        <span className="w-8 h-8 rounded-full bg-bg-elevated border border-border flex items-center justify-center text-xs font-bold text-white/70 font-cinzel">{level}</span>
      </td>
      <td className="px-4 py-3">
        <input
          value={localLabel}
          onChange={e => setLocalLabel(e.target.value)}
          className="w-full h-8 px-2 text-sm bg-bg-elevated border border-border rounded text-white focus:outline-none focus:border-chakra-blue font-montserrat"
        />
      </td>
      <td className="px-4 py-3">
        <input
          type="number"
          min={0}
          value={localXp}
          onChange={e => setLocalXp(Number(e.target.value))}
          className="w-full h-8 px-2 text-sm bg-bg-elevated border border-border rounded text-white focus:outline-none focus:border-chakra-blue font-montserrat text-center"
        />
      </td>
      <td className="px-4 py-3">
        <button
          onClick={() => onSave(localXp, localLabel)}
          disabled={saving || !changed}
          className={`flex items-center gap-1 px-3 h-8 rounded text-xs font-montserrat font-semibold transition-all disabled:opacity-40 ${
            saved ? 'bg-nature-green/20 text-nature-green' : 'bg-chakra-blue/20 text-chakra-blue hover:bg-chakra-blue/30'
          }`}
        >
          {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
          {saved ? '✓' : 'Guardar'}
        </button>
      </td>
    </tr>
  )
}

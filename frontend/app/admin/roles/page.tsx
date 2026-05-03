'use client'

import { useState, useEffect } from 'react'
import { Loader2, Users, Shield, ShieldCheck, ShieldAlert, Search, ChevronDown } from 'lucide-react'
import api from '@/lib/api'

type Role = 'USER' | 'MODERATOR' | 'ADMIN'

interface UserRow {
  id: string
  username: string
  email: string
  role: Role
  level: number
  xp: number
  createdAt: string
}

const ROLE_META: Record<Role, { label: string; color: string; bg: string; border: string; icon: React.ReactNode; description: string; perms: string[] }> = {
  USER: {
    label: 'Usuario',
    color: 'text-white/60',
    bg: 'bg-white/5',
    border: 'border-white/10',
    icon: <Users className="w-4 h-4" />,
    description: 'Rol por defecto al registrarse. Puede interactuar con el contenido pero no crearlo.',
    perms: [
      'Ver guías publicadas',
      'Votar guías útil / no útil (+2 XP)',
      'Comentar guías (+5 XP)',
      'Reaccionar con emojis (+1 XP)',
      'Login diario (+10 XP)',
      'Ver leaderboard y perfiles públicos',
      'Ver y gestionar sus propias notificaciones',
    ],
  },
  MODERATOR: {
    label: 'Moderador',
    color: 'text-chakra-blue',
    bg: 'bg-chakra-blue/10',
    border: 'border-chakra-blue/30',
    icon: <Shield className="w-4 h-4" />,
    description: 'Puede crear y moderar contenido. Badge especial visible en su perfil.',
    perms: [
      'Todo lo de Usuario',
      'Crear guías (+50 XP por guía)',
      'Editar cualquier guía',
      'Eliminar guías',
      'Asignar badges a guías (Oficial, Tendencia, Verificada, Completa)',
      'Eliminar cualquier comentario',
      'Ver guías en borrador en el listado',
      'Badge "MODERADOR" en perfil público',
    ],
  },
  ADMIN: {
    label: 'Administrador',
    color: 'text-accent-orange',
    bg: 'bg-accent-orange/10',
    border: 'border-accent-orange/30',
    icon: <ShieldCheck className="w-4 h-4" />,
    description: 'Acceso total. Puede configurar el sistema de XP, niveles y gestionar usuarios.',
    perms: [
      'Todo lo de Moderador',
      'Acceso al Back Office (/admin)',
      'Configurar XP por acción',
      'Agregar / editar / eliminar niveles y rangos',
      'Ver y restablecer configuración de logros',
      'Cambiar el rol de cualquier usuario',
      'Badge "ADMIN" en perfil público',
      'Link al panel de admin desde el dashboard',
    ],
  },
}

const RANK_BY_LEVEL: Record<number, string> = { 1: 'Genin', 2: 'Genin', 3: 'Genin', 4: 'Chūnin', 5: 'Chūnin', 6: 'Chūnin', 7: 'Jōnin', 8: 'Jōnin', 9: 'Jōnin', 10: 'Kage' }
function getRankLabel(level: number) { return RANK_BY_LEVEL[level] ?? 'Akatsuki' }

export default function AdminRolesPage() {
  const [users, setUsers]       = useState<UserRow[]>([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [filter, setFilter]     = useState<Role | 'TODOS'>('TODOS')
  const [changing, setChanging] = useState<string | null>(null)

  useEffect(() => {
    api.get('/admin/users')
      .then(r => setUsers(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const changeRole = async (userId: string, newRole: Role) => {
    setChanging(userId)
    try {
      await api.patch(`/admin/users/${userId}/role`, { role: newRole })
      setUsers(u => u.map(x => x.id === userId ? { ...x, role: newRole } : x))
    } catch (e: any) {
      alert(e.response?.data?.error || 'Error al cambiar rol')
    } finally {
      setChanging(null)
    }
  }

  const filtered = users.filter(u => {
    const matchRole   = filter === 'TODOS' || u.role === filter
    const matchSearch = !search || u.username.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
    return matchRole && matchSearch
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-accent-orange" />
      </div>
    )
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-12">

      {/* Header */}
      <div>
        <h1 className="font-cinzel font-bold text-xl text-text-primary">Roles &amp; Usuarios</h1>
        <p className="text-xs text-white/40 font-montserrat mt-0.5">Gestión de permisos y acceso por tipo de usuario</p>
      </div>

      {/* ── Referencia de roles ── */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-chakra-blue/15 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5 text-chakra-blue" />
          </div>
          <div>
            <h2 className="font-cinzel font-bold text-lg text-text-primary">Referencia de Roles</h2>
            <p className="text-xs text-white/40 font-montserrat">Qué puede hacer cada tipo de usuario</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(Object.keys(ROLE_META) as Role[]).map(role => {
            const m = ROLE_META[role]
            return (
              <div key={role} className={`p-5 rounded-2xl border ${m.bg} ${m.border}`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className={m.color}>{m.icon}</span>
                  <span className={`font-cinzel font-bold text-sm ${m.color}`}>{m.label}</span>
                </div>
                <p className="text-xs text-white/50 font-montserrat leading-relaxed mb-4">{m.description}</p>
                <ul className="space-y-1.5">
                  {m.perms.map((p, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs font-montserrat text-white/60">
                      <span className={`mt-0.5 flex-shrink-0 ${i === 0 && role !== 'USER' ? 'opacity-40' : m.color}`}>
                        {i === 0 && role !== 'USER' ? '↳' : '✓'}
                      </span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── Tabla de usuarios ── */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-accent-orange/15 flex items-center justify-center">
            <Users className="w-5 h-5 text-accent-orange" />
          </div>
          <div>
            <h2 className="font-cinzel font-bold text-lg text-text-primary">Usuarios Registrados</h2>
            <p className="text-xs text-white/40 font-montserrat">{users.length} usuarios en total</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por usuario o email..."
              className="w-full h-9 pl-9 pr-3 text-xs bg-bg-card border border-border rounded-lg text-white placeholder-white/25 focus:outline-none focus:border-accent-orange font-montserrat"
            />
          </div>
          {(['TODOS', 'USER', 'MODERATOR', 'ADMIN'] as const).map(r => (
            <button
              key={r}
              onClick={() => setFilter(r)}
              className={`px-3 h-9 rounded-lg text-xs font-montserrat font-semibold transition-all border ${
                filter === r
                  ? r === 'TODOS'    ? 'bg-white/10 text-white border-white/20'
                  : r === 'ADMIN'    ? 'bg-accent-orange/15 text-accent-orange border-accent-orange/30'
                  : r === 'MODERATOR'? 'bg-chakra-blue/15 text-chakra-blue border-chakra-blue/30'
                  :                    'bg-white/5 text-white/60 border-white/10'
                  : 'text-white/30 border-border hover:text-white/60 hover:border-border/80'
              }`}
            >
              {r === 'TODOS' ? 'Todos' : ROLE_META[r].label}
              {r !== 'TODOS' && <span className="ml-1.5 opacity-60">({users.filter(u => u.role === r).length})</span>}
            </button>
          ))}
        </div>

        {/* Tabla */}
        <div className="bg-bg-card border border-border/50 rounded-2xl overflow-hidden">
          <div className="grid grid-cols-[1fr_180px_100px_80px_120px] text-xs font-montserrat font-semibold text-white/40 uppercase tracking-wider px-5 py-3 border-b border-border/40">
            <span>Usuario</span>
            <span>Email</span>
            <span>Rango</span>
            <span>XP</span>
            <span>Rol</span>
          </div>

          {filtered.length === 0 ? (
            <div className="py-12 text-center text-white/30 font-montserrat text-sm">
              No se encontraron usuarios
            </div>
          ) : (
            filtered.map(u => {
              const meta = ROLE_META[u.role]
              return (
                <div
                  key={u.id}
                  className="grid grid-cols-[1fr_180px_100px_80px_120px] items-center px-5 py-3 border-b border-border/15 last:border-0 hover:bg-bg-elevated/30 transition-colors"
                >
                  {/* Username */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-bg-elevated border border-border flex items-center justify-center text-xs font-cinzel font-bold text-white/50 flex-shrink-0">
                      {u.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-montserrat font-semibold text-sm text-text-primary truncate">{u.username}</span>
                  </div>

                  {/* Email */}
                  <span className="text-xs text-white/40 font-montserrat truncate pr-3">{u.email}</span>

                  {/* Rango */}
                  <span className="text-xs text-white/50 font-montserrat">
                    Nv.{u.level} · {getRankLabel(u.level)}
                  </span>

                  {/* XP */}
                  <span className="text-xs font-bold text-sage-gold font-montserrat">{u.xp.toLocaleString()}</span>

                  {/* Rol selector */}
                  <RoleSelector
                    userId={u.id}
                    current={u.role}
                    changing={changing === u.id}
                    onChange={role => changeRole(u.id, role)}
                  />
                </div>
              )
            })
          )}
        </div>
      </section>
    </div>
  )
}

function RoleSelector({ userId, current, changing, onChange }: {
  userId: string; current: Role; changing: boolean; onChange: (r: Role) => void
}) {
  const [open, setOpen] = useState(false)
  const meta = ROLE_META[current]

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        disabled={changing}
        className={`flex items-center gap-1.5 px-2.5 h-7 rounded-lg text-xs font-montserrat font-semibold border transition-all w-full justify-between ${meta.bg} ${meta.color} ${meta.border} disabled:opacity-40`}
      >
        {changing
          ? <Loader2 className="w-3 h-3 animate-spin" />
          : <span className="flex items-center gap-1.5">{meta.icon}{meta.label}</span>
        }
        {!changing && <ChevronDown className="w-3 h-3 opacity-50" />}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 z-20 w-36 bg-bg-elevated border border-border rounded-xl overflow-hidden shadow-xl">
            {(Object.keys(ROLE_META) as Role[]).map(role => {
              const m = ROLE_META[role]
              const active = role === current
              return (
                <button
                  key={role}
                  onClick={() => { if (!active) onChange(role); setOpen(false) }}
                  className={`flex items-center gap-2 w-full px-3 py-2 text-xs font-montserrat font-semibold transition-colors ${
                    active ? `${m.color} ${m.bg}` : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                  }`}
                >
                  <span className={active ? m.color : 'text-white/30'}>{m.icon}</span>
                  {m.label}
                  {active && <span className="ml-auto text-[9px] opacity-50">actual</span>}
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

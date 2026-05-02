'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronDown, ChevronUp } from 'lucide-react'
import Navbar from '@/components/Navbar'

interface FAQ {
  q: string
  a: React.ReactNode
}

interface Section {
  id: string
  title: string
  icon: string
  faqs: FAQ[]
}

const SECTIONS: Section[] = [
  {
    id: 'guias',
    title: 'Sistema de Guías',
    icon: '📜',
    faqs: [
      {
        q: '¿Quién puede publicar guías?',
        a: 'Solo usuarios con rol Admin o Moderador pueden crear y publicar guías. Si querés contribuir, contactá a un administrador para que te asigne el rol correspondiente.',
      },
      {
        q: '¿Las guías pasan por una revisión antes de publicarse?',
        a: 'No hay un proceso de borrador — las guías se publican directamente. Sin embargo, los administradores y moderadores pueden asignar badges de calidad (Verificada, Oficial) a las guías que cumplan los estándares de la comunidad.',
      },
      {
        q: '¿Qué son las plantillas?',
        a: 'Al crear una guía, podés elegir entre 4 plantillas prediseñadas: Guía de Build, Estrategia PvP, Guía de Misión/PvE, y Tutorial Paso a Paso. Cada una pre-carga una estructura adecuada para ese tipo de contenido.',
      },
      {
        q: '¿Puedo agregar imágenes y videos a mi guía?',
        a: 'Sí. En el editor podés insertar imágenes vía URL usando el botón 🖼️ y videos de YouTube usando el botón ▶️. También podés agregar una imagen de portada que se muestra como banner en el listado.',
      },
      {
        q: '¿Cómo funciona el conteo de vistas?',
        a: 'Cada persona cuenta como una vista única. Si sos un usuario logueado, tu vista se registra una sola vez por guía (no importa cuántas veces la recargues). Si entrás como anónimo, se usa tu dirección IP para deduplicar — una visita por IP. Esto evita inflar las estadísticas artificialmente.',
      },
      {
        q: '¿Puedo votar cualquier guía?',
        a: 'Sí, cualquier usuario logueado puede votar "Útil" o "No útil" en cualquier guía. El voto es único por usuario por guía — si votás de nuevo, se cancela el voto anterior. Los votos no se pueden hacer sin iniciar sesión.',
      },
      {
        q: '¿Quién puede eliminar comentarios?',
        a: 'Solo los administradores y moderadores pueden eliminar comentarios. Los autores de los comentarios no pueden borrar sus propias respuestas, para preservar el contexto de las discusiones.',
      },
    ],
  },
  {
    id: 'badges-guias',
    title: 'Badges de Guías',
    icon: '🏅',
    faqs: [
      {
        q: '¿Qué son los badges de guías?',
        a: (
          <span>
            Son sellos de calidad asignados por administradores o moderadores a guías destacadas. Aparecen visibles
            en el listado de guías y en el detalle de cada una. Hay 4 tipos:
            <ul className="mt-2 space-y-1 list-none">
              <li className="flex items-center gap-2"><img src="/images/guides/badges/badge-oficial.png" className="w-5 h-5 object-contain" /><strong>Oficial</strong> — Guía aprobada y respaldada por la comunidad</li>
              <li className="flex items-center gap-2"><img src="/images/guides/badges/badge-verificada.png" className="w-5 h-5 object-contain" /><strong>Verificada</strong> — Información revisada y confirmada como correcta</li>
              <li className="flex items-center gap-2"><img src="/images/guides/badges/badge-tendencia.png" className="w-5 h-5 object-contain" /><strong>Tendencia</strong> — Guía con alta actividad reciente</li>
              <li className="flex items-center gap-2"><img src="/images/guides/badges/badge-completa.png" className="w-5 h-5 object-contain" /><strong>Completa</strong> — Guía exhaustiva que cubre el tema en profundidad</li>
            </ul>
          </span>
        ),
      },
      {
        q: '¿Cómo consigo un badge para mi guía?',
        a: 'No podés solicitarlos directamente. Los asigna un administrador o moderador cuando considera que la guía cumple los criterios. Publicar contenido de calidad, detallado y bien estructurado aumenta las chances de recibirlos.',
      },
      {
        q: '¿Los badges se pueden perder?',
        a: 'Sí. Un administrador puede retirar un badge si la guía queda desactualizada o deja de cumplir los estándares. El badge Tendencia especialmente puede ser rotado con mayor frecuencia.',
      },
    ],
  },
  {
    id: 'logros',
    title: 'Logros de Autores',
    icon: '🏆',
    faqs: [
      {
        q: '¿Qué son los logros?',
        a: 'Los logros son recompensas permanentes que ganás al alcanzar hitos como autor. Aparecen en tu perfil público y en tu dashboard. Cada logro otorga XP al desbloquearse.',
      },
      {
        q: '¿Cuáles son los logros disponibles y cómo se obtienen?',
        a: (
          <div className="space-y-2">
            {[
              { img: 'logro-primera-guia.png', title: 'Primera Misión', cond: 'Publicá tu primera guía', xp: 30 },
              { img: 'logro-5-guias.png',      title: 'Sensei',          cond: 'Publicá 5 guías',        xp: 75 },
              { img: 'logro-10-guias.png',     title: 'Crónicas Ninja',  cond: 'Publicá 10 guías',       xp: 150 },
              { img: 'logro-100-vistas.png',   title: '100 Vistas',      cond: 'Una sola guía tuya alcanza 100 vistas', xp: 50 },
              { img: 'logro-1000-vistas.png',  title: '1000 Vistas',     cond: 'Una sola guía tuya alcanza 1000 vistas', xp: 150 },
              { img: 'logro-votos.png',        title: 'Maestro del Conocimiento', cond: 'Una sola guía tuya recibe 100 votos útil', xp: 100 },
              { img: 'logro-badge-oficial.png', title: 'Sello del Hokage', cond: 'Una de tus guías recibe el badge Oficial (asignado por admin)', xp: 60 },
              { img: 'logro-leyenda.png',      title: 'Leyenda',          cond: 'Estar en el top 3 del leaderboard de autores (dinámico)', xp: '50 mientras se mantiene' },
            ].map(l => (
              <div key={l.title} className="flex items-start gap-3 p-2 rounded-lg bg-bg-elevated/50">
                <img src={`/images/guides/logros/${l.img}`} className="w-10 h-10 object-contain flex-shrink-0" />
                <div>
                  <p className="font-montserrat font-bold text-sm text-text-primary">{l.title}</p>
                  <p className="text-xs text-white/60">{l.cond}</p>
                  <p className="text-xs text-sage-gold mt-0.5">+{l.xp} XP</p>
                </div>
              </div>
            ))}
          </div>
        ),
      },
      {
        q: '¿Qué tiene de especial el logro Leyenda?',
        a: 'Es el único logro dinámico — se gana y se puede perder. Mientras estés en el top 3 del leaderboard de autores (por vistas totales), tenés el logro activo y recibís XP de bonus. Si otro autor te desplaza del top 3, perdés el logro y el XP de bonus se descuenta. Esto genera competencia real entre los mejores autores.',
      },
      {
        q: '¿Por qué los logros de vistas y votos son por guía individual y no en total?',
        a: 'Es intencional. Si fueran acumulados, publicar 10 guías mediocres con 10 vistas cada una valdría igual que una guía excelente con 100. Al medirlo por guía individual, se premia la calidad: tenés que crear algo que la comunidad realmente valore y comparta.',
      },
      {
        q: '¿Los logros se pueden perder?',
        a: 'Solo el logro Leyenda es reversible. El resto son permanentes — una vez ganados, no se pierden aunque borres las guías (el registro del logro ya quedó guardado).',
      },
    ],
  },
  {
    id: 'xp-niveles',
    title: 'XP y Niveles',
    icon: '⚡',
    faqs: [
      {
        q: '¿Cómo se gana XP?',
        a: (
          <div>
            <p className="mb-2">Las acciones que otorgan XP son:</p>
            <ul className="space-y-1 text-sm">
              <li className="flex justify-between"><span>Publicar una guía</span><span className="text-accent-orange font-bold">+50 XP</span></li>
              <li className="flex justify-between"><span>Comentar una guía</span><span className="text-accent-orange font-bold">+5 XP</span></li>
              <li className="flex justify-between"><span>Recibir un voto útil</span><span className="text-accent-orange font-bold">+10 XP</span></li>
              <li className="flex justify-between"><span>Recibir un badge en tu guía</span><span className="text-accent-orange font-bold">+25 XP</span></li>
              <li className="flex justify-between"><span>Desbloquear un logro</span><span className="text-accent-orange font-bold">+variable</span></li>
            </ul>
            <p className="mt-2 text-white/50 text-xs">Los valores exactos los configura el administrador y pueden cambiar.</p>
          </div>
        ),
      },
      {
        q: '¿Cuáles son los rangos y sus niveles?',
        a: (
          <div className="space-y-1">
            {[
              { rango: 'Genin',  color: 'text-nature-green',   niveles: '1 – 3',  xp: '0 – 499 XP' },
              { rango: 'Chūnin', color: 'text-chakra-blue',    niveles: '4 – 6',  xp: '500 – 1.999 XP' },
              { rango: 'Jōnin',  color: 'text-accent-orange',  niveles: '7 – 9',  xp: '2.000 – 6.499 XP' },
              { rango: 'Kage',   color: 'text-sage-gold',      niveles: '10',     xp: '6.500+ XP' },
            ].map(r => (
              <div key={r.rango} className="flex items-center justify-between p-2 rounded bg-bg-elevated/50">
                <span className={`font-cinzel font-bold ${r.color}`}>{r.rango}</span>
                <span className="text-xs text-white/50">Niveles {r.niveles}</span>
                <span className="text-xs text-white/40">{r.xp}</span>
              </div>
            ))}
            <p className="text-xs text-white/40 mt-1">Los umbrales exactos los puede ajustar el administrador desde el Back Office.</p>
          </div>
        ),
      },
      {
        q: '¿El XP y el nivel se pueden perder?',
        a: 'En general no. El único caso donde se pierde XP es al perder el logro Leyenda (salir del top 3 del leaderboard). El resto del XP es permanente.',
      },
    ],
  },
  {
    id: 'leaderboard',
    title: 'Leaderboard',
    icon: '🥇',
    faqs: [
      {
        q: '¿Cómo funciona el leaderboard de guías?',
        a: 'Tiene 5 vistas: Top General (puntaje combinado), Más Vistas, Trending (vistas en los últimos 7 días), Mejor Valoradas (votos útil) y Más Comentadas. El Top General combina vistas × 0.3 + comentarios × 0.4 + votos × 0.3.',
      },
      {
        q: '¿Cómo se calcula el leaderboard de autores?',
        a: 'Por puntaje combinado: vistas totales × 0.3 + comentarios totales × 0.3 + votos útil × 0.4. Se puede filtar por guías o por autores en la misma página.',
      },
      {
        q: '¿Con qué frecuencia se actualiza?',
        a: 'En tiempo real — cada vez que alguien ve una guía, vota o comenta, los datos se actualizan inmediatamente en la base de datos.',
      },
    ],
  },
  {
    id: 'notificaciones',
    title: 'Notificaciones',
    icon: '🔔',
    faqs: [
      {
        q: '¿Cuándo recibo notificaciones?',
        a: (
          <ul className="space-y-1 text-sm">
            <li>📝 Cuando alguien comenta una de tus guías</li>
            <li>🏅 Cuando un admin asigna un badge a una de tus guías</li>
            <li>🏆 Cuando desbloqueás un nuevo logro</li>
            <li>⚡ Cuando perdés el logro Leyenda (salís del top 3)</li>
          </ul>
        ),
      },
      {
        q: '¿Las notificaciones de comentario llegan por cada comentario?',
        a: 'No — para evitar spam, si ya tenés una notificación de comentario no leída para una guía, no se crea una nueva hasta que la leas. Una vez que la marcás como leída, el próximo comentario vuelve a notificarte.',
      },
      {
        q: '¿Cómo marco las notificaciones como leídas?',
        a: 'Haciendo click en el ✓ a la derecha de cada notificación, o usando el botón "Todo leído" en el header del panel. Las notificaciones marcadas como leídas no vuelven a aparecer resaltadas.',
      },
    ],
  },
]

function FAQItem({ faq }: { faq: FAQ }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-border/30 last:border-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full text-left py-4 flex items-start justify-between gap-4 group"
      >
        <span className="font-montserrat font-semibold text-sm text-text-primary group-hover:text-chakra-blue transition-colors leading-relaxed">
          {faq.q}
        </span>
        {open
          ? <ChevronUp className="w-4 h-4 text-white/40 flex-shrink-0 mt-0.5" />
          : <ChevronDown className="w-4 h-4 text-white/40 flex-shrink-0 mt-0.5" />
        }
      </button>
      {open && (
        <div className="pb-5 text-sm text-white/60 font-montserrat leading-relaxed">
          {faq.a}
        </div>
      )}
    </div>
  )
}

function SectionBlock({ section }: { section: Section }) {
  const [collapsed, setCollapsed] = useState(false)
  return (
    <div id={section.id} className="mb-8">
      <button
        onClick={() => setCollapsed(c => !c)}
        className="w-full flex items-center justify-between gap-3 mb-4 group"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{section.icon}</span>
          <h2 className="font-cinzel font-bold text-xl text-text-primary group-hover:text-chakra-blue transition-colors">
            {section.title}
          </h2>
          <span className="text-xs text-white/30 font-montserrat">{section.faqs.length} preguntas</span>
        </div>
        {collapsed
          ? <ChevronDown className="w-5 h-5 text-white/30" />
          : <ChevronUp className="w-5 h-5 text-white/30" />
        }
      </button>

      {!collapsed && (
        <div className="bg-bg-card border border-border/50 rounded-xl px-6 divide-y divide-border/20">
          {section.faqs.map((faq, i) => (
            <FAQItem key={i} faq={faq} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-bg-primary overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none z-0" style={{
        background: 'radial-gradient(ellipse at 50% 0%, rgba(0,128,255,0.04) 0%, transparent 60%)',
      }} />

      <Navbar />

      {/* Header */}
      <section className="relative pt-28 pb-10 px-6 border-b border-border/50">
        <div className="max-w-3xl mx-auto relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white/90 transition-colors mb-8">
            <ChevronLeft className="w-4 h-4" />
            Volver al inicio
          </Link>
          <p className="text-xs font-cinzel text-chakra-blue tracking-[0.2em] uppercase font-bold mb-3">
            Conocimiento Ninja
          </p>
          <h1 className="text-4xl md:text-5xl font-cinzel font-black text-text-primary mb-4">
            Preguntas Frecuentes
          </h1>
          <p className="text-white/50 font-montserrat leading-relaxed">
            Todo lo que necesitás saber sobre el sistema de guías, logros, badges, XP y niveles de la comunidad.
          </p>
        </div>
      </section>

      {/* Quick nav */}
      <section className="sticky top-20 z-20 bg-bg-primary/90 backdrop-blur-sm border-b border-border/30 px-6 py-3">
        <div className="max-w-3xl mx-auto flex gap-3 overflow-x-auto scrollbar-hide">
          {SECTIONS.map(s => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="flex-shrink-0 flex items-center gap-1.5 text-xs font-montserrat font-semibold px-3 py-1.5 rounded-full bg-bg-card border border-border hover:border-chakra-blue/50 text-white/60 hover:text-white transition-all"
            >
              <span>{s.icon}</span>
              {s.title}
            </a>
          ))}
        </div>
      </section>

      {/* Content */}
      <section className="py-10 px-6">
        <div className="max-w-3xl mx-auto relative z-10">
          {SECTIONS.map(section => (
            <SectionBlock key={section.id} section={section} />
          ))}

          {/* Footer note */}
          <div className="mt-6 p-5 rounded-xl border border-border/30 bg-bg-card/30 text-center">
            <p className="text-sm font-montserrat text-white/40">
              Esta página se actualiza automáticamente cuando se agregan nuevas funcionalidades.
              <br />
              ¿Tenés una pregunta que no está acá? Contactá a un administrador.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}

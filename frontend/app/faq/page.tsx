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

const RANGOS = [
  { rango: 'Genin',    color: 'text-nature-green',  desc: 'El comienzo del camino ninja',              img: '/images/rangos/genin.png' },
  { rango: 'Chūnin',  color: 'text-chakra-blue',   desc: 'Ninja con experiencia probada',              img: '/images/rangos/chunin.png' },
  { rango: 'Jōnin',   color: 'text-accent-orange', desc: 'Maestro con guías de alto impacto',         img: '/images/rangos/jonin.png' },
  { rango: 'Kage',    color: 'text-sage-gold',     desc: 'Leyenda de la comunidad',                   img: '/images/rangos/kage.png' },
  { rango: 'Akatsuki', color: 'text-power-red',    desc: 'Rango prestige — los más temidos del mundo ninja', img: '/images/rangos/akatsuki.png' },
]

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
        a: 'Cada persona cuenta como una vista única. El sistema detecta si ya visitaste una guía anteriormente y evita sumar vistas duplicadas, tanto para usuarios logueados como anónimos.',
      },
      {
        q: '¿Puedo votar cualquier guía?',
        a: 'Sí, cualquier usuario logueado puede votar "Útil" o "No útil" en cualquier guía. El voto es único por usuario por guía — si votás de nuevo, se cancela el voto anterior. No se puede votar sin iniciar sesión.',
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
            <ul className="mt-3 space-y-2 list-none">
              {[
                { img: 'badge-oficial.png',    label: 'Oficial',    desc: 'Guía aprobada y respaldada por la comunidad' },
                { img: 'badge-verificada.png', label: 'Verificada', desc: 'Información revisada y confirmada como correcta' },
                { img: 'badge-tendencia.png',  label: 'Tendencia',  desc: 'Guía con alta actividad reciente' },
                { img: 'badge-completa.png',   label: 'Completa',   desc: 'Guía exhaustiva que cubre el tema en profundidad' },
              ].map(b => (
                <li key={b.label} className="flex items-center gap-3 p-2 rounded-lg bg-bg-elevated/50">
                  <img src={`/images/guides/badges/${b.img}`} className="w-8 h-8 object-contain flex-shrink-0" />
                  <span><strong className="text-text-primary">{b.label}</strong> — {b.desc}</span>
                </li>
              ))}
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
        a: 'Sí. Un administrador puede retirar un badge si la guía queda desactualizada o deja de cumplir los estándares.',
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
        a: 'Los logros son recompensas que ganás al alcanzar hitos como autor de guías. Aparecen en tu perfil público y en tu dashboard personal. Cada logro otorga XP al desbloquearse.',
      },
      {
        q: '¿Cuáles son los logros disponibles y cómo se obtienen?',
        a: (
          <div className="space-y-2">
            {[
              { img: 'logro-primera-guia.png',  title: 'Primera Misión',          cond: 'Publicá tu primera guía' },
              { img: 'logro-5-guias.png',        title: 'Sensei',                  cond: 'Publicá 5 guías' },
              { img: 'logro-10-guias.png',       title: 'Crónicas Ninja',          cond: 'Publicá 10 guías' },
              { img: 'logro-100-vistas.png',     title: '100 Vistas',              cond: 'Una de tus guías alcanza las 100 vistas' },
              { img: 'logro-1000-vistas.png',    title: '1000 Vistas',             cond: 'Una de tus guías alcanza las 1000 vistas' },
              { img: 'logro-votos.png',          title: 'Maestro del Conocimiento', cond: 'Una de tus guías recibe 100 votos útil' },
              { img: 'logro-badge-oficial.png',  title: 'Sello del Hokage',        cond: 'Una de tus guías recibe el badge Oficial' },
              { img: 'logro-leyenda.png',        title: 'Leyenda',                 cond: 'Estar en el top 3 del leaderboard de autores' },
            ].map(l => (
              <div key={l.title} className="flex items-center gap-3 p-2.5 rounded-lg bg-bg-elevated/50">
                <img src={`/images/guides/logros/${l.img}`} className="w-10 h-10 object-contain flex-shrink-0" />
                <div>
                  <p className="font-montserrat font-bold text-sm text-text-primary">{l.title}</p>
                  <p className="text-xs text-white/60">{l.cond}</p>
                </div>
              </div>
            ))}
          </div>
        ),
      },
      {
        q: '¿Qué tiene de especial el logro Leyenda?',
        a: 'Es el único logro dinámico — se gana y se puede perder. Mientras estés en el top 3 del leaderboard de autores, tenés el logro activo y recibís XP de bonus. Si otro autor te desplaza del top 3, perdés el logro y el XP de bonus se descuenta. Esto genera competencia real entre los mejores autores.',
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
        a: 'Ganás XP realizando acciones en la comunidad: publicar guías, comentar, recibir votos útil en tus guías, recibir badges, y desbloquear logros. Los valores exactos son configurados por el administrador.',
      },
      {
        q: '¿Cuáles son los rangos?',
        a: (
          <div className="space-y-3">
            <p className="text-white/50 text-xs mb-3">
              Tu rango refleja tu nivel de contribución a la comunidad. Avanzás acumulando XP.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {RANGOS.map(r => (
                <div key={r.rango} className="flex items-center gap-3 p-3 rounded-xl bg-bg-elevated/50 border border-border/40">
                  <img src={r.img} alt={r.rango} className="w-12 h-12 object-contain flex-shrink-0" />
                  <div>
                    <p className={`font-cinzel font-bold text-sm ${r.color}`}>{r.rango}</p>
                    <p className="text-xs text-white/40 leading-tight">{r.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-white/30 mt-2">
              Los umbrales de XP por nivel son configurables por el administrador.
            </p>
          </div>
        ),
      },
      {
        q: '¿El XP y el nivel se pueden perder?',
        a: 'En general el XP es permanente. El único caso donde puede haber un ajuste de XP es al perder el logro Leyenda — si salís del top 3 del leaderboard, el bonus de XP asociado a ese logro se descuenta.',
      },
    ],
  },
  {
    id: 'leaderboard',
    title: 'Leaderboard',
    icon: '🥇',
    faqs: [
      {
        q: '¿Qué es el leaderboard de guías?',
        a: 'Es el ranking de las mejores guías de la comunidad. Podés verlo por distintos criterios: Top General, Más Vistas, Trending (últimos 7 días), Mejor Valoradas y Más Comentadas.',
      },
      {
        q: '¿Qué es el leaderboard de autores?',
        a: 'Ranquea a los usuarios que más aportan a la comunidad en base a la actividad total de sus guías: vistas, comentarios y votos útil recibidos. Es la base para el logro Leyenda.',
      },
      {
        q: '¿Con qué frecuencia se actualiza?',
        a: 'En tiempo real. Cada vista, voto o comentario nuevo se refleja inmediatamente.',
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
        <div className="max-w-3xl mx-auto flex gap-3 overflow-x-auto">
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

          <div className="mt-6 p-5 rounded-xl border border-border/30 bg-bg-card/30 text-center">
            <p className="text-sm font-montserrat text-white/40">
              Esta página se actualiza cuando se agregan nuevas funcionalidades.
              <br />
              ¿Tenés una pregunta que no está acá? Contactá a un administrador.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}

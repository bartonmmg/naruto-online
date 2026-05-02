'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft, BookOpen, Scroll, Plus, Eye, MessageSquare, Search, Trophy } from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'
import { Guide, CATEGORY_LABELS, DIFFICULTY_LABELS } from '@/lib/types'
import Navbar from '@/components/Navbar'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import LoadingSpinner from '@/components/LoadingSpinner'
import GuideBadges from '@/components/guides/GuideBadges'
import api from '@/lib/api'

export default function GuidesPage() {
  const router = useRouter()
  const { hasRole } = useAuth()
  const [guides, setGuides] = useState<Guide[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [selectedDifficulty, setSelectedDifficulty] = useState('Todos')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('recientes')

  useEffect(() => {
    const fetchGuides = async () => {
      try {
        const response = await api.get('/guides')
        setGuides(response.data)
      } catch (error) {
        console.error('Error fetching guides:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchGuides()
  }, [])

  const categories = ['Todos', ...Object.values(CATEGORY_LABELS)]
  const difficulties = ['Todos', ...Object.values(DIFFICULTY_LABELS)]

  // Filter by category, difficulty, search, and visibility (hide DRAFT from non-admin users)
  const filteredGuides = useMemo(() => {
    if (!Array.isArray(guides)) return []

    let result = guides
      .filter(g => selectedCategory === 'Todos' || g.category === Object.keys(CATEGORY_LABELS).find(k => CATEGORY_LABELS[k] === selectedCategory))
      .filter(g => selectedDifficulty === 'Todos' || g.difficulty === Object.keys(DIFFICULTY_LABELS).find(k => DIFFICULTY_LABELS[k] === selectedDifficulty))
      .filter(g => g.status === 'PUBLISHED' || hasRole(['ADMIN', 'MODERATOR']))
      .filter(g => {
        if (!searchTerm) return true
        const search = searchTerm.toLowerCase()
        return (
          g.title.toLowerCase().includes(search) ||
          g.author.username.toLowerCase().includes(search)
        )
      })

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'vistas') {
        return (b.viewCount || 0) - (a.viewCount || 0)
      } else if (sortBy === 'valoracion') {
        const aRating = (a._count?.ratings || 0) + (a._count?.comments || 0)
        const bRating = (b._count?.ratings || 0) + (b._count?.comments || 0)
        return bRating - aRating
      } else {
        // recientes
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

    return result
  }, [guides, selectedCategory, selectedDifficulty, searchTerm, sortBy, hasRole])

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'BASICO':
        return 'bg-nature-green/20 text-nature-green border-nature-green/30'
      case 'INTERMEDIO':
        return 'bg-sage-gold/20 text-sage-gold border-sage-gold/30'
      case 'AVANZADO':
        return 'bg-power-red/20 text-power-red border-power-red/30'
      default:
        return 'bg-white/10 text-white/70 border-white/20'
    }
  }

  return (
    <main className="min-h-screen bg-bg-primary overflow-x-hidden" style={{
      backgroundImage: 'url(/images/bg/guias.png), linear-gradient(rgba(0, 128, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 128, 255, 0.03) 1px, transparent 1px)',
      backgroundPosition: 'center, 0, 0',
      backgroundSize: 'cover, 40px 40px, 40px 40px',
      backgroundAttachment: 'fixed, scroll, scroll',
    }}>
      <div className="fixed inset-0 bg-bg-primary/70 pointer-events-none z-0" />

      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-1">
        <div className="absolute top-0 left-1/3 w-96 h-96 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, rgba(0,128,255,0.15) 0%, transparent 70%)' }} />
      </div>

      <Navbar />

      {/* Hero Section */}
      <section className="relative py-20 px-6 border-b border-border/50">
        <div className="max-w-6xl mx-auto relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white/90 transition-colors mb-8">
            <ChevronLeft className="w-4 h-4" />
            Volver al inicio
          </Link>

          <div className="mb-12 flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs font-cinzel text-chakra-blue tracking-[0.2em] uppercase font-bold mb-4">
                Conocimiento Ninja
              </p>
              <h1 className="text-5xl md:text-6xl font-cinzel font-black text-text-primary leading-tight mb-6">
                Guías Estratégicas
              </h1>
              <p className="text-white/70 max-w-2xl text-base leading-relaxed">
                Aprende de los mejores ninjas de la comunidad. Guías detalladas, estrategias probadas
                y tips exclusivos para dominar cada aspecto del juego.
              </p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0 ml-4">
              <Link
                href="/guides/leaderboard"
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-sage-gold/40 bg-sage-gold/10 text-sage-gold hover:bg-sage-gold/20 transition-all font-montserrat font-semibold text-sm"
              >
                <Trophy className="w-4 h-4" />
                Leaderboard
              </Link>
              {hasRole(['ADMIN', 'MODERATOR']) && (
                <Link href="/guides/create">
                  <Button className="gap-2">
                    <Plus className="w-5 h-5" />
                    Nueva Guía
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-3 mb-6">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg font-montserrat font-semibold text-sm transition-all duration-200 ${
                  selectedCategory === cat
                    ? 'bg-chakra-blue text-white shadow-lg shadow-chakra-blue/30'
                    : 'bg-bg-card border border-border hover:border-chakra-blue/50 text-white/70 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search, Difficulty, and Sort */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Buscar por título o autor..."
                className="w-full pl-10 pr-4 py-2.5 bg-bg-card border border-border rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-chakra-blue"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <select
                  value={selectedDifficulty}
                  onChange={e => setSelectedDifficulty(e.target.value)}
                  className="w-full px-4 py-2.5 bg-bg-card border border-border rounded-lg text-white focus:outline-none focus:border-chakra-blue"
                >
                  {difficulties.map(diff => (
                    <option key={diff} value={diff}>
                      Dificultad: {diff}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-1">
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="w-full px-4 py-2.5 bg-bg-card border border-border rounded-lg text-white focus:outline-none focus:border-chakra-blue"
                >
                  <option value="recientes">Más recientes</option>
                  <option value="vistas">Más vistas</option>
                  <option value="valoracion">Mejor valoradas</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Guides Grid */}
      <section className="py-20 px-6 relative">
        <div className="max-w-6xl mx-auto relative z-10">
          {loading ? (
            <LoadingSpinner message="Cargando guías" size="md" />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGuides.map(guide => (
                  <div
                    key={guide.id}
                    onClick={() => router.push(`/guides/${guide.id}`)}
                    className="group game-card p-6 rounded-xl transition-all duration-300 hover:border-chakra-blue/50 hover:shadow-lg hover:shadow-chakra-blue/20 cursor-pointer"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-lg bg-bg-elevated flex items-center justify-center group-hover:scale-110 transition-transform border border-border">
                        <img
                          src="/images/tools/shuriken.png"
                          alt={guide.title}
                          className="w-7 h-7 object-contain"
                        />
                      </div>
                      <div className="flex gap-2 items-center flex-wrap justify-end">
                        {guide.status === 'DRAFT' && (
                          <span className="text-xs font-montserrat font-semibold px-2 py-1 rounded-full bg-sage-gold/20 text-sage-gold border border-sage-gold/30">
                            Borrador
                          </span>
                        )}
                        {guide.badges && guide.badges.length > 0 && (
                          <GuideBadges badges={guide.badges} size="sm" />
                        )}
                        <span className={`text-xs font-cinzel px-3 py-1 rounded-full border ${getDifficultyColor(guide.difficulty)}`}>
                          {DIFFICULTY_LABELS[guide.difficulty] || guide.difficulty}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <h3 className="text-lg font-montserrat font-bold mb-2 text-text-primary group-hover:text-chakra-blue transition-colors">
                      {guide.title}
                    </h3>
                    <p className="text-sm text-white/70 leading-relaxed mb-6 line-clamp-2">
                      {guide.content
                        .replace(/<[^>]*>/g, '') // Elimina etiquetas HTML
                        .replace(/&nbsp;/g, ' ') // Reemplaza &nbsp; con espacios
                        .replace(/&lt;/g, '<') // Reemplaza &lt;
                        .replace(/&gt;/g, '>') // Reemplaza &gt;
                        .replace(/&amp;/g, '&') // Reemplaza &amp;
                        .substring(0, 100)
                        .trim()}...
                    </p>

                    {/* Footer */}
                    <div className="space-y-3 pt-4 border-t border-border/50">
                      <div className="flex items-center gap-3 text-xs text-white/50">
                        <Link href={`/users/${guide.author.username}`} onClick={e => e.stopPropagation()} className="hover:text-chakra-blue transition-colors">
                          @{guide.author.username}
                        </Link>
                        <span className="inline-flex items-center gap-1">
                          <Scroll className="w-3 h-3" />
                          {CATEGORY_LABELS[guide.category] || guide.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-white/40">
                        <span className="inline-flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {guide.viewCount || 0} vistas
                        </span>
                        {(guide._count?.comments || 0) > 0 && (
                          <span className="inline-flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            {guide._count?.comments} comentarios
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredGuides.length === 0 && (
                <div className="text-center py-20">
                  <BookOpen className="w-16 h-16 text-white/30 mx-auto mb-4" />
                  <p className="text-white/70 font-montserrat">No hay guías en esta categoría todavía.</p>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 border-t border-border/50 relative">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-cinzel font-black text-text-primary mb-6">
            ¿No encuentras lo que buscas?
          </h2>
          <p className="text-white/70 mb-8">
            Únete a nuestra comunidad en Discord para pedir nuevas guías y compartir tus propias estrategias.
          </p>
          <Link
            href="/"
            className="group inline-flex items-center gap-2 px-8 py-3.5 text-base font-montserrat font-bold text-white bg-gradient-to-r from-chakra-blue to-cyan-500 rounded-lg hover:shadow-lg hover:shadow-chakra-blue/30 transition-all duration-300 hover:scale-105 active:scale-95 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative z-10">Explorar más</span>
          </Link>
        </div>
      </section>
    </main>
  )
}

'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, Ticket, Calendar, CheckCircle2, Circle, AlertCircle, TrendingUp } from 'lucide-react'
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, LineChart, Line,
} from 'recharts'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import {
  calcularTotalDias,
  calcularTodosCupones,
  validarRangoFechas,
  obtenerEvento,
  type EventoSeleccionado,
} from '@/lib/cupones/calculator'
import { EVENTOS } from '@/lib/cupones/constants'

function obtenerFechaDefecto(offset: number): string {
  const hoy = new Date()
  hoy.setDate(hoy.getDate() + offset)
  return hoy.toISOString().split('T')[0]
}

// Colores para el gráfico (Akatsuki theme)
const COLORES_CHART = [
  '#C41E3A', // Rojo Akatsuki
  '#FF6B35', // Naranja
  '#F7931E', // Gold
  '#00A8CC', // Azul
  '#005082', // Azul oscuro
  '#6A0DAD', // Púrpura
  '#00AA44', // Verde
  '#FFB703', // Amarillo
  '#FB5607', // Rojo fuego
  '#FFBE0B', // Oro
]

export default function CouponCalculatorPage() {
  const [fechaInicio, setFechaInicio] = useState(obtenerFechaDefecto(0))
  const [fechaFin, setFechaFin] = useState(obtenerFechaDefecto(30))
  const [eventosSeleccionados, setEventosSeleccionados] = useState<Map<string, EventoSeleccionado>>(
    new Map(EVENTOS.map(e => [e.id, { eventoId: e.id, activo: false, inputValue: undefined }]))
  )

  // Validar fechas
  const validacion = useMemo(
    () => validarRangoFechas(fechaInicio, fechaFin),
    [fechaInicio, fechaFin]
  )

  // Calcular resultado
  const resumen = useMemo(() => {
    if (!validacion.valido) return null
    try {
      return calcularTodosCupones(new Date(fechaInicio), new Date(fechaFin), eventosSeleccionados)
    } catch (error) {
      return null
    }
  }, [fechaInicio, fechaFin, eventosSeleccionados, validacion])

  // Handlers
  const toggleEvento = (eventoId: string) => {
    const nuevo = new Map(eventosSeleccionados)
    const actual = nuevo.get(eventoId)
    if (actual) {
      nuevo.set(eventoId, { ...actual, activo: !actual.activo })
      setEventosSeleccionados(nuevo)
    }
  }

  const actualizarInputEvento = (eventoId: string, valor: number) => {
    const nuevo = new Map(eventosSeleccionados)
    const actual = nuevo.get(eventoId)
    if (actual) {
      nuevo.set(eventoId, { ...actual, inputValue: valor })
      setEventosSeleccionados(nuevo)
    }
  }

  const seleccionarTodos = () => {
    const nuevo = new Map(eventosSeleccionados)
    nuevo.forEach(e => (e.activo = true))
    setEventosSeleccionados(nuevo)
  }

  const deseleccionarTodos = () => {
    const nuevo = new Map(eventosSeleccionados)
    nuevo.forEach(e => (e.activo = false))
    setEventosSeleccionados(nuevo)
  }

  // Datos para gráficos
  const datosGraficos = useMemo(() => {
    if (!resumen) return null

    // Agrupar por tipo de evento para pie chart
    const porTipo: Record<string, number> = {}
    const detalleEventos: Array<{ nombre: string; cupones: number }> = []

    resumen.resultados.forEach(resultado => {
      if (!resultado.activo) return
      const evento = obtenerEvento(resultado.eventoId)
      if (!evento) return

      // Agrupar por tipo
      if (!porTipo[evento.tipo]) {
        porTipo[evento.tipo] = 0
      }
      porTipo[evento.tipo] += resultado.total

      // Detalle individual
      if (resultado.total > 0) {
        detalleEventos.push({
          nombre: resultado.nombre,
          cupones: resultado.total,
        })
      }
    })

    // Convertir a array para recharts
    const dataPie = Object.entries(porTipo).map(([tipo, cupones]) => ({
      name: tipo.charAt(0).toUpperCase() + tipo.slice(1),
      value: cupones,
    }))

    // Ordenar detalle por cupones desc
    detalleEventos.sort((a, b) => b.cupones - a.cupones)

    // Timeline: cupones por día (simulado)
    const dataTimeline: Array<{ dia: number; cupones: number; acumulado: number }> = []
    let acumulado = 0
    const diasTotales = Math.min(resumen.totalDias, 31) // Mostrar max 31 días para legibilidad

    for (let dia = 1; dia <= diasTotales; dia++) {
      // Simular: promedio de cupones/día
      const cuponesDelDia = Math.floor(resumen.totalCupones / resumen.totalDias)
      acumulado += cuponesDelDia
      dataTimeline.push({ dia, cupones: cuponesDelDia, acumulado })
    }

    return {
      dataPie,
      detalleEventos,
      dataTimeline,
    }
  }, [resumen])

  return (
    <div className="min-h-screen bg-bg-primary grid-bg flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-bg-primary/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="text-power-red/70 text-lg font-cinzel group-hover:text-power-red transition-colors leading-none">
              忍
            </span>
            <span className="font-cinzel font-black text-sm tracking-[0.2em] text-text-muted group-hover:text-power-red transition-colors">
              HD<span className="text-power-red">RV</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs text-text-dim font-cinzel">{resumen?.eventosActivos ?? 0} eventos</span>
            <Link href="/tools" className="text-xs text-text-dim hover:text-power-red transition-colors font-cinzel">
              ← Atrás
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8 flex-1">
        {/* Título */}
        <div className="mb-8">
          <p className="text-xs font-cinzel text-text-dim tracking-widest mb-2">HERRAMIENTAS</p>
          <h1 className="text-3xl font-cinzel font-black text-text-primary mb-2">
            Calculadora de <span className="text-power-red">Cupones</span>
          </h1>
          <p className="text-sm text-text-muted">
            Selecciona tu rango de fechas y los eventos que completarás para calcular tus cupones totales
          </p>
        </div>

        {/* Selector de fechas */}
        <div className="game-card game-card-red p-6 rounded-xl mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4 text-power-red" />
            <h2 className="font-cinzel font-bold text-text-primary">Rango de fechas</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Fecha de inicio"
              type="date"
              value={fechaInicio}
              onChange={e => setFechaInicio(e.target.value)}
            />
            <Input
              label="Fecha de fin"
              type="date"
              value={fechaFin}
              onChange={e => setFechaFin(e.target.value)}
            />
            <div className="flex flex-col justify-end">
              <div className="bg-bg-elevated rounded-lg px-4 py-2.5 text-center">
                <p className="text-xs text-text-dim mb-1">Total de días</p>
                <p className="text-2xl font-cinzel font-black text-power-red">
                  {resumen?.totalDias ?? 0}
                </p>
              </div>
            </div>
          </div>

          {!validacion.valido && (
            <div className="flex items-start gap-2 mt-4 p-3 bg-power-red/10 border border-power-red/20 rounded-lg">
              <AlertCircle className="w-4 h-4 text-power-red shrink-0 mt-0.5" />
              <p className="text-xs text-power-red">{validacion.error}</p>
            </div>
          )}
        </div>

        {/* Controles rápidos */}
        {validacion.valido && (
          <div className="flex gap-2 mb-8">
            <Button variant="outline" size="sm" onClick={seleccionarTodos}>
              Seleccionar todos
            </Button>
            <Button variant="outline" size="sm" onClick={deseleccionarTodos}>
              Deseleccionar todos
            </Button>
          </div>
        )}

        {/* GRÁFICOS */}
        {validacion.valido && resumen && datosGraficos && resumen.totalCupones > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Pie Chart — Distribución por tipo */}
            <div className="game-card game-card-red p-6 rounded-xl">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-5 h-5 text-power-red" />
                <h2 className="font-cinzel font-bold text-text-primary">Distribución por Tipo</h2>
              </div>
              {datosGraficos.dataPie.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={datosGraficos.dataPie}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value.toLocaleString()}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {datosGraficos.dataPie.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORES_CHART[index % COLORES_CHART.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: '#0E0E0E', border: '1px solid #1E1E1E', borderRadius: '8px' }}
                      labelStyle={{ color: '#F0F0F0' }}
                      formatter={(value) => (typeof value === 'number' ? value.toLocaleString() : value)}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-text-dim">
                  Selecciona eventos para ver gráfico
                </div>
              )}
            </div>

            {/* Bar Chart — Top 10 Eventos */}
            <div className="game-card game-card-red p-6 rounded-xl">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-5 h-5 text-power-red" />
                <h2 className="font-cinzel font-bold text-text-primary">Top Eventos</h2>
              </div>
              {datosGraficos.detalleEventos.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={datosGraficos.detalleEventos.slice(0, 8)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                    <XAxis dataKey="nombre" tick={{ fontSize: 12, fill: '#666666' }} angle={-45} textAnchor="end" height={100} />
                    <YAxis tick={{ fill: '#666666' }} />
                    <Tooltip
                      contentStyle={{ background: '#0E0E0E', border: '1px solid #1E1E1E', borderRadius: '8px' }}
                      labelStyle={{ color: '#F0F0F0' }}
                      formatter={(value) => (typeof value === 'number' ? value.toLocaleString() : value)}
                    />
                    <Bar dataKey="cupones" fill="#C41E3A" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-text-dim">
                  Selecciona eventos para ver gráfico
                </div>
              )}
            </div>

            {/* Timeline — Acumulado por día */}
            <div className="lg:col-span-2 game-card game-card-red p-6 rounded-xl">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-5 h-5 text-power-red" />
                <h2 className="font-cinzel font-bold text-text-primary">Progresión de Cupones (por día)</h2>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={datosGraficos.dataTimeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                  <XAxis dataKey="dia" tick={{ fill: '#666666' }} label={{ value: 'Día', position: 'insideBottomRight', offset: -5 }} />
                  <YAxis tick={{ fill: '#666666' }} label={{ value: 'Cupones', angle: -90, position: 'insideLeft' }} />
                  <Tooltip
                    contentStyle={{ background: '#0E0E0E', border: '1px solid #1E1E1E', borderRadius: '8px' }}
                    labelStyle={{ color: '#F0F0F0' }}
                    formatter={(value) => (typeof value === 'number' ? value.toLocaleString() : value)}
                  />
                  <Legend wrapperStyle={{ color: '#F0F0F0' }} />
                  <Line type="monotone" dataKey="cupones" stroke="#FF6B35" name="Cupones/día" strokeWidth={2} />
                  <Line type="monotone" dataKey="acumulado" stroke="#C41E3A" name="Acumulado" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Tabla de eventos */}
        {validacion.valido && resumen && (
          <div className="space-y-3 mb-20">
            {resumen.resultados.map(resultado => {
              const evento = obtenerEvento(resultado.eventoId)
              const seleccionado = eventosSeleccionados.get(resultado.eventoId)
              const activo = seleccionado?.activo ?? false

              if (!evento) return null

              return (
                <div
                  key={resultado.eventoId}
                  className={`game-card rounded-xl p-4 transition-all duration-200 cursor-pointer ${
                    activo
                      ? 'bg-power-red/8 border-power-red/40 game-card-red'
                      : 'bg-bg-card border-border hover:border-border-light'
                  }`}
                  onClick={() => toggleEvento(resultado.eventoId)}
                >
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <div className="mt-1 flex-shrink-0">
                      {activo ? (
                        <CheckCircle2 className="w-5 h-5 text-power-red" />
                      ) : (
                        <Circle className="w-5 h-5 text-text-dim" />
                      )}
                    </div>

                    {/* Contenido principal */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 mb-1">
                        <h3 className="font-cinzel font-bold text-text-primary">{resultado.nombre}</h3>
                        {resultado.diasDisponibles > 0 && (
                          <span className="text-xs text-text-dim font-cinzel">
                            {resultado.diasDisponibles}d
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-text-muted mb-2">{resultado.detalles}</p>

                      {/* Input si es necesario */}
                      {evento.requiereInput && (
                        <div className="flex gap-2 items-end mb-2">
                          <Input
                            label={evento.inputLabel}
                            type="number"
                            min="0"
                            value={seleccionado?.inputValue ?? ''}
                            onChange={e =>
                              actualizarInputEvento(resultado.eventoId, parseInt(e.target.value) || 0)
                            }
                            onClick={e => e.stopPropagation()}
                            className="w-20"
                          />
                          <span className="text-xs text-text-dim font-cinzel mb-2">
                            {seleccionado?.inputValue
                              ? `→ ${resultado.valorUnitario} cupones${evento.inputLabel !== 'Posición en ranking' ? '/día' : ''}`
                              : ''}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Total a la derecha */}
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-cinzel font-black text-text-muted">
                        {resultado.total.toLocaleString()}
                      </p>
                      <p className="text-xs text-text-dim">cupones</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {!validacion.valido && (
          <div className="flex flex-col items-center justify-center py-20">
            <AlertCircle className="w-12 h-12 text-text-dim mb-4 opacity-50" />
            <p className="text-text-dim text-center">{validacion.error}</p>
          </div>
        )}
      </div>

      {/* Sticky footer — Total */}
      {validacion.valido && resumen && (
        <footer className="fixed bottom-0 left-0 right-0 bg-bg-primary border-t border-border/50 shadow-2xl">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-text-dim font-cinzel tracking-widest mb-1">TOTAL</p>
              <p className="text-3xl font-cinzel font-black text-power-red">
                {resumen.totalCupones.toLocaleString()}
              </p>
              <p className="text-xs text-text-dim">cupones en {resumen.totalDias} días</p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" size="md" asChild>
                <Link href="/tools">
                  <ChevronLeft className="w-4 h-4" />
                  Atrás
                </Link>
              </Button>
              <Button variant="ghost" size="md" asChild>
                <Link href="/dashboard">
                  <Ticket className="w-4 h-4" />
                  Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </footer>
      )}
    </div>
  )
}

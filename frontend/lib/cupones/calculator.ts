/**
 * Lógica de cálculo de cupones
 * Maneja todas las reglas: días disponibles, cálculos, lookups
 */

import {
  Evento,
  EVENTOS,
  DIAS_SEMANA_NUMS,
  obtenerValorArbolDeseos,
  obtenerValorRuletaClan,
  obtenerValorArenaDuelo,
  ILUSION_BASICO_LOOKUP,
} from './constants'

export interface EventoSeleccionado {
  eventoId: string
  activo: boolean
  inputValue?: number // Para eventos que requieren input (nivel, posición, etc.)
}

export interface CalculoResultado {
  eventoId: string
  nombre: string
  activo: boolean
  diasDisponibles: number
  valorUnitario: number
  total: number
  detalles: string
}

export interface ResumenCalculadora {
  fechaInicio: Date
  fechaFin: Date
  totalDias: number
  resultados: CalculoResultado[]
  totalCupones: number
  eventosActivos: number
}

/**
 * Calcula la cantidad de días entre dos fechas (inclusive)
 */
export function calcularTotalDias(fechaInicio: Date, fechaFin: Date): number {
  const inicio = new Date(fechaInicio)
  const fin = new Date(fechaFin)
  inicio.setHours(0, 0, 0, 0)
  fin.setHours(0, 0, 0, 0)

  if (fin < inicio) return 0

  const diffTime = Math.abs(fin.getTime() - inicio.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays + 1 // +1 para incluir ambos días
}

/**
 * Cuenta ocurrencias de un día específico de la semana en el rango
 * diasEspecificos: array de índices (0=lunes, 6=domingo)
 */
export function contarOcurrenciasDias(
  fechaInicio: Date,
  fechaFin: Date,
  diasEspecificos: number[]
): number {
  const inicio = new Date(fechaInicio)
  const fin = new Date(fechaFin)
  inicio.setHours(0, 0, 0, 0)
  fin.setHours(0, 0, 0, 0)

  if (fin < inicio) return 0

  let count = 0
  const actual = new Date(inicio)

  while (actual <= fin) {
    const diaSemana = actual.getDay()
    // Convertir: JS getDay() usa 0=domingo, 1=lunes... nosotros usamos 0=lunes
    const diaAjustado = diaSemana === 0 ? 6 : diaSemana - 1

    if (diasEspecificos.includes(diaAjustado)) {
      count++
    }

    actual.setDate(actual.getDate() + 1)
  }

  return count
}

/**
 * Calcula días disponibles para un evento según su tipo
 */
export function calcularDiasDisponibles(
  evento: Evento,
  fechaInicio: Date,
  fechaFin: Date
): number {
  if (!evento.diasDisponibles) return 0

  switch (evento.diasDisponibles) {
    case 'todos':
      // Todos los días entre fecha inicio y fin
      return calcularTotalDias(fechaInicio, fechaFin)

    case 'fijos':
      // Cantidad fija (no depende de fechas)
      return evento.cantidadFija ?? 0

    case 'especifico':
      // Días específicos de la semana (ej: miércoles y viernes)
      if (!evento.diasEspecificos) return 0
      return contarOcurrenciasDias(fechaInicio, fechaFin, evento.diasEspecificos)

    case 'lookup':
      // Depende de datos externos (no aplica aquí, se maneja en cálculo)
      return 0

    default:
      return 0
  }
}

/**
 * Calcula el valor unitario de un evento
 * Puede ser el valorBase o un lookup según el tipo
 */
export function calcularValorUnitario(evento: Evento, inputValue?: number | string): number {
  // Si es un evento con lookup y el usuario proporciona un valor
  if (evento.tablaLookup && inputValue !== undefined && inputValue !== null && inputValue !== '') {
    switch (evento.tablaLookup) {
      case 'arbolDeseos':
        return obtenerValorArbolDeseos(Number(inputValue))
      case 'ruletaClan':
        return obtenerValorRuletaClan(Number(inputValue))
      case 'arenaDuelo':
        return obtenerValorArenaDuelo(String(inputValue))
      case 'ilusion':
        // Para ilusión, si es string (rango), buscar en tabla
        if (typeof inputValue === 'string') {
          return 800 // Valor por defecto (A prueba = 80 cupones/semana, pero esto es por ocurrencia)
        }
        return obtenerValorRuletaClan(Number(inputValue))
      default:
        return evento.valorBase
    }
  }

  return evento.valorBase
}

/**
 * Calcula el total de cupones para un evento específico
 */
export function calcularEventoTotal(
  evento: Evento,
  fechaInicio: Date,
  fechaFin: Date,
  inputValue?: number
): CalculoResultado {
  const diasDisponibles = calcularDiasDisponibles(evento, fechaInicio, fechaFin)
  const valorUnitario = calcularValorUnitario(evento, inputValue)
  const total = diasDisponibles * valorUnitario

  let detalles = ''
  if (evento.tablaLookup && inputValue !== undefined) {
    detalles = `${inputValue} × ${valorUnitario} cupones/día × ${diasDisponibles} días`
  } else if (diasDisponibles > 0 && evento.valorBase > 0) {
    if (diasDisponibles === 1) {
      detalles = `${evento.valorBase} cupones (1 vez)`
    } else {
      detalles = `${evento.valorBase} cupones/día × ${diasDisponibles} días`
    }
  }

  return {
    eventoId: evento.id,
    nombre: evento.nombre,
    activo: false,
    diasDisponibles,
    valorUnitario,
    total,
    detalles,
  }
}

/**
 * Calcula todos los eventos en el rango dado
 */
export function calcularTodosCupones(
  fechaInicio: Date,
  fechaFin: Date,
  eventosSeleccionados: Map<string, EventoSeleccionado>
): ResumenCalculadora {
  const totalDias = calcularTotalDias(fechaInicio, fechaFin)

  const resultados: CalculoResultado[] = EVENTOS.map(evento => {
    const seleccionado = eventosSeleccionados.get(evento.id)
    const activo = seleccionado?.activo ?? false
    const inputValue = seleccionado?.inputValue

    const resultado = calcularEventoTotal(evento, fechaInicio, fechaFin, inputValue)
    resultado.activo = activo

    return resultado
  })

  const totalCupones = resultados
    .filter(r => r.activo)
    .reduce((sum, r) => sum + r.total, 0)

  const eventosActivos = resultados.filter(r => r.activo).length

  return {
    fechaInicio,
    fechaFin,
    totalDias,
    resultados,
    totalCupones,
    eventosActivos,
  }
}

/**
 * Helper: obtiene un evento por ID
 */
export function obtenerEvento(id: string): Evento | undefined {
  return EVENTOS.find(e => e.id === id)
}

/**
 * Helper: valida un rango de fechas
 */
export function validarRangoFechas(fechaInicio: string, fechaFin: string): { valido: boolean; error?: string } {
  if (!fechaInicio || !fechaFin) {
    return { valido: false, error: 'Ambas fechas son requeridas' }
  }

  const inicio = new Date(fechaInicio)
  const fin = new Date(fechaFin)

  if (isNaN(inicio.getTime())) {
    return { valido: false, error: 'Fecha de inicio inválida' }
  }

  if (isNaN(fin.getTime())) {
    return { valido: false, error: 'Fecha de fin inválida' }
  }

  if (fin < inicio) {
    return { valido: false, error: 'La fecha final no puede ser anterior a la inicial' }
  }

  const maxDias = 365
  if (calcularTotalDias(inicio, fin) > maxDias) {
    return { valido: false, error: `El rango no puede exceder ${maxDias} días` }
  }

  return { valido: true }
}

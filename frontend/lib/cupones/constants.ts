/**
 * Calculadora de Cupones - Naruto Online
 * Constantes y definiciones de eventos, tablas de referencia y reglas
 */

export type EventoTipo = 'diario' | 'semanal' | 'mensual' | 'unico' | 'competitivo' | 'limitado' | 'compra'

export interface Evento {
  id: string
  nombre: string
  descripcion: string
  tipo: EventoTipo
  valorBase: number
  diasDisponibles: 'todos' | 'fijos' | 'especifico' | 'lookup' | null
  cantidadFija?: number // Para eventos "fijos" (ej: 6 días, 30 días, 7 días)
  diasEspecificos?: number[] // Índice de día de semana (0=lunes, 6=domingo) para semanales
  requiereInput?: boolean // Si el usuario debe ingresar un valor (nivel, posición, etc.)
  inputLabel?: string // Label para el input (ej: "Nivel", "Posición")
  tablaLookup?: string // Nombre de la tabla de referencia (ej: "arbolDeseos", "arenaDuelo")
  notas?: string
}

// ─────────────────────────────────────────────────────────────
// EVENTOS
// ─────────────────────────────────────────────────────────────

export const EVENTOS: Evento[] = [
  {
    id: 'registro_mensual',
    nombre: 'Registro mensual',
    descripcion: 'Evento mensual único',
    tipo: 'mensual',
    valorBase: 250,
    diasDisponibles: 'fijos',
    cantidadFija: 1,
  },
  {
    id: 'captura_animal',
    nombre: 'Captura animal',
    descripcion: 'Evento semanal',
    tipo: 'semanal',
    valorBase: 80,
    diasDisponibles: 'especifico',
    diasEspecificos: [2, 4], // miércoles (2) y viernes (4)
  },
  {
    id: 'online_60min',
    nombre: 'Online 60 minutos',
    descripcion: 'Actividad diaria',
    tipo: 'diario',
    valorBase: 10,
    diasDisponibles: 'todos',
  },
  {
    id: 'puzzle_semanal',
    nombre: 'Puzzle semanal',
    descripcion: 'Evento semanal',
    tipo: 'semanal',
    valorBase: 60,
    diasDisponibles: 'especifico',
    diasEspecificos: [1, 5], // martes (1) y sábado (5)
  },
  {
    id: 'arbol_deseos',
    nombre: 'Árbol de deseos',
    descripcion: 'Progresión por nivel',
    tipo: 'diario',
    valorBase: 0, // Depende del nivel
    diasDisponibles: 'todos',
    requiereInput: true,
    inputLabel: 'Nivel',
    tablaLookup: 'arbolDeseos',
  },
  {
    id: 'escoltas_diarias',
    nombre: '2 Escoltas Diarias',
    descripcion: 'Actividad diaria',
    tipo: 'diario',
    valorBase: 80,
    diasDisponibles: 'todos',
  },
  {
    id: 'saqueo_diario',
    nombre: '1 Saqueo Diario',
    descripcion: 'Actividad diaria',
    tipo: 'diario',
    valorBase: 50,
    diasDisponibles: 'todos',
  },
  {
    id: 'monedero_500',
    nombre: 'Monedero de 500',
    descripcion: 'Compra de evento',
    tipo: 'compra',
    valorBase: 500,
    diasDisponibles: 'fijos',
    cantidadFija: 6,
  },
  {
    id: 'monedero_1000',
    nombre: 'Monedero de 1000',
    descripcion: 'Compra de evento',
    tipo: 'compra',
    valorBase: 800,
    diasDisponibles: 'fijos',
    cantidadFija: 6,
  },
  {
    id: 'monedero_5000',
    nombre: 'Monedero de 5000',
    descripcion: 'Compra de evento',
    tipo: 'compra',
    valorBase: 4250,
    diasDisponibles: 'fijos',
    cantidadFija: 6,
  },
  {
    id: 'monedero_9000',
    nombre: 'Monedero de 9000',
    descripcion: 'Compra de evento',
    tipo: 'compra',
    valorBase: 7500,
    diasDisponibles: 'fijos',
    cantidadFija: 6,
  },
  {
    id: 'ilusion_basico',
    nombre: 'Ilusión - Básico',
    descripcion: 'Evento semanal competitivo',
    tipo: 'competitivo',
    valorBase: 0,
    diasDisponibles: 'especifico',
    diasEspecificos: [3], // jueves (3)
    requiereInput: true,
    inputLabel: 'Rango ninja',
    tablaLookup: 'ilusion',
  },
  {
    id: 'ruleta_clan',
    nombre: 'Ruleta de clan',
    descripcion: 'Evento diario',
    tipo: 'diario',
    valorBase: 0,
    diasDisponibles: 'todos',
    requiereInput: true,
    inputLabel: 'Posición en clan',
    tablaLookup: 'ruletaClan',
  },
  {
    id: 'mensual_300',
    nombre: 'Mensual de 300',
    descripcion: 'Beneficio mensual',
    tipo: 'mensual',
    valorBase: 50,
    diasDisponibles: 'fijos',
    cantidadFija: 30,
  },
  {
    id: 'mensual_600',
    nombre: 'Mensual de 600',
    descripcion: 'Beneficio mensual',
    tipo: 'mensual',
    valorBase: 100,
    diasDisponibles: 'fijos',
    cantidadFija: 30,
  },
  {
    id: 'evento_dharma',
    nombre: 'Evento de Dharma',
    descripcion: 'Evento limitado',
    tipo: 'limitado',
    valorBase: 120,
    diasDisponibles: 'fijos',
    cantidadFija: 7,
  },
  {
    id: 'evento_farol',
    nombre: 'Evento de Farol',
    descripcion: 'Evento limitado',
    tipo: 'limitado',
    valorBase: 40,
    diasDisponibles: 'fijos',
    cantidadFija: 7,
  },
  {
    id: 'rollo_crecimiento',
    nombre: 'Rollo de crecimiento Nv.100',
    descripcion: 'Compra única',
    tipo: 'unico',
    valorBase: 1800,
    diasDisponibles: 'fijos',
    cantidadFija: 1,
  },
  {
    id: 'arena_duelo',
    nombre: 'Arena de Duelo',
    descripcion: 'Ranking competitivo',
    tipo: 'competitivo',
    valorBase: 0,
    diasDisponibles: null, // No depende de fechas
    requiereInput: true,
    inputLabel: 'Posición en ranking',
    tablaLookup: 'arenaDuelo',
  },
]

// ─────────────────────────────────────────────────────────────
// TABLAS DE REFERENCIA (LOOKUP)
// ─────────────────────────────────────────────────────────────

/**
 * Árbol de deseos: cupones por nivel (diarios)
 * El usuario ingresa su nivel y se multiplica por días disponibles
 */
export const ARBOL_DESEOS_LOOKUP: Record<number, number> = {
  1: 3,
  2: 5,
  3: 7,
  4: 9,
  5: 11,
  6: 13,
  7: 15,
  8: 17,
  9: 19,
  10: 21,
  11: 23,
  12: 25,
}

/**
 * Ruleta de clan: cupones por posición (diarios)
 * El usuario ingresa su posición en el clan
 * Rango ilusión (posición / cupones/día)
 */
export const RULETA_CLAN_LOOKUP: Record<number, number> = {
  1: 800,
  2: 700,
  3: 600,
  4: 400,
  11: 350,
  21: 320,
  51: 300,
  101: 250,
  501: 180,
  1001: 150,
  1501: 120,
}

/**
 * Arena de Duelo: cupones por rango ninja
 * El usuario selecciona su rango (A prueba, Genin, Chunin, etc.)
 */
export const ARENA_DUELO_LOOKUP: Record<string, number> = {
  'A prueba': 80,
  'Genin': 85,
  'Chunin': 135,
  'Anbu': 190,
  'Jonin': 250,
  'Kage': 315,
  'Super Kage': 385,
  'Rikudo': 460,
}

/**
 * Ilusión (Arena Ranking): Bases de datos de posiciones mínimas por rango
 * Se usa para calcular "ranking minimo" en tablas de Ilusión
 * Formato: posición mínima del rango -> cupones
 */
export const ILUSION_BASICO_LOOKUP: Record<number, number> = {
  1: 800,
  2: 700,
  3: 600,
  4: 400,
  11: 350,
  21: 320,
  51: 300,
  101: 250,
  501: 180,
  1001: 150,
  1501: 120,
}

export const ILUSION_ESOTERICO_LOOKUP: Record<number, number> = {
  1: 800,
  2: 700,
  3: 600,
  4: 400,
  11: 350,
  21: 320,
  51: 300,
  101: 250,
  501: 180,
  1001: 150,
  1501: 120,
}

export const ILUSION_COMBO_LOOKUP: Record<number, number> = {
  1: 800,
  2: 700,
  3: 600,
  4: 400,
  11: 350,
  21: 320,
  51: 300,
  101: 250,
  501: 180,
  1001: 150,
  1501: 120,
}

// ─────────────────────────────────────────────────────────────
// HELPERS PARA LOOKUPS
// ─────────────────────────────────────────────────────────────

/**
 * Obtiene valor de Arena de Duelo por rango ninja
 */
export function obtenerValorArenaDuelo(rango: string): number {
  return ARENA_DUELO_LOOKUP[rango] ?? 0
}

/**
 * Obtiene valor de Ruleta de Clan por posición
 * Usa tabla con rangos de posiciones
 */
export function obtenerValorRuletaClan(posicion: number): number {
  if (posicion <= 0) return 0
  // Buscar el rango más cercano hacia abajo
  const rangos = Object.keys(RULETA_CLAN_LOOKUP)
    .map(Number)
    .sort((a, b) => b - a)

  for (const rango of rangos) {
    if (posicion >= rango) {
      return RULETA_CLAN_LOOKUP[rango]
    }
  }
  return RULETA_CLAN_LOOKUP[1]
}

/**
 * Obtiene valor de Árbol de Deseos por nivel
 */
export function obtenerValorArbolDeseos(nivel: number): number {
  if (nivel < 1) return 0
  return ARBOL_DESEOS_LOOKUP[nivel] ?? ARBOL_DESEOS_LOOKUP[12] ?? 0
}

// ─────────────────────────────────────────────────────────────
// CONFIGURACIÓN DE DÍAS DE SEMANA
// ─────────────────────────────────────────────────────────────

export const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
export const DIAS_SEMANA_NUMS = {
  LUNES: 0,
  MARTES: 1,
  MIERCOLES: 2,
  JUEVES: 3,
  VIERNES: 4,
  SABADO: 5,
  DOMINGO: 6,
}

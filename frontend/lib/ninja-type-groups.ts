/**
 * Agrupamiento semántico de los 22 tipos de ninjas (intro tags) en 5 grupos
 * por rol funcional en combate. Usado por el filtro "Tipo" del listado para
 * mostrar los tipos en categorías colapsables en vez de una lista plana.
 */

export interface NinjaTypeGroup {
  label: string
  types: string[] // labels EXACTOS como vienen del backend (ninjaTypes)
}

export const NINJA_TYPE_GROUPS: NinjaTypeGroup[] = [
  {
    label: 'Ofensivos',
    types: ['Ataque grupal', 'Ataque individual', 'Doble ataque', 'Daño grupal', 'Ataque'],
  },
  {
    label: 'Control',
    types: ['Control', 'Interrupción'],
  },
  {
    label: 'Soporte',
    types: ['Asistencia', 'Encantamiento', 'Médico', 'Buen Estado', 'Cura'],
  },
  {
    label: 'Defensivos',
    types: ['Escudo', 'Escudo Humano', 'Resurrección'],
  },
  {
    label: 'Invocación / Recurso',
    types: ['Fuente de Chakra', 'Clon', 'Marioneta', 'Invocador', 'Invocación', 'Copia', 'Transformación'],
  },
]

/** Devuelve el grupo al que pertenece un tipo. Null si el tipo no está mapeado. */
export function findGroupForType(typeLabel: string): NinjaTypeGroup | null {
  return NINJA_TYPE_GROUPS.find((g) => g.types.includes(typeLabel)) ?? null
}

/** Set con TODOS los tipos mapeados — para detectar tipos nuevos del backend que no estén aquí. */
export const MAPPED_TYPES = new Set(NINJA_TYPE_GROUPS.flatMap((g) => g.types))

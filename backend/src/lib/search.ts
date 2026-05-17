/**
 * Helpers de búsqueda tolerantes para usar en services de catálogo.
 * - Case-insensitive
 * - Accent-insensitive (NFD normalization + strip diacritics)
 * - Tolera corchetes/paréntesis en haystacks (ej. "[Kurama]" se busca como "kurama")
 */

// Rango Unicode de "Combining Diacritical Marks" (̀-ͯ).
// Construido con String.fromCharCode + RegExp para evitar issues de encoding del archivo.
const DIACRITICS_RE = new RegExp(`[${String.fromCharCode(0x0300)}-${String.fromCharCode(0x036f)}]`, 'g')

/**
 * Normaliza un string para búsqueda fuzzy:
 *   - "Sasuke" → "sasuke"
 *   - "[Kurama]" → "kurama"           (sin corchetes)
 *   - "Hidan (Desangramiento)" → "hidan desangramiento"
 *   - "Niño" → "nino"
 */
export function normalizeForSearch(s: string | null | undefined): string {
  if (!s) return ''
  return s
    .normalize('NFD')                  // separa caracteres + diacríticos
    .replace(DIACRITICS_RE, '')        // remueve diacríticos
    .replace(/[\[\]()]/g, ' ')         // corchetes/paréntesis → espacio
    .replace(/[^a-zA-Z0-9\s]/g, ' ')   // otros símbolos → espacio
    .replace(/\s+/g, ' ')              // colapsa espacios
    .trim()
    .toLowerCase()
}

/**
 * Devuelve true si los `haystacks` contienen el `needle` (normalizado).
 * Soporta búsqueda multi-palabra: "hidan deseo" matchea "Hidan [Deseo de matar]".
 * Si el query es 1 char, busca como substring directo.
 */
export function matchesSearch(haystacks: (string | null | undefined)[], needle: string): boolean {
  const q = normalizeForSearch(needle)
  if (!q) return true
  const combined = haystacks.map((h) => normalizeForSearch(h)).join(' ')
  const tokens = q.split(' ').filter((t) => t.length >= 2)
  if (!tokens.length) {
    return combined.includes(q)
  }
  return tokens.every((t) => combined.includes(t))
}

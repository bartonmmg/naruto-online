/**
 * Genera un slug URL-safe a partir de un name + opcional title.
 *
 * Ej:
 *   slugify("Sasuke") → "sasuke"
 *   slugify("Sasuke", "[Susano'o]") → "sasuke-susanoo"
 *   slugify("Minato Namikaze", "[Cuarto Hokage]") → "minato-namikaze-cuarto-hokage"
 *   slugify("Tonton") → "tonton"
 *   slugify("Perro ninja Parker") → "perro-ninja-parker"
 */
export function slugify(name: string, title = ''): string {
  return `${name} ${title}`
    .trim()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[\[\](){}'"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

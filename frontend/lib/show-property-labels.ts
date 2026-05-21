/**
 * Mapping de códigos `showProperty` → label legible (tooltip).
 *
 * Estos códigos vienen del XML del juego (`NinjaInfoCFG.xml > showPropertys`) y
 * cada uno corresponde a un ícono PNG en `assets/user/ninja/propertyIcon/<code>.png`
 * (bajado a `public/images/game/showprops/<code>.png`).
 *
 * El mapping NOMBRE está hardcoded acá porque el `对应.txt` del CDN devuelve 403.
 * Si encontrás un código sin label, el tooltip muestra "Propiedad #N" como placeholder.
 *
 * Para completar: el usuario va a pasar screenshots de ninjas con sus íconos visibles
 * en el juego y vamos a ir confirmando qué nombre tiene cada código.
 */

export const SHOW_PROPERTY_LABELS: Record<number, string> = {
  // Hashirama Senju [Batalla Final] — [52,1,18,14,32,48,49,58]
  1: 'Konoha',
  14: 'Límite Sanguíneo',
  18: 'Kage',
  32: 'Clan Senju',
  48: 'Técnica Esotérica',
  49: 'Katana',
  52: 'Masculino',
  58: 'Técnica de Sabios',
  // Karin [Navidad] — [3,15,47,54,66] (la UI del juego mostró los íconos en orden
  // distinto al XML, así que reasignamos basándonos en Neji que también tiene 15)
  3: 'Invierno',
  15: 'Sello Maligno', // confirmado por Neji que tiene sello enjaulado del clan Hyuga
  47: 'Sonido Oculto',
  54: 'Femenino',
  66: 'Clan Uzumaki',
  // Obito Uchiha [Lanza del pantano] — [52,1,11,13,14,31,46,48,49,50]
  11: 'Conocer',
  13: 'Personas Columna',
  31: 'Clan Uchiha',
  46: 'Ojo Rinne',
  50: 'Avance',
  // Gaara [Traje] — [68,52,2,13,18,57]
  2: 'Arena Oculta',
  57: 'Alianza Ninja',
  68: 'Traje',
  // Mu [Segundo Tsuchikage·Edo Tensei] — [52,9,18,51,59]
  9: 'Roca Oculta',
  51: 'Transmigración',
  59: 'Kekkei Tota',
  // Neji Hyuga [Estilo oriental] — [67,52,1,14,15,33,48]
  33: 'Clan Hyuga',
  67: 'Estilo Chino',
  // Ino [Bikini] — [64,54,1,35,48] (confirma 54=Femenino)
  35: 'Clan Yamanaka',
  64: 'Bikini',
  // Zabuza [Samurai errante] — [71,52,4,49]
  4: 'Niebla Oculta',
  71: 'Samurai',
  // Hidan [Halloween] — [69,52,10,11,49]
  10: 'Fuente Oculta',
  69: 'Traje Alternativo',
  // Sai [Año Nuevo Lunar] — [62,52,1,15,19,49]
  19: 'Anbu',
  62: 'Año Nuevo Lunar',
  // Konan [Kimono] — [70,54,6,11]
  6: 'Lluvia Oculta',
  70: 'Kimono',
  // Hagoromo Otsutsuki [Joven] — [52,13,46,49,56,58,60]
  56: 'Clan Otsutsuki',
  // 60 → la card del juego muestra ícono pero sin tooltip / sin texto.
  // Probable placeholder o feature no implementada. Dejamos como "Propiedad #60".
  // Sakura [Verano] — [63,54,1]
  63: 'Verano',
  // Sakura [Legado de Sasuke] — [61,54,1,57]
  61: 'Legado de Sasuke',
  // Tenten [Festival de Medio Otoño] — [65,54,1,49,57]
  65: 'Festival de Medio Otoño',
  // Shikamaru — [...,34,...]
  34: 'Clan Nara',
  // Choji — [...,36,...]
  36: 'Clan Akimichi',
  // Sasori [Manipulación de 100 Marionetas] — [...,17,...]
  17: 'Marioneta',
  // A [Cuarto Raikage] — [52,5,18,57]
  5: 'Nube Oculta',
  // Kakuzu — [52,7,11,48]
  7: 'Rápidos Ocultos',
  // Tobi — [52,11,12]
  12: 'Fan',
  // Aoneko — [62,53,1] tooltip ♂ = "Varón"
  // Maneki Neko — [62,55] tooltip ♀ = "Hembra"
  // El juego usa "Varón/Hembra" para personajes animales (vs Masculino/Femenino
  // para humanos en 52/54).
  53: 'Varón',
  55: 'Hembra',
}

export function showPropertyLabel(code: number): string {
  return SHOW_PROPERTY_LABELS[code] ?? `Propiedad #${code}`
}

export function showPropertyIconSrc(code: number): string {
  return `/images/game/showprops/${code}.png`
}

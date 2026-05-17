#!/usr/bin/env node
/**
 * Optimiza las imagenes del catalogo de juego (ninjas + skill icons).
 * Convierte PNG → WebP con calidad alta perceptual.
 *
 * Targets:
 *   public/images/game/ninjas/big/<id>.png    → <id>.webp  (max 400x533, q82)
 *   public/images/game/ninjas/<id>.png        → <id>.webp  (max 256x256, q82)
 *   public/images/game/skills/<id>.png        → <id>.webp  (max 80x80,   q85)
 *
 * Idempotente: si ya existe el .webp y es mas reciente que el .png, salta.
 * Despues de generar el .webp, borra el .png original para ahorrar espacio.
 *
 * Correr desde frontend/:
 *   cd frontend && node ../scripts/optimize-game-images.mjs
 */
import sharp from 'sharp'
import { readdir, stat, unlink } from 'node:fs/promises'
import { join, parse } from 'node:path'
import { existsSync } from 'node:fs'

const ROOT = new URL('../frontend/public/images/game/', import.meta.url).pathname
  .replace(/^\/([A-Za-z]:)/, '$1')

const TARGETS = [
  { dir: join(ROOT, 'ninjas/big'), w: 400, h: 533, fit: 'cover',    quality: 82, label: 'ninjas-big'  },
  { dir: join(ROOT, 'ninjas'),     w: 256, h: 256, fit: 'cover',    quality: 82, label: 'ninjas-thumb', subdirs: false },
  { dir: join(ROOT, 'skills'),     w: 80,  h: 80,  fit: 'cover',    quality: 85, label: 'skills'      },
  { dir: join(ROOT, 'spirits'),    w: 128, h: 128, fit: 'cover',    quality: 85, label: 'spirits'     },
]

let totalBefore = 0
let totalAfter = 0
let totalConverted = 0
let totalSkipped = 0
let totalErrors = 0

for (const t of TARGETS) {
  let entries
  try {
    entries = await readdir(t.dir)
  } catch {
    console.log(`[skip] ${t.dir} no existe`)
    continue
  }
  // Filtrar solo PNG y excluir subdirs (para "ninjas" no queremos meternos en "big/")
  const files = []
  for (const e of entries) {
    if (!/\.png$/i.test(e)) continue
    try {
      const s = await stat(join(t.dir, e))
      if (s.isDirectory()) continue
      files.push(e)
    } catch {}
  }
  console.log(`\n[${t.label}] ${files.length} PNG en ${t.dir}`)

  for (const file of files) {
    const src = join(t.dir, file)
    const baseName = parse(file).name
    const dst = join(t.dir, `${baseName}.webp`)

    try {
      const beforeStat = await stat(src)
      totalBefore += beforeStat.size

      // Si ya existe el webp y es mas nuevo, asumir hecho
      if (existsSync(dst)) {
        const dstStat = await stat(dst)
        if (dstStat.mtimeMs >= beforeStat.mtimeMs) {
          totalAfter += dstStat.size
          totalSkipped++
          await unlink(src).catch(() => {}) // borrar PNG si quedo huerfano
          continue
        }
      }

      await sharp(src)
        .resize(t.w, t.h, { fit: t.fit, withoutEnlargement: true })
        .webp({ quality: t.quality, effort: 5 })
        .toFile(dst)

      const afterStat = await stat(dst)
      totalAfter += afterStat.size
      totalConverted++

      // Borrar PNG original para liberar espacio
      await unlink(src)
    } catch (e) {
      totalErrors++
      console.error(`  ✗ ${file}: ${e.message}`)
    }
  }
}

const mb = (b) => (b / 1024 / 1024).toFixed(1)
const ratio = totalBefore ? Math.round((1 - totalAfter / totalBefore) * 100) : 0
console.log('\n========================================')
console.log(`Convertidos:  ${totalConverted}`)
console.log(`Saltados:     ${totalSkipped}`)
console.log(`Errores:      ${totalErrors}`)
console.log(`Antes:        ${mb(totalBefore)} MB`)
console.log(`Despues:      ${mb(totalAfter)} MB`)
console.log(`Reduccion:    ${ratio}%`)
console.log('========================================')

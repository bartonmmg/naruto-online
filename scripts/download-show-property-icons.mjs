#!/usr/bin/env node
/**
 * Descarga los íconos `showProperty` (propiedades especiales del ninja: Hokage,
 * Modo Sabio, etc.) del CDN de Oasis a /public.
 *
 * Cada ninja en NinjaInfoCFG tiene un array `showPropertys` con códigos numéricos
 * que mapean a íconos visuales en la card del juego.
 *
 * Output:
 *   frontend/public/images/game/showprops/<code>.png
 *
 * Uso:
 *   node scripts/download-show-property-icons.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const NINJAS_JSON = path.join(ROOT, 'backend', 'tmp', 'game-data', 'ninjas-canonical.json')
const VERSION_MAP = path.join(ROOT, 'backend', 'tmp', 'versionMap.json')
const OUT_DIR = path.join(ROOT, 'frontend', 'public', 'images', 'game', 'showprops')

const CDN = 'https://cdnnarutoxi-lm.oasgames.com'

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true })
}

function downloadOne(url, dest) {
  try {
    execSync(`curl -sk --tls-max 1.2 --fail -o "${dest}" "${url}"`, { stdio: 'pipe' })
    const size = fs.statSync(dest).size
    if (size < 100) {
      fs.unlinkSync(dest)
      return { ok: false }
    }
    return { ok: true, size }
  } catch {
    try {
      fs.unlinkSync(dest)
    } catch {}
    return { ok: false }
  }
}

function main() {
  if (!fs.existsSync(NINJAS_JSON) || !fs.existsSync(VERSION_MAP)) {
    console.error('Faltan inputs (ninjas-canonical.json o versionMap.json)')
    process.exit(1)
  }
  ensureDir(OUT_DIR)

  // Recolectar todos los códigos únicos referenciados por al menos un ninja
  const ninjas = JSON.parse(fs.readFileSync(NINJAS_JSON, 'utf8'))
  const codes = new Set()
  for (const n of ninjas) {
    if (Array.isArray(n.showPropertys)) {
      for (const c of n.showPropertys) codes.add(Number(c))
    }
  }
  console.log(`Códigos únicos referenciados por ninjas: ${codes.size}`)

  const versionMap = JSON.parse(fs.readFileSync(VERSION_MAP, 'utf8'))
  let ok = 0
  let skip = 0
  let fail = 0

  for (const code of [...codes].sort((a, b) => a - b)) {
    const key = `assets/user/ninja/propertyIcon/${code}.png`
    const dest = path.join(OUT_DIR, `${code}.png`)
    if (fs.existsSync(dest) && fs.statSync(dest).size > 100) {
      skip++
      continue
    }
    const e = versionMap[key]
    if (!e) {
      console.warn(`  ✗ code ${code}: no está en versionMap`)
      fail++
      continue
    }
    const url = `${CDN}/${e.tag}/${e.url}`
    const r = downloadOne(url, dest)
    if (r.ok) {
      ok++
      console.log(`  ✓ ${code}.png (${r.size}b)`)
    } else {
      fail++
      console.warn(`  ✗ code ${code}: descarga falló`)
    }
  }

  console.log(`\nListo. ok=${ok}  skip=${skip}  fail=${fail}`)
  console.log(`Output: ${OUT_DIR}`)
}

main()

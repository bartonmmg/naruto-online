#!/usr/bin/env node
/**
 * Baja imágenes de los 49 espíritus animales del CDN.
 *
 * Targets:
 *   1. Thumbnail (icono del bag, ~3KB):
 *      CDN: assets/bag/item/<cardId>.png
 *      Local: frontend/public/images/game/spirits/<spiritId>.png
 *
 *   2. Big image (developview, ~150-500KB) — alta resolución para detalle:
 *      CDN: assets/throughTheBeast/developview/<bigImageId>.png
 *      bigImageId = 21000000 + (spirit.id - 20000000)
 *      Local: frontend/public/images/game/spirits/big/<spiritId>.png
 *
 * Uso:
 *   node scripts/download-spirit-images.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const XML_PATH = path.join(ROOT, 'backend', 'tmp', 'game-data', 'SummonMonsterCFG.xml')
const VERSION_MAP = path.join(ROOT, 'backend', 'tmp', 'versionMap.json')
const OUT_DIR = path.join(ROOT, 'frontend', 'public', 'images', 'game', 'spirits')
const OUT_DIR_BIG = path.join(OUT_DIR, 'big')

const CDN = 'https://cdnnarutoxi-lm.oasgames.com'

function ensureDir(p) { fs.mkdirSync(p, { recursive: true }) }

function downloadOne(url, dest) {
  try {
    execSync(`curl -sk --tls-max 1.2 --fail -o "${dest}" "${url}"`, { stdio: 'pipe' })
    const size = fs.statSync(dest).size
    if (size < 200) { fs.unlinkSync(dest); return { ok: false } }
    return { ok: true, size }
  } catch {
    try { fs.unlinkSync(dest) } catch {}
    return { ok: false }
  }
}

function parseSpirits() {
  const xml = fs.readFileSync(XML_PATH, 'utf8')
  const rows = xml.match(/<row>[\s\S]*?<\/row>/g) || []
  return rows.map((r) => ({
    id: Number((r.match(/<id>(\d+)<\/id>/) || [])[1]),
    artisticId: Number((r.match(/<artisticId>(\d+)<\/artisticId>/) || [])[1]),
    cardId: Number((r.match(/<aquireCardId>(\d+)<\/aquireCardId>/) || [])[1]),
    name: (r.match(/<name>([^<]+)<\/name>/) || [])[1],
  })).filter((s) => s.id)
}

function tryDownload(spirit, kind) {
  const isBig = kind === 'big'
  const dest = isBig
    ? path.join(OUT_DIR_BIG, `${spirit.id}.png`)
    : path.join(OUT_DIR, `${spirit.id}.png`)

  if (fs.existsSync(dest) && fs.statSync(dest).size > 200) return { ok: true, skipped: true }
  // Si ya está la .webp optimizada, saltear también
  const webp = dest.replace(/\.png$/, '.webp')
  if (fs.existsSync(webp) && fs.statSync(webp).size > 200) return { ok: true, skipped: true }

  const versionMap = JSON.parse(fs.readFileSync(VERSION_MAP, 'utf8'))
  let key
  if (isBig) {
    const bigId = 21000000 + (spirit.id - 20000000)
    key = `assets/throughTheBeast/developview/${bigId}.png`
  } else {
    key = `assets/bag/item/${spirit.cardId}.png`
  }
  const entry = versionMap[key]
  if (!entry) return { ok: false, reason: 'no-asset' }

  const url = `${CDN}/${entry.tag}/${entry.url}`
  return downloadOne(url, dest)
}

function main() {
  if (!fs.existsSync(XML_PATH) || !fs.existsSync(VERSION_MAP)) {
    console.error('Faltan inputs')
    process.exit(1)
  }
  ensureDir(OUT_DIR)
  ensureDir(OUT_DIR_BIG)

  const spirits = parseSpirits()
  console.log(`Espíritus: ${spirits.length}\n`)

  for (const kind of ['thumb', 'big']) {
    let ok = 0, skip = 0, fail = 0
    for (const s of spirits) {
      const r = tryDownload(s, kind)
      if (r.skipped) skip++
      else if (r.ok) ok++
      else fail++
    }
    console.log(`[${kind}]  ok=${ok}  skip=${skip}  fail=${fail}`)
  }
}

main()

#!/usr/bin/env node
/**
 * Baja imágenes de los 49 espíritus animales del CDN.
 * Cada espíritu tiene:
 *   - card: assets/bag/item/<cardId>.png        (~3KB, icono del bag — usado como portrait)
 *   - icon: assets/skill/40/<artisticId>.png    (icono del skill — fallback)
 *
 * Output:
 *   frontend/public/images/game/spirits/<spiritId>.png
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

function main() {
  if (!fs.existsSync(XML_PATH) || !fs.existsSync(VERSION_MAP)) {
    console.error('Faltan inputs')
    process.exit(1)
  }
  ensureDir(OUT_DIR)

  const spirits = parseSpirits()
  const versionMap = JSON.parse(fs.readFileSync(VERSION_MAP, 'utf8'))
  console.log(`Espíritus: ${spirits.length}\n`)

  let ok = 0, skip = 0, fail = 0, fallback = 0
  for (const s of spirits) {
    const dest = path.join(OUT_DIR, `${s.id}.png`)
    if (fs.existsSync(dest) && fs.statSync(dest).size > 200) {
      skip++
      continue
    }

    // 1. Probar la card (bag/item)
    const cardKey = `assets/bag/item/${s.cardId}.png`
    let entry = versionMap[cardKey]

    // 2. Fallback al skill icon
    if (!entry) {
      const iconKey = `assets/skill/40/${s.artisticId}.png`
      entry = versionMap[iconKey]
      if (entry) fallback++
    }

    if (!entry) {
      console.log(`  ✗ ${s.name} (id=${s.id}): sin asset`)
      fail++
      continue
    }

    const url = `${CDN}/${entry.tag}/${entry.url}`
    const r = downloadOne(url, dest)
    if (r.ok) {
      ok++
      process.stdout.write(`\r  ${ok + skip + fail}/${spirits.length}  ok=${ok}  skip=${skip}  fail=${fail}  `)
    } else {
      fail++
      console.log(`  ✗ ${s.name}: download error`)
    }
  }

  console.log(`\n\nDescargadas:  ${ok}`)
  console.log(`Ya existían:  ${skip}`)
  console.log(`Fallidas:     ${fail}`)
  console.log(`Con fallback a icon: ${fallback}`)
}

main()

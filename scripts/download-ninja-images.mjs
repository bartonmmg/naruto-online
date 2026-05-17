#!/usr/bin/env node
/**
 * Descarga las imagenes de los ninjas del CDN de Oasis al directorio publico
 * del frontend.
 *
 * Fuentes:
 *   - backend/tmp/game-data/ninjas-canonical.json  (lista de artisticIds)
 *   - backend/tmp/versionMap.json                  (mapeo a tags del CDN)
 *
 * Output:
 *   frontend/public/images/game/ninjas/<artisticId>.png
 *
 * Idempotente: salta archivos que ya existen.
 *
 * Uso:
 *   node scripts/download-ninja-images.mjs                  (default: head solo)
 *   node scripts/download-ninja-images.mjs --big            (tambien imagenes grandes)
 *   node scripts/download-ninja-images.mjs --concurrency=8
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const NINJAS_JSON = path.join(ROOT, 'backend', 'tmp', 'game-data', 'ninjas-canonical.json')
const VERSION_MAP = path.join(ROOT, 'backend', 'tmp', 'versionMap.json')
const OUT_DIR = path.join(ROOT, 'frontend', 'public', 'images', 'game', 'ninjas')

const CDN = 'https://cdnnarutoxi-lm.oasgames.com'

const args = process.argv.slice(2)
const wantBig = args.includes('--big')
const concurrency = (() => {
  const a = args.find((x) => x.startsWith('--concurrency='))
  return a ? Math.max(1, Number(a.split('=')[1])) : 4
})()

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true })
}

function downloadOne(url, dest) {
  // curl con TLS legacy (el server de Oasis no soporta TLS 1.3 con sigalgs modernas).
  // --fail hace que devuelva exit code != 0 si el HTTP status >= 400.
  try {
    execSync(`curl -sk --tls-max 1.2 --fail -o "${dest}" "${url}"`, { stdio: 'pipe' })
    const size = fs.statSync(dest).size
    if (size < 200) {
      // Posible 404 que no salto --fail (CDN puede devolver pagina HTML chica)
      fs.unlinkSync(dest)
      return { ok: false, reason: 'too-small' }
    }
    return { ok: true, size }
  } catch (e) {
    try { fs.unlinkSync(dest) } catch {}
    return { ok: false, reason: 'http-error' }
  }
}

async function downloadAll(jobs) {
  let done = 0
  let okCount = 0
  let skipCount = 0
  let failCount = 0
  const failures = []
  const inFlight = new Set()

  async function worker(job) {
    if (fs.existsSync(job.dest) && fs.statSync(job.dest).size > 200) {
      skipCount++
    } else {
      const r = downloadOne(job.url, job.dest)
      if (r.ok) okCount++
      else {
        failCount++
        failures.push(job.url)
      }
    }
    done++
    if (done % 25 === 0 || done === jobs.length) {
      process.stdout.write(
        `\r  ${done}/${jobs.length}  ok=${okCount} skip=${skipCount} fail=${failCount}     `
      )
    }
  }

  // Pool con concurrencia limitada
  for (const job of jobs) {
    const p = worker(job).then(() => inFlight.delete(p))
    inFlight.add(p)
    if (inFlight.size >= concurrency) await Promise.race(inFlight)
  }
  await Promise.all(inFlight)
  process.stdout.write('\n')
  return { okCount, skipCount, failCount, failures }
}

function main() {
  if (!fs.existsSync(NINJAS_JSON)) {
    console.error('Falta', NINJAS_JSON, '— corré backend/.../ninja-catalog/build.ts primero')
    process.exit(1)
  }
  if (!fs.existsSync(VERSION_MAP)) {
    console.error('Falta', VERSION_MAP)
    process.exit(1)
  }

  ensureDir(OUT_DIR)
  if (wantBig) ensureDir(path.join(OUT_DIR, 'big'))

  const ninjas = JSON.parse(fs.readFileSync(NINJAS_JSON, 'utf8'))
  const versionMap = JSON.parse(fs.readFileSync(VERSION_MAP, 'utf8'))

  // Set unico de artisticIds (las cartas pueden compartir imagen entre variantes)
  const ids = new Set(ninjas.map((n) => n.artisticId))
  console.log(`Ninjas canonicos: ${ninjas.length}`)
  console.log(`ArtisticIds unicos a descargar: ${ids.size}`)
  console.log(`Concurrencia: ${concurrency}\n`)

  // Jobs: portrait (a OUT_DIR), opcionalmente big (a OUT_DIR/big)
  const jobs = []
  let missingThumb = 0
  let missingBig = 0
  for (const id of ids) {
    // Thumbnail H120 (preferido para listado) — si no existe, big al raiz
    const thumbKey = `assets/user/ninja/ninjaBigImg/H120/${id}.png`
    const bigKey = `assets/user/ninja/ninjaBigImg/${id}.png`
    const thumbEntry = versionMap[thumbKey]
    const bigEntry = versionMap[bigKey]

    if (thumbEntry) {
      jobs.push({
        url: `${CDN}/${thumbEntry.tag}/${thumbEntry.url}`,
        dest: path.join(OUT_DIR, `${id}.png`),
      })
    } else if (bigEntry) {
      // Fallback al big como portrait (se downscaleara con CSS object-cover)
      jobs.push({
        url: `${CDN}/${bigEntry.tag}/${bigEntry.url}`,
        dest: path.join(OUT_DIR, `${id}.png`),
      })
    } else {
      missingThumb++
    }

    if (wantBig) {
      if (bigEntry) {
        jobs.push({
          url: `${CDN}/${bigEntry.tag}/${bigEntry.url}`,
          dest: path.join(OUT_DIR, 'big', `${id}.png`),
        })
      } else {
        missingBig++
      }
    }
  }

  console.log(`Imagenes a bajar: ${jobs.length}`)
  console.log(`  → portraits sin asset disponible en CDN: ${missingThumb}`)
  if (wantBig) console.log(`  → big sin asset disponible en CDN: ${missingBig}`)
  console.log()

  const t0 = Date.now()
  downloadAll(jobs).then((r) => {
    const secs = ((Date.now() - t0) / 1000).toFixed(1)
    console.log(`\nListo en ${secs}s.`)
    console.log(`  Descargadas:  ${r.okCount}`)
    console.log(`  Ya existían:  ${r.skipCount}`)
    console.log(`  Fallidas:     ${r.failCount}`)
    if (r.failures.length && r.failures.length <= 10) {
      console.log('  Failures:', r.failures)
    }
  })
}

main()

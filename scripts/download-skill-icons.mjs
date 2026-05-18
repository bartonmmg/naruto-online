#!/usr/bin/env node
/**
 * Descarga los iconos de skills del CDN de Oasis a /public.
 *
 * Fuentes:
 *   - backend/src/game-client/ninja-catalog (lee tmp/game-data/ninjas-canonical.json)
 *   - backend/tmp/versionMap.json
 *
 * Solo baja los iconos referenciados por las skills de las cartas canonicas
 * (no los 11k de SkillCFG completo).
 *
 * Output:
 *   frontend/public/images/game/skills/<skillId>.png
 *
 * Uso:
 *   node scripts/download-skill-icons.mjs [--concurrency=8]
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const NINJAS_JSON = path.join(ROOT, 'backend', 'tmp', 'game-data', 'ninjas-canonical.json')
const TALENT_XML = path.join(ROOT, 'backend', 'tmp', 'game-data', 'talentConfig.xml')
const SUMMON_XML = path.join(ROOT, 'backend', 'tmp', 'game-data', 'SummonMonsterCFG.xml')
const SKILL_XML = path.join(ROOT, 'backend', 'tmp', 'game-data', 'SkillCFG.xml')
const VERSION_MAP = path.join(ROOT, 'backend', 'tmp', 'versionMap.json')
const OUT_DIR = path.join(ROOT, 'frontend', 'public', 'images', 'game', 'skills')

const CDN = 'https://cdnnarutoxi-lm.oasgames.com'
const args = process.argv.slice(2)
const concurrency = (() => {
  const a = args.find((x) => x.startsWith('--concurrency='))
  return a ? Math.max(1, Number(a.split('=')[1])) : 4
})()

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

async function downloadAll(jobs) {
  let done = 0, okCount = 0, skipCount = 0, failCount = 0
  const inFlight = new Set()
  const worker = async (job) => {
    if (fs.existsSync(job.dest) && fs.statSync(job.dest).size > 200) {
      skipCount++
    } else {
      const r = downloadOne(job.url, job.dest)
      if (r.ok) okCount++
      else failCount++
    }
    done++
    if (done % 50 === 0 || done === jobs.length) {
      process.stdout.write(`\r  ${done}/${jobs.length}  ok=${okCount} skip=${skipCount} fail=${failCount}     `)
    }
  }
  for (const job of jobs) {
    const p = worker(job).then(() => inFlight.delete(p))
    inFlight.add(p)
    if (inFlight.size >= concurrency) await Promise.race(inFlight)
  }
  await Promise.all(inFlight)
  process.stdout.write('\n')
  return { okCount, skipCount, failCount }
}

function collectSkillIds() {
  const ids = new Set()
  const ninjas = JSON.parse(fs.readFileSync(NINJAS_JSON, 'utf8'))
  for (const n of ninjas) {
    if (!n.skillSet) continue
    for (const s of n.skillSet.normals) ids.add(s.id)
    for (const s of n.skillSet.specials) ids.add(s.id)
    for (const s of n.skillSet.skills) ids.add(s.id)
  }
  // Talentos de los Mains
  if (fs.existsSync(TALENT_XML)) {
    const xml = fs.readFileSync(TALENT_XML, 'utf8')
    const matches = xml.matchAll(/<item id="\d+" skills="([^"]+)"/g)
    for (const m of matches) for (const sid of m[1].split(',')) ids.add(Number(sid.trim()))
  }
  // Skills de los Espíritus Animales — majorSkill + majorKathaSkill / Lv2 / Lv3
  if (fs.existsSync(SUMMON_XML)) {
    const xml = fs.readFileSync(SUMMON_XML, 'utf8')
    const rows = xml.match(/<row>[\s\S]*?<\/row>/g) || []
    for (const r of rows) {
      const skillTags = [
        ...r.matchAll(/<majorSkill>(\d+)<\/majorSkill>/g),
        ...r.matchAll(/<majorKathaSkill>(\d+)<\/majorKathaSkill>/g),
        ...r.matchAll(/<majorKathaSkillLv2>(\d+)<\/majorKathaSkillLv2>/g),
        ...r.matchAll(/<majorKathaSkillLv3>(\d+)<\/majorKathaSkillLv3>/g),
      ]
      for (const m of skillTags) ids.add(Number(m[1]))
    }
  }
  return ids
}

/**
 * Lee SkillCFG.xml y construye {skillId -> iconId}. La mayoria de skills tienen
 * un `iconId` que apunta al skill "padre" que tiene el asset real (suelen ser
 * variantes de la misma habilidad — animaciones, niveles, etc.).
 */
function buildSkillIconMap() {
  if (!fs.existsSync(SKILL_XML)) return new Map()
  const xml = fs.readFileSync(SKILL_XML, 'utf8')
  const rows = xml.match(/<row>[\s\S]*?<\/row>/g) || []
  const out = new Map()
  for (const r of rows) {
    const id = Number((r.match(/<id>(\d+)<\/id>/) || [])[1])
    const iconId = Number((r.match(/<iconId>(\d+)<\/iconId>/) || [])[1] || 0) || id
    if (id) out.set(id, iconId)
  }
  return out
}

function main() {
  if (!fs.existsSync(NINJAS_JSON) || !fs.existsSync(VERSION_MAP)) {
    console.error('Faltan inputs')
    process.exit(1)
  }
  ensureDir(OUT_DIR)
  const ids = collectSkillIds()
  const iconIdMap = buildSkillIconMap()
  const versionMap = JSON.parse(fs.readFileSync(VERSION_MAP, 'utf8'))
  console.log(`Skill IDs referenciados: ${ids.size}`)
  console.log(`SkillCFG iconId map: ${iconIdMap.size}`)
  console.log(`Concurrencia: ${concurrency}\n`)

  // Para cada skill: resolver el iconId (skill propio o via mapeo) y bajar a
  // {OUT_DIR}/{skillId}.png — asi cada carta puede pedir su icono por skillId
  // sin saber del mapeo interno del juego.
  const jobs = []
  let missingNoMap = 0  // skills sin entrada en SkillCFG (no podemos resolver iconId)
  let missingNoAsset = 0  // tiene iconId pero el CDN no tiene asset
  for (const sid of ids) {
    const iconId = iconIdMap.get(sid)
    if (!iconId) { missingNoMap++; continue }
    const key = `assets/skill/40/${iconId}.png`
    const e = versionMap[key]
    if (!e) { missingNoAsset++; continue }
    jobs.push({
      url: `${CDN}/${e.tag}/${e.url}`,
      // Guardamos como {skillId}.png (no iconId) para que la URL local sea
      // predecible: /images/game/skills/<id>.png
      dest: path.join(OUT_DIR, `${sid}.png`),
    })
  }
  console.log(`Iconos a bajar: ${jobs.length}`)
  console.log(`Sin mapeo iconId: ${missingNoMap}`)
  console.log(`Sin asset en CDN: ${missingNoAsset}`)
  console.log()

  const t0 = Date.now()
  downloadAll(jobs).then((r) => {
    const secs = ((Date.now() - t0) / 1000).toFixed(1)
    console.log(`\nListo en ${secs}s. ok=${r.okCount}  skip=${r.skipCount}  fail=${r.failCount}`)
  })
}

main()

// One-shot script to resize + compress profile images.
// - Avatars: 256x256 PNG
// - Frames:  256x256 PNG (preserves transparency)
// - Banners: 1920x320 PNG (cover crop)
// Also lowercases filenames so they match the slug catalog.

import sharp from 'sharp'
import { readdir, mkdir, rename, unlink, stat } from 'node:fs/promises'
import { join, parse } from 'node:path'

const ROOT = new URL('../frontend/public/images/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')

const TARGETS = [
  { dir: join(ROOT, 'avatars'),         w: 256,  h: 256, fit: 'cover',   label: 'avatars',  fmt: 'png'  },
  { dir: join(ROOT, 'profile/frames'),  w: 256,  h: 256, fit: 'contain', label: 'frames',   fmt: 'png'  },
  { dir: join(ROOT, 'profile/banners'), w: 1920, h: 320, fit: 'cover',   label: 'banners',  fmt: 'jpg'  },
]

let totalBefore = 0
let totalAfter  = 0

for (const t of TARGETS) {
  let entries
  try { entries = await readdir(t.dir) } catch { console.log(`[skip] ${t.dir} doesn't exist`); continue }

  const files = entries.filter(f => /\.png$/i.test(f))
  console.log(`\n[${t.label}] ${files.length} files in ${t.dir}`)

  for (const file of files) {
    const src = join(t.dir, file)
    const baseName = parse(file).name.toLowerCase()
    const lowered = `${baseName}.${t.fmt}`
    const dst = join(t.dir, lowered)

    const before = (await stat(src)).size
    totalBefore += before

    let pipeline = sharp(src).resize(t.w, t.h, { fit: t.fit, background: { r: 0, g: 0, b: 0, alpha: 0 } })

    if (t.fmt === 'jpg') {
      pipeline = pipeline.flatten({ background: { r: 0, g: 0, b: 0 } }).jpeg({ quality: 78, progressive: true, mozjpeg: true })
    } else {
      pipeline = pipeline.png({
        compressionLevel: 9,
        adaptiveFiltering: true,
        palette: true,
        quality: 90,
      })
    }

    const buffer = await pipeline.toBuffer()

    // Remove the original (different name or extension)
    await unlink(src).catch(() => {})
    // Also remove any stale lowered file (in case of re-runs)
    if (src !== dst) await unlink(dst).catch(() => {})

    await sharp(buffer).toFile(dst)
    const after = (await stat(dst)).size
    totalAfter += after

    const pct = ((1 - after / before) * 100).toFixed(0)
    console.log(`  ${file} → ${lowered}  ${(before/1024).toFixed(0)}KB → ${(after/1024).toFixed(0)}KB  (-${pct}%)`)
  }
}

console.log(`\n=== TOTAL ===`)
console.log(`Before: ${(totalBefore / 1024 / 1024).toFixed(1)}MB`)
console.log(`After:  ${(totalAfter  / 1024 / 1024).toFixed(1)}MB`)
console.log(`Saved:  ${((totalBefore - totalAfter) / 1024 / 1024).toFixed(1)}MB (-${((1 - totalAfter/totalBefore)*100).toFixed(0)}%)`)

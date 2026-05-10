#!/usr/bin/env node
// Refresh Discord CDN signed URLs (expire ~24h since 2023).
// Triggered by .github/workflows/refresh-discord-urls.yml every 12h.

const TOKEN       = process.env.DISCORD_BOT_TOKEN
const BACKEND_URL = process.env.BACKEND_URL
const API_KEY     = process.env.API_KEY

if (!TOKEN || !BACKEND_URL || !API_KEY) {
  console.error('Faltan envs: DISCORD_BOT_TOKEN, BACKEND_URL, API_KEY')
  process.exit(1)
}

async function main() {
  // 1. Pedir URLs vigentes al backend
  const listRes = await fetch(`${BACKEND_URL}/news/admin/discord-urls`, {
    headers: { 'x-api-key': API_KEY },
  })
  if (!listRes.ok) {
    console.error('Backend listDiscordUrls error', listRes.status, await listRes.text())
    process.exit(1)
  }
  const { urls } = await listRes.json()
  if (!Array.isArray(urls) || urls.length === 0) {
    console.log('Nada para refrescar.')
    return
  }
  console.log(`Encontradas ${urls.length} URLs de Discord en la DB`)

  // 2. Refrescar contra Discord (batches de 50)
  const map = {}
  for (let i = 0; i < urls.length; i += 50) {
    const batch = urls.slice(i, i + 50)
    const r = await fetch('https://discord.com/api/v10/attachments/refresh-urls', {
      method: 'POST',
      headers: {
        'Authorization': `Bot ${TOKEN}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({ attachment_urls: batch }),
    })
    if (!r.ok) {
      console.error(`Discord refresh error batch ${i / 50}:`, r.status, await r.text())
      continue
    }
    const data = await r.json()
    const list = data?.refreshed_urls ?? []
    for (const item of list) {
      if (item?.original && item?.refreshed) {
        map[item.original] = item.refreshed
      }
    }
  }
  console.log(`Refrescadas ${Object.keys(map).length}/${urls.length} URLs`)

  if (Object.keys(map).length === 0) {
    console.log('Sin mapeos para aplicar.')
    return
  }

  // 3. Mandar el map al backend para que actualice imageUrls
  const applyRes = await fetch(`${BACKEND_URL}/news/admin/refresh-urls`, {
    method: 'POST',
    headers: { 'x-api-key': API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ map }),
  })
  if (!applyRes.ok) {
    console.error('Backend applyRefreshedImageUrls error', applyRes.status, await applyRes.text())
    process.exit(1)
  }
  const { updated } = await applyRes.json()
  console.log(`Posts actualizados: ${updated}`)
}

main().catch(err => { console.error(err); process.exit(1) })

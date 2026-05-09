// Run from GitHub Actions cron (every 30 min) OR manually via `workflow_dispatch`.
// Fetches new messages from each Discord channel and POSTs them to the backend's
// /news/ingest endpoint (auth via x-api-key).
//
// Required env vars:
//   DISCORD_BOT_TOKEN
//   BACKEND_URL          e.g. https://naruto-online.onrender.com
//   API_KEY              shared with backend
//   DISCORD_CH_NINJAS, DISCORD_CH_ESPIRITUS, DISCORD_LATAM_EVENTOS, DISCORD_CH_MODAS

const TOKEN       = process.env.DISCORD_BOT_TOKEN
const BACKEND_URL = process.env.BACKEND_URL
const API_KEY     = process.env.API_KEY

if (!TOKEN || !BACKEND_URL || !API_KEY) {
  console.error('❌ Missing required env vars: DISCORD_BOT_TOKEN, BACKEND_URL, API_KEY')
  process.exit(1)
}

const CHANNELS = [
  { envKey: 'DISCORD_CH_NINJAS',     name: 'Ninjas' },
  { envKey: 'DISCORD_CH_ESPIRITUS',  name: 'Espíritus Animales' },
  { envKey: 'DISCORD_LATAM_EVENTOS', name: 'Eventos Semanales' },
  { envKey: 'DISCORD_CH_MODAS',      name: 'Modas' },
]

// Read sync state from backend so we can fetch only NEW messages per channel
async function getSyncState() {
  // Public-readable subset is not exposed; the cron uses its own approach:
  // fetch latest from Discord without `after`, ingest deduplicates via @unique discordMessageId.
  // For higher efficiency we could expose a public state endpoint, but dedup is sufficient.
  return {}
}

// Discord API caps each request at 100 messages. Paginate using `before` to
// keep going further into history, up to MAX_MESSAGES per channel per run.
const MAX_MESSAGES = 1000

async function fetchChannelMessages(channelId) {
  const all = []
  let beforeId = undefined

  while (all.length < MAX_MESSAGES) {
    const params = new URLSearchParams({ limit: '100' })
    if (beforeId) params.set('before', beforeId)
    const url = `https://discord.com/api/v10/channels/${channelId}/messages?${params}`
    const res = await fetch(url, { headers: { Authorization: `Bot ${TOKEN}` } })
    if (!res.ok) {
      const text = await res.text()
      throw new Error(`Discord API ${res.status}: ${text.slice(0, 200)}`)
    }
    const batch = await res.json()
    if (!batch.length) break
    all.push(...batch)
    if (batch.length < 100) break // last page
    beforeId = batch[batch.length - 1].id // oldest in batch
  }

  return all.slice(0, MAX_MESSAGES)
}

// Send messages in batches to avoid request size limits
const BATCH_SIZE = 50

async function ingestToBackend(channelId, messages) {
  let saved = 0
  let duplicates = 0
  let total = 0

  for (let i = 0; i < messages.length; i += BATCH_SIZE) {
    const batch = messages.slice(i, i + BATCH_SIZE)
    const res = await fetch(`${BACKEND_URL}/news/ingest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
      body: JSON.stringify({ channelId, messages: batch }),
    })
    if (!res.ok) {
      const text = await res.text()
      throw new Error(`Backend ingest ${res.status}: ${text.slice(0, 200)}`)
    }
    const result = await res.json()
    saved      += result.saved ?? 0
    duplicates += result.duplicates ?? 0
    total      += result.total ?? batch.length
  }

  return { saved, duplicates, total }
}

let totalSaved = 0
let totalDuplicates = 0
const errors = []

for (const ch of CHANNELS) {
  const channelId = process.env[ch.envKey]
  if (!channelId) {
    console.log(`⚠️  ${ch.name}: env var ${ch.envKey} no configurada, skip`)
    continue
  }

  try {
    console.log(`\n[${ch.name}] fetching messages from channel ${channelId}...`)
    const raw = await fetchChannelMessages(channelId)
    console.log(`[${ch.name}] got ${raw.length} messages from Discord`)

    const messages = raw.map(m => ({
      id: m.id,
      content: m.content ?? '',
      timestamp: m.timestamp,
      author: { bot: !!m.author?.bot, username: m.author?.username ?? '' },
      attachments: (m.attachments ?? []).map(a => ({
        url: a.url,
        content_type: a.content_type ?? '',
      })),
    }))

    const result = await ingestToBackend(channelId, messages)
    console.log(`[${ch.name}] ingested → saved=${result.saved} duplicates=${result.duplicates}`)
    totalSaved += result.saved ?? 0
    totalDuplicates += result.duplicates ?? 0
  } catch (e) {
    console.error(`[${ch.name}] ❌ ${e.message}`)
    errors.push({ channel: ch.name, error: e.message })
  }
}

console.log(`\n=== Sync complete ===`)
console.log(`Saved: ${totalSaved}`)
console.log(`Duplicates skipped: ${totalDuplicates}`)
if (errors.length) {
  console.log(`Errors: ${errors.length}`)
  errors.forEach(e => console.log(`  - ${e.channel}: ${e.error}`))
  process.exit(1)
}

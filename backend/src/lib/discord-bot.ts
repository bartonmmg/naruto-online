import { Client, GatewayIntentBits, Message, TextChannel } from 'discord.js'
import { prisma } from './prisma.js'
import { DISCORD_CHANNELS } from '../services/news.service.js'

let client: Client | null = null
let ready = false

const channelMap = new Map<string, { category: string; type: string }>()

export function getDiscordClient(): Client | null {
  return ready ? client : null
}

export function isDiscordReady(): boolean {
  return ready
}

export async function startDiscordBot() {
  const token = process.env.DISCORD_BOT_TOKEN
  if (!token) {
    console.log('[discord-bot] DISCORD_BOT_TOKEN not set, skipping')
    return
  }

  // Build channel ID -> category/type lookup
  for (const ch of DISCORD_CHANNELS) {
    const id = process.env[ch.envKey]
    if (id) channelMap.set(id, { category: ch.category, type: ch.type })
  }

  if (channelMap.size === 0) {
    console.log('[discord-bot] no channel IDs configured, skipping')
    return
  }

  client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  })

  client.once('ready', async () => {
    ready = true
    console.log(`[discord-bot] connected as ${client!.user?.tag}`)
    // Catch up on missed messages from each channel
    for (const [channelId, meta] of channelMap.entries()) {
      try {
        await catchUpChannel(channelId, meta.category, meta.type)
      } catch (e: any) {
        console.error(`[discord-bot] catchUp ${meta.category} failed:`, e.message)
      }
    }
  })

  client.on('messageCreate', async (msg: Message) => {
    const meta = channelMap.get(msg.channelId)
    if (!meta) return
    if (msg.author.bot) return
    await saveMessage(msg, meta.category, meta.type)
  })

  client.on('error', (e) => console.error('[discord-bot] error:', e))
  client.on('disconnect', () => { ready = false; console.log('[discord-bot] disconnected') })

  try {
    await client.login(token)
  } catch (e: any) {
    console.error('[discord-bot] login failed:', e.message)
  }
}

async function catchUpChannel(channelId: string, category: string, type: string) {
  if (!client) return
  const channel = await client.channels.fetch(channelId)
  if (!channel || !(channel instanceof TextChannel)) return

  const log = await prisma.syncLog.findUnique({ where: { channelId } })
  const options: { limit: number; after?: string } = { limit: 100 }
  if (log?.lastMessageId) options.after = log.lastMessageId

  const messages = await channel.messages.fetch(options)
  const ordered = Array.from(messages.values()).reverse()

  let saved = 0
  let lastId: string | undefined = log?.lastMessageId ?? undefined
  for (const msg of ordered) {
    if (msg.author.bot) continue
    const ok = await saveMessage(msg, category, type)
    if (ok) saved++
    lastId = msg.id
  }

  await prisma.syncLog.upsert({
    where: { channelId },
    update: { lastSyncAt: new Date(), lastMessageId: lastId ?? null },
    create: { channelId, lastSyncAt: new Date(), lastMessageId: lastId ?? null },
  })

  console.log(`[discord-bot] catchUp ${category}: ${saved} new messages saved`)
}

async function saveMessage(msg: Message, category: string, type: string): Promise<boolean> {
  if (!msg.content && msg.attachments.size === 0) return false

  const content = msg.content || ''
  const lines = content.split('\n').filter(Boolean)
  const title = lines[0]?.slice(0, 120) || 'Sin título'

  const images = Array.from(msg.attachments.values())
    .filter(a => (a.contentType ?? '').startsWith('image/'))
    .map(a => a.url)

  try {
    await prisma.newsPost.create({
      data: {
        title,
        content,
        type,
        category,
        imageUrls: JSON.stringify(images),
        discordMessageId: msg.id,
        publishedAt: msg.createdAt,
      },
    })
    // Update lastMessageId in SyncLog
    await prisma.syncLog.upsert({
      where: { channelId: msg.channelId },
      update: { lastSyncAt: new Date(), lastMessageId: msg.id },
      create: { channelId: msg.channelId, lastSyncAt: new Date(), lastMessageId: msg.id },
    })
    return true
  } catch {
    // Duplicate (discordMessageId @unique) — already saved
    return false
  }
}

export async function forceCatchUp() {
  if (!ready || !client) {
    return [{ error: 'Discord bot not connected' }]
  }
  const results: any[] = []
  for (const [channelId, meta] of channelMap.entries()) {
    try {
      // Reset lastMessageId so we fetch from scratch
      await prisma.syncLog.upsert({
        where: { channelId },
        update: { lastMessageId: null },
        create: { channelId, lastSyncAt: new Date(), lastMessageId: null },
      })
      const before = await prisma.newsPost.count({ where: { category: meta.category } })
      await catchUpChannel(channelId, meta.category, meta.type)
      const after = await prisma.newsPost.count({ where: { category: meta.category } })
      results.push({ channel: channelId, category: meta.category, fetched: after - before, saved: after - before })
    } catch (e: any) {
      results.push({ channel: channelId, category: meta.category, fetched: 0, saved: 0, error: e.message })
    }
  }
  return results
}

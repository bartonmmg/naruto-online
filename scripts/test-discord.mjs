// Test rápido: ¿podemos traer mensajes de Discord desde esta IP?
// Uso: cargar token desde backend/.env.local y correr:
//   cd naruto-app && node scripts/test-discord.mjs

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(__dirname, '../backend/.env.local')

let token = process.env.DISCORD_BOT_TOKEN
if (!token) {
  try {
    const envFile = readFileSync(envPath, 'utf8')
    const match = envFile.match(/^DISCORD_BOT_TOKEN=(.+)$/m)
    if (match) token = match[1].trim()
  } catch {}
}

if (!token) {
  console.error('❌ No se encontró DISCORD_BOT_TOKEN en env ni en backend/.env.local')
  process.exit(1)
}

const CHANNELS = [
  { id: '1483609808975171824', name: 'Ninjas' },
  { id: '1497356723353030827', name: 'Espíritus Animales' },
  { id: '1117256573077688445', name: 'Eventos Semanales' },
  { id: '1497348630040805426', name: 'Modas' },
]

console.log(`Token: ${token.substring(0, 15)}... (${token.length} chars)\n`)

for (const ch of CHANNELS) {
  process.stdout.write(`[${ch.name}] `)
  try {
    const res = await fetch(`https://discord.com/api/v10/channels/${ch.id}/messages?limit=5`, {
      headers: { Authorization: `Bot ${token}` },
    })
    const text = await res.text()
    if (res.ok) {
      const messages = JSON.parse(text)
      console.log(`✅ Status ${res.status} — ${messages.length} mensajes`)
      if (messages[0]) {
        console.log(`   Último: "${(messages[0].content || '[sin texto]').slice(0, 60)}"`)
      }
    } else {
      const preview = text.slice(0, 200).replace(/\n/g, ' ')
      console.log(`❌ Status ${res.status} — ${preview}`)
    }
  } catch (e) {
    console.log(`❌ Error: ${e.message}`)
  }
}

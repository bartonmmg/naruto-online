// Scrappes weekly events from the official Naruto Online forum and POSTs them
// to the backend's /news/ingest-forum endpoint.
//
// The forum index lists threads named "ACTUALIZACIONES DD/MM/YYYY". For each
// recent thread we fetch its full HTML, extract title + content + images, and
// ingest into the "Eventos Semanales" category (type EVENT).
//
// Required env vars:
//   BACKEND_URL          e.g. https://naruto-online.onrender.com
//   API_KEY              shared with backend

const BACKEND_URL = process.env.BACKEND_URL
const API_KEY     = process.env.API_KEY

if (!BACKEND_URL || !API_KEY) {
  console.error('❌ Missing required env vars: BACKEND_URL, API_KEY')
  process.exit(1)
}

const FORUM_BASE = 'https://forum-narutoes.narutowebgame.com'
const INDEX_URL  = `${FORUM_BASE}/page/show-thread-1-1.html`
const MAX_POSTS  = 8 // most recent N events

// ───────────────────────────────────────────────────────────────────────────
// Helpers

async function fetchHtml(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; HDRV-Bot/1.0; +https://naruto-online.netlify.app)',
      'Accept': 'text/html',
    },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`)
  return res.text()
}

// Extract thread links from the index. Returns [{ url, title, dateStr }]
function parseIndex(html) {
  const results = []
  const seen = new Set()
  // Match <a href="show-post-XXXX-1.html">... ACTUALIZACIONES DD/MM/YYYY ...</a>
  const re = /<a[^>]+href="(show-post-\d+-\d+\.html)"[^>]*>([^<]*ACTUALIZACIONES[^<]*?(\d{2}\/\d{2}\/\d{4})[^<]*)<\/a>/gi
  let m
  while ((m = re.exec(html)) !== null) {
    const href = m[1]
    if (seen.has(href)) continue
    seen.add(href)
    const fullUrl = `${FORUM_BASE}/page/${href}`
    const title = m[2].replace(/\s+/g, ' ').trim()
    results.push({ url: fullUrl, title, dateStr: m[3], threadKey: href })
    if (results.length >= MAX_POSTS) break
  }
  return results
}

// Convert DD/MM/YYYY → ISO publishedAt
function parseDateAR(dmy) {
  const [d, m, y] = dmy.split('/').map(Number)
  return new Date(Date.UTC(y, m - 1, d, 12, 0, 0)).toISOString()
}

// HTML → plain markdown-ish text:
// - <h*>X</h*> → ## X
// - <strong>/<b> → **X**
// - <li>X</li>  → - X
// - <p> → \n\n
// - <br> → \n
// - <img src> → ![](src)
// - strip remaining tags
function htmlToMarkdown(html) {
  let s = html
  // Normalize newlines and remove scripts/styles
  s = s.replace(/<script[\s\S]*?<\/script>/gi, '')
  s = s.replace(/<style[\s\S]*?<\/style>/gi, '')
  // Images
  s = s.replace(/<img[^>]*src=["']([^"']+)["'][^>]*\/?>/gi, '\n\n![]($1)\n\n')
  // Headings
  s = s.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '\n\n## $1\n\n')
  s = s.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '\n\n## $1\n\n')
  s = s.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '\n\n### $1\n\n')
  s = s.replace(/<h[4-6][^>]*>([\s\S]*?)<\/h[4-6]>/gi, '\n\n**$1**\n\n')
  // Bold / italic
  s = s.replace(/<(strong|b)[^>]*>([\s\S]*?)<\/\1>/gi, '**$2**')
  s = s.replace(/<(em|i)[^>]*>([\s\S]*?)<\/\1>/gi, '*$2*')
  // Lists
  s = s.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '\n- $1')
  s = s.replace(/<\/?(ul|ol)[^>]*>/gi, '\n')
  // Paragraphs / breaks
  s = s.replace(/<\/p>/gi, '\n\n')
  s = s.replace(/<br\s*\/?>/gi, '\n')
  // Remove remaining tags
  s = s.replace(/<[^>]+>/g, '')
  // Decode common HTML entities
  s = s
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
  // Collapse multiple blank lines
  s = s.replace(/\n{3,}/g, '\n\n').trim()
  return s
}

// Extract all <img src> URLs from raw HTML (after we've sliced to body region)
function extractImages(html) {
  const urls = []
  const re = /<img[^>]+src=["']([^"']+)["']/gi
  let m
  while ((m = re.exec(html)) !== null) {
    let url = m[1]
    if (url.startsWith('//')) url = 'https:' + url
    else if (url.startsWith('/')) url = FORUM_BASE + url
    // skip obvious icons/avatars
    if (/avatar|emoji|icon|logo/i.test(url)) continue
    urls.push(url)
  }
  return Array.from(new Set(urls))
}

// Crudely find the post body content. The forum uses different markup but a
// common pattern is: <div class="show_content"> or similar. We'll fall back
// to the largest content block between known delimiters.
function extractPostBody(html) {
  // Try a few common selectors
  const patterns = [
    /<div[^>]*class="[^"]*show_content[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/i,
    /<div[^>]*class="[^"]*post[_-]?body[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    /<div[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>\s*(?:<div|<\/div>|<footer)/i,
    /<article[^>]*>([\s\S]*?)<\/article>/i,
    /<div[^>]*id="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
  ]
  for (const re of patterns) {
    const m = html.match(re)
    if (m && m[1] && m[1].length > 200) return m[1]
  }
  // Fallback: take everything between <body> and </body>
  const m = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
  return m ? m[1] : html
}

async function ingestPosts(items) {
  const res = await fetch(`${BACKEND_URL}/news/ingest-forum`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
    body: JSON.stringify({
      category: 'Eventos Semanales',
      type: 'EVENT',
      sourceLabel: '🌐 Foro Oficial',
      items,
    }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Backend ingest-forum ${res.status}: ${text.slice(0, 300)}`)
  }
  return res.json()
}

// ───────────────────────────────────────────────────────────────────────────
// Main

console.log(`[forum] fetching index ${INDEX_URL}`)
const indexHtml = await fetchHtml(INDEX_URL)
const threads   = parseIndex(indexHtml)
console.log(`[forum] found ${threads.length} thread links`)

if (!threads.length) {
  console.error('[forum] no threads found — index parser may need updating')
  process.exit(1)
}

const items = []
for (const t of threads) {
  try {
    console.log(`[forum] fetching ${t.threadKey} (${t.dateStr})`)
    const html = await fetchHtml(t.url)
    const body = extractPostBody(html)
    const content = htmlToMarkdown(body)
    const images = extractImages(body)
    items.push({
      externalId: t.threadKey,
      title: t.title,
      content,
      publishedAt: parseDateAR(t.dateStr),
      imageUrls: images,
    })
    console.log(`  → content ${content.length} chars, ${images.length} images`)
  } catch (e) {
    console.error(`  ❌ ${e.message}`)
  }
}

console.log(`\n[forum] ingesting ${items.length} posts to backend...`)
const result = await ingestPosts(items)
console.log(`=== Forum sync complete ===`)
console.log(`Saved: ${result.saved}`)
console.log(`Duplicates skipped: ${result.duplicates}`)

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
// HTML pattern: <a aria-label="ACTUALIZACIONES DD/MM/YYYY" href="https://.../show-post-NNN-1.html">ACTUALIZACIONES DD/MM/YYYY</a>
function parseIndex(html) {
  const results = []
  const seen = new Set()
  const re = /<a\b[^>]*aria-label="ACTUALIZACIONES\s+(\d{2}\/\d{2}\/\d{4})"[\s\S]*?href="([^"]*show-post-(\d+)-\d+\.html)"/gi
  let m
  while ((m = re.exec(html)) !== null) {
    const dateStr = m[1]
    let url = m[2]
    const postId = m[3]
    if (seen.has(postId)) continue
    seen.add(postId)
    if (url.startsWith('/')) url = FORUM_BASE + url
    if (!url.startsWith('http')) url = `${FORUM_BASE}/page/${url}`
    results.push({
      url,
      title: `Actualización de eventos: ${dateStr}`,
      dateStr,
      threadKey: `post-${postId}`,
    })
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

  // Pass 1: count how often each image URL appears. URLs that appear >= 2 times
  // are decorative (penguin emojis, separators, dividers).
  const urlCount = new Map()
  for (const m of s.matchAll(/<img[^>]*src=["']([^"']+)["']/gi)) {
    urlCount.set(m[1], (urlCount.get(m[1]) || 0) + 1)
  }
  const decorativeUrls = new Set(
    [...urlCount.entries()].filter(([, c]) => c >= 2).map(([u]) => u),
  )

  // Pass 2: remove all <img> whose src is in the decorative set
  if (decorativeUrls.size > 0) {
    s = s.replace(/<img[^>]+>/gi, (img) => {
      const m = img.match(/src=["']([^"']+)["']/i)
      return m && decorativeUrls.has(m[1]) ? '' : img
    })
  }

  // Pass 2.5: detect images with short numeric alt that repeats (penguin
  // separators have alt="39" or "50" appearing in pairs throughout the post).
  const altCount = new Map()
  for (const m of s.matchAll(/<img[^>]*\balt=["']([^"']*)["'][^>]*>/gi)) {
    const alt = m[1].trim()
    if (alt && alt.length <= 3 && /^\d+$/.test(alt)) {
      altCount.set(alt, (altCount.get(alt) || 0) + 1)
    }
  }
  const decorativeAlts = new Set(
    [...altCount.entries()].filter(([, c]) => c >= 2).map(([a]) => a),
  )
  if (decorativeAlts.size > 0) {
    s = s.replace(/<img[^>]+>/gi, (img) => {
      const m = img.match(/\balt=["']([^"']*)["']/i)
      return m && decorativeAlts.has(m[1].trim()) ? '' : img
    })
  }

  // Pass 3: when a <p> has BOTH images and meaningful text, drop the images.
  // (penguins flanking a heading like "<p><img>title<img></p>")
  s = s.replace(/<p\b[^>]*>([\s\S]*?)<\/p>/gi, (full, inner) => {
    const hasImg = /<img\b/i.test(inner)
    if (!hasImg) return full
    const textOnly = inner.replace(/<img[^>]*>/gi, '').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim()
    if (textOnly.length > 3) {
      return full.replace(/<img[^>]*>/gi, '')
    }
    return full
  })

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
  // Forum-specific: post body lives in <div class="forum_detail_content_mian">
  // (note: "mian" is the actual class name in the source, not a typo we made).
  // The content extends until the reply/footer section that follows.
  const startRe = /<div[^>]*class="[^"]*forum_detail_content_mian[^"]*"[^>]*>/i
  const start = html.match(startRe)
  let body
  if (!start) {
    const bm = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
    body = bm ? bm[1] : html
  } else {
    const startIdx = (start.index ?? 0) + start[0].length
    const tail = html.slice(startIdx)

    const stops = [
      /<div[^>]*class="[^"]*forum_detail_content_bottom[^"]*"/i,
      /<div[^>]*class="[^"]*forum_detail_reply[^"]*"/i,
      /<div[^>]*class="[^"]*post_reply[^"]*"/i,
      /<div[^>]*class="[^"]*forum_reply[^"]*"/i,
    ]
    let endIdx = tail.length
    for (const re of stops) {
      const m = tail.match(re)
      if (m && m.index !== undefined && m.index < endIdx) endIdx = m.index
    }
    body = tail.slice(0, endIdx)
  }

  // Strip the "Último post Autor X Edición YYYY-MM-DD" footer line that the
  // forum injects inside the main content div.
  body = body.replace(
    /<div[^>]*style="[^"]*color:\s*#999[^"]*"[^>]*>[\s\S]*?<\/div>/gi,
    '',
  )
  body = body.replace(
    /Último\s+post\s+Autor[\s\S]*?(?:Edici[oó]n\s+\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})?/gi,
    '',
  )

  return body
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
    // Forum images are embedded inside the markdown content via ![](...). We
    // don't pass them in imageUrls — otherwise they'd render twice (hero +
    // inline). The frontend can pull a hero from the first ![]() in content.
    items.push({
      externalId: t.threadKey,
      title: t.title,
      content,
      publishedAt: parseDateAR(t.dateStr),
      imageUrls: [],
    })
    console.log(`  → content ${content.length} chars, ${images.length} inline images`)
  } catch (e) {
    console.error(`  ❌ ${e.message}`)
  }
}

console.log(`\n[forum] ingesting ${items.length} posts to backend...`)
const result = await ingestPosts(items)
console.log(`=== Forum sync complete ===`)
console.log(`Saved: ${result.saved}`)
console.log(`Duplicates skipped: ${result.duplicates}`)

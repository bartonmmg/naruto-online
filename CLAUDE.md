# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Konohagakure Hub** — A Naruto Online community platform with user authentication, XP/leveling systems, dynamic ranking systems, guides, and interactive tools for community engagement. Built as a full-stack monorepo with modern tech stack.

### Tech Stack
- **Frontend:** Next.js 16.2.2 (App Router) + React 19 + Tailwind CSS + Framer Motion v12
- **Backend:** Node.js (ESM) + Express.js + TypeScript
- **Database:** PostgreSQL via Neon.tech — managed with Prisma ORM (two schemas: dev SQLite / prod PostgreSQL)
- **Authentication:** JWT + bcrypt (salt: 12)
- **Validation:** Zod schemas on all controller inputs
- **Styling:** Tailwind CSS with custom ninja-themed colors (Naranja #FF6B00 + Negro #0D0D0D)
- **Hosting:** Netlify (frontend) / Render.com (backend) / Neon.tech (database)

## Commands

### Development
```bash
# Run both frontend (3000) and backend (4000) concurrently
npm run dev

# Frontend only
npm run dev --workspace=frontend

# Backend only (with tsx watch)
npm run dev --workspace=backend
```

### Building
```bash
npm run build                        # Both workspaces
npm run build --workspace=backend
npm run build --workspace=frontend
```

### Database (Prisma)
```bash
# Dev: create migration after schema changes (uses schema.prisma — SQLite)
cd backend && npx prisma migrate dev --name <name>

# Prod: sync schema without migration (uses schema.prod.prisma — PostgreSQL)
cd backend && npx prisma db push --schema=prisma/schema.prod.prisma --accept-data-loss

# Generate Prisma client (included in build script automatically)
cd backend && npx prisma generate
```

**Two-schema strategy:**
- `backend/prisma/schema.prisma` — `provider = "sqlite"`, used in local dev
- `backend/prisma/schema.prod.prisma` — `provider = "postgresql"`, used by build script and Render
- Build script: `"build": "prisma generate --schema=prisma/schema.prod.prisma && tsc"`
- Prisma does NOT allow `env()` in the `provider` field — hence two separate files

### Note on Package Management
- Root `package.json` uses npm workspaces
- Only `frontend/package-lock.json` should exist (root lock file causes `npm ci` conflicts)
- Always `npm install --legacy-peer-deps` in frontend (lucide-react doesn't declare React 19 support but is compatible)

## Architecture

### Monorepo Structure
```
naruto-app/
├── backend/
│   ├── src/
│   │   ├── index.ts                  # Express app, body limit 10mb, routes, health check, seedDefaults on startup
│   │   ├── controllers/
│   │   │   ├── admin.controller.ts   # XP config, level config, users, roles
│   │   │   ├── guides.controller.ts  # Guides CRUD, views, ratings, comments, badges
│   │   │   ├── news.controller.ts    # Novedades CRUD, ingest endpoints, comments, suggestions, reactions, RSS
│   │   │   ├── auth.controller.ts
│   │   │   └── leaderboard.controller.ts
│   │   ├── services/
│   │   │   ├── xp.service.ts         # XP award, level calc, achievements, seedDefaults, reseedDefaults
│   │   │   ├── guides.service.ts     # Guide business logic, ratings, comments, reactions, views
│   │   │   ├── news.service.ts       # Novedades business logic, DISCORD_CHANNELS, ingest, suggestions
│   │   │   └── auth.service.ts       # Register, login, daily login XP trigger
│   │   ├── routes/
│   │   │   ├── admin.routes.ts       # All require ADMIN role
│   │   │   ├── guides.routes.ts      # Mixed public/auth/admin+mod
│   │   │   ├── news.routes.ts        # Mixed public/auth/admin+mod (literal paths before /:id)
│   │   │   ├── leaderboard.routes.ts
│   │   │   └── notifications.routes.ts
│   │   └── middleware/
│   │       ├── auth.middleware.ts    # JWT verification, extracts userId/username/role
│   │       ├── authorize.middleware.ts # Role-based access control
│   │       └── apiKey.ts             # x-api-key header validation
│   ├── prisma/
│   │   ├── schema.prisma             # SQLite (dev)
│   │   ├── schema.prod.prisma        # PostgreSQL (prod)
│   │   └── dev.db                    # SQLite file (dev only, gitignored)
│   └── dist/                         # Compiled output (gitignored)
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx                  # Landing page
│   │   ├── layout.tsx                # Root layout (no Navbar — each page manages its own)
│   │   ├── admin/
│   │   │   ├── layout.tsx            # Admin shell: auth guard (ADMIN only) + sidebar
│   │   │   ├── page.tsx              # Redirects → /admin/xp
│   │   │   ├── xp/page.tsx           # XP actions, levels/ranks, achievements editor
│   │   │   ├── roles/page.tsx        # Role reference + user table with role changer
│   │   │   ├── novedades/page.tsx    # Novedades table: bulk delete, pin, edit
│   │   │   └── sugerencias/page.tsx  # Suggestions queue: approve/reject
│   │   ├── auth/                     # /auth/login, /auth/register
│   │   ├── dashboard/page.tsx        # User profile, XP bar, achievements, guides
│   │   ├── guides/
│   │   │   ├── page.tsx              # Guide listing with search/filter/sort
│   │   │   ├── create/page.tsx       # Full-screen editor with templates
│   │   │   ├── leaderboard/page.tsx  # Top guides + top authors
│   │   │   └── [id]/
│   │   │       ├── page.tsx          # Guide detail: ToC, voting, comments, badges
│   │   │       └── edit/page.tsx     # Edit guide (ADMIN/MOD or author)
│   │   ├── users/[username]/page.tsx # Public user profile
│   │   ├── rankings/
│   │   │   ├── page.tsx              # Power rankings with global/regional views
│   │   │   └── stats/page.tsx        # Region comparator with charts
│   │   ├── novedades/
│   │   │   ├── page.tsx              # Listing: 5 tabs, sort, search, hero card, timeline view for Eventos
│   │   │   ├── [id]/page.tsx         # Detail: markdown, TOC, lightbox, reactions, comments, related, share
│   │   │   ├── [id]/edit/page.tsx    # Edit (ADMIN/MOD or author)
│   │   │   ├── [id]/layout.tsx       # Server component with generateMetadata for SEO
│   │   │   ├── create/page.tsx       # Create (ADMIN/MOD)
│   │   │   └── sugerir/page.tsx      # User suggestion form
│   │   ├── tools/
│   │   │   ├── page.tsx
│   │   │   └── coupons/page.tsx
│   │   └── faq/page.tsx
│   ├── components/
│   │   ├── ui/                       # Button, Input, AuthCard
│   │   ├── guides/
│   │   │   ├── GuideBadges.tsx       # Badge display/edit (PNG images)
│   │   │   ├── GuideVoting.tsx       # Útil/No útil voting
│   │   │   ├── GuideComments.tsx     # Comment list + form
│   │   │   └── TableOfContents.tsx   # Auto-generated from headings
│   │   ├── NewsComments.tsx          # Comments thread for /novedades/[id]
│   │   ├── ShareButtons.tsx          # Copy / WhatsApp / Telegram / Twitter
│   │   ├── LatestNewsSection.tsx     # Home page: 3 latest + floating new-news toast
│   │   ├── WeeklySummary.tsx         # Home modal once per ISO week
│   │   ├── NotificationBell.tsx      # Polling bell with localReadIds ref
│   │   └── LoadingSpinner.tsx        # Shuriken spinner with glow
│   ├── lib/
│   │   ├── api.ts                    # Axios instance with JWT + x-api-key interceptors
│   │   ├── types.ts                  # Shared TypeScript types
│   │   ├── hooks/useAuth.ts          # Auth context + hasRole()
│   │   ├── hooks/useReadNews.ts      # localStorage-backed read tracking + isNew()
│   │   └── guideTemplates.ts         # Static guide template content
│   └── next.config.mjs               # images.unoptimized: true
│
├── scripts/
│   ├── sync-discord.mjs              # GitHub Actions: fetches Discord, POSTs to /news/ingest
│   ├── sync-forum.mjs                # GitHub Actions: scrapes forum, POSTs to /news/ingest-forum
│   └── test-discord.mjs              # Local-only sanity check for Discord token + permissions
│
├── .github/workflows/                # (Note: lives at repo root, NOT inside naruto-app/)
│   ├── discord-sync.yml              # Cron: Tue/Fri 10:00 ART
│   └── forum-sync.yml                # Cron: Wed 12:00 + 22:00 ART
│
└── netlify.toml                      # Build config + @netlify/plugin-nextjs
```

## User Roles & Access Control

### Roles
| Role | Default | Description |
|------|---------|-------------|
| `USER` | ✅ On register | Can interact with content |
| `MODERATOR` | Manual | Can create and moderate content |
| `ADMIN` | Manual | Full access including back office |

### Access by Role

**USER** — all registered users:
- View published guides, vote (+2 XP), comment (+5 XP), react (+1 XP)
- Daily login (+10 XP)
- View leaderboard, public profiles, notifications

**MODERATOR** — everything USER can do, plus:
- Create guides (+50 XP), edit/delete any guide
- Assign badges to guides (Oficial, Tendencia, Verificada, Completa)
- Delete any comment, see draft guides in listing
- Badge "MODERADOR" visible on public profile

**ADMIN** — everything MODERATOR can do, plus:
- Access `/admin` back office
- Configure XP per action, manage levels/ranks
- Change any user's role (cannot self-change)
- Badge "ADMIN" visible on public profile

### Changing a User's Role
Via Back Office: `/admin/roles` → dropdown per user row → select new role.
Via SQL (direct): `UPDATE "User" SET role = 'ADMIN' WHERE username = 'x';`

**Backend enforcement:** `authorize.middleware.ts` checks `req.role` against allowed roles array, returns 403 if not authorized.

### Suggestions Workflow
USERs can submit news suggestions via `/novedades/sugerir`. They land in `NewsSuggestion` table with `status=PENDING`. MOD/ADMIN review them at `/admin/sugerencias` and either:
- **Approve** → creates a real `NewsPost` with the suggestion content (authorId = original suggester) and marks suggestion `APPROVED`
- **Reject** → marks suggestion `REJECTED`, optionally with a reviewer note

## Admin Back Office (`/admin`)

### Layout
- Fixed topbar (`h-14`) with "← Dashboard" link and "Back Office" title
- Sidebar (`w-52`) with extensible `TABS` array — add new tabs here
- Auth guard: redirects non-ADMIN users to `/dashboard`
- No global Navbar rendered (admin layout is self-contained)

### Current Tabs

#### XP & Niveles (`/admin/xp`)
- **XP por Acción** — grid of editable rows, one per action (GUIDE_PUBLISHED, COMMENT_POSTED, VOTE_RECEIVED, VOTE_CAST, REACTION_CAST, BADGE_RECEIVED, DAILY_LOGIN)
- **Niveles y Rangos** — table with level number, rank image (by level number, not label), current label, editable name, editable XP threshold; add/delete levels
- **Logros** — read-only grid of all achievement definitions with image, title, description, XP reward
- **Restablecer defaults** button — calls `POST /admin/reseed` to wipe and recreate all config with clean defaults (fixes UTF-8 corruption)
- Error state: if `/admin/xp-config` fails (e.g., corrupt data), shows alert with "Restablecer configuración" button

**Rank image mapping (by level number, independent of editable label):**
- Levels 1–3 → `genin.png`
- Levels 4–6 → `chunin.png`
- Levels 7–9 → `jonin.png`
- Level 10 → `kage.png`
- Level 11+ → `akatsuki.png`

#### Roles (`/admin/roles`)
- **Referencia de Roles** — 3 cards (USER / MODERADOR / ADMIN) with color, description, full permission list
- **Usuarios Registrados** — searchable, filterable table (by role with counters); dropdown per row to change role; cannot change own role

### Backend Admin Endpoints (all require ADMIN role + JWT + API key)
```
GET    /admin/xp-config              → { xpConfig, levelConfig, achievements }
PATCH  /admin/xp-config              → update XP amount for an action
PATCH  /admin/level-config           → update level XP threshold and label
POST   /admin/level-config           → create new level
DELETE /admin/level-config/:level    → delete a level
POST   /admin/reseed                 → wipe and recreate XP/level/achievement defaults
GET    /admin/users                  → list all users (id, username, email, role, level, xp)
PATCH  /admin/users/:id/role         → change user role (cannot self-change)
```

## XP & Progression System

### XP Sources (default values, configurable in back office)
| Action | XP | Notes |
|--------|----|-------|
| GUIDE_PUBLISHED | 50 | On guide creation |
| COMMENT_POSTED | 5 | Per comment |
| VOTE_RECEIVED | 10 | Author gets XP when someone votes útil |
| VOTE_CAST | 2 | Voter gets XP (first vote per guide only) |
| REACTION_CAST | 1 | Per new reaction |
| BADGE_RECEIVED | 25 | When admin assigns a badge |
| DAILY_LOGIN | 10 | Once per UTC day |

### Daily Login
- Triggered on `POST /auth/login` in `auth.service.ts`
- Compares UTC date of `lastDailyLogin` vs current date
- If new day: updates `lastDailyLogin`, calls `xpService.awardXp(userId, 'DAILY_LOGIN')`
- Returns `{ token, dailyLoginAwarded: boolean, user }` in login response
- Frontend: stores `sessionStorage.setItem('dailyLoginAwarded', '1')` and shows toast

### Levels (default, configurable)
| Level | XP Required | Rank |
|-------|-------------|------|
| 1–3 | 0 / 100 / 250 | Genin |
| 4–6 | 500 / 900 / 1400 | Chūnin |
| 7–9 | 2000 / 3000 / 4500 | Jōnin |
| 10 | 6500 | Kage |
| 11+ | configurable | Akatsuki |

### Achievements
All auto-granted via `xpService.checkAchievements(userId)`, called after relevant actions.

| Key | Condition | XP Reward |
|-----|-----------|-----------|
| FIRST_GUIDE | ≥1 guide | 30 |
| FIVE_GUIDES | ≥5 guides | 75 |
| TEN_GUIDES | ≥10 guides | 150 |
| VIEWS_100 | 1 guide with ≥100 views | 50 |
| VIEWS_1000 | 1 guide with ≥1000 views | 150 |
| VOTES_100 | 1 guide with ≥100 útil votes | 100 |
| BADGE_OFFICIAL | 1 guide has OFFICIAL badge | 60 |
| LEGEND | Top 3 leaderboard by views | Dynamic |

**LEGEND is dynamic:** granted (+50 XP) when entering top 3, revoked (-50 XP) when leaving. Uses `try/catch` on `userAchievement.create` to handle race conditions.

**Anti-abuse:** VOTES/VIEWS checked per single guide (not aggregate), BADGE_OFFICIAL requires admin assignment, LEGEND uses leaderboard (cannot self-game).

**Notification deduplication:** before creating ACHIEVEMENT notification, checks `findFirst({ where: { read: false, type, message } })`. Client also maintains `localReadIds: useRef<Set<string>>` that persists across polling cycles.

## Guides System

### Features
- **Create/Edit:** Full-screen contenteditable markdown editor with horizontal metadata topbar; templates via dropdown
- **Badges:** OFFICIAL, TRENDING, VERIFIED, COMPLETE — assigned by ADMIN/MOD only; use PNG images in `/images/guides/badges/`
- **Voting:** Útil/No útil per guide per user (upsert); author gets +10 XP, voter gets +2 XP
- **Comments:** Auth required to post/delete own; ADMIN/MOD can delete any
- **Views:** 1 per authenticated user (upsert by userId+guideId), 1 per IP for anonymous (upsert by guideId+ipAddress)
- **Reactions:** Emoji reactions, +1 XP per new unique reaction
- **Table of Contents:** Auto-generated from h1/h2/h3 headings in guide content
- **Leaderboard:** `/guides/leaderboard` — top guides by views + top authors by total views

### Backend Guide Endpoints
```
GET    /guides                          → list (public, filters: author/search/sortBy/order)
GET    /guides/:id                      → detail + increment view (public, optional JWT for userVote)
POST   /guides                          → create (ADMIN/MOD only)
PUT    /guides/:id                      → update (ADMIN/MOD or author)
DELETE /guides/:id                      → delete (ADMIN/MOD only)
PUT    /guides/:id/badges               → assign badges (ADMIN/MOD only)
POST   /guides/:id/ratings              → vote (auth required)
DELETE /guides/:id/ratings              → remove vote (auth required)
GET    /guides/:id/ratings              → get vote counts + userVote (public, optional JWT)
POST   /guides/:id/comments             → add comment (auth required)
DELETE /guides/:id/comments/:commentId → delete comment (owner or ADMIN/MOD)
GET    /guides/:id/comments             → list comments (public)
POST   /guides/:id/reactions            → react (auth required)
DELETE /guides/:id/reactions/:type      → remove reaction (auth required)
GET    /guides/:id/reactions            → get reactions (public)
```

**Important pattern — public endpoints with optional auth:**
`recordView` and `getRatings` have no `authMiddleware` but still extract the user manually:
```typescript
const token = req.headers.authorization?.split(' ')[1]
if (token) {
  try { const payload = jwt.verify(token, secret) as any; userId = payload.userId } catch {}
}
```
This is required because these routes sit before `apiKeyMiddleware` in the auth chain.

## Novedades System (`/novedades`)

The Novedades section aggregates content from three sources: official Discord channels (auto-synced), the official Naruto Online forum (auto-synced for weekly events), and manual posts/suggestions from MOD/ADMIN/users on the site.

### Content sources

| Source | Categories | Sync frequency | How |
|--------|-----------|----------------|-----|
| Discord channels | Ninjas, Espíritus Animales, Modas | Tue/Fri 10:00 ART | GitHub Actions cron |
| Forum threads | Eventos Semanales | Wed 12:00 + 22:00 ART | GitHub Actions cron |
| Manual (site) | Any | On demand | MOD/ADMIN form, or USER suggestion → MOD/ADMIN approval |

### Why GitHub Actions instead of a backend cron
Render's free-tier shared IPs are blocked by Cloudflare for Discord API/Gateway requests (`429 Too Many Requests` with HTML challenge body). GitHub-hosted runner IPs are not blocked. The cron runs the sync scripts there, then POSTs results to the backend `/news/ingest*` endpoints (auth via `x-api-key`).

### Channel mapping (`backend/src/services/news.service.ts`)
```typescript
DISCORD_CHANNELS = [
  { envKey: 'DISCORD_CH_NINJAS',     category: 'Ninjas',             type: 'CHINA',  acceptBots: false },
  { envKey: 'DISCORD_CH_ESPIRITUS',  category: 'Espíritus Animales', type: 'CHINA',  acceptBots: false },
  { envKey: 'DISCORD_CH_MODAS',      category: 'Modas',              type: 'CHINA',  acceptBots: false },
  // Eventos Semanales come from the forum (sync-forum.mjs)
]
```
`acceptBots: true` means bot-authored Discord messages are kept (used for channels where a Discord bot posts the actual content).

### Forum scraping (`scripts/sync-forum.mjs`)
- Fetches https://forum-narutoes.narutowebgame.com/page/show-thread-1-1.html (index)
- Extracts up to 8 most recent threads matching `aria-label="ACTUALIZACIONES DD/MM/YYYY"`
- For each thread, parses `<div class="forum_detail_content_mian">` (forum's own typo, not ours) until the next reply/footer section
- Strips the "Último post Autor X Edición YYYY-MM-DD" footer that the forum injects
- Detects decorative images (penguin separators) via two heuristics:
  - URLs that appear ≥2 times in the page (most common decorative pattern)
  - `<img alt="N">` where N is a short number (≤3 chars) and the alt repeats ≥2 times
  - Also strips `<img>` tags inside `<p>` blocks that have BOTH images and meaningful text
- Converts cleaned HTML → markdown (custom mini-converter, no deps)
- POSTs to `/news/ingest-forum` with `category: 'Eventos Semanales'`, `type: 'EVENT'`, `sourceLabel: '🌐 Foro Oficial'`

### Discord scraping (`scripts/sync-discord.mjs`)
- Paginates Discord REST `/channels/:id/messages` with `before` to fetch up to 1000 msgs/channel
- Sends in batches of 50 to backend (Express body limit is 10mb but batching is safer)
- Backend deduplicates via `discordMessageId @unique` on insert

### Schema — main models

```prisma
model NewsPost {
  id               String   @id @default(cuid())
  title            String
  content          String
  type             String   @default("GENERAL")  // CHINA | TENTATIVE | EVENT | GENERAL
  category         String   @default("General")
  imageUrls        String   @default("[]")       // JSON array
  authorId         String?                        // null = auto-synced
  author           User?    @relation(fields: [authorId], references: [id], onDelete: SetNull)
  discordMessageId String?  @unique               // dedup key (forum posts use "forum:post-NNN")
  discordAuthor    String?                        // username, "BOT" if bot, "🌐 Foro Oficial" for forum
  pinned           Boolean  @default(false)
  reactions        String   @default("{}")        // JSON: { "👍": 12, "❤️": 5, "🔥": 8 }
  views            Int      @default(0)
  comments         NewsComment[]
  publishedAt      DateTime @default(now())
  // ... timestamps + indexes
}

model NewsComment    { id, newsPostId, authorId, content, createdAt, updatedAt }
model NewsSuggestion { id, title, content, category, type, status, suggestedById, reviewerNote, createdAt, reviewedAt }
model SyncLog        { channelId @unique, lastSyncAt, lastMessageId }
```

### Backend endpoints (`/news/...` — registered BEFORE `apiKeyMiddleware`, so public reads work without API key; writes use JWT or `x-api-key` for server-to-server)

```
# Public reads
GET    /news                           → list (filters: type, category, limit, offset; sorted pinned DESC, publishedAt DESC; includes _count.comments)
GET    /news/rss                       → RSS XML feed (last 30 posts)
GET    /news/categories                → distinct list
GET    /news/:id                       → detail (also increments views)
GET    /news/:id/related               → 3 most recent in same category
GET    /news/:id/comments              → list comments
POST   /news/:id/react                 → { emoji, delta } — whitelisted emojis only
# Auth (JWT)
POST   /news/:id/comments              → add comment
DELETE /news/:id/comments/:commentId   → owner or ADMIN/MOD can delete
POST   /news/suggestions               → user submits suggestion
# MOD/ADMIN
POST   /news                           → create
PUT    /news/:id                       → update
DELETE /news/:id                       → delete
POST   /news/bulk-delete               → { ids: [] }
PUT    /news/:id/pin                   → { pinned }
GET    /news/suggestions?status=...    → list (PENDING by default)
POST   /news/suggestions/:id/approve   → creates a NewsPost from the suggestion
POST   /news/suggestions/:id/reject    → marks REJECTED
# ADMIN
POST   /news/sync                      → returns sync state info (no longer triggers anything)
GET    /news/sync/state                → last sync per channel
# Server-to-server (x-api-key, called by GitHub Actions)
POST   /news/ingest                    → { channelId, messages: [] }  → dedups, returns { saved, duplicates }
POST   /news/ingest-forum              → { category, type, sourceLabel?, items: [] }
```

**Route order matters** — literal paths (`/suggestions`, `/bulk-delete`, `/sync`, `/ingest*`) are declared BEFORE `/:id`, otherwise Express matches them as IDs.

### Frontend

#### `/novedades` (public listing)
- 5 static tabs: **Todas · Ninjas · Animales · Modas · Eventos** (badge with NUEVO count per tab if user has unread recent posts)
- 3 sort modes: **Más recientes** (publishedAt desc), **Más populares** (`views + reactions×5 + comments×10`), **Más comentadas**
- Search (in title/content)
- View toggle visible only on Eventos tab: **Grilla** vs **Cronología** (timeline grouped by month, with vertical date dots)
- Hero card on top (largest, with `border-2 border-accent-orange/30` and shadow), grid of remaining cards below
- Cards include: pinned indicator, NUEVO badge, type badge, category, age, image, title (cleaned of markdown), excerpt (markdown stripped), author label, view/reaction/comment counters with humanized tooltips
- Image hero per card: `imageUrls[0]` if present; otherwise first markdown image in content; for EVENT type, always uses `/images/novedades/eventos.png`
- Skeleton loaders during load, hover lift + image zoom (5% scale 500ms) on cards
- Keyboard shortcuts: `1-5` → switch tabs, `/` → focus search, `Esc` (in search) → clear

#### `/novedades/[id]` (detail)
- SEO meta tags via `layout.tsx` server component (`generateMetadata` → og:title, og:description, og:image)
- Reading progress bar pinned at top (scroll listener updates a CSS-width div)
- Type/category badges, date, author, view count
- Pinned indicator + DESTACADA badge if pinned
- Action row: `<ShareButtons />` (Copy link, WhatsApp, Telegram, Twitter), and for MOD/ADMIN: Pin toggle, Edit, Delete
- Image grid suppressed when content already embeds images via markdown (avoids duplicates)
- Content rendered with `react-markdown` + `remark-gfm`. `normalizeDiscordContent()` pre-processes: `<@123>` → `@usuario`, `<#456>` → `#canal`, `<:emoji:id>` → `:emoji:`, bare URLs → markdown links
- Custom `img` component opens lightbox on click (also wired for `imageUrls` grid)
- Lightbox: full-screen overlay, ESC or backdrop click closes
- Sticky **TOC** to the right (desktop) / collapsible at top (mobile) when content has ≥3 headings; uses `slugify()` for anchor IDs
- **Reactions** (👍 ❤️ 🔥): localStorage tracks the user's clicks per post (anti-double-click, `news-reactions:{id}` key)
- **Related posts**: 3 most recent in the same category at the bottom
- **Comments**: `<NewsComments />` — auth required to post, owner or staff can delete

#### `/novedades/create` and `/novedades/[id]/edit`
- MOD/ADMIN only — full markdown editor with metadata fields

#### `/novedades/sugerir`
- Auth required — title, type, category, content (markdown). Submits to `/news/suggestions`.
- On success shows a confirmation card with "Enviar otra" / "Ver novedades" buttons.

#### `/admin/novedades`
- Table with checkbox per row + "select all", **bulk delete** action bar appears when items selected
- Per-row actions: Pin toggle, Edit, Delete
- "Estado de sync" button shows last sync per channel (no longer triggers anything — sync is GitHub Actions)
- Pinned posts have a Pin icon next to the title

#### `/admin/sugerencias`
- Filter chips: Pendientes / Aprobadas / Rechazadas / Todas (with counts)
- Per-item: Aprobar (creates NewsPost) / Rechazar (with optional reviewer note)
- Empty state with `Inbox` icon

### Home (`/`)
- `<WeeklySummary />` — modal pop-up shown once per ISO week (`2026-W18` key in localStorage). Lists posts from last 7 days. Skips if no recent posts. Auto-fires ~800ms after page load.
- `<LatestNewsSection />` — 3 most recent posts as cards. Includes a floating "Hay X novedades nuevas" toast (bottom-right, dismiss-once-per-session via `sessionStorage`).

### Read tracking — `useReadNews` hook (`frontend/lib/hooks/useReadNews.ts`)
- Stores read post IDs in `localStorage` (`news-read-ids` key as JSON array)
- `markRead(id)` called when a user opens a detail page
- `isNew(id, publishedAt)` returns `true` only if post is < 7 days old AND not in read set
- Used by listing badges, hero, LatestNewsSection, and tab counters

### Markdown styling
`globals.css` has a `.news-markdown` scope that styles `h1-h3`, `p`, `strong`, `em`, `a`, `ul/ol`, `blockquote`, `code`, `pre`, `hr`, `img`, `table` to match the project's dark Tailwind theme. Used in detail content and elsewhere markdown is rendered.

### GitHub Actions workflows

`.github/workflows/discord-sync.yml`:
- Schedules: `0 13 * * 2` (Tue 10:00 ART), `0 13 * * 5` (Fri 10:00 ART), plus `workflow_dispatch`
- Runs `node scripts/sync-discord.mjs`

`.github/workflows/forum-sync.yml`:
- Schedules: `0 15 * * 3` (Wed 12:00 ART), `0 1 * * 4` (Wed 22:00 ART = Thu 01:00 UTC), plus `workflow_dispatch`
- Runs `node scripts/sync-forum.mjs`

**GitHub repository secrets required:**
- `DISCORD_BOT_TOKEN`, `BACKEND_URL`, `API_KEY`
- `DISCORD_CH_NINJAS`, `DISCORD_CH_ESPIRITUS`, `DISCORD_CH_MODAS`
- (Forum sync needs only `BACKEND_URL` + `API_KEY`)

**Cost estimate:** ~16 minutes/month (well under GitHub free tier of 2000 min/month).

### Body-size limit
`express.json({ limit: '10mb' })` in `index.ts` — needed because forum posts can be large (~20kB each, batches of 50 messages can exceed default 100kB).

## Netlify Deployment

### Current Configuration (`netlify.toml`)
```toml
[build]
command = "cd frontend && npm install --legacy-peer-deps && npm run build"
publish = "frontend/.next"

[env]
NODE_VERSION = "20.18.0"
NODE_ENV = "production"
NEXT_PUBLIC_API_URL = "https://naruto-online.onrender.com"

[[plugins]]
package = "@netlify/plugin-nextjs"
```

### Why `@netlify/plugin-nextjs` is required
- Next.js 16 with dynamic routes (`/guides/[id]`, `/users/[username]`) requires SSR
- `output: 'export'` (static) would fail because these routes have no `generateStaticParams`
- The plugin handles SSR routing correctly on Netlify's edge network
- Plugin version: `@netlify/plugin-nextjs@5.15.10` installed as devDependency in `frontend/package.json`
- Do NOT add `NETLIFY_NEXT_PLUGIN_SKIP = "true"` — that was a workaround for auto-injection; now plugin is declared explicitly

### Previous 404 issue (resolved 2026-05-03)
- **Cause:** `netlify.toml` had `[[redirects]] from="/*" to="/index.html"` — SPA redirect that doesn't work with Next.js
- **Fix:** Removed the redirect, added `@netlify/plugin-nextjs` explicitly

### `next.config.mjs`
```js
const nextConfig = {
  reactStrictMode: true,
  images: { unoptimized: true },  // required on Netlify
}
```
- No `output: 'export'` — uses SSR
- No `turbopack.root` — Next.js auto-detects

## Render Backend Deployment

### Build & Start Commands
```
Build:  cd backend && npm install && npm run build
Start:  npm start --workspace=backend
```

⚠️ **Do NOT include `prisma db push` in the Render build command.** Neon free tier suspends the DB after 5 min idle and the build will fail trying to reach it. Apply schema changes via Neon SQL Editor or from a local terminal with the prod `DATABASE_URL` env var set.

### What `npm run build` does
1. `prisma generate --schema=prisma/schema.prod.prisma` — generates PostgreSQL client
2. `tsc` — compiles TypeScript to `dist/`

### On startup
`xpService.seedDefaults()` runs — inserts default XP config, levels, achievements if tables are empty.

### Common production issues
| Issue | Cause | Fix |
|-------|-------|-----|
| `Couldn't convert data to UTF-8` on XpConfig | Corrupt data in DB | Go to `/admin/xp` → click "Restablecer configuración" |
| `Invalid prisma.xpConfig` on startup | Tables empty after schema push | Restart service — seedDefaults runs again |
| SQLite provider error with PostgreSQL URL | Wrong schema used | Ensure build uses `schema.prod.prisma` |
| Discord API `429` with HTML body or Gateway login timeout | Render's free-tier shared IPs are on Cloudflare's blocklist | Don't try to fetch Discord from the backend. Use GitHub Actions (`scripts/sync-discord.mjs`) which runs on GitHub IPs that are not blocked. |
| Render build fails with `Can't reach database server` (Neon) | Neon free tier auto-suspends after 5 min idle; build's `prisma db push` blocks if DB is paused | Build command must NOT include `prisma db push`. Apply schema changes manually via Neon SQL Editor or temporarily run `npx prisma db push` from local with prod `DATABASE_URL`. |
| `Payload Too Large` (413) when ingesting Discord/forum batches | Express default 100kb limit | Body parser is configured with `limit: '10mb'` in `index.ts`. Sync script also batches 50 messages at a time. |

## Known Constraints & Decisions

- **Two Prisma schemas:** `schema.prisma` (SQLite/dev) and `schema.prod.prisma` (PostgreSQL/prod). Prisma doesn't support `env()` in `provider` field.
- **ESM imports:** Backend relative imports MUST have `.js` extension (required for Node ESM at runtime).
- **Image optimization:** Do NOT use `next/image` for static PNGs — use native `<img>` tags. Netlify returns 400 for local image optimization.
- **Tailwind z-index:** Only standard values (`z-0` through `z-50`) exist. Use `style={{ zIndex: N }}` for custom values.
- **React 19:** `lucide-react@0.292.0` compatible but doesn't declare it — use `--legacy-peer-deps`. `recharts@3.8.1` requires explicit `react-is@^19.0.0`.
- **No documentation sprawl:** No `.md` files in project root other than CLAUDE.md.
- **CORS:** Restricted to `FRONTEND_URL` env var in production (must match exactly, no trailing slash).
- **Admin layout is self-contained:** Does not render the global Navbar. Root `layout.tsx` only renders `{children}`.

## Rankings Page (`/rankings`)

### API Endpoints
- `/api/rankings/consolidated-global` — Global top 100 across all regions/clusters
- `/api/rankings/top100?region=&cluster=&date=` — Regional top 100
- `/api/rankings/regions` — Available regions
- `/api/rankings/clusters/:region` — Clusters with data
- `/api/rankings/dates/:region/:cluster` — Available snapshot dates

### Visual Design
- Dark battlefield (`#080810`) background
- Hashirama (left, `hashiizq.webp` 312KB) + Madara (right, `madaraderecha.webp` 235KB) characters — WebP, CSS background-image, opacity 0.75
- GPU-optimized aura glow: opacity-only animation on separate divs (<1% GPU vs 20-30% for filter-based)
- 16 chakra particles (8 green left, 8 red/orange right) with `chakra-drift` animation
- All effects hidden on mobile/tablet (`hidden lg:block`)

### Card/Table Views
- **Table:** `#` | Ninja | Nivel | Poder | Server — medals for top 3, numbered circles for 4+
- **Cards:** Grid 2/3/4 col by breakpoint; rank title badges via `getRankingTitle(rank)`
- `getRankingTitle(rank)` → `{ name, cls, icon }` — used in `/rankings` and `/dashboard`

## Security

**Never commit:** `.env*`, `*.db`, `dist/`, `.next/`, `node_modules/`, `.claude/`

**Production env vars (Render):**
- `DATABASE_URL` — PostgreSQL from Neon.tech
- `JWT_SECRET` — ≥32 random chars
- `API_KEY` — ≥32 random chars (matches frontend `NEXT_PUBLIC_API_KEY`)
- `FRONTEND_URL` — exact frontend origin
- `NODE_ENV=production`, `BACKEND_PORT=4000`

**Production env vars (Netlify):**
- `NEXT_PUBLIC_API_URL` — backend URL
- `NEXT_PUBLIC_API_KEY` — matches backend API_KEY

**API Key middleware:** All endpoints except `/health`, `/auth/register`, `/auth/login` require `x-api-key` header. Frontend axios interceptor adds it automatically.

## Pages & Routes Summary

| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | Landing page with video hero |
| `/auth/login` `/auth/register` | Public | Auth pages |
| `/dashboard` | Auth | XP bar, rank, achievements, guides |
| `/guides` | Public | Guide listing with search/filter/sort |
| `/guides/create` | ADMIN/MOD | Full-screen editor with templates |
| `/guides/[id]` | Public | Guide detail with ToC, voting, comments |
| `/guides/[id]/edit` | ADMIN/MOD or author | Edit guide |
| `/guides/leaderboard` | Public | Top guides + top authors |
| `/users/[username]` | Public | User profile with XP, rank, achievements |
| `/rankings` | Public | Power rankings global/regional |
| `/rankings/stats` | Public | Region comparator with charts |
| `/tools/coupons` | Auth | Coupon calculator |
| `/faq` | Public | Collapsible FAQ sections |
| `/novedades` | Public | News feed: 5 tabs, sort modes, search, hero card, stats |
| `/novedades/[id]` | Public | News detail with markdown, TOC, reactions, comments, related, lightbox |
| `/novedades/[id]/edit` | ADMIN/MOD | Edit news post |
| `/novedades/create` | ADMIN/MOD | Create news post |
| `/novedades/sugerir` | Auth | Submit a news suggestion (USER+) |
| `/admin` | ADMIN | Redirects → /admin/xp |
| `/admin/xp` | ADMIN | XP actions, levels, achievements config |
| `/admin/roles` | ADMIN | Role reference + user role management |
| `/admin/novedades` | ADMIN | News table: bulk delete, pin, edit, last-sync status |
| `/admin/sugerencias` | ADMIN/MOD | Approve/reject user-submitted suggestions |

## Assets

**Rank images** (`frontend/public/images/rangos/`):
`genin.png`, `chunin.png`, `jonin.png`, `kage.png`, `akatsuki.png`, `akatsuki2.png`, `kage2.png`

**Guide badges** (`frontend/public/images/guides/badges/`):
`badge-oficial.png`, `badge-tendencia.png`, `badge-verificada.png`, `badge-completa.png`

**Achievements** (`frontend/public/images/guides/logros/`):
`logro-primera-guia.png`, `logro-5-guias.png`, `logro-10-guias.png`, `logro-100-vistas.png`, `logro-1000-vistas.png`, `logro-votos.png`, `logro-badge-oficial.png`, `logro-leyenda.png`

**Novedades** (`frontend/public/images/novedades/`):
`eventos.png` — static hero used for all EVENT-type posts (since forum images are decorative-heavy)

**Rankings** (`frontend/public/images/power-ranking/`):
`hashiizq.webp`, `madaraderecha.webp`, `top1.png`, `top2.png`, `top3.png`, `top1-titulo.png`, `top2-titulo.png`

## Last Updated
2026-05-09

### Changes in this session (2026-05-09) — Novedades section
- ✅ **Novedades section** end-to-end: schema (`NewsPost`, `NewsComment`, `NewsSuggestion`, `SyncLog`), backend services + routes, public listing, detail page, create/edit, suggest form, admin queue
- ✅ **Discord sync via GitHub Actions** — `scripts/sync-discord.mjs` (Tue/Fri 10:00 ART) + `scripts/sync-forum.mjs` (Wed 12:00 + 22:00 ART). Bypasses Render's blocked-IP issue with Cloudflare/Discord.
- ✅ **Forum scraping** for weekly events: extracts threads, strips footer + decorative penguin images (URL-repeat + alt-repeat heuristic), HTML→markdown conversion, paginates Discord up to 1000 msgs/channel in batches of 50
- ✅ **Detail page UX**: markdown rendering, sticky TOC (≥3 headings), lightbox on images, reading progress bar, ESC keyboard handlers, SEO meta tags via `generateMetadata` in `layout.tsx`
- ✅ **Reactions** (👍 ❤️ 🔥) with localStorage anti-double-click, **Comments** (auth required, owner+staff can delete), **Related posts** (3 same-category)
- ✅ **Share buttons** component — Copy link / WhatsApp / Telegram / Twitter
- ✅ **Listing UX**: 5 static tabs (Todas/Ninjas/Animales/Modas/Eventos) with NUEVO badge counts, 3 sort modes (recientes/populares/comentadas), search, skeleton loaders, hero card, hover image zoom + lift, keyboard shortcuts (1-5, /, Esc), animations on tab change, **timeline view** for Eventos (grouped by month with vertical date dots)
- ✅ **Pin/featured** posts with `pinned` field — sorted first in listing, badge "DESTACADA" in detail
- ✅ **Bulk delete** + select all in `/admin/novedades`
- ✅ **Suggestions workflow**: USERs submit at `/novedades/sugerir` → MOD/ADMIN approve/reject at `/admin/sugerencias`. Approve creates a real `NewsPost` with the suggester as author.
- ✅ **Read tracking** via `useReadNews` hook (localStorage `news-read-ids`) — drives NUEVO badge, tab counts, weekly summary
- ✅ **WeeklySummary** popup on home — shows once per ISO week (`2026-W18` key), lists last 7 days of posts
- ✅ **LatestNewsSection** on home — 3 most recent posts + floating toast for unread (sessionStorage dismiss)
- ✅ **Static hero image** for EVENT-type posts (`/images/novedades/eventos.png`) since forum images are decorative-heavy
- ✅ **Body size limit** raised to `10mb` in Express to handle batched ingest payloads
- ✅ **Discord normalization**: `<@123>` → `@usuario`, `<#456>` → `#canal`, `<:emoji:id>` → `:emoji:`
- ✅ **Title cleaning**: strips markdown (`**`, `##`, etc.) from titles before saving + safety pass in frontend
- ✅ **Author display**: `🤖 BotName` for bots, `@username` for humans (strips `#NNNN` discriminator)

### Changes in previous session (2026-05-03)
- ✅ **Admin back office** (`/admin`) with extensible sidebar — XP & Niveles tab + Roles tab
- ✅ **XP/level/achievement editor** with rank images by level number, add/delete levels, reseed defaults button
- ✅ **Reseed endpoint** (`POST /admin/reseed`) to fix UTF-8 corrupted data in XpConfig table
- ✅ **Roles admin page** (`/admin/roles`) — role reference cards + user table with inline role changer
- ✅ **Netlify 404 fix** — removed SPA redirect, added `@netlify/plugin-nextjs` explicitly
- ✅ **Two-schema Prisma** — `schema.prisma` (SQLite/dev), `schema.prod.prisma` (PostgreSQL/prod)
- ✅ **Daily login XP** — triggered on login, `sessionStorage` flag for one-shot toast
- ✅ **XP for all users** — VOTE_CAST (+2), REACTION_CAST (+1), DAILY_LOGIN (+10)
- ✅ **Rank images** in dashboard, public profile, home page, FAQ
- ✅ **LEGEND achievement** — dynamic, granted/revoked based on top 3 leaderboard status
- ✅ **Notification deduplication** — server-side + client `localReadIds` ref
- ✅ **Views deduplication** — 1 per authenticated user (upsert), 1 per IP for anonymous

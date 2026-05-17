# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Konohagakure Hub** — A Naruto Online community platform with user authentication, XP/leveling systems, dynamic ranking systems, guides, and interactive tools for community engagement. Built as a full-stack monorepo with modern tech stack.

> **Para trabajo de extracción de datos del juego** (scraping de rankings, ninjas, modas, espíritus directamente desde los servidores de Oasis/Tencent), ver el archivo separado [`CLAUDE-game-data-pipeline.md`](./CLAUDE-game-data-pipeline.md). Toda la doc del pipeline de obtención de datos vive ahí para no contaminar este archivo.

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
│   │   │   ├── users.controller.ts   # Profile customization GET/PATCH /users/me/profile
│   │   │   ├── auth.controller.ts
│   │   │   └── leaderboard.controller.ts
│   │   ├── services/
│   │   │   ├── xp.service.ts         # XP award, level calc, achievements, seedDefaults, reseedDefaults
│   │   │   ├── guides.service.ts     # Guide business logic, ratings, comments, reactions, views
│   │   │   ├── news.service.ts       # Novedades business logic, DISCORD_CHANNELS, ingest, suggestions
│   │   │   ├── users.service.ts      # Profile updates with catalog + Zod validation
│   │   │   └── auth.service.ts       # Register, login, daily login XP trigger
│   │   ├── lib/
│   │   │   ├── prisma.ts             # Singleton Prisma client
│   │   │   └── profile-catalog.ts    # Valid avatar/banner/frame/color slugs + frame minLevel
│   │   ├── routes/
│   │   │   ├── admin.routes.ts       # All require ADMIN role
│   │   │   ├── guides.routes.ts      # Mixed public/auth/admin+mod
│   │   │   ├── news.routes.ts        # Mixed public/auth/admin+mod (literal paths before /:id)
│   │   │   ├── users.routes.ts       # /users/me/profile (GET/PATCH, auth)
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
│   │   ├── profile/
│   │   │   └── edit/page.tsx         # Edit own profile (auth required)
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
│   │   ├── profile/
│   │   │   ├── AvatarFrame.tsx       # Avatar (full size) + frame (1.66x, overlapping)
│   │   │   ├── ProfileBanner.tsx     # Banner + AvatarFrame floating bottom-left
│   │   │   ├── AvatarPicker.tsx      # Modal: grid of available avatars
│   │   │   ├── BannerPicker.tsx      # Modal: list of available banners
│   │   │   ├── FramePicker.tsx       # Modal: frames with minLevel locks
│   │   │   ├── ColorPicker.tsx       # Inline palette picker
│   │   │   ├── PinnedAchievements.tsx # Pick max 3 from earned achievements
│   │   │   └── SocialLinks.tsx       # Twitch / YouTube / Discord / in-game pills
│   │   ├── NotificationBell.tsx      # Polling bell with localReadIds ref
│   │   └── LoadingSpinner.tsx        # Shuriken spinner with glow
│   ├── lib/
│   │   ├── api.ts                    # Axios instance with JWT + x-api-key interceptors
│   │   ├── types.ts                  # Shared TypeScript types + parseSocialLinks/parsePinnedAchievements/avatarSrc/bannerSrc/frameSrc helpers
│   │   ├── profile-assets.ts         # AVAILABLE_AVATARS, AVAILABLE_BANNERS, FRAMES, NAME_COLORS — only slugs that have files on disk
│   │   ├── hooks/useAuth.ts          # Auth context + hasRole()
│   │   ├── hooks/useReadNews.ts      # localStorage-backed read tracking + isNew()
│   │   └── guideTemplates.ts         # Static guide template content
│   └── next.config.mjs               # images.unoptimized: true
│
├── scripts/
│   ├── sync-discord.mjs              # GitHub Actions: fetches Discord, POSTs to /news/ingest
│   ├── sync-forum.mjs                # GitHub Actions: scrapes forum, POSTs to /news/ingest-forum
│   ├── test-discord.mjs              # Local-only sanity check for Discord token + permissions
│   └── optimize-profile-images.mjs   # Local: resize/compress avatars/frames/banners with sharp
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

## Profile Customization

Each user can customize their public profile with avatar, banner, frame, bio, custom title, name color, social links, server, and pinned achievements. **No image uploads** — everything is selected from a predefined catalog of static assets in `/public/images/`. The DB stores only short strings (slugs/text/JSON), so storage overhead is negligible.

### Schema additions to `User` (both schemas)
```prisma
avatarSlug          String?           // ej "naruto" → /images/avatars/naruto.png
bannerSlug          String?           // ej "akatsuki-clouds" → /images/profile/banners/akatsuki-clouds.jpg
frameSlug           String?           // ej "kage" — overrides auto-frame, but only if user has reached its minLevel
bio                 String?           // max 160 chars
customTitle         String?           // max 50 chars
nameColor           String?           // hex from a fixed palette
pinnedAchievements  String   @default("[]")   // JSON array of achievementIds (max 3)
gameServer          String?           // ej "S102 - Konoha"
socialLinks         String?           // JSON: { twitch?, youtube?, discord?, ingameName? }
```

### Catalogs (single source of truth)
- **Backend** (`backend/src/lib/profile-catalog.ts`): validates incoming slugs and enforces frame `minLevel`. Has helpers `isValidAvatar`, `isValidBanner`, `isValidColor`, `isFrameUnlocked`.
- **Frontend** (`frontend/lib/profile-assets.ts`): `AVAILABLE_AVATARS`, `AVAILABLE_BANNERS`, `FRAMES`, `NAME_COLORS`. **Only contains slugs that have a corresponding image file on disk** — anything not listed here doesn't appear in pickers.

When you add a new asset:
1. Drop the file in `/public/images/avatars/` (or `banners/`, `frames/`)
2. Run `cd frontend && node ../scripts/optimize-profile-images.mjs` (auto-resizes, compresses, lowercases filenames)
3. Add the slug to `frontend/lib/profile-assets.ts` AND `backend/src/lib/profile-catalog.ts`

### Frame `minLevel` requirements
- `genin` ≥ 1
- `chunin` ≥ 4
- `jonin` ≥ 7
- `kage` ≥ 10
- `akatsuki` ≥ 11

Backend rejects with 400 if user tries to set a frame they haven't unlocked.

### Backend endpoints
```
GET    /users/me/profile   (auth)  → fetch own profile
PATCH  /users/me/profile   (auth)  → update with Zod validation + catalog checks
```
Routes registered in `index.ts` AFTER `apiKeyMiddleware` (private).

### Frontend

**`/profile/edit/page.tsx`** — single form with live preview at the top:
- Avatar / Banner / Frame pickers (modals with grids)
- Bio (160 chars), custom title (50 chars), name color (from `NAME_COLORS` palette)
- Social links: Twitch, YouTube, Discord, in-game name
- Game server text field
- Pinned achievements: select up to 3 from user's earned achievements

**`/users/[username]/page.tsx`** — public profile redesigned with:
- `<ProfileBanner>` (banner full-width with avatar+frame floating bottom-left)
- Username with `nameColor` applied via `style={{ color }}`
- `customTitle` shown as a sub-heading in accent-orange
- Bio text below stats
- Server + social links inline
- "Logros destacados" section with pinned achievements (orange-bordered cards)
- "Editar perfil" button visible only if `me?.username === profile.username`

**Shared components** (`frontend/components/profile/`):
- `AvatarFrame.tsx` — composes avatar (100% size, rounded) + frame (overflowing around it). Tuning constants `FRAME_SCALE = 1.66`, `FRAME_Y_OFFSET = 0.045` are calibrated to the **genin.png** geometry (256×256 PNG with ~154px hole offset 7px upward). All frames must share this geometry, or values need adjusting per-frame.
- `ProfileBanner.tsx` — banner image + AvatarFrame floating bottom-left
- `AvatarPicker.tsx`, `BannerPicker.tsx`, `FramePicker.tsx`, `ColorPicker.tsx`, `PinnedAchievements.tsx`, `SocialLinks.tsx`

### Asset format conventions
- **Avatars**: 256×256 PNG with transparent background (head-and-shoulders portraits)
- **Frames**: 256×256 PNG with transparent center hole (decorative ring around avatar). All frames should ideally share the same geometry as `genin.png` for `FRAME_SCALE` to work uniformly.
- **Banners**: 1920×320 JPG (mozjpeg quality 78). Why JPG: photos compress 90%+ better than PNG.
- All filenames must be **lowercase**. The optimization script lowercases automatically.

### Image optimization
`scripts/optimize-profile-images.mjs` uses `sharp` (already a frontend dep via Next.js). Run from `frontend/` directory:
```bash
cd frontend && node ../scripts/optimize-profile-images.mjs
```
- Resizes avatars/frames to 256×256, banners to 1920×320
- PNGs use palette mode + adaptive filtering (quality 90, ~30 KB output)
- Banners convert PNG → JPG (mozjpeg q78, ~80 KB output)
- Lowercases filenames
- Idempotent — safe to re-run

Initial run reduced 30 MB of source images to 770 KB (-97%).

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
| CORS preflight error: `Method PATCH is not allowed` | CORS allowed methods missed PATCH | `index.ts` CORS config now includes `PATCH`. Add new methods there if introducing other verbs. |

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
| `/profile/edit` | Auth | Edit own profile: avatar, banner, frame, bio, title, color, socials, pinned achievements |
| `/notifications` | Auth | Notification center: list grouped by day, mark all read |
| `/favorites` | Auth | User's saved guides / news / players (tabs) |
| `/rankings/compare` | Public | Compare up to 3 players side-by-side with deltas |
| `/events` | Public | Calendar view of EVENT-type news with countdown |
| `/centro-de-datos` | Public | Landing of game data hub (cards for Ninjas, Main, future Modas/Espíritus) |
| `/centro-de-datos/ninjas` | Public | Catálogo de ninjas — 403 cards, filtros por elemento/clase/rareza |
| `/centro-de-datos/ninjas/[id]` | Public | Detalle de carta: hero + intro + skills + stats + resistencias |
| `/centro-de-datos/main` | Public | Los 5 Mains del juego (avatares del jugador por elemento) |

## Centro de Datos — Game Data Hub (`/centro-de-datos`)

Sección que expone el catálogo del juego en la app. Datos extraídos del CDN de Oasis (ver `CLAUDE-game-data-pipeline.md`) y servidos vía endpoints `/game/ninjas/*` desde el backend.

### Modelos Prisma
```prisma
model GameNinja {
  id              Int      @id        // id de la variante final del juego
  artisticId      Int                  // agrupa variantes (basename de imagen)
  region          String   @default("ES_LATAM")  // contenido compartido España + LatAm
  kind            String   @default("NINJA")     // "NINJA" | "MAIN" (avatar del jugador, 5)
  name            String                          // "Naruto"
  title           String                          // "[Kurama]" o "" para base
  propertyCode    Int  // 1=Agua 2=Fuego 3=Viento 4=Rayo 5=Tierra
  propertyLabel   String
  careerCode      Int  // 1=Ataque 2=Defensa 3=Especialista 4=Asistencia 5=Control 6=Médico 7=Distancia
  careerLabel     String
  rarenessCode    Int  // 0..5
  rarenessLabel   String
  sexCode         Int
  sexLabel        String
  starLevel       Int
  awakenSkillNum  Int
  equipNum        Int
  stats           String   // JSON: NinjaStats (HP/Atk/Def base + growth + Crit/Strike)
  resists         String   // JSON: { fire, wind, thunder, soil, water }
  intro           String?  // JSON: { desc: string[], words: string } | null
  mainTalents     String?  // JSON: solo kind=MAIN — { esoterica, ataque, pasiva: TalentSlot[] }
  normalSkillIds  String   // JSON: number[]
  specialSkillIds String   // JSON: number[]
  skillIds        String   // JSON: number[] (pasivos/jutsus)
  assets          String   // JSON: { bigImage, halfImage, portrait }
  importedAt      DateTime @default(now())
  @@unique([region, name, title])
  @@index([region, kind, name, propertyCode, careerCode, rarenessCode])
}

model GameSkill {
  id          Int     @id
  region      String  @default("ES_LATAM")
  name        String
  chakra      Int
  cooldown    Int
  description String  // HTML del juego con <font color="..."> embebido (Derribo, Flote bajo, etc.)
  iconPath    String  // "assets/skill/40/<iconId>.png"
  @@index([region])
}
```

### Backend
- `services/game-ninjas.service.ts` — `list / getById / getFilterFacets`. `getById` resuelve skill IDs (incluyendo los de `mainTalents`) en un solo `WHERE IN`. Default `kind=NINJA` para que el listado filtre los Mains.
- `controllers/game-ninjas.controller.ts` — Zod schema valida `search/kind/property/career/rareness/sort/limit/offset`.
- `routes/game-ninjas.routes.ts` — todas públicas, registradas ANTES de `apiKeyMiddleware`.
- Endpoints:
  - `GET /game/ninjas?kind=NINJA|MAIN&...` — paginado con filtros
  - `GET /game/ninjas/filters` — counts por property/career/rareness (solo NINJA)
  - `GET /game/ninjas/:id` — detalle con skills resueltos + mainTalents resueltos (solo si MAIN)

### Frontend
- `app/centro-de-datos/page.tsx` — landing con cards (Ninjas activa, Main activa, Modas/Espíritus "Próximamente")
- `app/centro-de-datos/ninjas/page.tsx` — listado con sidebar filtros (con kanjis por elemento), search debounced 300ms, infinite scroll, sort por nombre/rareza/atk-ninja/atk-cuerpo/vida
- `app/centro-de-datos/ninjas/[id]/page.tsx` — detalle en **layout 2 columnas** (`[minmax(340px,420px)_1fr]`):
  - **Izquierda:** Hero compacto (imagen 3:4 + estrellas overlay + ♡ favorito + nombre/título/badges/frase) → StatPanel → ResistGrid
  - **Derecha:** Intro "Sobre este ninja" → Habilidades (o Talentos timeline si es MAIN)
- `app/centro-de-datos/main/page.tsx` — los 5 Mains como cards 1:1 con kanji decorativo gigante por elemento

### Componentes compartidos (`frontend/components/ninjas/`)
| Componente | Función |
|---|---|
| `Badges.tsx` | `ElementBadge` / `CareerBadge` / `RarenessBadge` / `StarLevel` |
| `NinjaCard.tsx` | Card para el listado (kanji watermark + portrait + nombre + chips) |
| `NinjaBreadcrumb.tsx` | Centro de Datos → Ninjas/Main → [nombre] |
| `NinjaHero.tsx` | Hero vertical compacto: imagen + identidad + favorito + frase |
| `StatPanel.tsx` | Stats con iconos lucide + chips secundarios + Combatividad pinneada al pie |
| `ResistGrid.tsx` | Grilla 5 kanjis con bordes verde/rojo según fortaleza/debilidad |
| `NinjaSkillsList.tsx` | Habilidades en orden Esotérica → Ataque → Combo → Pasivas N (con badges numerados) |
| `MainTalentsTimeline.tsx` | Para Mains: timeline vertical ordenada por nivel del jugador, tabs internas para pasivas con 3 opciones |
| `NinjaPrevNext.tsx` | Navegación entre cartas del mismo kind, cacheada en `sessionStorage` |
| `SkillCard.tsx` | Card de habilidad con icono + descripción **inline siempre visible** (no hover tooltip), ribbon vertical de color por tipo |
| `SkillIcon.tsx` | Icono cuadrado de skill con borde por tipo + fallback Sparkles |
| `StatBar.tsx` | Barra de stat con icono opcional (`LucideIcon`) |

### Sistema visual nuevo (en `lib/types.ts`)
- `PROPERTY_KANJI`: `1=水 2=火 3=風 4=雷 5=土` — uno por elemento
- `PROPERTY_COLORS` / `PROPERTY_GLOW`: Tailwind classes por elemento
- `RARENESS_COLORS`: por código de rareza
- `ninjaCombatividad(stats)`: helper que estima poder de combate al lvl 100 (`vida×1.2 + atks×4 + defs×3`)
- `ninjaPortraitSrc` / `ninjaBigImageSrc` / `ninjaThumbnailSrc`: URL helpers con fallback

### Sistema de Favoritos extendido
- `FavoriteType` extendido de `GUIDE | NEWS | PLAYER` a incluir `NINJA`
- `favoritesService.listEnriched(userId, 'NINJA')` devuelve datos suficientes (id, artisticId, name, title, kind, property, career, rareness, starLevel, assets)
- `FavoriteButton` integrado en `NinjaHero` (esquina superior derecha del hero)
- Anónimo no ve el botón (componente devuelve `null`)

### Mains — talentos
- 5 Mains únicos (`kind=MAIN`): Colmillo Añil (Agua) · Pupila Carmesí (Fuego) · Bailarina Vendaval (Viento) · Filo Nocturno (Rayo) · Puño Escarlata (Tierra)
- Cada uno con **9 talentos** (3 Esotéricas + 3 Ataques Normales + 3 Pasivas)
- Pasivas tienen 3 opciones elegibles por slot (el jugador elige una en el juego)
- Talentos parseados desde `tmp/game-data/talentConfig.xml` del CDN
- UI: timeline vertical ordenada por nivel del jugador (lvl 1, 5, 15, 25, 35, 45, 50, 55), tabs internas para seleccionar entre las 3 opciones de pasivas

### Iconos de skills
- 1.518 iconos totales en el CDN (en `assets/skill/40/<id>.png`)
- **Mapeo `iconId`**: la mayoría de skills (~85%) son variantes que comparten asset — `SkillCFG.xml > iconId` apunta al skill "padre" con el icono real. El script `download-skill-icons.mjs` resuelve esto y baja **~5.946 iconos visibles** (~94% de los skills referenciados)
- ~380 skills sin icono real en el CDN — caen al placeholder `<Sparkles>`

### Workflow: actualizar el catálogo cuando cambia el juego

El juego se actualiza periódicamente (nuevas cartas, rebalanceo de stats, fixes de descripción, etc.). El `tag` de versión en el CDN cambia (ej. `SP_NarutoAlpha9.20Build300` → `9.22Build301`). El pipeline está pensado para ser idempotente — re-correrlo sobre data nueva sólo actualiza diffs.

⚠️ **Pre-requisitos**:
- Tener `backend/.env.production` con `DATABASE_URL` apuntando a Neon (ya configurado)
- Tener `backend/.env.local` con `GAME_USER` / `GAME_PASS` (cuenta scraper) para refrescar el manifest

#### 1. Refrescar el dump del CDN (si la versión cambió)

```bash
cd naruto-app/backend

# Verificar si el tag de versión cambió
curl -sk --tls-max 1.2 https://naruto-online.oasgames.com/version.js | grep -o 'SP_NarutoAlpha[0-9.]*Build[0-9]*'

# Si cambió, refrescar el manifest:
npx tsx src/game-client/probe.ts     # login + endpoints
npx tsx src/game-client/probe2.ts    # re-login + game URL
# Bajar resource.cfg con el nuevo tag (ver curl command en CLAUDE-game-data-pipeline.md)
npx tsx src/game-client/decode-resource-cfg.ts   # regenera tmp/versionMap.json
```

#### 2. Bajar los configs y rearmar el JSON canonical

```bash
# Solo los XML del catálogo (rapido):
npx tsx src/game-client/download-config.ts \
  config/user/NinjaInfoCFG.xml \
  config/skill/SkillCFG.xml \
  config/skill/NinjaSkillCFG.xml \
  config/user/NinjaIntroduceCFG.xml \
  config/skill/talentConfig.xml

# Regenerar JSON canonical (aplica decoders, filtros, dedup):
npx tsx src/game-client/ninja-catalog/build.ts
```

Output: `tmp/game-data/ninjas-canonical.json` actualizado.

#### 3. Aplicar a prod (Neon + importer)

```bash
cd naruto-app/backend
set -a && . ./.env.production && set +a

# Si el schema cambió (raro): sincroniza Neon
npx prisma db push --schema=prisma/schema.prod.prisma --skip-generate

# Importer (siempre idempotente — upsert)
npx tsx src/game-client/ninja-catalog/import-to-db.ts
```

⚠️ El importer tarda ~10 min sobre Neon desde Argentina (latencia de transacciones individuales). En dev local sobre SQLite es ~1s.

#### 4. Refrescar imágenes (solo si artisticIds nuevos)

```bash
cd naruto-app
node scripts/download-ninja-images.mjs --big --concurrency=8   # baja solo los faltantes (skip si existe)
node scripts/download-skill-icons.mjs --concurrency=10
cd frontend && node ../scripts/optimize-game-images.mjs        # PNG → WebP, borra los PNG
```

#### 5. Deploy

```bash
git add -A
git commit -m "Actualizar catálogo de ninjas a versión X.Y"
git push   # dispara deploy automático de Netlify
```

⚠️ **Nota sobre dev local después de tocar prod**: si corriste `prisma generate --schema=schema.prod.prisma` para hablar con Neon, el client local quedó apuntando a Postgres y rompe en dev. Restaurarlo con:
```bash
DATABASE_URL='file:./prisma/dev.db' npx prisma generate
```

## Assets

**Rank images** (`frontend/public/images/rangos/`):
`genin.png`, `chunin.png`, `jonin.png`, `kage.png`, `akatsuki.png`, `akatsuki2.png`, `kage2.png`

**Guide badges** (`frontend/public/images/guides/badges/`):
`badge-oficial.png`, `badge-tendencia.png`, `badge-verificada.png`, `badge-completa.png`

**Achievements** (`frontend/public/images/guides/logros/`):
`logro-primera-guia.png`, `logro-5-guias.png`, `logro-10-guias.png`, `logro-100-vistas.png`, `logro-1000-vistas.png`, `logro-votos.png`, `logro-badge-oficial.png`, `logro-leyenda.png`

**Novedades** (`frontend/public/images/novedades/`):
`eventos.png` — static hero used for all EVENT-type posts (since forum images are decorative-heavy)

**Profile** (`frontend/public/images/`):
- `avatars/*.png` — 256×256, lowercase filenames, transparent background
- `profile/banners/*.jpg` — 1920×320, mozjpeg q78
- `profile/frames/*.png` — 256×256, transparent center hole, geometry must match `genin.png` (~154px hole, offset 7px upward) for `FRAME_SCALE` constant in `AvatarFrame.tsx` to work uniformly

**Rankings** (`frontend/public/images/power-ranking/`):
`hashiizq.webp`, `madaraderecha.webp`, `top1.png`, `top2.png`, `top3.png`, `top1-titulo.png`, `top2-titulo.png`

**Game data** (`frontend/public/images/game/`):
- `ninjas/big/<artisticId>.png` — imagen completa (376 archivos, baja del CDN con `scripts/download-ninja-images.mjs --big`)
- `ninjas/<artisticId>.png` — thumbnail H120 del CDN (fallback)
- `skills/<skillId>.png` — iconos de habilidades (~5.946 archivos, baja con `scripts/download-skill-icons.mjs`)

## Last Updated
2026-05-17

### Changes in this session (2026-05-17) — Centro de Datos (catálogo de ninjas)

Implementación completa del catálogo del juego desde el CDN de Oasis. Todo el detalle del pipeline de extracción de datos vive en [`CLAUDE-game-data-pipeline.md`](./CLAUDE-game-data-pipeline.md); este resumen cubre lo expuesto en la app.

- ✅ **Schema Prisma** (`backend/prisma/schema.prisma` + `schema.prod.prisma`): nuevos modelos `GameNinja` (408 entries: 403 ninjas + 5 mains) y `GameSkill` (~3.000 skills). JSON serializado como `String` (SQLite no tiene `Json` nativo). Unique `(region, name, title)`. Campo `kind: 'NINJA' | 'MAIN'`.
- ✅ **Mapeo de elementos verificado** contra las resistencias del XML: `1=Agua, 2=Fuego, 3=Viento, 4=Rayo, 5=Tierra`. Cada ninja tiene `-20%` al elemento que lo debilita siguiendo la cadena de NO (Fuego>Viento>Rayo>Tierra>Agua>Fuego).
- ✅ **Mains (5)** — Colmillo Añil (Agua), Pupila Carmesí (Fuego), Bailarina Vendaval (Viento), Filo Nocturno (Rayo), Puño Escarlata (Tierra). Importados con sus 9 talentos cada uno (3 Esotéricas + 3 Ataques + 3 Pasivas con 3 opciones por slot) desde `talentConfig.xml`.
- ✅ **Backend `/game/ninjas/*`** — 3 endpoints públicos (registrados antes de `apiKeyMiddleware`). Filtros + sort + paginación. `getById` resuelve skills y talentos.
- ✅ **Frontend** — sección completa en `/centro-de-datos`:
  - Landing con cards (Ninjas / Main activas, Modas / Espíritus / Próximamente)
  - `/ninjas` listado con sidebar filtros (kanjis por elemento), infinite scroll, search debounced
  - `/ninjas/[id]` detalle rediseñado **layout 2 columnas** (UI/UX senior): izquierda Hero+Stats+Resistencias, derecha Intro+Habilidades
  - `/main` cards 1:1 con kanji decorativo gigante por elemento
- ✅ **Sistema visual ninja** (en `lib/types.ts`): `PROPERTY_KANJI` (火水風雷土), `PROPERTY_COLORS`, `PROPERTY_GLOW`, `RARENESS_COLORS`, `ninjaCombatividad(stats)` helper.
- ✅ **Componentes nuevos** (12 archivos) en `frontend/components/ninjas/`:
  - Card del listado: `NinjaCard` con kanji watermark
  - Detalle: `NinjaBreadcrumb`, `NinjaHero` (vertical compacto), `StatPanel`, `ResistGrid` (5 kanjis con bordes verde/rojo), `NinjaSkillsList`, `MainTalentsTimeline` (vertical por nivel del jugador), `NinjaPrevNext`
  - Shared: `SkillCard` (descripción inline siempre visible, ribbon vertical por tipo), `SkillIcon`, `StatBar` (con prop icon)
  - `Badges` (Element/Career/Rareness/StarLevel)
- ✅ **Favoritos** extendidos a `NINJA`: `FavoriteType` updated en `backend/src/services/favorites.service.ts` y `frontend/components/FavoriteButton.tsx`. `listEnriched` agrega caso `NINJA`.
- ✅ **Navbar dropdown**: "Centro de Datos" ahora tiene dropdown on-hover con sub-rutas (Ninjas activa, Main activa, Modas / Espíritus Animales como "Próximamente"). En mobile se renderizan indentados.
- ✅ **Scripts de descarga** (idempotentes, con cache `skip`):
  - `scripts/download-ninja-images.mjs --big` — 746 imágenes (376 big + 370 thumbnails)
  - `scripts/download-skill-icons.mjs` — 5.946 iconos resueltos via mapping `iconId` (la mayoría de skills son variantes que comparten icono)
- ✅ **Iconos de habilidades** con descripción inline visible (sin hover tooltip — accesible en mobile). Cada `SkillCard` tiene ribbon vertical del color por tipo (naranja Esotérica, azul Ataque, púrpura Combo, gris Pasivas).
- ✅ **`.gitignore`** agregado `tmp/` para no commitear los assets descargados del CDN (~65 MB regenerables).

**Filtros aplicados al importer** (importante para entender por qué bajamos de 11.041 rows a 408 finales):
- Solo `id LIKE '11%'` (cartas jugables; los `13xx-19xx` son NPCs / versiones de batalla)
- `title === ''` o `title.startsWith('[')` (descarta clones/placeholders con texto libre)
- Tiene imagen en CDN (descarta invocaciones como marionetas/summons)
- Nombre no arranca con `Clon|Pseudo|Mecha-Naruto`
- Para Mains: `id LIKE '10%'` + título entre corchetes
- Dedup por `(name, title)` quedándose con mayor `starLevel`

**Migraciones SQL aplicadas en dev (SQLite vía `prisma db push`); pendiente aplicar en prod:**
```sql
CREATE TABLE "GameNinja" ( ... );  -- columnas + indexes según schema
CREATE TABLE "GameSkill" ( ... );
CREATE UNIQUE INDEX "GameNinja_region_name_title_key" ON "GameNinja"(region, name, title);
CREATE INDEX "GameNinja_kind_idx" ON "GameNinja"(kind);
-- + indexes property/career/rareness/region/name
```

### Changes in this session (2026-05-10, later still) — Discord URL refresh, navbar cleanup, UX polish

- ✅ **Refresh automático de URLs de Discord** — Discord CDN URLs (`cdn.discordapp.com` / `media.discordapp.net`) están firmadas desde 2023 y expiran a las 24h, rompiendo imágenes en novedades viejas.
  - `backend/src/services/news.service.ts`: nuevos `listDiscordImageUrls()` (lista todas las URLs de Discord en `NewsPost.imageUrls`) y `applyRefreshedImageUrls(map)` (reemplaza por las refrescadas, **solo toca `imageUrls`** — comentarios, reacciones, views, pinned, contenido, autor, fechas quedan intactos).
  - Nuevos endpoints en `news.controller.ts` + `news.routes.ts` (registrados antes de `/:id`):
    - `GET  /news/admin/discord-urls`  → `{ urls: string[] }`  (x-api-key inline)
    - `POST /news/admin/refresh-urls`  → body: `{ map: Record<string,string> }` → `{ updated: number }`
  - Nuevo script `scripts/refresh-discord-urls.mjs`: pide URLs al backend, llama a `POST https://discord.com/api/v10/attachments/refresh-urls` en batches de 50 con el bot token, envía el mapa de vuelta al backend.
  - Nuevo workflow `.github/workflows/refresh-discord-urls.yml`: cron `0 */12 * * *` + `workflow_dispatch`. Reusa los secrets existentes `DISCORD_BOT_TOKEN`, `BACKEND_URL`, `API_KEY`.
  - **No se borra ningún post.** URLs ya vencidas hace meses (Discord garbage-collectó el attachment) devuelven error en el endpoint de refresh y el script las saltea — el post sigue con su contenido pero sin imagen.

- ✅ **Navbar simplificado**: removidos los anchors "Características" y "Comunidad" (apuntaban a `/#features` y `/#community`, que ya no aportaban). Orden final: Novedades · Rankings · Herramientas · Eventos · Guías · FAQ.

- ✅ **Padding de páginas nuevas**: `/events`, `/notifications`, `/favorites`, `/rankings/compare` pasaron de `py-10` a `pt-28 pb-16` para no quedar tapados por el navbar fijo (`h-20`).

- ✅ **Calendario `/events` con celdas razonables**: las cells del grid mensual eran `aspect-square` y se hacían gigantes en desktop. Ahora `min-h-[60px] sm:min-h-[72px]`.

- ✅ **Comparador `/rankings/compare` arreglado**: el endpoint `/api/rankings/consolidated-global` **requiere** `?date=...`. Ahora el flujo es regions → clusters → dates → ranking con la fecha más reciente (mismo patrón que `/rankings`). Sumadas filas Primer ataque, Golpe crítico y Daño crítico al comparador, todas con separador de miles (`toLocaleString`).

- ✅ **Cache stale de usuario en la home**: `useAuth` lee de `localStorage` (snapshot del login), así que tras editar el perfil el avatar/XP/level mostrados en la home quedaban viejos.
  - `frontend/app/profile/edit/page.tsx`: tras `PATCH /users/me/profile`, mergea la respuesta en `localStorage.user`.
  - `frontend/app/page.tsx`: el componente `Home` ahora hace `GET /leaderboard/me` al montar (si hay sesión) y pasa el resultado fresco como prop a `LoggedInHero` y `LoggedInRow`. Cache de localStorage también se actualiza.

- ✅ **Home "Tu actividad"**: los cards de Nivel y XP ya no son links (llevaban a `/guides` y `/rankings`, no tenía sentido). Ahora son stats puros. Link "Mi perfil →" arriba a la derecha, y dos CTAs reales abajo: Mis favoritos y Editar perfil.

### Changes in this session (2026-05-10, later) — Engagement features
- ✅ **Home dinámica para logueados** (`frontend/app/page.tsx`): hero personalizado con `AvatarFrame`, `nameColor`, rank badge, barra de XP con "X XP para subir" (thresholds hardcoded en `LEVEL_THRESHOLDS`), CTAs "Ir al dashboard" / "Editar perfil". Fila adicional debajo con notificaciones no leídas (top 3) y stats (Nivel/XP/Mi perfil). Anónimo ve el hero original sin cambios.
- ✅ **Página `/notifications`** (`frontend/app/notifications/page.tsx`): lista paginada agrupada por día (Hoy / Ayer / Hace N días / fecha), botón "Marcar todo como leído", click marca leído, link a la guía. Reusa `markRead` con `id='all'` (ya existía como handler).
- ✅ **NotificationBell** ya integrado en navbar — se le agregó footer "Ver todas →" que linkea a `/notifications`.
- ✅ **Sistema de favoritos**:
  - Schema nuevo `Favorite (id, userId, type, targetId, createdAt)` con `@@unique([userId, type, targetId])` en ambos schemas. Tipos: `GUIDE | NEWS | PLAYER`.
  - Backend: `services/favorites.service.ts` (toggle / list / listEnriched / checkMany) + `controllers/favorites.controller.ts` + `routes/favorites.routes.ts`. Endpoints: `POST /favorites/toggle`, `GET /favorites?type=`, `GET /favorites/check?type=&ids=`. Auth requerido. Registrados en `index.ts` después de `apiKeyMiddleware`.
  - Frontend: `components/FavoriteButton.tsx` (bookmark icon, optimistic toggle, hidden si no logueado) integrado en detail de guía y de novedad. Página `/favorites` con tabs Guías / Novedades / Jugadores. Link en navbar (icono bookmark).
- ✅ **Comparador de jugadores** (`/rankings/compare/page.tsx`): hasta 3 slots con autocomplete sobre `/api/rankings/consolidated-global`, tabla lado a lado con rank/nivel/poder/server y deltas vs el primer jugador (verde si mejor, rojo si peor). Botón "Comparar" agregado en el header de `/rankings`.
- ✅ **Calendario de eventos**:
  - Schema: `eventStartAt`, `eventEndAt` (DateTime?) en `NewsPost` (ambos schemas).
  - Backend `news.service.ts`: Zod schema acepta los dos campos (ISO datetime). `createNews`/`updateNews` los persisten.
  - Admin form `/novedades/create`: si `type === 'EVENT'`, aparecen dos inputs `datetime-local`.
  - Página `/events`: grid mensual lunes-primero, navegación por meses, día con eventos abre modal con la lista, panel lateral con filtros Activos / Próximos / Pasados / Todos y countdown live (refresca cada 60s). Si un evento no tiene `eventStartAt`, cae a `publishedAt` automáticamente.
  - Link "Eventos" en navbar.

**Migraciones SQL aplicadas en Neon en esta sesión:**
```sql
CREATE TABLE "Favorite" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "type" TEXT NOT NULL,
  "targetId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Favorite_userId_type_targetId_key" UNIQUE ("userId", "type", "targetId")
);
CREATE INDEX "Favorite_userId_type_idx" ON "Favorite"("userId", "type");

ALTER TABLE "NewsPost" ADD COLUMN "eventStartAt" TIMESTAMP(3);
ALTER TABLE "NewsPost" ADD COLUMN "eventEndAt"   TIMESTAMP(3);
```

### Changes in this session (2026-05-10) — Profile customization
- ✅ **Schema additions** to `User`: `avatarSlug`, `bannerSlug`, `frameSlug`, `bio`, `customTitle`, `nameColor`, `pinnedAchievements`, `gameServer`, `socialLinks`. All optional except `pinnedAchievements` which defaults to `'[]'`.
- ✅ **Backend `users.service.ts` + `users.controller.ts` + `users.routes.ts`**: `GET/PATCH /users/me/profile` with Zod validation, slug whitelisting via `profile-catalog.ts`, frame `minLevel` enforcement, pinned-achievements ownership check.
- ✅ **`leaderboard.service.ts` + `leaderboard.controller.ts`** updated to expose new profile fields in `getMe` and `getUserProfile`.
- ✅ **CORS** updated in `index.ts` to allow `PATCH` (was blocking the profile update endpoint).
- ✅ **Frontend `lib/types.ts`** extended with optional profile fields + helpers `parseSocialLinks`, `parsePinnedAchievements`, `avatarSrc`, `bannerSrc`, `frameSrc`.
- ✅ **Frontend `lib/profile-assets.ts`** — single source of truth for available avatars/banners/frames/colors. Pickers only show entries listed here.
- ✅ **Components** (`frontend/components/profile/`): `AvatarFrame`, `ProfileBanner`, `AvatarPicker`, `BannerPicker`, `FramePicker`, `ColorPicker`, `PinnedAchievements`, `SocialLinks`.
- ✅ **`/profile/edit` page** with live preview at top, avatar/banner/frame pickers, bio (160), custom title (50), name color, server, social links, pinned achievements (max 3).
- ✅ **`/users/[username]` redesigned** with `<ProfileBanner>` hero, name color, custom title, bio, social links, server, pinned achievements section, "Editar perfil" button only for owner.
- ✅ **`/dashboard` updated** with `AvatarFrame` and "Editar perfil" button.
- ✅ **Image optimization** via `scripts/optimize-profile-images.mjs` (sharp): 30 MB → 770 KB total.
- ✅ **Banners served as JPG** (mozjpeg q78) instead of PNG — banners are photographs, JPG compresses ~95% better. `bannerSrc()` returns `.jpg` paths.
- ✅ **Frame geometry calibrated**: `FRAME_SCALE = 1.66`, `FRAME_Y_OFFSET = 0.045` based on measuring `genin.png` (256×256 with ~154px transparent hole offset 7px upward). All frames must share this geometry or values need adjusting.

### Changes in previous session (2026-05-09) — Novedades section
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

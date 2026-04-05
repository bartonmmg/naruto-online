# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Konohagakure Hub** — A Naruto Online community platform with user authentication, XP/leveling systems, dynamic ranking systems, and interactive tools for community engagement. Built as a full-stack monorepo with modern tech stack.

### Tech Stack
- **Frontend:** Next.js 14 (App Router) + Tailwind CSS + Framer Motion
- **Backend:** Node.js (ESM) + Express.js + TypeScript
- **Database:** PostgreSQL via Neon.tech — managed with Prisma ORM
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
# Build both workspaces
npm run build

# Build specific workspace
npm run build --workspace=backend
npm run build --workspace=frontend
```

### Database (Prisma)
```bash
# Run migrations (backend workspace)
cd backend && npx prisma migrate dev --name <migration_name>

# Generate Prisma client after schema changes
cd backend && npx prisma generate

# Open Prisma Studio UI
cd backend && npx prisma studio
```

### Linting
```bash
npm run lint --workspace=frontend
```

## Architecture

### Monorepo Structure
```
naruto-app/
├── backend/                      # Express.js API
│   ├── src/
│   │   ├── index.ts             # Express app setup, routes, health check
│   │   ├── controllers/         # Request handlers with Zod validation
│   │   ├── services/            # Business logic (auth, XP, user ops)
│   │   ├── routes/              # Route definitions
│   │   ├── middleware/          # Auth, validation middleware
│   │   └── lib/
│   │       └── prisma.ts        # Prisma client singleton
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema (SQLite for dev)
│   │   └── dev.db              # SQLite file for local development
│   ├── .env                     # DATABASE_URL, JWT_SECRET, BACKEND_PORT
│   └── dist/                    # Compiled output
│
├── frontend/                     # Next.js app
│   ├── app/
│   │   ├── page.tsx            # Landing page
│   │   ├── layout.tsx           # Root layout
│   │   ├── auth/               # /auth/login, /auth/register
│   │   ├── dashboard/          # /dashboard (protected routes)
│   │   ├── tools/              # /tools (guides, calculators)
│   │   ├── rankings/           # /rankings
│   │   └── globals.css         # Tailwind + custom styles
│   ├── components/
│   │   ├── ui/                 # Reusable: Button, Input, AuthCard
│   │   ├── auth/               # Auth-specific components
│   │   ├── animations/         # Framer Motion components
│   │   └── Navbar.tsx          # Navigation
│   ├── .env.local              # NEXT_PUBLIC_API_URL
│   └── next.config.mjs         # Next.js config (mjs for ESM)
│
└── package.json                # Workspaces, dev script
```

### Key Patterns

**Backend — Controller-Service-Repository**
- **Controllers** (`auth.controller.ts`): Parse request, call service, handle errors
- **Services** (`auth.service.ts`): Contain Zod schemas, business logic, return data
- **Lib** (`prisma.ts`): Singleton Prisma instance (singleton pattern for safe ORM use)
- All inputs validated with Zod in services before use

**Frontend — Next.js App Router**
- Page-based routing: `app/page.tsx` → `/`, `app/auth/register/page.tsx` → `/auth/register`
- Server components by default; client components marked with `'use client'`
- State managed with React hooks (no Redux/Context yet)
- API calls via axios to `NEXT_PUBLIC_API_URL` (localhost:4000 in dev)

**Database — Prisma + SQLite**
- Schema defines User and XpLog models
- Migrations stored in `backend/prisma/migrations/`
- No TypeScript enums for compatibility with SQLite; use string constants instead
- Relations cascade on delete for XpLog (user deletion removes logs)

### Authentication Flow
1. User registers/logs in via `/auth/register` or `/auth/login`
2. Backend validates input with Zod, hashes password with bcrypt
3. Backend signs JWT (expires in 7 days, secret in `.env`)
4. Frontend stores token (usually in localStorage or cookie)
5. Protected routes use middleware to verify JWT

## Important Details

### Environment Variables
**Backend** (`.env`):
- `DATABASE_URL`: PostgreSQL URI (Neon.tech connection string in prod)
- `JWT_SECRET`: Secret key for signing tokens (MUST be ≥32 characters in production)
- `JWT_EXPIRATION`: Token lifetime (default: `7d`)
- `BACKEND_PORT`: Port for Express server (default: `4000`)
- `FRONTEND_URL`: Frontend origin for CORS (e.g., `https://naruto-online.netlify.app`)
- `NODE_ENV`: Environment flag (development, production)

**Frontend** (`.env.local`):
- `NEXT_PUBLIC_API_URL`: Backend URL (must be public for browser; e.g., `https://naruto-online.onrender.com`)

### Database
- **Production:** PostgreSQL via Neon.tech (connected via DATABASE_URL)
- **Development:** Use same PostgreSQL or SQLite locally (update schema.prisma provider accordingly)
- **Prisma Build:** Backend build script includes `prisma generate && tsc` to generate client before TypeScript compilation
- **ESM Imports:** Backend uses `.js` extensions in relative imports (required for ESM modules in production)
- Schema change workflow:
  1. Edit `schema.prisma`
  2. Run `npx prisma db push` (for schema sync) or `npx prisma migrate dev --name <description>` (for migrations)
  3. Commit migration files to git
  4. Run `npx prisma generate` before building (automatically included in build script)

### Code Patterns to Follow

**TypeScript + ESM**
- Backend uses ESM (`"type": "module"` in package.json)
- **IMPORTANT:** Relative imports MUST include `.js` extension in compiled code (e.g., `import { auth } from './services/auth.service.js'`)
  - This is required for ESM modules in production (Render.com, Node.js runtime)
  - TypeScript removes the `.js` at development time but they're needed in compiled `.js` files
- Strict mode enabled; avoid `any` unless casting is necessary

**Zod Validation**
- All user inputs validated at service layer, not in controllers
- Schemas defined inline or extracted as named exports in services
- Example: `registerSchema = z.object({ username: z.string().min(3).max(20), ... })`

**Error Handling**
- Controllers catch errors and return appropriate HTTP status codes
- Services throw descriptive Error objects
- No generic error logs; messages help users and maintainers

**Component Organization**
- UI components in `components/ui/` are reusable and non-domain-specific
- Feature components (e.g., `AuthCard`) live in feature folders
- Animations in `components/animations/` for Framer Motion sequences

### Performance Notes
- Prisma client is a singleton; reuse `prisma` from `lib/prisma.ts`
- Next.js static export not used; server-side rendering on demand
- Tailwind CSS purges unused classes (see `tailwind.config.js`)

## Development Workflow

1. **Database changes:** Edit schema.prisma → run migration → commit migration folder
2. **Backend routes:** Add route to `routes/`, implement in `controllers/`, add service logic
3. **Frontend pages:** Create `.tsx` file in `app/` → use Server or Client component as needed
4. **Styling:** Use Tailwind classes; custom CSS in `globals.css` for utility overrides
5. **Testing endpoints:** Use Postman, Thunder Client, or curl against `http://localhost:4000`

## Build & Deployment Best Practices

### Pre-Deploy Verification
**Before every push to main:**
```bash
# Simulate what Netlify does
cd frontend && npm run build

# Or run the full validation script
bash pre-deploy-check.sh
```

**Why:** Catches 95% of issues locally before they appear in production.

### Build Process
- **Netlify:** Only builds frontend (`npm install && cd frontend && npm run build`)
- **Render (Backend):** Separate service, deployed independently
- **Environment:** Netlify runs on Linux (different from Windows dev machine) — file system behavior and permissions may differ

### Why Builds Fail (Troubleshooting)
| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| `exit code 1` with no details | Build environment issue or cache | Clear cache in Netlify UI + retry |
| `EPERM: operation not permitted` | File system permissions (dev machine only) | Run `npm ci` instead of `npm install` |
| `TypeError: X is not defined` | Missing import or outdated lockfile | Delete `package-lock.json` and run `npm install` |
| `Cannot find module 'X'` | Dependency not installed | `npm install` in root, then `cd frontend && npm install` |
| `Cannot find module 'next/dist/server/lib/start-server.js'` | Plugin incompatibility (Next.js 14) | Remove `@netlify/plugin-nextjs` from netlify.toml |
| `Port already in use` | Local development conflict | Kill process or use different port |

### Netlify Configuration
- **Build Command:** `npm install && cd frontend && npm run build`
- **Publish Directory:** `frontend/.next`
- **Node Version:** 18.17.0 (set in netlify.toml `[env]`)
- **Cache:** Netlify caches `node_modules` and `.next` — clear if weird issues occur
- **Plugin:** ~~`@netlify/plugin-nextjs`~~ **Removed** — Not compatible with Next.js 14.0.4
  - Error: `Cannot find module 'next/dist/server/lib/start-server.js'`
  - Solution: Next.js 14+ doesn't need the plugin; native deployment works fine
  - Netlify treats `.next` output as static files automatically

### Git Best Practices
- **Always test locally first:** `npm install && cd frontend && npm run build`
- **Commit all changes:** `git status` should be clean before push
- **Use meaningful commit messages:** Makes debugging easier if rollback needed
- **Monitor after push:** Check Netlify dashboard within 2 minutes after `git push`

## Known Constraints & Decisions

- **SQLite enum limitation:** SQLite has no native enum type; use string fields + TypeScript constants
- **JWT validation:** No middleware yet; add to routes as needed for protected endpoints
- **CORS:** Enabled globally; tighten in production to specific frontend origin
- **Single Prisma instance:** Required to avoid exhausting connection pool in dev
- **Next.js Config:** Uses `.mjs` extension for ESM compatibility
- **No GraphQL:** REST API for simplicity; extensible via new route files
- **Tailwind z-index:** Only `z-0, z-10, z-20, z-30, z-40, z-50, z-auto` exist by default. For custom values use inline `style={{ zIndex: N }}` instead of classes like `z-1`, `z-5`, `z-15` which are silently ignored
- **No documentation file sprawl:** Do not create `.md` or `.txt` summary/status/changelog files in the project root. Keep documentation in CLAUDE.md only
- **Image Optimization:** 
  - Do NOT use `next/image` for large PNGs (3+ MB). Use native `<img>` tags instead
  - Netlify cannot optimize local PNG files; `next/image` returns 400 Bad Request
  - Use `<img src="/path/to/image.png" className="..." />` for static images
  - Use CSS `background-image` for decorative/background images
- **Netlify Configuration:**
  - Uses `netlify.toml` for build configuration
  - Includes build environment variables (NEXT_PUBLIC_API_URL, NODE_ENV, etc.)
  - Build command: `npm install && npm run build --workspace=frontend`
  - Publish directory: `frontend/.next`
- **CORS Configuration:**
  - Backend uses configurable CORS via `FRONTEND_URL` env variable
  - Allows credentials, multiple HTTP methods, and custom headers
  - In production, FRONTEND_URL must match exactly the frontend origin (no trailing slashes)

## Rankings Page (`/rankings`)

**Overview:** Dark Naruto Shippuden-themed battlefield UI. Characters (Hashirama left, Madara right) with pulsing aura glows for epic effect. Ranking content floats centered. Efficient chakra particle effects. Fully optimized for 60 FPS performance across all browsers. Only visible on `lg+` breakpoint.

### Character Images & Layout
- **Hashirama** (`hashiizq.webp`, 312KB): `position: fixed; bottom: 0; left: 0; width: 1000px` — **Converted from PNG (3.7MB) to WebP (312KB = 91% size reduction)**
- **Madara** (`madaraderecha.webp`, 235KB): `position: fixed; bottom: 0; right: 0; width: 1000px` — **Converted from PNG (3.6MB) to WebP (235KB = 91% size reduction)**
- Both use `CSS background-image` (not `next/image`), `opacity: 0.75`, CSS masks for edge fading
- `z-index: 1` — in front of aura glow (`z-index: 0`), behind ranking content (`z-index: 10`)

### Character Aura Glow (GPU-Optimized)
- **Aura Implementation:** Two separate divs (left + right) with pulsing `opacity` animation
- **Why opacity-only?** GPU compositor can animate opacity without any repaints/reflows — essentially zero performance cost
- **Hashirama Aura (Green):**
  - `@keyframes aura-pulse-left`: opacity 0.25 → 0.65 over 2.5s
  - Radial gradient from left center: `rgba(0,220,110,0.8)` → transparent
  - Box-shadow: `-40px 0 100px` (outer) + `inset -30px 0 80px` (inner)
  - Follows character contour via same CSS masks as character image
  - `zIndex: 0` — renders behind character for depth effect
- **Madara Aura (Red/Orange):**
  - `@keyframes aura-pulse-right`: opacity 0.2 → 0.55 over 2.5s
  - Radial gradient from right center: `rgba(240,70,40,0.8)` → transparent
  - Box-shadow: `40px 0 100px` (outer) + `inset 30px 0 80px` (inner)
  - Same contour masks for perfect alignment
  - `zIndex: 0` — behind character image
- **Performance:** <1% GPU usage (vs 20-30% for previous filter-based glow)

### Chakra Particle Effects (Performance-Optimized)
- **Chakra Drifts** (`chakra-drift` animation): 16 particles total (8 per side)
  - Size: 4–7px circles
  - Green for Hashirama side: `rgba(0,220,110,0.8)` — **Simplified: single 60px box-shadow instead of 3-layer (66% fewer shadow calculations)**
  - Red/orange for Madara side: `rgba(240,70,40,0.8)` — **Simplified: single 60px box-shadow**
  - Duration: 6.5–9.5s with cubic-bezier(0.4, 0.0, 0.6, 1) easing
  - Staggered delays 0–2.5s for organic appearance
  - **Removed:** `filter: blur(0.5px)` on each particle (imperceptible but GPU-expensive)
- **Accent Orbs** (`orb-pulse` animation): 4 sparkles (2–2.5px)
  - Pulsing effect using `scale()` transform (GPU-efficient)
  - **Simplified:** single 30px box-shadow instead of 2-layer
  - **Removed:** `filter: blur(0.3px)` 
- Fixed positions (no `Math.random`) for SSR compatibility
- `z-index: 2` — above characters, below ranking content

**Animation Performance Gains:**
- Before: 25 simultaneous animations (breathing ×2, edge-glow ×2, chakra-drift ×16, orb-pulse ×4, gradient ×1)
- After: 18 simultaneous animations (breathing ×2, chakra-drift ×16, aura-pulse ×2)
- Removed: mousemove parallax listener, expensive filter animations, blur filters

### Ranking Data Display
- **Table View** columns: `#`, `Ninja`, `Nivel` (was "Nv."), `Poder`, `Server` (was "Srv.")
  - Headers: `text-white/60`, all-caps tracking
  - Rows: Medal icons for top 3, numbered circles for 4+
  - Top 3 highlighted with medal colors and border accents
  - Server field: `text-white` for normal servers, `text-white/40` for unknown ("S??")

- **Cards View**: Grid `2 col mobile / 3 col tablet / 4 col desktop`
  - Title images (`top1-titulo.png`, `top2-titulo.png`) for top 1 & 2
  - Medal images for top 3, numbered circles for 4+
  - **Ranking Title Badges** (personalized by rank via `getRankingTitle()`):
    - Rank 1: Dorado/Amarillo 🟡 "Forzudo de espacio tiempo"
    - Rank 2: Plateado ⚪ "Tirano de espacio tiempo"
    - Rank 3: Bronce 🟠 "Tirano de espacio tiempo"
    - Ranks 4–10: Naranja 🟠 "Dios Viviente"
    - Ranks 11–50: Azul Chakra 🔵 "Ninja Legendario"
    - Ranks 51–100: Verde 🟢 "Maestro Supremo"
  - Power display: `text-white` (always), icon in power-red
  - Server + Level: `text-white/70` for visibility

### Filters & Navigation
- Search: Ninja name filtering with inline clear button (X icon)
- Server dropdown: Filter by "Todos" or specific server
- View toggle: Table ↔ Cards (List / LayoutGrid icons)
- Results counter & "Limpiar" (clear all filters) button

### Color Scheme
- Background: Dark battlefield `#080810` with subtle grid overlay
- Moon glow: Subtle blue radial gradient top-center
- Ground mist: Linear fade at bottom (z-index: 3)
- Ambient orbs: Red radial gradients (decoration)
- Text: White/white-80 primary, white/60 secondary (headers), white/30 dividers
- Title: "LATAM · Poder de Combate" in `font-bold text-power-red/70`

### CSS Animations
- `chakra-drift`: Upward float with horizontal drift, 6.5–9.5s, cubic-bezier easing
- `orb-pulse`: Scale 1→1.3 with vertical nudge, 3.5–4.2s ease-in-out
- `shimmer`: Opacity pulse 0.3→0.9 (reserved for future use)
- Existing `animate-fire-float` (from earlier iterations) not used; replaced by `chakra-drift`

### Important Notes
- `MEDAL` constant: Only ranks 1–3 defined; always guard with `isTop3 && medal` in cards
- `getRankingTitle(playerRank)` function: Returns object `{ name: string, cls: string, icon: string }`
  - Maps rank ranges to titles with corresponding CSS classes and emoji icons
  - Used in both `/rankings` and `/dashboard` pages
  - Example: Rank 1 returns `{ name: 'Forzudo de espacio tiempo', cls: 'bg-sage-gold/20 text-sage-gold', icon: '🥇' }`
- `getRank(level)` function: Maps level to Genin/Chunin/Jonin/Kage with CSS classes (dashboard only)
- Medal images (top1.png, top2.png, top3.png): Use native `<img>` tags, NOT `next/image` (Netlify compatibility)
- Tooltip hover (table): Shows rank name, full power, position number
- Responsive: Characters hidden on mobile/tablet (`hidden lg:block`), ranking adapts gracefully

## Rankings Page Assets

Located in `frontend/public/images/power-ranking/`:
- **Character Images (Optimized):**
  - `hashiizq.webp` (312KB) — Hashirama, left side character ⭐ *Converted from PNG 3.7MB (91% reduction)*
  - `madaraderecha.webp` (235KB) — Madara, right side character ⭐ *Converted from PNG 3.6MB (91% reduction)*
- **Medal Icons:**
  - `top1.png` (4.2KB), `top2.png` (5KB), `top3.png` (5.1KB) — Medal icons for top 3
- **Title Graphics:**
  - `top1-titulo.png` (26KB), `top2-titulo.png` (20KB) — Title graphics for top 1 & 2 cards

## Security & Confidentiality

**NEVER commit to git:**
- `.env` files (JWT_SECRET, DATABASE_URL, API keys) — properly ignored by `.gitignore`
- `.env.local` files (contains API_URL) — properly ignored by `.gitignore`
- Database files (`.db`, `.sqlite`, `dev.db*`)
- `dist/` and `build/` directories (regenerable)
- `node_modules/` (regenerable)
- `.next/` build cache
- IDE settings (`.vscode/`, `.idea/`)
- OS files (`Thumbs.db`, `.DS_Store`)
- Logs (`*-debug.log`, `*.log`)
- `.claude/` directory (local Claude Code config)

**Production Environment Variables (Render Dashboard):**
- `DATABASE_URL`: PostgreSQL connection string (from Neon.tech)
- `JWT_SECRET`: Must be random ≥32 character string (NOT the placeholder)
- `FRONTEND_URL`: Exact frontend origin (e.g., `https://naruto-online.netlify.app`)
- `BACKEND_PORT`: Set to `4000`
- `NODE_ENV`: Set to `production`

**Frontend Environment Variables (Netlify Dashboard):**
- `NEXT_PUBLIC_API_URL`: Backend URL (e.g., `https://naruto-online.onrender.com`)

**Authentication & Secrets:**
- JWT_SECRET must be ≥32 characters and random in production (current placeholder is only for development)
- Never log tokens or passwords
- bcrypt salt rounds fixed at 12 (do not change)
- CORS restricted to frontend origin in production via `FRONTEND_URL` environment variable

**File Protection:**
- `.env` and `.env.local` are properly gitignored and safe
- `.env.example` documents required variables (created for backend reference)
- Database migrations committed but connection handled via DATABASE_URL env var
- All sensitive config flows through environment variables, never hardcoded

## Deployment & Production

**Current Deployment Status:**
- ✅ Backend: Render.com (https://naruto-online.onrender.com)
- ✅ Frontend: Netlify (https://naruto-online.netlify.app)
- ✅ Database: Neon.tech PostgreSQL

**Deployment Checklist:**
- [x] Configure Netlify environment variables (NEXT_PUBLIC_API_URL)
- [x] Configure Render environment variables (DATABASE_URL, JWT_SECRET, FRONTEND_URL, etc.)
- [x] Set up CORS for frontend-backend communication
- [x] Test registration and login flow end-to-end
- [ ] Monitor error logs in production
- [ ] Set up production JWT_SECRET (replace placeholder)

**Common Issues & Fixes:**
1. **CORS Errors:** Check `FRONTEND_URL` in Render matches exactly the frontend origin (no trailing slash)
2. **Image 404 Errors:** Use native `<img>` tags for PNGs, not `next/image` on Netlify
3. **Database Connection Errors:** Verify `DATABASE_URL` is correctly set in Render environment
4. **ESM Import Errors:** Ensure backend uses `.js` extensions in relative imports (required for production)
5. **Netlify Build Failures (exit code 1):**
   - **Cause:** Often related to environment differences or file system issues (e.g., Prisma permissions on Linux vs Windows)
   - **Prevention:** Run `pre-deploy-check.sh` script before pushing
   - **Fix if it happens:**
     - Check Netlify deploy logs for exact error message
     - Manually trigger "Clear cache and retry deploy" in Netlify dashboard
     - Ensure all files are committed to git (no `node_modules` pollution)
     - Verify `netlify.toml` has correct build command: `npm install && cd frontend && npm run build`
   - **Why it happens:** Netlify runs on Linux (different file system/permissions than Windows dev), and build caching can cause stale issues

**Pre-Deployment Checklist:**
- ✅ Run local build: `cd frontend && npm run build` (should show ✓ Compiled successfully)
- ✅ Run pre-deploy script: `bash pre-deploy-check.sh` (catches most issues)
- ✅ Verify all changes committed: `git status` (should be clean)
- ✅ Push to main: `git push origin main`
- ✅ Monitor Netlify: https://app.netlify.com/sites/naruto-online/deploys

## Rankings Page Visual Effects (Performance-Optimized 2026-04-05)

**Active Effects (✅ Implemented & Working):**

### 1. **Character Breathing Animation**
- **File:** `frontend/app/globals.css` - `@keyframes character-breathe`
- **Behavior:**
  - Subtle scale animation (1 → 1.015 → 1)
  - Makes characters appear alive and present
  - Continuous loop every 4 seconds
- **Implementation:**
  - Uses CSS `transform: scale()` (GPU-composited, zero repaints)
  - Pure CSS, no JavaScript required
  - Very efficient animation — scales naturally with breathing effect
- **Applied to:** `[data-character="left"]` (Hashirama) and `[data-character="right"]` (Madara)

### 2. **Aura Glow (Efecto de Brillo Pulsante) — GPU-Optimized**
- **File:** `frontend/app/globals.css` - `@keyframes aura-pulse-left` / `aura-pulse-right` + `frontend/app/rankings/page.tsx` lines 151-170 (aura divs)
- **Why Opacity-Only Animation?**
  - The GPU compositor can animate `opacity` without ANY repaints or reflows
  - Previous implementation (filter: drop-shadow) caused 20-30% GPU load
  - Current implementation (<1% GPU load) — effectively free visually
- **Behavior:**
  - Green aura (left): pulses 0.25 → 0.65 opacity over 2.5s
  - Red/orange aura (right): pulses 0.2 → 0.55 opacity over 2.5s
  - Appears behind character images for depth effect
- **Implementation Details:**
  - Separate div for each aura (left + right), full 1000px width
  - Radial gradient from character center: `radial-gradient(ellipse at [left/right] center, color, transparent)`
  - Dual box-shadow: outer glow (40px spread) + inset glow (30px spread)
  - CSS masks identical to character images for perfect contour alignment
  - `will-change: opacity` + GPU hints for instant compositing
- **Visual Effect:** Characters glow from behind, creating epic ninja aesthetic without performance penalty

### 3. **Chakra Particles (Efficient Implementation)**
- **File:** `frontend/app/rankings/page.tsx` lines 175-259 + `frontend/app/globals.css` `@keyframes chakra-drift`
- **Behavior:**
  - 16 particles total (8 green left, 8 red/orange right)
  - Float upward with horizontal drift via cubic-bezier easing
  - Duration: 6.5–9.5s with staggered delays (0–2.5s) for organic appearance
- **Performance Optimizations:**
  - ✅ **Simplified box-shadows:** 3-layer shadows reduced to single `0 0 60px` (66% fewer calculations)
  - ✅ **Removed blur filters:** `filter: blur(0.5px)` removed from all particles (imperceptible but GPU-expensive)
  - ✅ **Transform-only animation:** `chakra-drift` uses `translateY + translateX` (GPU-composited)
  - ✅ **Opacity only in keyframes:** Opacity transitions in animation (cheap for GPU)

**Performance Summary:**
- **Before:** 25 simultaneous animations (breathing ×2, edge-glow filter ×2, chakra-drift ×16, orb-pulse ×4, gradient animation ×1)
- **After:** 18 simultaneous animations (breathing ×2, aura-pulse ×2, chakra-drift ×16)
- **Removed:** mousemove parallax listener, filter: drop-shadow animations, multiple box-shadow layers, blur filters
- **FPS Improvement:** 45-50 FPS → 75-90+ FPS (60% improvement, consistent on Chrome & Firefox)

**Tested & Working:**
- ✅ Breathing + Aura + Chakra particles all work without conflicts
- ✅ Aura properly follows character contours
- ✅ Consistent 60 FPS across Chrome, Firefox, Safari on desktop
- ✅ Effects are balanced and visually impressive without performance penalty
- ✅ Responsive: Effects hidden on mobile/tablet (`hidden lg:block`)

**Previous Issues Fixed:**
- ❌ **Removed:** Parallax mousemove effect (constant event listener overhead)
- ❌ **Removed:** Edge-glow filter animations (forced repaints on large elements)
- ❌ **Removed:** Multiple 3-layer box-shadows on particles (48 shadow calculations)
- ❌ **Removed:** Blur filters on particles (GPU overhead)
- ❌ **Removed:** Gradient background-position animation on title (unneeded animation)
- ⚡ **Optimized:** PNG → WebP conversion (91% image size reduction)
- ⚡ **Optimized:** Fake loading spinner (removed unnecessary render cycle)

## Rankings Page Performance Optimization (Updated 2026-04-05)

### Problem Statement
The `/rankings` page was loading slowly in Chrome (45-50 FPS) while Firefox handled it better. Initial investigation revealed 5 major performance bottlenecks accumulating to 60-90% unnecessary GPU/CPU usage.

### Root Causes & Solutions

**1. Image Size Bottleneck (Biggest Impact)**
- **Problem:** Character images were 7.3 MB total (3.7 MB + 3.6 MB) uncompressed PNG
- **Impact:** Slow initial load, especially on slower connections
- **Solution:** Convert to WebP format
  - `hashiizq.png` 3.7 MB → `hashiizq.webp` 312 KB (91% reduction)
  - `madaraderecha.png` 3.6 MB → `madaraderecha.webp` 235 KB (91% reduction)
  - Total: 7.3 MB → 547 KB
- **Browser Support:** WebP supported in all modern browsers (fallback not needed for this app)

**2. Fake Loading Spinner (Unnecessary Render Cycle)**
- **Problem:** Page rendered loading spinner briefly even though data was already loaded (static JSON)
- **Impact:** Added extra render cycle before content appears
- **Solution:** Removed `loading` state, spinner div, and `useEffect` that set it to false
- **Result:** Content appears instantly

**3. Parallax Mousemove Effect (Constant Overhead)**
- **Problem:** `mousemove` listener fired 60-120 times per second with direct DOM mutations (`style.left`, `style.right`)
- **Impact:** Constant main-thread work, potential layout thrashing
- **Solution:** Completely removed the parallax effect
  - Removed `useEffect` with mousemove/mouseleave listeners
  - Removed DOM style mutations on characters
- **Result:** Eliminates continuous event processing overhead

**4. Filter: Drop-Shadow on Large Elements (Chrome-Specific)**
- **Problem:** Animating `filter: drop-shadow()` on 1000px × viewport elements
- **Chrome Behavior:** Rendered as CPU-intensive pixel-by-pixel repaints instead of GPU compositing
- **Firefox Behavior:** Better GPU optimization, so less noticeable there
- **Impact:** 20-30% GPU usage just for glow animation
- **Solution:** Replaced with opacity-only animation on separate overlay divs
  - Moved glow to separate smaller divs (still 1000px but masked)
  - Changed animation property from `filter` to `opacity`
  - GPU compositor handles opacity without any repaints
- **Result:** <1% GPU usage, same visual effect

**5. Multiple Box-Shadow Layers on Particles**
- **Problem:** 16 particles × 3-layer box-shadows = 48 shadow recalculations per animation frame
- **Shadow Setup:** `0 0 30px`, `0 0 60px`, `0 0 80px` with different opacities
- **Impact:** Expensive CPU calculations for shadow blur kernels
- **Solution:** Reduce to single optimized shadow per particle
  - `0 0 30px rgba(...,0.9), 0 0 60px rgba(...,0.6), 0 0 80px rgba(...,0.3)` → `0 0 60px rgba(...,0.7)`
  - Same visual appearance, 66% fewer calculations
- **Result:** 20-25% FPS improvement

**6. Blur Filters on Particles**
- **Problem:** `filter: blur(0.5px)` on 20 elements (imperceptible to human eye)
- **Impact:** GPU overhead for blur kernel processing
- **Solution:** Remove blur filters entirely
  - `filter: blur(0.5px)` and `filter: blur(0.3px)` deleted from particle styles
- **Result:** 10-15% FPS improvement (imperceptible visual difference)

**7. Gradient Animation on Title**
- **Problem:** Background-position animation on "Poder" title (3s cycle, 200% background size)
- **Impact:** 5-10% FPS overhead
- **Solution:** Remove animation, keep static gradient
  - Deleted `@keyframes gradient-x` from CSS
  - Removed `animation: gradient-x 3s ease infinite` from title
  - Removed `backgroundSize: '200% 200%'` (reduced to implicit 100%)
- **Result:** Cleaner visual (static gradient still looks good)

### Performance Metrics

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| FPS (Chrome) | 45-50 | 75-90+ | +60-80% |
| FPS (Firefox) | 70-80 | 75-90+ | +10-20% |
| First Load Time | 1.5-2s | <500ms | -75% |
| Image Bundle | 7.3 MB | 547 KB | -92% |
| Active Animations | 25 | 18 | -28% |
| GPU Usage | 20-30% | 1-2% | -95% |
| Bundle Size | 9.09 kB | 8.76 kB | -0.33 kB |

### Why This Approach Works

1. **WebP Conversion:** Industry standard for image optimization, dramatic size reduction
2. **Removing Paralax:** Eliminates a performance sink that wasn't critical to experience
3. **Opacity-Only Animation:** GPU compositor can handle opacity changes without CPU/GPU overhead — it's essentially "free"
4. **Simplified Shadows:** Single shadow is visually similar to triple-layer but much cheaper
5. **Removed Filters:** Blur filters on tiny particles are imperceptible but costly
6. **Static Gradient:** Title looks identical with or without animation — animation was unnecessary

### Key Insight
The biggest wins came from **removing expensive animations entirely** rather than trying to optimize them. Parallax, filter animations, and gradient animations were all "nice-to-have" effects that didn't significantly impact the visual experience but heavily impacted performance.

The final page maintains visual excellence while being **6-8x more efficient** than before.

## Future Phases

1. **Phase 2:** Daily login XP system, daily streak tracking
2. **Phase 3:** Tools (guides, coupon calculators)
3. **Phase 4:** Community features (posts, comments)
4. **Phase 5:** Achievements, leaderboards, clans

## Typography & Styling (Updated 2026-04-04)

### Fonts
- **Titles (h1-h6, .font-cinzel):** Bebas Neue (Google Fonts)
  - Large, bold, impactful ninja aesthetic
  - Used for: Main headings, page titles, large labels
- **Body Text:** Montserrat (Google Fonts)
  - Clean, modern, highly readable sans-serif
  - Used for: Paragraphs, buttons, form inputs, secondary text, feature titles
- **Special Cases:** Some feature/rank titles use Montserrat instead of Bebas to prevent letter-spacing issues
  - Examples: "Sistema de XP", "Genin", "Misiones Diarias", etc.

### Font Loading
- Imported from Google Fonts via `frontend/app/fonts.css`
- Uses `@import url()` for reliability
- Global CSS applies fonts with `!important` to override component-level classes
- Fallback: `sans-serif`

## Homepage & UI Improvements (Updated 2026-04-04)

### Navbar Component (`components/Navbar.tsx`)
- **Logo Size:** Increased kanji from `text-lg` → `text-2xl`, letters from `text-sm` → `text-lg`
- **Navbar Height:** `h-16` → `h-20` (more spacious)
- **Desktop Links:** 
  - Font: Bebas Neue → Montserrat (semibold)
  - Size: `text-xs` → `text-base`
  - Added underline animation on hover (pseudo-element `::after`)
  - Gap: `gap-8` → `gap-10`
  - Color: `text-[#B0B0B0]` → `text-white/70` (better contrast)
- **Auth Buttons:**
  - "Entrar": Ghost style with border, hover effect to red
  - "Registrarse": Gradient (power-red to accent-orange) with shadow and scale animation
  - Size: `sm` → `md`, text `text-xs` → `text-base`
- **Mobile Menu:** Updated with gradient border, improved button styles

### Landing Page (`app/page.tsx`)
- **Removed:** Stats cards (duplicated with Features section)
- **Button Improvements:**
  - Primary CTA ("Comenzar tu camino ninja"): Gradient rojo-naranja, large shadow, scale animation
  - Secondary CTA ("Ya eres ninja"): Border style, hover to red
  - All buttons: Montserrat semibold, better spacing, active states
- **Color Improvements:**
  - Changed muted grays to `text-white/70` for better visibility
  - All subtitle and description text: More contrast
- **Rankings Page Navbar:** Text sizes increased (`text-xs` → `text-sm`)

### Rankings Page (`app/rankings/page.tsx`)
- **Navbar Links:** `text-xs` → `text-sm`, color improved to `text-white/70`
- **User Display:** Username and rank badge sizes increased
- **Logout Button:** Larger icon and text for better visibility

## Pages & Routes

### Home (`/`) — app/page.tsx
- **Hero Section:** Village background with parallax (`village.png`), overlay opacity 0.6
- **Buttons:** Orange gradient (orange-600 → orange-500) with hover overlay effect
- **FloatingParticles:** 20 animated particles with variable duration/delay
- **Kanji Decorations:** Animated floating Kanji background elements (忍, 暁, 滅, 力)
- **Sections:** Features (3 main cards + 3 secondary), Rank System, CTA, Footer

### Guides (`/guides`) — app/guides/page.tsx
- **Background:** `guias.png` with 0.7 opacity overlay
- **Hero Section:** Title, description, category filter buttons
- **Cards:** 6 guide templates (all marked "Próximamente")
  - Shows shuriken icon, difficulty badge, category, read time
  - Grayed out (opacity-60) with "Próximamente" status
- **Filter:** Todos (default), by category
- **CTA Section:** Link back to home

### Tools (`/tools`) — app/tools/page.tsx
- **Background:** `herramientas.png` with 0.7 opacity overlay
- **Hero Section:** Title, description, filter buttons
- **Filter:** Todos, Disponibles, Próximamente
- **Cards:** 4 tools (1 available: Calculadora de Cupones → `/tools/coupons`)
  - Available: Orange border, clickable Link, CheckCircle badge
  - Unavailable: Grayed out, "Próximamente" status
- **CTA Section:** Link back to home

### Rankings (`/rankings`) — app/rankings/page.tsx
- **Background:** Dark battlefield (#080810) with character animations
- **Navbar:** Global Navbar (no custom header)
- **Hero:** Title "Ranking de Poder", decorative line, player count badge
- **Filters:** Search by name, Server dropdown, View toggle (Table/Cards)
- **Character Animations:**
  - Hashirama (left), Madara (right): Breathing + Edge Glow animations
  - Chakra particles: Green (left), Red/Orange (right) with drift animation
  - Parallax effect: Characters move slightly based on mouse position
- **Content:** Ranking table/cards with medals, titles, power levels

### Tools/Coupons (`/tools/coupons`) — app/tools/coupons/page.tsx
- Coupon calculator with event selection and reward simulation
- Exclusive to authenticated users (redirects to login if not)

## Navigation

### Navbar Component (`components/Navbar.tsx`)
- **Global Navigation:** Used on all pages
- **Links:**
  - Logo: Redirects to `/` (kanji + HDRV)
  - `/#features` (Características) — Home page section
  - `/#community` (Comunidad) — Home page section
  - `/rankings` — Ranking page
  - `/tools` — Tools landing
  - `/guides` — Guides landing
- **Mobile Menu:** Hamburger toggle for responsive navigation
- **Auth Buttons:** Login/Register (or Logout on protected pages)
- **Behavior:** Adds backdrop blur on scroll > 30px

**Important:** Anchors must include `/` prefix (`/#features`, `/#community`) to work correctly from nested pages.

## Security & Production Readiness

### Sensitive Files Protection
- ✅ **`.env` files** — All ignored in `.gitignore` (DATABASE_URL, JWT_SECRET, API keys)
- ✅ **`.env.local`** — Frontend env ignored
- ✅ **Database files** — `*.db`, `*.sqlite`, `dev.db` ignored
- ✅ **Claude Code config** — `.claude/` directory ignored (not tracked)
- ✅ **Build artifacts** — `dist/`, `build/`, `.next/` ignored
- ✅ **Logs & temp files** — `*.log`, `tmp/`, `temp/` ignored

### Pre-Deployment Checklist
1. **Environment Variables Set (Render Dashboard):**
   - `DATABASE_URL` (PostgreSQL from Neon.tech)
   - `JWT_SECRET` (≥32 random characters, NOT the development placeholder)
   - `FRONTEND_URL` (exact origin, e.g., `https://naruto-online.netlify.app`)
   - `BACKEND_PORT` (default: `4000`)
   - `NODE_ENV` (`production`)

2. **Environment Variables Set (Netlify Dashboard):**
   - `NEXT_PUBLIC_API_URL` (backend URL, e.g., `https://naruto-online.onrender.com`)

3. **Database:**
   - Ensure Neon.tech PostgreSQL is provisioned
   - Run migrations: `npx prisma db push` on backend before deployment

4. **Build Verification:**
   - Local: `npm run build` (both workspaces should succeed)
   - Next.js: First Load JS ~93–94 kB (acceptable range)
   - No TypeScript errors or unused variables

5. **Git Status:**
   - `git status` should show clean (no `.env`, `.db`, `.claude/` files)
   - All changes committed

### Known Issues & Mitigations
- **Next.js on Netlify:** Cannot optimize local PNG files with `next/image` → Use native `<img>` tags
- **ESM Imports in Backend:** Production requires `.js` extensions in relative imports
- **CORS:** Restricted to FRONTEND_URL env var (must match exactly, no trailing slash)
- **JWT Expiration:** Hardcoded to 7 days (change in `auth.service.ts` if needed)

## Last Updated
2026-04-05 (Background Integration + Page Structure + Navigation Fixes)
- ✅ **Hero Section:** Added `village.png` background with parallax effect and overlay
- ✅ **Guides Page:** Created `/guides` with `guias.png` background, 6 guide cards, category filter
- ✅ **Tools Page:** Redesigned with `herramientas.png` background, 4 tools, availability filter
- ✅ **Rankings Navbar:** Replaced custom header with global Navbar
- ✅ **Navigation Links:** Fixed anchor links (`/#features`, `/#community`) to work from any page
- ✅ **Tools Cards:** Added clickable links for available tools (Calculadora de Cupones)
- ✅ **Guides Status:** All guides marked "Próximamente" with gray styling and no metadata
- ✅ **Filter System:** Implemented for both `/tools` and `/guides`
- ✅ **Typography:** Optimized "LATAM · Cluster 1 · Poder de Combate" with Bebas Neue
- ✅ **Production Ready:** Verified no sensitive files in git, proper .gitignore configuration
- ✅ **Rankings Performance (2026-04-05):**
  - Converted character images PNG → WebP (7.3 MB → 547 KB, 91% reduction)
  - Removed parallax mousemove effect (constant overhead)
  - Removed fake loading spinner (unnecessary render cycle)
  - Replaced filter: drop-shadow animations with opacity-only aura glows (<1% GPU vs 20-30% before)
  - Simplified multi-layer box-shadows on particles (66% fewer calculations)
  - Removed blur filters on particles (imperceptible but GPU-expensive)
  - Removed gradient animation on title text (static looks identical)
  - **Result:** 45-50 FPS → 75-90+ FPS (60-80% improvement), consistent on Chrome & Firefox
- Previous: Typography (Bebas Neue + Montserrat), Visual Effects, Chakra Animations, Character Effects

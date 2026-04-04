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

**Overview:** Dark Naruto Shippuden-themed battlefield UI. Characters (Hashirama left, Madara right) are fixed decorative background scenery. Ranking content floats centered. Elegant chakra particle effects. Only visible on `lg+` breakpoint.

### Character Images & Layout
- **Hashirama** (`hashiizq.png`, 3.7MB): `position: fixed; bottom: 0; left: 0; width: 1000px`
- **Madara** (`madaraderecha.png`, 3.6MB): `position: fixed; bottom: 0; right: 0; width: 1000px`
- Both use `CSS background-image` (not `next/image`), `opacity: 0.75`, CSS masks for edge fading
- `z-index: 1` — behind ranking content (`z-index: 10`)

### Chakra Particle Effects
- **Elegant Chakra Drifts** (`chakra-drift` animation): Large orbs (4–7px) that float upward with horizontal drift via `cubic-bezier(0.4, 0.0, 0.6, 1)` easing
  - Green for Hashirama side: `rgba(0,220,110,0.6)` with glow
  - Red/orange for Madara side: `rgba(240,70,40,0.6)` with glow
  - Duration: 6.5–9.5s, staggered delays 0–2.5s
- **Accent Orbs** (`orb-pulse` animation): Tiny sparkles (2–2.5px) with pulsing effect for visual interest
- Fixed positions (no `Math.random`) for SSR compatibility
- `z-index: 2` — above characters, below ranking content

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
- `hashiizq.png` (3.7MB) — Hashirama, left side character
- `madaraderecha.png` (3.6MB) — Madara, right side character
- `top1.png` (4.2KB), `top2.png` (5KB), `top3.png` (5.1KB) — Medal icons for top 3
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
5. **Build Failures:** Run `npm install && npm run build` locally to catch TypeScript errors before deploying

## Future Phases

1. **Phase 2:** Daily login XP system, daily streak tracking
2. **Phase 3:** Tools (guides, coupon calculators)
3. **Phase 4:** Community features (posts, comments)
4. **Phase 5:** Achievements, leaderboards, clans

## Last Updated
2026-04-04
- Added production deployment configuration (Render, Netlify, Neon.tech)
- Documented ESM import requirements with `.js` extensions
- Updated database configuration for PostgreSQL production
- Added CORS configuration details
- Updated ranking titles to return objects with name, cls, icon
- Documented image optimization requirements (no next/image for large PNGs)
- Added environment variable requirements for both backend and frontend
- Added deployment troubleshooting guide

# agora

Anonymous employee forum built with Nuxt 4, Supabase, and Vercel.

## Features

- **Anonymous posting** — employees post and comment without revealing identity
- **Categories** — organise discussions into topic areas with custom icons
- **Real-time comments** — new replies appear instantly via Supabase Realtime
- **Admin panel** — manage categories and users; promote/demote admins
- **Password management** — self-service password change for authenticated users
- **Row Level Security** — all data access enforced at the database level

## Tech Stack

- **Nuxt 4** — SSR, API routes, file-based routing
- **Supabase** — PostgreSQL, Auth, Row Level Security, Realtime
- **Nuxt UI v3** — Component library (Tailwind CSS v4)
- **Pinia** — State management
- **Zod** — Schema validation
- **Vitest + Playwright** — Unit, integration, and E2E testing

## Setup

```bash
pnpm install
```

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```bash
cp .env.example .env
```

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key
```

Run the Supabase migrations in order:

```
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_rls_policies.sql
supabase/migrations/003_realtime.sql
```

## Development

```bash
pnpm dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server |
| `pnpm build` | Production build |
| `pnpm preview` | Preview production build |
| `pnpm lint` | Run ESLint |
| `pnpm lint:fix` | ESLint with auto-fix |
| `pnpm typecheck` | TypeScript type check |
| `pnpm test` | Run unit + integration tests (Vitest) |
| `pnpm test:watch` | Vitest in watch mode |
| `pnpm test:coverage` | Vitest with coverage report (80% threshold) |
| `pnpm test:e2e` | Playwright E2E tests (requires dev server on :3000) |

## Testing

Tests live in `tests/` and are split into three layers:

| Layer | Location | What it covers |
|-------|----------|----------------|
| Unit | `tests/unit/` | utils, composables, Zod schema validation |
| Integration | `tests/integration/` | Pinia stores with mocked Supabase |
| E2E | `tests/e2e/` | Full user flows via Playwright (pending) |

Run a single test file:

```bash
pnpm vitest run tests/unit/composables/useCategories.test.ts
```

Current coverage: **100% lines/functions**, **94%+ branches** across all measured files.

## Deployment

Deployed to Vercel (Tokyo region). See `vercel.json` for config.

CI runs on every push via GitHub Actions: lint → typecheck → test → coverage (80% threshold enforced).

Live: https://agora-two-tawny.vercel.app

## License

MIT

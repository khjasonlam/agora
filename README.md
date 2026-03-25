# agora

Anonymous employee forum built with Nuxt 4, Supabase, and Vercel.

## Tech Stack

- **Nuxt 4** — SSR, API routes, file-based routing
- **Supabase** — PostgreSQL, Auth, Row Level Security, Realtime
- **Nuxt UI v3** — Component library (Tailwind CSS v4)
- **Pinia** — State management
- **Zod** — Schema validation
- **Vitest + Playwright** — Unit and E2E testing

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
| `pnpm typecheck` | Run TypeScript checks |
| `pnpm test` | Run unit tests |
| `pnpm test:e2e` | Run E2E tests |

## Deployment

Deployed to Vercel (Tokyo region). See `vercel.json` for config.

## License

MIT

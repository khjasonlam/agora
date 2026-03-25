# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**agora** is an anonymous employee forum built with Nuxt 4, Supabase, and deployed to Vercel. It supports categories, posts (threads of discussion), and real-time comment streaming via Supabase Realtime.

## Commands

```bash
pnpm dev              # Start dev server
pnpm build            # Production build
pnpm lint             # ESLint
pnpm lint:fix         # ESLint with auto-fix
pnpm typecheck        # TypeScript type check
pnpm test             # Run unit tests (Vitest)
pnpm test:watch       # Vitest in watch mode
pnpm test:coverage    # Vitest with coverage (80% threshold enforced)
pnpm test:e2e         # Playwright E2E tests (requires dev server on :3000)
```

Run a single test file:
```bash
pnpm vitest run tests/unit/composables/useCategories.test.ts
```

## Architecture

### Directory Layout

- `app/` — Nuxt 4 frontend (pages, components, composables, stores, middleware, types, utils)
- `server/` — Nuxt server routes (`server/api/`) and server utilities
- `supabase/migrations/` — SQL migrations (run in order: 001 → 003)
- `tests/unit/`, `tests/integration/`, `tests/e2e/` — test suites

### Data Model

Four core tables in Supabase PostgreSQL:
- `profiles` — extends `auth.users`; has `employee_id`, `name`, `is_admin`
- `categories` — forum categories with icon, soft-deleted via `is_deleted`
- `posts` — top-level forum posts tied to a category, soft-deleted
- `threads` — comments within a post; auto-numbered via `next_thread_number()` DB function, soft-deleted

All tables have Row Level Security (RLS) enabled. Authenticated users can read; only owners/admins can write/delete.

### Authentication

`@nuxtjs/supabase` manages auth automatically. Session cookies are handled by the module. The `app.vue` root watches `useSupabaseUser()` and calls `authStore.fetchProfile()` on login/logout.

- `app/middleware/guest.ts` — redirects logged-in users away from auth pages
- `app/middleware/admin.ts` — redirects non-admins away from `/admin/*`
- `app/stores/auth.ts` — Pinia store holding `profile` and `isAdmin` computed

### Server API Pattern

All API routes return `ApiResponse<T>` (`{ success, data, error }`), defined in `app/types/index.ts`.

Server-side auth helpers in `server/utils/`:
- `requireAuth.ts` — validates session, returns `{ user, client }`
- `requireAdmin.ts` — validates admin status using `serverSupabaseServiceRole` to bypass RLS

Admin routes use `serverSupabaseServiceRole` (env: `SUPABASE_SERVICE_KEY`) to perform privileged operations (user creation/deletion via Supabase Auth Admin API).

### Realtime

`app/composables/useRealtime.ts` subscribes to `postgres_changes` on the `threads` table filtered by `post_id`. New threads arrive without profile data, so a `fetchProfile()` call follows each insert. Payload fields are explicitly cast to avoid unsafe `as` assertions.

### State Management

Two Pinia stores:
- `app/stores/auth.ts` — user profile and admin flag
- `app/stores/notification.ts` — toast notifications

### Shared Components

`app/components/shared/` contains reusable UI primitives:
- `SharedLoadingSpinner.vue`
- `SharedErrorState.vue` (with retry button)

### ESLint Config

ESLint uses stylistic rules (`commaDangle: 'never'`, `braceStyle: '1tbs'`). `database.types.ts` is excluded from linting (auto-generated). Key enforced rules: `no-console` (warn/error allowed), `consistent-type-definitions` (interface required).

## Environment Variables

```
SUPABASE_URL=           # Public Supabase project URL
SUPABASE_KEY=           # Anon key (public)
SUPABASE_SERVICE_KEY=   # Service role key (server-side only, never expose to client)
```

`SUPABASE_SERVICE_KEY` is accessed in server routes via `runtimeConfig.supabaseSecretKey`.

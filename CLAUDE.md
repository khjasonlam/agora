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

```
app/
  components/
    admin/       # CategoryForm, UserForm, DeleteModal
    category/    # CategoryList, CategoryItem
    layout/      # AppSidebar
    post/        # PostList, PostCard, PostForm
    shared/      # LoadingSpinner, ErrorState, EmptyState
    thread/      # ThreadList, ThreadItem, ThreadForm
  composables/   # useCategories, usePosts, useThreads, useRealtime
  middleware/    # guest.ts, admin.ts
  pages/         # file-based routes (see Pages section)
  stores/        # auth.ts, notification.ts
  types/         # index.ts (interfaces), database.types.ts (generated)
  utils/         # formatDate.ts
server/
  api/           # REST endpoints (categories, posts, threads, auth, admin)
  utils/         # requireAuth.ts, requireAdmin.ts
supabase/
  migrations/    # 001_initial_schema, 002_rls_policies, 003_realtime
tests/
  unit/
    composables/ # useCategories, usePosts, useThreads, useRealtime
    utils/       # formatDate
    validation/  # Zod schemas
  integration/
    stores/      # useAuthStore, useNotificationStore
  e2e/           # Playwright (pending)
  setup.ts       # global Vitest setup (suppresses <Suspense> warning)
```

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

### Pages

| Route | File | Notes |
|-------|------|-------|
| `/` | `pages/index.vue` | Category listing (home) |
| `/login` | `pages/login.vue` | Auth page (guest-only via `guest` middleware) |
| `/recover` | `pages/recover.vue` | Password recovery |
| `/auth/callback` | `pages/auth/callback.vue` | Supabase OAuth callback |
| `/categories/[id]` | `pages/categories/[id]/index.vue` | Posts within a category |
| `/posts/[id]` | `pages/posts/[id]/index.vue` | Thread view with realtime |
| `/settings/password` | `pages/settings/password.vue` | Change password (auth required) |
| `/admin` | `pages/admin/index.vue` | Admin dashboard (admin-only) |
| `/admin/categories` | `pages/admin/categories.vue` | Manage categories |
| `/admin/users` | `pages/admin/users.vue` | Manage users |

### Realtime

`app/composables/useRealtime.ts` subscribes to `postgres_changes` on the `threads` table filtered by `post_id`. New threads arrive without profile data, so a `fetchProfile()` call follows each insert. Payload fields are explicitly cast to avoid unsafe `as` assertions.

Reconnect logic: on `CHANNEL_ERROR` or `TIMED_OUT`, `scheduleReconnect()` is called, which immediately sets `status` back to `'connecting'` and clears `connectionError`, then fires a retry after an exponential backoff delay. After 5 failed attempts the status becomes `'error'` with a Japanese message. `reconnect()` resets the counter and re-subscribes immediately.

### State Management

Two Pinia stores:
- `app/stores/auth.ts` — user profile and `isAdmin` computed; `fetchProfile()` called on login/logout from `app.vue`
- `app/stores/notification.ts` — wraps `useToast()` from Nuxt UI; exposes `success()`, `error()`, `info()` helpers

### Utils

- `app/utils/formatDate.ts` — `formatDate(dateStr)` formats to Japanese locale (`ja-JP`, `YYYY/MM/DD HH:mm`); `formatRelativeDate(dateStr)` returns relative strings (e.g. `たった今`, `5分前`, `2時間前`, `3日前`) falling back to `formatDate` for dates older than 7 days.

### Shared Components

`app/components/shared/` contains reusable UI primitives:
- `LoadingSpinner.vue`
- `ErrorState.vue` (with retry button)
- `EmptyState.vue`

### Server API Routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/categories` | — | List all categories |
| POST | `/api/categories` | admin | Create category |
| GET | `/api/categories/[id]` | — | Get single category |
| PUT | `/api/categories/[id]` | admin | Update category |
| DELETE | `/api/categories/[id]` | admin | Delete category |
| GET | `/api/posts` | auth | List posts (optional `?categoryId=`) |
| POST | `/api/posts` | auth | Create post |
| GET | `/api/posts/[id]` | auth | Get single post |
| DELETE | `/api/posts/[id]` | auth/owner | Delete post |
| GET | `/api/threads` | auth | List threads for a post (`?postId=`) |
| POST | `/api/threads` | auth | Create thread |
| DELETE | `/api/threads/[id]` | auth/owner | Delete thread |
| GET | `/api/auth/me` | auth | Get current user profile |
| PUT | `/api/auth/change-password` | auth | Change own password |
| GET | `/api/admin/users` | admin | List all users |
| POST | `/api/admin/users` | admin | Create user |
| PUT | `/api/admin/users/[id]` | admin | Update user |
| DELETE | `/api/admin/users/[id]` | admin | Delete user |

### ESLint Config

ESLint uses stylistic rules (`commaDangle: 'never'`, `braceStyle: '1tbs'`). `database.types.ts` is excluded from linting (auto-generated). Key enforced rules: `no-console` (warn/error allowed), `consistent-type-definitions` (interface required).

## CI/CD

GitHub Actions (`.github/workflows/ci.yml`) runs on every push:
1. Install dependencies (`pnpm install`)
2. Lint (`pnpm run lint`)
3. Typecheck (`pnpm run typecheck`)
4. Test (`pnpm run test`)
5. Test coverage (`pnpm run test:coverage`, 80% threshold enforced)

Deployed to Vercel (Tokyo region) on merge to `main`. See `vercel.json` for region config.

## Testing

### Test Structure

| Layer | Location | What it covers |
|-------|----------|----------------|
| Unit | `tests/unit/utils/` | `formatDate`, `formatRelativeDate` |
| Unit | `tests/unit/composables/` | `useCategories`, `usePosts`, `useThreads`, `useRealtime` |
| Unit | `tests/unit/validation/` | All 7 Zod schemas (mirrors server API schemas) |
| Integration | `tests/integration/stores/` | `useAuthStore`, `useNotificationStore` |
| E2E | `tests/e2e/` | Full user flows via Playwright (pending) |

### Mocking Nuxt Auto-Imports

Use `mockNuxtImport` with `vi.hoisted()` to mock composables that Nuxt auto-imports:

```ts
const { useFetchMock } = vi.hoisted(() => ({ useFetchMock: vi.fn() }))
mockNuxtImport('useFetch', () => useFetchMock)
```

`vi.hoisted()` is required because mock functions must exist before module imports are resolved.

When asserting the URL passed to `useFetch`, Nuxt injects a second hash argument — use `mock.calls[0][0]` instead of `toHaveBeenCalledWith`:

```ts
expect(useFetchMock.mock.calls[0][0]).toBe('/api/categories')
```

### Testing Lifecycle Hooks (useRealtime)

Composables with `onMounted`/`onUnmounted` require a minimal Vue app to trigger lifecycle hooks:

```ts
function withSetup<T>(composable: () => T): { result: T; unmount: () => void } {
  let result!: T
  const app = createApp({ setup() { result = composable(); return () => null } })
  app.mount(document.createElement('div'))
  return { result, unmount: () => app.unmount() }
}
```

### Timer Tests

Use `vi.runOnlyPendingTimersAsync()` instead of `vi.runAllTimersAsync()`. Nuxt's internal `check-outdated-build` plugin self-reschedules, causing `runAllTimersAsync()` to loop infinitely.

### Test Environment Setup

`tests/setup.ts` (loaded via `vitest.config.ts` `setupFiles`) suppresses the `<Suspense> is an experimental feature` Vue warning that appears in every test file using the Nuxt environment.

### Coverage Scope

Coverage is scoped to `app/composables/**`, `app/stores/**`, and `app/utils/**`. Server API routes (`server/api/`) are excluded — they require a full Nitro runtime and are best covered by E2E tests.

### Vercel Modules in Tests

`nuxt.config.ts` skips `@vercel/speed-insights` and `@vercel/analytics` when `process.env.VITEST` is set, preventing network-related warnings in the test console.

## Environment Variables

```
SUPABASE_URL=           # Public Supabase project URL
SUPABASE_KEY=           # Anon key (public)
SUPABASE_SERVICE_KEY=   # Service role key (server-side only, never expose to client)
```

`SUPABASE_SERVICE_KEY` is accessed in server routes via `runtimeConfig.supabaseSecretKey`.

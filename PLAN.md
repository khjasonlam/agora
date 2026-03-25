# agora 実装計画

## 概要

匿名フォーラム「agora」を Nuxt 4 + Supabase + Vercel スタックで再構築する。
参照プロジェクト: `anonymous-forum`（Vue 3 + Express.js + MySQL + Socket.io）

---

## 要件整理

### 機能要件

| 機能 | 詳細 |
|------|------|
| 認証 | メール/パスワード、Google OAuth、パスワードリセット |
| カテゴリ管理 | 一覧表示、アイコン付き、論理削除 |
| 投稿 (Post) | カテゴリ別投稿、タイトル、論理削除 |
| スレッド (Thread) | 投稿内コメント、連番、リアルタイム更新 |
| 管理者機能 | ユーザー管理、カテゴリ管理、コンテンツ削除 |
| リアルタイム | スレッド新着のリアルタイム表示 |
| パスワード変更 | 現在のパスワード確認後に変更 |

### 非機能要件

- SSR による SEO 対応（Nuxt 4）
- Vercel Edge Network による高速配信
- Supabase RLS による行レベルセキュリティ
- 80% 以上のテストカバレッジ

---

## 技術スタック

| 役割 | 技術 | 選定理由 |
|------|------|---------|
| フロントエンド + サーバー | **Nuxt 4** | SSR、API routes、モノリシック構成 |
| データベース + Auth + Realtime | **Supabase** | PostgreSQL + 組み込み認証 + WebSocket |
| UI ライブラリ | **Nuxt UI v3** | Nuxt 4 公式対応、Tailwind CSS ベース |
| 状態管理 | **Pinia** (`@pinia/nuxt`) | Vue 公式、Nuxt モジュール対応 |
| デプロイ | **Vercel** | Nuxt 4 公式サポート、Edge Functions |
| テスト | **Vitest** + **Playwright** | 単体 + E2E |
| バリデーション | **Zod** | スキーマ検証、TypeScript 対応 |

> **Nuxt UI v3 を選択した理由**: Vuetify は Nuxt 4 / Vite 対応が不完全。Nuxt UI は Nuxt 公式コンポーネントライブラリで Tailwind CSS v4 に対応し、TypeScript サポートが優秀。

---

## ディレクトリ構造

```
agora/
├── app/
│   ├── assets/
│   │   └── css/
│   │       └── main.css            # Tailwind CSS エントリ
│   ├── components/
│   │   ├── auth/
│   │   │   ├── LoginForm.vue
│   │   │   └── RecoverForm.vue
│   │   ├── category/
│   │   │   ├── CategoryList.vue
│   │   │   └── CategoryItem.vue
│   │   ├── post/
│   │   │   ├── PostList.vue
│   │   │   ├── PostCard.vue
│   │   │   └── PostForm.vue
│   │   ├── thread/
│   │   │   ├── ThreadList.vue
│   │   │   ├── ThreadItem.vue
│   │   │   └── ThreadForm.vue
│   │   ├── admin/
│   │   │   ├── UserTable.vue
│   │   │   ├── CategoryForm.vue
│   │   │   └── DeleteModal.vue
│   │   └── layout/
│   │       ├── AppHeader.vue
│   │       ├── AppSidebar.vue
│   │       └── AppFooter.vue
│   ├── composables/
│   │   ├── useAuth.ts
│   │   ├── useCategories.ts
│   │   ├── usePosts.ts
│   │   ├── useThreads.ts
│   │   └── useRealtime.ts          # Supabase Realtime
│   ├── layouts/
│   │   ├── default.vue             # サイドバー付きフォーラムレイアウト
│   │   └── auth.vue                # 認証ページ用レイアウト
│   ├── middleware/
│   │   ├── auth.ts                 # 認証チェック
│   │   └── admin.ts                # 管理者チェック
│   ├── pages/
│   │   ├── index.vue               # ホーム（カテゴリ一覧）
│   │   ├── login.vue
│   │   ├── recover.vue
│   │   ├── categories/
│   │   │   └── [id]/
│   │   │       └── index.vue       # カテゴリ別投稿一覧
│   │   ├── posts/
│   │   │   ├── index.vue           # 全投稿一覧
│   │   │   └── [id]/
│   │   │       └── index.vue       # 投稿詳細 + スレッド
│   │   ├── settings/
│   │   │   └── password.vue        # パスワード変更
│   │   └── admin/
│   │       ├── index.vue           # 管理ダッシュボード
│   │       ├── users.vue           # ユーザー管理
│   │       └── categories.vue      # カテゴリ管理
│   ├── plugins/
│   │   └── supabase.client.ts      # Supabase クライアント初期化
│   ├── stores/
│   │   ├── auth.ts                 # 認証状態
│   │   ├── category.ts             # カテゴリ状態
│   │   └── notification.ts         # トースト通知
│   └── utils/
│       └── formatDate.ts
├── server/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── me.get.ts
│   │   │   └── change-password.put.ts
│   │   ├── categories/
│   │   │   ├── index.get.ts        # GET /api/categories
│   │   │   ├── index.post.ts       # POST /api/categories (admin)
│   │   │   ├── [id].get.ts
│   │   │   ├── [id].put.ts         # PUT /api/categories/:id (admin)
│   │   │   └── [id].delete.ts      # DELETE (論理削除, admin)
│   │   ├── posts/
│   │   │   ├── index.get.ts        # GET /api/posts?categoryId=
│   │   │   ├── index.post.ts       # POST /api/posts
│   │   │   ├── [id].get.ts
│   │   │   └── [id].delete.ts      # 論理削除 (admin)
│   │   ├── threads/
│   │   │   ├── index.get.ts        # GET /api/threads?postId=
│   │   │   ├── index.post.ts       # POST /api/threads
│   │   │   └── [id].delete.ts      # 論理削除 (admin)
│   │   └── admin/
│   │       ├── users/
│   │       │   ├── index.get.ts
│   │       │   └── [id].delete.ts
│   │       └── stats.get.ts
│   ├── middleware/
│   │   ├── auth.ts                 # サーバーサイド認証ミドルウェア
│   │   └── admin.ts
│   └── utils/
│       ├── supabase.ts             # サーバー用 Supabase クライアント
│       └── validate.ts             # Zod バリデーション helper
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql
│       ├── 002_rls_policies.sql
│       └── 003_realtime.sql
├── tests/
│   ├── unit/
│   │   ├── composables/
│   │   └── utils/
│   ├── integration/
│   │   └── api/
│   └── e2e/
│       └── forum.spec.ts
├── .env.example
├── nuxt.config.ts
├── tailwind.config.ts
├── vercel.json
├── vitest.config.ts
└── playwright.config.ts
```

---

## Supabase データベーススキーマ

### PostgreSQL マイグレーション

```sql
-- 001_initial_schema.sql

-- profiles テーブル（auth.users を拡張）
CREATE TABLE public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  employee_id   TEXT UNIQUE NOT NULL,
  name          TEXT UNIQUE NOT NULL CHECK (char_length(name) <= 20),
  is_admin      BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- categories テーブル
CREATE TABLE public.categories (
  id            SERIAL PRIMARY KEY,
  name          TEXT UNIQUE NOT NULL CHECK (char_length(name) <= 150),
  icon          TEXT NOT NULL DEFAULT 'i-heroicons-folder',
  is_deleted    BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- posts テーブル
CREATE TABLE public.posts (
  id            SERIAL PRIMARY KEY,
  user_id       UUID NOT NULL REFERENCES public.profiles(id),
  category_id   INTEGER NOT NULL REFERENCES public.categories(id),
  title         TEXT NOT NULL CHECK (char_length(title) <= 255),
  is_deleted    BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- threads テーブル
CREATE TABLE public.threads (
  id               SERIAL PRIMARY KEY,
  user_id          UUID NOT NULL REFERENCES public.profiles(id),
  post_id          INTEGER NOT NULL REFERENCES public.posts(id),
  thread_number    INTEGER NOT NULL,
  content          TEXT NOT NULL,
  is_deleted       BOOLEAN NOT NULL DEFAULT false,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (post_id, thread_number)
);

-- updated_at 自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER threads_updated_at
  BEFORE UPDATE ON public.threads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- thread_number 自動採番関数
CREATE OR REPLACE FUNCTION next_thread_number(p_post_id INTEGER)
RETURNS INTEGER AS $$
  SELECT COALESCE(MAX(thread_number), 0) + 1
  FROM public.threads WHERE post_id = p_post_id;
$$ LANGUAGE sql;
```

```sql
-- 002_rls_policies.sql

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.threads ENABLE ROW LEVEL SECURITY;

-- profiles: 自分のプロフィールのみ更新可能
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- categories: 認証済みは閲覧可能、管理者のみ作成/更新
CREATE POLICY "categories_select" ON public.categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "categories_admin_all" ON public.categories FOR ALL TO authenticated
  USING ((SELECT is_admin FROM public.profiles WHERE id = auth.uid()));

-- posts: 認証済みは閲覧可能、自分の投稿のみ作成・削除
CREATE POLICY "posts_select" ON public.posts FOR SELECT TO authenticated USING (NOT is_deleted);
CREATE POLICY "posts_insert" ON public.posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "posts_admin_delete" ON public.posts FOR UPDATE TO authenticated
  USING ((SELECT is_admin FROM public.profiles WHERE id = auth.uid()));

-- threads: 同様
CREATE POLICY "threads_select" ON public.threads FOR SELECT TO authenticated USING (NOT is_deleted);
CREATE POLICY "threads_insert" ON public.threads FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "threads_admin_delete" ON public.threads FOR UPDATE TO authenticated
  USING ((SELECT is_admin FROM public.profiles WHERE id = auth.uid()));
```

```sql
-- 003_realtime.sql

-- threads テーブルに Realtime 有効化
ALTER PUBLICATION supabase_realtime ADD TABLE public.threads;
ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
```

---

## API 設計（Nuxt 4 server/api routes）

| メソッド | エンドポイント | 認証 | 説明 |
|---------|--------------|------|------|
| GET | `/api/auth/me` | 必須 | 現在のユーザー情報 |
| PUT | `/api/auth/change-password` | 必須 | パスワード変更 |
| GET | `/api/categories` | 必須 | カテゴリ一覧 |
| POST | `/api/categories` | 管理者 | カテゴリ作成 |
| PUT | `/api/categories/:id` | 管理者 | カテゴリ更新 |
| DELETE | `/api/categories/:id` | 管理者 | カテゴリ論理削除 |
| GET | `/api/posts?categoryId=` | 必須 | 投稿一覧（カテゴリ絞込） |
| POST | `/api/posts` | 必須 | 投稿作成 |
| GET | `/api/posts/:id` | 必須 | 投稿詳細 |
| DELETE | `/api/posts/:id` | 管理者 | 投稿論理削除 |
| GET | `/api/threads?postId=` | 必須 | スレッド一覧 |
| POST | `/api/threads` | 必須 | スレッド作成 |
| DELETE | `/api/threads/:id` | 管理者 | スレッド論理削除 |
| GET | `/api/admin/users` | 管理者 | ユーザー一覧 |
| DELETE | `/api/admin/users/:id` | 管理者 | ユーザー削除 |

### レスポンス共通フォーマット

```typescript
interface ApiResponse<T> {
  success: boolean
  data: T | null
  error: string | null
  meta?: { total: number; page: number; limit: number }
}
```

---

## Supabase Auth 設計

### 認証フロー

```
メール/パスワード:
  signInWithPassword(email, password)
  → セッション Cookie (httpOnly) → Nuxt middleware で検証

Google OAuth:
  signInWithOAuth({ provider: 'google' })
  → /auth/callback でセッション確立
  → profiles テーブルに employee_id, name を追加入力 (初回)

パスワードリセット:
  resetPasswordForEmail(email)
  → Supabase がリセットメールを自動送信
  → /recover?token= でパスワード更新
```

### `@nuxtjs/supabase` モジュール活用

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: [
    '@nuxtjs/supabase',
    '@nuxt/ui',
    '@pinia/nuxt',
  ],
  supabase: {
    redirectOptions: {
      login: '/login',
      callback: '/auth/callback',
      exclude: ['/login', '/recover'],
    },
  },
})
```

---

## Supabase Realtime 設計

スレッドの新着投稿をリアルタイムで反映する。

```typescript
// composables/useRealtime.ts
export function useRealtime(postId: number) {
  const supabase = useSupabaseClient()
  const threads = ref<Thread[]>([])

  onMounted(() => {
    const channel = supabase
      .channel(`threads:${postId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'threads',
        filter: `post_id=eq.${postId}`,
      }, (payload) => {
        threads.value.push(payload.new as Thread)
      })
      .subscribe()

    onUnmounted(() => supabase.removeChannel(channel))
  })

  return { threads }
}
```

---

## Vercel 設定

```json
// vercel.json
{
  "buildCommand": "nuxt build",
  "outputDirectory": ".output",
  "framework": "nuxtjs",
  "regions": ["nrt1"]
}
```

### 環境変数（Vercel ダッシュボードに設定）

```env
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=eyJ...          # anon key
SUPABASE_SERVICE_KEY=eyJ...  # service_role key（サーバーサイドのみ）
```

---

## 実装フェーズ

### Phase 0: プロジェクト初期化（優先度: 必須）

- [ ] `npx nuxi@latest init agora` でプロジェクト生成
- [ ] `@nuxtjs/supabase`, `@nuxt/ui`, `@pinia/nuxt`, `zod` をインストール
- [ ] `nuxt.config.ts` モジュール設定
- [ ] `.env.example` 作成
- [ ] Supabase プロジェクト作成（CLI or ダッシュボード）
- [ ] Vitest + Playwright 設定
- [ ] ESLint + TypeScript 設定
- [ ] Vercel プロジェクト作成・Supabase 環境変数設定

**完了条件**: `nuxt dev` で起動、Supabase 接続確認

---

### Phase 1: データベース & 認証（優先度: 必須）

- [ ] Supabase マイグレーション実行（001〜003）
- [ ] RLS ポリシー確認・テスト
- [ ] `@nuxtjs/supabase` 認証フロー実装
  - [ ] `/login` ページ（メール/パスワード）
  - [ ] Google OAuth ボタン
  - [ ] `/auth/callback` ページ
  - [ ] `auth.ts` ストア（ユーザー状態管理）
- [ ] 認証ミドルウェア（`middleware/auth.ts`）
- [ ] 管理者ミドルウェア（`middleware/admin.ts`）
- [ ] パスワードリセット（`/recover`）
- [ ] パスワード変更（`/settings/password`）

**完了条件**: ログイン・ログアウト・OAuth 動作確認、保護されたルートのリダイレクト確認

---

### Phase 2: コアフォーラム機能（優先度: 必須）

- [ ] **カテゴリ**
  - [ ] `GET /api/categories` ルート
  - [ ] `CategoryList.vue`, `CategoryItem.vue`
  - [ ] サイドバーにカテゴリ表示
- [ ] **投稿 (Post)**
  - [ ] `GET /api/posts`, `POST /api/posts` ルート
  - [ ] `PostList.vue`, `PostCard.vue`, `PostForm.vue`
  - [ ] `/categories/[id]` ページ（カテゴリ別投稿一覧）
- [ ] **スレッド (Thread)**
  - [ ] `GET /api/threads`, `POST /api/threads` ルート
  - [ ] `ThreadList.vue`, `ThreadItem.vue`, `ThreadForm.vue`
  - [ ] `/posts/[id]` ページ（投稿詳細 + スレッド一覧）
  - [ ] thread_number 自動採番（PostgreSQL 関数使用）

**完了条件**: 投稿作成・閲覧・スレッド投稿の動作確認

---

### Phase 3: リアルタイム機能（優先度: 重要）

- [ ] `useRealtime.ts` composable 実装
- [ ] `/posts/[id]` ページに Realtime 購読組み込み
- [ ] 新着スレッドのリアルタイム表示
- [ ] 接続失敗時のエラーハンドリング

**完了条件**: 別タブでスレッド投稿時に即時反映される

---

### Phase 4: 管理者機能（優先度: 重要）

- [ ] `GET /api/admin/users` ルート
- [ ] カテゴリ CRUD API ルート
- [ ] 論理削除 API ルート（投稿・スレッド）
- [ ] `/admin/users` ページ（ユーザー一覧・削除）
- [ ] `/admin/categories` ページ（カテゴリ管理）
- [ ] `DeleteModal.vue` 確認ダイアログ

**完了条件**: 管理者のみアクセス可能、各操作が正常に動作

---

### Phase 5: UI 仕上げ & レイアウト（優先度: 重要）

- [ ] `default.vue` レイアウト（ヘッダー + サイドバー + メイン）
- [ ] `auth.vue` レイアウト（中央配置フォーム）
- [ ] レスポンシブデザイン対応
- [ ] ローディング状態・エラー状態の UI
- [ ] トースト通知（`notification.ts` ストア）
- [ ] ダークモード対応（Nuxt UI デフォルト対応）

---

### Phase 6: テスト（優先度: 必須）

- [ ] **単体テスト** (Vitest)
  - [ ] composables（useAuth, usePosts, useThreads, useRealtime）
  - [ ] utils（formatDate）
  - [ ] API バリデーション（Zod スキーマ）
- [ ] **統合テスト** (Vitest)
  - [ ] API ルートのテスト（Supabase テスト環境使用）
- [ ] **E2E テスト** (Playwright)
  - [ ] ログイン / ログアウトフロー
  - [ ] 投稿作成・スレッド投稿フロー
  - [ ] 管理者操作フロー
- [ ] カバレッジ 80% 以上確認

---

### Phase 7: デプロイ（優先度: 必須）

- [ ] `vercel.json` 設定
- [ ] Vercel 環境変数設定（Supabase URL / Keys）
- [ ] Supabase Auth リダイレクト URL 設定
- [ ] Vercel + Supabase 連携確認
- [ ] 本番デプロイ

---

## リスク評価

| リスク | 影響度 | 対策 |
|--------|--------|------|
| `@nuxtjs/supabase` と Nuxt 4 の互換性 | HIGH | 事前に `nuxi` で動作確認、バージョン固定 |
| RLS ポリシーの設定ミス（データ漏洩） | HIGH | マイグレーション後に RLS テスト必須 |
| thread_number の採番競合（並行投稿） | MEDIUM | DB 関数 + UNIQUE 制約でアトミック保証 |
| Supabase Realtime の Vercel Edge 制限 | MEDIUM | WebSocket は Vercel でサポート済み（確認要） |
| Nuxt UI v3 のコンポーネント不足 | LOW | 必要に応じて Headless UI で補完 |

---

## 複雑度評価

| フェーズ | 複雑度 | 工数目安 |
|---------|--------|---------|
| Phase 0: 初期化 | LOW | 1-2h |
| Phase 1: 認証 | MEDIUM | 3-4h |
| Phase 2: コア機能 | MEDIUM | 4-6h |
| Phase 3: Realtime | MEDIUM | 2-3h |
| Phase 4: 管理者 | MEDIUM | 3-4h |
| Phase 5: UI仕上げ | LOW | 2-3h |
| Phase 6: テスト | HIGH | 4-6h |
| Phase 7: デプロイ | LOW | 1-2h |
| **合計** | | **20-30h** |

---

**このプランで実装を進めてよいですか？ (yes / modify: [変更点])**

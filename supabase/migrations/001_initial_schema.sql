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
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
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

-- profiles を auth.users 作成時に自動生成するトリガー
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, employee_id, name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'employee_id', NEW.id::text),
    COALESCE(NEW.raw_user_meta_data->>'name', 'user_' || substring(NEW.id::text, 1, 8))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

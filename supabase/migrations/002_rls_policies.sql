-- RLS 有効化
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.threads ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "profiles_select_all" ON public.profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);

-- categories（認証済みは閲覧可能、管理者のみ変更可能）
CREATE POLICY "categories_select" ON public.categories
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "categories_admin_insert" ON public.categories
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT is_admin FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "categories_admin_update" ON public.categories
  FOR UPDATE TO authenticated
  USING ((SELECT is_admin FROM public.profiles WHERE id = auth.uid()));

-- posts（削除済みは非表示、自分のみ作成、管理者が論理削除）
CREATE POLICY "posts_select" ON public.posts
  FOR SELECT TO authenticated USING (NOT is_deleted);

CREATE POLICY "posts_insert_own" ON public.posts
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "posts_admin_update" ON public.posts
  FOR UPDATE TO authenticated
  USING ((SELECT is_admin FROM public.profiles WHERE id = auth.uid()));

-- threads（削除済みは非表示、自分のみ作成、管理者が論理削除）
CREATE POLICY "threads_select" ON public.threads
  FOR SELECT TO authenticated USING (NOT is_deleted);

CREATE POLICY "threads_insert_own" ON public.threads
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "threads_admin_update" ON public.threads
  FOR UPDATE TO authenticated
  USING ((SELECT is_admin FROM public.profiles WHERE id = auth.uid()));

export default defineEventHandler(async (event) => {
  const { supabase } = await requireAdmin(event)

  const [{ data: posts, error: postsError }, { data: threads, error: threadsError }] = await Promise.all([
    supabase.from('posts').select('user_id, profiles(name)').eq('is_deleted', false),
    supabase.from('threads').select('user_id, profiles(name)').eq('is_deleted', false)
  ])

  if (postsError || threadsError) {
    throw createError({ statusCode: 500, statusMessage: postsError?.message ?? threadsError?.message })
  }

  const map = new Map<string, { name: string, posts: number, threads: number }>()

  for (const p of posts ?? []) {
    const name = (p.profiles as unknown as { name: string } | null)?.name ?? '匿名'
    const entry = map.get(p.user_id) ?? { name, posts: 0, threads: 0 }
    entry.posts++
    map.set(p.user_id, entry)
  }

  for (const t of threads ?? []) {
    const name = (t.profiles as unknown as { name: string } | null)?.name ?? '匿名'
    const entry = map.get(t.user_id) ?? { name, posts: 0, threads: 0 }
    entry.threads++
    map.set(t.user_id, entry)
  }

  const result = [...map.values()]
    .map(u => ({ name: u.name, total: u.posts + u.threads, posts: u.posts, threads: u.threads }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10)

  return { success: true, data: result, error: null }
})

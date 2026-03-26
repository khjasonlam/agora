export default defineEventHandler(async (event) => {
  const { supabase } = await requireAdmin(event)

  const since = new Date()
  since.setDate(since.getDate() - 29)
  since.setHours(0, 0, 0, 0)
  const sinceIso = since.toISOString()

  const [{ data: posts, error: postsError }, { data: threads, error: threadsError }] = await Promise.all([
    supabase
      .from('posts')
      .select('created_at')
      .gte('created_at', sinceIso)
      .eq('is_deleted', false),
    supabase
      .from('threads')
      .select('created_at')
      .gte('created_at', sinceIso)
      .eq('is_deleted', false)
  ])

  if (postsError || threadsError) {
    throw createError({ statusCode: 500, statusMessage: postsError?.message ?? threadsError?.message })
  }

  const days: { date: string, posts: number, threads: number }[] = []
  for (let i = 0; i < 30; i++) {
    const d = new Date(since)
    d.setDate(since.getDate() + i)
    days.push({ date: d.toISOString().slice(0, 10), posts: 0, threads: 0 })
  }

  for (const p of posts ?? []) {
    const date = p.created_at.slice(0, 10)
    const day = days.find(d => d.date === date)
    if (day) day.posts++
  }

  for (const t of threads ?? []) {
    const date = t.created_at.slice(0, 10)
    const day = days.find(d => d.date === date)
    if (day) day.threads++
  }

  return { success: true, data: days, error: null }
})

import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const supabase = await serverSupabaseClient(event)

  let q = supabase
    .from('posts')
    .select('*, profiles(name), categories(name, icon), threads(count)')
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })

  if (query.categoryId) {
    q = q.eq('category_id', Number(query.categoryId))
  }

  const { data, error } = await q

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { success: true, data, error: null }
})

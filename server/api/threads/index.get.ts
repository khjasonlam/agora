import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  if (!query.postId) {
    throw createError({ statusCode: 400, statusMessage: 'postId is required' })
  }

  const supabase = await serverSupabaseClient(event)
  const { data, error } = await supabase
    .from('threads')
    .select('*, profiles(name)')
    .eq('post_id', Number(query.postId))
    .eq('is_deleted', false)
    .order('thread_number')

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { success: true, data, error: null }
})

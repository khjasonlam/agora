import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const supabase = await serverSupabaseClient(event)

  const { data, error } = await supabase
    .from('posts')
    .select('*, profiles(name), categories(name, icon)')
    .eq('id', Number(id))
    .eq('is_deleted', false)
    .single()

  if (error) {
    throw createError({ statusCode: 404, statusMessage: 'Post not found' })
  }

  return { success: true, data, error: null }
})

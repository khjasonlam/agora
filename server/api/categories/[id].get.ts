import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const supabase = await serverSupabaseClient(event)

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', Number(id))
    .eq('is_deleted', false)
    .single()

  if (error) {
    throw createError({ statusCode: 404, statusMessage: 'Category not found' })
  }

  return { success: true, data, error: null }
})

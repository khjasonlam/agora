import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event)

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_deleted', false)
    .order('name')

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { success: true, data, error: null }
})

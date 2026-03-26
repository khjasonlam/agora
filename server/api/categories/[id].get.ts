import { serverSupabaseClient } from '#supabase/server'
import { notFound } from '../../utils/apiErrors'
import { parseRouteId } from '../../utils/params'

export default defineEventHandler(async (event) => {
  const id = parseRouteId(getRouterParam(event, 'id'))
  const supabase = await serverSupabaseClient(event)

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .eq('is_deleted', false)
    .single()

  if (error) {
    throw notFound('Category not found')
  }

  return { success: true, data, error: null }
})

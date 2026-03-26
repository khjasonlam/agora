import { internalError } from '../../utils/apiErrors'
import { parseRouteId } from '../../utils/params'

export default defineEventHandler(async (event) => {
  const { supabase } = await requireAdmin(event)
  const id = parseRouteId(getRouterParam(event, 'id'))

  const { data, error } = await supabase
    .from('categories')
    .update({ is_deleted: true })
    .eq('id', id)
    .eq('is_deleted', false)
    .select()
    .single()

  if (error) {
    throw internalError(error.message)
  }

  return { success: true, data, error: null }
})

import { updateCategorySchema } from '../../validation/schemas'
import { badRequest, internalError } from '../../utils/apiErrors'
import { parseRouteId } from '../../utils/params'

export default defineEventHandler(async (event) => {
  const { supabase } = await requireAdmin(event)
  const id = parseRouteId(getRouterParam(event, 'id'))

  const body = await readBody(event)
  const parsed = updateCategorySchema.safeParse(body)
  if (!parsed.success) {
    throw badRequest(parsed.error.message)
  }

  const { data, error } = await supabase
    .from('categories')
    .update(parsed.data)
    .eq('id', id)
    .eq('is_deleted', false)
    .select()
    .single()

  if (error) {
    throw internalError(error.message)
  }

  return { success: true, data, error: null }
})

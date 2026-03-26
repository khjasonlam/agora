import { createCategorySchema } from '../../validation/schemas'
import { badRequest, internalError } from '../../utils/apiErrors'

export default defineEventHandler(async (event) => {
  const { supabase } = await requireAdmin(event)

  const body = await readBody(event)
  const parsed = createCategorySchema.safeParse(body)
  if (!parsed.success) {
    throw badRequest(parsed.error.message)
  }

  const { data, error } = await supabase
    .from('categories')
    .insert(parsed.data)
    .select()
    .single()

  if (error) {
    throw internalError(error.message)
  }

  return { success: true, data, error: null }
})

import { updateCategorySchema } from '../../validation/schemas'

export default defineEventHandler(async (event) => {
  const { supabase } = await requireAdmin(event)
  const id = getRouterParam(event, 'id')

  const body = await readBody(event)
  const parsed = updateCategorySchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.message })
  }

  const { data, error } = await supabase
    .from('categories')
    .update(parsed.data)
    .eq('id', Number(id))
    .eq('is_deleted', false)
    .select()
    .single()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { success: true, data, error: null }
})

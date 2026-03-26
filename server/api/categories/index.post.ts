import { createCategorySchema } from '../../validation/schemas'

export default defineEventHandler(async (event) => {
  const { supabase } = await requireAdmin(event)

  const body = await readBody(event)
  const parsed = createCategorySchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.message })
  }

  const { data, error } = await supabase
    .from('categories')
    .insert(parsed.data)
    .select()
    .single()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { success: true, data, error: null }
})

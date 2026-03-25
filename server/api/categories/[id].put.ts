import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1).max(150).optional(),
  icon: z.string().min(1).optional()
})

export default defineEventHandler(async (event) => {
  const { supabase } = await requireAdmin(event)
  const id = getRouterParam(event, 'id')

  const body = await readBody(event)
  const parsed = schema.safeParse(body)
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

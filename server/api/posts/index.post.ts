import { serverSupabaseServiceRole } from '#supabase/server'
import { createPostSchema } from '../../validation/schemas'
import { requireAuth } from '../../utils/requireAuth'

export default defineEventHandler(async (event) => {
  const { user } = await requireAuth(event)

  const body = await readBody(event)
  const parsed = createPostSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.message })
  }

  const supabase = serverSupabaseServiceRole(event)
  const { data, error } = await supabase
    .from('posts')
    .insert({ ...parsed.data, user_id: user.id })
    .select()
    .single()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { success: true, data, error: null }
})

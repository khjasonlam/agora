import { serverSupabaseServiceRole } from '#supabase/server'
import { createPostSchema } from '../../validation/schemas'
import { badRequest, internalError } from '../../utils/apiErrors'
import { requireAuth } from '../../utils/requireAuth'

export default defineEventHandler(async (event) => {
  const { user } = await requireAuth(event)

  const body = await readBody(event)
  const parsed = createPostSchema.safeParse(body)
  if (!parsed.success) {
    throw badRequest(parsed.error.message)
  }

  const supabase = serverSupabaseServiceRole(event)
  const { data, error } = await supabase
    .from('posts')
    .insert({ ...parsed.data, user_id: user.id })
    .select()
    .single()

  if (error) {
    throw internalError(error.message)
  }

  return { success: true, data, error: null }
})

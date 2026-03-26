import { serverSupabaseClient, serverSupabaseServiceRole } from '#supabase/server'
import { createPostSchema } from '../../validation/schemas'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const { data: { user } } = await client.auth.getUser()
  if (!user?.id) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

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

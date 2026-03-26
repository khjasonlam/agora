import { serverSupabaseServiceRole } from '#supabase/server'
import { createThreadSchema } from '../../validation/schemas'
import { badRequest, internalError } from '../../utils/apiErrors'
import { requireAuth } from '../../utils/requireAuth'

export default defineEventHandler(async (event) => {
  const { user } = await requireAuth(event)

  const body = await readBody(event)
  const parsed = createThreadSchema.safeParse(body)
  if (!parsed.success) {
    throw badRequest(parsed.error.message)
  }

  const supabase = serverSupabaseServiceRole(event)

  const { data: threadNumber } = await supabase
    .rpc('next_thread_number', { p_post_id: parsed.data.post_id })
  if (threadNumber == null) {
    throw internalError('Failed to allocate thread number')
  }

  const { data, error } = await supabase
    .from('threads')
    .insert({
      ...parsed.data,
      user_id: user.id,
      thread_number: threadNumber
    })
    .select('*, profiles(name)')
    .single()

  if (error) {
    throw internalError(error.message)
  }

  return { success: true, data, error: null }
})

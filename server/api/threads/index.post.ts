import { serverSupabaseClient, serverSupabaseServiceRole } from '#supabase/server'
import { z } from 'zod'

const schema = z.object({
  post_id: z.number().int().positive(),
  content: z.string().min(1)
})

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const { data: { user } } = await client.auth.getUser()
  if (!user?.id) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const body = await readBody(event)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.message })
  }

  const supabase = serverSupabaseServiceRole(event)

  const { data: threadNumber } = await supabase
    .rpc('next_thread_number', { p_post_id: parsed.data.post_id })
  if (threadNumber == null) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to allocate thread number' })
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
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { success: true, data, error: null }
})

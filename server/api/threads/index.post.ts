import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { z } from 'zod'

const schema = z.object({
  post_id: z.number().int().positive(),
  content: z.string().min(1)
})

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const body = await readBody(event)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.message })
  }

  const supabase = await serverSupabaseClient(event)

  // thread_number を採番（PostgreSQL 関数使用）
  const { data: threadNumber } = await supabase
    .rpc('next_thread_number', { p_post_id: parsed.data.post_id })

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

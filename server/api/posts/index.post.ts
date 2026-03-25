import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { z } from 'zod'

const schema = z.object({
  category_id: z.number().int().positive(),
  title: z.string().min(1).max(255)
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

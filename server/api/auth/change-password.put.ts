import { z } from 'zod'
import { serverSupabaseClient } from '#supabase/server'

const schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6)
})

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const { data: { user } } = await client.auth.getUser()
  if (!user?.id || !user.email) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const body = await readBody(event)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.message })
  }

  const { error: signInError } = await client.auth.signInWithPassword({
    email: user.email,
    password: parsed.data.currentPassword
  })

  if (signInError) {
    throw createError({ statusCode: 400, statusMessage: '現在のパスワードが正しくありません' })
  }

  const { error: updateError } = await client.auth.updateUser({
    password: parsed.data.newPassword
  })

  if (updateError) {
    throw createError({ statusCode: 500, statusMessage: updateError.message })
  }

  return { success: true, data: null, error: null }
})

import { changePasswordSchema } from '../../validation/schemas'
import { requireAuth } from '../../utils/requireAuth'

export default defineEventHandler(async (event) => {
  const { user, client } = await requireAuth(event)
  if (!user.email) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const body = await readBody(event)
  const parsed = changePasswordSchema.safeParse(body)
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

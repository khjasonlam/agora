import { changePasswordSchema } from '../../validation/schemas'
import { badRequest, internalError, unauthorized } from '../../utils/apiErrors'
import { requireAuth } from '../../utils/requireAuth'

export default defineEventHandler(async (event) => {
  const { user, client } = await requireAuth(event)
  if (!user.email) {
    throw unauthorized()
  }

  const body = await readBody(event)
  const parsed = changePasswordSchema.safeParse(body)
  if (!parsed.success) {
    throw badRequest(parsed.error.message)
  }

  const { error: signInError } = await client.auth.signInWithPassword({
    email: user.email,
    password: parsed.data.currentPassword
  })

  if (signInError) {
    throw badRequest('現在のパスワードが正しくありません')
  }

  const { error: updateError } = await client.auth.updateUser({
    password: parsed.data.newPassword
  })

  if (updateError) {
    throw internalError(updateError.message)
  }

  return { success: true, data: null, error: null }
})

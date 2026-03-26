import { requireAuth } from '../../utils/requireAuth'
import { internalError } from '../../utils/apiErrors'

export default defineEventHandler(async (event) => {
  const { user, client } = await requireAuth(event)

  const { data, error } = await client
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) {
    throw internalError(error.message)
  }

  return { success: true, data, error: null }
})

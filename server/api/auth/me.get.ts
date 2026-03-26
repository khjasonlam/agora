import { requireAuth } from '../../utils/requireAuth'

export default defineEventHandler(async (event) => {
  const { user, client } = await requireAuth(event)

  const { data, error } = await client
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { success: true, data, error: null }
})

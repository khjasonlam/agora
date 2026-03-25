import type { H3Event } from 'h3'
import { serverSupabaseClient } from '#supabase/server'

export async function requireAuth(event: H3Event) {
  const client = await serverSupabaseClient(event)
  const { data: { user } } = await client.auth.getUser()
  if (!user?.id) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  return { user, client }
}

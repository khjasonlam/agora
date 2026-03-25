import type { H3Event } from 'h3'
import { serverSupabaseClient, serverSupabaseServiceRole } from '#supabase/server'

export async function requireAdmin(event: H3Event) {
  const client = await serverSupabaseClient(event)
  const { data: { user } } = await client.auth.getUser()
  if (!user?.id) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const supabase = serverSupabaseServiceRole(event)
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  return { user, supabase }
}

import { serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const path = getRequestURL(event).pathname

  // 認証不要のパスはスキップ
  if (!path.startsWith('/api/')) return

  const publicPaths = ['/api/auth/callback']
  if (publicPaths.some(p => path.startsWith(p))) return

  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
})
